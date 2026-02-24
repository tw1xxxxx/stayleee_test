"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import MenuOverlay from "./MenuOverlay";
import { useRouter } from "next/navigation";
import { useScroll, useTransform, useSpring, motion } from "framer-motion";


interface HeaderProps {
  variant?: "default" | "back" | "burger-left";
}

export default function Header({ variant = "default" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 80, damping: 20, mass: 1 });

  // Transform values mapped to scroll position
  // Два состояния: сверху просто логотип, при скролле — оторванная капсула
  const width = useTransform(smoothScrollY, [0, 120], ["100%", "92%"]);
  const borderRadius = useTransform(smoothScrollY, [0, 120], ["0px", "999px"]);
  const y = useTransform(smoothScrollY, [0, 120], [0, 16]);
  const backgroundColor = useTransform(smoothScrollY, [0, 60, 120], [
    "rgba(0, 0, 0, 0)",
    "rgba(0, 0, 0, 0.3)",
    "rgba(28, 25, 23, 0.85)",
  ]);
  const backdropFilter = useTransform(smoothScrollY, [0, 60, 120], ["blur(0px)", "blur(0px)", "blur(8px)"]);
  const boxShadow = useTransform(smoothScrollY, [0, 60, 120], [
    "0 0 0 rgba(0,0,0,0)",
    "0 4px 10px rgba(0, 0, 0, 0.2)",
    "0 10px 30px rgba(0, 0, 0, 0.45)",
  ]);
  const padding = useTransform(smoothScrollY, [0, 120], ["1rem 1.5rem", "0.75rem 1.5rem"]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.header 
          style={{
            width,
            borderRadius,
            y,
            backgroundColor,
            backdropFilter,
            boxShadow,
            padding,
            maxWidth: "1280px"
          }}
          className="flex items-center text-brand-beige justify-between pointer-events-auto"
        >
          {variant === "back" ? (
             /* Back Button (Left) */
             <button 
               onClick={() => router.back()}
               className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 group opacity-70 hover:opacity-100 pointer-events-auto"
               aria-label="Назад"
             >
               <svg 
                 xmlns="http://www.w3.org/2000/svg" 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 strokeWidth={1} 
                 stroke="currentColor" 
                 className="w-10 h-10 group-hover:-translate-x-1 transition-transform duration-500"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
               </svg>
             </button>
          ) : variant === "burger-left" ? (
            /* Burger Menu (Left) */
             <div className="flex items-center gap-4 pointer-events-auto">
               <button
                 onClick={() => setIsMenuOpen(true)}
                 className="p-1 focus:outline-none hover:bg-white/10 rounded-full transition-colors"
                 aria-label="Открыть меню"
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
                     d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                   />
                 </svg>
               </button>
             </div>
          ) : (
            /* Logo (Left) */
            <Link href="/" prefetch={false} className="relative w-60 h-12 transition-all duration-500 pointer-events-auto">
              <Image
                src="/images/logo/StaySee_Logo_whitesand_v1-0.svg"
                alt="Логотип StaySee"
                fill
                className="object-contain object-left"
                priority
              />
            </Link>
          )}

          {variant === "back" || variant === "burger-left" ? (
             /* Logo (Right) */
             <Link href="/" prefetch={false} className="relative w-60 h-12 transition-all duration-500 pointer-events-auto">
               <Image
                 src="/images/logo/StaySee_Logo_whitesand_v1-0.svg"
                 alt="Логотип StaySee"
                 fill
                 className="object-contain object-right"
                 priority
               />
             </Link>
          ) : (
             /* Burger Menu (Right) */
             <div className="flex items-center gap-4 pointer-events-auto">
               <button
                 onClick={() => setIsMenuOpen(true)}
                 className="p-1 focus:outline-none hover:bg-white/10 rounded-full transition-colors"
                 aria-label="Открыть меню"
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
                     d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                   />
                 </svg>
               </button>
             </div>
          )}
        </motion.header>
      </div>

      {/* Mobile Menu Overlay */}
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
