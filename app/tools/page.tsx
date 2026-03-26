import { TOOLS } from "../_data/tools"

const labels = {
  priority: "priority",
  supporting: "supporting",
  conditional: "conditional",
  deferred: "deferred",
} as const

export default function ToolsIndexPage() {
  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <p className="eyebrow">Tools</p>
          <h1 className="hero-title hero-title--compact">記事を補助する道具だけを優先移行する。</h1>
          <p className="hero-copy">
            Tools は全量を一律移行しない。Java 記事と自然につながる優先ツールを先に育てる。
          </p>
        </div>
      </section>
      <section className="panel">
        <div className="dense-list">
          {TOOLS.map((tool) => (
            <article key={tool.slug} className="dense-list__item dense-list__item--static">
              <div className="dense-list__meta">
                <span>{labels[tool.priority]}</span>
                <span>{tool.category}</span>
              </div>
              <div className="dense-list__body">
                <strong>{tool.name}</strong>
                <p className="card-copy">{tool.summary}</p>
              </div>
              <div className="dense-list__badge">
                <span className={`badge ${tool.priority === "priority" ? "" : "badge--muted"}`}>{labels[tool.priority]}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
