/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "res.cloudinary.com" }, // For Cloudinary uploads
    ],
    unoptimized: false,
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizePackageImports: ['recharts', 'lucide-react'],
  },

  // Webpack configuration
  webpack: (config, { dev }) => {
    // Let Next.js handle devtool configuration
    return config;
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Build configuration - Temporarily ignore errors for testing
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Performance optimizations
  reactStrictMode: true,
  swcMinify: true,

  // API rewrites (if needed)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Headers for security
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Allow scripts in development mode to prevent CSP issues
          ...(isDev ? [{
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* https://localhost:* blob: data: 'unsafe-eval' https://esm.sh; object-src 'none'; base-uri 'self'; frame-src 'self' blob: data:; connect-src 'self' http://localhost:* https://localhost:* https://esm.sh ws://localhost:* wss://localhost:*;",
          }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
