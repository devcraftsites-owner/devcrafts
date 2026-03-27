"use client"

import { useEffect, useMemo, useState } from "react"
import { type HashAlgorithm, computeHash } from "../_lib/hash"

const ALGORITHMS: HashAlgorithm[] = ["SHA-256", "SHA-512", "SHA-384", "SHA-1", "MD5"]

const PRESETS = [
  { label: "英語テキスト", value: "hello" },
  { label: "日本語テキスト", value: "こんにちは世界" },
  { label: "パスワード例", value: "P@ssw0rd!2024" },
]

type HashState = {
  hex: string
  base64: string
  algorithm: HashAlgorithm
  inputByteSize: number
} | {
  error: string
} | null

export function HashTool() {
  const [input, setInput] = useState(PRESETS[0].value)
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256")
  const [result, setResult] = useState<HashState>(null)

  useEffect(() => {
    let cancelled = false
    const trimmed = input.trim()
    if (!trimmed) {
      setResult({ error: "ハッシュ化するテキストを入力してください。" })
      return
    }
    computeHash(trimmed, algorithm).then((r) => {
      if (cancelled) return
      if (r.ok) {
        setResult({ hex: r.hex, base64: r.base64, algorithm: r.algorithm, inputByteSize: r.inputByteSize })
      } else {
        setResult({ error: r.error })
      }
    })
    return () => { cancelled = true }
  }, [input, algorithm])

  const hashBitLength = useMemo(() => {
    if (result && "hex" in result) return result.hex.length * 4
    return null
  }, [result])

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">テキストのハッシュ値をその場で確認する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Hash Generator</p>
            <h3>テキスト → ハッシュ値</h3>
            <p className="section-copy">
              SHA-256 / SHA-512 / SHA-384 / SHA-1 / MD5 のハッシュ値を Hex と Base64 で表示する。
            </p>
          </div>

          <div className="field">
            <label htmlFor="hash-algorithm">アルゴリズム</label>
            <select
              id="hash-algorithm"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
            >
              {ALGORITHMS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="hash-input">テキスト</label>
            <textarea
              id="hash-input"
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="preset-row">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" className="tool-button" onClick={() => setInput(p.value)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="tool-result tool-result--accent">
            <strong>Hash Result</strong>
            {result && "hex" in result ? (
              <div className="result-stack">
                <span className="result-line">
                  <strong>Hex ({hashBitLength} bit)</strong>
                </span>
                <span className="result-line result-line--primary" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                  {result.hex}
                </span>
                <span className="result-line">
                  <strong>Base64</strong>
                </span>
                <span className="result-line result-line--primary" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                  {result.base64}
                </span>
                <span className="result-line">
                  入力 {result.inputByteSize} bytes → {result.algorithm} → {result.hex.length / 2} bytes
                </span>
              </div>
            ) : result && "error" in result ? (
              <span>{result.error}</span>
            ) : (
              <span>計算中...</span>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
