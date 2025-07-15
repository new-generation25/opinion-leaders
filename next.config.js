import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/opinion-leader',
  assetPrefix: '/opinion-leader',
  images: {
    unoptimized: true,
  },
};

export default nextConfig; 