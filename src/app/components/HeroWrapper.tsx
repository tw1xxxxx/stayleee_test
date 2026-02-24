"use client";

import { useEffect, useRef } from "react";
import HeroVideo from "./HeroVideo";
import HeroContent from "./HeroContent";

export default function HeroWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId = 0;
    let isVisible = true;
    const handleScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const shouldBeVisible = window.scrollY < window.innerHeight * 1.2;
        if (isVisible !== shouldBeVisible) {
          isVisible = shouldBeVisible;
          const el = containerRef.current;
          if (el) {
            if (shouldBeVisible) {
              el.classList.remove("opacity-0", "invisible");
              el.classList.add("opacity-100", "visible");
            } else {
              el.classList.remove("opacity-100", "visible");
              el.classList.add("opacity-0", "invisible");
            }
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-0 transition-opacity duration-500 opacity-100 visible"
    >
      <HeroVideo />
      <HeroContent />
    </div>
  );
}
