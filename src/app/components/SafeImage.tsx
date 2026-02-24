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
  const [imgSrc, setImgSrc] = useState<string | import("next/dist/shared/lib/get-img-props").StaticImport>(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt || ""}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
    />
  );
};

export default SafeImage;
