import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getJavaArticlesByCategory,
  getJavaArticleHref,
  getJavaCategory,
  JAVA_CATEGORIES,
} from "../../_data/java"

type CategoryPageProps = {
  params: Promise<{
    category: string
  }>
}

export async function generateStaticParams() {
  return JAVA_CATEGORIES.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = getJavaCategory(categorySlug)

  if (!category) {
    return {}
  }

  const topicsLabel = category.featuredTopics.slice(0, 4).join("・")
  const rawDescription = `${category.purpose}${topicsLabel}などのテーマを、${category.audience.replace(/。$/, "")}向けに整理しています。`
  const description = rawDescription.length > 120
    ? `${rawDescription.slice(0, 117)}...`
    : rawDescription

  return {
    title: `【Java】${category.name}の実務レシピ一覧（Java 8/17/21対応）`,
    description,
    alternates: { canonical: "./" },
  }
}

export default async function JavaCategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params
  const category = getJavaCategory(categorySlug)

  if (!category) {
    notFound()
  }

  const articles = getJavaArticlesByCategory(category.slug)

  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <div className="breadcrumbs">
            <Link href="/">Home</Link> / <Link href="/java">Java</Link> / {category.name}
          </div>
          <p className="eyebrow">Java Category</p>
          <h1 className="hero-title hero-title--compact">{category.name}</h1>
          <p className="hero-copy">{category.purpose}</p>
        </div>
      </section>

      <section className="docs-layout docs-layout--wide">
        <aside className="panel sidebar-panel sidebar-panel--sticky">
          <div className="section-caption">Category Brief</div>
          <div className="compact-stack">
            <div className="tree-item">
              <strong>Audience</strong>
              <small>{category.audience}</small>
            </div>
            <div className="tree-item">
              <strong>Topics</strong>
              <small>{category.featuredTopics.join(" / ")}</small>
            </div>
          </div>
        </aside>

        <section className="panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Category Overview</p>
              <h2 className="section-title">このカテゴリで扱うテーマ</h2>
            </div>
            <p className="meta-copy">{category.summary}</p>
          </div>

          <div className="priority-topic-row">
            {category.featuredTopics.map((topic) => (
              <span key={topic} className="filter-chip">
                {topic}
              </span>
            ))}
          </div>

          <div className="dense-list">
            {articles.length > 0 ? (
              articles.map((article) => (
                <Link key={article.slug} href={getJavaArticleHref(article)} className="dense-list__item">
                  <div className="dense-list__meta">
                    <span>{article.version}</span>
                    <span>{article.toolSlug ? "Try Panel" : "Article"}</span>
                  </div>
                  <div className="dense-list__body">
                    <strong>{article.title}</strong>
                    <p className="card-copy">{article.summary}</p>
                  </div>
                  <div className="dense-list__badge">
                    <span className={`badge ${article.toolSlug ? "" : "badge--muted"}`}>{article.toolSlug ? "Try" : "Read"}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="tree-item">
                <strong>準備中</strong>
                <small>このカテゴリの記事は準備中です。公開までしばらくお待ちください。</small>
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  )
}
