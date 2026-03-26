const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe9ncTSWxGNkjkdsaq64Z77ka2aKTGYsQ6ICjhpSvo2RAv_gw/viewform"

const sections = [
  {
    title: "受け付ける内容",
    body: "誤記のご連絡、一般的なお問い合わせ、広告・提携に関するお問い合わせ、その他のご連絡を受け付けます。",
  },
  {
    title: "返信方針",
    body: "メールアドレスは任意です。返信を希望する場合はメールアドレスを入力してください。未入力の場合は返信できません。また、内容によっては返信を行わない場合があります。",
  },
  {
    title: "フォームに含まれる項目",
    body: "問い合わせ種別、お名前、問い合わせ内容、メールアドレス、対象ページ URL、プライバシーポリシー同意を受け付けます。誤記報告の場合は対象ページ URL の記載を推奨します。",
  },
]

export default function ContactPage() {
  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="hero-title hero-title--compact">お問い合わせ</h1>
          <p className="hero-copy">
            連絡窓口は Google Form を利用します。返信が必要な場合はメールアドレスを入力してください。
          </p>
        </div>
        <div className="hero-actions">
          <a href={formUrl} target="_blank" rel="noreferrer" className="action-link">
            Open Google Form
          </a>
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
          <p className="section-caption">Form Summary</p>
          <div className="compact-stack">
            <div className="tree-item">
              <strong>Main Form</strong>
              <small>Google Form を正式な問い合わせ窓口として利用します。</small>
            </div>
            <div className="tree-item">
              <strong>Reply</strong>
              <small>返信希望時はメールアドレス入力推奨。未入力では返信不可。</small>
            </div>
            <div className="tree-item">
              <strong>Privacy</strong>
              <small>送信前に Privacy ページの確認と同意が必要です。</small>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
