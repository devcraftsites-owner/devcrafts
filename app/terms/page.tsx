import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "利用条件 — 免責事項・コード MIT ライセンス・著作権の区分",
  description: "dev-craft の免責事項、利用上の注意、禁止事項について定めています。GitHub 公開コードは MIT ライセンス、サイト本文・記事解説文・画像は通常の著作権保護の対象です。利用前にご確認ください。",
  alternates: { canonical: "./" },
}

const sections = [
  {
    title: "免責",
    body: "このサイトに掲載している情報、コード例、ツールの計算結果について、正確性・完全性・最新性を保証するものではありません。ご利用により生じた損害について、運営者は責任を負いかねます。",
  },
  {
    title: "利用上の注意",
    body: "コード例やツールは参考情報として提供しています。実運用へ適用される際は、ご自身の環境や要件に合わせて検証のうえご利用ください。",
  },
  {
    title: "禁止事項",
    body: "以下の行為はご遠慮ください。法令または公序良俗に反する行為、サーバーやネットワークへ過度な負荷を与える行為、第三者の権利を侵害する行為、虚偽の内容による問い合わせの送信。",
  },
  {
    title: "変更・停止",
    body: "このサイトの内容、掲載情報、ツール、問い合わせ窓口は、予告なく変更・停止・削除する場合があります。",
  },
  {
    title: "コンテンツ利用条件",
    body: "GitHub で公開しているコード、サンプル、リポジトリ内のコード資産は MIT ライセンスで提供しています。一方、サイト本文、記事の解説文、ページ構成文言、画像などは MIT ライセンスの適用対象外であり、別途明示しない限り通常の著作権保護の対象となります。",
  },
]

export default function TermsPage() {
  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <p className="eyebrow">Terms</p>
          <h1 className="hero-title hero-title--compact">利用条件</h1>
          <p className="hero-copy">
            コード資産の MIT ライセンスと、サイト本文の著作権保護範囲を分けて明示します。
          </p>
        </div>
      </section>

      <article className="panel">
        <div className="info-page__sections">
          {sections.map((section) => (
            <section key={section.title} className="info-page__section">
              <h2 className="section-title">{section.title}</h2>
              <p className="section-copy">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  )
}
