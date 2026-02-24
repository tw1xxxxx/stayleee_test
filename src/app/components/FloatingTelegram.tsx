"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

export default function FloatingTelegram() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Check if body has 'overflow-hidden' class (which means a modal is open)
    const isModalOpen = document.body.classList.contains('overflow-hidden');
    
    // Show button when scrolled past 80% of the viewport height AND no modal is open
    const shouldShow = latest > window.innerHeight * 0.8 && !isModalOpen;
    
    if (shouldShow !== isVisible) {
      setIsVisible(shouldShow);
    }
  });

  // Don't render anything on cart or profile page
  if (pathname === '/cart' || pathname === '/profile') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-50"
        >
          <Link
            href="https://t.me/staysee_brand" 
            prefetch={false}
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 md:w-16 md:h-16 rounded-full hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-none outline-none border-none focus:outline-none focus:ring-0 active:ring-0"
            aria-label="Написать в Telegram"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-none filter-none">
              <circle cx="12" cy="12" r="12" fill="#29B6F6"/>
              <path d="M17.8 7.6L15.6 18.3C15.5 18.8 15.2 18.9 14.8 18.7L11.4 16.2L9.8 17.7C9.6 17.9 9.4 18.1 9 18.1L9.2 14.6L15.6 8.8C15.9 8.5 15.5 8.4 15.1 8.6L7.2 13.6L3.8 12.5C3 12.3 3 11.7 4 11.3L17.1 6.3C17.7 6.1 18.2 6.4 17.8 7.6Z" fill="white"/>
            </svg>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
