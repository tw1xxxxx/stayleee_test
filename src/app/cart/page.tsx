"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useCart } from "../context/CartContext";
import SafeImage from "@/app/components/SafeImage";

// Gift Configuration
const GIFTS = [
  { 
    id: "gift-1000", 
    threshold: 1000, 
    title: "Фирменный стикерпак", 
    image: "/images/logo/StaySee_Logo_whitesand_v1-0.svg" 
  },
  { 
    id: "gift-5000", 
    threshold: 5000, 
    title: "Полотенце шефа", 
    image: "/images/logo/StaySee_Logo_whitesand_v1-0.svg" 
  },
  { 
    id: "gift-10000", 
    threshold: 10000, 
    title: "Фартук шефа (Lite)", 
    image: "/images/logo/StaySee_Logo_whitesand_v1-0.svg" 
  },
];

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    updateQuantity, 
    toggleSelection, 
    selectedItems, 
    total,
    removeFromCart
  } = useCart();

  const [isCheckoutVisible, setIsCheckoutVisible] = useState(true);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

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

  // Use a stable formatter to prevent hydration mismatch (server vs client locale differences)
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

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
  const nextGift = GIFTS.find(g => g.threshold > currentTotal);
  const progress = nextGift ? {
    target: nextGift.threshold,
    current: currentTotal,
    percent: Math.min((currentTotal / nextGift.threshold) * 100, 100),
    message: `Ещё ${formatPrice(nextGift.threshold - currentTotal)} ₽ до подарка`,
    completed: false
  } : {
    target: GIFTS[GIFTS.length - 1].threshold,
    current: currentTotal,
    percent: 100,
    message: "Все подарки получены!",
    completed: true
  };

  const earnedGifts = GIFTS.filter(g => currentTotal >= g.threshold);

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

        <Link 
          href="/profile"
          prefetch={false}
          className="p-2 -mr-2 hover:bg-white/50 rounded-full transition-colors active:scale-95 duration-200 text-brand-brown"
        >
          <div className="w-8 h-8 relative flex items-center justify-center -translate-y-1">
            <Image 
              src="/images/profile-chef-happy-v2.png" 
              alt="Профиль" 
              width={25}
              height={25}
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
                    <Link href={`/product/${item.id}`} prefetch={false} className="relative w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 block">
                      <SafeImage
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between min-h-[96px]">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link href={`/product/${item.id}`} prefetch={false} className="block">
                            <h3 className="font-medium text-sm leading-tight pr-6 hover:text-brand-red transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </Link>
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

                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-brand-brown/60">
                          <span className="bg-brand-beige px-1.5 py-0.5 rounded whitespace-nowrap">Размер: {item.size}</span>
                          <span className="bg-brand-beige px-1.5 py-0.5 rounded whitespace-nowrap">Цвет: {item.color}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-2 mt-2">
                        <span className="font-bold text-base whitespace-nowrap mb-0.5">
                          {formatPrice(item.price * item.quantity)} ₽
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
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-brand-brown/5">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-medium text-brand-brown/70">
              {progress.completed ? "Цель достигнута!" : "До следующего подарка"}
            </span>
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

                <div className="relative w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0 p-1.5">
                    <Image
                    src={gift.image}
                    alt={gift.title}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="text-[8px] font-bold uppercase text-white/50 mb-0.5">
                    Подарок
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
                <span className="text-xs text-brand-brown/50 font-medium uppercase tracking-wide">Итого</span>
                <span className="text-2xl font-bold text-brand-brown leading-none">
                  {formatPrice(total)} ₽
                </span>
              </div>
              <Link 
                href="/checkout"
                prefetch={false}
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
    </div>
  );
}
