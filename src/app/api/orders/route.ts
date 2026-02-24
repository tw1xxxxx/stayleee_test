import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [orders, users] = await Promise.all([
      db.getOrders(),
      db.getUsers()
    ]);
    
    // Create a map of userId -> User for faster lookup
    const userMap = new Map(users.map(u => [u.id, u]));

    const enrichedOrders = orders.map(order => {
      const user = userMap.get(order.userId);
      return {
        ...order,
        user: user ? { name: user.name, email: user.email } : { name: 'Неизвестный', email: '' }
      };
    });

    // Sort by date desc (newest first)
    enrichedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, total, address, status, createdAt, customer } = body;

    // Generate a 6-digit numeric ID
    const id = Math.floor(100000 + Math.random() * 900000).toString();

    const newOrder = {
      id,
      userId: userId || 'guest', // Use 'guest' if no userId provided
      items,
      total,
      address,
      status: status || 'В обработке',
      createdAt: createdAt || new Date().toISOString(),
      customer
    };

    await db.createOrder(newOrder);

    return NextResponse.json({ message: "Order created successfully", order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
