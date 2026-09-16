import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Pro běh v kontejneru: build vyrobí .next/standalone se serverem a potřebnými balíčky.
  output: 'standalone',
};

export default nextConfig;
