"use client"

import { useMemo, useState } from "react"
import { convertGregorianToWareki, convertWarekiToGregorian } from "../_lib/wareki"

type WarekiToolProps = {
  initialDate: string
  initialWareki: string
}

export function WarekiTool({ initialDate, initialWareki }: WarekiToolProps) {
  const [gregorianInput, setGregorianInput] = useState(initialDate)
  const [warekiInput, setWarekiInput] = useState(initialWareki)

  const gregorianResult = useMemo(() => convertGregorianToWareki(gregorianInput), [gregorianInput])
  const warekiResult = useMemo(() => convertWarekiToGregorian(warekiInput), [warekiInput])

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">西暦と和暦をその場で検算する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Gregorian → Wareki</p>
            <h3>西暦日付から和暦へ</h3>
            <p className="section-copy">元号境界日も含めて和暦漢字表記と略号表記を確認する。</p>
          </div>
          <div className="field">
            <label htmlFor="gregorian-input">Gregorian Date</label>
            <input
              id="gregorian-input"
              type="date"
              value={gregorianInput}
              onChange={(event) => setGregorianInput(event.target.value)}
            />
          </div>
          <div className="preset-row">
            {["2019-05-01", "2019-04-30", "1989-01-08"].map((preset) => (
              <button key={preset} type="button" className="tool-button" onClick={() => setGregorianInput(preset)}>
                {preset}
              </button>
            ))}
          </div>
          <div className="tool-result tool-result--accent">
            <strong>Conversion Result</strong>
            {gregorianResult.ok ? (
              <div className="result-stack">
                <span className="result-line result-line--primary">{gregorianResult.wareki}</span>
                <span className="result-line">{gregorianResult.shortWareki}</span>
              </div>
            ) : (
              <span>{gregorianResult.error}</span>
            )}
          </div>
        </section>

        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Wareki → Gregorian</p>
            <h3>和暦文字列から西暦へ</h3>
            <p className="section-copy">令和元年5月1日 と R1-05-01 の両方を受け付ける。</p>
          </div>
          <div className="field">
            <label htmlFor="wareki-input">Wareki Text</label>
            <input
              id="wareki-input"
              type="text"
              value={warekiInput}
              onChange={(event) => setWarekiInput(event.target.value)}
            />
          </div>
          <div className="preset-row">
            {["令和元年5月1日", "平成31年4月30日", "S64-01-07"].map((preset) => (
              <button key={preset} type="button" className="tool-button" onClick={() => setWarekiInput(preset)}>
                {preset}
              </button>
            ))}
          </div>
          <div className="tool-result tool-result--accent">
            <strong>Conversion Result</strong>
            {warekiResult.ok ? (
              <div className="result-stack">
                <span className="result-line result-line--primary">{warekiResult.isoDate}</span>
                <span className="result-line">{warekiResult.shortWareki}</span>
              </div>
            ) : (
              <span>{warekiResult.error}</span>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}
