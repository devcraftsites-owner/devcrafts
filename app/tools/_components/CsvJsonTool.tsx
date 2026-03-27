"use client"

import { useMemo, useState } from "react"
import { type CsvDelimiter, csvToJson, jsonToCsv } from "../_lib/csv-json"

const CSV_PRESETS = [
  {
    label: "ユーザー一覧",
    value: "id,name,email\n1,田中,tanaka@example.com\n2,佐藤,sato@example.com",
  },
  {
    label: "改行セル",
    value: "id,comment\n1,\"1行目\n2行目\"",
  },
]

const JSON_PRESETS = [
  {
    label: "シンプル配列",
    value: '[{"id":1,"name":"田中","email":"tanaka@example.com"},{"id":2,"name":"佐藤","email":"sato@example.com"}]',
  },
  {
    label: "ネストあり",
    value: '[{"id":1,"name":"田中","meta":{"role":"admin"}},{"id":2,"name":"佐藤","tags":["java","spring"]}]',
  },
]

export function CsvJsonTool() {
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(",")
  const [csvInput, setCsvInput] = useState(CSV_PRESETS[0].value)
  const [jsonInput, setJsonInput] = useState(JSON_PRESETS[0].value)

  const csvResult = useMemo(() => csvToJson(csvInput, delimiter), [csvInput, delimiter])
  const jsonResult = useMemo(() => jsonToCsv(jsonInput, delimiter), [jsonInput, delimiter])

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">CSV と JSON を相互変換する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="field" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="radio" checked={delimiter === ","} onChange={() => setDelimiter(",")} />
          カンマ区切り
        </label>
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="radio" checked={delimiter === "\t"} onChange={() => setDelimiter("\t")} />
          タブ区切り
        </label>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">CSV → JSON</p>
            <h3>ヘッダー付き CSV を JSON 配列へ</h3>
          </div>
          <div className="field">
            <label htmlFor="csv-input">CSV</label>
            <textarea id="csv-input" rows={8} value={csvInput} onChange={(event) => setCsvInput(event.target.value)} spellCheck={false} />
          </div>
          <div className="preset-row">
            {CSV_PRESETS.map((preset) => (
              <button key={preset.label} type="button" className="tool-button" onClick={() => setCsvInput(preset.value)}>
                {preset.label}
              </button>
            ))}
          </div>
          <div className="tool-result tool-result--accent">
            <strong>JSON Result</strong>
            {csvResult.ok ? (
              <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>{csvResult.result}</pre>
            ) : (
              <span>{csvResult.error}</span>
            )}
          </div>
        </section>

        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">JSON → CSV</p>
            <h3>JSON 配列を CSV へ</h3>
          </div>
          <div className="field">
            <label htmlFor="json-input">JSON</label>
            <textarea id="json-input" rows={8} value={jsonInput} onChange={(event) => setJsonInput(event.target.value)} spellCheck={false} style={{ fontFamily: "monospace" }} />
          </div>
          <div className="preset-row">
            {JSON_PRESETS.map((preset) => (
              <button key={preset.label} type="button" className="tool-button" onClick={() => setJsonInput(preset.value)}>
                {preset.label}
              </button>
            ))}
          </div>
          <div className="tool-result tool-result--accent">
            <strong>CSV Result</strong>
            {jsonResult.ok ? (
              <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>{jsonResult.result}</pre>
            ) : (
              <span>{jsonResult.error}</span>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
