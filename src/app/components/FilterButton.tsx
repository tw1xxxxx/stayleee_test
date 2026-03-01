"use client";

import { motion } from "framer-motion";

interface FilterButtonProps {
  onClick: () => void;
  className?: string;
  active?: boolean;
}

export default function FilterButton({ onClick, className = "", active = false }: FilterButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative group flex items-center justify-center transition-all duration-300 ${className}`}
      aria-label="Фильтры"
    >
      {/* Background with glass effect - hidden when custom styles are passed via className */}
      {!className.includes('bg-white') && (
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/20 group-hover:bg-white/20 transition-colors" />
      )}
      
      {/* Icon Container */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`${className.includes('bg-white') ? 'text-brand-brown' : 'text-white'} group-hover:text-brand-brown/70 transition-colors`}
        >
          {/* Animated Filter Lines */}
          <motion.path 
            d="M4 6H20" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
            animate={active ? { d: "M6 6L18 18" } : { d: "M4 6H20" }}
          />
          <motion.path 
            d="M7 12H17" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
            animate={active ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
          />
          <motion.circle 
            cx="17" cy="12" r="2" 
            fill="currentColor"
            animate={active ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
          />
          <motion.path 
            d="M10 18H14" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
            animate={active ? { d: "M18 6L6 18" } : { d: "M10 18H14" }}
          />
          
          {/* Decorative dots for filter feel */}
          <motion.circle 
            cx="7" cy="6" r="1.5" 
            fill="currentColor"
            animate={active ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.circle 
            cx="12" cy="18" r="1.5" 
            fill="currentColor"
            animate={active ? { opacity: 0 } : { opacity: 1 }}
          />
        </svg>
      </div>

      {/* Active Indicator */}
      {active && (
        <motion.div
          layoutId="active-filter"
          className="absolute -top-1 -right-1 w-3 h-3 bg-brand-red rounded-full border-2 border-brand-brown"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}
    </motion.button>
  );
}
