// filepath: next.config.ts
import type { NextConfig } from 'next';
import NextRemoveImports from 'next-remove-imports';

const removeImports = NextRemoveImports();

const nextConfig: NextConfig = {
  // Strips console.log from production builds. Application logging goes through
  // utils/logger, which already stays quiet outside development; this is the
  // backstop for any stray call that skips it. error and warn are kept - losing
  // those in production hides exactly what you need when something breaks.
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dzrgyxroo/**',
      },
      {
        protocol: 'https',
        hostname: 'render.com',
        pathname: '/**',
      },
    ],
    domains: ['res.cloudinary.com'],
    unoptimized: true,
  },
};

export default removeImports(nextConfig);