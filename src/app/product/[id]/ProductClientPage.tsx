"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ContactsSection from "../../components/ContactsSection";
import FadeIn from "../../components/FadeIn";
import ElasticImage from "../../components/ElasticImage";
import SafeImage from "@/app/components/SafeImage";
import ProductGallery, { ProductGalleryHandle } from "../../components/ProductGallery";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "@/lib/utils";

const DEFAULT_PRODUCT = {
  id: "pants-female",
  title: "Брюки (женские)",
  price: "5 200 ₽",
  description: "Для комфортной работы, не сковывающий движений",
  images: [
    "/images/catalog-product.jpg",
    "/images/catalog-product.jpg",
    "/images/catalog-product.jpg",
    "/images/catalog-product.jpg",
  ],
  sizes: ["S", "M", "L", "XL"],
  colors: [
    { name: "black", value: "#000000", label: "Черный" },
    { name: "beige", value: "#F5F5DC", label: "Бежевый" }
  ],
  details: {
    material: "54% хлопок, 44% полиэстер, 2% лайкра",
    characteristics: "Брюки регулируются шнурками для лучшей посадки. Наличие карманов обеспечивает удобное хранение мелочей. Мы специально разделили модели МУЖСКИЕ и ЖЕНСКИЕ учитывая особенности строения фигуры гастроэнтузиастов.",
    article: "123456"
  }
};

export interface ApiProductColor {
  name: string;
  value: string;
  label: string;
  images?: string[];
  sizes?: string[];
}

export interface ApiProductDetails {
  material?: string;
  characteristics?: string;
  article?: string;
}

export interface ApiProductVariant {
  id: string;
  size?: string;
  colorName?: string;
  price?: number;
  sku?: string;
  images?: string[];
}

export interface ApiProduct {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  filterIds?: string[];
  images?: string[];
  image?: string;
  sizes?: string[];
  colors?: ApiProductColor[];
  details?: ApiProductDetails;
  variants?: ApiProductVariant[];
  gender?: 'male' | 'female' | 'unisex';
}

interface ProductClientPageProps {
  product: ApiProduct;
  relatedProducts: ApiProduct[];
}

