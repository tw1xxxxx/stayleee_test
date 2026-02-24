import React from 'react';

export default function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-brand-beige font-sans pb-20 relative overflow-x-hidden animate-pulse">
      {/* Floating Back Button Skeleton */}
      <div className="absolute top-4 left-4 z-[100] w-10 h-10 bg-gray-300 rounded-full" />

      {/* Image Gallery Skeleton */}
      <div className="relative w-full aspect-[3/4] md:aspect-video bg-gray-300 overflow-hidden" />

      {/* Thumbnails Skeleton */}
      <div className="grid grid-cols-4 gap-2 px-4 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-300 rounded-lg" />
        ))}
      </div>

      <div className="px-4 mt-6">
        {/* Title & Price Skeleton */}
        <div className="h-8 w-3/4 bg-gray-300 rounded mb-2" />
        <div className="h-6 w-1/3 bg-gray-300 rounded mb-6" />
        
        {/* Description Skeleton */}
        <div className="space-y-2 mb-8">
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-4 w-5/6 bg-gray-300 rounded" />
          <div className="h-4 w-4/6 bg-gray-300 rounded" />
        </div>

        {/* Selectors Skeleton */}
        <div className="space-y-6 mb-8">
          {/* Size Selector */}
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-300 rounded" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-300" />
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-300 rounded" />
            <div className="flex gap-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-300" />
              ))}
            </div>
          </div>
        </div>

        {/* Add to Cart Button Skeleton */}
        <div className="w-full h-14 bg-gray-300 rounded-sm mb-10" />
      </div>
    </div>
  );
}
