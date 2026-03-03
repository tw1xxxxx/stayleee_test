import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  images: {
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
