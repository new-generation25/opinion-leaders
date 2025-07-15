/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/opinion-leaders',
  assetPrefix: '/opinion-leaders',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig; 