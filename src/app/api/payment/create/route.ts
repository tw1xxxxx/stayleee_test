import { NextResponse } from 'next/server';
import { createYooKassaPayment } from '@/lib/yookassa';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, returnUrl, items, customer } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create payment in YooKassa
    const payment = await createYooKassaPayment({
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
      },
      description: `Заказ #${orderId}`,
      metadata: {
        order_id: orderId,
      },
      ...(items && customer ? {
        receipt: {
          customer: {
            email: customer.email,
            phone: customer.phone,
          },
          items: items.map((item: any) => ({
            description: item.name,
            amount: {
              value: item.price.toFixed(2),
              currency: 'RUB',
            },
            quantity: item.quantity.toString(),
            vat_code: 1, // 1 for "No VAT" or adjust based on your taxation
            payment_mode: 'full_payment',
            payment_subject: 'commodity',
          })),
        }
      } : {}),
    });

    try {
      // Create transaction record
      await db.createTransaction({
        id: payment.id,
        orderId: orderId,
        amount: amount,
        status: 'pending',
        paymentId: payment.id,
        createdAt: new Date().toISOString(),
        type: 'payment',
      });
    } catch (dbError) {
      console.error('Error creating transaction record:', dbError);
      // Continue even if transaction record fails, order update is more important
    }

    try {
      // Update order with payment ID
      const orders = await db.getOrders();
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        order.paymentId = payment.id;
        order.paymentStatus = 'pending';
        await db.updateOrder(order);
      }
    } catch (orderError) {
       console.error('Error updating order with payment info:', orderError);
    }

    return NextResponse.json({ 
      paymentId: payment.id,
      confirmation_url: payment.confirmation.confirmation_url 
    });

  } catch (error: unknown) {
    console.error('Payment creation error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
