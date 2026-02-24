"use client";

import Link from "next/link";
import Image from "next/image";
import FadeIn from "../components/FadeIn";
import { useState, useEffect } from "react";
import MenuOverlay from "../components/MenuOverlay";
import { useCart } from "../context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
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
                const image = p?.images?.[0] || p?.image || "/images/placeholder.jpg";
                return p ? {
                  id: p.id,
                  title: p.name,
                  price: `${Number(p.price).toLocaleString()} ₽`,
                  image
                } : null;
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
    <div className="min-h-screen bg-brand-beige font-sans pb-20 relative text-brand-brown">
      {/* Header */}
      <header className="relative bg-brand-beige border-b border-brand-brown/10 px-4 py-4 flex items-center justify-between">
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
          
          <Link href="/profile" prefetch={false} className="p-2 -mr-2 hover:bg-white/50 rounded-full transition-colors">
            <div className="w-8 h-8 relative flex items-center justify-center -translate-y-1">
              <Image 
                src="/images/profile-chef-happy-v2.png" 
                alt="Профиль" 
                width={25}
                height={25}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>
      </header>

      {/* Collections Content */}
      <div className="px-4 py-8 flex flex-col gap-12 md:gap-20 max-w-[1400px] mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown"></div>
          </div>
        ) : (
          collections.map((collection) => (
            <div key={collection.id} className="flex flex-col gap-6 md:gap-10">
              {/* Collection Header */}
              <FadeIn direction="left" className="flex flex-col gap-3 md:gap-6">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide uppercase text-brand-brown">{collection.name}</h2>
                {collection.image && (
                  <div className="relative w-full aspect-[21/9] md:aspect-[4/1] rounded-2xl overflow-hidden shadow-sm">
                    <SafeImage
                      src={collection.image}
                      alt={collection.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
                      quality={90}
                      priority
                    />
                  </div>
                )}
                <div className="pl-4 border-l-2 border-brand-red/60">
                  <p className="text-sm md:text-base lg:text-lg text-brand-brown/80 leading-relaxed max-w-2xl italic font-light">
                    {collection.description}
                  </p>
                </div>
              </FadeIn>

              {/* Collection Sections */}
              <div className="flex flex-col gap-8 md:gap-12">
                {collection.sections.map((section, idx) => (
                  <div key={idx} className="flex flex-col gap-4">
                    <FadeIn direction="up" delay={0.1} className="flex items-center gap-3">
                      <h3 className="text-base md:text-lg lg:text-xl font-normal tracking-wide text-brand-brown/90">{section.title}</h3>
                      <div className="h-px bg-brand-brown/10 flex-grow"></div>
                    </FadeIn>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 md:gap-x-6 lg:gap-x-8 gap-y-8 md:gap-y-10">
                      {section.products.map((product, pIdx) => (
                        <FadeIn key={product.id} delay={pIdx * 0.05}>
                          <Link href={`/product/${product.id}`} prefetch={false} className="flex flex-col gap-3 group cursor-pointer h-full">
                            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-gray-100 shadow-sm">
                              <SafeImage
                                src={product.image}
                                alt={product.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                quality={90}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <h3 className="text-[10px] md:text-xs lg:text-sm font-medium text-brand-brown uppercase tracking-wider leading-tight group-hover:text-brand-brown/70 transition-colors">
                                {product.title}
                              </h3>
                              <p className="text-sm md:text-base lg:text-lg font-bold text-brand-brown mt-1">
                                {product.price}
                              </p>
                            </div>
                          </Link>
                        </FadeIn>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Mobile Menu Overlay */}
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
