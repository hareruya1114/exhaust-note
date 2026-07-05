import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getBike,
  getManufacturer,
  getMufflersByBike,
  getAllBikeParams,
  type MufflerData,
} from '@/lib/keystatic-reader';
import { bikePath, manufacturerPath, mufflerPath } from '@/lib/site';
import { SelectCard } from '@/components/SelectCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllBikeParams();
}

export async function generateMetadata({
  params,
}: {
  params: { manufacturer: string; bike: string };
}): Promise<Metadata> {
  const bike = await getBike(params.bike);
  if (!bike || bike.manufacturer !== params.manufacturer) return {};
  const manufacturer = await getManufacturer(params.manufacturer);
  const makerName = manufacturer?.name ?? params.manufacturer;
  const title = `${makerName} ${bike.name} のマフラー音一覧`;
  return {
    title,
    description: `${makerName} ${bike.name} に装着できるマフラーの排気音・スペック・車検適合をまとめています。`,
    alternates: { canonical: bikePath(params.manufacturer, params.bike) },
    openGraph: { title },
  };
}

function tagsFor(m: MufflerData): string {
  const parts: string[] = [m.brandName];
  parts.push(m.jmcaApproved ? '車検◎' : '車検△');
  if (m.priceJpy && m.priceJpy > 0) parts.push(`¥${m.priceJpy.toLocaleString('ja-JP')}`);
  return parts.filter(Boolean).join(' ・ ');
}

export default async function BikePage({
  params,
}: {
  params: { manufacturer: string; bike: string };
}) {
  const bike = await getBike(params.bike);
  if (!bike || bike.manufacturer !== params.manufacturer) notFound();

  const manufacturer = await getManufacturer(params.manufacturer);
  const makerName = manufacturer?.name ?? params.manufacturer;
  const mufflers = await getMufflersByBike(bike.slug);

  return (
    <div className="px-4 pb-10 pt-4">
      <Breadcrumbs
        crumbs={[
          { name: 'HOME', path: '/' },
          { name: makerName, path: manufacturerPath(params.manufacturer) },
          { name: bike.name, path: bikePath(params.manufacturer, params.bike) },
        ]}
      />

      <h1 className="text-2xl font-black leading-tight">
        {makerName} {bike.name}
        <br />
        のマフラー
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-titanium-300">
        装着できるマフラーごとに実際の排気音を収録。気になる1本をタップ。
      </p>

      <h2 className="mb-2.5 mt-6 text-base font-bold">マフラーを選ぶ</h2>
      <div className="grid gap-2">
        {mufflers.map((m) => (
          <SelectCard
            key={m.slug}
            href={mufflerPath(params.manufacturer, params.bike, m.slug)}
            icon="🔊"
            overline={m.brandName}
            title={m.name}
            tags={tagsFor(m)}
          />
        ))}
        {mufflers.length === 0 && (
          <p className="text-sm text-titanium-500">
            この車種にはまだマフラーが登録されていません。
          </p>
        )}
      </div>
    </div>
  );
}
