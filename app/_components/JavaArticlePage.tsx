import Link from "next/link"
import {
  getJavaArticleBySlug,
  getJavaArticleHref,
  getJavaCategory,
  getJavaCategoryHref,
  type JavaArticleDetail,
} from "../_data/java"
import { getBooksByCategory } from "../_data/java/books"
import { getToolBySlug, getToolHref } from "../_data/tools"
import AdSlot from "./AdSlot"
import { BookCardList } from "./BookCard"
import { CopyButton } from "./CopyButton"
import { VersionDiffBlock } from "./VersionDiffBlock"
import { WarekiTool } from "../tools/_components/WarekiTool"

type JavaArticlePageProps = {
  article: JavaArticleDetail
}

export function JavaArticlePage({ article }: JavaArticlePageProps) {
  const category = getJavaCategory(article.categorySlug)
  const relatedTool = article.toolSlug ? getToolBySlug(article.toolSlug) : undefined
  const relatedArticles = article.relatedArticleSlugs
    .map((slug) => getJavaArticleBySlug(slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  return (
    <div className="docs-page">
      <div className="article-layout">
        <article className="article-layout__content">
          <section className="article-card">
            <div className="breadcrumbs">
              <Link href="/">Home</Link> / <Link href="/java">Java</Link> /{" "}
              {category ? <Link href={getJavaCategoryHref(category.slug)}>{category.name}</Link> : article.categorySlug} / Article
            </div>
            <p className="eyebrow">{article.toolSlug ? "Tool-enhanced Article" : "Java Article"}</p>
            <h1 className="article-title">{article.title}</h1>
            <p className="hero-copy">{article.description}</p>
            <div className="tag-row">
              <span className="pill">{article.version}</span>
              {article.tags.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="article-card article-body">
            <div className="article-section">
              <h2 className="section-title">概要</h2>
              <p className="section-copy">{article.lead}</p>
            </div>

            <div className="article-section">
              <h2 className="section-title">使いどころ</h2>
              <div className="bullet-stack">
                {article.useCases.map((useCase) => (
                  <p key={useCase} className="section-copy">
                    {useCase}
                  </p>
                ))}
              </div>
            </div>

            <div className="article-section">
              <h2 className="section-title">コード例</h2>
              <div className="code-block">
                <div className="code-block__top">
                  <span>{article.codeTitle}</span>
                  <CopyButton text={article.codeSample} />
                </div>
                <pre>{article.codeSample}</pre>
              </div>
              <p className="meta-copy">
                Java 8 / 17 / 21 の完全なサンプルコードは{" "}
                <a
                  href={`https://github.com/devcraftsites-owner/devcrafts/tree/main/examples/java`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "underline" }}
                >
                  GitHub リポジトリ
                </a>
                {" "}で確認できます。
              </p>
            </div>

            {article.tryPanelTitle ? (
              <div className="article-section">
                {article.toolSlug === "wareki" ? (
                  <WarekiTool
                    initialDate={article.tryPanelFields?.[0]?.value ?? "2019-05-01"}
                    initialWareki={article.tryPanelResult?.split(" / ")[0] ?? "令和元年5月1日"}
                  />
                ) : (
                  <div className="tool-panel">
                    <div>
                      <p className="eyebrow">Try Panel</p>
                      <h2 className="section-title">{article.tryPanelTitle}</h2>
                      {article.tryPanelDescription ? <p className="section-copy">{article.tryPanelDescription}</p> : null}
                    </div>
                    {article.tryPanelFields ? (
                      <div className="tool-panel__grid">
                        {article.tryPanelFields.map((field) => (
                          <div key={field.label} className="field">
                            <label>{field.label}</label>
                            {field.value.includes("\n") ? <textarea readOnly value={field.value} /> : <input readOnly value={field.value} />}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {article.tryPanelResult ? (
                      <div className="tool-result">
                        <strong>Result Preview</strong>
                        {article.tryPanelResult}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            <AdSlot placement="java" format="text" className="ad-seat ad-seat--inline" />

            {(article.versionCoverage.java8Code || article.versionCoverage.java17Code || article.versionCoverage.java21Code) ? (
              <div className="article-section">
                <section className="panel panel--soft">
                  <p className="eyebrow">Version Coverage</p>
                  <VersionDiffBlock coverage={article.versionCoverage} />
                </section>
              </div>
            ) : (
              <div className="article-section">
                <section className="panel panel--soft">
                  <p className="eyebrow">Version Coverage</p>
                  <div className="compact-stack">
                    <div className="tree-item">
                      <strong>Java 8</strong>
                      <small>{article.versionCoverage.java8}</small>
                    </div>
                    <div className="tree-item">
                      <strong>Java 17</strong>
                      <small>{article.versionCoverage.java17}</small>
                    </div>
                    <div className="tree-item">
                      <strong>Java 21</strong>
                      <small>{article.versionCoverage.java21}</small>
                    </div>
                  </div>
                </section>
              </div>
            )}

            <div className="article-section">

              <section className="panel panel--soft">
                <p className="eyebrow">Library Comparison</p>
                <div className="compact-stack">
                  {article.libraryComparison.map((item) => (
                    <div key={item.name} className="tree-item">
                      <strong>{item.name}</strong>
                      <small>{item.whenToUse}</small>
                      <small>{item.tradeoff}</small>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="article-section">
              <h2 className="section-title">注意点</h2>
              <div className="bullet-stack">
                {article.cautions.map((caution) => (
                  <p key={caution} className="section-copy">
                    {caution}
                  </p>
                ))}
              </div>
            </div>

            <div className="article-section">
              <h2 className="section-title">FAQ</h2>
              <div className="compact-stack">
                {article.faq.map((item) => (
                  <section key={item.question} className="panel panel--soft">
                    <strong>{item.question}</strong>
                    <p className="section-copy">{item.answer}</p>
                  </section>
                ))}
              </div>
            {(() => {
              const books = article.recommendedBooks ?? getBooksByCategory(article.categorySlug)
              return books.length > 0 ? <BookCardList books={books} /> : null
            })()}

            </div>
          </section>
        </article>

        <aside className="rail-stack">
          <section className="panel">
            <div className="section-caption">Article Support</div>
            <div className="compact-stack">
              <div className="tree-item">
                <strong>目次</strong>
                <small>概要 / 使いどころ / コード例 / バージョン差分 / 比較 / FAQ</small>
              </div>
              <div className="tree-item">
                <strong>{article.toolSlug ? "関連ツール" : "関連テーマ"}</strong>
                {relatedTool ? (
                  <Link href={getToolHref(relatedTool.slug)} className="mini-link mini-link--inline">
                    <strong>{relatedTool.name}</strong>
                    <small>{relatedTool.summary}</small>
                  </Link>
                ) : (
                  <small>{article.toolSlug ?? "関連記事から探す"}</small>
                )}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="section-caption">Related Articles</div>
            <div className="compact-stack">
              {relatedArticles.map((relatedArticle) => (
                <Link key={relatedArticle.slug} href={getJavaArticleHref(relatedArticle)} className="mini-link">
                  <strong>{relatedArticle.title}</strong>
                  <small>{relatedArticle.summary}</small>
                </Link>
              ))}
            </div>
          </section>

          <AdSlot placement="java" format="banner" className="ad-seat sticky-ad" />
        </aside>
      </div>
    </div>
  )
}
