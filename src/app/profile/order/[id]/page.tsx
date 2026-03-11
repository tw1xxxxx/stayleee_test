"use client";

import { useRouter, useParams } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function OrderPage() {
  const router = useRouter();
  const params = useParams();
  const { orders, isInitialized } = useCart();
  
  const order = orders.find((o) => o.id.toString() === params.id);
  
  const itemsTotal = order?.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) || 0;
  const totalQuantity = order?.items.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const deliveryFee = order?.deliveryFee || 0;
  const discountAmount = (itemsTotal + deliveryFee) - (order?.amount || 0);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-brand-beige font-sans text-brand-brown pb-20">
        {/* Header Skeleton */}
        <header className="relative bg-brand-beige border-b border-brand-brown/10 px-4 py-4 flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-brand-brown/10 animate-pulse" />
          <div className="h-6 w-32 bg-brand-brown/10 rounded animate-pulse absolute left-1/2 -translate-x-1/2" />
          <div className="w-10" />
        </header>

        <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
          {/* Amount Skeleton */}
          <div className="bg-brand-beige/50 rounded-2xl p-6 h-40 flex flex-col items-center justify-center border border-brand-brown/5 animate-pulse">
            <div className="h-4 w-24 bg-brand-brown/10 rounded mb-4" />
            <div className="h-12 w-48 bg-brand-brown/10 rounded" />
          </div>

          {/* Details Grid Skeleton */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 bg-brand-brown/10 rounded animate-pulse" />
              <div className="h-6 w-full bg-brand-brown/10 rounded animate-pulse" />
              <div className="h-6 w-2/3 bg-brand-brown/10 rounded animate-pulse" />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="h-3 w-16 bg-brand-brown/10 rounded animate-pulse" />
              <div className="h-6 w-24 bg-brand-brown/10 rounded animate-pulse" />
            </div>
          </div>

          {/* Items List Skeleton */}
          <div className="space-y-3">
            <div className="h-3 w-32 bg-brand-brown/10 rounded animate-pulse mb-4" />
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="h-[60px] bg-brand-brown/5 rounded-2xl w-full animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-beige text-brand-brown">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
          <button 
            onClick={() => router.push('/profile')}
            className="text-brand-brown underline hover:no-underline"
          >
            Вернуться в профиль
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige font-sans text-brand-brown pb-20">
       {/* Header with Back Button */}
       <header className="relative bg-brand-beige border-b border-brand-brown/10 px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors active:scale-95 duration-200"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="text-xl font-bold tracking-widest uppercase absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Заказ №{order.id}
        </h1>
        
        {/* Placeholder for symmetry */}
        <div className="w-10"></div>
      </header>

      <div className="p-4 md:p-8 max-w-2xl mx-auto">
         {/* Amount */}
         <div className="bg-brand-beige/50 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center border border-brand-brown/5">
            <span className="text-sm font-bold text-brand-brown/40 uppercase tracking-widest mb-2">Итого</span>
            <span className="text-5xl font-black text-brand-red tracking-tighter mb-4">
              {formatPrice(order.amount)} ₽
            </span>
            <div className="w-full space-y-2 border-t border-brand-brown/10 pt-4 px-4">
              <div className="flex justify-between text-sm">
                <span className="text-brand-brown/60">Количество:</span>
                <span className="font-bold">{totalQuantity} шт.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-brown/60">Товары:</span>
                <span className="font-bold">{formatPrice(itemsTotal)} ₽</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-brand-red">
                  <span className="opacity-70">Скидка:</span>
                  <span className="font-bold">-{formatPrice(discountAmount)} ₽</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-brand-brown/60">Доставка:</span>
                <span className="font-bold">{order.deliveryFee ? `${formatPrice(order.deliveryFee)} ₽` : 'Бесплатно'}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2 min-w-0">
              <span className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest">Адрес доставки</span>
              <span className="text-lg font-bold text-brand-brown leading-tight break-words hyphens-auto" lang="ru">{order.address}</span>
            </div>
            
            <div className="flex flex-col gap-2 min-w-0">
              <span className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest">Статус</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${order.paymentStatus === 'succeeded' ? 'bg-green-500' : 'bg-brand-red'}`}></span>
                <span className="text-lg font-bold text-brand-brown truncate">
                  {order.paymentStatus === 'succeeded' ? 'В обработке' : 'Не оплачено'}
                </span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <span className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-widest mb-3 block">Позиции в заказе</span>
            <div className="space-y-3 pb-4">
              {order.items.map((item, itemIndex) => (
                <div 
                  key={`${item.id}-${itemIndex}`}
                  className="min-h-[60px] bg-[#E8E8E8] text-brand-brown rounded-2xl w-full flex items-center justify-between px-6 py-4 shadow-inner gap-4"
                >
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="font-medium text-base leading-tight uppercase tracking-wide break-words hyphens-auto" lang="ru">{item.name}</span>
                    <div className="flex flex-wrap gap-2 items-center">
                      {item.quantity && item.quantity > 1 && (
                        <span className="text-xs text-brand-brown/50 font-medium">{item.quantity} шт.</span>
                      )}
                      {item.size && (
                        <span className="text-[10px] bg-brand-brown/5 px-1.5 py-0.5 rounded uppercase font-bold text-brand-brown/40">Размер: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="text-[10px] bg-brand-brown/5 px-1.5 py-0.5 rounded uppercase font-bold text-brand-brown/40">Цвет: {item.color}</span>
                      )}
                      {item.embroidery && (
                        <span className="text-[10px] bg-brand-red/10 px-1.5 py-0.5 rounded uppercase font-bold text-brand-red flex items-center gap-1">
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          С вышивкой (+900 ₽)
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold whitespace-nowrap opacity-90 text-lg shrink-0">
                    {item.price === 0 ? "Бесплатно" : `${formatPrice(item.price * (item.quantity || 1))} ₽`}
                  </span>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
