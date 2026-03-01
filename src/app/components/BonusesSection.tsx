"use client";

import FadeIn from "./FadeIn";
import { motion } from "framer-motion";

const bonuses = [
  {
    title: "Бесплатная вышивка",
    description: "При заказе от 50 единиц продукции вышивка в подарок",
    icon: "🧵"
  },
  {
    title: "Выезд на замеры",
    description: "Первичный бесплатный выезд специалиста на замеры (в пределах МКАД)",
    icon: "📏"
  },
  {
    title: "Костюм управляющему",
    description: "При заказе формы и текстиля для всего ресторана — индивидуальный пошив костюма для управляющего в подарок!",
    icon: "🕴️"
  },
  {
    title: "Логотип и доставка",
    description: "При заказе от 40 ед — отрисовка вышивки Вашего логотипа в подарок и бесплатная доставка",
    icon: "🎁"
  },
  {
    title: "Дизайн в подарок",
    description: "Комплексная разработка дизайна при сумме от 300 тыс. руб. в подарок и бесплатная доставка",
    icon: "🎨"
  },
  {
    title: "Видео проекта",
    description: "В конце Вашего проекта мы приезжаем и снимаем для Вас красивое профессиональное видео",
    icon: "🎥"
  },
  {
    title: "Скидка 10% в WEWASH",
    description: "При оформлении заказа на форму и текстиль вы получаете пожизненную скидку на прачечную",
    icon: "🧼"
  },
  {
    title: "Система подарков",
    description: "От 15к — карандаш; от 20к — стикеры; от 25к — фартук; от 35к — вышивка",
    icon: "✨"
  }
];

export default function BonusesSection() {
  return (
    <section className="w-full bg-brand-beige py-16 md:py-32 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeIn direction="up" delay={0.1} priority={true}>
          <h2 className="text-2xl md:text-4xl lg:text-5xl text-brand-brown text-center mb-16 md:mb-24 font-light uppercase tracking-[0.3em]">
            Наши привилегии
          </h2>
        </FadeIn>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {bonuses.map((bonus, index) => (
            <FadeIn key={index} delay={index * 0.05} priority={true} className="h-full">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-brand-brown/5 flex flex-col items-center text-center h-full hover:bg-white/50 transition-all duration-500 group shadow-sm hover:shadow-xl hover:shadow-brand-brown/5"
              >
                <div className="w-16 h-16 bg-brand-beige/50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                  {bonus.icon}
                </div>
                <h3 className="text-base md:text-lg font-bold text-brand-brown uppercase tracking-widest mb-4 min-h-[3rem] flex items-center justify-center">
                  {bonus.title}
                </h3>
                <div className="w-8 h-0.5 bg-brand-brown/10 mb-6 group-hover:w-16 transition-all duration-500"></div>
                <p className="text-brand-brown/60 text-sm leading-relaxed font-sans font-medium">
                  {bonus.description}
                </p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
