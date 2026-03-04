import React from 'react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white font-sans">
      <div className="max-w-md w-full text-center space-y-8 border border-white/10 p-12 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex justify-center">
          <div className="w-16 h-16 border-t-2 border-white rounded-full animate-spin opacity-20"></div>
          <div className="absolute flex items-center justify-center w-16 h-16">
             <span className="text-4xl">🛠️</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-light tracking-[0.2em] uppercase italic">
            StaySee
          </h1>
          <div className="h-[1px] w-12 bg-white/30 mx-auto"></div>
          <h2 className="text-xl font-medium tracking-wide">
            Технические работы
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Мы обновляем каталог и настраиваем почту для вашего удобства. 
            Сайт будет доступен в ближайшее время.
          </p>
        </div>

        <div className="pt-8 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          Coming back soon
        </div>
      </div>
    </div>
  );
}
