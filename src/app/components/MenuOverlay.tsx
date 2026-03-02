"use client";

import { useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants: Variants = {
  closed: {
    x: "100%",
    transition: {
      type: "tween",
      duration: 0.25,
      ease: [0.32, 0.725, 0.32, 1]
    }
  },
  open: {
    x: 0,
    transition: {
      type: "tween",
      duration: 0.25,
      ease: [0.19, 1, 0.22, 1]
    }
  }
};

const navVariants: Variants = {
  closed: {},
  open: {
    transition: {
      staggerChildren: 0.01,
      delayChildren: 0.02
    }
  }
};

const itemVariants: Variants = {
  closed: { opacity: 0, y: 12 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const MenuOverlay = memo(function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const pathname = usePathname();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      const bodyStyle = document.body.style;
      
      bodyStyle.top = `-${scrollY}px`;
      bodyStyle.position = 'fixed';
      bodyStyle.width = '100%';
      bodyStyle.overflow = "hidden";
    }

    return () => {
      const bodyStyle = document.body.style;
      const scrollY = bodyStyle.top;
      
      bodyStyle.position = '';
      bodyStyle.top = '';
      bodyStyle.width = '';
      bodyStyle.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen]);

  const menuItems = [
    { path: "/", label: "Главная" },
    { path: "/catalog", label: "Каталог" },
    { path: "/collections", label: "Коллекции" },
    { path: "/restaurants", label: "Для ресторанов" },
    { path: "/cooperation", label: "Сотрудничество" },
    { path: "/about", label: "О нас" },
    { path: "/gifts", label: "Подарки" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="menu-overlay"
          initial="closed"
          animate="open"
          exit="closed"
          variants={overlayVariants}
          className="fixed inset-0 z-[100] bg-brand-beige text-brand-brown overflow-y-auto hide-scrollbar h-[100dvh] will-change-transform overscroll-contain"
          style={{ 
            backfaceVisibility: "hidden", 
            WebkitFontSmoothing: "antialiased",
            transform: "translate3d(0,0,0)" // Force hardware acceleration
          }}
        >
          <div className="min-h-full flex flex-col p-6">
            {/* Menu Header */}
            <div className="flex justify-between items-start mb-8">
              <a href="tel:+79099804077" className="text-lg font-medium flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                +7 (909) 980-40-77
              </a>
              <button
                onClick={onClose}
                className="p-2 hover:bg-brand-brown/10 rounded-full transition-colors"
                aria-label="Закрыть меню"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <motion.nav 
              variants={navVariants}
              className="flex-1 flex flex-col justify-center items-center gap-6 text-xl font-medium tracking-wide uppercase w-full py-8"
            >
              {menuItems.map((item) => (
                <motion.div
                  key={item.path}
                  variants={itemVariants}
                  className="flex flex-col items-center gap-6 w-full"
                >
                  <Link
                    href={item.path}
                    prefetch
                    className={`hover:text-black transition-colors ${pathname === item.path ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                  <div className="w-64 h-px bg-brand-brown/20"></div>
                </motion.div>
              ))}
            </motion.nav>

            {/* Social Icons Footer */}
        <motion.div 
          variants={itemVariants}
          transition={{ delay: 0.5, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-shrink-0 flex justify-center gap-2 pb-4 pt-0 items-center"
        >
          {/* VK Icon - Official Glyph Only */}
          <Link href="https://vk.ru/shopstaysee" target="_blank" prefetch={false} className="w-14 h-14 flex items-center justify-center transition-opacity hover:opacity-80">
             <svg viewBox="75 168 300 187" xmlns="http://www.w3.org/2000/svg" className="w-10 h-auto">
                <path d="M75.6 168.3H126.7C128.4 253.8 166.1 290 196 297.4V168.3H244.2V242C273.7 238.8 304.6 205.2 315.1 168.3H363.3C359.3 187.4 351.5 205.6 340.2 221.6C328.9 237.6 314.5 251.1 297.7 261.2C316.4 270.5 332.9 283.6 346.1 299.8C359.4 315.9 369 334.6 374.5 354.7H321.4C316.6 337.3 306.6 321.6 292.9 309.8C279.1 297.9 262.2 290.4 244.2 288.1V354.7H238.4C136.3 354.7 78 284.7 75.6 168.3z" fill="#0077FF"/>
             </svg>
          </Link>

          {/* Telegram Icon - Official Plane Only */}
          <Link href="https://t.me/stayseesh0p" target="_blank" className="w-14 h-14 flex items-center justify-center transition-opacity hover:opacity-80">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
              <path d="M17.8 7.6L15.6 18.3C15.5 18.8 15.2 18.9 14.8 18.7L11.4 16.2L9.8 17.7C9.6 17.9 9.4 18.1 9 18.1L9.2 14.6L15.6 8.8C15.9 8.5 15.5 8.4 15.1 8.6L7.2 13.6L3.8 12.5C3 12.3 3 11.7 4 11.3L17.1 6.3C17.7 6.1 18.2 6.4 17.8 7.6Z" fill="#29B6F6"/>
            </svg>
          </Link>

          {/* Instagram Icon */}
          <Link href="https://www.instagram.com/stayseeshop?igsh=ZzN6Mnhzdzh4aHg3&utm_source=qr" target="_blank" prefetch={false} className="w-14 h-14 flex items-center justify-center transition-opacity hover:opacity-80">
             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
               <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.981 1.28.058 1.688.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="#E4405F"/>
             </svg>
          </Link>
        </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default MenuOverlay;
