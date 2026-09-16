import type { MetadataRoute } from 'next';

import { vsechnyInzeraty } from '@/lib/data.ts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const zaklad = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
  const polozky = await vsechnyInzeraty();

  return [
    { url: `${zaklad}/`, changeFrequency: 'monthly' },
    { url: `${zaklad}/inzeraty`, changeFrequency: 'daily' },
    ...polozky.map((inzerat) => ({
      url: `${zaklad}/inzeraty/${inzerat.slug}`,
      lastModified: inzerat.vytvoreno,
    })),
  ];
}
