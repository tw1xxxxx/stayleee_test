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
          image: "/foto/gift_pencil_stickers.heic",
          price: 150
        },
        {
          id: "gift-20000",
          threshold: 20000,
          title: "Набор стикеров",
          description: "Набор виниловых стикеров с нашей символикой",
          image: "/images/DSC00125.jpg",
          price: 300
        },
        {
          id: "gift-25000",
          threshold: 25000,
          title: "Фартук в подарок",
          description: "Классический фартук StaySee из прочного хлопка",
          image: "/images/catalog/aprons/simple/1.jpg",
          price: 11111
        },
        {
          id: "gift-35000",
          threshold: 35000,
          title: "Вышивка на изделии",
          description: "Индивидуальная вышивка вашего логотипа или имени",
          image: "/images/logo/StaySee_Logo_whitesand_v1-0.svg",
          price: 800
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
