"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, Variants } from "framer-motion";


export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, addOrder } = useCart();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    comment: ""
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  
  // Use callback for handleCloseModal to be used in effect
  const handleCloseModal = React.useCallback(() => {
    setIsSuccessModalOpen(false);
    router.refresh();
    router.replace("/");
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccessModalOpen) {
      timer = setTimeout(() => {
        handleCloseModal();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isSuccessModalOpen, handleCloseModal]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=/checkout&backUrl=/cart");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && items.length === 0 && !isSuccessModalOpen) {
      router.replace("/");
    }
  }, [isLoading, items.length, isSuccessModalOpen, router]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    const diff = latest - previous;
    const isScrollingDown = diff > 0;
    const isScrollingUp = diff < 0;

    // Use latest scroll position for bottom check
    const isAtBottom = window.innerHeight + latest >= document.documentElement.scrollHeight - 20;

    if (isAtBottom) {
      setIsCheckoutVisible(true);
    } else if (isScrollingDown && Math.abs(diff) > 5) {
      setIsCheckoutVisible(false);
    } else if (isScrollingUp && Math.abs(diff) > 5) {
      setIsCheckoutVisible(true);
    }
    
    lastScrollY.current = latest;
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-beige">Загрузка...</div>;
  }

  if (!isAuthenticated) {
     return null; // Or a loading spinner while redirecting
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow user to clear the input completely
    if (input === "") {
        setFormData(prev => ({ ...prev, phone: "" }));
        return;
    }

    // If the input doesn't start with +7, and we are just starting, 
    // we should treat the first char as potential content if it's not 7/8
    // But since we stripped everything non-numeric, let's just use the numbers logic.

    // Strip all non-numeric characters
    const numbers = input.replace(/\D/g, "");

    if (numbers.length === 0) {
        setFormData(prev => ({ ...prev, phone: "" }));
        return;
    }

    // Build the formatted value
    // Always start with +7
    let formatted = "+7";
    
    // Logic for handling the input
    let content = "";

    // If input starts with 7 or 8 (Russia code)
    if (numbers.length > 0 && ["7", "8"].includes(numbers[0])) {
        // If we just have 7 or 8 (length 1), it means user typed 7 or 8 into empty field -> +7 (
        if (numbers.length === 1) {
            content = "";
        }
        // If we have 77, 78, 87, 88 (length 2), it means user typed 7 or 8 into +7 ( -> Ignore the new digit, keep +7 (
        else if (numbers.length === 2 && ["7", "8"].includes(numbers[1])) {
             content = "";
        }
        // If we have more than 2 digits, and the second is 7 or 8, we assume it's valid content e.g. +7 (700)...
        // But wait, if numbers is 770, content is 70.
        // If numbers is 77, content is empty.
        // This is correct.
        else {
             content = numbers.substring(1);
        }
    } else {
        // If it starts with 9 (or other), treat as content directly
        content = numbers;
    }

    // Limit to 10 digits (area code + number)
    content = content.substring(0, 10);

    if (content.length > 0) {
        formatted += ` (${content.substring(0, 3)}`;
    } else {
        formatted += " (";
    }
    
    if (content.length >= 4) {
        formatted += `) ${content.substring(3, 6)}`;
    }
    if (content.length >= 7) {
        formatted += `-${content.substring(6, 8)}`;
    }
    if (content.length >= 9) {
        formatted += `-${content.substring(8, 10)}`;
    }

    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent deleting the prefix parts if not clearing completely
    // But allow clearing if the user hits backspace when only prefix is there
    if (e.key === "Backspace") {
        if (formData.phone.length <= 4) { // "+7 (" length is 4
            e.preventDefault();
            setFormData(prev => ({ ...prev, phone: "" }));
        }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
        handlePhoneInput(e as React.ChangeEvent<HTMLInputElement>);
    } else if (name === "name" || name === "city") {
        // Allow only letters, spaces, and hyphens (standard for names)
        // This regex removes any digits or special characters that aren't usually in names
        // But user specifically asked "cannot enter numbers", so let's just strip numbers to be safe but allow other chars if needed
        const cleanValue = value.replace(/[0-9]/g, "");
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Gift Configuration
  const GIFTS = [
    { 
      id: "gift-1000", 
      threshold: 1000, 
      title: "Фирменный стикерпак", 
    },
    { 
      id: "gift-5000", 
      threshold: 5000, 
      title: "Полотенце шефа", 
    },
    { 
      id: "gift-10000", 
      threshold: 10000, 
      title: "Фартук шефа (Lite)", 
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed || items.length === 0 || isSubmitting) return;
    
    setIsSubmitting(true);

    // Create order object
    const orderItems = items.map(item => ({
      id: item.id,
      name: item.title,
      price: item.price,
      quantity: item.quantity
    }));

    // Add earned gifts
    const earnedGifts = GIFTS.filter(gift => total >= gift.threshold);
    earnedGifts.forEach((gift, index) => {
      // Use negative IDs for gifts to avoid collision with product IDs
      // and ensure uniqueness among gifts
      orderItems.push({
        id: -(index + 1), 
        name: `Подарок: ${gift.title}`,
        price: 0,
        quantity: 1
      });
    });

    try {
      // Add order to history
      const order = await addOrder({
        address: `${formData.city}, ${formData.address}`,
        amount: total,
        items: orderItems,
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: user?.email
        }
      });
      
      if (order) {
        // Create payment
        try {
          const response = await fetch('/api/payment/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
            body: JSON.stringify({
              orderId: order.id,
              amount: total,
              returnUrl: `${window.location.origin}/profile?payment_check=true&orderId=${order.id}`
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.confirmation_url) {
              clearCart();
              window.location.href = data.confirmation_url;
              return;
            }
            console.error("Payment create response without confirmation_url", data);
            alert("Не удалось получить ссылку на оплату. Попробуйте ещё раз или свяжитесь с менеджером.");
          } else {
            let errorMessage = "Не удалось создать платёж. Попробуйте ещё раз или свяжитесь с менеджером.";
            try {
              const errorData = await response.json();
              if (errorData?.message) {
                errorMessage = `Ошибка оплаты: ${errorData.message}`;
              }
              console.error("Payment creation failed:", errorData);
            } catch (parseError) {
              console.error("Payment creation failed, cannot parse error body:", parseError);
            }
            alert(errorMessage);
          }
        } catch (paymentError) {
          console.error("Payment API error:", paymentError);
          alert("Ошибка соединения при создании платежа. Проверьте интернет или попробуйте позже.");
        }
      } else {
          // Fallback if addOrder returns null (error)
           console.error("Order creation failed");
      }
      
    } catch (error) {
      console.error("Failed to submit order:", error);
      alert("Не удалось оформить заказ. Попробуйте ещё раз или свяжитесь с менеджером.");
    } finally {
      setIsSubmitting(false);
    }
  };



  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const isFormValid = 
    formData.name.trim().length > 0 &&
    formData.city.trim().length > 0 &&
    formData.address.trim().length > 0 &&
    formData.phone.trim().length === 18 &&
    isAgreed &&
    items.length > 0 &&
    !isSubmitting;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      } 
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige font-sans text-brand-brown pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-brand-beige/80 backdrop-blur-md border-b border-brand-brown/10 px-4 py-4 flex items-center justify-between supports-[backdrop-filter]:bg-brand-beige/60">
        <button 
          onClick={() => router.push('/cart')}
          className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors active:scale-95 duration-200"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="text-xl font-bold tracking-widest absolute left-1/2 -translate-x-1/2 uppercase">
          Оформление
        </h1>

        <Link href="/profile" prefetch={false} className="p-2 -mr-2 hover:bg-white/50 rounded-full transition-colors active:scale-95 duration-200">
          <div className="w-8 h-8 relative flex items-center justify-center -translate-y-1">
            <Image 
              src="/images/profile-chef-happy-v2.png" 
              alt="Профиль" 
              width={25}
              height={25}
              className="object-contain"
            />
          </div>
        </Link>
      </header>

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.form 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit} 
          className="space-y-6"
        >
          
          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-brown/20 transition-shadow duration-300">
                <input
                    type="text"
                    name="name"
                    placeholder="ФИО"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-brand-brown placeholder-brand-brown/50 px-5 py-4 outline-none font-sans font-medium text-base"
                        required
                    />
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                    {/* City */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-brown/20 transition-shadow duration-300">
                        <input
                            type="text"
                            name="city"
                            placeholder="Город"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full bg-transparent text-brand-brown placeholder-brand-brown/50 px-5 py-4 outline-none font-sans font-medium text-base"
                            required
                        />
                    </motion.div>
                     {/* Phone */}
                    <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-brown/20 transition-shadow duration-300">
                        <input
                            type="tel"
                            name="phone"
                            inputMode="numeric"
                            placeholder="+7 (___) ___-__-__"
                            value={formData.phone}
                            onChange={handleInputChange}
                            onKeyDown={handlePhoneKeyDown}
                            maxLength={18}
                            className="w-full bg-transparent text-brand-brown placeholder-brand-brown/50 px-5 py-4 outline-none font-sans font-medium text-base"
                            required
                        />
                    </motion.div>
                </div>

                {/* Address */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-brown/20 transition-shadow duration-300">
                    <input
                        type="text"
                        name="address"
                        placeholder="Адрес (Улица, дом, квартира)"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-brand-brown placeholder-brand-brown/50 px-5 py-4 outline-none font-sans font-medium text-base"
                        required
                />
            </motion.div>
          </div>

          {/* User Agreement */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 pt-4">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="agreement"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-brand-brown/40 checked:bg-brand-brown checked:border-brand-brown transition-all"
              />
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <label htmlFor="agreement" className="text-sm text-brand-brown/70 cursor-pointer select-none">
              Пользовательское соглашение
            </label>
          </motion.div>

        </motion.form>
      </div>

      {/* Bottom Fixed Action */}
      <AnimatePresence>
        {isCheckoutVisible && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-md bg-white/90 backdrop-blur-md border border-brand-brown/10 p-4 rounded-2xl shadow-2xl z-30"
          >
            <button 
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all uppercase tracking-wider text-sm ${
                  isFormValid
                    ? "bg-[#2B1A15] text-[#E1DDD6] hover:bg-[#3E2D26] active:scale-95"
                    : "bg-[#2B1A15]/50 text-[#E1DDD6]/50 cursor-not-allowed shadow-none"
                }`}
            >
                {isSubmitting ? "Обработка..." : `Оплатить ${formatPrice(total)} ₽`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop with blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/30 backdrop-blur-md"
              onClick={handleCloseModal}
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm bg-white text-brand-brown p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-2xl rounded-3xl overflow-hidden"
            >
              {/* Decorative Accent */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#AE3135]" />

              {/* Close Button (Cross) */}
              <button 
                onClick={handleCloseModal}
                className="absolute top-5 right-5 text-brand-brown/30 hover:text-brand-brown transition-colors p-2 rounded-full hover:bg-brand-brown/5"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className="flex flex-col items-center justify-center w-full">
                {/* Success Icon */}
                <div className="w-20 h-20 mb-6 rounded-full bg-[#E1DDD6]/50 flex items-center justify-center text-[#AE3135]">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <motion.path 
                      d="M20 6L9 17L4 12" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold uppercase tracking-widest mb-3">
                  Спасибо за<br/>покупку!
                </h2>
                
                <p className="text-base text-brand-brown/60 font-medium mb-8 leading-relaxed">
                  Ваш заказ успешно оформлен.<br/>Мы свяжемся с вами в ближайшее время.
                </p>

                <button 
                    onClick={handleCloseModal}
                    className="w-full bg-[#2B1A15] text-[#E1DDD6] py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-[#3E2D26] active:scale-95 transition-all"
                >
                    Отлично
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
