"use client"

import { useMemo, useState } from "react"
import { type Base64Direction, convertBase64 } from "../_lib/base64"

const ENCODE_PRESETS = [
  { label: "日本語テキスト", value: "こんにちは世界" },
  { label: "JSON", value: '{"key":"value","num":42}' },
  { label: "URL", value: "https://dev-craft.dev/tools/base64" },
]

const DECODE_PRESETS = [
  { label: "こんにちは世界", value: "44GT44KT44Gr44Gh44Gv5LiW55WM" },
  { label: "JSON", value: "eyJrZXkiOiJ2YWx1ZSIsIm51bSI6NDJ9" },
  { label: "Hello", value: "SGVsbG8sIFdvcmxkIQ==" },
]

export function Base64Tool() {
  const [encodeInput, setEncodeInput] = useState(ENCODE_PRESETS[0].value)
  const [decodeInput, setDecodeInput] = useState(DECODE_PRESETS[0].value)

  const encodeResult = useMemo(() => convertBase64(encodeInput, "encode"), [encodeInput])
  const decodeResult = useMemo(() => convertBase64(decodeInput, "decode"), [decodeInput])

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">Base64 エンコード / デコードをその場で実行する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Encode</p>
            <h3>テキスト → Base64</h3>
            <p className="section-copy">UTF-8 テキストを Base64 エンコードする。</p>
          </div>
          <div className="field">
            <label htmlFor="encode-input">テキスト</label>
            <textarea
              id="encode-input"
              rows={4}
              value={encodeInput}
              onChange={(e) => setEncodeInput(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="preset-row">
            {ENCODE_PRESETS.map((p) => (
              <button key={p.label} type="button" className="tool-button" onClick={() => setEncodeInput(p.value)}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="tool-result tool-result--accent">
            <strong>Encode Result</strong>
            {encodeResult.ok ? (
              <div className="result-stack">
                <span className="result-line result-line--primary" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                  {encodeResult.result}
                </span>
                <span className="result-line">
                  入力 {encodeResult.inputByteSize} bytes → 出力 {encodeResult.outputByteSize} bytes
                </span>
              </div>
            ) : (
              <span>{encodeResult.error}</span>
            )}
          </div>
        </section>

        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Decode</p>
            <h3>Base64 → テキスト</h3>
            <p className="section-copy">Base64 文字列を UTF-8 テキストにデコードする。</p>
          </div>
          <div className="field">
            <label htmlFor="decode-input">Base64</label>
            <textarea
              id="decode-input"
              rows={4}
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              spellCheck={false}
              style={{ fontFamily: "monospace" }}
            />
          </div>
          <div className="preset-row">
            {DECODE_PRESETS.map((p) => (
              <button key={p.label} type="button" className="tool-button" onClick={() => setDecodeInput(p.value)}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="tool-result tool-result--accent">
            <strong>Decode Result</strong>
            {decodeResult.ok ? (
              <div className="result-stack">
                <span className="result-line result-line--primary">{decodeResult.result}</span>
                <span className="result-line">
                  入力 {decodeResult.inputByteSize} bytes → 出力 {decodeResult.outputByteSize} bytes
                </span>
              </div>
            ) : (
              <span>{decodeResult.error}</span>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
