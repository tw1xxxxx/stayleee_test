"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HeroVideoProps {
  src?: string;
  poster?: string;
}

export default function HeroVideo({ src = "/videos/hero-inline.mp4", poster = "/videos/hero-poster.jpg" }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    // Fix for older Safari/iOS: video might not trigger 'canplay' if already ready or on some power modes
    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState >= 3 && !isReady) {
        setIsReady(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearInterval(interval);
    };
  }, [isReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Оптимизированные настройки для мобильных и десктопов
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const handleCanPlay = () => {
      setIsReady(true);
      video.play().catch(() => {
        // Autoplay might be blocked
      });
    };

    // Add user interaction listener to force play if autoplay fails
    const forcePlay = () => {
      if (video.paused) {
        video.play().then(() => {
          setIsReady(true);
        }).catch(() => {});
      }
    };
    window.addEventListener('touchstart', forcePlay, { once: true });
    window.addEventListener('click', forcePlay, { once: true });

    if (video.readyState >= 3) {
      handleCanPlay();
    } else {
      video.addEventListener("canplay", handleCanPlay);
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  const y = useTransform(scrollY, [0, 500], [0, isMobile ? 0 : 100]);
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-brand-brown">
      <motion.div 
        style={{ y, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} 
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 w-full h-[120%] -top-[10%] will-change-transform"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="auto"
          poster={poster || undefined}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transform-gpu"
        >
          {src.endsWith('.MOV') || src.endsWith('.mov') ? (
            <>
              <source src={src} type="video/quicktime" />
              <source src={src.replace(/\.mov$/i, '.mp4')} type="video/mp4" />
            </>
          ) : (
            <>
              <source src={src} type="video/mp4" />
              <source src={src.replace(/\.mp4$/i, '.mov')} type="video/quicktime" />
            </>
          )}
        </video>
        {/* Затемнение и теплый эффект */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-[#FFD700]/10 mix-blend-soft-light z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-brand-brown/15 mix-blend-multiply z-15 pointer-events-none" />
      </motion.div>
    </div>
  );
}
