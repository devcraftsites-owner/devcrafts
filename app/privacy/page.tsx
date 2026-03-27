import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プライバシーポリシー — 広告・Cookie・データ取扱い",
  description: "dev-craft における Google AdSense 広告配信、Google アナリティクスによるアクセス解析、ブラウザ内完結のデータ処理、Google Form 経由のお問い合わせ情報の取扱い方針をまとめています。",
  alternates: { canonical: "./" },
}

const sections = [
  {
    title: "広告の配信について",
    body: "このサイトでは、第三者配信による広告サービスおよびアフィリエイトプログラムを利用しています。これらの事業者は、ユーザーの興味に応じた広告や提携商品の案内を表示するために、Cookie または類似技術を使用することがあります。広告事業者がCookie を通じてブラウザを識別する場合がありますが、それだけで個人を直接特定できるものではありません。Cookie の無効化方法や広告に関する詳細は、各広告事業者のポリシーと規約をご確認ください。",
  },
  {
    title: "アクセス解析ツールについて",
    body: "このサイトでは、サイト改善および広告配信の最適化を目的として、Google アナリティクスを導入しています。Google アナリティクスはトラフィックデータ収集のために Cookie または類似技術を利用する場合があります。取得される情報は匿名の統計情報として扱われ、個人を特定することを目的とするものではありません。",
  },
  {
    title: "ブラウザ内処理とデータ保持",
    body: "このサイトの一部機能では、利便性向上のためにブラウザのローカルストレージや Cookie を利用しています。たとえば、ダークモード切り替えや、一部ツールでの入力値保持などが該当します。これらの保存はユーザーのブラウザ内で完結しており、運営者がサーバー側で個人の行動を追跡・特定するために利用するものではありません。",
  },
  {
    title: "お問い合わせ情報の取扱い",
    body: "Google Form を通じてお寄せいただいたお名前、メールアドレス、お問い合わせ内容、対象ページ URL などの情報は、回答・誤記修正・品質改善の目的でのみ利用します。これらの情報を広告配信事業者やアフィリエイト事業者へ提供することはありません。",
  },
  {
    title: "第三者サービスについて",
    body: "このサイトでは Google Form、Google AdSense、Google アナリティクス、A8.net、Amazon アソシエイトなどの第三者サービスを利用する場合があります。各サービスでのデータ取扱いは、それぞれの利用規約やプライバシーポリシーにも基づきます。第三者サービスの追加や変更があった場合は、このページを更新して反映します。",
  },
  {
    title: "免責事項",
    body: "このサイトに掲載された内容によって生じた損害等について、運営者は一切の責任を負いかねます。ブラウザ完結ツールによる計算結果やサンプルコードを実務へ適用される際は、ご自身の責任で検証・実行してください。また、リンクやバナーなどを通じて外部サイトへ移動された場合、移動先で提供される情報やサービス等についても責任を負いかねます。",
  },
]

export default function PrivacyPage() {
  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <p className="eyebrow">Privacy</p>
          <h1 className="hero-title hero-title--compact">プライバシーポリシー</h1>
          <p className="hero-copy">
            広告配信、アクセス解析、ブラウザ内処理、お問い合わせ対応を含む情報取扱い方針をまとめています。
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
