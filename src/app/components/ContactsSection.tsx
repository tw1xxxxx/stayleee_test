"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import FadeIn from "./FadeIn";

interface ContactsSectionProps {
  showMap?: boolean;
}

type YandexMapInstance = {
  destroy: () => void;
  getZoom: () => number;
  setZoom: (zoom: number, options?: { duration?: number }) => void;
  controls: { remove: (control: string) => void };
  geoObjects: { add: (placemark: unknown) => void };
};

type YMaps = {
  ready: (cb: () => void) => void;
  Map: new (
    element: HTMLElement,
    state: {
      center: [number, number];
      zoom: number;
      controls: string[];
      behaviors: string[];
    },
    options: { suppressMapOpenBlock: boolean }
  ) => YandexMapInstance;
  Placemark: new (
    coords: [number, number],
    properties: Record<string, unknown>,
    options: {
      iconLayout: string;
      iconImageHref: string;
      iconImageSize: [number, number];
      iconImageOffset: [number, number];
    }
  ) => unknown;
};

declare global {
  interface Window {
    ymaps?: YMaps;
  }
}

export default function ContactsSection({ showMap = true }: ContactsSectionProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<YandexMapInstance | null>(null);

  useEffect(() => {
    if (!showMap) return;

    const initMap = () => {
      const ymaps = window.ymaps;
      if (!ymaps) return;

      // Ensure map container is empty and ready
      if (mapRef.current) {
        mapRef.current.innerHTML = "";
      }

      ymaps.ready(() => {
        if (!mapRef.current) return;
        
        // Destroy existing instance if any
        if (mapInstanceRef.current) {
            try {
                mapInstanceRef.current.destroy();
            } catch (error) {
                console.warn("Map destroy error:", error);
            }
            mapInstanceRef.current = null;
        }

        const myMap = new ymaps.Map(mapRef.current, {
          center: [55.7806, 37.6889],
          zoom: 17,
          controls: [],
          behaviors: ["drag", "dblClickZoom", "multiTouch"]
        }, {
          suppressMapOpenBlock: true
        });
        
        mapInstanceRef.current = myMap;

        // Force remove controls just in case
        myMap.controls.remove('zoomControl');
        myMap.controls.remove('geolocationControl');
        myMap.controls.remove('searchControl');
        myMap.controls.remove('trafficControl');
        myMap.controls.remove('typeSelector');
        myMap.controls.remove('fullscreenControl');
        myMap.controls.remove('rulerControl');
        myMap.controls.remove('routeButtonControl');

        const myPlacemark = new ymaps.Placemark(
          [55.7806, 37.6889], 
          {}, 
          {
            iconLayout: 'default#image',
            iconImageHref: '/images/map-pin.svg',
            iconImageSize: [42, 42],
            iconImageOffset: [-21, -42]
          }
        );

        myMap.geoObjects.add(myPlacemark);
      });
    };

    // Check if script is already loaded
    if (document.querySelector('script[src*="api-maps.yandex.ru"]')) {
      if (window.ymaps) {
         initMap();
      } else {
         // Script loaded but ymaps object not yet available, wait for load
         const script = document.querySelector('script[src*="api-maps.yandex.ru"]') as HTMLScriptElement;
         if (script) {
            script.addEventListener('load', initMap);
         }
      }
    } else {
      const script = document.createElement("script");
      script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=&onerror=console.warn"; // Added onerror to suppress network errors in console
      script.type = "text/javascript";
      script.async = true;
      script.onload = initMap;
      script.onerror = (e) => console.warn("Yandex Maps load error", e); // Catch load errors
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup function
      if (mapInstanceRef.current) {
        try {
            mapInstanceRef.current.destroy();
        } catch {
        }
        mapInstanceRef.current = null;
      }
      
      // We don't remove the script to avoid reloading it on every navigation, 
      // but we ensure the map instance is properly destroyed.
    };
  }, [showMap]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom + 1, { duration: 300 });
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom - 1, { duration: 300 });
    }
  };

  return (
    <section className="w-full bg-brand-beige py-8 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className={`flex flex-col md:flex-row items-center justify-center gap-6 md:gap-20 ${!showMap ? 'md:flex-col' : ''}`}>
          {/* Left Side: Map */}
          {showMap && (
            <FadeIn direction="right" delay={0.2} priority={true} className="relative w-full md:w-[500px] h-[250px] md:h-[500px] flex-shrink-0">
              <div 
                ref={mapRef}
                className="w-full h-full rounded-3xl overflow-hidden shadow-md grayscale-[0.5] hover:grayscale-0 transition-all duration-500 bg-gray-200"
              />
              
              {/* Custom Zoom Controls */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
                <button 
                  onClick={handleZoomIn}
                  className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none text-brand-brown"
                  aria-label="Увеличить"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <button 
                  onClick={handleZoomOut}
                  className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none text-brand-brown"
                  aria-label="Уменьшить"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </FadeIn>
          )}

          {/* Right Side: Contact Info */}
          <FadeIn direction="left" delay={0.3} priority={true} className="flex flex-col gap-12 md:gap-16 text-center w-full md:w-auto items-center justify-center">
            {/* Logo */}
            <div className="w-64 md:w-80 lg:w-[450px]">
              <Image
                src="/images/logo/StaySee_Logo_chocolate_v1-0.png"
                alt="Логотип StaySee"
                width={500}
                height={200}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Contact Details and Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 text-brand-brown w-full max-w-5xl">
              <div className="space-y-6 text-center md:text-left">
                <h3 className="text-sm uppercase tracking-[0.3em] opacity-50 mb-4">Контакты</h3>
                <p className="text-xl md:text-2xl font-light">
                  Переведеновский пер. 13 с.13
                </p>
                <div className="space-y-2">
                  <a href="mailto:info@staysee.shop" className="block text-xl md:text-2xl font-light hover:opacity-60 transition-opacity">
                    info@staysee.shop
                  </a>
                  <a href="tel:+79099804077" className="block text-xl md:text-2xl font-light hover:opacity-60 transition-opacity">
                    +7 (909) 980-40-77
                  </a>
                </div>
              </div>

              <div className="space-y-6 text-center md:text-left">
                <h3 className="text-sm uppercase tracking-[0.3em] opacity-50 mb-4">Соцсети</h3>
                <div className="flex gap-8 justify-center md:justify-start items-center">
                  <Link href="#" className="hover:opacity-60 transition-opacity">
                    <span className="text-xl md:text-2xl font-light uppercase tracking-widest">VKontakte</span>
                  </Link>
                  <Link href="#" className="hover:opacity-60 transition-opacity">
                    <span className="text-xl md:text-2xl font-light uppercase tracking-widest">Telegram</span>
                  </Link>
                </div>
                <div className="pt-4">
                  <p className="text-sm uppercase tracking-[0.2em] font-light">форма для horeca</p>
                </div>
              </div>
            </div>
            
            {/* Legal Info */}
            <div className="mt-12 md:mt-20 pt-12 border-t border-brand-brown/10 text-[10px] md:text-xs text-brand-brown/40 max-w-4xl leading-relaxed uppercase tracking-[0.2em] text-center">
              ИП Костюренко Анастасия Александровна, ОГРНИП 323570000015061 , ИНН 570502747242, АО &quot;АЛЬФА-БАНК&quot;, БИК 044525593, К/сч 30101810200000000593, Р/сч 40802810702860020229
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
