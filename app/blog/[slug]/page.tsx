import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogArticle, getBlogArticleHref, BLOG_ARTICLES } from "../../_data/blog"
import { getJavaArticleBySlug, getJavaArticleHref } from "../../_data/java"
import { getToolBySlug, getToolHref } from "../../_data/tools"
import { CopyButton } from "../../_components/CopyButton"
import AdSlot from "../../_components/AdSlot"

type BlogPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: "./" },
  }
}

export default async function BlogArticlePage({ params }: BlogPageProps) {
  const { slug } = await params
  const article = getBlogArticle(slug)
  if (!article) notFound()

  const relatedArticles = article.relatedArticleSlugs
    .map((s) => getJavaArticleBySlug(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))

  const relatedTools = article.relatedToolSlugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

  // JSON-LD: static data only (no user input), safe to serialize
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: article.title,
        description: article.description,
        datePublished: article.publishedAt,
        keywords: article.tags.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://dev-craft.dev/" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://dev-craft.dev/blog/" },
          { "@type": "ListItem", position: 3, name: article.title },
        ],
      },
      ...(article.faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: article.faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
          ]
        : []),
    ],
  })

  return (
    <>
      {/* JSON-LD structured data — static content only, no user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="docs-page">
        <div className="article-layout">
          <article className="article-layout__content">
            <section className="article-card">
              <div className="breadcrumbs">
                <Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / {article.title}
              </div>
              <p className="eyebrow">体験談</p>
              <h1 className="article-title">{article.title}</h1>
              <p className="hero-copy">{article.description}</p>
              <div className="tag-row">
                <span className="pill">{article.publishedAt}</span>
                {article.tags.map((tag) => (
                  <span key={tag} className="pill">
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section className="article-card article-body">
              <h2>何が起きたか？</h2>
              <p>{article.symptom}</p>
              <p className="section-caption">環境: {article.environment}</p>
            </section>

            <section className="article-card article-body">
              <h2>最初に試したこと（そしてダメだった）</h2>
              <p>{article.wrongApproach}</p>
            </section>

            <AdSlot placement="java" format="text" className="ad-seat ad-seat--inline" />

            <section className="article-card article-body">
              <h2>結局、原因はこれだった</h2>
              <p>{article.rootCause}</p>
            </section>

            <section className="article-card article-body">
              <h2>こうやって直した</h2>
              <p>{article.solution}</p>
              {article.solutionCode && (
                <div className="code-block-wrapper">
                  <div className="code-block-header">
                    <span>解決コード</span>
                    <CopyButton text={article.solutionCode} />
                  </div>
                  <pre className="code-block">
                    <code>{article.solutionCode}</code>
                  </pre>
                </div>
              )}
            </section>

            <section className="article-card article-body">
              <h2>次から気をつけること</h2>
              <p>{article.prevention}</p>
            </section>

            {article.faq.length > 0 && (
              <section className="article-card article-body">
                <h2>FAQ</h2>
                <div className="compact-stack">
                  {article.faq.map((item) => (
                    <section key={item.question} className="panel panel--soft">
                      <strong>{item.question}</strong>
                      <p className="section-copy">{item.answer}</p>
                    </section>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="rail-stack">
            {relatedArticles.length > 0 && (
              <section className="panel">
                <div className="section-caption">関連する Java 記事</div>
                <div className="compact-stack">
                  {relatedArticles.map((a) => (
                    <Link key={a.slug} href={getJavaArticleHref(a)} className="mini-link">
                      <strong>{a.title}</strong>
                      <small>{a.summary}</small>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {relatedTools.length > 0 && (
              <section className="panel">
                <div className="section-caption">関連ツール</div>
                <div className="compact-stack">
                  {relatedTools.map((t) => (
                    <Link key={t.slug} href={getToolHref(t.slug)} className="mini-link">
                      <strong>{t.name}</strong>
                      <small>{t.summary}</small>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="panel">
              <div className="section-caption">他の体験談</div>
              <div className="compact-stack">
                {BLOG_ARTICLES.filter((a) => a.slug !== article.slug).map((a) => (
                  <Link key={a.slug} href={getBlogArticleHref(a.slug)} className="mini-link">
                    <strong>{a.title}</strong>
                    <small>{a.description.slice(0, 60)}...</small>
                  </Link>
                ))}
                {BLOG_ARTICLES.length <= 1 && (
                  <div className="tree-item">
                    <small>記事が増え次第追加します。</small>
                  </div>
                )}
              </div>
            </section>

            <AdSlot placement="java" format="banner" className="ad-seat sticky-ad" />
          </aside>
        </div>
      </div>
    </>
  )
}
