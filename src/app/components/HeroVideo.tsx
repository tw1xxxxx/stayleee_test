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
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let isCleanedUp = false;

    // Сразу устанавливаем атрибуты для мобильных устройств
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");

    const attemptPlay = async () => {
      if (isCleanedUp) return;
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          if (!isCleanedUp) setIsReady(true);
        }
      } catch (err) {
        console.log("Autoplay blocked, waiting for interaction");
      }
    };

    const handleInteraction = () => {
      if (!isCleanedUp && video.paused) {
        attemptPlay();
      }
      // Удаляем слушатели после первой успешной попытки или взаимодействия
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("click", handleInteraction);
    };

    video.addEventListener("loadeddata", attemptPlay);
    video.addEventListener("canplaythrough", attemptPlay);
    video.addEventListener("playing", () => setIsReady(true));
    
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("click", handleInteraction, { passive: true });

    // Начальная попытка
    attemptPlay();

    return () => {
      isCleanedUp = true;
      video.removeEventListener("loadeddata", attemptPlay);
      video.removeEventListener("canplaythrough", attemptPlay);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("click", handleInteraction);
    };
  }, []);

  const y = useTransform(scrollY, [0, 500], [0, isMobile ? 0 : 150]);
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-brand-brown">
      <motion.div 
        style={{ y }} 
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 w-full h-[130%] -top-[15%] will-change-transform"
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="auto"
          poster={poster || undefined}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/40 z-10" />
      </motion.div>
      
      {/* Poster fallback while video is loading */}
      {!isReady && poster && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center z-[5] transition-opacity duration-1000"
          style={{ backgroundImage: `url(${poster})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
    </div>
  );
}
