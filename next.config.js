/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  env: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Improve build performance
  poweredByHeader: false,
  // For Vercel deployment
  reactStrictMode: false,
  trailingSlash: true,
};

module.exports = nextConfig; 