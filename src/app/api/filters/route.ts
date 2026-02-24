import { NextResponse } from 'next/server';
import { db, Filter } from '@/lib/db';

export const dynamic = 'force-dynamic';

const slugify = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9а-яё-]+/gi, '')
  .replace(/-+/g, '-')
  .replace(/^-+|-+$/g, '');

const ensureUniqueSlug = (base: string, existing: Set<string>) => {
  if (!existing.has(base)) {
    return base;
  }
  let index = 2;
  while (existing.has(`${base}-${index}`)) {
    index += 1;
  }
  return `${base}-${index}`;
};

const createFilterId = () => `filter-${Date.now()}${Math.floor(Math.random() * 1000)}`;

export async function GET() {
  try {
    let filters = await db.getFilters();

    if (filters.length === 0) {
      const defaults = ['Кители', 'Брюки', 'Фартуки', 'Рубашки'];
      const slugs = new Set<string>();
      const seeded: Filter[] = defaults.map((name) => {
        const base = slugify(name);
        const slug = ensureUniqueSlug(base, slugs);
        slugs.add(slug);
        return { id: `filter-${slug}`, name, slug };
      });

      for (const filter of seeded) {
        await db.saveFilter(filter);
      }
      filters = await db.getFilters();
    }

    return NextResponse.json(filters);
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name) {
      return NextResponse.json({ message: 'Invalid filter data' }, { status: 400 });
    }

    const filters = await db.getFilters();
    const slugBase = slugify(name);
    const existing = new Set(filters.map(filter => filter.slug));
    const slug = ensureUniqueSlug(slugBase, existing);

    const filter: Filter = {
      id: createFilterId(),
      name,
      slug
    };

    await db.saveFilter(filter);
    return NextResponse.json(filter);
  } catch (error) {
    console.error('Error creating filter:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = String(body.id || '').trim();
    const name = String(body.name || '').trim();

    if (!id || !name) {
      return NextResponse.json({ message: 'Invalid filter data' }, { status: 400 });
    }

    const filters = await db.getFilters();
    const existingFilter = filters.find(filter => filter.id === id);
    if (!existingFilter) {
      return NextResponse.json({ message: 'Filter not found' }, { status: 404 });
    }

    const slugBase = slugify(name);
    const existingSlugs = new Set(filters.filter(filter => filter.id !== id).map(filter => filter.slug));
    const slug = ensureUniqueSlug(slugBase, existingSlugs);

    const updated: Filter = {
      ...existingFilter,
      name,
      slug
    };

    await db.saveFilter(updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating filter:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Filter id is required' }, { status: 400 });
    }

    await db.deleteFilter(id);

    const products = await db.getProducts();
    for (const product of products) {
      if (!product.filterIds || product.filterIds.length === 0) {
        continue;
      }
      const nextFilterIds = product.filterIds.filter(filterId => filterId !== id);
      if (nextFilterIds.length !== product.filterIds.length) {
        await db.saveProduct({ ...product, filterIds: nextFilterIds });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting filter:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
