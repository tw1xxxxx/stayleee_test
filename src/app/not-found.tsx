"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-8xl font-bold text-brand-brown/20">404</h1>
        <h2 className="text-2xl font-bold text-brand-brown">Страница не найдена</h2>
        <p className="text-brand-brown/80">
          К сожалению, запрашиваемая вами страница не существует или была перемещена.
        </p>
        <Link
          href="/"
          prefetch={false}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-brown text-white rounded-full hover:bg-opacity-90 transition-all font-medium"
        >
          <ArrowLeft size={18} />
          На главную
        </Link>
      </div>
    </div>
  );
}
