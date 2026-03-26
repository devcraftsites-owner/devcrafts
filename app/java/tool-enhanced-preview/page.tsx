import { JAVA_ARTICLE_PREVIEWS } from "../../_data/java"

const article = JAVA_ARTICLE_PREVIEWS.find((entry) => entry.slug === "localdate-business-days")!

export default function ToolEnhancedPreviewPage() {
  return (
    <div className="docs-page">
      <div className="article-layout">
        <article className="article-layout__content">
          <section className="article-card">
            <div className="breadcrumbs">Home / Java / 日付・時刻 / Tool-enhanced article</div>
            <p className="eyebrow">Tool-enhanced Article</p>
            <h1 className="article-title">{article.title}</h1>
            <p className="hero-copy">
              ツールを隣接させるのは、営業日・祝日・和暦・タイムゾーン・税・割合・単位変換のように、その場で検算価値が高い記事だけに限定する。
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
              業務コードでは、「祝日と土日を除いて締日の差を数えたい」「土曜営業を含む会社もある」などの条件差分が先に来ます。記事本文は考え方と実装理由を説明し、検算は右レールのツールで行う。
            </p>
            <div className="code-block">
              <div className="code-block__top">
                <span>BusinessDayCalculator.java</span>
                <span className="code-block__copy">Copy</span>
              </div>
              <pre>{`01  public long countBusinessDays(LocalDate start, LocalDate end, Set<LocalDate> holidays) {
02    return start.datesUntil(end.plusDays(1))
03      .filter(date -> !isWeekend(date))
04      .filter(date -> !holidays.contains(date))
05      .count();
06  }`}</pre>
            </div>
            <div className="tool-panel">
              <div>
                <p className="eyebrow">Try Panel</p>
                <h2 className="section-title">営業日計算をその場で試す</h2>
              </div>
              <div className="tool-panel__grid">
                <div className="field">
                  <label htmlFor="start-date">Start</label>
                  <input id="start-date" defaultValue="2026-03-01" readOnly />
                </div>
                <div className="field">
                  <label htmlFor="end-date">End</label>
                  <input id="end-date" defaultValue="2026-03-31" readOnly />
                </div>
              </div>
              <div className="field">
                <label htmlFor="holidays">Holiday List</label>
                <textarea id="holidays" defaultValue={"2026-03-20\n2026-03-21"} readOnly />
              </div>
              <div className="tool-result">
                <strong>Result Preview</strong>
                営業日 21 日 / 除外: 土日 8 日、祝日 1 日
              </div>
            </div>
          </section>
        </article>

        <aside className="rail-stack">
          <section className="panel">
            <div className="section-caption">Right Rail</div>
            <div className="compact-stack">
              <div className="tree-item">
                <strong>TOC</strong>
                <small>使いどころ / 実装 / 注意点 / FAQ</small>
              </div>
              <div className="tree-item">
                <strong>Related Tool</strong>
                <small>business-days</small>
              </div>
            </div>
          </section>
          <div className="ad-seat sticky-ad">
            <strong>Sticky Ad Seat</strong>
            <p className="meta-copy">PC の右レールのみ。本文を崩さない。</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
