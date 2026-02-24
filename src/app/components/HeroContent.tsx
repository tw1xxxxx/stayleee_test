"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div 
      ref={containerRef}
      className="absolute inset-0 z-10 flex flex-col justify-center items-center pointer-events-none"
    >
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="w-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col gap-8 md:gap-12 pointer-events-none"
      >
        {/* Slogan Text */}
        <div className="flex flex-col items-center text-center text-white font-[family-name:var(--font-pt-root-ui)] pointer-events-auto gap-2 md:gap-4">
          <p className="text-2xl md:text-5xl font-normal tracking-wide">
            Мы создаем форму
          </p>
          <div className="text-base md:text-2xl font-light opacity-90 leading-relaxed flex flex-col items-center">
            <span>усиливающую твою индивидуальность</span>
            <span>и творческий потенциал</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 w-full pointer-events-auto font-[family-name:var(--font-pt-root-ui)]">
          <Link href="/catalog" prefetch className="group">
            <div className="border border-white rounded-full w-[280px] md:w-[320px] py-3 md:py-4 text-white uppercase tracking-[0.15em] text-sm md:text-base font-medium transition-all duration-300 hover:opacity-70 flex justify-center items-center">
              Каталог
            </div>
          </Link>
          
          <Link href="/restaurants" prefetch className="group">
            <div className="border border-white rounded-full w-[280px] md:w-[320px] py-3 md:py-4 text-white uppercase tracking-[0.15em] text-sm md:text-base font-medium transition-all duration-300 hover:opacity-70 flex justify-center items-center">
              Для ресторанов
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
