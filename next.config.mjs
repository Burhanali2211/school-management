/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "res.cloudinary.com" }, // For Cloudinary uploads
      { hostname: "rsms.me" }, // For Inter font
      { hostname: "esm.sh" }, // For ES modules
    ],
    unoptimized: false,
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizePackageImports: ['recharts', 'lucide-react'],
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Fix for development server issues
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    // Ensure proper MIME types for JavaScript files
    config.module.rules.push({
      test: /\.js$/,
      type: 'javascript/auto',
    });

    // Handle ES modules properly
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
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
    ignoreBuildErrors: false, // Enable TypeScript checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checking
  },

  // Performance optimizations
  reactStrictMode: true,
  swcMinify: true,
  
  // Development server configuration
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

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
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
          // Updated CSP for better compatibility
          ...(isDev ? [{
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* https://localhost:* blob: data: https://esm.sh; style-src 'self' 'unsafe-inline' http://localhost:* https://localhost:* https://rsms.me; font-src 'self' data: https://rsms.me; img-src 'self' data: blob: http://localhost:* https://localhost:*; object-src 'none'; base-uri 'self'; frame-src 'self' blob: data:; connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https://esm.sh;",
          }] : [{
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://rsms.me; font-src 'self' https://rsms.me; img-src 'self' data: blob:; object-src 'none'; base-uri 'self'; frame-src 'self'; connect-src 'self';",
          }]),
        ],
      },
    ];
  },
};

export default nextConfig;
