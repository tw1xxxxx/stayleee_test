"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductSkeleton from "../components/ProductSkeleton";
import FadeIn from "../components/FadeIn";
import MenuOverlay from "../components/MenuOverlay";
import SafeImage from "@/app/components/SafeImage";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { useCart } from "../context/CartContext";

interface ApiProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  filterIds?: string[];
  tags?: string[];
  details?: {
    article?: string;
  };
}

interface ApiFilter {
  id: string;
  name: string;
  slug: string;
}

function CatalogContent() {
  const { items } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeFilters = searchParams.get("filters")?.split(",") || ["all"];
  
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 80, damping: 20, mass: 1 });

  // Viscous Bar Transforms
  const width = useTransform(smoothScrollY, [0, 120], ["100%", "92%"]);
  const borderRadius = useTransform(smoothScrollY, [0, 120], ["0px", "999px"]);
  const y = useTransform(smoothScrollY, [0, 100, 180], [-100, -20, 16]);
  const backgroundColor = useTransform(smoothScrollY, [0, 80, 180], [
    "rgba(28, 25, 23, 0)",
    "rgba(28, 25, 23, 0.4)",
    "rgba(28, 25, 23, 0.85)",
  ]);
  const backdropFilter = useTransform(smoothScrollY, [0, 80, 180], ["blur(0px)", "blur(2px)", "blur(8px)"]);
  const boxShadow = useTransform(smoothScrollY, [0, 100, 180], [
    "0 0 0 rgba(0,0,0,0)",
    "0 4px 10px rgba(0, 0, 0, 0.1)",
    "0 10px 30px rgba(0, 0, 0, 0.45)",
  ]);
  const padding = useTransform(smoothScrollY, [0, 180], ["1rem 1.5rem", "0.6rem 1.25rem"]);
  const opacity = useTransform(smoothScrollY, [0, 80, 160], [0, 0, 1]);

  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get("search") || "";
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [filters, setFilters] = useState<ApiFilter[]>([]);

  // Sync search query to URL with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentSearchInUrl = params.get("search") || "";
      
      if (searchQuery === currentSearchInUrl) return;

      if (searchQuery) {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const [productsRes, filtersRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/filters", { cache: "no-store" })
        ]);
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data);
        }
        if (filtersRes.ok) {
          const data = await filtersRes.json();
          setFilters(data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle body scroll lock when filter is open
  useEffect(() => {
    if (isFilterOpen || isMenuOpen) {
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
  }, [isFilterOpen, isMenuOpen]);

  // Optimize filtering with memoization if list grows large
  // Current list is small so inline filter is fine
  const filterOptions = [{ id: "all", name: "Все", slug: "all" }, ...filters];
  const filterBySlug = new Map(filterOptions.map(filter => [filter.slug, filter]));
  const filterById = new Map(filters.map(filter => [filter.id, filter]));

  const filteredProducts = products.filter((product) => {
    const isAll = activeFilters.includes("all");
    const productFilterSlugs = (product.filterIds || [])
      .map(filterId => filterById.get(filterId)?.slug)
      .filter((slug): slug is string => Boolean(slug));
    const matchesFilter = isAll || productFilterSlugs.some(slug => activeFilters.includes(slug));
    
    const searchLower = searchQuery.toLowerCase();
    const matchesName = product.name.toLowerCase().includes(searchLower);
    const matchesArticle = product.details?.article?.toLowerCase().includes(searchLower);
    const matchesTags = product.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    
    const matchesSearch = matchesName || matchesArticle || matchesTags;
    
    return matchesFilter && matchesSearch;
  });

  // Use simple image optimization
  // Ensure images are sized correctly in grid
  
  const updateFilters = (newFilters: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    const isDefaultFilter = newFilters.length === 1 && newFilters[0] === "all";
    
    if (!isDefaultFilter && newFilters.length > 0) {
      params.set("filters", newFilters.join(","));
    } else {
      params.delete("filters");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleFilter = (filter: string) => {
    if (filter === "all") {
      updateFilters(["all"]);
      return;
    }

    let newFilters = [...activeFilters];
    
    if (newFilters.includes("all")) {
      newFilters = [];
    }

    if (newFilters.includes(filter)) {
      newFilters = newFilters.filter(f => f !== filter);
    } else {
      newFilters.push(filter);
    }

    const specificFilters = filterOptions.filter(f => f.slug !== "all");
    const areAllSelected = specificFilters.every(f => newFilters.includes(f.slug));
    
    if (areAllSelected) {
      newFilters = ["all"];
    }

    if (newFilters.length === 0) {
      newFilters = ["all"];
    }

    updateFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-brand-beige font-sans pb-20 relative text-brand-brown">
      {/* Viscous Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center pointer-events-none">
        <motion.div
          style={{
            width,
            borderRadius,
            y,
            backgroundColor,
            backdropFilter,
            boxShadow,
            padding,
            opacity,
            maxWidth: "1400px"
          }}
          className="flex items-center gap-4 text-brand-beige pointer-events-auto"
        >
          {/* Burger */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 text-brand-beige placeholder-brand-beige/30 pl-10 pr-4 py-2 rounded-full focus:outline-none focus:bg-white/20 focus:ring-1 focus:ring-brand-beige/20 transition-all text-sm border border-white/5"
            />
          </div>

          {/* Filters */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center shrink-0"
            aria-label="Фильтры"
          >
            <div className="relative w-9 h-9 brightness-0 invert">
              <Image 
                src="/images/filter-icon.png" 
                alt="Фильтры" 
                fill
                className="object-contain"
              />
            </div>
          </button>

          {/* Cart */}
          <Link href="/cart" prefetch={false} className="p-2 hover:bg-white/10 rounded-full transition-colors relative shrink-0">
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
        </motion.div>
      </div>

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
          Каталог
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

      {/* Search & Filters Button */}
      <div className="px-4 py-4 max-w-[1400px] mx-auto">
        <div className="flex gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 text-brand-brown">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Поиск по названию, артикулу или тегу"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-brand-brown placeholder-brand-brown/50 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-brown/20 transition-all"
            />
          </div>

          {/* Filter Button */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="bg-white text-brand-brown p-2 rounded-xl hover:bg-white/80 transition-colors flex items-center justify-center border border-brand-brown/5"
            aria-label="Фильтры"
          >
            <div className="relative w-7 h-7">
              <Image 
                src="/images/filter-icon.png" 
                alt="Фильтры" 
                fill
                className="object-contain opacity-90"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Active Filter Display */}
      <AnimatePresence>
        {!activeFilters.includes("all") && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-4 overflow-hidden max-w-[1400px] mx-auto"
          >
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <div key={filter} className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 bg-brand-brown text-white rounded-full shadow-sm transition-all hover:shadow-md">
                  <span className="text-sm font-medium">{filterBySlug.get(filter)?.name || filter}</span>
                  <button
                    onClick={() => toggleFilter(filter)}
                    className="w-5 h-5 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Убрать фильтр ${filterBySlug.get(filter)?.name || filter}`}
                  >
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9" stroke="#2B1A15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 3L9 9" stroke="#2B1A15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      <motion.div layout className="px-4 max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 10 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="h-full">
              <ProductSkeleton />
            </div>
          ))
        ) : (
          // Real Products
          filteredProducts.map((product) => (
            <FadeIn key={product.id} layout delay={0.05} className="h-full">
              <Link href={`/product/${product.id}`} prefetch={false} className="flex flex-col gap-2 group cursor-pointer h-full">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
                  <SafeImage
                    src={product.images?.[0] || product.image || "/images/catalog-product.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    quality={90}
                  />
                </div>
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-medium text-xs md:text-sm lg:text-base leading-tight group-hover:text-brand-brown/70 transition-colors uppercase tracking-wider">
                      {product.name}
                    </h3>
                  </div>
                  <p className="font-bold text-sm md:text-base lg:text-lg mt-1">{product.price.toLocaleString()} ₽</p>
                </div>
              </Link>
            </FadeIn>
          ))
        )}
      </motion.div>

      {/* Filter Modal (Bottom Sheet) */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-brown/20 backdrop-blur-sm"
              onClick={() => setIsFilterOpen(false)}
            ></motion.div>
            
            {/* Content */}
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-brand-beige rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-brand-brown will-change-transform"
              style={{ transform: "translate3d(0,0,0)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Фильтры</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-brand-brown/10 rounded-full transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-brand-brown/80">Фильтры</h3>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => toggleFilter(filter.slug)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          activeFilters.includes(filter.slug)
                            ? "bg-brand-brown text-white border-brand-brown"
                            : "bg-white text-gray-600 border-gray-200 hover:border-brand-brown hover:text-brand-brown"
                        }`}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full bg-brand-brown text-white font-bold py-4 rounded-2xl hover:bg-[#3E2822] transition-colors"
                >
                  Показать результаты
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Mobile Menu Overlay */}
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-beige" />}>
      <CatalogContent />
    </Suspense>
  );
}
