"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import FadeIn from "../components/FadeIn";
import MenuOverlay from "../components/MenuOverlay";
import { AnimatePresence, motion } from "framer-motion";

export default function CertificatesPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (selectedImage) {
      const scrollY = window.scrollY;
      const bodyStyle = document.body.style;
      bodyStyle.top = `-${scrollY}px`;
      bodyStyle.position = "fixed";
      bodyStyle.width = "100%";
      bodyStyle.overflow = "hidden";
      document.body.classList.add("overflow-hidden");
    } else {
      const bodyStyle = document.body.style;
      const scrollY = bodyStyle.top;
      bodyStyle.position = "";
      bodyStyle.top = "";
      bodyStyle.width = "";
      bodyStyle.overflow = "";
      document.body.classList.remove("overflow-hidden");
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      const bodyStyle = document.body.style;
      const scrollY = bodyStyle.top;
      bodyStyle.position = "";
      bodyStyle.top = "";
      bodyStyle.width = "";
      bodyStyle.overflow = "";
      document.body.classList.remove("overflow-hidden");
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [selectedImage]);

  // Mock data - using the same image for now
  const certificates = [
    "/images/certificate-placeholder.jpg",
    "/images/certificate-placeholder.jpg",
    "/images/certificate-placeholder.jpg",
    "/images/certificate-placeholder.jpg",
    "/images/certificate-placeholder.jpg",
    "/images/certificate-placeholder.jpg",
  ];

  return (
    <div className="min-h-screen bg-brand-beige text-brand-brown font-sans flex flex-col">
      {/* Header - Consistent with Collections Page */}
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
          Сертификаты
        </h1>

      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* Mockup Layout - Asymmetric Grid */}
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
          
          {/* Top Row: Left Stack (2 items) + Right Big (1 item) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
            
            {/* Left Column - 2 Items */}
            <div className="md:col-span-5 flex flex-col gap-8">
              {/* Item 1 (Top Left) */}
              <FadeIn delay={0.1}>
                <div 
                  className="group relative w-full aspect-[1.414] bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-brand-brown/10 cursor-pointer"
                  onClick={() => setSelectedImage(certificates[0])}
                >
                  <div className="absolute inset-0 p-4 md:p-6 flex items-center justify-center">
                    <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-[1.05]">
                      <Image 
                        src={certificates[0]} 
                        alt="Сертификат 1" 
                        fill 
                        className="object-contain drop-shadow-md" 
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    </div>
                  </div>
                  {/* Hover Overlay - Removed Icon */}
                  <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/5 transition-colors duration-500" />
                </div>
              </FadeIn>

              {/* Item 2 (Bottom Left) */}
              <FadeIn delay={0.2}>
                <div 
                  className="group relative w-full aspect-[1.414] bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-brand-brown/10 cursor-pointer"
                  onClick={() => setSelectedImage(certificates[1])}
                >
                  <div className="absolute inset-0 p-4 md:p-6 flex items-center justify-center">
                    <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-[1.05]">
                      <Image 
                        src={certificates[1]} 
                        alt="Сертификат 2" 
                        fill 
                        className="object-contain drop-shadow-md" 
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    </div>
                  </div>
                   {/* Hover Overlay - Removed Icon */}
                  <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/5 transition-colors duration-500" />
                </div>
              </FadeIn>
            </div>

            {/* Right Column - 1 Large Item */}
            <div className="md:col-span-7">
              <FadeIn delay={0.3} className="h-full">
                <div 
                  className="group relative w-full h-full min-h-[300px] md:min-h-0 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-brand-brown/10 cursor-pointer"
                  onClick={() => setSelectedImage(certificates[2])}
                >
                  <div className="absolute inset-0 p-4 md:p-8 flex items-center justify-center">
                    <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-[1.05]">
                      <Image 
                        src={certificates[2]} 
                        alt="Сертификат 3" 
                        fill 
                        className="object-contain drop-shadow-md" 
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                    </div>
                  </div>
                   {/* Hover Overlay - Removed Icon */}
                  <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/5 transition-colors duration-500" />
                </div>
              </FadeIn>
            </div>

          </div>

          {/* Bottom Row: 1 Wide Item */}
          <div className="w-full">
             <FadeIn delay={0.4}>
                <div 
                  className="group relative w-full aspect-[2/1] md:aspect-[3/1] bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-brand-brown/10 cursor-pointer"
                  onClick={() => setSelectedImage(certificates[3])}
                >
                  <div className="absolute inset-0 p-4 md:p-8 flex items-center justify-center">
                    <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-[1.05]">
                      <Image 
                        src={certificates[3]} 
                        alt="Сертификат 4" 
                        fill 
                        className="object-contain drop-shadow-md" 
                        sizes="90vw"
                      />
                    </div>
                  </div>
                   {/* Hover Overlay - Removed Icon */}
                  <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/5 transition-colors duration-500" />
                </div>
             </FadeIn>
          </div>

        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
            onTouchMove={(e) => e.preventDefault()}
            onWheel={(e) => e.preventDefault()}
          >
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-brown/90"
            />
            
            {/* Close Button - Fixed to viewport */}
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSelectedImage(null)}
              className="fixed top-4 right-4 md:top-8 md:right-8 z-[110] text-brand-beige hover:text-white transition-colors p-3 bg-white/10 rounded-full shadow-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>

            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 max-w-5xl max-h-[90vh] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Full Image */}
              <div className="relative shadow-2xl rounded-lg overflow-hidden bg-transparent w-[90vw] h-[80vh]">
                <Image
                  src={selectedImage}
                  alt="Сертификат в полном размере"
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
