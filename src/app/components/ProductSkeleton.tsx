import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] w-full rounded-xl skeleton-shimmer"></div>
      
      {/* Text Skeletons */}
      <div className="flex flex-col gap-2 mt-1">
        {/* Title line */}
        <div className="h-4 w-3/4 rounded-md skeleton-shimmer"></div>
        {/* Price line */}
        <div className="h-4 w-1/4 rounded-md skeleton-shimmer"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
