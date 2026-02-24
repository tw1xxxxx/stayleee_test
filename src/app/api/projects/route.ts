
import { NextResponse } from 'next/server';
import { db, Project } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let projects = await db.getProjects();

    if (projects.length === 0) {
      const dummyProjects: Project[] = [
        {
          id: 'portfolio-1',
          type: 'portfolio',
          title: "Клод моне",
          image: "/images/470750.jpg",
          order: 0
        },
        {
          id: 'promo-2',
          type: 'promo',
          text: "Плюшки",
          order: 1
        },
        {
          id: 'portfolio-2',
          type: 'portfolio',
          title: "Название",
          image: "/images/470750.jpg",
          order: 2
        },
        {
          id: 'promo-1',
          type: 'promo',
          text: "Закажите от 300к и вам в подарок брендирование",
          order: 3
        }
      ];

      for (const p of dummyProjects) {
        await db.saveProject(p);
      }
      projects = await db.getProjects();
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, image, text, order } = body;

    if (!type) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const projects = await db.getProjects();
    
    // Generate numeric ID
    const maxId = projects.reduce((max, p) => {
      const numId = parseInt(p.id);
      return !isNaN(numId) && numId > max ? numId : max;
    }, 0);
    const newId = (maxId + 1).toString();

    // Determine order
    const maxOrder = projects.reduce((max, p) => p.order > max ? p.order : max, -1);

    const newProject: Project = {
      id: newId,
      type,
      title,
      image,
      text,
      order: order !== undefined ? order : maxOrder + 1
    };

    await db.saveProject(newProject);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Handle array for reordering
    if (Array.isArray(body)) {
      await db.saveProjects(body);
      return NextResponse.json(body);
    }

    const { id, type, title, image, text, order } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing project ID' }, { status: 400 });
    }

    const projects = await db.getProjects();
    const existing = projects.find(p => p.id === id);

    if (!existing) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const updatedProject: Project = {
      ...existing,
      type: type || existing.type,
      title: title !== undefined ? title : existing.title,
      image: image !== undefined ? image : existing.image,
      text: text !== undefined ? text : existing.text,
      order: order !== undefined ? order : existing.order
    };

    await db.saveProject(updatedProject);
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing project ID' }, { status: 400 });
    }

    await db.deleteProject(id);
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
