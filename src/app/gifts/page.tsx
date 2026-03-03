"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import FadeIn from "../components/FadeIn";
import MenuOverlay from "../components/MenuOverlay";

import { useCart } from "../context/CartContext";
import { formatPrice } from "@/lib/utils";

interface Gift {
  id: string | number;
  title: string;
  price: number;
  image: string;
  description?: string;
  threshold: number;
}

export default function GiftsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const { total, addToCart, items, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    // We set mounted in a timeout to avoid cascading renders warning
    const mountTimer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    
    const fetchGifts = async () => {
      try {
        const res = await fetch("/api/gifts", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setGifts(data);
        }
      } catch (error) {
        console.error("Failed to fetch gifts", error);
      }
    };
    fetchGifts();

    return () => clearTimeout(mountTimer);
  }, []);

  const handleAddToCart = (gift: Gift) => {
    addToCart({
      id: gift.id.toString(),
      title: gift.title,
      price: gift.price,
      image: gift.image,
      size: "ONE SIZE",
      color: "Default"
    });
  };

  const hasPaidGiftInCart = items.some(item => item.id.toString().includes('gift') && item.price > 0);
  const isCartNotEmpty = items.length > 0;
  const showHeaderButtons = isMounted && (isCartNotEmpty || hasPaidGiftInCart);

  return (
    <div className="min-h-screen bg-brand-beige text-brand-brown font-sans flex flex-col">
      {/* Header */}
      <header className="relative bg-brand-beige border-b border-brand-brown/10 px-4 py-4 flex items-center justify-between z-30">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="text-xl font-bold tracking-widest absolute left-1/2 -translate-x-1/2 uppercase">
          Подарки
        </h1>

        <div className="flex items-center gap-1 md:gap-2">
          {showHeaderButtons && (
            <>
              <Link href="/cart" prefetch={false} className="p-2 hover:bg-white/50 rounded-full transition-colors relative">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {items.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-red text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>
              <Link href="/profile" prefetch={false} className="p-0.5 -mr-1.5 hover:bg-white/50 rounded-full transition-colors">
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <Image 
                    src="/images/profile-icon.png" 
                    alt="Профиль" 
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <FadeIn className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-[0.2em] mb-6">
            Ваши привилегии
          </h2>
          <p className="text-brand-brown/60 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Мы ценим ваш выбор и дарим подарки при достижении определенной суммы в корзине. 
            Также вы можете приобрести любой подарок отдельно.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {gifts.map((gift, idx) => {
            const isEarned = isMounted ? total >= gift.threshold : false;
            const cartItem = items.find(item => item.id.toString() === gift.id);
            const quantity = cartItem?.quantity || 0;
            
            return (
              <FadeIn key={gift.id} delay={idx * 0.1}>
                <div className="bg-white/40 backdrop-blur-sm rounded-3xl overflow-hidden border border-brand-brown/5 shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Image Section */}
                    <div className="relative w-full md:w-2/5 aspect-[4/5] md:aspect-auto overflow-hidden">
                      <Image 
                        src={gift.image} 
                        alt={gift.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 30vw"
                      />
                      {isMounted && isEarned && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-brand-red text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                            Доступно в подарок
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider leading-tight">
                            {gift.title}
                          </h3>
                        </div>
                        <p className="text-brand-brown/70 text-sm md:text-base leading-relaxed mb-6">
                          {gift.description}
                        </p>
                        
                        <div className="space-y-4 mb-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-brand-brown/40 font-bold">
                              Условие получения
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-brand-beige flex items-center justify-center text-xs font-bold text-brand-brown shadow-sm">
                                {gift.threshold / 1000}к
                              </div>
                              <span className="text-sm font-medium text-brand-brown/80">
                                Бесплатно при заказе от {isMounted ? formatPrice(gift.threshold) : gift.threshold} ₽
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {quantity > 0 && cartItem ? (
                        <div className="flex items-center gap-4 bg-brand-brown text-white rounded-xl overflow-hidden h-[52px]">
                          <button 
                            onClick={() => {
                              if (quantity > 1) {
                                updateQuantity(cartItem.cartId, quantity - 1);
                              } else {
                                removeFromCart(cartItem.cartId);
                              }
                            }}
                            className="flex-1 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-xl font-light"
                          >
                            –
                          </button>
                          <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                          <button 
                            onClick={() => updateQuantity(cartItem.cartId, quantity + 1)}
                            className="flex-1 h-full flex items-center justify-center hover:bg-white/10 transition-colors text-xl font-light"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(gift)}
                          disabled={!isMounted}
                          className="w-full py-4 bg-brand-brown text-white rounded-xl uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 hover:bg-brand-brown/90"
                        >
                          {isMounted 
                            ? `Добавить за ${formatPrice(gift.price)} ₽`
                            : 'Загрузка...'}
                        </button>
                      )}

                      {isMounted && isEarned && (
                        <div className="mt-4 p-3 bg-brand-red/10 border border-brand-red/20 rounded-xl text-center">
                          <p className="text-brand-red text-[11px] font-bold uppercase tracking-wider">
                            Вы получите 1 шт. бесплатно при оформлении!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </main>

      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
