import { config, fields, collection } from '@keystatic/core';

// "オーナー名/リポジトリ名" が設定されていれば GitHub モード、無ければローカルモード。
const githubRepo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO;

export default config({
  storage: githubRepo
    ? { kind: 'github', repo: githubRepo as `${string}/${string}` }
    : { kind: 'local' },

  ui: {
    brand: { name: 'ExhaustNote 管理' },
  },

  collections: {
    // ---- メーカー ----
    manufacturers: collection({
      label: 'メーカー',
      slugField: 'name',
      path: 'src/content/manufacturers/*',
      schema: {
        name: fields.slug({
          name: { label: 'メーカー名', validation: { length: { min: 1 } } },
          slug: {
            label: 'slug（URLに使う・半角英数字とハイフン）',
            description: '例: kawasaki',
          },
        }),
        logo: fields.image({
          label: 'ロゴ画像（任意）',
          description: '一覧の丸アイコンの代わりに表示されます。未設定なら色付きの丸を表示。',
          directory: 'public/logos',
          publicPath: '/logos/',
        }),
        order: fields.integer({ label: '表示順（小さいほど先）', defaultValue: 0 }),
      },
    }),

    // ---- 車種 ----
    bikes: collection({
      label: '車種',
      slugField: 'name',
      path: 'src/content/bikes/*',
      schema: {
        name: fields.slug({
          name: { label: '車種名', validation: { length: { min: 1 } } },
          slug: {
            label: 'slug（URLに使う・サイト全体で一意に）',
            description: '例: ninja-400',
          },
        }),
        manufacturer: fields.relationship({
          label: 'メーカー',
          collection: 'manufacturers',
          validation: { isRequired: true },
        }),
        image: fields.image({
          label: '車種の画像（任意）',
          description: '車種一覧のサムネイルとして表示されます。未設定ならバイク絵文字を表示。',
          directory: 'public/bikes',
          publicPath: '/bikes/',
        }),
        order: fields.integer({ label: '表示順（小さいほど先）', defaultValue: 0 }),
      },
    }),

    // ---- マフラー（1製品 = 1音源）----
    mufflers: collection({
      label: 'マフラー',
      slugField: 'name',
      path: 'src/content/mufflers/*',
      schema: {
        name: fields.slug({
          name: {
            label: '製品名',
            description: '例: Slip-On R-77S サイクロン',
            validation: { length: { min: 1 } },
          },
          slug: {
            label: 'slug（URLに使う・サイト全体で一意に）',
            description: '例: ninja400-yoshimura-r77s',
          },
        }),
        bike: fields.relationship({
          label: '車種',
          collection: 'bikes',
          validation: { isRequired: true },
        }),
        brandName: fields.text({ label: 'ブランド', description: '例: ヨシムラ' }),
        productType: fields.select({
          label: 'タイプ',
          options: [
            { label: 'スリップオン', value: 'slip-on' },
            { label: 'フルエキゾースト', value: 'full-exhaust' },
            { label: '純正 (OEM)', value: 'oem' },
          ],
          defaultValue: 'slip-on',
        }),
        material: fields.text({ label: '材質（任意）', description: '例: チタン / ステンレス' }),
        priceJpy: fields.integer({
          label: '参考価格（円・任意）',
          validation: { isRequired: false, min: 0 },
        }),
        jmcaApproved: fields.checkbox({ label: 'JMCA認証（車検対応の目安）', defaultValue: false }),
        description: fields.text({ label: '説明（任意）', multiline: true }),
        sound: fields.file({
          label: '音源ファイル（1マフラー1本 / mp3など）',
          directory: 'public/sounds',
          publicPath: '/sounds/',
        }),
        soundCaption: fields.text({ label: '音源キャプション（任意）' }),
        order: fields.integer({ label: '表示順（小さいほど先）', defaultValue: 0 }),
        affiliates: fields.array(
          fields.object({
            vendor: fields.select({
              label: '販売元',
              options: [
                { label: 'Amazon', value: 'amazon' },
                { label: '楽天', value: 'rakuten' },
                { label: 'Webike', value: 'webike' },
              ],
              defaultValue: 'amazon',
            }),
            url: fields.text({ label: 'リンクURL', description: 'https:// から始まるURL' }),
            isPrimary: fields.checkbox({ label: 'メインCTAにする（1つだけ）', defaultValue: false }),
          }),
          {
            label: 'アフィリエイトリンク',
            itemLabel: (props) => props.fields.vendor.value,
          },
        ),
      },
    }),
  },
});
