import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "お問い合わせ — 誤記報告・ご要望・広告提携のご連絡窓口",
  description: "dev-craft への誤記報告、一般的なお問い合わせ、広告・提携に関するご相談を Google Form で受け付けています。メールアドレスは任意で、返信が不要な場合は匿名でもご連絡いただけます。",
  alternates: { canonical: "./" },
}

const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe9ncTSWxGNkjkdsaq64Z77ka2aKTGYsQ6ICjhpSvo2RAv_gw/viewform"

const sections = [
  {
    title: "受け付ける内容",
    body: "誤記のご連絡、一般的なお問い合わせ、広告・提携に関するご相談、その他のご連絡を受け付けています。",
  },
  {
    title: "返信方針",
    body: "メールアドレスは任意です。返信をご希望の方はメールアドレスをご入力ください。未入力の場合は返信いたしかねます。また、内容によっては返信を控えさせていただくことがあります。",
  },
  {
    title: "フォームに含まれる項目",
    body: "問い合わせ種別、お名前、問い合わせ内容、メールアドレス、対象ページ URL、プライバシーポリシーへの同意確認をお伺いしています。誤記報告の際は対象ページ URL の記載を推奨します。",
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
