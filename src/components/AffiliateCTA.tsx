import { VENDOR_LABELS } from '@/lib/site';
import type { AffiliateData } from '@/lib/keystatic-reader';

export function AffiliateCTA({ links }: { links: AffiliateData[] }) {
  const valid = links.filter((l) => l.url);
  if (valid.length === 0) return null;

  const primary = valid.find((l) => l.isPrimary) ?? valid[0];
  const others = valid.filter((l) => l !== primary);

  return (
    <div className="mt-6 rounded-2xl border border-asphalt-700 bg-asphalt-900 p-4">
      <span className="mb-2.5 inline-block rounded bg-titanium-500 px-1.5 py-px text-[10px] font-bold text-asphalt-950">
        PR
      </span>
      <p className="mb-2.5 text-[13px] text-titanium-300">在庫・最新価格をチェック</p>
      <a
        href={primary.url}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="block rounded-xl bg-burnt-500 px-4 py-3.5 text-center text-[15px] font-black text-asphalt-950 transition hover:brightness-110"
      >
        {VENDOR_LABELS[primary.vendor] ?? primary.vendor} で購入する
      </a>
      {others.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
          {others.map((l, i) => (
            <a
              key={`${l.vendor}-${i}`}
              href={l.url}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="text-titanium-300 underline hover:text-titanium-100"
            >
              {VENDOR_LABELS[l.vendor] ?? l.vendor}で見る
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
