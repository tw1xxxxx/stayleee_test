"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import MenuOverlay from "../components/MenuOverlay";
import FadeIn from "../components/FadeIn";
import { motion } from "framer-motion";
import SafeImage from "@/app/components/SafeImage";

// Content data structure for search functionality
interface Project {
  id: string;
  type: 'portfolio' | 'promo';
  title?: string;
  image?: string;
  image2?: string;
  imageLayout?: 'single' | 'double';
  text?: string;
  order: number;
}

interface Promo {
  id: string;
  type: 'promo';
  text: string;
  title: string;
  icon: string;
}

type InterleavedItem = Project | Promo;

function isPromo(item: InterleavedItem): item is Promo {
  return item.type === 'promo';
}

const STAGES = [
  {
    id: 'concept',
    number: '01',
    title: 'Концепция',
    image: '/images/restaurants/IMG_2203.PNG',
    text: 'Мы обсуждаем Ваши идеи и создаём образ будущего изделия — его стиль, характер и настроение'
  },
  {
    id: 'construction',
    number: '02',
    title: 'Конструкция',
    image: '/images/restaurants/IMG_2204.PNG',
    text: 'Разрабатываем индивидуальную конструкцию с учётом особенностей фигуры для идеальной посадки'
  },
  {
    id: 'fabric',
    number: '03',
    title: 'Ткань',
    image: '/images/restaurants/IMG_2205.PNG',
    text: 'Подбираем материалы, которые подчеркнут концепцию и будут комфортны в носке'
  },
  {
    id: 'fitting',
    number: '04',
    title: 'Примерки\nи финал',
    image: '/images/restaurants/IMG_2206.PNG',
    text: 'На примерках оттачиваем детали и доводим изделие до совершенства. В результате Вы получаете уникальную вещь, созданную специально для Вас'
  }
];

const SPECIAL_OFFERS: any[] = [];

