"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart, Order } from "../context/CartContext";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { orders, clearCart } = useCart();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [cameFromPayment, setCameFromPayment] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Sync orders from context to local state for rendering
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoggingOut) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router, isLoggingOut]);

  // Helper to check orders explicitly (used in return check)
  const checkAllPendingOrders = useCallback(async () => {
      // Re-use logic or just rely on the effect? 
      // Effect handles it.
      // But for the return check, we might want to force it immediately.
      // We can duplicate logic or extract it.
      // For simplicity, let's extract.
      
      const pendingOrders = orders.filter(o => 
        (o.paymentStatus === 'pending' || o.status === 'unpaid') && o.paymentId
      );
      
      let anyFailed = false;

      for (const order of pendingOrders) {
        if (!order.paymentId) continue;
        try {
          const res = await fetch(`/api/payment/status?paymentId=${order.paymentId}&orderId=${order.id}`, {
             method: 'GET',
             headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
             const data = await res.json();
             if (data.status !== 'succeeded') {
                 anyFailed = true;
             }
             // Update UI logic is shared with polling via setLocalOrders if we sync
          } else {
              anyFailed = true;
          }
        } catch {
            anyFailed = true;
        }
      }
      
      if (anyFailed) {
          setShowPaymentError(true);
          setTimeout(() => setShowPaymentError(false), 3000);
      }
  }, [orders]);

  // Check payment status on return from YooKassa
  useEffect(() => {
    const checkPaymentReturn = async () => {
      const isPaymentCheck = searchParams.get('payment_check');
      const returnedOrderId = searchParams.get('orderId');
      if (isPaymentCheck) {
        setCameFromPayment(true);
        if (returnedOrderId) {
          try {
            const res = await fetch(`/api/payment/status?orderId=${returnedOrderId}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'succeeded') {
                setShowPaymentSuccess(true);
                setTimeout(() => {
                  setShowPaymentSuccess(false);
                }, 3000);
              } else {
                setShowPaymentError(true);
                setTimeout(() => setShowPaymentError(false), 3000);
              }
            } else {
              setShowPaymentError(true);
              setTimeout(() => setShowPaymentError(false), 3000);
            }
          } catch {
            setShowPaymentError(true);
            setTimeout(() => setShowPaymentError(false), 3000);
          }
        } else {
          await checkAllPendingOrders();
        }
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    };
    if (isAuthenticated && orders.length > 0) {
       checkPaymentReturn();
    }
  }, [searchParams, isAuthenticated, orders.length, checkAllPendingOrders]);

  // Polling for payment status (every 20 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    const controller = new AbortController();

    const pollPendingOrders = async () => {
      // Use functional state update or ref to get latest orders if needed,
      // but here we depend on localOrders from closure.
      // However, to avoid stale closure in recursive setTimeout, we need to access the LATEST localOrders.
      // But we can't easily do that without a ref or including it in dependency (which restarts effect).
      // A better way for recursive timeout is to use a Ref for orders.
      
      // Let's rely on the effect restarting if localOrders changes.
      // BUT, to prevent the "abort" error, we should ensure we don't have overlapping requests or rapid restarts.
      // The issue with setInterval was that it might stack up or run when unmounted.
      
      const pendingOrders = localOrders.filter(o => 
        (o.paymentStatus === 'pending' || o.status === 'unpaid') && o.paymentId
      );

      if (pendingOrders.length === 0) {
        // Even if no pending orders, we should continue polling if we expect status changes? 
        // Or stop? The original code stopped if no pending orders?
        // No, original code: if (pendingOrders.length === 0) return; inside the function.
        // But setInterval kept running.
        // So we should schedule next poll.
         timeoutId = setTimeout(pollPendingOrders, 20000);
         return;
      }

      let hasUpdates = false;
      const updatedOrders = [...localOrders];

      for (const order of pendingOrders) {
        if (!isMounted) break;
        if (!order.paymentId) continue;
        try {
          const res = await fetch(`/api/payment/status?paymentId=${order.paymentId}&orderId=${order.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Add cache: no-store to ensure fresh data and avoid browser caching causing issues?
            cache: 'no-store',
            signal: controller.signal
          });
          
          if (res.ok) {
            const data = await res.json();
            const index = updatedOrders.findIndex(o => o.id === order.id);
            if (index !== -1) {
                const currentStatus = updatedOrders[index].paymentStatus;
                const newStatus = data.status;
                
                if (currentStatus !== newStatus) {
                    updatedOrders[index] = {
                        ...updatedOrders[index],
                        paymentStatus: newStatus,
                        status: newStatus === 'succeeded' ? 'Оплачен' : (newStatus === 'canceled' ? 'Отменен' : 'Не оплачен')
                    };
                    hasUpdates = true;
                }
            }
          }
        } catch (e: unknown) {
          if (e instanceof Error && e.name === "AbortError") return;
          console.error("Error checking status for order", order.id, e);
        }
      }

      if (isMounted) {
        if (hasUpdates) {
            setLocalOrders(updatedOrders);
            // Updating localOrders will trigger effect cleanup and restart.
            // So we don't need to schedule next poll here explicitly if we change dependency.
            // But if we DON'T have updates, we need to schedule next poll.
        } else {
            timeoutId = setTimeout(pollPendingOrders, 20000);
        }
      }
    };
    
    // Initial call
    // We delay the first call slightly to avoid conflict with mount?
    // Original: pollPendingOrders() immediately.
    pollPendingOrders();

    return () => {
        isMounted = false;
        clearTimeout(timeoutId);
        controller.abort();
    };
  }, [isAuthenticated, localOrders]); // Included localOrders to fix warning, but be careful with infinite loop if logic updates unnecessarily

  const handlePay = async (order: Order) => {
    if (order.paymentStatus === 'succeeded') return;
    
    // If we have paymentId, maybe we can reuse it? 
    // Usually better to create a new payment if previous one expired/canceled.
    // User said "create api request to yookassa".
    // We'll create a new payment for the existing order.
    
    try {
        const response = await fetch('/api/payment/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            body: JSON.stringify({ 
                orderId: order.id, 
                amount: order.amount, 
                returnUrl: `${window.location.origin}/profile?payment_check=true&orderId=${order.id}` 
            }),
        });
        if (response.ok) {
            const data = await response.json();
            window.location.assign(data.confirmation_url);
        } else {
            alert("Ошибка создания платежа");
        }
    } catch (e) {
        console.error(e);
        alert("Ошибка соединения");
    }
  };

  const handleLogout = () => {
    clearCart();
    setIsLoggingOut(true);
    logout();
  };

  // Combine mock orders and real orders
  const allOrders = localOrders;

  // Calculate total buyout amount
  const totalBuyout = allOrders.reduce((sum, order) => sum + order.amount, 0);

  // Format price helper
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(date);
    } catch {
      return "";
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-brand-beige flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-beige font-sans text-brand-brown pb-32">
      {/* Header */}
      <header className="relative bg-brand-beige border-b border-brand-brown/10 px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => {
            if (cameFromPayment) {
              router.push("/");
            } else {
              router.back();
            }
          }}
          className="p-2 -ml-2 hover:bg-black/5 rounded-full transition-colors active:scale-95 duration-200"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.5 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="text-xl font-bold tracking-widest uppercase absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          Личный кабинет
        </h1>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-brand-brown hover:opacity-70 transition-opacity flex items-center justify-center active:scale-95 duration-200"
          title="Выйти"
        >
          <div className="relative w-6 h-6">
            <Image 
              src="/images/icons8-выход-48.png"
              alt="Выйти"
              fill
              className="object-contain"
            />
          </div>
        </button>
      </header>

      <div className="max-w-md mx-auto px-6 py-4 space-y-4">
        
        {/* Profile Card */}
        <div className="bg-[#E8E8E8] rounded-[2rem] p-6 shadow-inner border border-white/20 relative overflow-hidden">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
               <Image 
                 src="/images/snapedit_1771006657482.png"
                 alt="Фон профиля"
                 fill
                 className="object-contain drop-shadow-md"
                 priority
               />
               <div className="relative w-9 h-9 z-10 mb-8 mr-0.5">
                  <Image 
                    src="/images/profile-chef-happy-v2.png"
                    alt="Повар"
                    fill
                    className="object-contain filter brightness-0 invert drop-shadow-sm opacity-90"
                  />
               </div>
            </div>
            
            {/* User Info */}
            <div className="flex flex-col min-w-0 flex-1 gap-1">
              <span className="text-2xl font-black text-brand-brown tracking-tight truncate">
                {user?.name || "Пользователь"}
              </span>
              <span className="text-sm font-medium text-brand-brown/60 tracking-wide font-sans truncate mt-1">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-8 mt-4 pt-5 border-t border-black/5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Сумма выкупа</span>
              <span className="text-2xl font-black text-brand-brown tracking-tight">
                {formatPrice(totalBuyout)} ₽
              </span>
            </div>
            
            <div className="flex flex-col gap-1 items-end text-right">
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Скидка</span>
              <span className="text-2xl font-black text-brand-brown tracking-tight">
                10%
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4 pt-2">
          <div className="text-sm font-medium text-black/50 pl-2 uppercase tracking-wider font-sans">Мои заказы</div>
          
          {allOrders.length === 0 ? (
            <div className="w-full bg-[#E8E8E8] rounded-[2rem] p-10 text-center shadow-inner border border-white/20 flex flex-col items-center justify-center gap-6">
              <div className="w-20 h-20 rounded-full bg-brand-brown/5 flex items-center justify-center mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-brown/40">
                  <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-brand-brown">У вас пока нет заказов</h3>
                <p className="text-brand-brown/60 text-sm max-w-[240px] mx-auto leading-relaxed">
                  Вы пока ничего не заказывали. Самое время выбрать стильную одежду для вашего персонала.
                </p>
              </div>

              <button 
                onClick={() => router.push('/catalog')}
                className="mt-2 px-8 py-3 bg-brand-brown text-brand-beige rounded-xl font-medium tracking-wide shadow-lg hover:bg-brand-brown/90 transition-all active:scale-95"
              >
                ПЕРЕЙТИ В КАТАЛОГ
              </button>
            </div>
          ) : (
            <>
              {allOrders.map((order, orderIndex) => (
                <motion.div 
                  key={`${order.id}-${orderIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-[#E8E8E8] rounded-2xl p-4 shadow-inner border border-white/20 relative overflow-hidden transition-transform active:scale-[0.99] cursor-pointer hover:shadow-md"
                  onClick={() => router.push(`/profile/order/${order.id}`)}
                >
                  <div className="flex flex-col gap-3 relative z-10">
                    {/* Top Row: ID, Date, Status */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col gap-0.5 min-w-0">
                           <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-brand-brown tracking-tight truncate">
                                    Заказ №{order.id.toString().slice(0, 8)}{order.id.toString().length > 8 ? '...' : ''}
                                </span>
                                <span className="text-[10px] text-black/40 font-medium whitespace-nowrap pt-1">
                                    {formatDate(order.date)}
                                </span>
                           </div>
                           <span className="text-xs text-black/40 font-medium">
                                {order.items.length} {order.items.length === 1 ? 'позиция' : (order.items.length > 1 && order.items.length < 5) ? 'позиции' : 'позиций'}
                           </span>
                        </div>

                        {/* Status Badge */}
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm whitespace-nowrap shrink-0 ${
                            order.paymentStatus === 'succeeded' 
                                ? 'bg-green-100 text-green-800' 
                                : order.paymentStatus === 'canceled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-white/60 text-brand-brown'
                        }`}>
                            {order.paymentStatus === 'succeeded' ? 'Оплачен' : 
                             order.paymentStatus === 'canceled' ? 'Отменен' : 
                             'Не оплачен'}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full bg-black/5" />

                    {/* Bottom Row: Price and Action */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col items-start">
                             <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Сумма</span>
                             <span className="text-xl font-black text-brand-red whitespace-nowrap tracking-tight">
                                {formatPrice(order.amount)} ₽
                             </span>
                        </div>

                        {/* Pay Button */}
                        {(order.paymentStatus !== 'succeeded') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePay(order);
                              }}
                              className="px-5 py-2 bg-brand-brown text-brand-beige text-xs font-bold uppercase rounded-xl shadow-md hover:bg-brand-brown/90 active:scale-95 transition-all"
                            >
                              Оплатить
                            </button>
                        )}
                        {order.paymentStatus === 'succeeded' && (
                            <div className="flex items-center gap-1.5 text-green-600 opacity-80">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="text-xs font-bold uppercase">Оплачено</span>
                            </div>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
      
      {/* Payment Error Popup */}
      <AnimatePresence>
        {showPaymentError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4"
          >
            <div className="flex flex-col">
                <span className="font-bold text-sm">Оплата не прошла</span>
                <span className="text-xs opacity-90">Свяжитесь с менеджером</span>
            </div>
            <a 
                href="https://t.me/manager_username" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-white/90"
            >
                Написать
            </a>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Payment Success Popup */}
      <AnimatePresence>
        {showPaymentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4"
          >
            <div className="flex flex-col">
                <span className="font-bold text-sm">Спасибо за покупку</span>
                <span className="text-xs opacity-90">Заказ оплачен</span>
            </div>
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="bg-white text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-white/90"
            >
              Закрыть
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-beige flex items-center justify-center">Загрузка...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
