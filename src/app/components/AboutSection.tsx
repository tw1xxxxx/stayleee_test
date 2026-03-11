import Image from "next/image";
import FadeIn from "./FadeIn";

export default function AboutSection() {
  return (
    <section className="bg-brand-beige pt-24 pb-6 md:pb-8 px-6 md:px-12">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-start gap-8">
        {/* Tagline */}
        <FadeIn direction="left" delay={0.2} priority={true} className="flex items-center gap-10">
          <div className="relative w-48 flex-shrink-0">
            <Image
              src="/images/logo/StaySee_Logo_chocolate_v1-0.png"
              alt="Логотип StaySee"
              width={500}
              height={200}
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-2xl md:text-3xl italic text-brand-brown font-medium">
             — остановись и посмотри.
          </p>
        </FadeIn>

        {/* Text Content */}
        <FadeIn delay={0.3} priority={true} className="space-y-8 text-brand-brown text-xl md:text-2xl leading-relaxed max-w-4xl">
          <p>
            В быстром жизненном темпе важно делать паузы,
            чтобы вспомнить себя и увидеть красоту вокруг.
          </p>
          <p>
            Форма Stay.See. — это про образ жизни, в
            котором творчество и забота о себе выходят на
            передний план.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
