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
    { path: "/certificates", label: "Сертификаты" },
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
          <Link href="https://vk.com/staysee_shop" target="_blank" prefetch={false} className="w-14 h-14 flex items-center justify-center transition-opacity hover:opacity-80">
             <svg viewBox="75 168 300 187" xmlns="http://www.w3.org/2000/svg" className="w-10 h-auto">
                <path d="M75.6 168.3H126.7C128.4 253.8 166.1 290 196 297.4V168.3H244.2V242C273.7 238.8 304.6 205.2 315.1 168.3H363.3C359.3 187.4 351.5 205.6 340.2 221.6C328.9 237.6 314.5 251.1 297.7 261.2C316.4 270.5 332.9 283.6 346.1 299.8C359.4 315.9 369 334.6 374.5 354.7H321.4C316.6 337.3 306.6 321.6 292.9 309.8C279.1 297.9 262.2 290.4 244.2 288.1V354.7H238.4C136.3 354.7 78 284.7 75.6 168.3z" fill="#0077FF"/>
             </svg>
          </Link>

          {/* Telegram Icon - Official Plane Only */}
          <Link href="https://t.me/staysee_shop" target="_blank" className="w-14 h-14 flex items-center justify-center transition-opacity hover:opacity-80">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
              <path d="M17.8 7.6L15.6 18.3C15.5 18.8 15.2 18.9 14.8 18.7L11.4 16.2L9.8 17.7C9.6 17.9 9.4 18.1 9 18.1L9.2 14.6L15.6 8.8C15.9 8.5 15.5 8.4 15.1 8.6L7.2 13.6L3.8 12.5C3 12.3 3 11.7 4 11.3L17.1 6.3C17.7 6.1 18.2 6.4 17.8 7.6Z" fill="#29B6F6"/>
            </svg>
          </Link>

          {/* WhatsApp Icon - Official Bubble + Phone */}
          <Link href="https://wa.me/79099804077" target="_blank" prefetch={false} className="w-14 h-14 flex items-center justify-center transition-opacity hover:opacity-80">
             <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
               <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" fill="#25D366"/>
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
