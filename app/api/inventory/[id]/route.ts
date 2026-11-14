import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ActionType } from '@prisma/client';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/inventory/[id]
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/inventory/[id]
 * Updates product details and optionally logs an ADJUSTMENT or RESTOCK.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    let quantityDiff = 0;
    if (body.currentStock !== undefined) {
      const newStock = Number(body.currentStock);
      quantityDiff = newStock - existing.currentStock;
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.currentStock !== undefined && { currentStock: Number(body.currentStock) }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.pricePerUnit !== undefined && { pricePerUnit: Number(body.pricePerUnit) }),
        ...(quantityDiff !== 0 && {
          transactions: {
            create: {
              actionType: quantityDiff > 0 ? ActionType.RESTOCK : ActionType.ADJUSTMENT,
              quantityChanged: quantityDiff,
              rawTranscript: body.rawTranscript || `Manual adjustment: stock changed by ${quantityDiff} ${existing.unit}`,
            },
          },
        }),
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/inventory/[id]
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
