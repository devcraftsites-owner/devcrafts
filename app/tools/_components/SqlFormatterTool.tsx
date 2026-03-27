"use client"

import { useMemo, useState } from "react"
import { formatSql } from "../_lib/sql-formatter"

const PRESETS = [
  {
    label: "SELECT",
    value: "select u.id, u.name, d.name as department from users u left join departments d on d.id = u.department_id where u.status = 'active' and u.deleted_at is null order by u.id",
  },
  {
    label: "INSERT",
    value: "insert into users(id, name, email) values(1, '田中', 'tanaka@example.com')",
  },
  {
    label: "UPDATE",
    value: "update orders set status = 'shipped', shipped_at = current_timestamp where id = 1001 and status = 'confirmed'",
  },
]

export function SqlFormatterTool() {
  const [input, setInput] = useState(PRESETS[0].value)
  const result = useMemo(() => formatSql(input), [input])

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">SQL をレビューしやすい形へ整形する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Input</p>
            <h3>SQL 入力</h3>
          </div>
          <div className="field">
            <label htmlFor="sql-input">SQL</label>
            <textarea
              id="sql-input"
              rows={8}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              spellCheck={false}
              style={{ fontFamily: "monospace", resize: "vertical" }}
            />
          </div>
          <div className="preset-row">
            {PRESETS.map((preset) => (
              <button key={preset.label} type="button" className="tool-button" onClick={() => setInput(preset.value)}>
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Output</p>
            <h3>整形結果</h3>
          </div>
          <div className="tool-result tool-result--accent">
            <strong>Formatted SQL</strong>
            {result.ok ? (
              <div className="result-stack">
                <pre
                  style={{
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "24rem",
                    overflow: "auto",
                    margin: 0,
                  }}
                >
                  {result.formatted}
                </pre>
                <span className="result-line">{result.lineCount} 行に整形</span>
              </div>
            ) : (
              <span>{result.error}</span>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
