"use client"

import { useMemo, useState } from "react"
import { type JsonFormatMode, formatJson } from "../_lib/json-formatter"

const PRESETS = [
  { label: "サンプル JSON", value: '{"name":"太郎","age":30,"skills":["Java","TypeScript"],"address":{"city":"東京","zip":"100-0001"}}' },
  { label: "配列", value: '[{"id":1,"name":"A"},{"id":2,"name":"B"},{"id":3,"name":"C"}]' },
  { label: "空オブジェクト", value: "{}" },
]

export function JsonFormatterTool() {
  const [input, setInput] = useState(PRESETS[0].value)
  const [mode, setMode] = useState<JsonFormatMode>("pretty")
  const [indent, setIndent] = useState(2)

  const result = useMemo(() => formatJson(input, mode, indent), [input, mode, indent])

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">JSON をその場で整形・圧縮する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Input</p>
            <h3>JSON 入力</h3>
          </div>
          <div className="field">
            <label htmlFor="json-input">JSON</label>
            <textarea
              id="json-input"
              rows={10}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              style={{ fontFamily: "monospace", resize: "vertical" }}
            />
          </div>
          <div className="preset-row">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="tool-button"
                onClick={() => setInput(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="field" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="radio"
                name="mode"
                checked={mode === "pretty"}
                onChange={() => setMode("pretty")}
              />
              整形（Pretty）
            </label>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="radio"
                name="mode"
                checked={mode === "compact"}
                onChange={() => setMode("compact")}
              />
              圧縮（Compact）
            </label>
            {mode === "pretty" && (
              <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                インデント:
                <select value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
                  <option value={2}>2 スペース</option>
                  <option value={4}>4 スペース</option>
                  <option value={8}>8 スペース</option>
                </select>
              </label>
            )}
          </div>
        </section>

        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Output</p>
            <h3>変換結果</h3>
          </div>
          <div className="tool-result tool-result--accent">
            <strong>Result</strong>
            {result.ok ? (
              <div className="result-stack">
                <pre
                  style={{
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    maxHeight: "24rem",
                    overflow: "auto",
                    margin: 0,
                  }}
                >
                  {result.formatted}
                </pre>
                <span className="result-line">
                  {result.lineCount} 行 / {result.byteSize.toLocaleString()} bytes
                </span>
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
