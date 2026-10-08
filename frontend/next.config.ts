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
        pathname: '/mkayvtvj/**',
      },
      {
        protocol: 'https',
        hostname: 'render.com',
        pathname: '/**',
      },
    ],
    // `domains` used to sit here alongside these patterns. It is deprecated in
    // Next 15, and it allowed every path on res.cloudinary.com - which quietly
    // undid the point of pinning the cloud name above.
    //
    // Optimisation stays off. Next would otherwise resize and re-encode every
    // image in-process on a 1-2 GB droplet that is also running the API, and
    // Cloudinary already does that work at the CDN edge - utils/imageUtils.ts
    // builds the transformation into the URL. Note that while this is true the
    // remotePatterns above are not enforced at all, since no image passes
    // through the optimiser; they matter the moment this is turned off.
    unoptimized: true,
  },
};

export default removeImports(nextConfig);