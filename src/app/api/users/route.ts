import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await db.getUsers();
    
    // Enrich users with order stats
    const orders = await db.getOrders();
    
    const enrichedUsers = users.map(user => {
      const userOrders = orders.filter(order => order.userId === user.id);
      const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
      
      return {
        ...user,
        ordersCount: userOrders.length,
        totalSpent
      };
    });

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
