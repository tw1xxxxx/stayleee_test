import Image from "next/image";
import FadeIn from "./FadeIn";

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

export default function ClientsSection() {
  return (
    <section className="w-full bg-brand-beige flex flex-col justify-center items-center py-12 md:py-24 px-4">
      <h2 className="text-2xl md:text-4xl lg:text-5xl text-brand-brown text-center mb-12 md:mb-20 font-light uppercase tracking-[0.3em]">
        Нам доверяют
      </h2>
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-16 items-center justify-items-center">
          {clients.map((client, index) => (
            <FadeIn 
              key={index} 
              delay={index * 0.05} 
              className="w-full flex justify-center group"
              priority={true}
            >
              <div 
                className="w-full h-32 md:h-40 lg:h-48 relative block transition-transform duration-500 hover:scale-105"
              >
                 <Image
                   src={client.logo}
                   alt={client.name}
                   fill
                   className="object-contain"
                   sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                 />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
