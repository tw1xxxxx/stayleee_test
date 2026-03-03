import { NextResponse } from 'next/server';
import { db, Product } from '@/lib/db';

export const dynamic = 'force-dynamic';

const normalizeProduct = (product: Product): Product => {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const imageFallback = product.image ? [product.image] : [];
  const normalizedImages = (images.length > 0 ? images : imageFallback);
  const normalizedFilterIds = Array.isArray(product.filterIds) ? product.filterIds.filter(Boolean) : [];
  return {
    ...product,
    images: normalizedImages,
    filterIds: normalizedFilterIds,
    tags: Array.isArray(product.tags) ? product.tags : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    details: product.details || {},
    variants: Array.isArray(product.variants) ? product.variants : []
  };
};

const createProductId = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

export async function GET() {
  try {
    let products = await db.getProducts();

    // Seed dummy products if empty (for development/testing since Catalog isn't ready)
    // DISABLED: We should not seed dummy products if they are empty in DB, as this hides real data issues
    /*
    if (products.length === 0) {
      const dummyProducts: Product[] = [
        // ... dummy products
      ];
      products = dummyProducts;
    }
    */

    return NextResponse.json(products.map(product => normalizeProduct(product)));
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const price = Number(body.price || 0);

    if (!name || Number.isNaN(price)) {
      return NextResponse.json({ message: 'Invalid product data' }, { status: 400 });
    }

    const product: Product = normalizeProduct({
      ...body,
      id: body.id ? String(body.id) : createProductId(),
      name,
      price
    });

    await db.saveProduct(product);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();
    const price = Number(body.price || 0);

    if (!id || !name || Number.isNaN(price)) {
      return NextResponse.json({ message: 'Invalid product data' }, { status: 400 });
    }

    const products = await db.getProducts();
    const existing = products.find(p => p.id === id);

    if (!existing) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const updated: Product = normalizeProduct({
      ...existing,
      ...body,
      id,
      name,
      price
    });

    await db.saveProduct(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing product ID' }, { status: 400 });
    }

    await db.deleteProduct(id);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
