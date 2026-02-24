import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate event type
    if (body.type !== 'notification') {
       return NextResponse.json({ message: 'Ignored' });
    }

    const { object } = body;
    const { id: paymentId, status, metadata } = object;
    const orderId = metadata?.order_id;

    console.log(`Webhook received: payment ${paymentId}, status ${status}, order ${orderId}`);

    if (!paymentId) {
      return NextResponse.json({ message: 'Missing payment ID' }, { status: 400 });
    }

    // Update Transaction
    const transactions = await db.getTransactions();
    const transaction = transactions.find(t => t.paymentId === paymentId);
    
    if (transaction) {
      let dbStatus: 'pending' | 'succeeded' | 'canceled' = 'pending';
      if (status === 'succeeded') dbStatus = 'succeeded';
      if (status === 'canceled') dbStatus = 'canceled';
      
      if (transaction.status !== dbStatus) {
        transaction.status = dbStatus;
        await db.updateTransaction(transaction);
      }
    }

    // Update Order
    if (orderId) {
        const orders = await db.getOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
            let paymentStatus: 'pending' | 'succeeded' | 'canceled' = 'pending';
            if (status === 'succeeded') {
                paymentStatus = 'succeeded';
                order.status = 'Оплачен';
            } else if (status === 'canceled') {
                paymentStatus = 'canceled';
                // order.status = 'Отменен'; // Optional
            }
            
            if (order.paymentStatus !== paymentStatus) {
                order.paymentStatus = paymentStatus;
                await db.updateOrder(order);
            }
        }
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
