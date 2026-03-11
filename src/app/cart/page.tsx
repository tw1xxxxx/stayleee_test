"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useCart } from "../context/CartContext";
import SafeImage from "@/app/components/SafeImage";
import { formatPrice } from "@/lib/utils";

// Gift Interface
interface Gift {
  id: string;
  threshold: number;
  title: string;
  image: string;
  description?: string;
}

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    updateQuantity, 
    toggleSelection, 
    selectedItems, 
    total,
    totalWithoutDiscount,
    discount,
    removeFromCart
  } = useCart();

  const [isCheckoutVisible, setIsCheckoutVisible] = useState(true);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isGiftsModalOpen, setIsGiftsModalOpen] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useEffect(() => {
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
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    const diff = latest - previous;
    const isScrollingDown = diff > 0;
    const isScrollingUp = diff < 0;

    // Use latest scroll position for bottom check
    // We only force show if we are VERY close to the bottom (e.g. 10px) to avoid false positives
    const isAtBottom = window.innerHeight + latest >= document.documentElement.scrollHeight - 20;

    if (isAtBottom) {
      setIsCheckoutVisible(true);
    } else if (isScrollingDown && Math.abs(diff) > 5) {
      // Hide when scrolling down significantly
      setIsCheckoutVisible(false);
    } else if (isScrollingUp && Math.abs(diff) > 5) {
      // Show when scrolling up significantly
      setIsCheckoutVisible(true);
    }
    
    lastScrollY.current = latest;
  });

  const isAllSelected = items.length > 0 && selectedItems.length === items.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // If all are selected, unselect all
      items.forEach(item => {
        if (selectedItems.includes(item.cartId)) {
          toggleSelection(item.cartId);
        }
      });
    } else {
      // If not all are selected, select all (including currently unselected ones)
      items.forEach(item => {
        if (!selectedItems.includes(item.cartId)) {
          toggleSelection(item.cartId);
        }
      });
    }
  };

  const toggleItemSelection = (cartId: string) => {
    toggleSelection(cartId);
  };

  const removeItem = (cartId: string) => {
    // Add exit animation delay or logic if needed
    removeFromCart(cartId);
  };

  // Memoize heavy calculations if needed, but current ones are light
  // Just ensure list rendering is efficient
  
  // Calculate progress for gifts
  const currentTotal = total;
  const nextGift = gifts.length > 0 ? gifts.find(g => g.threshold > currentTotal) : null;
  const progress = nextGift ? {
    target: nextGift.threshold,
    current: currentTotal,
    percent: Math.min((currentTotal / nextGift.threshold) * 100, 100),
    message: `Ещё ${formatPrice(nextGift.threshold - currentTotal)} ₽ до подарка`,
    completed: false
  } : {
    target: gifts.length > 0 ? gifts[gifts.length - 1].threshold : 0,
    current: currentTotal,
    percent: 100,
    message: gifts.length > 0 ? "Все подарки получены!" : "Загрузка подарков...",
    completed: gifts.length > 0
  };

  const earnedGifts = gifts.filter(g => currentTotal >= g.threshold);

  return (
    <div className="min-h-screen bg-brand-beige font-sans text-brand-brown pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-brand-beige/80 backdrop-blur-md border-b border-brand-brown/10 px-4 py-4 flex items-center justify-between supports-[backdrop-filter]:bg-brand-beige/60">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors active:scale-95 duration-200"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="text-xl font-bold tracking-widest absolute left-1/2 -translate-x-1/2 uppercase">
          Корзина
        </h1>

        <Link href="/profile" prefetch={false} className="p-0.5 -mr-1.5 hover:bg-white/50 rounded-full transition-colors">
          <div className="w-12 h-12 relative flex items-center justify-center">
            <Image 
              src="/images/profile-icon.png" 
              alt="Профиль" 
              width={44}
              height={44}
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </header>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        
        {/* Select All */}
        {items.length > 0 && (
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
            <button 
              onClick={toggleSelectAll}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                isAllSelected 
                  ? "bg-brand-brown border-brand-brown text-white" 
                  : "border-brand-brown/30 text-transparent"
              }`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="font-medium text-sm">Выбрать все</span>
            <span className="ml-auto text-xs text-brand-brown/50">{selectedItems.length} / {items.length}</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="space-y-3">
          <AnimatePresence>
            {items.length > 0 ? (
              items.map((item) => (
                <motion.div
                  key={item.cartId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-xl p-3 shadow-sm relative overflow-hidden group"
                >
                  <div className="flex gap-3">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <button 
                        onClick={() => toggleItemSelection(item.cartId)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          selectedItems.includes(item.cartId)
                            ? "bg-brand-brown border-brand-brown text-white" 
                            : "border-brand-brown/30 text-transparent"
                        }`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>

                    {/* Product Image */}
                    {item.id.toString().includes('gift') ? (
                      <div className="relative w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 block">
                        <SafeImage
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <Link
                        href={`/product/${item.id}${item.color ? `?color=${encodeURIComponent(item.color)}` : ''}`}
                        prefetch={false}
                        replace
                        className="relative w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 block"
                      >
                        <SafeImage
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    )}

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between min-h-[96px]">
                      <div>
                        <div className="flex justify-between items-start">
                          {item.id.toString().includes('gift') ? (
                            <div className="block">
                              <h3 className="font-medium text-sm leading-tight pr-6 line-clamp-2">
                                {item.title}
                              </h3>
                            </div>
                          ) : (
                            <Link 
                            href={`/product/${item.id}${item.color ? `?color=${encodeURIComponent(item.color)}` : ''}`} 
                            prefetch={false} 
                            className="block"
                          >
                              <h3 className="font-medium text-sm leading-tight pr-6 hover:text-brand-red transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                            </Link>
                          )}
                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.cartId)}
                            className="p-1 -mt-1 -mr-1 text-brand-brown/20 hover:text-brand-red transition-colors"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>

                        {!item.id.toString().includes('gift') && (
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-brand-brown/60">
                            <span className="bg-brand-beige px-1.5 py-0.5 rounded whitespace-nowrap">Размер: {item.size}</span>
                            <span className="bg-brand-beige px-1.5 py-0.5 rounded whitespace-nowrap">Цвет: {item.color}</span>
                            {item.embroidery && (
                              <span className="bg-brand-brown/10 text-brand-brown px-1.5 py-0.5 rounded whitespace-nowrap font-medium flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                                С вышивкой
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-2 mt-2">
                        <span className="font-bold text-base whitespace-nowrap mb-0.5">
                          {formatPrice((item.price + (item.embroidery ? 900 : 0)) * item.quantity)} ₽
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center bg-brand-beige rounded-lg overflow-hidden h-9 shadow-inner shrink-0 ml-auto">
                          <button 
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className={`w-9 h-full flex items-center justify-center text-brand-brown/60 hover:bg-black/5 active:bg-black/10 transition-colors shrink-0 ${item.quantity <= 1 ? 'opacity-0 pointer-events-none' : ''}`}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                          <span className="w-8 h-full flex items-center justify-center font-medium text-sm shrink-0">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                            className="w-9 h-full flex items-center justify-center text-brand-brown/60 hover:bg-black/5 active:bg-black/10 transition-colors shrink-0"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 text-brand-brown/50">
                Корзина пуста
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Gift Progress Section */}
        <div 
          onClick={() => setIsGiftsModalOpen(true)}
          className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-brand-brown/5 relative group cursor-pointer hover:bg-white/70 transition-all duration-300"
        >
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-brand-brown/70">
                {progress.completed ? "Цель достигнута!" : "До следующего подарка"}
              </span>
              <div className="p-1 text-brand-brown/30 group-hover:text-brand-brown transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-brand-brown text-white px-2 py-0.5 rounded-full">
              {progress.completed ? "MAX" : `${formatPrice(progress.target)} ₽`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ type: "spring", stiffness: 40, damping: 15 }}
              className={`h-full rounded-full ${progress.completed ? "bg-green-500" : "bg-brand-red"}`}
            ></motion.div>
          </div>
          
          <p className="text-[10px] text-center mt-2 text-brand-brown/60">
            {progress.message}
          </p>
        </div>

        {/* Earned Gifts List */}
        <div className="space-y-2">
          <AnimatePresence>
            {earnedGifts.length > 0 && (
              <motion.h3
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-bold uppercase tracking-wider pl-1 text-brand-brown/50 overflow-hidden"
              >
                Ваши подарки
              </motion.h3>
            )}
          </AnimatePresence>
          
          <AnimatePresence mode="popLayout">
            {earnedGifts.map((gift) => (
              <motion.div
                key={gift.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                className="bg-gradient-to-r from-brand-brown to-[#3E2822] text-white rounded-xl p-3 flex items-center gap-3 shadow-lg relative overflow-hidden"
              >
                {/* Optimized: Removed heavy blur effect */}
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full"></div>

                <div className="relative w-12 h-12 bg-white/10 rounded-lg overflow-hidden shrink-0">
                    <Image
                    src={gift.image}
                    alt={gift.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="text-[8px] font-bold uppercase text-white/50">
                      Подарок
                    </div>
                    <button 
                      onClick={() => setIsGiftsModalOpen(true)}
                      className="p-1 -m-1 text-white/30 hover:text-white transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </button>
                  </div>
                  <h4 className="font-bold text-sm leading-tight">
                    {gift.title}
                  </h4>
                </div>

                <div className="font-bold text-brand-red bg-white px-2 py-0.5 rounded text-[10px]">
                    БЕСПЛАТНО
                  </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Bottom Fixed Summary */}
      <AnimatePresence>
        {isCheckoutVisible && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md bg-white/90 backdrop-blur-md border border-brand-brown/10 p-4 rounded-2xl shadow-2xl z-30"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                {discount > 0 && (
                  <span className="text-[10px] text-brand-red font-bold uppercase tracking-wider line-through opacity-50">
                    {formatPrice(totalWithoutDiscount)} ₽
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-brand-brown/50 font-medium uppercase tracking-wide">Итого</span>
                  {discount > 0 && (
                    <span className="text-[10px] bg-brand-red/10 text-brand-red px-1.5 py-0.5 rounded-full font-bold">
                      -{discount}%
                    </span>
                  )}
                </div>
                <span className="text-2xl font-bold text-brand-brown leading-none">
                  {formatPrice(total)} ₽
                </span>
              </div>
              <Link 
                href="/checkout"
                prefetch={false}
                replace
                aria-disabled={total === 0}
                className={`font-bold py-3 px-8 rounded-sm shadow-lg transition-all flex-1 uppercase tracking-wider text-sm flex items-center justify-center ${
                  total === 0 
                    ? "bg-[#2B1A15]/50 text-[#E1DDD6]/50 cursor-not-allowed shadow-none pointer-events-none" 
                    : "bg-[#2B1A15] text-[#E1DDD6] hover:bg-[#3E2D26] active:scale-95"
                }`}
              >
                Оформить
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gifts Info Modal */}
      <AnimatePresence>
        {isGiftsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGiftsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[340px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-brand-brown/10 z-[101]"
            >
              <div className="p-5 border-b border-brand-brown/5 flex justify-between items-center bg-brand-beige/20">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-brand-red tracking-[0.15em] mb-0.5">
                    Программа лояльности
                  </span>
                  <h3 className="text-sm font-bold text-brand-brown uppercase tracking-wider">
                    Доступные подарки
                  </h3>
                </div>
                <button 
                  onClick={() => setIsGiftsModalOpen(false)}
                  className="p-1.5 text-brand-brown/40 hover:text-brand-brown transition-colors bg-white rounded-full shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <p className="text-[11px] text-brand-brown/70 bg-brand-beige/30 p-3 rounded-xl border border-brand-brown/5 leading-snug">
                  Бесплатные подарки от нас за сумму заказа. Нажмите на подарок, чтобы узнать о нём подробнее.
                </p>
                {gifts.map((gift) => {
                  const isEarned = total >= gift.threshold;
                  return (
                    <Link 
                      key={gift.id}
                      href={`/gifts#${gift.id}`}
                      onClick={() => setIsGiftsModalOpen(false)}
                      className={`relative flex gap-4 p-3 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] group ${
                        isEarned 
                          ? "bg-brand-beige/30 border-brand-brown/10 shadow-sm" 
                          : "bg-white border-brand-brown/5 opacity-80"
                      }`}
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <Image
                          src={gift.image}
                          alt={gift.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {isEarned && (
                          <div className="absolute inset-0 bg-brand-brown/20 flex items-center justify-center">
                            <div className="bg-white rounded-full p-1 shadow-sm">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2B1A15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className="text-[13px] font-bold text-brand-brown leading-tight truncate">
                            {gift.title}
                          </h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                            isEarned 
                              ? "bg-green-500 text-white" 
                              : "bg-brand-brown/10 text-brand-brown/60"
                          }`}>
                            от {formatPrice(gift.threshold)} ₽
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-brown/60 leading-tight line-clamp-2">
                          {gift.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 bg-brand-beige/10 border-t border-brand-brown/5">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-medium text-brand-brown/60">
                    <span>Текущая сумма заказа:</span>
                    <span className="font-bold text-brand-brown">{formatPrice(total)} ₽</span>
                  </div>
                  <div className="h-1.5 w-full bg-brand-brown/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((total / (gifts[gifts.length-1]?.threshold || 1)) * 100, 100)}%` }}
                      className="h-full bg-brand-red rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
