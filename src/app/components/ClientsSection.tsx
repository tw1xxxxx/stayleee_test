"use client";

import Image from "next/image";
import FadeIn from "./FadeIn";
import { useState, useEffect } from "react";

const clients = [
  { name: "Yauza", logo: "/images/clients/yauza.png", url: "https://yauza.place" },
  { name: "Wa Garden", logo: "/images/clients/wa-garden.png", url: "https://wagarden.ru" },
  { name: "Padron", logo: "/images/clients/padron.png", url: "https://padron.rest" },
  { name: "Хицунов", logo: "/images/clients/hitsunov.png", url: "https://hitsunov.ru" },
  { name: "Margarita Bistro", logo: "/images/clients/margarita.png", url: "https://margarita.rest" },
  { name: "Sei", logo: "/images/clients/sei.png", url: "https://sei.rest" },
  { name: "Коробок", logo: "/images/clients/korobok.png", url: "https://korobok.place" },
  { name: "345", logo: "/images/clients/345.png", url: "https://345.rest" },
  { name: "White Rabbit", logo: "/images/clients/white-rabbit.png", url: "https://whiterabbitmoscow.ru" },
  { name: "Loona", logo: "/images/clients/loona.png", url: "https://loona.rest" },
  { name: "Selfie", logo: "/images/clients/selfie.png", url: "https://selfiemoscow.ru" },
  { name: "Peach", logo: "/images/clients/peach.png", url: "https://peach.rest" },
];

const partners = [
  "Снимок экрана 2026-02-28 233903.png",
  "Снимок экрана 2026-02-28 233944.png",
  "Снимок экрана 2026-02-28 233953.png",
  "Снимок экрана 2026-02-28 234005.png",
  "Снимок экрана 2026-02-28 234017.png",
  "Снимок экрана 2026-02-28 234024.png",
  "Снимок экрана 2026-02-28 234032.png",
  "Снимок экрана 2026-02-28 234042.png",
  "Снимок экрана 2026-02-28 234047.png",
  "Снимок экрана 2026-02-28 234058.png",
  "Снимок экрана 2026-02-28 234102.png",
  "Снимок экрана 2026-02-28 234107.png",
  "Снимок экрана 2026-02-28 234114.png",
  "Снимок экрана 2026-02-28 234120.png",
  "Снимок экрана 2026-02-28 234127.png",
  "Снимок экрана 2026-02-28 234136.png",
  "Снимок экрана 2026-02-28 234142.png",
  "Снимок экрана 2026-02-28 234148.png",
  "Снимок экрана 2026-02-28 234401.png",
  "Снимок экрана 2026-02-28 234408.png",
  "Снимок экрана 2026-02-28 234412.png",
  "Снимок экрана 2026-02-28 234420.png",
  "Снимок экрана 2026-02-28 234424.png",
  "Снимок экрана 2026-02-28 234427.png",
  "Снимок экрана 2026-02-28 234434.png",
  "Снимок экрана 2026-02-28 234438.png",
  "Снимок экрана 2026-02-28 234442.png",
  "Снимок экрана 2026-02-28 234447.png",
  "Снимок экрана 2026-02-28 234456.png",
  "Снимок экрана 2026-02-28 234500.png",
  "Снимок экрана 2026-02-28 234504.png",
  "Снимок экрана 2026-02-28 234508.png",
  "Снимок экрана 2026-02-28 234512.png",
  "Снимок экрана 2026-02-28 234515.png",
  "Снимок экрана 2026-02-28 234526.png",
  "Снимок экрана 2026-02-28 234530.png",
  "Снимок экрана 2026-02-28 234539.png",
  "Снимок экрана 2026-02-28 234543.png",
  "Снимок экрана 2026-02-28 234548.png",
  "Снимок экрана 2026-02-28 234553.png",
  "Снимок экрана 2026-02-28 234602.png",
  "Снимок экрана 2026-02-28 234607.png",
  "Снимок экрана 2026-02-28 234622.png",
  "Снимок экрана 2026-02-28 234629.png"
];

// Объединяем всех клиентов и партнеров в один массив
const allLogos = [
  ...clients.map(c => ({ type: 'client', name: c.name, src: c.logo })),
  ...partners.map(p => ({ type: 'partner', name: 'Партнер', src: `/images/partners/${p}` }))
];

export default function ClientsSection() {
  const [visibleCount, setVisibleCount] = useState(12);
  const [increment, setIncrement] = useState(12);

  useEffect(() => {
    const updateConfig = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        setVisibleCount(24);
        setIncrement(24);
      } else {
        setVisibleCount(12);
        setIncrement(12);
      }
    };

    updateConfig();
    window.addEventListener('resize', updateConfig);
    return () => window.removeEventListener('resize', updateConfig);
  }, []);

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + increment, allLogos.length));
  };

  return (
    <section className="w-full bg-brand-beige flex flex-col justify-center items-center py-12 md:py-24 px-4">
      <h2 className="text-2xl md:text-4xl lg:text-5xl text-brand-brown text-center mb-12 md:mb-20 font-light uppercase tracking-[0.3em]">
        Нам доверяют
      </h2>
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16 lg:gap-x-16 lg:gap-y-20 items-center justify-items-center">
          {allLogos.slice(0, visibleCount).map((logo, index) => (
            <FadeIn 
              key={`${logo.src}-${index}`} 
              delay={(index % 6) * 0.05} 
              className="w-full flex justify-center group"
              priority={true}
            >
              <div 
                className="w-full h-12 md:h-16 lg:h-20 relative block transition-all duration-700 hover:scale-110 opacity-90 hover:opacity-100"
              >
                 <Image
                   src={logo.src}
                   alt={logo.name}
                   fill
                   className="object-contain"
                   sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                 />
              </div>
            </FadeIn>
          ))}
        </div>

        {visibleCount < allLogos.length && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={handleShowMore}
              className="px-8 py-3 border border-brand-brown text-brand-brown uppercase tracking-[0.2em] text-xs hover:bg-brand-brown hover:text-white transition-all duration-300 rounded-full"
            >
              Показать еще
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

