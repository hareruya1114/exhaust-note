# ExhaustNote（Keystatic 版）

バイクのマフラー排気音メディア。**データベースなし・自前ログインなし・AWSなし**。
コンテンツはリポジトリ内のファイル（`src/content/**`）として持ち、管理画面は **Keystatic**（GitHubログイン）です。

- Next.js 14（App Router）/ TypeScript
- Keystatic（ファイルベースCMS・Gitにコミットして保存）
- メーカー → 車種 → マフラーのドリルダウン。1マフラー = 1ページ = 1音源。
- 静的生成（SSG）なのでSEOに有利。ホスティングは Vercel の無料枠でOK。

> **なぜこの構成か**：以前の「DB＋NextAuth」版はログイン用の管理者データをDBに投入する必要があり、そこで詰まりました。Keystatic はログインが **GitHubアカウントそのもの**なので、その事故が起きません。

---

## 1. ローカルで動かす

前提: Node.js 18.18 以上。

```bash
npm install
npm run dev
```

- 公開サイト: http://localhost:3000
- 管理画面: http://localhost:3000/keystatic

ローカルでは Keystatic は **ローカルモード**で動き、`/keystatic` での編集がそのまま `src/content/**` のファイルに保存されます（ログイン不要）。`.env` も基本的に不要です（公開URLを変えたい場合のみ `NEXT_PUBLIC_SITE_URL` を設定）。

---

## 2. コンテンツの持ち方

```
src/content/
  manufacturers/   メーカー（例 kawasaki.yaml）
  bikes/           車種（例 ninja-400.yaml）
  mufflers/        マフラー（例 ninja400-yoshimura-r77s.yaml）
public/sounds/     音源ファイル（Keystaticからアップロードするとここに入る）
```

- **ファイル名＝slug＝URL** です。`/keystatic` の各フォームにある「slug」がそのままURLになります。
- **slugはサイト全体で一意に**してください（車種・マフラーはコレクション内で重複不可）。例: 車種 `ninja-400`、マフラー `ninja400-yoshimura-r77s` のように、車種名を接頭辞に付けると衝突しません。
- メーカー同士・車種・マフラーの紐付けは、フォームの「メーカー」「車種」プルダウン（relationship）で選ぶだけです。

### 音源の追加

マフラーの編集画面で「音源ファイル」に mp3 等をアップロードすると、`public/sounds/` に保存され、ページの再生ボタンで鳴ります。音源が未設定なら「準備中」と表示されます。

> 音源が増えてリポジトリが重くなってきたら、後から Cloudflare R2 等の外部ストレージに移し、`sound` に完全なURL（`https://…`）を入れる運用にも切り替えられます（コードは絶対URLをそのまま使います）。

---

## 3. URL 構成

| URL | 内容 |
| --- | --- |
| `/` | メーカー一覧 |
| `/[manufacturer]` | 車種一覧（例 `/kawasaki`） |
| `/[manufacturer]/[bike]` | マフラー一覧（例 `/kawasaki/ninja-400`） |
| `/[manufacturer]/[bike]/[muffler]` | マフラー専用ページ・排気音（例 `/kawasaki/ninja-400/ninja400-yoshimura-r77s`） |
| `/keystatic` | 管理画面 |
| `/sitemap.xml`, `/robots.txt` | SEO |

比較機能・回転数ごとの音源分割・音の特徴スコアは持ちません。全ページ静的生成で、内容を変えたら再デプロイで反映されます。

---

## 4. Vercel にデプロイ（無料）

1. このプロジェクトを GitHub リポジトリにプッシュする。
2. [Vercel](https://vercel.com) で「New Project」→ そのリポジトリを import。フレームワークは Next.js が自動検出されます。
3. 環境変数に `NEXT_PUBLIC_SITE_URL`（本番URL、例 `https://your-app.vercel.app`）を設定してデプロイ。

この時点で公開サイトは動きます。`/keystatic` はまだローカル編集用なので、**オンライン編集を有効にするには次の「GitHubモード」を設定**します。

---

## 5. オンライン編集を有効にする（Keystatic GitHub モード）

本番の `/keystatic` から編集して「Save」すると、GitHub にコミット → Vercel が自動再デプロイ、という流れになります。

### 手順

1. `keystatic.config.ts` はリポジトリ名の環境変数を見て自動でGitHubモードに切り替わります。ローカルの `.env` に次を追加:
   ```
   NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO="あなたのGitHubユーザー名/リポジトリ名"
   ```
2. ローカルで `npm run dev` し、http://localhost:3000/keystatic を開く → 「**Connect to GitHub**」を実行。
   画面の指示に従うと GitHub App が作成され、`.env` に次の4つが**自動で書き込まれます**:
   ```
   KEYSTATIC_GITHUB_CLIENT_ID=...
   KEYSTATIC_GITHUB_CLIENT_SECRET=...
   KEYSTATIC_SECRET=...
   NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=...
   ```
3. この4つ **＋ `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO`** を、Vercel のプロジェクト設定 → Environment Variables にコピーして再デプロイ。
   （Vercelの環境変数入力欄は `.env` の中身をまるごと貼り付けると個別に展開されます。）
4. 本番の `https://your-app.vercel.app/keystatic` にアクセスし、GitHubでログイン。リポジトリに書き込み権限がある人だけが編集できます。

### つまずきやすい点

- **GitHub App（OAuth Appではない）** が必要です。上の「Connect to GitHub」フローが自動で正しく作ります。
- ログイン時に `redirect_uri … localhost` というエラーが出たら、GitHub App の設定で **Callback URL** が本番URL（`https://your-app.vercel.app/api/keystatic/github/oauth/callback`）になっているか確認してください。
- Vercel（Nodeランタイム）向けの構成です。Cloudflare Pages の Edge ランタイムは Keystatic のGitHub認証と相性問題が報告されているため推奨しません。

---

## 6. 主なコマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー（+ ローカル編集の `/keystatic`） |
| `npm run build` | 本番ビルド（`src/content` を読んで静的生成） |
| `npm start` | 本番サーバー |

---

## 注意点

- 同梱の音源は**未設定（準備中表示）**、アフィリエイトURL・価格・スペックは**サンプル**です。`/keystatic` から差し替えてください。
- 車検適合（JMCA）は目安です。年式・保安基準により異なります。
