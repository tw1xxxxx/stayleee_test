import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const users = await db.getUsers();
    return NextResponse.json({ 
      count: users.length, 
      users: users.map(u => ({ id: u.id, email: u.email })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
