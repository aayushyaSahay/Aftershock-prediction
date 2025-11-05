/** @type {import('next').NextConfig} */

const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['earthquake.usgs.gov'],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };

    return config;
  },
}

module.exports = nextConfig