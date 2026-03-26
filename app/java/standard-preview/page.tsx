import { JAVA_ARTICLE_PREVIEWS } from "../../_data/java"

const article = JAVA_ARTICLE_PREVIEWS.find((entry) => entry.slug === "stream-filter-map")!

export default function StandardPreviewPage() {
  return (
    <div className="docs-page">
      <div className="article-layout">
        <article className="article-layout__content">
          <section className="article-card">
            <div className="breadcrumbs">Home / Java / コレクション / Standard article</div>
            <p className="eyebrow">Standard Article</p>
            <h1 className="article-title">{article.title}</h1>
            <p className="hero-copy">
              全記事にツールを押し込まない。Stream や設計論のように、その場でツール化しても価値が薄い記事は本文と関連タグを主役にする。
            </p>
            <div className="tag-row">
              {article.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="article-card article-body">
            <p className="section-copy">
              Stream の記事では、コード断片の比較と読み方が重要です。関連ツールは本文横に置かず、必要なら JSON Formatter や Regex Tester のような補助カードだけを末尾に付ける。
            </p>
            <div className="code-block">
              <div className="code-block__top">
                <span>CustomerService.java</span>
                <span className="code-block__copy">Copy</span>
              </div>
              <pre>{`01  List<CustomerRow> visibleRows = customers.stream()
02    .filter(Customer::isActive)
03    .filter(customer -> customer.getPlan() != null)
04    .map(CustomerRow::from)
05    .toList();`}</pre>
            </div>
          </section>
        </article>

        <aside className="rail-stack">
          <section className="panel">
            <div className="section-caption">Article Support</div>
            <div className="compact-stack">
              <div className="tree-item">
                <strong>TOC</strong>
                <small>前提 / 実装 / null 安全 / FAQ</small>
              </div>
              <div className="tree-item">
                <strong>Related Tool Card</strong>
                <small>JSON Formatter など補助カードのみ</small>
              </div>
            </div>
          </section>
          <div className="ad-seat sticky-ad">
            <strong>Sticky Ad Seat</strong>
            <p className="meta-copy">通常記事でも右レール限定で追従させる。</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
