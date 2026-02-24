"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [step, setStep] = useState<"email" | "code">("email");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register, verifyCode, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Logic to determine redirect path
  // If redirect param is missing or is "/profile", default to "/"
  const paramRedirect = searchParams.get("redirect");
  const redirect = (paramRedirect && paramRedirect !== "/profile") ? paramRedirect : "/";
  const backUrl = searchParams.get("backUrl");

  useEffect(() => {
    if (isAuthenticated && step === "email" && !isLoading) {
      router.replace(redirect);
    }
  }, [isAuthenticated, step, redirect, router, isLoading]);

  const translateError = (message: string) => {
    if (message.includes("User not found")) return "Пользователь не найден";
    if (message.includes("Email not registered")) return "Почта не зарегистрирована";
    if (message.includes("Invalid email")) return "Неверный формат почты";
    if (message.includes("User already exists")) return "Эта почта уже зарегистрирована. Пожалуйста, войдите";
    if (message.includes("Invalid code")) return "Неверный код";
    if (message.includes("Code expired")) return "Срок действия кода истек";
    if (message.includes("Failed to send code") || message.includes("Failed to send verification code")) return "Ошибка отправки кода. Попробуйте позже.";
    if (message.includes("Server configuration error")) return "Ошибка сервера: не настроена почта";
    if (message.includes("network")) return "Ошибка сети";
    return message;
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return "";
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "code" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const validateEmail = (email: string) => {
    if (!email) return "Введите почту";

    // Check for Cyrillic characters
    if (/[а-яА-ЯёЁ]/.test(email)) {
      return "Почта не должна содержать русские буквы";
    }
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Введите корректный адрес электронной почты";
    }
    
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Check for Cyrillic characters
    if (/[а-яА-ЯёЁ]/.test(val)) {
      setError("Русские буквы в почте недопустимы");
      // Optionally strip them if you want to strictly prevent typing:
      // setEmail(val.replace(/[а-яА-ЯёЁ]/g, ""));
      // But keeping them visible with an error is often better UX so user sees what they did.
      // However, user said "cannot write", so let's strip them to be safe and strictly follow "cannot write".
      setEmail(val.replace(/[а-яА-ЯёЁ]/g, ""));
      return;
    }
    
    setError("");
    setEmail(val);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        if (!name) throw new Error("Введите имя");
        await register(email, name);
      } else {
        await login(email);
      }
      setStep("code");
      setTimeLeft(30);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(translateError(message) || "Ошибка отправки кода");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const codeString = code.join("");

    try {
      await verifyCode(email, codeString, mode === "register", name);
      router.push(redirect);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(translateError(message) || "Неверный код");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Allow only digits
    if (value && !/^\d+$/.test(value)) return;
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    
    if (!pastedData) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
    }
    setCode(newCode);
    
    const nextIndex = Math.min(pastedData.length, 3);
    if (pastedData.length === 4) {
        document.getElementById(`code-3`)?.focus();
    } else {
        document.getElementById(`code-${nextIndex}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
      // Optional: clear previous input on backspace if needed, 
      // but standard behavior is usually just focus back
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;
    setIsLoading(true);
    try {
      if (mode === "register") {
        await register(email, name);
      } else {
        await login(email);
      }
      setTimeLeft(30);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(translateError(message) || "Ошибка отправки кода");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige flex flex-col items-center justify-center p-4 relative overflow-x-hidden font-sans">
      <div className="absolute inset-0 bg-brand-brown/5 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0 }}
        className="w-full max-w-[400px] bg-white rounded-[30px] p-8 relative z-10 shadow-xl flex flex-col items-center min-h-[600px]"
      >
        {/* Back Button */}
        <div className="w-full flex justify-start mb-6">
          <button 
            onClick={() => {
              if (step === "code") {
                setStep("email");
              } else {
                if (backUrl) {
                  router.push(backUrl);
                } else if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/');
                }
              }
            }}
            className="w-10 h-10 flex items-center justify-center bg-brand-beige/50 hover:bg-brand-beige rounded-full text-brand-brown transition-colors cursor-pointer shadow-sm"
            aria-label="Назад"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 1, x: 0 }}
              transition={{ duration: 0 }}
              className="w-full flex flex-col items-center flex-1"
            >
              {/* Title */}
              <h1 className="text-xl text-brand-brown mb-8 font-medium tracking-wide">
                {mode === "register" ? "Зарегистрироваться" : "Войти"}
              </h1>

              {/* Logo */}
              <div className="mb-10 relative w-40 h-12">
                 <Image
                    src="/images/logo/StaySee_Logo_whitesand_v1-0.svg"
                    alt="Логотип StaySee"
                    fill
                    className="object-contain filter brightness-0" 
                    priority
                  />
              </div>

              {/* Form */}
              <form onSubmit={handleSendCode} className="w-full space-y-4 flex-1 flex flex-col" noValidate>
                
                {mode === "register" && (
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-beige/30 rounded-lg text-brand-brown placeholder:text-brand-brown/60 outline-none focus:ring-1 focus:ring-brand-brown/20 transition-all text-center font-sans text-base"
                      placeholder="Имя"
                    />
                  </div>
                )}
                
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-3 bg-brand-beige/30 rounded-lg text-brand-brown placeholder:text-brand-brown/60 outline-none focus:ring-1 focus:ring-brand-brown/20 transition-all text-center font-sans text-base"
                    placeholder="Почта"
                  />
                </div>

                {mode === "register" && (
                  <p className="text-xs text-center text-brand-brown/60 mt-2 px-4">
                    Зарегистрируйтесь чтобы создать личный кабинет
                  </p>
                )}

                <div className="min-h-[24px] flex items-center justify-center w-full">
                  {error && <p className="text-brand-red text-sm text-center leading-tight">{error}</p>}
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-brand-brown hover:bg-brand-brown/90 text-brand-beige rounded-2xl font-medium transition-colors disabled:opacity-50 w-auto min-w-[160px] shadow-sm"
                  >
                    {isLoading ? "Отправка..." : "Получить код"}
                  </button>
                </div>

                <div className="mt-auto pt-8 pb-4 text-center">
                   <Link 
            href={mode === "register" ? "/login" : "/register"}
            prefetch={false}
            className="text-brand-brown text-lg hover:underline underline-offset-4 decoration-1 opacity-80"
          >
                    {mode === "register" ? "Войти" : "Зарегистрироваться"}
                  </Link>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="code-step"
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 1, x: 0 }}
              transition={{ duration: 0 }}
              className="w-full flex flex-col items-center flex-1"
            >
              <div className="text-center mb-8">
                <h2 className="text-lg text-brand-brown font-medium mb-2 max-w-[200px] mx-auto leading-tight">
                  Введите код который пришел на почту:
                </h2>
                <p className="text-brand-brown/70 text-sm font-medium">
                  {email}
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="w-full flex flex-col items-center flex-1">
                <div className="flex justify-center gap-4 mb-4">
                  {code.map((digit, index) => (
                    <div key={index} className="relative">
                      <input
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-12 h-16 bg-brand-beige/30 text-center text-3xl text-brand-brown border-b-2 border-brand-brown/20 focus:border-brand-brown outline-none transition-all rounded-t-lg font-sans"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center w-full mb-8">
                  <button 
                    type="button" 
                    onClick={handleResendCode}
                    disabled={timeLeft > 0 || isLoading}
                    className={`
                      text-sm transition-all duration-300 px-6 py-2 rounded-full border border-brand-brown/10
                      ${timeLeft > 0 
                        ? "text-brand-brown/40 bg-transparent cursor-not-allowed" 
                        : "text-brand-beige bg-brand-brown hover:bg-black hover:shadow-lg border-transparent transform hover:scale-105"
                      }
                    `}
                  >
                    {timeLeft > 0 ? `Повторить через ${timeLeft} сек` : "Отправить код повторно"}
                  </button>
                </div>

                {error && <p className="text-brand-red text-sm text-center mb-4">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-12 py-3 bg-brand-brown hover:bg-brand-brown/90 text-brand-beige rounded-2xl font-medium transition-colors disabled:opacity-50 shadow-sm text-lg"
                >
                  {isLoading ? "Проверка..." : "Далее"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
