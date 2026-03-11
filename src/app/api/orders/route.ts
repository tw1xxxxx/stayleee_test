import { NextResponse } from 'next/server';
import { db, Order } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const [orders, users] = await Promise.all([
      db.getOrders(),
      db.getUsers()
    ]);
    
    // Filter orders by userId if provided
    let filteredOrders: Order[] = orders;
    if (userId) {
      filteredOrders = orders.filter(order => order.userId === userId);
    } else {
      // If no userId, only return orders if explicitly requested (e.g. for admin)
      // For now, let's keep it returning all for backward compatibility if needed, 
      // but usually we want a userId.
      // Actually, let's make it return everything ONLY if there's no userId param at all,
      // but if it's there and empty, return nothing.
      const hasUserIdParam = searchParams.has('userId');
      if (hasUserIdParam && !userId) {
        filteredOrders = [];
      } else {
        filteredOrders = orders;
      }
    }
    
    // Create a map of userId -> User for faster lookup
    const userMap = new Map(users.map(u => [u.id, u]));

    const enrichedOrders = filteredOrders.map(order => {
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
    const { userId, items, total, address, status, createdAt, customer, deliveryType, deliveryFee, comment } = body;

    // Generate a 6-digit numeric ID
    const id = Math.floor(100000 + Math.random() * 900000).toString();

    const newOrder = {
      id,
      userId: userId || 'guest', // Use 'guest' if no userId provided
      items,
      total,
      address,
      deliveryType,
      deliveryFee,
      comment,
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
