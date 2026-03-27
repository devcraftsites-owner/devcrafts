"use client"

import { useMemo, useState } from "react"
import { convertTimezone, getTimezoneIds } from "../_lib/timezone"

type TimezoneToolProps = {
  initialDateTime: string
  initialTimezone: string
}

export function TimezoneTool({ initialDateTime, initialTimezone }: TimezoneToolProps) {
  const [dateTimeInput, setDateTimeInput] = useState(initialDateTime)
  const [sourceTimezone, setSourceTimezone] = useState(initialTimezone)

  const timezoneIds = useMemo(() => getTimezoneIds(), [])
  const result = useMemo(() => convertTimezone(dateTimeInput, sourceTimezone), [dateTimeInput, sourceTimezone])

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">複数タイムゾーンへ一括変換する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Input</p>
            <h3>基準の日時とタイムゾーン</h3>
            <p className="section-copy">日時と基準タイムゾーンを指定すると、8つのタイムゾーンへ一括変換する。</p>
          </div>
          <div className="field">
            <label htmlFor="tz-datetime-input">日時</label>
            <input
              id="tz-datetime-input"
              type="text"
              value={dateTimeInput}
              placeholder="YYYY-MM-DD HH:mm"
              onChange={(event) => setDateTimeInput(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="tz-source-select">基準タイムゾーン</label>
            <select
              id="tz-source-select"
              value={sourceTimezone}
              onChange={(event) => setSourceTimezone(event.target.value)}
            >
              {timezoneIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <div className="preset-row">
            {[
              { label: "JST 正午", dt: "2026-03-26 12:00", tz: "JST" },
              { label: "UTC 深夜", dt: "2026-01-01 00:00", tz: "UTC" },
              { label: "EST 夕方", dt: "2026-06-15 18:00", tz: "EST" },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="tool-button"
                onClick={() => {
                  setDateTimeInput(preset.dt)
                  setSourceTimezone(preset.tz)
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </section>

        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Result</p>
            <h3>変換結果</h3>
            <p className="section-copy">8つのタイムゾーンでの対応日時を表示する。</p>
          </div>
          {result.ok ? (
            <div className="result-stack">
              {result.conversions.map((c) => (
                <div
                  key={c.timezone}
                  className={`tool-result ${c.timezone === sourceTimezone ? "tool-result--accent" : ""}`}
                >
                  <strong>{c.timezone}</strong>
                  <div className="result-stack">
                    <span className="result-line result-line--primary">{c.datetime}</span>
                    <span className="result-line">{c.label} ({c.offsetLabel})</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tool-result">
              <span>{result.error}</span>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
