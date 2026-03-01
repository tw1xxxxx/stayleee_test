import { NextResponse } from 'next/server';
import { db, Gift } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let gifts = await db.getGifts();

    // Seed default gifts if empty
    if (gifts.length === 0) {
      const defaultGifts: Gift[] = [
        {
          id: "gift-15000",
          threshold: 15000,
          title: "Фирменный карандаш",
          description: "Наш фирменный карандаш для записей ваших идей",
          image: "/images/catalog-product.jpg",
          price: 150
        },
        {
          id: "gift-20000",
          threshold: 20000,
          title: "Набор стикеров",
          description: "Набор виниловых стикеров с нашей символикой",
          image: "/images/catalog-product.jpg",
          price: 300
        },
        {
          id: "gift-25000",
          threshold: 25000,
          title: "Фартук в подарок",
          description: "Классический фартук StaySee из прочного хлопка",
          image: "/images/catalog-product.jpg",
          price: 1500
        }
      ];

      // Try to save, but ignore failures on read-only environments
      try {
        await db.saveGifts(defaultGifts);
      } catch (error) {
        console.error('Failed to save seeded gifts:', error);
      }

      // If saving failed or was partial, use defaultGifts directly
      const savedGifts = await db.getGifts();
      gifts = savedGifts.length > 0 ? savedGifts : defaultGifts;
    }

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
