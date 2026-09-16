import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cache Components zapínají nový model cache a částečné předvykreslení (PPR).
  cacheComponents: true,
};

export default nextConfig;
