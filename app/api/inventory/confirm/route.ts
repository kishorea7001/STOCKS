import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ActionType } from '@prisma/client';

export const runtime = 'nodejs';

export interface InventoryChangeRequest {
  productId: string;
  action: 'SALE' | 'RESTOCK';
  quantity: number;
}

export interface ConfirmPayload {
  transcript: string;
  changes: InventoryChangeRequest[];
  allowNegativeStock?: boolean;
}

/**
 * POST /app/api/inventory/confirm
 * 
 * Atomically commits confirmed inventory changes inside a Prisma $transaction.
 * - Increments/decrements product stock.
 * - Rejects transactions with a 400 error if stock is insufficient for a SALE.
 * - Creates audit records in TransactionLog.
 * - Returns the updated full inventory list and execution summary.
 */
export async function POST(request: NextRequest) {
  try {
    const body: ConfirmPayload = await request.json();
    const { transcript, changes, allowNegativeStock = false } = body;

    if (!Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No inventory changes provided to confirm.' },
        { status: 400 }
      );
    }

    // Atomic database execution: either all succeed or all roll back cleanly
    const transactionResult = await db.$transaction(async (tx) => {
      const processedChanges: Array<{
        product: { id: string; name: string; unit: string; previousStock: number; currentStock: number };
        action: 'SALE' | 'RESTOCK';
        quantity: number;
      }> = [];

      for (const item of changes) {
        if (!item.productId || !item.action || typeof item.quantity !== 'number') {
          throw new Error('Each change must include productId, action (SALE/RESTOCK), and a numeric quantity.');
        }

        const qty = Number(item.quantity);
        if (isNaN(qty) || qty <= 0) {
          throw new Error(`Quantity must be a positive number. Received: ${item.quantity}`);
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found with ID "${item.productId}".`);
        }

        let newStock = product.currentStock;
        let quantityChanged = qty;

        const actionUpper = String(item.action).toUpperCase();

        if (actionUpper === 'SALE') {
          if (product.currentStock < qty && !allowNegativeStock) {
            throw new Error(
              `Insufficient stock for "${product.name}". Available: ${product.currentStock} ${product.unit}, requested sale: ${qty} ${product.unit}.`
            );
          }
          newStock = Number((product.currentStock - qty).toFixed(3));
          quantityChanged = -qty;
        } else if (actionUpper === 'RESTOCK') {
          newStock = Number((product.currentStock + qty).toFixed(3));
          quantityChanged = qty;
        } else {
          throw new Error(`Invalid action "${item.action}". Must be SALE or RESTOCK.`);
        }

        // 1. Update product current stock
        const updatedProduct = await tx.product.update({
          where: { id: product.id },
          data: {
            currentStock: newStock,
          },
        });

        // 2. Create immutable audit log entry
        await tx.transactionLog.create({
          data: {
            productId: product.id,
            actionType: actionUpper === 'SALE' ? ActionType.SALE : ActionType.RESTOCK,
            quantityChanged,
            rawTranscript: transcript || `Confirmed ${actionUpper.toLowerCase()} of ${qty} ${product.unit} ${product.name}`,
          },
        });

        processedChanges.push({
          product: {
            id: updatedProduct.id,
            name: updatedProduct.name,
            unit: updatedProduct.unit,
            previousStock: product.currentStock,
            currentStock: updatedProduct.currentStock,
          },
          action: actionUpper as 'SALE' | 'RESTOCK',
          quantity: qty,
        });
      }

      // 3. Query refreshed inventory state with recent transactions
      const updatedInventory = await tx.product.findMany({
        orderBy: { name: 'asc' },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });

      return {
        processedChanges,
        updatedInventory,
      };
    });

    return NextResponse.json(
      {
        success: true,
        summary: {
          totalProcessed: transactionResult.processedChanges.length,
          message: `Successfully executed ${transactionResult.processedChanges.length} inventory updates.`,
          changes: transactionResult.processedChanges,
        },
        inventory: transactionResult.updatedInventory,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to confirm inventory changes';
    console.error('Inventory confirmation error:', message);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
