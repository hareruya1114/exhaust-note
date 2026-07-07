import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getMuffler,
  getBike,
  getManufacturer,
  getMufflersByBike,
  getAllMufflerParams,
} from '@/lib/keystatic-reader';
import {
  bikePath,
  manufacturerPath,
  mufflerPath,
  soundSrc,
  PRODUCT_TYPE_LABELS,
} from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SoundPlayer } from '@/components/SoundPlayer';
import { AffiliateCTA } from '@/components/AffiliateCTA';
import { SelectCard } from '@/components/SelectCard';
import { JsonLd } from '@/components/JsonLd';
import { productLd } from '@/lib/jsonld';

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllMufflerParams();
}

async function resolve(params: { manufacturer: string; bike: string; muffler: string }) {
  const muffler = await getMuffler(params.muffler);
  if (!muffler || muffler.bike !== params.bike) return null;
  const bike = await getBike(params.bike);
  if (!bike || bike.manufacturer !== params.manufacturer) return null;
  const manufacturer = await getManufacturer(params.manufacturer);
  if (!manufacturer) return null;
  return { muffler, bike, manufacturer };
}

export async function generateMetadata({
  params,
}: {
  params: { manufacturer: string; bike: string; muffler: string };
}): Promise<Metadata> {
  const data = await resolve(params);
  if (!data) return {};
  const { muffler, bike, manufacturer } = data;
  const bikeName = `${manufacturer.name} ${bike.name}`;
  const title = `${bikeName} ${muffler.brandName} ${muffler.name} の排気音`;
  const description =
    muffler.description ||
    `${bikeName} に装着した ${muffler.brandName} ${muffler.name} の排気音を実際の音源で確認できます。`;
  return {
    title,
    description,
    alternates: { canonical: mufflerPath(params.manufacturer, params.bike, params.muffler) },
    openGraph: { title, description, type: 'article' },
  };
}

export default async function MufflerPage({
  params,
}: {
  params: { manufacturer: string; bike: string; muffler: string };
}) {
  const data = await resolve(params);
  if (!data) notFound();
  const { muffler, bike, manufacturer } = data;

  const bikeName = `${manufacturer.name} ${bike.name}`;
  const src = soundSrc(muffler.sound);
  const primaryAffiliate =
    muffler.affiliates.find((l) => l.isPrimary && l.url) ??
    muffler.affiliates.find((l) => l.url) ??
    null;

  const siblings = (await getMufflersByBike(bike.slug)).filter((s) => s.slug !== muffler.slug);

  return (
    <div className="px-4 pb-10 pt-4">
      <JsonLd
        data={productLd({
          name: `${bikeName} ${muffler.brandName} ${muffler.name}`,
          brandName: muffler.brandName,
          url: mufflerPath(params.manufacturer, params.bike, params.muffler),
          priceJpy: muffler.priceJpy,
          offerUrl: primaryAffiliate?.url ?? null,
          description: muffler.description,
        })}
      />

      <Breadcrumbs
        crumbs={[
          { name: 'HOME', path: '/' },
          { name: manufacturer.name, path: manufacturerPath(params.manufacturer) },
          { name: bike.name, path: bikePath(params.manufacturer, params.bike) },
          {
            name: `${muffler.brandName} ${muffler.name}`,
            path: mufflerPath(params.manufacturer, params.bike, params.muffler),
          },
        ]}
      />

      <h1 className="text-2xl font-black leading-tight">
        {bikeName}
        <br />
        {muffler.brandName} {muffler.name}
        <br />
        の排気音
      </h1>
      {muffler.description && (
        <p className="mt-2 text-[13px] leading-relaxed text-titanium-300">{muffler.description}</p>
      )}

      {muffler.image && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-asphalt-700 bg-asphalt-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={muffler.image}
            alt={`${muffler.brandName} ${muffler.name}`}
            loading="lazy"
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      <SoundPlayer
        src={src}
        brandLabel={`${muffler.brandName} / ${bike.name}`}
        caption={muffler.soundCaption}
      />

      <h2 className="mb-2.5 mt-6 text-base font-bold">製品スペック</h2>
      <dl className="overflow-hidden rounded-xl border border-asphalt-700 text-[13px]">
        <SpecRow label="ブランド" value={muffler.brandName} />
        <SpecRow label="タイプ" value={PRODUCT_TYPE_LABELS[muffler.productType] ?? muffler.productType} />
        {muffler.material && <SpecRow label="材質" value={muffler.material} />}
        <SpecRow
          label="車検"
          value={
            muffler.jmcaApproved ? (
              <span className="text-[#5fd39a]">✓ JMCA認証（車検対応の目安）</span>
            ) : (
              <span className="text-burnt-400">△ 車検適合は要確認</span>
            )
          }
        />
        {muffler.priceJpy && muffler.priceJpy > 0 && (
          <SpecRow label="参考価格" value={`¥${muffler.priceJpy.toLocaleString('ja-JP')}（税込）`} />
        )}
      </dl>

      <AffiliateCTA links={muffler.affiliates} />

      {siblings.length > 0 && (
        <>
          <h2 className="mb-2.5 mt-6 text-base font-bold">{bike.name} の他のマフラー</h2>
          <div className="grid gap-2">
            {siblings.map((s) => (
              <SelectCard
                key={s.slug}
                href={mufflerPath(params.manufacturer, params.bike, s.slug)}
                icon="🔊"
                overline={s.brandName}
                title={s.name}
                tags={s.jmcaApproved ? '車検◎' : '車検△'}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex border-b border-asphalt-800 last:border-b-0">
      <dt className="w-[38%] shrink-0 bg-asphalt-800 px-3 py-2.5 font-bold text-titanium-300">{label}</dt>
      <dd className="flex-1 px-3 py-2.5">{value}</dd>
    </div>
  );
}
