import type { Metadata } from "next"
import Link from "next/link"
import {
  JAVA_ARTICLE_PREVIEWS,
  JAVA_CATEGORIES,
  PRIORITY_JAVA_TOPICS,
  getJavaArticleHref,
  getJavaCategoryHref,
} from "./_data/java"
import { PRIORITY_TOOLS, getToolBySlug, getToolHref } from "./_data/tools"
import AdSlot from "./_components/AdSlot"

export const metadata: Metadata = {
  title: "Java 実務レシピ & ブラウザ完結ツール — Java 8/17/21 対応",
  description: "Java 8/17/21 対応のコード例とブラウザ完結の計算・変換ツールを、実務で使える形に整理した開発者向けサイトです。営業日計算、祝日判定、和暦変換、消費税計算など、業務でよく使うテーマを優先的にカバーしています。",
  alternates: { canonical: "./" },
}

export default function HomePage() {
  const featuredCategories = JAVA_CATEGORIES.filter((category) => category.priority === "high")
  const featuredArticles = JAVA_ARTICLE_PREVIEWS.slice(0, 5)
  const toolEnhancedArticles = JAVA_ARTICLE_PREVIEWS.filter((article) => article.toolSlug).slice(0, 4)
  const publishedArticleCount = JAVA_ARTICLE_PREVIEWS.length
  const toolCount = PRIORITY_TOOLS.length

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
          <Link href="/java" className="stat-card">
            <span className="stat-label">Java Recipes</span>
            <strong>{publishedArticleCount} articles</strong>
            <small>Java 8 / 17 / 21 対応の実務レシピ</small>
          </Link>
          <Link href="/tools" className="stat-card">
            <span className="stat-label">Browser Tools</span>
            <strong>{toolCount}+ tools</strong>
            <small>ブラウザ完結・サーバー送信なし</small>
          </Link>
        </div>
      </section>

      <section className="trust-strip panel">
        <div className="trust-strip__label">Trust & Contact</div>
        <div className="trust-strip__links">
          <Link href="/about" className="trust-link">
            <strong>About</strong>
            <small>このサイトを作っている理由と運営方針</small>
          </Link>
          <Link href="/privacy" className="trust-link">
            <strong>Privacy</strong>
            <small>広告、Cookie、Analytics、問い合わせ情報の取扱い</small>
          </Link>
          <Link href="/contact" className="trust-link">
            <strong>Contact</strong>
            <small>誤記報告、一般問い合わせ、広告・提携相談</small>
          </Link>
        </div>
      </section>

      <section className="docs-layout">
        <aside className="panel sidebar-panel">
          <div className="section-caption">Category Tree</div>
          <div className="tree-list">
            {featuredCategories.map((category) => (
              <Link key={category.slug} href={getJavaCategoryHref(category.slug)} className="tree-item">
                <strong>{category.name}</strong>
                <small>{category.summary}</small>
              </Link>
            ))}
          </div>
        </aside>

        <section className="panel">
          <div className="section-header section-header--feature">
            <div>
              <p className="eyebrow">Focus</p>
              <h2 className="section-title section-title--feature">実務で使える Java レシピ</h2>
            </div>
            <p className="meta-copy meta-copy--feature">記事を読んで理解し、ブラウザツールで検算。関連テーマへも辿れます。</p>
          </div>
          <div className="filter-row filter-row--spacious">
            <span className="filter-chip">Java 8 / 17 / 21</span>
            <span className="filter-chip">Date / Stream / DB / HTTP</span>
            <span className="filter-chip">Try Panel enabled</span>
          </div>
          <div className="dense-list dense-list--spacious">
            {featuredArticles.map((article) => (
              <div key={article.slug}>
                <Link
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
                    {article.toolSlug ? <span className="badge">Try</span> : <span className="badge badge--muted">Read</span>}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel rail-panel">
          <div className="section-caption">Try-enabled Topics</div>
          <div className="compact-stack">
            {toolEnhancedArticles.map((article) => (
              <div key={article.slug} className="mini-link">
                <Link href={getJavaArticleHref(article)}>
                  <strong>{article.title}</strong>
                </Link>
                {article.toolSlug ? (
                  <Link href={getToolHref(article.toolSlug)}>
                    <small>Try: {getToolBySlug(article.toolSlug)?.name ?? article.toolSlug}</small>
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
          <AdSlot placement="top" format="banner" className="ad-seat sticky-ad" />
        </aside>
      </section>

      <section className="panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Priority Themes</p>
            <h2 className="section-title">Java 記事とブラウザツールが連携するテーマ</h2>
          </div>
        </div>
        <div className="card-grid">
          {featuredCategories.map((category) => (
            <Link key={category.slug} href={getJavaCategoryHref(category.slug)} className="surface-card">
              <span className="pill">{category.slug}</span>
              <h3 className="card-title">{category.name}</h3>
              <p className="card-copy">{category.summary}</p>
              <p className="meta-copy">{category.articleCount} articles</p>
            </Link>
          ))}
        </div>
        <div className="priority-topic-row">
          {PRIORITY_JAVA_TOPICS.map((topic) => (
            <span key={topic} className="filter-chip">
              {topic}
            </span>
          ))}
          {PRIORITY_TOOLS.slice(0, 2).map((tool) => (
            <Link key={tool.slug} href={getToolHref(tool.slug)} className="filter-chip">
              Try: {tool.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
