import { JAVA_ARTICLE_PREVIEWS, JAVA_CATEGORIES, TOOL_ENHANCED_ARTICLE_SLUGS } from "../_data/java"

export default function JavaIndexPage() {
  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <p className="eyebrow">Java Index</p>
          <h1 className="hero-title hero-title--compact">一覧で迷わせず、記事で深掘る。</h1>
          <p className="hero-copy">
            Java はカテゴリ再編を許容しつつ、内容は全量取り込む。Try Panel は優先テーマに一致する記事だけへ限定する。
          </p>
        </div>
        <div className="hero-actions">
          <a href="/java/tool-enhanced-preview" className="action-link">Tool-enhanced article</a>
          <a href="/java/standard-preview" className="action-link">Standard article</a>
        </div>
      </section>

      <section className="docs-layout docs-layout--wide">
        <aside className="panel sidebar-panel sidebar-panel--sticky">
          <div className="section-caption">Categories</div>
          <div className="tree-list">
            {JAVA_CATEGORIES.map((category) => (
              <div key={category.slug} className="tree-item">
                <strong>{category.name}</strong>
                <small>{category.articleCount} articles</small>
              </div>
            ))}
          </div>
        </aside>

        <section className="panel">
          <div className="section-caption">Article Index</div>
          <div className="dense-list">
            {JAVA_ARTICLE_PREVIEWS.map((article) => (
              <a
                key={article.slug}
                href={TOOL_ENHANCED_ARTICLE_SLUGS.has(article.slug) ? "/java/tool-enhanced-preview" : "/java/standard-preview"}
                className="dense-list__item"
              >
                <div className="dense-list__meta">
                  <span>{article.version}</span>
                  <span>{article.categorySlug}</span>
                </div>
                <div className="dense-list__body">
                  <strong>{article.title}</strong>
                  <p className="card-copy">{article.summary}</p>
                </div>
                <div className="dense-list__badge">
                  {article.toolSlug ? <span className="badge">Try Panel</span> : <span className="badge badge--muted">Article</span>}
                </div>
              </a>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}
