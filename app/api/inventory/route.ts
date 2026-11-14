import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ActionType } from '@prisma/client';

/**
 * GET /api/inventory
 * Retrieves products with optional search query & category filter.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;

    const products = await db.product.findMany({
      where: {
        AND: [
          query ? { name: { contains: query } } : {},
          category ? { category } : {},
        ],
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch products';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/inventory
 * Adds a new product and logs an initial RESTOCK / inventory entry.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, currentStock, unit, pricePerUnit, note } = body;

    if (!name || !category || !unit) {
      return NextResponse.json(
        { success: false, error: 'Fields "name", "category", and "unit" are required.' },
        { status: 400 }
      );
    }

    const stockVal = typeof currentStock === 'number' ? currentStock : parseFloat(currentStock || '0');
    const priceVal = typeof pricePerUnit === 'number' ? pricePerUnit : parseFloat(pricePerUnit || '0');

    const newProduct = await db.product.create({
      data: {
        name,
        category,
        currentStock: stockVal,
        unit,
        pricePerUnit: priceVal,
        ...(stockVal > 0 && {
          transactions: {
            create: {
              actionType: ActionType.RESTOCK,
              quantityChanged: stockVal,
              rawTranscript: note || `Initial stock setup: ${stockVal} ${unit} of ${name}`,
            },
          },
        }),
      },
      include: {
        transactions: true,
      },
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
