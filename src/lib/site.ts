export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const SITE_NAME = 'ExhaustNote';
export const SITE_DESCRIPTION =
  'バイクのマフラー排気音を、メーカー・車種・製品ごとに実際の音源で確認できる音メディア。';

export const VENDOR_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  rakuten: '楽天',
  webike: 'Webike',
};

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  'slip-on': 'スリップオン',
  'full-exhaust': 'フルエキゾースト',
  oem: '純正 (OEM)',
};

export function manufacturerPath(manufacturerSlug: string): string {
  return `/${manufacturerSlug}`;
}
export function bikePath(manufacturerSlug: string, bikeSlug: string): string {
  return `/${manufacturerSlug}/${bikeSlug}`;
}
export function mufflerPath(manufacturerSlug: string, bikeSlug: string, mufflerSlug: string): string {
  return `/${manufacturerSlug}/${bikeSlug}/${mufflerSlug}`;
}

// 音源のsrc。Keystaticのfileフィールドは "/sounds/xxx" を返すのでそのまま使う。
// 外部URL（https://）にも対応。
export function soundSrc(value?: string | null): string {
  return value ? value : '';
}
