import { NextResponse } from 'next/server';
import { db, Product } from '@/lib/db';

export const dynamic = 'force-dynamic';

const normalizeProduct = (product: Product): Product => {
  // Ensure images is an array
  let images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  
  // If images is empty but we have a single image field, use it
  if (images.length === 0 && product.image) {
    images = [product.image];
  }

  const normalizedFilterIds = Array.isArray(product.filterIds) ? product.filterIds.filter(Boolean) : [];
  const colors = Array.isArray(product.colors) ? product.colors.map(c => ({
    ...c,
    images: Array.isArray(c.images) ? c.images.filter(Boolean) : [],
    sizes: Array.isArray(c.sizes) ? c.sizes.filter(Boolean) : []
  })) : [];

  // Fallback to first color image if main images are still missing
  if (images.length === 0 && colors.length > 0) {
    const firstColorWithImages = colors.find(c => Array.isArray(c.images) && c.images.length > 0);
    if (firstColorWithImages && firstColorWithImages.images) {
      images = [firstColorWithImages.images[0]];
    }
  }

  return {
    ...product,
    images,
    image: images[0] || "",
    filterIds: normalizedFilterIds,
    tags: Array.isArray(product.tags) ? product.tags : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors,
    details: product.details || {},
    variants: Array.isArray(product.variants) ? product.variants : [],
    collectionImage: product.collectionImage || ""
  };
};

const createProductId = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

export async function GET() {
  try {
    const products = await db.getProducts();

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
    console.log('Successfully saved product to Redis:', product.id);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('CRITICAL ERROR creating product:', error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log('PUT request received for product:', body.id);
    
    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();
    const price = Number(body.price || 0);

    if (!id || !name || Number.isNaN(price)) {
      console.warn('Invalid product data in PUT:', { id, name, price });
      return NextResponse.json({ message: 'Invalid product data' }, { status: 400 });
    }

    const products = await db.getProducts();
    const existing = products.find(p => p.id === id);

    if (!existing) {
      console.warn('Product not found for update:', id);
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
    console.log('Successfully updated product in Redis:', id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('CRITICAL ERROR updating product:', error);
    return NextResponse.json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
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
