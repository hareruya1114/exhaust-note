import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getManufacturer,
  getManufacturers,
  getBikesByManufacturer,
  getMufflersByBike,
} from '@/lib/keystatic-reader';
import { bikePath, manufacturerPath } from '@/lib/site';
import { SelectCard } from '@/components/SelectCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const dynamicParams = false;

export async function generateStaticParams() {
  const manufacturers = await getManufacturers();
  return manufacturers.map((m) => ({ manufacturer: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { manufacturer: string };
}): Promise<Metadata> {
  const m = await getManufacturer(params.manufacturer);
  if (!m) return {};
  return {
    title: `${m.name} のマフラー音一覧`,
    description: `${m.name} の車種別に、マフラーの排気音を実際の音源で確認できます。`,
    alternates: { canonical: manufacturerPath(m.slug) },
  };
}

export default async function ManufacturerPage({
  params,
}: {
  params: { manufacturer: string };
}) {
  const m = await getManufacturer(params.manufacturer);
  if (!m) notFound();

  const bikes = await getBikesByManufacturer(m.slug);
  const counts = await Promise.all(bikes.map(async (b) => (await getMufflersByBike(b.slug)).length));

  return (
    <div className="px-4 pb-10 pt-4">
      <Breadcrumbs
        crumbs={[
          { name: 'HOME', path: '/' },
          { name: m.name, path: manufacturerPath(m.slug) },
        ]}
      />

      <h1 className="text-2xl font-black leading-tight">{m.name} の車種</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-titanium-300">
        音を聴きたい車種を選んでください。
      </p>

      <h2 className="mb-2.5 mt-6 text-base font-bold">車種を選ぶ</h2>
      <div className="grid gap-2">
        {bikes.map((b, i) => (
          <SelectCard
            key={b.slug}
            href={bikePath(m.slug, b.slug)}
            icon="🏍️"
            title={b.name}
            tags={`マフラー ${counts[i]} 種の音を収録`}
          />
        ))}
        {bikes.length === 0 && (
          <p className="text-sm text-titanium-500">
            このメーカーにはまだ車種が登録されていません。
          </p>
        )}
      </div>
    </div>
  );
}
