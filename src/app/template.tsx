"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Блокируем скролл на время анимации
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      document.body.style.overflow = "";
    }, 800); // Сократили время блокировки с 1500 до 800мс
    
    return () => {
      document.body.style.overflow = "";
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* Splash Screen Overlay */}
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#E1DDD6] flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, transitionEnd: { display: "none" } }}
        transition={{ duration: 0.4, delay: 0.6, ease: "easeInOut" }} // Увеличили задержку до 0.6с для загрузки видео
      >
        {/* Скрытая загрузка видео для кэширования браузером */}
        {isHome && (
          <video 
            src="/videos/hero-inline.mp4" 
            preload="auto" 
            muted 
            playsInline 
            className="hidden" 
          />
        )}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }} // Ускорили появление логотипа
          className="relative w-64 h-32"
        >
          <Image
            src="/images/logo/StaySee_Logo_chocolate_v1-0.png"
            alt="Логотип StaySee"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }} // Контент появляется вместе с уходом сплэша
      >
        {children}
      </motion.div>
    </>
  );
}
