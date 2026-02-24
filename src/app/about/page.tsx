"use client";

import Image from "next/image";
import Header from "../components/Header";
import ContactsSection from "../components/ContactsSection";
import HeroVideo from "../components/HeroVideo";
import FadeIn from "../components/FadeIn";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-brown font-sans relative overflow-x-hidden">
      <Header variant="burger-left" />

      {/* Hero Section - FIXED for Hard Parallax */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <HeroVideo src="/videos/IMG_1154.mp4?v=1" poster="/videos/IMG_1154-poster.jpg?v=1" />
      </div>

      {/* SCROLLABLE CONTENT LAYER */}
      <div className="relative z-20 pointer-events-none">
        {/* Spacer to show video */}
        <div className="h-[100dvh] w-full" />
        
        {/* Content Section */}
        <div className="bg-brand-beige relative shadow-[0_-10px_30px_rgba(0,0,0,0.2)] pointer-events-auto min-h-screen pt-24 rounded-none !rounded-none will-change-transform">
           
           <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
             <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-24">
                {/* Left Column - Text */}
                <div className="flex flex-col justify-center h-full">
                    <FadeIn direction="up" delay={0} priority>
                      <h1 className="text-4xl md:text-5xl font-light mb-8 text-brand-brown">О нас</h1>
                      
                      <div className="text-lg md:text-xl text-brand-brown/80 space-y-6 font-light leading-relaxed">
                        <p>
                          Stay.See. – бренд лаконичной и комфортной формы для поваров и барменов.
                          <br/>
                          Мы верим в творческое начало каждого, кто выбрал для себя путь развития в гастрономии.
                        </p>
                        <p>
                          Для нас важно создавать форму, в которой вы будете чувствовать себя личностью, а не рабочим. Создателем своего настоящего и будущего.
                        </p>
                        <p className="font-normal text-brand-brown pt-4">
                          Остановись и посмотри.
                          <br/>
                          Красота снаружи и внутри.
                        </p>
                      </div>
                    </FadeIn>
                </div>

                {/* Right Column - Image */}
                <FadeIn direction="left" delay={0.2} priority className="relative h-[500px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-xl">
                    <Image 
                      src="/images/DSC08370-600x900.jpg" 
                      alt="Детали Stay.See" 
                      fill 
                      className="object-cover hover:scale-105 transition-transform duration-700" 
                    />
                </FadeIn>
             </div>

             <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left Column - Image (Bottom) */}
                <FadeIn direction="right" delay={0.2} className="relative h-[500px] md:h-[600px] w-full order-2 md:order-1 rounded-2xl overflow-hidden shadow-xl">
                    <Image 
                      src="/images/DSC08794-600x900.jpg" 
                      alt="Анастасия Костюренко" 
                      fill 
                      className="object-cover hover:scale-105 transition-transform duration-700" 
                    />
                </FadeIn>

                {/* Right Column - Text */}
                <div className="flex flex-col justify-center h-full order-1 md:order-2">
                    <FadeIn direction="up" delay={0.4}>
                      <h2 className="text-3xl md:text-4xl font-light mb-8 text-brand-brown leading-tight">
                        Анастасия<br/>Костюренко
                      </h2>
                      
                      <div className="text-lg md:text-xl text-brand-brown/80 space-y-6 font-light leading-relaxed">
                        <p>
                          Я работаю на кухне уже 8 лет. За это время я много раз успела попасть в ловушку запары и потери себя как личности. 16 часов работы на кухне, когда неделя сменяется неделей, – мне знакомы. Но однажды я остановилась и посмотрела на все со стороны, чтобы вновь найти красоту снаружи и внутри. Так родилась идея Stay.See.
                        </p>
                        <p>
                          Создавая бренд формы для поваров и барменов, мы учитывали множество деталей от качества ткани до лаконичности кроя. Важно, чтобы форма легко прилегала к телу, а также была готова выдержать многочисленные стирки.
                        </p>
                        <p>
                          Наша форма бережно сшита из качественных материалов, а крой усилит Вашу индивидуальность и творческий потенциал.
                        </p>
                        <p className="mt-8 italic text-brand-brown font-normal">
                          С вдохновением, Анастасия Костюренко
                        </p>
                      </div>
                    </FadeIn>
                </div>
             </div>
           </div>

           {/* Footer Section */}
           <ContactsSection />
        </div>
      </div>
    </div>
  );
}
