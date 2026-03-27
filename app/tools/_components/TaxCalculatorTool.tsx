"use client"

import { useMemo, useState } from "react"
import { type RoundingMode, type TaxDirection, type TaxRate, calculateTax } from "../_lib/tax-calculator"

type TaxCalculatorToolProps = {
  initialAmount: string
}

const ROUNDING_LABELS: Record<RoundingMode, string> = {
  floor: "切り捨て",
  ceil: "切り上げ",
  round: "四捨五入",
}

function formatNumber(value: number): string {
  return value.toLocaleString("ja-JP")
}

export function TaxCalculatorTool({ initialAmount }: TaxCalculatorToolProps) {
  const [amountInput, setAmountInput] = useState(initialAmount)
  const [direction, setDirection] = useState<TaxDirection>("exclusive-to-inclusive")
  const [taxRate, setTaxRate] = useState<TaxRate>(10)
  const [roundingMode, setRoundingMode] = useState<RoundingMode>("floor")

  const result = useMemo(() => {
    const parsed = Number(amountInput)
    if (amountInput.trim() === "" || Number.isNaN(parsed)) {
      return calculateTax(Number.NaN, direction, taxRate, roundingMode)
    }
    return calculateTax(parsed, direction, taxRate, roundingMode)
  }, [amountInput, direction, taxRate, roundingMode])

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">消費税をその場で計算する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Tax Calculator</p>
            <h3>{direction === "exclusive-to-inclusive" ? "税抜金額から税込金額を計算" : "税込金額から税抜金額を計算"}</h3>
            <p className="section-copy">税率と端数処理を選択して計算する。</p>
          </div>

          <div className="field">
            <label htmlFor="tax-direction">計算方向</label>
            <select
              id="tax-direction"
              value={direction}
              onChange={(event) => setDirection(event.target.value as TaxDirection)}
            >
              <option value="exclusive-to-inclusive">税抜 → 税込</option>
              <option value="inclusive-to-exclusive">税込 → 税抜</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="tax-amount">
              {direction === "exclusive-to-inclusive" ? "税抜金額" : "税込金額"}（円）
            </label>
            <input
              id="tax-amount"
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
            />
          </div>

          <div className="preset-row">
            {["100", "980", "1980", "10000"].map((preset) => (
              <button key={preset} type="button" className="tool-button" onClick={() => setAmountInput(preset)}>
                {Number(preset).toLocaleString("ja-JP")}円
              </button>
            ))}
          </div>

          <div className="field">
            <label htmlFor="tax-rate">税率</label>
            <select
              id="tax-rate"
              value={taxRate}
              onChange={(event) => setTaxRate(Number(event.target.value) as TaxRate)}
            >
              <option value="10">10%（標準税率）</option>
              <option value="8">8%（軽減税率）</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="tax-rounding">端数処理</label>
            <select
              id="tax-rounding"
              value={roundingMode}
              onChange={(event) => setRoundingMode(event.target.value as RoundingMode)}
            >
              <option value="floor">切り捨て</option>
              <option value="ceil">切り上げ</option>
              <option value="round">四捨五入</option>
            </select>
          </div>

          <div className="tool-result tool-result--accent">
            <strong>Calculation Result</strong>
            {result.ok ? (
              <div className="result-stack">
                <span className="result-line result-line--primary">
                  {direction === "exclusive-to-inclusive" ? "税込金額" : "税抜金額"}:
                  {" "}{formatNumber(direction === "exclusive-to-inclusive" ? result.priceWithTax : result.priceWithoutTax)} 円
                </span>
                <span className="result-line">消費税額: {formatNumber(result.taxAmount)} 円</span>
                <span className="result-line">税率: {result.taxRate}% / 端数処理: {ROUNDING_LABELS[result.roundingMode]}</span>
                <span className="result-line">
                  {direction === "exclusive-to-inclusive" ? "税抜" : "税込"}:
                  {" "}{formatNumber(direction === "exclusive-to-inclusive" ? result.priceWithoutTax : result.priceWithTax)} 円
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
