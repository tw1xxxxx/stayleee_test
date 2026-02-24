"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">!</span>
        </div>
        <h2 className="text-2xl font-bold text-brand-brown">Что-то пошло не так</h2>
        <p className="text-brand-brown/80">
          Произошла непредвиденная ошибка при загрузке страницы.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-brown text-white rounded-full hover:bg-opacity-90 transition-all font-medium"
        >
          <RefreshCw size={18} />
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
