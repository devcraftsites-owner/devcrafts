import type { Metadata } from "next"
import Link from "next/link"
import {
  JAVA_ARTICLE_PREVIEWS,
  JAVA_CATEGORIES,
  PRIORITY_JAVA_TOPICS,
  TOOL_ENHANCED_ARTICLE_SLUGS,
  getJavaArticleHref,
  getJavaCategoryHref,
  getPublishedArticleCount,
} from "../_data/java"

export const metadata: Metadata = {
  title: "Java 実務レシピ一覧 — Java 8/17/21 対応",
  description: "営業日計算、祝日処理、和暦変換など、Java の実務テーマをカテゴリ別に整理。外部ライブラリ不要のコード例で、バージョン間の違いも学べます。",
  alternates: { canonical: "./" },
}

export default function JavaIndexPage() {
  const featuredCategories = JAVA_CATEGORIES.filter((category) => category.priority === "high").slice(0, 4)
  const featuredArticles = JAVA_ARTICLE_PREVIEWS.slice(0, 6)
  const tryEnabledArticles = JAVA_ARTICLE_PREVIEWS.filter((article) => article.toolSlug).slice(0, 4)

  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <p className="eyebrow">Java Index</p>
          <h1 className="hero-title hero-title--compact">カテゴリで見渡し、記事で深掘る。</h1>
          <p className="hero-copy">
            実務で必要になるテーマをカテゴリ別に整理しています。一部の記事では、ブラウザ上でそのまま検算できる Try Panel も用意しています。
          </p>
        </div>
        <div className="hero-actions">
          <Link href={getJavaCategoryHref("dates")} className="action-link">
            日付・時刻
          </Link>
          <Link href={getJavaArticleHref(JAVA_ARTICLE_PREVIEWS[0])} className="action-link">
            営業日計算
          </Link>
        </div>
      </section>

      <section className="docs-layout docs-layout--wide">
        <aside className="panel sidebar-panel sidebar-panel--sticky">
          <div className="section-caption">Categories</div>
          <div className="tree-list">
            {JAVA_CATEGORIES.map((category) => (
              <Link key={category.slug} href={getJavaCategoryHref(category.slug)} className="tree-item">
                <strong>{category.name}</strong>
                <small>
                  公開 {getPublishedArticleCount(category.slug)}
                </small>
              </Link>
            ))}
          </div>
        </aside>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Article Index</p>
              <h2 className="section-title">カテゴリ別の公開記事</h2>
            </div>
            <p className="meta-copy">各カテゴリから記事を選んで読み進められます。</p>
          </div>
          <div className="priority-topic-row">
            {PRIORITY_JAVA_TOPICS.map((topic) => (
              <span key={topic} className="filter-chip">
                {topic}
              </span>
            ))}
          </div>
          <div className="card-grid">
            {featuredCategories.map((category) => (
              <Link key={category.slug} href={getJavaCategoryHref(category.slug)} className="surface-card">
                <h3 className="card-title">{category.name}</h3>
                <p className="card-copy">{category.purpose}</p>
                <p className="meta-copy">
                  公開 {getPublishedArticleCount(category.slug)}
                </p>
              </Link>
            ))}
          </div>

          <div className="dense-list">
            {featuredArticles.map((article) => (
              <Link
                key={article.slug}
                href={getJavaArticleHref(article)}
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
              </Link>
            ))}
          </div>

          <section className="panel panel--soft">
            <div className="section-caption">Try-enabled topics</div>
            <div className="compact-stack">
              {tryEnabledArticles.map((article) => (
                <Link key={article.slug} href={getJavaArticleHref(article)} className="mini-link">
                  <strong>{article.title}</strong>
                  <small>{TOOL_ENHANCED_ARTICLE_SLUGS.has(article.slug) ? "Try Panel available" : "Article only"}</small>
                </Link>
              ))}
            </div>
          </section>
        </section>
      </section>
    </div>
  )
}
