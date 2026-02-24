"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import MenuOverlay from "../components/MenuOverlay";
import FadeIn from "../components/FadeIn";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "@/app/components/SafeImage";

// Content data structure for search functionality
interface Project {
  id: string;
  type: 'portfolio' | 'promo';
  title?: string;
  image?: string;
  text?: string;
  order: number;
}

const STAGES = [
  {
    id: 'concept',
    number: '01',
    title: 'Концепция',
    icon: '/images/icons8-концепция-64.png',
    text: 'Мы обсуждаем Ваши идеи и создаём образ будущего изделия — его стиль, характер и настроение.'
  },
  {
    id: 'construction',
    number: '02',
    title: 'Конструкция',
    icon: '/images/icons8-телевышка-50.png',
    text: 'Разрабатываем индивидуальную конструкцию с учётом особенностей фигуры для идеальной посадки.'
  },
  {
    id: 'fabric',
    number: '03',
    title: 'Ткань',
    icon: '/images/icons8-cloth-64.png',
    text: 'Подбираем материалы, которые подчеркнут концепцию и будут комфортны в носке.'
  },
  {
    id: 'fitting',
    number: '04',
    title: 'Примерки\nи финал',
    icon: '/images/icons8-победитель-гонки-53.png',
    text: 'На примерках оттачиваем детали и доводим изделие до совершенства. В результате Вы получаете уникальную вещь, созданную специально для Вас.'
  }
];

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
          {/* Right side icons or empty for balance */}
          <div className="w-8 h-8"></div>
        </div>
      </header>

      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="px-4 flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
        {/* Stages of Work */}
        <FadeIn delay={0.1}>
          <section className="pt-8">
            <h2 className="text-xl md:text-2xl font-medium mb-6 uppercase tracking-wider">Этапы работы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {STAGES.map((stage) => (
                <FadeIn key={stage.id} delay={0.1}>
                  <div className="group relative bg-white rounded-3xl p-6 h-full border border-brand-brown/5 transition-all duration-300 hover:shadow-xl hover:border-brand-brown/10">
                    {/* Number & Icon Header */}
                    <div className="flex items-start justify-between mb-6">
                      <span className="text-4xl font-bold text-brand-brown/10 font-mono tracking-tighter">
                        {stage.number}
                      </span>
                      <div className="w-12 h-12 relative grayscale group-hover:grayscale-0 transition-all duration-500">
                        <Image 
                          src={stage.icon} 
                          alt={stage.title.replace('\n', ' ')}
                          fill 
                          className="object-contain"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-bold uppercase tracking-widest text-brand-brown leading-tight">
                        {stage.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-brand-brown/60 font-medium">
                        {stage.text}
                      </p>
                    </div>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-6 right-6 h-1 bg-brand-brown/5 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-brand-brown group-hover:w-full transition-all duration-700 ease-out" />
                    </div>
                  </div>
                </FadeIn>
              ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-white/50"
              >
                <div className="absolute inset-0 skeleton-shimmer" />
              </div>
            ))
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <FadeIn key={item.id} delay={0.2 + (index % 3) * 0.1} className="h-full">
                {item.type === 'promo' ? (
                  <div className="relative w-full h-full min-h-[200px] flex flex-col justify-center bg-white/30 rounded-[2rem] p-8 border border-brand-brown/5">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-brown/40 block mb-3">
                      Специальное предложение
                    </span>
                    <div className="pl-4 border-l-2 border-brand-brown/30">
                      <p className="text-xl md:text-2xl font-semibold uppercase tracking-wide text-brand-brown leading-tight">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.section 
                    className="group relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                    whileHover="hover"
                    initial="initial"
                  >
                    {/* Image Background */}
                    <motion.div 
                      className="absolute inset-0 w-full h-full"
                      variants={{
                        initial: { scale: 1 },
                        hover: { scale: 1.1 }
                      }}
                      transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                    >
                      <SafeImage
                        src={item.image || "/images/470750.jpg"}
                        alt={item.title || "Изображение проекта"}
                        fill
                        className="object-cover"
                      />
                      {/* Subtle Gradient for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                    </motion.div>

                    {/* Title in Bottom Left */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full">
                      <h3 className="text-xl md:text-3xl font-bold text-white uppercase tracking-wider drop-shadow-lg font-sans leading-tight group-hover:translate-x-2 transition-transform duration-500">
                        {item.title}
                      </h3>
                    </div>
                  </motion.section>
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
