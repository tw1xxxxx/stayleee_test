"use client";

import React, { useRef, useEffect } from 'react';
import SafeImage from './SafeImage';

interface ElasticImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  enableSnapBack?: boolean;
  sizes?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

export default function ElasticImage({ src, alt, className, priority, onClick, sizes, objectFit = "cover", enableSnapBack = false }: ElasticImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Gesture state
  const state = useRef({
    isZooming: false,
    isPanning: false,
    hasMoved: false,
    currentScale: 1,
    currentTranslate: { x: 0, y: 0 },
    // For Mouse Drag & Touch Pan
    startPan: { x: 0, y: 0 },
    startTranslate: { x: 0, y: 0 },
    // For Touch Pinch
    startDist: 0,
    startScale: 1,
    startCenter: { x: 0, y: 0 },
    // For Wheel
    wheelTimeout: null as NodeJS.Timeout | null,
  });

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    const updateTransform = (animate = false) => {
      if (animate) {
        image.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
        setTimeout(() => { image.style.transition = ''; }, 300);
      } else {
        image.style.transition = 'none';
      }

      // Boundary checks
      const scaledWidth = image.offsetWidth * state.current.currentScale;
      const scaledHeight = image.offsetHeight * state.current.currentScale;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      const maxTranslateX = Math.max(0, (scaledWidth - containerWidth) / 2);
      const maxTranslateY = Math.max(0, (scaledHeight - containerHeight) / 2);

      if (state.current.currentTranslate.x > maxTranslateX) state.current.currentTranslate.x = maxTranslateX;
      if (state.current.currentTranslate.x < -maxTranslateX) state.current.currentTranslate.x = -maxTranslateX;
      if (state.current.currentTranslate.y > maxTranslateY) state.current.currentTranslate.y = maxTranslateY;
      if (state.current.currentTranslate.y < -maxTranslateY) state.current.currentTranslate.y = -maxTranslateY;

      image.style.transform = `translate(${state.current.currentTranslate.x}px, ${state.current.currentTranslate.y}px) scale(${state.current.currentScale})`;
      
      // Update cursor and touch-action
      if (state.current.currentScale > 1) {
        container.style.cursor = state.current.isPanning || state.current.isZooming ? 'grabbing' : 'grab';
        container.style.touchAction = 'none';
      } else {
        container.style.cursor = 'default';
        container.style.touchAction = 'pan-y';
      }
    };

    // --- Touch Handlers (Mobile) ---
    const getDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getCenter = (touches: TouchList) => {
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch Zoom Start
        e.preventDefault();
        e.stopPropagation();
        state.current.isZooming = true;
        state.current.isPanning = false;
        state.current.startDist = getDistance(e.touches);
        state.current.startScale = state.current.currentScale;
        state.current.startCenter = getCenter(e.touches);
        state.current.startTranslate = { ...state.current.currentTranslate };
        state.current.hasMoved = false;
      } else if (e.touches.length === 1 && state.current.currentScale > 1) {
        // Pan Start (only if zoomed)
        e.stopPropagation(); // Stop gallery swipe
        state.current.isPanning = true;
        state.current.isZooming = false;
        state.current.startPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        state.current.startTranslate = { ...state.current.currentTranslate };
        state.current.hasMoved = false;
      } else {
        // Normal click or gallery swipe
        state.current.isZooming = false;
        state.current.isPanning = false;
        state.current.hasMoved = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (state.current.isZooming && e.touches.length === 2) {
        // Pinch Zoom Move
        e.preventDefault();
        e.stopPropagation();
        state.current.hasMoved = true;

        const currentDist = getDistance(e.touches);
        const scaleRatio = currentDist / state.current.startDist;
        const newScale = Math.max(1, state.current.startScale * scaleRatio);
        
        // Update scale
        state.current.currentScale = newScale;
        
        // Center-based zoom logic (simplified)
        // We can just keep the center stable or allow panning.
        // For now, let's just scale. Panning can be done separately or simultaneously?
        // Simultaneous pan + zoom is complex. Let's just scale around center for now.
        // But we need to account for pinch center movement.
        const currentCenter = getCenter(e.touches);
        const dx = currentCenter.x - state.current.startCenter.x;
        const dy = currentCenter.y - state.current.startCenter.y;
        
        // Apply delta to translate
        state.current.currentTranslate.x = state.current.startTranslate.x + dx;
        state.current.currentTranslate.y = state.current.startTranslate.y + dy;
        
        updateTransform();

      } else if (state.current.isPanning && e.touches.length === 1) {
        // Pan Move
        e.preventDefault();
        e.stopPropagation();
        state.current.hasMoved = true;

        const dx = e.touches[0].clientX - state.current.startPan.x;
        const dy = e.touches[0].clientY - state.current.startPan.y;

        state.current.currentTranslate.x = state.current.startTranslate.x + dx;
        state.current.currentTranslate.y = state.current.startTranslate.y + dy;
        
        updateTransform();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // If we were zooming and now have < 2 touches, zooming ended
      if (state.current.isZooming && e.touches.length < 2) {
        state.current.isZooming = false;
        
        // If snap back is enabled, reset immediately when zoom gesture ends
        if (enableSnapBack) {
          state.current.currentScale = 1;
          state.current.currentTranslate = { x: 0, y: 0 };
          updateTransform(true);
          return;
        }
      }
      
      if (state.current.isPanning && e.touches.length === 0) {
        state.current.isPanning = false;
      }
      
      // If we stopped interacting completely, check bounds/snap back
      if (!state.current.isZooming && !state.current.isPanning && e.touches.length === 0) {
        if (enableSnapBack || state.current.currentScale < 1.1) {
          state.current.currentScale = 1;
          state.current.currentTranslate = { x: 0, y: 0 };
          updateTransform(true);
        } else {
          updateTransform(true); // Snap to bounds
        }
      }
    };

    // --- Desktop Handlers (Wheel & Mouse) ---

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || state.current.currentScale > 1) {
        e.preventDefault();
        e.stopPropagation();

        if (state.current.wheelTimeout) clearTimeout(state.current.wheelTimeout);

        if (e.ctrlKey) {
          // ZOOM
          const sensitivity = 0.002;
          const delta = -e.deltaY * sensitivity;
          const oldScale = state.current.currentScale;
          let newScale = oldScale + delta * oldScale * 5; // Accelerate zoom
          if (newScale < 1) newScale = 1;
          if (newScale > 5) newScale = 5;

          // Zoom towards cursor
          const containerRect = container.getBoundingClientRect();
          const containerCenterX = containerRect.left + containerRect.width / 2;
          const containerCenterY = containerRect.top + containerRect.height / 2;
          
          const pScreenX = e.clientX - containerCenterX;
          const pScreenY = e.clientY - containerCenterY;
          
          // Formula: T_new = T_old - (P_screen - T_old) * (Scale_new/Scale_old - 1)
          const scaleRatio = newScale / oldScale - 1;
          
          state.current.currentTranslate.x -= (pScreenX - state.current.currentTranslate.x) * scaleRatio;
          state.current.currentTranslate.y -= (pScreenY - state.current.currentTranslate.y) * scaleRatio;
          state.current.currentScale = newScale;
        } else {
          // PAN
          state.current.currentTranslate.x -= e.deltaX;
          state.current.currentTranslate.y -= e.deltaY;
        }
        
        updateTransform();
        
        state.current.wheelTimeout = setTimeout(() => {
          // Optional: Snap back if slightly zoomed out? No, keep it.
        }, 100);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (state.current.currentScale > 1) {
        e.preventDefault();
        e.stopPropagation();
        state.current.isZooming = true; // reusing flag for dragging
        state.current.startPan = { x: e.clientX, y: e.clientY };
        state.current.startTranslate = { ...state.current.currentTranslate };
        state.current.hasMoved = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (state.current.isZooming && state.current.currentScale > 1) {
        e.preventDefault();
        state.current.hasMoved = true;
        const dx = e.clientX - state.current.startPan.x;
        const dy = e.clientY - state.current.startPan.y;
        
        state.current.currentTranslate.x = state.current.startTranslate.x + dx;
        state.current.currentTranslate.y = state.current.startTranslate.y + dy;
        updateTransform();
      }
    };

    const handleMouseUp = () => {
      const wasInteracting = state.current.isZooming;
      state.current.isZooming = false;

      if (wasInteracting && enableSnapBack) {
        state.current.currentScale = 1;
        state.current.currentTranslate = { x: 0, y: 0 };
        updateTransform(true);
      }
    };

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      if (enableSnapBack) return;

      if (state.current.currentScale > 1.1) {
        // Reset to 1
        state.current.currentScale = 1;
        state.current.currentTranslate = { x: 0, y: 0 };
        updateTransform(true);
      } else {
        // Zoom In to 2.5x at cursor
        const newScale = 2.5;
        const oldScale = 1;
        
        const containerRect = container.getBoundingClientRect();
        const containerCenterX = containerRect.left + containerRect.width / 2;
        const containerCenterY = containerRect.top + containerRect.height / 2;
        
        const pScreenX = e.clientX - containerCenterX;
        const pScreenY = e.clientY - containerCenterY;
        
        // T_new = T_old - (P_screen - T_old) * (Scale_new/Scale_old - 1)
        // T_old = 0
        state.current.currentTranslate.x = -pScreenX * (newScale / oldScale - 1);
        state.current.currentTranslate.y = -pScreenY * (newScale / oldScale - 1);
        state.current.currentScale = newScale;
        
        updateTransform(true);
      }
    };

    // Attach listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('dblclick', handleDoubleClick);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
      
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [enableSnapBack]);

  const handleClick = () => {
    // Only trigger if we weren't zooming/panning significantly
    if (!state.current.isZooming && !state.current.hasMoved && onClick) {
      onClick();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      onClick={handleClick}
    >
      <div 
        ref={imageRef}
        className="w-full h-full relative flex items-center justify-center will-change-transform"
      >
        <SafeImage
          src={src}
          alt={alt}
          fill
          className={className}
          priority={priority}
          sizes={sizes}
          draggable={false}
          style={{ objectFit: objectFit }}
        />
      </div>
    </div>
  );
}
