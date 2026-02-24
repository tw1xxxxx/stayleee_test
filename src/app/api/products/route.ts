import { NextResponse } from 'next/server';
import { db, Product } from '@/lib/db';

export const dynamic = 'force-dynamic';

const normalizeProduct = (product: Product): Product => {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const imageFallback = product.image ? [product.image] : [];
  const normalizedImages = (images.length > 0 ? images : imageFallback).map((image) =>
    image.startsWith('/images/products/') ? '/images/catalog-product.jpg' : image
  );
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
    if (products.length === 0) {
      const dummyProducts: Product[] = [
        {
          id: '101',
          name: 'Китель Seamaster Pro',
          price: 5500,
          description: 'Эстетика морской стихии.',
          images: ['/images/catalog-product.jpg'],
          tags: ['хит', 'новинка'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: [
            { name: 'black', value: '#000000', label: 'Черный' },
            { name: 'navy', value: '#1C274C', label: 'Темно-синий' }
          ],
          details: {
            material: '54% хлопок, 44% полиэстер, 2% лайкра',
            characteristics: 'Свободный крой, терморегуляция',
            article: 'SM-101'
          },
          variants: [
            { id: '101-1', size: 'S', colorName: 'black', price: 5500 },
            { id: '101-2', size: 'M', colorName: 'navy', price: 5600 }
          ]
        },
        {
          id: '102',
          name: 'Китель Seamaster Light',
          price: 4900,
          description: 'Легкий и дышащий.',
          images: ['/images/catalog-product.jpg'],
          tags: ['легкий'],
          sizes: ['XS', 'S', 'M', 'L'],
          colors: [
            { name: 'white', value: '#F5F5F5', label: 'Белый' },
            { name: 'beige', value: '#F5F5DC', label: 'Бежевый' }
          ],
          details: {
            material: '60% хлопок, 40% полиэстер',
            characteristics: 'Ультралегкий материал',
            article: 'SM-102'
          },
          variants: [
            { id: '102-1', size: 'S', colorName: 'white', price: 4900 },
            { id: '102-2', size: 'M', colorName: 'beige', price: 5000 }
          ]
        },
        {
          id: '103',
          name: 'Брюки Seamaster',
          price: 3800,
          description: 'Классический крой.',
          images: ['/images/catalog-product.jpg'],
          tags: ['классика'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: [
            { name: 'black', value: '#000000', label: 'Черный' }
          ],
          details: {
            material: '70% хлопок, 30% полиэстер',
            characteristics: 'Эластичный пояс',
            article: 'SM-103'
          },
          variants: [
            { id: '103-1', size: 'S', colorName: 'black', price: 3800 },
            { id: '103-2', size: 'L', colorName: 'black', price: 3900 }
          ]
        },
        {
          id: '104',
          name: 'Брюки Cargo',
          price: 4200,
          description: 'Удобные карманы.',
          images: ['/images/catalog-product.jpg'],
          tags: ['карго'],
          sizes: ['S', 'M', 'L'],
          colors: [
            { name: 'graphite', value: '#3A3A3A', label: 'Графит' }
          ],
          details: {
            material: '65% хлопок, 35% полиэстер',
            characteristics: '6 карманов',
            article: 'SM-104'
          },
          variants: [
            { id: '104-1', size: 'M', colorName: 'graphite', price: 4200 }
          ]
        },
        {
          id: '201',
          name: 'Фартук Urban',
          price: 2500,
          description: 'Городской стиль.',
          images: ['/images/catalog-product.jpg'],
          tags: ['унисекс'],
          sizes: ['One Size'],
          colors: [
            { name: 'black', value: '#000000', label: 'Черный' },
            { name: 'brown', value: '#5C4033', label: 'Кофейный' }
          ],
          details: {
            material: '100% хлопок',
            characteristics: 'Регулируемые ремни',
            article: 'UR-201'
          },
          variants: [
            { id: '201-1', size: 'One Size', colorName: 'black', price: 2500 },
            { id: '201-2', size: 'One Size', colorName: 'brown', price: 2600 }
          ]
        },
        {
          id: '202',
          name: 'Фартук Denim',
          price: 3100,
          description: 'Прочный деним.',
          images: ['/images/catalog-product.jpg'],
          tags: ['деним'],
          sizes: ['One Size'],
          colors: [
            { name: 'denim', value: '#2F4F6F', label: 'Деним' }
          ],
          details: {
            material: '100% деним',
            characteristics: 'Усиленные швы',
            article: 'UR-202'
          },
          variants: [
            { id: '202-1', size: 'One Size', colorName: 'denim', price: 3100 }
          ]
        },
        {
          id: '203',
          name: 'Рубашка Oxford',
          price: 3200,
          description: 'Классика.',
          images: ['/images/catalog-product.jpg'],
          tags: ['базовая'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: [
            { name: 'white', value: '#F5F5F5', label: 'Белый' }
          ],
          details: {
            material: '100% хлопок',
            characteristics: 'Дышащая ткань',
            article: 'OX-203'
          },
          variants: [
            { id: '203-1', size: 'M', colorName: 'white', price: 3200 }
          ]
        },
        {
          id: '204',
          name: 'Поло Chef',
          price: 2800,
          description: 'Комфорт.',
          images: ['/images/catalog-product.jpg'],
          tags: ['легкий'],
          sizes: ['S', 'M', 'L'],
          colors: [
            { name: 'gray', value: '#C0C0C0', label: 'Серый' },
            { name: 'black', value: '#000000', label: 'Черный' }
          ],
          details: {
            material: '60% хлопок, 40% полиэстер',
            characteristics: 'Сетчатые вставки',
            article: 'PL-204'
          },
          variants: [
            { id: '204-1', size: 'S', colorName: 'gray', price: 2800 },
            { id: '204-2', size: 'M', colorName: 'black', price: 2900 }
          ]
        }
      ];

      for (const p of dummyProducts) {
        await db.saveProduct(p);
      }
      products = await db.getProducts();
    }

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
