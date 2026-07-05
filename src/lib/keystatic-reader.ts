import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

// ローカルモードではビルド時にリポジトリ内の src/content/** を読み込む。
export const reader = createReader(process.cwd(), keystaticConfig);

export type ManufacturerData = { slug: string; name: string; order: number };
export type BikeData = { slug: string; name: string; manufacturer: string; order: number };
export type AffiliateData = { vendor: string; url: string; isPrimary: boolean };
export type MufflerData = {
  slug: string;
  name: string;
  bike: string;
  brandName: string;
  productType: string;
  material: string;
  priceJpy: number | null;
  jmcaApproved: boolean;
  description: string;
  sound: string | null;
  soundCaption: string;
  order: number;
  affiliates: AffiliateData[];
};

const byOrderThenName = <T extends { order: number; name: string }>(a: T, b: T) =>
  a.order - b.order || a.name.localeCompare(b.name, 'ja');

// ---------- Manufacturers ----------
export async function getManufacturers(): Promise<ManufacturerData[]> {
  const all = await reader.collections.manufacturers.all();
  return all
    .map((m) => ({ slug: m.slug, name: m.entry.name, order: m.entry.order ?? 0 }))
    .sort(byOrderThenName);
}

export async function getManufacturer(slug: string): Promise<ManufacturerData | null> {
  const entry = await reader.collections.manufacturers.read(slug);
  if (!entry) return null;
  return { slug, name: entry.name, order: entry.order ?? 0 };
}

// ---------- Bikes ----------
export async function getBikes(): Promise<BikeData[]> {
  const all = await reader.collections.bikes.all();
  return all.map((b) => ({
    slug: b.slug,
    name: b.entry.name,
    manufacturer: b.entry.manufacturer ?? '',
    order: b.entry.order ?? 0,
  }));
}

export async function getBikesByManufacturer(manufacturerSlug: string): Promise<BikeData[]> {
  const bikes = await getBikes();
  return bikes.filter((b) => b.manufacturer === manufacturerSlug).sort(byOrderThenName);
}

export async function getBike(slug: string): Promise<BikeData | null> {
  const entry = await reader.collections.bikes.read(slug);
  if (!entry) return null;
  return { slug, name: entry.name, manufacturer: entry.manufacturer ?? '', order: entry.order ?? 0 };
}

// ---------- Mufflers ----------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMuffler(slug: string, entry: any): MufflerData {
  return {
    slug,
    name: entry.name,
    bike: entry.bike ?? '',
    brandName: entry.brandName ?? '',
    productType: entry.productType ?? 'slip-on',
    material: entry.material ?? '',
    priceJpy: entry.priceJpy ?? null,
    jmcaApproved: Boolean(entry.jmcaApproved),
    description: entry.description ?? '',
    sound: entry.sound ?? null,
    soundCaption: entry.soundCaption ?? '',
    order: entry.order ?? 0,
    affiliates: Array.isArray(entry.affiliates)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entry.affiliates.map((a: any) => ({
          vendor: a.vendor ?? 'amazon',
          url: a.url ?? '',
          isPrimary: Boolean(a.isPrimary),
        }))
      : [],
  };
}

export async function getMufflers(): Promise<MufflerData[]> {
  const all = await reader.collections.mufflers.all();
  return all.map((m) => toMuffler(m.slug, m.entry));
}

export async function getMufflersByBike(bikeSlug: string): Promise<MufflerData[]> {
  const mufflers = await getMufflers();
  return mufflers.filter((m) => m.bike === bikeSlug).sort(byOrderThenName);
}

export async function getMuffler(slug: string): Promise<MufflerData | null> {
  const entry = await reader.collections.mufflers.read(slug);
  if (!entry) return null;
  return toMuffler(slug, entry);
}

// ---------- URL パラメータ組み立て（generateStaticParams / sitemap 用）----------
export type MufflerParams = { manufacturer: string; bike: string; muffler: string };

export async function getAllMufflerParams(): Promise<MufflerParams[]> {
  const [bikes, mufflers] = await Promise.all([getBikes(), getMufflers()]);
  const bikeToManufacturer = new Map(bikes.map((b) => [b.slug, b.manufacturer]));
  const out: MufflerParams[] = [];
  for (const m of mufflers) {
    const manufacturer = bikeToManufacturer.get(m.bike);
    if (manufacturer) out.push({ manufacturer, bike: m.bike, muffler: m.slug });
  }
  return out;
}

export async function getAllBikeParams(): Promise<{ manufacturer: string; bike: string }[]> {
  const bikes = await getBikes();
  return bikes
    .filter((b) => b.manufacturer)
    .map((b) => ({ manufacturer: b.manufacturer, bike: b.slug }));
}
