const sections = [
  {
    title: "広告の配信について",
    body: "本サイトでは、第三者配信による広告サービスおよびアフィリエイトプログラムを利用します。これらの事業者は、ユーザーの興味に応じた広告や提携商品の案内を表示するために、Cookie または類似技術を使用することがあります。Cookie によりユーザーのブラウザを識別できる場合がありますが、これにより個人を直接特定できるものではありません。Cookie の無効化方法や広告に関する詳細は 各広告のポリシーと規約をご確認ください。",
  },
  {
    title: "アクセス解析ツールについて",
    body: "本サイトでは、サイト改善および広告配信の最適化を目的として、Google アナリティクスを導入しています。Google アナリティクスはトラフィックデータ収集のために Cookie または類似技術を利用する場合があります。取得される情報は匿名の統計情報として扱い、個人を特定することを目的とするものではありません。",
  },
  {
    title: "ブラウザ内処理とデータ保持",
    body: "本サイトの一部機能では、利便性向上のためにブラウザのローカルストレージや Cookie を利用します。たとえば、ダークモード切り替えや、一部ツールでの入力値保持などが該当します。これらの保存は基本的にユーザーのブラウザ内で完結し、当方がサーバー側で個人の行動を追跡・特定するために利用するものではありません。",
  },
  {
    title: "お問い合わせ情報の取扱い",
    body: "Google Form を通じて取得した氏名、メールアドレス、問い合わせ内容、対象ページ URL などの情報は、回答、誤記修正、品質改善の目的でのみ利用します。これらの情報を広告配信事業者やアフィリエイト事業者へ提供することはありません。",
  },
  {
    title: "第三者サービスについて",
    body: "Google Form、Google AdSense、Google アナリティクス、A8.net、Amazon アソシエイトなど、第三者サービスを利用する場合があります。各サービスでのデータ取扱いは、それぞれの利用規約やプライバシーポリシーにも基づきます。今後、第三者サービスの追加や変更があった場合は、本ページを更新して反映します。",
  },
  {
    title: "免責事項",
    body: "当サイトに掲載された内容によって生じた損害等について、運営者は一切の責任を負いません。特に、ブラウザ完結ツールによる計算結果やサンプルコードの実務への適用は、利用者自身の責任で検証・実行してください。また、リンクやバナーなどによって外部サイトへ移動した場合、移動先サイトで提供される情報やサービス等についても責任を負いません。",
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
          <p className="section-caption">Current Assumptions</p>
          <div className="compact-stack">
            <div className="tree-item">
              <strong>Ads / Affiliate</strong>
              <small>Google AdSense、A8.net、Amazon アソシエイトを導入前提とする。</small>
            </div>
            <div className="tree-item">
              <strong>Analytics</strong>
              <small>Google アナリティクス導入前提で計測方針を設計する。</small>
            </div>
            <div className="tree-item">
              <strong>Browser Storage</strong>
              <small>テーマ設定やツール入力保持にローカル保存を利用する。</small>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
