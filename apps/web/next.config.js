const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // 🔴 FIX 1: Correct package name ('@repo/shared' was wrong → SocketEvents was undefined)
    transpilePackages: ["@postrestoran/shared"],
    output: 'standalone',
    experimental: {
        // Trace dependencies across the entire monorepo
        outputFileTracingRoot: path.join(__dirname, '../../'),
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          // 🔴 FIX 2: 'localhost' resolves to this container inside Docker, not the api service.
          // Use INTERNAL_API_URL (server-side) which points to the 'api' Docker service.
          destination: `${process.env.INTERNAL_API_URL || 'http://localhost:3001'}/api/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${process.env.INTERNAL_API_URL || 'http://localhost:3001'}/uploads/:path*`,
        },
      ];
    },
};

module.exports = nextConfig;