export default function RestaurantsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data.sort((a: Project, b: Project) => a.order - b.order));
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter items based on search query
  const filteredItems = projects.filter(item => {
    if (!searchQuery) return true;
    
    // Promos are hidden when searching
    if (item.type === 'promo') {
      return false;
    }
    
    // Portfolio items searched only by title
    if (item.type === 'portfolio' && item.title) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return false;
  });

  // Interleave Special Offers into Projects
  const interleavedItems: InterleavedItem[] = (() => {
    if (searchQuery) return filteredItems;
    
    const result: InterleavedItem[] = [];
    let offerIndex = 0;
    
    filteredItems.forEach((item, index) => {
      result.push(item);
      // Insert an offer every 2 projects, if available
      if ((index + 1) % 2 === 0 && offerIndex < SPECIAL_OFFERS.length) {
        result.push({
          id: `offer-${offerIndex}`,
          type: 'promo',
          text: SPECIAL_OFFERS[offerIndex].description,
          title: SPECIAL_OFFERS[offerIndex].title,
          icon: SPECIAL_OFFERS[offerIndex].icon
        });
        offerIndex++;
      }
    });
    
    // Add remaining offers at the end if any
    while (offerIndex < SPECIAL_OFFERS.length) {
      result.push({
        id: `offer-${offerIndex}`,
        type: 'promo',
        text: SPECIAL_OFFERS[offerIndex].description,
        title: SPECIAL_OFFERS[offerIndex].title,
        icon: SPECIAL_OFFERS[offerIndex].icon
      });
      offerIndex++;
    }
    
    return result;
  })();

  return (
    <div className="min-h-screen bg-brand-beige font-sans text-brand-brown pb-24">
      {/* Header - Matching Catalog Style */}
      <header className="relative bg-brand-beige border-b border-brand-brown/10 px-4 py-4 flex items-center justify-between max-w-[1400px] mx-auto w-full">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors relative z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <h1 className="text-lg md:text-xl font-bold tracking-[0.3em] absolute left-1/2 -translate-x-1/2 uppercase text-center w-full pointer-events-none">
          Для Ресторанов
        </h1>

        <div className="flex items-center gap-2 relative z-10">
          <Link href="/profile" prefetch={false} className="p-0.5 -mr-1.5 hover:bg-white/50 rounded-full transition-colors">
            <div className="w-12 h-12 relative flex items-center justify-center">
              <Image 
                src="/images/profile-icon.png" 
                alt="Профиль" 
                width={44}
                height={44}
                className="object-contain"
              />
            </div>
          </Link>
        </div>
      </header>

      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="px-4 flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
        {/* Stages of Work */}
        <FadeIn delay={0.1}>
          <section className="py-12">
            <div className="px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-brown/40">Процесс создания</span>
                  <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-brand-brown">Этапы работы</h2>
                </div>
                <div className="hidden md:block w-1/3 h-[1px] bg-brand-brown/10 mb-4"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {STAGES.map((stage, index) => (
                  <FadeIn key={stage.id} delay={0.1 * (index + 1)}>
                    <div className="group relative bg-white rounded-[2.5rem] h-full border border-brand-brown/5 transition-all duration-500 hover:shadow-2xl hover:border-brand-brown/10 flex flex-col overflow-hidden">
                      {/* Image Container - Full width to edges */}
                      <div className="relative w-full aspect-[4/5] overflow-hidden">
                        <Image 
                          src={stage.image} 
                          alt={stage.title.replace('\n', ' ')}
                          fill 
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        />
                        {/* Subtle Overlay */}
                        <div className="absolute inset-0 bg-brand-brown/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      </div>

                      {/* Content - Padded below image */}
                      <div className="p-8 pt-7 relative z-10 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-[1px] bg-brand-brown/20 group-hover:w-12 group-hover:bg-brand-brown transition-all duration-500" />
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 group-hover:text-brand-brown transition-colors duration-500">Шаг {stage.number}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold uppercase tracking-wider text-brand-brown leading-[1.1] mb-4 whitespace-pre-line group-hover:translate-x-1 transition-transform duration-500">
                          {stage.title}
                        </h3>
                        
                        <p className="text-sm leading-relaxed text-brand-brown/60 font-medium group-hover:text-brand-brown/80 transition-colors duration-500">
                          {stage.text}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Benefits and Privileges Section */}
        <FadeIn delay={0.2}>
          <section className="py-8">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-brand-brown/5 shadow-sm overflow-hidden relative">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-beige/40 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-beige/20 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-5xl mx-auto">
                <div className="text-center mb-10 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-brown/30">Premium Service</span>
                  <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-brand-brown">
                    Бонусы и привилегии
                  </h2>
                  <p className="text-sm text-brand-brown/60 max-w-xl mx-auto leading-relaxed font-medium">
                    Комплексное сопровождение проектов — от дизайна до финальной съёмки.
                  </p>
                </div>

                {/* Main Steps List - Single Column */}
                <div className="space-y-6 mb-10">
                  {/* Step 1: Orders */}
                  <div className="bg-brand-beige/10 rounded-3xl p-8 border border-brand-brown/5 flex flex-col md:flex-row md:items-center gap-8 group hover:bg-white hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center gap-6 shrink-0 md:w-1/3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 mb-2">Этап 1</span>
                        <h3 className="text-lg font-bold uppercase tracking-widest text-brand-brown leading-tight">При заказе формы и текстиля</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow border-t md:border-t-0 md:border-l border-brand-brown/10 pt-6 md:pt-0 md:pl-8">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/40">От 40 единиц</span>
                        <div className="text-xs text-brand-brown/70 font-medium space-y-1">
                          <p>• Отрисовка вышивки логотипа в подарок</p>
                          <p>• Бесплатная доставка</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/40">От 50 единиц</span>
                        <div className="text-xs text-brand-brown/70 font-medium">
                          <p>• Вышивка бесплатно</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown/40">От 300 000 ₽</span>
                        <div className="text-xs text-brand-brown/70 font-medium space-y-1">
                          <p>• Разработка дизайна в подарок</p>
                          <p>• Бесплатная доставка</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Opening */}
                  <div className="bg-brand-beige/10 rounded-3xl p-8 border border-brand-brown/5 flex flex-col md:flex-row md:items-center gap-8 group hover:bg-white hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center gap-6 shrink-0 md:w-1/3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 mb-2">Этап 2</span>
                        <h3 className="text-lg font-bold uppercase tracking-widest text-brand-brown leading-tight">При открытии проекта</h3>
                      </div>
                    </div>
                    <div className="flex-grow border-t md:border-t-0 md:border-l border-brand-brown/10 pt-6 md:pt-0 md:pl-8">
                      <p className="text-sm leading-relaxed text-brand-brown/70 font-medium">
                        Для всего проекта — индивидуальный пошив костюма для управляющего <span className="text-brand-brown font-bold">в подарок</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Completion */}
                  <div className="bg-brand-beige/10 rounded-3xl p-8 border border-brand-brown/5 flex flex-col md:flex-row md:items-center gap-8 group hover:bg-white hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center gap-6 shrink-0 md:w-1/3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-brown/40 mb-2">Этап 3</span>
                        <h3 className="text-lg font-bold uppercase tracking-widest text-brand-brown leading-tight">Завершение проекта</h3>
                      </div>
                    </div>
                    <div className="flex-grow border-t md:border-t-0 md:border-l border-brand-brown/10 pt-6 md:pt-0 md:pl-8 flex flex-col md:flex-row justify-between gap-6">
                      <p className="text-sm leading-relaxed text-brand-brown/70 font-medium max-w-md">
                        Выезд и съёмка имиджевого видео для вашего бренда
                      </p>
                      <div className="space-y-2 shrink-0">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-brown/40">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-brown/30" />
                          <span>Замеры — бесплатно (МКАД)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-brown/40">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-brown/30" />
                          <span>-10% на прачечную WEWASH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Search Bar */}
        <div className="py-4">
          <div className="relative text-brand-brown max-w-2xl mx-auto w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Поиск по проектам"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-brand-brown placeholder-brand-brown/40 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-brown/10 transition-all shadow-sm text-lg"
            />
          </div>
        </div>

        {/* Projects Header */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <h2 className="text-xl md:text-2xl font-medium uppercase tracking-wider">Проекты</h2>
        </div>

        {/* Dynamic Content List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12" style={{ rowGap: '50px' }}>
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/50"
              >
                <div className="absolute inset-0 skeleton-shimmer" />
              </div>
            ))
          ) : interleavedItems.length > 0 ? (
            interleavedItems.map((item, index) => (
              <FadeIn key={item.id} delay={0.1} className="h-full">
                {isPromo(item) ? (
                  <Link 
                    href="https://t.me/stay_see" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative w-full aspect-[4/3] flex flex-col justify-center bg-gradient-to-br from-white via-white to-brand-beige/30 rounded-2xl p-8 border border-brand-brown/10 transition-all duration-500 hover:shadow-xl hover:border-brand-brown/20 overflow-hidden cursor-pointer"
                  >
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-brown/[0.03] rounded-full -mr-16 -mt-16 transition-transform duration-1000 group-hover:scale-110" />
                    
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-brand-brown/5 flex items-center justify-center text-xl shadow-sm transition-transform duration-500 group-hover:scale-110">
                        {item.icon || '✨'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-brand-brown/40 mb-0.5">
                          Exclusive Offer
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-brown/60">
                          Спецпредложение
                        </span>
                      </div>
                    </div>
                    
                    <div className="pl-6 border-l-2 border-brand-brown/10 relative z-10 group-hover:border-brand-brown/30 transition-colors duration-500">
                      {item.title && (
                        <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest text-brand-brown leading-tight mb-3">
                          {item.title}
                        </h3>
                      )}
                      <div className="text-xs md:text-sm leading-relaxed text-brand-brown/70 font-medium whitespace-pre-line line-clamp-4">
                        {item.text}
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-brown/5">
                      <div className="h-full w-0 bg-brand-brown group-hover:w-full transition-all duration-1000 ease-out" />
                    </div>
                  </Link>
                ) : (
                  <div className="group cursor-pointer">
                    <motion.section 
                      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm transition-all duration-700 mb-6"
                      whileHover="hover"
                      initial="initial"
                    >
                      {/* Image Background */}
                      <motion.div 
                        className="absolute inset-0 w-full h-full flex"
                        variants={{
                          initial: { scale: 1 },
                          hover: { scale: 1.02 }
                        }}
                        transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                      >
                        {item.type === 'portfolio' && item.imageLayout === 'double' ? (
                          <div className="flex w-full h-full">
                            <div className="relative w-1/2 h-full border-r border-white/10 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title || "1"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="relative w-1/2 h-full overflow-hidden">
                              <img
                                src={item.image2 || item.image}
                                alt={item.title || "2"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            <img
                              src={(item as Project).image}
                              alt={(item as Project).title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {/* Subtle Overlay */}
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-700" />
                      </motion.div>
                    </motion.section>
                    
                    {/* Title Below Image */}
                    <div className="text-center">
                      <h3 className="text-sm md:text-base font-bold text-brand-brown uppercase tracking-[0.2em] transition-all duration-500 group-hover:text-brand-brown/70">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                )}
              </FadeIn>
            ))
          ) : (
            <div className="col-span-full text-center py-20 opacity-50 text-lg">
              Ничего не найдено
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
