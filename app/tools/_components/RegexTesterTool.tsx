"use client"

import { useMemo, useState } from "react"
import { type RegexFlags, testRegex } from "../_lib/regex-tester"

const PRESETS = [
  { label: "メールアドレス", pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.]+", test: "連絡先: taro@example.com, hanako@test.co.jp" },
  { label: "日付 (YYYY-MM-DD)", pattern: "(\\d{4})-(\\d{2})-(\\d{2})", test: "開始日: 2026-03-27, 終了日: 2026-04-15" },
  { label: "電話番号", pattern: "0\\d{1,4}-\\d{1,4}-\\d{4}", test: "TEL: 03-1234-5678, 090-1111-2222" },
]

export function RegexTesterTool() {
  const [pattern, setPattern] = useState(PRESETS[0].pattern)
  const [testString, setTestString] = useState(PRESETS[0].test)
  const [flags, setFlags] = useState<RegexFlags>({
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  })

  const result = useMemo(() => testRegex(pattern, testString, flags), [pattern, testString, flags])

  function toggleFlag(key: keyof RegexFlags) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function applyPreset(preset: typeof PRESETS[number]) {
    setPattern(preset.pattern)
    setTestString(preset.test)
  }

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">正規表現をその場でテストする</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Input</p>
            <h3>パターンとテスト文字列</h3>
          </div>
          <div className="field">
            <label htmlFor="regex-pattern">正規表現パターン</label>
            <input
              id="regex-pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
              style={{ fontFamily: "monospace" }}
            />
          </div>
          <div className="field">
            <label htmlFor="regex-test">テスト文字列</label>
            <textarea
              id="regex-test"
              rows={4}
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="field" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {([
              ["global", "g（全検索）"],
              ["caseInsensitive", "i（大小無視）"],
              ["multiline", "m（複数行）"],
              ["dotAll", "s（.が改行一致）"],
            ] as const).map(([key, label]) => (
              <label key={key} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                <input type="checkbox" checked={flags[key]} onChange={() => toggleFlag(key)} />
                {label}
              </label>
            ))}
          </div>
          <div className="preset-row">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" className="tool-button" onClick={() => applyPreset(p)}>
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Result</p>
            <h3>マッチ結果</h3>
          </div>
          <div className="tool-result tool-result--accent">
            <strong>Matches</strong>
            {result.ok ? (
              result.matchCount > 0 ? (
                <div className="result-stack">
                  <span className="result-line">{result.matchCount} 件マッチ</span>
                  {result.matches.map((m, i) => (
                    <div key={i} style={{ fontFamily: "monospace", padding: "0.25rem 0", borderTop: i > 0 ? "1px solid var(--border)" : undefined }}>
                      <span className="result-line result-line--primary">
                        #{i + 1} [{m.index}]: &quot;{m.text}&quot;
                      </span>
                      {m.groups.length > 0 && (
                        <span className="result-line" style={{ fontSize: "0.85em" }}>
                          グループ: {m.groups.map((g, j) => `$${j + 1}="${g}"`).join(", ")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span>マッチなし</span>
              )
            ) : (
              <span>{result.error}</span>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
