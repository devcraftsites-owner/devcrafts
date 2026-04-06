import type { Metadata } from "next"
import Link from "next/link"
import { BLOG_ARTICLES, getBlogArticleHref } from "../_data/blog"

export const metadata: Metadata = {
  title: "実務で踏んだ落とし穴 — Java トラブルシューティング体験談",
  description:
    "Java の実務で実際にハマったトラブルと、原因特定から解決までの記録。SSL 証明書、メモリリーク、トランザクションなど現場で再現しやすい問題を扱います。",
  alternates: { canonical: "./" },
}

export default function BlogIndexPage() {
  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <div className="breadcrumbs">
            <Link href="/">Home</Link> / Blog
          </div>
          <p className="eyebrow">Blog</p>
          <h1 className="hero-title hero-title--compact">実務で踏んだ落とし穴</h1>
          <p className="hero-copy">
            現場で実際にハマったトラブルと、原因の特定から解決までの記録。同じ問題に当たったときの手がかりになれば。
          </p>
        </div>
      </section>
      <section className="panel">
        <div className="dense-list">
          {BLOG_ARTICLES.map((article) => (
            <Link key={article.slug} href={getBlogArticleHref(article.slug)} className="dense-list__item">
              <div className="dense-list__meta">
                <span>{article.publishedAt}</span>
              </div>
              <div className="dense-list__body">
                <strong>{article.title}</strong>
                <p className="card-copy">{article.description}</p>
              </div>
              <div className="dense-list__badge">
                <div className="tag-row">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
