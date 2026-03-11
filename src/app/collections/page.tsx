"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import FadeIn from "../components/FadeIn";
import MenuOverlay from "../components/MenuOverlay";
import { useCart } from "../context/CartContext";
import { formatPrice } from "@/lib/utils";
import { AnimatePresence, motion, useInView } from "framer-motion";
import SafeImage from "@/app/components/SafeImage";



interface ApiCollectionSection {
  title: string;
  productIds: string[];
}

interface ApiCollection {
  id: string;
  title: string;
  description: string;
  sections: ApiCollectionSection[];
  image?: string;
}

interface FormattedProduct {
  id: string;
  title: string;
  price: string;
  image: string;
  description?: string;
}

interface FormattedSection {
  title: string;
  products: FormattedProduct[];
}

interface FormattedCollection {
  id: string;
  name: string;
  description: string;
  sections: FormattedSection[];
  image?: string;
}

export default function CollectionsPage() {
  const { items } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [collections, setCollections] = useState<FormattedCollection[]>([]);

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  useEffect(() => {
    if (collections.length > 0 && !activeCollectionId) {
      setActiveCollectionId(collections[0].id);
    }
  }, [collections, activeCollectionId]);

  const activeCollection = useMemo(() => 
    collections.find(c => c.id === activeCollectionId) || collections[0],
    [collections, activeCollectionId]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, productsRes] = await Promise.all([
          fetch('/api/collections', { cache: 'no-store' }),
          fetch('/api/products', { cache: 'no-store' })
        ]);
        
        if (collectionsRes.ok && productsRes.ok) {
          const collectionsData = (await collectionsRes.json()) as ApiCollection[];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const productsData = (await productsRes.json()) as any[]; // Use any to access images
          
          const formattedCollections = collectionsData.map((c) => ({
            id: c.id,
            name: c.title,
            description: c.description,
            image: c.image,
            sections: c.sections.map((s) => ({
              title: s.title,
              products: s.productIds.map((pid: string) => {
                const p = productsData.find((prod) => String(prod.id) === String(pid));
                const image = p?.collectionImage || p?.images?.[0] || p?.image || "/images/placeholder.jpg";
                return p ? {
                  id: p.id,
                  title: p.name,
                  price: `${formatPrice(p.price)} ₽`,
                  image,
                  description: p.description
                } as FormattedProduct : null;
              }).filter((item): item is FormattedProduct => Boolean(item))
            }))
          }));
          
          setCollections(formattedCollections);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen font-sans pb-20 relative text-brand-brown">
      {/* Global Fixed Background for Desktop */}
      <div className="fixed inset-0 z-0 hidden md:block bg-brand-beige overflow-hidden">
        <AnimatePresence mode="popLayout">
          {activeCollection && (
            <motion.div
              key={activeCollection.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {activeCollection.id === 'ridge' ? (
                <div className="flex w-full h-full">
                  {/* Left Side: Custom Image (Stretched to push right side) */}
                  <div className="relative flex-grow h-full">
                    <img 
                      src="/IMG_9923.jpg" 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/65" />
                  </div>
                  {/* Right Side: Collection Image (Fixed ratio to stay on edge) */}
                  <div className="relative w-[45%] h-full">
                    <img 
                      src={activeCollection.image} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/45" />
                  </div>
                </div>
              ) : activeCollection.id === 'semis' ? (
                <div className="flex w-full h-full">
                  {/* Left Side: Custom Image DSC07776.jpg */}
                  <div className="relative flex-grow h-full">
                    <img 
                      src="/DSC07776.jpg" 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/45" />
                  </div>
                  {/* Right Side: Collection Image */}
                  <div className="relative w-[45%] h-full">
                    <img 
                      src={activeCollection.image} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/45" />
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {activeCollection.image && (
                    <>
                      <img 
                        src={activeCollection.image} 
                        alt="" 
                        className="w-full h-full object-contain object-right" 
                      />
                      {/* Gradient transition from beige to image */}
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-beige via-brand-beige/20 to-transparent pointer-events-none" />
                      {/* Dark Overlay for readability */}
                      <div className="absolute inset-0 bg-black/45" />
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="relative z-20 bg-brand-beige border-b border-brand-brown/10 px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="text-xl font-bold tracking-widest absolute left-1/2 -translate-x-1/2 uppercase">
          Коллекции
        </h1>

        <div className="flex items-center gap-2">
          <Link href="/cart" prefetch={false} className="p-2 hover:bg-white/50 rounded-full transition-colors relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1H4L6.68 14.39C6.77144 14.8504 7.02191 15.264 7.38755 15.5583C7.75318 15.8526 8.2107 16.009 8.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <AnimatePresence>
              {items.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-0 bg-brand-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                >
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          <Link href="/profile" prefetch={false} className="p-0.5 -mr-1.5 hover:bg-white/50 rounded-full transition-colors">
            <div className="w-12 h-12 relative flex items-center justify-center">
              <Image 
                src="/images/profile-icon.png" 
                alt="Профиль" 
                width={44}
                height={44}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>
      </header>

      {/* Collections Content */}
      <div className="flex flex-col relative z-10">
        {isLoading ? (
          <div className="flex justify-center py-20 px-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown"></div>
          </div>
        ) : (
          collections.map((collection) => (
            <CollectionSection 
              key={collection.id} 
              collection={collection} 
              onInView={() => setActiveCollectionId(collection.id)}
            />
          ))
        )}
      </div>
      {/* Mobile Menu Overlay */}
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}

// Separate component for each collection section to track view state
const CollectionSection = ({ 
  collection, 
  onInView 
}: { 
  collection: FormattedCollection; 
  onInView: () => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    margin: "-50% 0px -50% 0px" // Trigger when section is in the middle of viewport
  });

  useEffect(() => {
    if (isInView) {
      onInView();
    }
  }, [isInView, onInView]);

  return (
    <div ref={ref} className="relative min-h-screen">
      {/* Background for Mobile Only (Sticky/Clip-path technique) - Now Hidden as requested */}
      <div 
        className="absolute inset-0 z-0 hidden"
        style={{ clipPath: 'inset(0 0 0 0)' }}
      >
        {collection.image ? (
          <div className="sticky top-0 h-screen w-full">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <SafeImage
                src={collection.image}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                quality={100}
                priority
              />
            </div>
            <div className="absolute inset-0 bg-black/55" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-brand-beige" />
        )}
      </div>

      {/* Collection Content - Scrolling over the background */}
      <div className="relative z-10 px-4 py-12 md:py-32 max-w-[1400px] mx-auto w-full">
        {/* Collection Header */}
        <FadeIn direction="left" className="flex flex-col gap-4 md:gap-8 mb-12 md:mb-24">
          <h2 className="text-3xl md:text-6xl lg:text-8xl font-light tracking-[0.2em] uppercase text-brand-brown md:text-white md:drop-shadow-xl">
            {collection.name}
          </h2>
          <div className="pl-6 border-l-4 border-brand-red">
            <p className="text-base md:text-xl lg:text-2xl text-brand-brown/80 md:text-white/90 leading-relaxed max-w-4xl italic font-medium md:drop-shadow-md">
              {collection.description}
            </p>
          </div>
        </FadeIn>

        {/* Collection Sections */}
        <div className="flex flex-col gap-16 md:gap-32">
          {collection.sections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-8 md:gap-16">
              <FadeIn direction="up" delay={0.1} className="flex items-center gap-6">
                <h3 className="text-lg md:text-3xl lg:text-4xl font-light tracking-[0.15em] text-brand-brown md:text-white uppercase md:bg-transparent bg-brand-beige/40 px-4 py-2 rounded-sm md:drop-shadow-md">
                  {section.title}
                </h3>
                <div className="h-px bg-brand-brown/20 md:bg-white/30 flex-grow"></div>
              </FadeIn>
              
              <div className="flex flex-col gap-12 md:gap-24">
                {section.products.map((product, pIdx) => (
                  <FadeIn key={product.id} delay={pIdx * 0.05}>
                    <Link href={`/product/${product.id}`} prefetch={false} className="flex flex-col md:flex-row gap-8 md:gap-16 group cursor-pointer">
                      {/* Image - Left on Desktop */}
                      <div className="relative aspect-[3/4] md:aspect-[4/5] w-full md:w-[400px] flex-shrink-0 overflow-hidden rounded-sm shadow-lg group-hover:shadow-2xl transition-all duration-500 bg-white/20 backdrop-blur-[2px]">
                        <SafeImage
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          sizes="(max-width: 768px) 100vw, 400px"
                          quality={90}
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      {/* Content - Right on Desktop */}
                      <div className="flex flex-col justify-center gap-4 md:gap-6 flex-grow">
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-brand-brown md:text-white uppercase tracking-widest leading-tight transition-colors font-serif md:drop-shadow-md">
                          {product.title}
                        </h3>
                        {product.description && (
                          <p className="text-base md:text-lg lg:text-xl text-brand-brown/70 md:text-white/80 font-light leading-relaxed max-w-2xl md:drop-shadow-sm">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-4 md:mt-8">
                          <span className="inline-block px-8 py-3 border border-brand-brown/30 text-brand-brown md:text-white/90 md:border-white/30 uppercase tracking-widest text-sm hover:bg-brand-brown hover:text-white transition-colors duration-300">
                            Подробнее
                          </span>
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Spacer */}
      <div className="h-24 md:h-48" />
    </div>
  );
};
