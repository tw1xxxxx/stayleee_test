import { NextResponse } from 'next/server';
import { db, Gift } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const gifts = await db.getGifts();
    return NextResponse.json(gifts);
  } catch (error) {
    console.error('Error fetching gifts:', error);
    return NextResponse.json({ error: 'Failed to fetch gifts' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const gifts: Gift[] = await request.json();
    await db.saveGifts(gifts);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving gifts:', error);
    return NextResponse.json({ error: 'Failed to save gifts' }, { status: 500 });
  }
}
