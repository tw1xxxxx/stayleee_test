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
  const [hasAutoplayFailed, setHasAutoplayFailed] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const video = videoRef.current;
    if (!video) return;

    // Оптимизированные настройки для мобильных и десктопов
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
    
    // Explicitly set muted again to bypass some browser restrictions
    video.volume = 0;

    const handleCanPlay = () => {
      setIsReady(true);
      // Small delay before first play
      setTimeout(() => {
        if (!video) return;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setHasAutoplayFailed(false);
          }).catch(error => {
            console.log("Autoplay was prevented:", error);
            setHasAutoplayFailed(true);
          });
        }
      }, 100);
    };

    if (video.readyState >= 2) {
      handleCanPlay();
    } else {
      video.addEventListener("canplay", handleCanPlay);
    }

    // Fix for older Safari/iOS and stuck state
    const interval = setInterval(() => {
      if (!video) return;

      if (video.readyState >= 1) { // 1 is enough for play()
        if (!isReady && video.readyState >= 2) setIsReady(true);
        
        // If it's ready but paused or stuck at frame 0, try to play it
        // We also check for 'stuck' by checking if currentTime is advancing
        if ((video.paused || video.currentTime === 0) && !hasAutoplayFailed) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              setHasAutoplayFailed(false);
            }).catch((e) => {
              console.log("Autoplay check failed:", e);
              // Only set failed if it's truly blocked, not just temporarily delayed
              if (video.paused && !video.ended) setHasAutoplayFailed(true);
            });
          }
        }
      }
    }, 1500);

    // Add user interaction listener to force play if autoplay fails
    const forcePlay = () => {
      if (video && (video.paused || video.currentTime === 0)) {
        video.play().then(() => {
          setIsReady(true);
          setHasAutoplayFailed(false);
        }).catch(() => {});
      }
    };
    window.addEventListener('touchstart', forcePlay, { once: true });
    window.addEventListener('click', forcePlay, { once: true });

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener('touchstart', forcePlay);
      window.removeEventListener('click', forcePlay);
      video.removeEventListener("canplay", handleCanPlay);
      clearInterval(interval);
    };
  }, [isReady, hasAutoplayFailed]);

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

        {/* Кнопка воспроизведения если автоплей заблокирован */}
        {hasAutoplayFailed && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-auto">
            <button 
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.play().then(() => {
                    setHasAutoplayFailed(false);
                    setIsReady(true);
                  }).catch(e => console.error("Manual play failed:", e));
                }
              }}
              className="p-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all scale-110 active:scale-95 group"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1 group-hover:scale-110 transition-transform">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
