import { JAVA_ARTICLE_PREVIEWS, JAVA_CATEGORIES, PRIORITY_JAVA_TOPICS } from "./_data/java"
import { PRIORITY_TOOLS } from "./_data/tools"

export default function HomePage() {
  const featuredCategories = JAVA_CATEGORIES.filter((category) => category.priority === "high")
  const featuredArticles = JAVA_ARTICLE_PREVIEWS.slice(0, 5)
  const toolEnhancedArticles = JAVA_ARTICLE_PREVIEWS.filter((article) => article.toolSlug).slice(0, 4)
  const spotlightArticles = [
    "現場でよく使うテーマ: 営業日・祝日処理",
    "まず押さえたい実務処理: 和暦・タイムゾーン処理",
  ]

  return (
    <div className="docs-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Java Recipes + Browser Tools</p>
          <h1 className="hero-title">
            現場で使えて、
            <br />
            必要ならその先もたどれる技術リソース。
          </h1>
          <p className="hero-copy">
            サンプルはあるのに実務では足りない。そんな場面で引けて、必要ならもう一歩先までたどれる情報を、Java
            記事とブラウザツールの形で整理しています。
          </p>
        </div>
        <div className="hero-stats">
          {spotlightArticles.map((item) => (
            <div key={item} className="stat-card">
              <span className="stat-label">Spotlight</span>
              <strong>{item.split(": ")[0]}</strong>
              <small>{item.split(": ")[1]}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="trust-strip panel">
        <div className="trust-strip__label">Trust & Contact</div>
        <div className="trust-strip__links">
          <a href="/about" className="trust-link">
            <strong>About</strong>
            <small>このサイトを作っている理由と運営方針</small>
          </a>
          <a href="/privacy" className="trust-link">
            <strong>Privacy</strong>
            <small>広告、Cookie、Analytics、問い合わせ情報の取扱い</small>
          </a>
          <a href="/contact" className="trust-link">
            <strong>Contact</strong>
            <small>誤記報告、一般問い合わせ、広告・提携相談</small>
          </a>
        </div>
      </section>

      <section className="docs-layout">
        <aside className="panel sidebar-panel">
          <div className="section-caption">Category Tree</div>
          <div className="tree-list">
            {featuredCategories.map((category) => (
              <a key={category.slug} href="/java" className="tree-item">
                <strong>{category.name}</strong>
                <small>{category.summary}</small>
              </a>
            ))}
          </div>
        </aside>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Focus</p>
              <h2 className="section-title">検索から一覧、記事、Try Panel までつなぐ</h2>
            </div>
            <p className="meta-copy">Sample B を母体に、A のテーマ切替と C の限定埋め込みを加える。</p>
          </div>
          <div className="filter-row">
            <span className="filter-chip">Java 8 / 17 / 21</span>
            <span className="filter-chip">Date / Stream / DB / HTTP</span>
            <span className="filter-chip">Try Panel enabled</span>
          </div>
          <div className="dense-list">
            {featuredArticles.map((article, index) => (
              <div key={article.slug}>
                <a
                  href={article.toolSlug ? "/java/tool-enhanced-preview" : "/java/standard-preview"}
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
                    {article.toolSlug ? <span className="badge">Try</span> : <span className="badge badge--muted">Read</span>}
                  </div>
                </a>
                {index === 2 ? (
                  <div className="dense-list__item dense-list__item--pr">
                    <div className="dense-list__meta">
                      <span>Sponsored</span>
                      <span>PR</span>
                    </div>
                    <div className="dense-list__body">
                      <strong>PR: 実務に強い Java 学習パートナー</strong>
                      <p className="card-copy">記事一覧と同じ流れの中で読めるスポンサー枠。広告であることは明確に表示する。</p>
                    </div>
                    <div className="dense-list__badge">
                      <span className="badge badge--pr">PR</span>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <aside className="panel rail-panel">
          <div className="section-caption">Try-enabled Topics</div>
          <div className="compact-stack">
            {toolEnhancedArticles.map((article) => (
              <a key={article.slug} href="/java/tool-enhanced-preview" className="mini-link">
                <strong>{article.title}</strong>
                <small>{article.toolSlug}</small>
              </a>
            ))}
          </div>
          <div className="ad-seat sticky-ad">
            <strong>Sticky Ad Seat</strong>
            <p className="meta-copy">PC の右レールのみ追従。本文と一覧を邪魔しない。</p>
          </div>
        </aside>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Priority Themes</p>
            <h2 className="section-title">ツールと自然に接続できる記事群だけを強化する</h2>
          </div>
        </div>
        <div className="card-grid">
          {featuredCategories.map((category) => (
            <a key={category.slug} href="/java" className="surface-card">
              <span className="pill">{category.slug}</span>
              <h3 className="card-title">{category.name}</h3>
              <p className="card-copy">{category.summary}</p>
              <p className="meta-copy">{category.articleCount} articles</p>
            </a>
          ))}
        </div>
        <div className="priority-topic-row">
          {PRIORITY_JAVA_TOPICS.map((topic) => (
            <span key={topic} className="filter-chip">
              {topic}
            </span>
          ))}
          {PRIORITY_TOOLS.slice(0, 2).map((tool) => (
            <span key={tool.slug} className="filter-chip">
              Try: {tool.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
