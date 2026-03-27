import type { Metadata } from "next"
import Link from "next/link"
import { TOOLS } from "../_data/tools"
import { getToolHref } from "../_data/tools"

export const metadata: Metadata = {
  title: "ブラウザ完結ツール一覧 — 営業日・和暦・税計算をサーバー送信なしで",
  description: "営業日計算、祝日判定、和暦変換、タイムゾーン変換、消費税計算、割合計算、単位変換など、業務でよく使うテーマをブラウザだけで計算・変換できるツール集。入力データはサーバーに送信しません。",
  alternates: { canonical: "./" },
}

export default function ToolsIndexPage() {
  return (
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <p className="eyebrow">Tools</p>
          <h1 className="hero-title hero-title--compact">ブラウザだけで使える、実務向けの計算・変換ツール。</h1>
          <p className="hero-copy">
            サーバーへの送信なし。Java 記事と連携できるツールから順に公開しています。
          </p>
        </div>
      </section>
      <section className="panel">
        <div className="dense-list">
          {TOOLS.map((tool) => {
            const inner = (
              <>
                <div className="dense-list__meta">
                  <span>{tool.category}</span>
                </div>
                <div className="dense-list__body">
                  <strong>{tool.name}</strong>
                  <p className="card-copy">{tool.summary}</p>
                </div>
                <div className="dense-list__badge">
                  <span className={`badge ${tool.status === "ready" ? "" : "badge--muted"}`}>
                    {tool.status === "ready" ? "Try" : "Planned"}
                  </span>
                </div>
              </>
            )

            return tool.status === "ready" ? (
              <Link key={tool.slug} href={getToolHref(tool.slug)} className="dense-list__item">
                {inner}
              </Link>
            ) : (
              <div key={tool.slug} className="dense-list__item dense-list__item--static">
                {inner}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
