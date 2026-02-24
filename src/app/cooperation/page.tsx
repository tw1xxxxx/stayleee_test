"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import ContactsSection from "../components/ContactsSection";
import FadeIn from "../components/FadeIn";
import MenuOverlay from "../components/MenuOverlay";

export default function CooperationPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    description: ""
  });
  
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    if (!email) return true; // Optional field, so empty is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return (
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        formData.phone.length === 18 &&
        validateEmail(formData.email)
    );
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    if (input === "") {
        setFormData(prev => ({ ...prev, phone: "" }));
        return;
    }

    const numbers = input.replace(/\D/g, "");

    if (numbers.length === 0) {
        setFormData(prev => ({ ...prev, phone: "" }));
        return;
    }

    let formatted = "+7";
    let content = "";

    if (numbers.length > 0 && ["7", "8"].includes(numbers[0])) {
        if (numbers.length === 1) {
            content = "";
        } else if (numbers.length === 2 && ["7", "8"].includes(numbers[1])) {
             content = "";
        } else {
             content = numbers.substring(1);
        }
    } else {
        content = numbers;
    }

    content = content.substring(0, 10);

    if (content.length > 0) {
        formatted += ` (${content.substring(0, 3)}`;
    } else {
        formatted += " (";
    }
    
    if (content.length >= 4) {
        formatted += `) ${content.substring(3, 6)}`;
    }
    if (content.length >= 7) {
        formatted += `-${content.substring(6, 8)}`;
    }
    if (content.length >= 9) {
        formatted += `-${content.substring(8, 10)}`;
    }

    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
        if (formData.phone.length <= 4) {
            e.preventDefault();
            setFormData(prev => ({ ...prev, phone: "" }));
        }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "firstName" || name === "lastName") {
        // Remove any digits
        const cleanValue = value.replace(/[0-9]/g, "");
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === "email") {
        setEmailError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (formData.email && !validateEmail(formData.email)) {
        setEmailError("Пожалуйста, введите корректный адрес электронной почты");
        return;
    }

    // Handle form submission logic here
    // console.log("Form submitted:", formData);
    // TODO: Implement email sending logic
    alert("Спасибо за заявку! Мы свяжемся с вами в ближайшее время.");
  };

  return (
    <div className="min-h-screen bg-brand-beige text-brand-brown font-sans flex flex-col">
      {/* Header - Normal (scrolls away) */}
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
          Сотрудничество
        </h1>

      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            {/* Text and Form */}
            <div className="flex flex-col justify-center h-full relative z-10">
                <FadeIn direction="up" delay={0.4}>
                  <h2 className="text-3xl md:text-4xl font-light mb-4 text-brand-brown leading-tight">
                    Приглашаем к<br/>сотрудничеству
                  </h2>
                  
                  <div className="text-lg md:text-xl text-brand-brown/80 space-y-4 font-light leading-relaxed mb-8">
                    <p>
                      Мы открыты для новых предложений и партнерства. Если вы разделяете наши ценности и хотите создавать красоту вместе с нами — напишите нам.
                    </p>
                    
                    {/* Inline Image */}
                    <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-xl my-6">
                      <Image 
                        src="/images/cooperation-bg.jpg" 
                        alt="Сотрудничество" 
                        fill 
                        className="object-cover hover:scale-105 transition-transform duration-700" 
                      />
                    </div>

                    <p>
                      Для обсуждения условий сотрудничества свяжитесь с нами удобным способом или заполните форму ниже.
                    </p>
                  </div>

                  {/* Form */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-brand-brown/5 border border-brand-brown/5">
                    <h3 className="text-xl font-medium mb-6 text-brand-brown/90 uppercase tracking-widest text-center">Анкета партнера</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      
                      {/* First Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-brand-brown/60 ml-1">
                        Имя <span className="text-brand-red">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-brand-beige/30 border border-transparent focus:border-brand-brown/20 text-brand-brown placeholder-brand-brown/30 px-4 py-3 rounded-xl outline-none transition-all duration-300 font-sans text-base"
                        placeholder="Ваше имя"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-brand-brown/60 ml-1">
                        Фамилия <span className="text-brand-red">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-brand-beige/30 border border-transparent focus:border-brand-brown/20 text-brand-brown placeholder-brand-brown/30 px-4 py-3 rounded-xl outline-none transition-all duration-300 font-sans text-base"
                        placeholder="Ваша фамилия"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-brand-brown/60 ml-1">
                        Телефон <span className="text-brand-red">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handlePhoneInput}
                        onKeyDown={handlePhoneKeyDown}
                        maxLength={18}
                        placeholder="+7 (___) ___-__-__"
                        className="w-full bg-brand-beige/30 border border-transparent focus:border-brand-brown/20 text-brand-brown placeholder-brand-brown/30 px-4 py-3 rounded-xl outline-none transition-all duration-300 font-sans text-base"
                      />
                    </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-brand-brown/60 ml-1">
                          Почта
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={() => {
                            if (formData.email && !validateEmail(formData.email)) {
                                setEmailError("Некорректная почта");
                            }
                          }}
                          className={`w-full bg-brand-beige/30 border ${emailError ? "border-red-300 bg-red-50" : "border-transparent focus:border-brand-brown/20"} text-brand-brown placeholder-brand-brown/30 px-4 py-3 rounded-xl outline-none transition-all duration-300 font-sans`}
                          placeholder="example@mail.ru"
                        />
                        {emailError && (
                          <p className="text-red-500 text-[10px] ml-1 uppercase tracking-wide">{emailError}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-brand-brown/60 ml-1">
                          О предложении
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full bg-brand-beige/30 border border-transparent focus:border-brand-brown/20 text-brand-brown placeholder-brand-brown/30 px-4 py-3 rounded-xl outline-none transition-all duration-300 font-sans resize-none text-base"
                          placeholder="Расскажите немного о себе и вашем предложении..."
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button 
                          type="submit"
                          disabled={!isFormValid()}
                          className={`w-full font-bold py-4 rounded-xl transition-all duration-300 transform shadow-md uppercase tracking-widest text-xs ${
                            isFormValid() 
                              ? "bg-brand-brown text-white hover:bg-brand-brown/90 hover:scale-[1.02] cursor-pointer shadow-brand-brown/20" 
                              : "bg-gray-100 text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          Отправить заявку
                        </button>
                      </div>

                    </form>
                  </div>
                </FadeIn>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <ContactsSection />
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
