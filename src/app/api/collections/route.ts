import { NextResponse } from 'next/server';
import { db, Collection } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let collections = await db.getCollections();

    if (collections.length === 0) {
      const dummyCollections: Collection[] = [
        {
          id: 'ridge',
          title: "RIDGE",
          slug: "ridge",
          description: "“Ridge” ( в переводе с англ.) “Грядка”. Наша новая коллекция несет за собой символ роста, создания и развития. Только представьте: солнечный свет проникает сквозь листья, согревая плодородную землю, а земля дышит и питает корни, отдавая силу и энергию для созревания урожая.",
          sections: []
        },
        {
          id: 'semis',
          title: "SEMIS",
          slug: "semis",
          description: "(сэми, (фр.) проросток, побег растения) — первая коллекция из 5 изделий, которая передаёт свежий взгляд на форму повара и бармена. А также является новым творческим проростком в деятельности основателя бренда.",
          sections: []
        }
      ];

      for (const c of dummyCollections) {
        await db.saveCollection(c);
      }
      collections = await db.getCollections();
    }

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, sections, slug, image } = body;

    if (!title || !description || !slug) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const collections = await db.getCollections();
    
    // Generate numeric ID
    const maxId = collections.reduce((max, c) => {
      const numId = parseInt(c.id);
      return !isNaN(numId) && numId > max ? numId : max;
    }, 0);
    
    const newId = (maxId + 1).toString();

    const newCollection: Collection = {
      id: newId,
      title,
      description,
      sections: sections || [],
      slug,
      image
    };

    await db.saveCollection(newCollection);
    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Handle array for reordering
    if (Array.isArray(body)) {
      await db.saveCollections(body);
      return NextResponse.json(body);
    }

    const { id, title, description, sections, slug, image } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing collection ID' }, { status: 400 });
    }

    const collections = await db.getCollections();
    const existing = collections.find(c => c.id === id);

    if (!existing) {
      return NextResponse.json({ message: 'Collection not found' }, { status: 404 });
    }

    const updatedCollection: Collection = {
      ...existing,
      title: title || existing.title,
      description: description || existing.description,
      sections: sections || existing.sections,
      slug: slug || existing.slug,
      image: image || existing.image
    };

    await db.saveCollection(updatedCollection);
    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing collection ID' }, { status: 400 });
    }

    await db.deleteCollection(id);
    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
