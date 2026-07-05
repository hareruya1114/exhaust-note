import type { MetadataRoute } from 'next';
import {
  getManufacturers,
  getAllBikeParams,
  getAllMufflerParams,
} from '@/lib/keystatic-reader';
import { SITE_URL, manufacturerPath, bikePath, mufflerPath } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
  ];

  const [makers, bikes, mufflers] = await Promise.all([
    getManufacturers(),
    getAllBikeParams(),
    getAllMufflerParams(),
  ]);

  for (const m of makers) {
    entries.push({
      url: `${SITE_URL}${manufacturerPath(m.slug)}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }
  for (const b of bikes) {
    entries.push({
      url: `${SITE_URL}${bikePath(b.manufacturer, b.bike)}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }
  for (const p of mufflers) {
    entries.push({
      url: `${SITE_URL}${mufflerPath(p.manufacturer, p.bike, p.muffler)}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  return entries;
}
