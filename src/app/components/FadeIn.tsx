"use client";

import { motion, useInView, HTMLMotionProps, useReducedMotion } from "framer-motion";
import { useRef, ReactNode, useEffect, useState, useSyncExternalStore } from "react";

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  fullWidth?: boolean;
  className?: string;
  priority?: boolean; // If true, animates immediately without waiting for viewport
}

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  fullWidth = false,
  className = "",
  priority = false,
  ...props
}: FadeInProps) {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const isInView = useInView(ref, { once: true, margin: "0px 0px 100px 0px" });

  const shouldAnimate = priority || isInView;
  const disableAnimation = prefersReducedMotion || isSmallScreen;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setIsSmallScreen(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
    } else {
      media.addListener(update);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", update);
      } else {
        media.removeListener(update);
      }
    };
  }, []);

  const getInitial = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 40 };
      case "down":
        return { opacity: 0, y: -40 };
      case "left":
        return { opacity: 0, x: 40 };
      case "right":
        return { opacity: 0, x: -40 };
      case "none":
        return { opacity: 0 };
      default:
        return { opacity: 0, y: 40 };
    }
  };

  const getAnimate = () => {
    switch (direction) {
      case "up":
      case "down":
        return { opacity: 1, y: 0 };
      case "left":
      case "right":
        return { opacity: 1, x: 0 };
      case "none":
        return { opacity: 1 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  if (!hasMounted) {
    return (
      <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={disableAnimation ? getAnimate() : getInitial()}
      animate={disableAnimation ? getAnimate() : shouldAnimate ? getAnimate() : getInitial()}
      transition={{
        duration: disableAnimation ? 0 : 0.8,
        delay: disableAnimation ? 0 : delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
