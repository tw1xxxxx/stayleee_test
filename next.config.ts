import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* Trigger redeploy - Optimization: disable source maps to save memory */
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true, // Skip type checking during build
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  reactCompiler: true,
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
