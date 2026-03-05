"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends ImageProps {
  fallbackSrc?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  fallbackSrc = "/images/catalog-product.jpg", 
  alt, 
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | any>(src || fallbackSrc);

  useEffect(() => {
    setHasError(false);
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt || ""}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
};

export default SafeImage;
