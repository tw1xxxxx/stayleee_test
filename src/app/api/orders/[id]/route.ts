import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
    }

    // Optional: Check if order exists and if user has permission
    // For now, simple delete
    await db.deleteOrder(id);

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
