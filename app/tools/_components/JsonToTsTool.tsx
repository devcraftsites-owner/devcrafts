"use client"

import { useMemo, useState } from "react"
import { jsonToTypeScript } from "../_lib/json-to-ts"

const PRESETS = [
  {
    label: "ユーザー",
    value: '{"id":1,"name":"田中","active":true,"tags":["java","spring"],"profile":{"department":"開発","joinedAt":"2024-04-01"}}',
  },
  {
    label: "配列",
    value: '[{"id":1,"score":90},{"id":2,"score":95,"comment":"good"}]',
  },
]

export function JsonToTsTool() {
  const [input, setInput] = useState(PRESETS[0].value)
  const [rootName, setRootName] = useState("Root")
  const result = useMemo(() => jsonToTypeScript(input, rootName), [input, rootName])

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">JSON から TypeScript 型の叩き台を作る</h2>
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
            <label htmlFor="root-name">型名</label>
            <input id="root-name" type="text" value={rootName} onChange={(event) => setRootName(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="json-to-ts-input">JSON</label>
            <textarea
              id="json-to-ts-input"
              rows={9}
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
            <h3>TypeScript 型</h3>
          </div>
          <div className="tool-result tool-result--accent">
            <strong>Generated Type</strong>
            {result.ok ? (
              <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>{result.result}</pre>
            ) : (
              <span>{result.error}</span>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
