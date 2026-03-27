# dev-craft

Java の実務レシピとブラウザ完結ツールをまとめた開発者向けサイトのソースコードです。

**[dev-craft.dev](https://dev-craft.dev)**

## Java Recipes

外部ライブラリ不要の Pure Java サンプル集。Java 8 / 17 / 21 のバージョン差分付きで、コピーしてすぐ使える実務寄りのコード例を掲載しています。

- **116 記事** / 22 カテゴリ（日付・文字列・コレクション・ファイル I/O・ネットワーク・DB・並行処理・デザインパターンなど）
- **113 サンプル × 3 バージョン**（`examples/java/` に Java 8 / 17 / 21 の対応コードを収録）
- バージョンごとの書き方の違いをタブで比較
- 「そのまま業務に使える」を基準に選定

[Java Recipes を見る](https://dev-craft.dev/java/) / [サンプルコード](examples/java/)

## Browser Tools

サーバーにデータを送信しないブラウザ完結型のツール集。営業日計算、和暦変換、タイムゾーン変換など、開発や業務で地味に必要になる計算をその場で実行できます。

- **7 ツール公開中**: 営業日計算 / 日本の祝日 / 和暦変換 / タイムゾーン変換 / 消費税計算 / 割合・パーセント計算 / 単位変換
- すべての処理がブラウザ内で完結
- 入力データは外部に送信されません

[Browser Tools を見る](https://dev-craft.dev/tools/)

## 技術スタック

| 技術 | 用途 |
|---|---|
| [Next.js](https://nextjs.org/) 16 (App Router) | フレームワーク / 静的エクスポート |
| TypeScript | 型安全 |
| Tailwind CSS + CSS 変数 | スタイリング |
| Vitest | テスト |
| [Cloudflare Pages](https://pages.cloudflare.com/) | ホスティング |

## ディレクトリ構成

```
app/
  _data/           ← コンテンツデータ（記事・ツール・検索インデックス）
  _components/     ← 共通コンポーネント
  java/            ← Java Recipes（動的ルート）
  tools/           ← Browser Tools（動的ルート + UI + ロジック）
  about/ contact/ privacy/ terms/
examples/
  java/            ← Java サンプルコード（Java 8 / 17 / 21）
plan/              ← サイト方針・計画
public/            ← 静的ファイル
```

## 開発

```bash
npm install
npm run dev     # 開発サーバー
npm run test    # テスト
npm run build   # 静的ビルド → out/
```

## ライセンス

- ソースコード・サンプルコード: [MIT License](LICENSE)
- サイト本文・解説文・画像: All rights reserved