export default function ProductClientPage({ product: currentProduct, relatedProducts }: ProductClientPageProps) {
  const router = useRouter();
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSizeOverride, setSelectedSizeOverride] = useState<string | null>(null);
  const [selectedColorOverride, setSelectedColorOverride] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get("color");
    }
    return null;
  });
  const [visibleRelatedCount, setVisibleRelatedCount] = useState(5);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addEmbroidery, setAddEmbroidery] = useState(false);
  const { addToCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();

  // Read URL on mount
  useEffect(() => {
    // Moved to initial state
  }, []);

  const fallbackPrice = parseInt(DEFAULT_PRODUCT.price.replace(/\s/g, "").replace(/\D/g, ""), 10);
  const productPriceValue = currentProduct?.price ?? fallbackPrice;
  // Use productPriceValue to avoid unused variable warning if necessary, or just use it in calculations
  // Currently used in handleAddToCart logic indirectly via fallbackPrice check, but let's make it explicit if needed.
  // Actually, let's just use it in the PRODUCT object definition to be cleaner.
  
  const productImages = (currentProduct?.images && currentProduct.images.length > 0)
    ? currentProduct.images
    : (currentProduct?.image ? [currentProduct.image] : DEFAULT_PRODUCT.images);
  const productSizes = currentProduct?.sizes && currentProduct.sizes.length > 0
    ? currentProduct.sizes
    : DEFAULT_PRODUCT.sizes;
  const productColors = currentProduct?.colors && currentProduct.colors.length > 0
    ? currentProduct.colors
    : (currentProduct && currentProduct.colors ? [] : (DEFAULT_PRODUCT.colors as unknown as ApiProductColor[]));

  const isApron = (currentProduct?.category || "").toLowerCase() === "фартуки";

  const selectedSize = selectedSizeOverride && productSizes.includes(selectedSizeOverride)
    ? selectedSizeOverride
    : (isApron ? "" : (productSizes[0] || "S"));
  const selectedColorObj = selectedColorOverride
    ? productColors.find(color => 
        (color.name && color.name.toLowerCase() === selectedColorOverride.toLowerCase()) || 
        (color.label && color.label.toLowerCase() === selectedColorOverride.toLowerCase())
      )
    : productColors[0];
  const selectedColor = selectedColorObj?.name || "";

  const selectedVariant = currentProduct?.variants?.find(v => 
    v.size === selectedSize && v.colorName === selectedColor
  );

  const selectedImages = selectedColorObj?.images && selectedColorObj.images.length > 0
    ? selectedColorObj.images
    : (selectedVariant?.images && selectedVariant.images.length > 0 ? selectedVariant.images : productImages);

  const selectedSizes = selectedColorObj?.sizes && selectedColorObj.sizes.length > 0
    ? selectedColorObj.sizes
    : productSizes;

  const PRODUCT = {
    id: currentProduct?.id || String(DEFAULT_PRODUCT.id),
    title: currentProduct?.name || DEFAULT_PRODUCT.title,
    price: `${formatPrice(selectedVariant?.price ?? productPriceValue)} ₽`,
    description: currentProduct?.description || DEFAULT_PRODUCT.description,
    images: selectedImages,
    sizes: selectedSizes,
    colors: productColors,
    details: {
      material: currentProduct?.details?.material || DEFAULT_PRODUCT.details.material,
      characteristics: currentProduct?.details?.characteristics || DEFAULT_PRODUCT.details.characteristics,
      article: selectedVariant?.sku || currentProduct?.details?.article || DEFAULT_PRODUCT.details.article
    }
  };

  const currentColorName = selectedColorObj ? (selectedColorObj.label || selectedColorObj.name) : selectedColor;
  const isKitel = PRODUCT.title.toLowerCase().includes("китель");
  // isApron defined above

  const quantity = getItemQuantity(PRODUCT.id, selectedSize, currentColorName, isKitel ? addEmbroidery : false);
  const cartId = `${PRODUCT.id}-${selectedSize}-${currentColorName}${isKitel && addEmbroidery ? '-embroidery' : ''}`;

  const galleryRef = useRef<ProductGalleryHandle>(null);

  const visibleRelatedProducts = relatedProducts.slice(0, visibleRelatedCount);
  const hasMoreRelated = visibleRelatedCount < relatedProducts.length;

  const handleLoadMore = () => {
    setVisibleRelatedCount((prev) => prev + 5);
  };

  // Sync URL with selected color
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (selectedColor) {
        if (url.searchParams.get("color") !== selectedColor) {
          url.searchParams.set("color", selectedColor);
          window.history.replaceState({}, "", url.toString());
        }
      } else {
        if (url.searchParams.has("color")) {
          url.searchParams.delete("color");
          window.history.replaceState({}, "", url.toString());
        }
      }
    }
  }, [selectedColor]);

  // Reset active image when size/color changes
  const [prevDeps, setPrevDeps] = useState({ size: selectedSize, color: selectedColor });
  if (prevDeps.size !== selectedSize || prevDeps.color !== selectedColor) {
    setPrevDeps({ size: selectedSize, color: selectedColor });
    setActiveImage(0);
  }

  // Lock body scroll when size guide is open
  useEffect(() => {
    if (isSizeGuideOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isSizeGuideOpen]);

  const handleAddToCart = () => {
    addToCart({
      id: PRODUCT.id,
      title: PRODUCT.title,
      price: selectedVariant?.price ?? productPriceValue,
      size: selectedSize,
      color: currentColorName, 
      image: PRODUCT.images[0],
      embroidery: isKitel ? addEmbroidery : false
    });
  };

  const incrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(cartId, quantity + 1);
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(cartId, quantity - 1);
    } else {
      removeFromCart(cartId);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige font-sans text-brand-brown pb-20 relative overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto lg:px-8 lg:pt-8 relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:pl-32">
          {/* Left Column: Images */}
          <div className="w-full lg:w-[48%] xl:w-[50%] lg:sticky lg:top-8 lg:h-fit relative">
            {/* Back Button - Minimalist & Large - Positioned relative to image column on desktop */}
            <button 
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/catalog');
                }
              }}
              className="hidden lg:flex absolute -left-[6rem] top-5 z-50 items-center justify-center text-brand-brown/40 hover:text-brand-brown transition-all hover:scale-110 cursor-pointer group"
              aria-label="Назад"
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:-translate-x-1 transition-transform">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
 
             {/* Mobile Back Button */}
             <button 
               onClick={() => {
                 if (window.history.length > 1) {
                   router.back();
                 } else {
                   router.push('/catalog');
                 }
               }}
               className="lg:hidden absolute left-5 top-5 z-50 flex items-center justify-center text-brand-brown/50 hover:text-brand-brown transition-all hover:scale-110 cursor-pointer group"
               aria-label="Назад"
             >
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </button>

            {/* Image Gallery */}
            <div className="relative w-full aspect-[3/4] md:aspect-square lg:aspect-[4/5] bg-gray-100 overflow-hidden group rounded-none lg:rounded-2xl shadow-sm">
              <ProductGallery
                ref={galleryRef}
                activeIndex={activeImage}
                onChange={setActiveImage}
                className="h-full"
              >
                {PRODUCT.images.map((src, index) => (
                  <ElasticImage
                    key={index}
                    src={src}
                    alt={`${PRODUCT.title} - ${index + 1}`}
                    className="object-cover"
                    priority={index === 0}
                    enableSnapBack={true}
                  />
                ))}
              </ProductGallery>

              {/* Custom Pagination Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full z-10" onClick={(e) => e.stopPropagation()}>
                {PRODUCT.images.map((_, index) => (
                  <button 
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      galleryRef.current?.scrollTo(index);
                    }}
                    className={`transition-all duration-300 rounded-full bg-white ${
                      activeImage === index ? "w-8 h-2.5" : "w-2.5 h-2.5 opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Additional Thumbnails */}
            <FadeIn delay={0.1} className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-5 gap-2 px-4 lg:px-0 mt-4">
              {PRODUCT.images.map((src, index) => (
                <button 
                  key={index} 
                  onClick={() => galleryRef.current?.scrollTo(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 border-2 ${
                    activeImage === index ? "border-brand-brown opacity-100" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                   <SafeImage
                      src={src}
                      alt={`Thumbnail ${index}`}
                      fill
                      className="object-cover"
                    />
                </button>
              ))}
            </FadeIn>
          </div>

          {/* Right Column: Info */}
          <div className="w-full lg:w-2/5 xl:w-[35%] px-4 lg:px-0">
            {/* Title & Price */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide mb-2 leading-tight">{PRODUCT.title}</h1>
              <p className="text-xl md:text-2xl font-bold text-brand-brown mb-4">{PRODUCT.price}</p>
              <div className="h-px bg-brand-brown/10 w-full mb-4" />
              <p className="text-sm md:text-base text-brand-brown/70 leading-relaxed">{PRODUCT.description}</p>
            </div>

            {/* Selectors */}
            <div className="space-y-8 mb-10">
              {/* Size Selector */}
              {!isApron && (
                <div className="space-y-3">
                  <p className="font-bold text-sm uppercase tracking-wider text-brand-brown/80">Размер</p>
                  <div className="flex flex-wrap gap-3">
                    {PRODUCT.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSizeOverride(size)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold relative transition-all ${
                          selectedSize === size ? "text-white" : "text-brand-brown hover:bg-white"
                        }`}
                      >
                        {selectedSize === size ? (
                          <motion.div
                            layoutId="size-indicator"
                            className="absolute inset-0 bg-brand-brown shadow-md rounded-xl"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        ) : (
                          <div className="absolute inset-0 border border-brand-brown/20 rounded-xl" />
                        )}
                        <span className="relative z-10">{size}</span>
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-brand-brown/60 underline underline-offset-4 text-xs cursor-pointer mt-2 block hover:text-brand-brown transition-colors font-sans uppercase tracking-widest"
                  >
                    Размерная сетка
                  </button>
                </div>
              )}

              {/* Color Selector */}
              {PRODUCT.colors.length > 0 && (
                <div className="space-y-3">
                  <p className="font-bold text-sm uppercase tracking-wider text-brand-brown/80">
                    Цвет: <span className="text-brand-brown font-normal lowercase">{currentColorName}</span>
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {PRODUCT.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColorOverride(color.name)}
                        className="group relative flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center relative p-1 transition-transform group-hover:scale-105">
                          {selectedColor === color.name && (
                            <motion.div
                              layoutId="color-indicator"
                              className="absolute inset-0 border-2 border-brand-brown rounded-full"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <div 
                            className={`w-full h-full rounded-full border border-black/5 shadow-inner`}
                            style={{ backgroundColor: color.value }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Embroidery Option for Kitel */}
              {isKitel && (
                <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-brand-brown/10 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={addEmbroidery}
                        onChange={(e) => setAddEmbroidery(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-6 h-6 border-2 border-brand-brown/30 rounded-md transition-all peer-checked:bg-brand-brown peer-checked:border-brand-brown group-hover:border-brand-brown/50"></div>
                      <svg 
                        className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-brand-brown select-none">Добавить вышивку?</span>
                  </label>
                  <p className="text-[10px] md:text-xs text-brand-brown/60 leading-tight italic pl-9">
                    * выполняется после 100% оплаты — 3-4 рабочих дня
                  </p>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="mb-12 min-h-[64px] relative">
              <AnimatePresence mode="popLayout">
                {quantity === 0 ? (
                  <motion.button
                    key="add-to-cart"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    whileHover={{ scale: 1.01, backgroundColor: "#C4B3A3" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full py-5 bg-[#D4C3B3] text-brand-brown font-bold text-lg rounded-xl transition-all uppercase tracking-widest shadow-sm absolute inset-0"
                  >
                    Добавить в корзину
                  </motion.button>
                ) : (
                  <motion.div 
                    key="quantity-controls"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-4 w-full relative z-10"
                  >
                    {/* Quantity Selector */}
                    <div className="flex-1 py-3 px-6 bg-white flex items-center justify-between rounded-xl shadow-sm border border-brand-brown/10 h-[64px]">
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={decrementQuantity}
                        className="text-2xl font-light w-10 h-10 flex items-center justify-center hover:bg-brand-beige rounded-full transition-colors"
                      >
                        −
                      </motion.button>
                      <motion.span 
                        key={quantity}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xl font-bold"
                      >
                        {quantity}
                      </motion.span>
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={incrementQuantity}
                        className="text-2xl font-light w-10 h-10 flex items-center justify-center hover:bg-brand-beige rounded-full transition-colors"
                      >
                        +
                      </motion.button>
                    </div>
                    
                    {/* In Cart Button */}
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: "#3E2D26" }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-4 bg-[#2B1A15] text-white flex items-center justify-center rounded-xl text-lg font-bold uppercase tracking-wider transition-all shadow-md"
                      onClick={() => router.push('/cart')}
                    >
                      В корзину
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Product Details Table */}
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 space-y-5 mb-10 text-sm border border-brand-brown/5 shadow-sm">
              <div className="flex flex-col gap-1 border-b border-brand-brown/10 pb-4">
                <span className="font-bold uppercase tracking-wider text-brand-brown/60 text-[10px]">Материал</span>
                <span className="text-brand-brown text-base">{PRODUCT.details.material}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-brand-brown/10 pb-4">
                <span className="font-bold uppercase tracking-wider text-brand-brown/60 text-[10px]">Характеристики</span>
                <span className="text-brand-brown leading-relaxed text-sm">{PRODUCT.details.characteristics}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold uppercase tracking-wider text-brand-brown/60 text-[10px]">Артикул</span>
                <span className="text-brand-brown font-mono text-base">{PRODUCT.details.article}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20 px-4 lg:px-0">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-brand-brown/80">Может понравиться</h2>
            <div className="h-px bg-brand-brown/10 flex-grow mx-8 hidden md:block"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {visibleRelatedProducts.map((product, index) => (
              <FadeIn key={product.id} delay={index * 0.05}>
                <Link href={`/product/${product.id}`} prefetch={false} className="flex flex-col gap-3 group cursor-pointer h-full">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-200 shadow-sm">
                    <SafeImage
                      src={product.images?.[0] || product.image || "/images/catalog-product.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[10px] md:text-xs lg:text-sm font-medium text-brand-brown uppercase tracking-wider leading-tight group-hover:text-brand-brown/70 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm md:text-base lg:text-lg font-bold text-brand-brown">
                      {formatPrice(product.price)} ₽
                    </p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
          
          {hasMoreRelated && (
            <div className="mt-12 flex justify-center">
               <motion.button 
                 whileHover={{ scale: 1.02, backgroundColor: "#3E2D26" }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleLoadMore}
                 className="bg-[#2B1A15] text-white px-12 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:shadow-lg transition-all"
                 >
                 Показать еще
               </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center overscroll-contain touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            
            <div className="w-full h-full p-4 md:p-10 flex items-center justify-center overflow-hidden">
               <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                 <ElasticImage
                   src="/IMG_2429.PNG"
                   alt="Размерная сетка"
                   objectFit="contain"
                   enableSnapBack={true}
                   className="w-full h-full"
                   noBackground={true}
                 />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer without Map */}
      <ContactsSection showMap={false} />
    </div>
  );
}
