/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Optimize images
  images: {
    domains: ['logo.clearbit.com', 'assets.finnhub.io'],
    formats: ['image/avif', 'image/webp'],
  },

  // Reduce bundle size
  experimental: {
    optimizeCss: true,
  },

  // Rewrites — proxy /api/* to backend in production
  // In development, API calls go directly to localhost:8080
  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
