"use client"

import { useMemo, useState } from "react"
import { calculateBusinessDays } from "../_lib/business-days"

type BusinessDaysToolProps = {
  initialStart: string
  initialEnd: string
}

const PRESETS: Array<{ label: string; start: string; end: string }> = [
  { label: "今月（2026年3月）", start: "2026-03-01", end: "2026-03-31" },
  { label: "来月（2026年4月）", start: "2026-04-01", end: "2026-04-30" },
  { label: "年度末（1〜3月）", start: "2026-01-01", end: "2026-03-31" },
]

export function BusinessDaysTool({ initialStart, initialEnd }: BusinessDaysToolProps) {
  const [startDate, setStartDate] = useState(initialStart)
  const [endDate, setEndDate] = useState(initialEnd)
  const [excludeSaturday, setExcludeSaturday] = useState(true)
  const [holidayList, setHolidayList] = useState("")

  const result = useMemo(
    () => calculateBusinessDays(startDate, endDate, holidayList, excludeSaturday),
    [startDate, endDate, holidayList, excludeSaturday],
  )

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">営業日数をその場で計算する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Input</p>
            <h3>期間と除外条件を指定する</h3>
            <p className="section-copy">開始日から終了日までの営業日数を土日・祝日を除外して計算する。</p>
          </div>

          <div className="field">
            <label htmlFor="bd-start">開始日</label>
            <input
              id="bd-start"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="bd-end">終了日</label>
            <input
              id="bd-end"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="bd-exclude-sat">
              <input
                id="bd-exclude-sat"
                type="checkbox"
                checked={excludeSaturday}
                onChange={(event) => setExcludeSaturday(event.target.checked)}
              />
              {" "}土曜日を休日として扱う
            </label>
          </div>

          <div className="field">
            <label htmlFor="bd-holidays">祝日リスト（YYYY-MM-DD、改行・カンマ・セミコロン区切り）</label>
            <textarea
              id="bd-holidays"
              rows={5}
              value={holidayList}
              placeholder={"2026-01-01\n2026-01-12\n2026-02-11"}
              onChange={(event) => setHolidayList(event.target.value)}
            />
          </div>

          <div className="preset-row">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="tool-button"
                onClick={() => {
                  setStartDate(preset.start)
                  setEndDate(preset.end)
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
            <h3>計算結果</h3>
            <p className="section-copy">営業日数と除外内訳を確認する。</p>
          </div>

          <div className="tool-result tool-result--accent">
            <strong>営業日数</strong>
            {result.ok ? (
              <div className="result-stack">
                <span className="result-line result-line--primary">{result.businessDays} 日</span>
                <span className="result-line">全日数: {result.totalDays} 日</span>
                <span className="result-line">土日除外: {result.weekendDays} 日</span>
                <span className="result-line">祝日除外: {result.holidayDays} 日</span>
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
