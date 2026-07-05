import type { Metadata } from 'next';
import { getManufacturers, getBikesByManufacturer } from '@/lib/keystatic-reader';
import { manufacturerPath, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';
import { SelectCard } from '@/components/SelectCard';
import { JsonLd } from '@/components/JsonLd';
import { websiteLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: `${SITE_NAME} — バイクのマフラー排気音を聴いて選ぶ`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

const MAKER_ICON: Record<string, string> = {
  kawasaki: '🟢',
  honda: '🔴',
  yamaha: '🔵',
  suzuki: '🟡',
};

export default async function HomePage() {
  const manufacturers = await getManufacturers();
  const counts = await Promise.all(
    manufacturers.map(async (m) => (await getBikesByManufacturer(m.slug)).length),
  );

  return (
    <div className="px-4 pb-10 pt-4">
      <JsonLd data={websiteLd()} />

      <section className="mb-2 rounded-2xl border border-asphalt-700 bg-asphalt-900 p-5">
        <h1 className="text-2xl font-black leading-tight">
          そのマフラー、
          <br />
          買う前に音を聴く。
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-titanium-300">
          メーカー → 車種 → マフラーの順に選ぶと、実際の排気音を1本の音源で聴けます。
        </p>
      </section>

      <h2 className="mb-2.5 mt-6 text-base font-bold">バイクメーカーを選ぶ</h2>
      <div className="grid gap-2">
        {manufacturers.map((m, i) => (
          <SelectCard
            key={m.slug}
            href={manufacturerPath(m.slug)}
            icon={MAKER_ICON[m.slug] ?? '🏍️'}
            imageSrc={m.logo ?? undefined}
            imageFit="contain"
            imageAlt={`${m.name} ロゴ`}
            title={m.name}
            tags={`車種 ${counts[i]} 件`}
          />
        ))}
        {manufacturers.length === 0 && (
          <p className="text-sm text-titanium-500">
            メーカーが登録されていません。/keystatic から追加してください。
          </p>
        )}
      </div>
    </div>
  );
}
