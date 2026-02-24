"use client";

import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';

export interface ProductGalleryHandle {
  scrollTo: (index: number) => void;
}

interface ProductGalleryProps {
  children: React.ReactNode;
  className?: string;
  onChange?: (index: number) => void;
  initialIndex?: number;
  activeIndex?: number;
}

/**
 * Галерея товаров с поведением как у Wildberries (свайпы, инерция, отскок).
 * Поддерживает управление через ref для миниатюр.
 */
const ProductGallery = forwardRef<ProductGalleryHandle, ProductGalleryProps>(({ children, className, onChange, initialIndex = 0, activeIndex }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  
  // Ref для хранения состояния анимации и жестов
  const state = useRef({
    currentIndex: initialIndex,
    isDragging: false,
    startX: 0,
    currentTranslate: 0,
    prevTranslate: 0,
    startTime: 0,
    width: 0,
    count: 0,
    accumulatedWheelX: 0,
    wheelTimeout: null as NodeJS.Timeout | null,
    isWheeling: false
  });

  // Обновляем количество слайдов
  useEffect(() => {
    state.current.count = React.Children.count(children);
  }, [children]);

  // Функция для программного переключения слайда
  const snapToIndex = useCallback((index: number, animate = true) => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    // Ограничиваем индекс
    index = Math.max(0, Math.min(index, state.current.count - 1));
    
    state.current.currentIndex = index;
    state.current.width = container.offsetWidth;
    
    const targetTranslate = -index * state.current.width;
    state.current.prevTranslate = targetTranslate;
    state.current.currentTranslate = targetTranslate;

    if (onChange) onChange(index);

    if (animate) {
      inner.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      inner.style.transform = `translateX(${targetTranslate}px)`;
    } else {
      inner.style.transition = 'none';
      inner.style.transform = `translateX(${targetTranslate}px)`;
    }
  }, [onChange]);

  // Синхронизация с внешним activeIndex
  useEffect(() => {
    if (typeof activeIndex === 'number' && activeIndex !== state.current.currentIndex) {
      snapToIndex(activeIndex, true);
    }
  }, [activeIndex, snapToIndex]);

  // Экспортируем методы для родителя
  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => snapToIndex(index, true)
  }), [snapToIndex]);

  // Инициализация и обработчики событий
  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    // Инициализация размеров
    const init = () => {
      state.current.width = container.offsetWidth;
      snapToIndex(state.current.currentIndex, false);
    };

    // Вызываем init сразу и при ресайзе
    init();
    // Небольшая задержка для корректного расчета ширины при первом рендере
    setTimeout(init, 50);
    
    window.addEventListener('resize', init);

    const getX = (e: TouchEvent | MouseEvent) => {
      return (e as TouchEvent).touches ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    };

    const setTranslate = (x: number) => {
      state.current.currentTranslate = x;
      inner.style.transform = `translateX(${x}px)`;
    };

    const handleStart = (e: TouchEvent | MouseEvent) => {
      // Игнорируем клики правой кнопкой
      if (e instanceof MouseEvent && e.button !== 0) return;
      
      // Игнорируем мультитач (зум) - если больше 1 пальца, не начинаем/прерываем свайп
      if ((e as TouchEvent).touches && (e as TouchEvent).touches.length > 1) {
        state.current.isDragging = false;
        return;
      }

      state.current.isDragging = true;
      state.current.startX = getX(e);
      state.current.startTime = Date.now();
      
      // Синхронизируем состояние с текущей анимацией (чтобы избежать скачков)
      const style = window.getComputedStyle(inner);
      const matrix = new DOMMatrix(style.transform);
      const currentX = matrix.m41;
      
      state.current.currentTranslate = currentX;
      state.current.prevTranslate = currentX;

      inner.style.transition = 'none';
      inner.style.transform = `translateX(${currentX}px)`;
      inner.style.willChange = 'transform';
    };

    const handleMove = (e: TouchEvent | MouseEvent) => {
      // Если во время свайпа появился второй палец (зум), отменяем свайп
      if ((e as TouchEvent).touches && (e as TouchEvent).touches.length > 1) {
        if (state.current.isDragging) {
          state.current.isDragging = false;
          snapToIndex(state.current.currentIndex, true);
        }
        return;
      }

      if (!state.current.isDragging) return;

      const x = getX(e);
      const delta = x - state.current.startX;
      
      let newTranslate = state.current.prevTranslate + delta;

      // Bounce эффект (сопротивление на краях)
      const minTranslate = -(state.current.count - 1) * state.current.width;
      const maxTranslate = 0;

      if (newTranslate > maxTranslate) {
        newTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.3;
      } else if (newTranslate < minTranslate) {
        newTranslate = minTranslate + (newTranslate - minTranslate) * 0.3;
      }

      setTranslate(newTranslate);
    };

    const handleEnd = () => {
      if (!state.current.isDragging) return;
      state.current.isDragging = false;
      inner.style.willChange = 'auto';

      const movedBy = state.current.currentTranslate - state.current.prevTranslate;
      const duration = Date.now() - state.current.startTime;
      const velocity = Math.abs(movedBy) / duration;
      
      // Вычисляем текущий индекс на основе позиции
      const width = state.current.width;
      const currentPos = -state.current.currentTranslate;
      const exactIndex = currentPos / width;
      let nextIndex = Math.round(exactIndex);

      // Обработка свайпов (инерция)
      // Порог скорости немного увеличен (0.5) для предотвращения случайных переключений
      // Также добавлена проверка на минимальное расстояние свайпа
      if (velocity > 0.5 && Math.abs(movedBy) > 30) {
        if (movedBy < 0) { // Свайп влево -> следующий слайд
          nextIndex = Math.floor(exactIndex) + 1;
        } else { // Свайп вправо -> предыдущий слайд
          nextIndex = Math.ceil(exactIndex) - 1;
        }
      }

      // Ограничиваем переключение максимум на 1 слайд за раз
      // Это решает проблему "проскакивания" через слайд на iOS при быстром скролле
      const currentIndex = state.current.currentIndex;
      // Убедимся, что nextIndex не уходит дальше чем на 1 слайд от текущего
      // Но если мы уже перетащили далеко (exactIndex), то clamp может вызвать "возврат"
      // Однако для галереи товаров поведение "один свайп = один слайд" является предпочтительным
      if (nextIndex > currentIndex + 1) nextIndex = currentIndex + 1;
      if (nextIndex < currentIndex - 1) nextIndex = currentIndex - 1;

      snapToIndex(nextIndex, true);
    };

    const handleWheel = (e: WheelEvent) => {
      // Игнорируем вертикальный скролл (если он больше горизонтального)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;

      e.preventDefault();
      e.stopPropagation();

      // Сбрасываем таймаут, если событие продолжается
      if (state.current.wheelTimeout) {
        clearTimeout(state.current.wheelTimeout);
      }

      // Если мы уже в процессе переключения слайда (кулдаун), просто обновляем таймер сброса
      if (state.current.isWheeling) {
        state.current.wheelTimeout = setTimeout(() => {
          state.current.isWheeling = false;
          state.current.accumulatedWheelX = 0;
        }, 200);
        return;
      }

      state.current.accumulatedWheelX += e.deltaX;

      const threshold = 50; // Порог для срабатывания свайпа

      if (state.current.accumulatedWheelX > threshold) {
        // Свайп влево -> следующий слайд
        snapToIndex(state.current.currentIndex + 1, true);
        state.current.isWheeling = true;
        state.current.accumulatedWheelX = 0;
      } else if (state.current.accumulatedWheelX < -threshold) {
        // Свайп вправо -> предыдущий слайд
        snapToIndex(state.current.currentIndex - 1, true);
        state.current.isWheeling = true;
        state.current.accumulatedWheelX = 0;
      }

      // Если ничего не произошло, сбрасываем через 100мс
      state.current.wheelTimeout = setTimeout(() => {
        state.current.isWheeling = false;
        state.current.accumulatedWheelX = 0;
      }, 100);
    };

    // Слушатели
    container.addEventListener('touchstart', handleStart, { passive: true });
    container.addEventListener('touchmove', handleMove, { passive: true });
    container.addEventListener('touchend', handleEnd);
    container.addEventListener('touchcancel', handleEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    container.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      window.removeEventListener('resize', init);
      
      container.removeEventListener('touchstart', handleStart);
      container.removeEventListener('touchmove', handleMove);
      container.removeEventListener('touchend', handleEnd);
      container.removeEventListener('touchcancel', handleEnd);
      container.removeEventListener('wheel', handleWheel);
      
      container.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [snapToIndex]);

  return (
    <div 
      ref={containerRef} 
      className={`gallery relative w-full overflow-hidden touch-pan-y ${className || ''}`}
      style={{ touchAction: 'pan-y' }}
    >
      <div 
        ref={innerRef} 
        className="gallery-inner flex h-full will-change-transform"
      >
        {React.Children.map(children, (child) => (
          <div className="slide w-full h-full flex-shrink-0" style={{ width: '100%' }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
});

ProductGallery.displayName = 'ProductGallery';

export default ProductGallery;
