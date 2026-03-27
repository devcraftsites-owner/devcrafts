"use client"

import { useMemo, useState } from "react"
import { getJapanHolidays } from "../_lib/japan-holidays"

type JapanHolidaysToolProps = {
  initialYear: string
}

export function JapanHolidaysTool({ initialYear }: JapanHolidaysToolProps) {
  const [yearInput, setYearInput] = useState(initialYear)
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => getJapanHolidays(yearInput), [yearInput])

  const dateListText = useMemo(() => {
    if (!result.ok) return ""
    return result.holidays.map((h) => h.date).join("\n")
  }, [result])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(dateListText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">指定年の祝日一覧を確認する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Year Input</p>
            <h3>対象年を入力</h3>
            <p className="section-copy">1948〜2100 年の祝日一覧を計算します。振替休日も含みます。</p>
          </div>
          <div className="field">
            <label htmlFor="year-input">Year</label>
            <input
              id="year-input"
              type="number"
              min={1948}
              max={2100}
              value={yearInput}
              onChange={(event) => setYearInput(event.target.value)}
            />
          </div>
          <div className="preset-row">
            {["2024", "2025", "2026"].map((preset) => (
              <button
                key={preset}
                type="button"
                className="tool-button"
                onClick={() => setYearInput(preset)}
              >
                {preset}年
              </button>
            ))}
          </div>
        </section>

        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Holiday List</p>
            <h3>祝日一覧</h3>
            {result.ok ? (
              <p className="section-copy">{result.count} 件の祝日・振替休日</p>
            ) : null}
          </div>
          <div className="tool-result tool-result--accent">
            <strong>Result</strong>
            {result.ok ? (
              <div className="result-stack">
                {result.holidays.map((holiday) => (
                  <span key={holiday.date + holiday.name} className="result-line">
                    <strong>{holiday.date}</strong>{" "}
                    {holiday.name}
                  </span>
                ))}
              </div>
            ) : (
              <span>{result.error}</span>
            )}
          </div>
          {result.ok ? (
            <div className="preset-row">
              <button type="button" className="tool-button" onClick={handleCopy}>
                {copied ? "Copied!" : "yyyy-mm-dd リストをコピー"}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  )
}
