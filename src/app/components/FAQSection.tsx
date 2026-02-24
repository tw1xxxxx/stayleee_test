"use client";

import { useState } from "react";
import FadeIn from "./FadeIn";

const faqs = [
  {
    question: "Сколько времени займет изготовления заказа, если расчет на команду ?",
    answer: "От 7-12 рабочих дней, все зависит от содержания и особенностей заказа. Наш менеджер с удовольствием вас проконсультирует в чате.",
  },
  {
    question: "Что делать, если я не умею пользоваться разменной таблицей, и нахожусь не в Москве ?",
    answer: "Свяжитесь с нами в удобном для вас мессенджере, и мы обязательно вам поможем.",
  },
  {
    question: "Как происходит доставка за границу ?",
    answer: "Доставка по СНГ и России происходит с помощью службы СДЭК.",
  },
  {
    question: "Как я могу получить скидку?",
    answer: "Следите за нами в инстаграмме – мы регулярно проводим конкурсы и бонусы для вас.",
  },
  {
    question: "Можно к вам приехать и посмотреть-потрогать товар без предварительного заказа/договоренности?",
    answer: "Конечно. Наш магазин находиться по адресу: пер. Денисовский, д. 8/14, стр.1 / график: с 12 00 – 17 00.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-brand-beige py-12 md:py-24">
      {/* Accordion Section */}
      <div className="px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <h2 className="text-2xl md:text-4xl lg:text-5xl text-brand-brown text-center mb-12 md:mb-20 font-light uppercase tracking-[0.3em]">
            Частые вопросы
          </h2>
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={index * 0.1} fullWidth priority={true}>
              <div className="border-b border-brand-brown/10 last:border-0">
                <button
                  className="w-full text-left py-6 md:py-8 flex justify-between items-center group transition-colors focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-light text-brand-brown pr-8 text-lg md:text-xl lg:text-2xl uppercase tracking-wider group-hover:opacity-70 transition-opacity">
                    {faq.question}
                  </span>
                  <span className={`text-brand-brown w-8 h-8 flex items-center justify-center text-2xl md:text-3xl font-light transition-transform duration-500 ${openIndex === index ? "rotate-45" : "rotate-0"}`}>
                    +
                  </span>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openIndex === index ? "max-h-96 opacity-100 mb-8" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="text-brand-brown/70 text-base md:text-lg lg:text-xl leading-relaxed font-light max-w-3xl">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
