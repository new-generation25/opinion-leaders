/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/opinion-leader',
  assetPrefix: '/opinion-leader',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig; 