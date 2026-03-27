import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "プライバシーポリシー — 広告・Cookie・データ取扱い",
  description: "dev-craft における Google AdSense 広告配信、Google アナリティクスによるアクセス解析、ブラウザ内完結のデータ処理、Google Form 経由のお問い合わせ情報の取扱い方針をまとめています。",
  alternates: { canonical: "./" },
}

const sections = [
  {
    title: "広告の配信について",
    body: "このサイトでは、Google AdSense による第三者配信の広告サービスを利用しています。Google などの広告事業者は、ユーザーの興味に応じた広告を表示するために Cookie を使用することがあります。パーソナライズド広告は、Google 広告設定（https://adssettings.google.com）からいつでも無効化できます。詳しくは Google のポリシーと規約（https://policies.google.com/technologies/ads）をご確認ください。",
  },
  {
    title: "アフィリエイトプログラムについて",
    body: "このサイトは、Amazon.co.jp を宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazon アソシエイト・プログラムの参加者です。記事内で紹介する書籍やサービスへのリンクにはアフィリエイトリンクを含む場合があり、リンク先での購入等により運営者に報酬が発生することがあります。紹介するコンテンツの選定は、読者にとっての有用性を基準に行っており、報酬の有無が内容の評価に影響を与えるものではありません。",
  },
  {
    title: "アクセス解析ツールについて",
    body: "このサイトでは、サイト改善を目的として Google アナリティクスを導入しています。Google アナリティクスはトラフィックデータ収集のために Cookie を利用します。取得される情報は匿名の統計情報として扱われ、個人を特定するものではありません。データは Google のプライバシーポリシー（https://policies.google.com/privacy）に基づいて管理されます。Google アナリティクスによるデータ収集を望まない場合は、Google が提供するオプトアウトアドオン（https://tools.google.com/dlpage/gaoptout）をご利用ください。",
  },
  {
    title: "Cookie について",
    body: "このサイトでは、広告配信・アクセス解析・テーマ設定の保持などの目的で Cookie およびローカルストレージを使用しています。Cookie はブラウザの設定からいつでも削除・無効化できます。ただし Cookie を無効化した場合、サイトの一部機能（ダークモードの保持など）が正しく動作しなくなる場合があります。ブラウザ完結ツールの入力値や計算結果はブラウザ内で処理され、サーバーへ送信されることはありません。",
  },
  {
    title: "お問い合わせ情報の取扱い",
    body: "Google Form を通じてお寄せいただいたお名前、メールアドレス、お問い合わせ内容、対象ページ URL などの情報は、回答・誤記修正・品質改善の目的でのみ利用します。これらの情報を広告配信事業者やアフィリエイト事業者へ提供することはありません。",
  },
  {
    title: "第三者サービスについて",
    body: "このサイトでは Google AdSense、Google アナリティクス、Amazon アソシエイト、Google Form などの第三者サービスを利用しています。各サービスでのデータ取扱いは、それぞれの利用規約やプライバシーポリシーに基づきます。第三者サービスの追加や変更があった場合は、このページを更新して反映します。",
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
            広告配信、アフィリエイト、アクセス解析、Cookie、お問い合わせ対応を含む情報取扱い方針をまとめています。
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
