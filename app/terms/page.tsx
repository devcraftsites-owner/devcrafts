const sections = [
  {
    title: "免責",
    body: "本サイトの情報、コード例、ツール結果について、正確性、完全性、最新性を保証しません。利用により生じた損害について、運営者は責任を負いません。",
  },
  {
    title: "利用上の注意",
    body: "コード例やツールは参考情報として提供します。実運用へ適用する際は、自身の環境や要件に合わせて検証したうえで利用してください。",
  },
  {
    title: "禁止事項",
    body: "法令違反、公序良俗違反、過度な負荷を与える行為、第三者の権利侵害、虚偽の問い合わせ送信などは禁止します。",
  },
  {
    title: "変更・停止",
    body: "本サイトの内容、掲載情報、ツール、問い合わせ導線は、予告なく変更、停止、削除する場合があります。",
  },
  {
    title: "コンテンツ利用条件",
    body: "GitHub で公開しているコード、サンプル、リポジトリ内のコード資産は MIT ライセンス前提で提供します。一方、サイト本文、記事解説文、ページ構成文言、画像などは MIT の適用対象外であり、別途明示しない限り通常の著作権保護下にあります。",
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

      <section className="info-page">
        <article className="panel info-page__main">
          <div className="info-page__sections">
            {sections.map((section) => (
              <section key={section.title} className="info-page__section">
                <h2 className="section-title">{section.title}</h2>
                <p className="section-copy">{section.body}</p>
              </section>
            ))}
          </div>
        </article>

        <aside className="panel info-page__side">
          <p className="section-caption">License Boundary</p>
          <div className="compact-stack">
            <div className="tree-item">
              <strong>MIT</strong>
              <small>GitHub 公開コード、サンプル、コード資産に適用。</small>
            </div>
            <div className="tree-item">
              <strong>Not MIT</strong>
              <small>サイト本文、解説文、画像、UI 文言は適用対象外。</small>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
