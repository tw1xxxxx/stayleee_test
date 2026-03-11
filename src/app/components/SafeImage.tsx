"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends ImageProps {
  fallbackSrc?: string;
  noBackground?: boolean;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  fallbackSrc = "/images/470750.jpg", 
  alt, 
  noBackground = false,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imgSrc, setImgSrc] = useState<string | any>(src || fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setRetryCount(0);
    // If src is null, undefined, or empty, use fallback
    const validSrc = (src && typeof src === 'string' && src.trim() !== "") ? src : fallbackSrc;
    setImgSrc(validSrc);
    setIsLoading(true);
  }, [src, fallbackSrc]);

  return (
    <div className={`relative w-full h-full ${noBackground ? "" : "bg-gray-100/50"} ${props.className || ""}`}>
      {isLoading && !hasError && (
        <div className={`absolute inset-0 flex items-center justify-center ${noBackground ? "" : "bg-gray-100/50"} z-10 transition-opacity duration-300`}>
          <div className="w-6 h-6 border-2 border-brand-brown/20 border-t-brand-brown rounded-full animate-spin" />
        </div>
      )}
      <Image
        {...props}
        src={hasError ? fallbackSrc : imgSrc}
        alt={alt || ""}
        onLoadingComplete={() => setIsLoading(false)}
        onError={(e) => {
          // console.error(`SafeImage failed to load: ${imgSrc}`, e);
          if (retryCount < 3) { // Reduced retries for faster fallback
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              const connector = imgSrc.toString().includes('?') ? '&' : '?';
              setImgSrc(`${imgSrc}${connector}retry=${retryCount + 1}&t=${Date.now()}`);
            }, 1000);
          } else if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
            setIsLoading(false);
          }
        }}
        unoptimized={true} // Force unoptimized for local files/VPS
      />
    </div>
  );
};

export default SafeImage;
