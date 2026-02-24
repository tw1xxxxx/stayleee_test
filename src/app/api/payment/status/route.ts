import { NextResponse } from 'next/server';
import { getYooKassaPayment } from '@/lib/yookassa';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');

    if (!paymentId && !orderId) {
      return NextResponse.json({ message: 'Missing paymentId or orderId' }, { status: 400 });
    }

    let targetPaymentId = paymentId;

    // If orderId provided, find paymentId from order
    if (!targetPaymentId && orderId) {
      const orders = await db.getOrders();
      const order = orders.find((o) => o.id === orderId);
      if (!order || !order.paymentId) {
        return NextResponse.json({ status: 'unknown', message: 'Order or payment not found' });
      }
      targetPaymentId = order.paymentId;
    }

    if (!targetPaymentId) {
       return NextResponse.json({ message: 'Payment ID not found' }, { status: 404 });
    }

    // Get status from YooKassa
    let payment;
    let status;

    try {
        payment = await getYooKassaPayment(targetPaymentId);
        status = payment.status;
    } catch (error) {
        // If it's a mock payment and we failed to get it (should be handled in yookassa.ts but safe check)
        if (targetPaymentId.startsWith('mock_payment_')) {
             status = 'succeeded';
             payment = { status: 'succeeded' };
        } else {
             throw error;
        }
    }

    // Update DB if status changed
    const transactions = await db.getTransactions();
    const transaction = transactions.find((t) => t.paymentId === targetPaymentId);

    if (transaction && transaction.status !== status) {
      // Map YooKassa status to our status
      // pending, waiting_for_capture, succeeded, canceled
      let dbStatus: 'pending' | 'succeeded' | 'canceled' = 'pending';
      if (status === 'succeeded') dbStatus = 'succeeded';
      if (status === 'canceled') dbStatus = 'canceled';
      
      transaction.status = dbStatus;
      await db.updateTransaction(transaction);
    }

    // Update Order Status
    if (status === 'succeeded') {
      const orders = await db.getOrders();
      // Find order by paymentId or metadata
      const order = orders.find((o) => o.paymentId === targetPaymentId);
      if (order && order.paymentStatus !== 'succeeded') {
        order.paymentStatus = 'succeeded';
        order.status = 'Оплачен'; // Update main status too
        await db.updateOrder(order);
      }
    } else if (status === 'canceled') {
        const orders = await db.getOrders();
        const order = orders.find((o) => o.paymentId === targetPaymentId);
        if (order && order.paymentStatus !== 'canceled') {
            order.paymentStatus = 'canceled';
            // order.status = 'Отменен'; // Maybe keep as processing but unpaid?
            await db.updateOrder(order);
        }
    }

    return NextResponse.json({ status, payment });

  } catch (error: unknown) {
    console.error('Payment status check error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
