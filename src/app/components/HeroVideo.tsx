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

    const attemptPlay = () => {
      if (isCleanedUp) return;
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("autoplay", "");
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(() => {
          if (!isCleanedUp) setIsReady(true);
        }).catch(() => {});
      } else {
        setIsReady(true);
      }
    };

    const onLoadedData = () => attemptPlay();
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplay", onLoadedData);
    video.addEventListener("playing", () => setIsReady(true));

    const onUserGesture = () => attemptPlay();
    window.addEventListener("touchstart", onUserGesture);
    window.addEventListener("click", onUserGesture);
    window.addEventListener("keydown", onUserGesture);

    if (video.readyState >= 3) {
      attemptPlay();
    }

    return () => {
      isCleanedUp = true;
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplay", onLoadedData);
      window.removeEventListener("touchstart", onUserGesture);
      window.removeEventListener("click", onUserGesture);
      window.removeEventListener("keydown", onUserGesture);
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
