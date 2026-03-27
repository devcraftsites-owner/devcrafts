"use client"

import { useMemo, useState } from "react"
import { type UnitCategory, convertUnit, getCategories, getUnitsForCategory } from "../_lib/unit-converter"

type UnitConverterToolProps = {
  initialCategory: UnitCategory
  initialValue: string
  initialFromUnit: string
}

const CATEGORY_LIST = getCategories()

function formatValue(value: number): string {
  if (value === 0) return "0"
  const abs = Math.abs(value)
  if (abs >= 1e12 || (abs > 0 && abs < 1e-8)) {
    return value.toExponential(6)
  }
  if (Number.isInteger(value)) return value.toLocaleString()
  const digits = abs >= 1000 ? 4 : abs >= 1 ? 6 : 10
  return parseFloat(value.toPrecision(digits)).toString()
}

export function UnitConverterTool({ initialCategory, initialValue, initialFromUnit }: UnitConverterToolProps) {
  const [category, setCategory] = useState<UnitCategory>(initialCategory)
  const [inputText, setInputText] = useState(initialValue)
  const [fromUnit, setFromUnit] = useState(initialFromUnit)

  const units = useMemo(() => getUnitsForCategory(category), [category])

  const result = useMemo(() => {
    const parsed = parseFloat(inputText)
    if (inputText.trim() === "" || isNaN(parsed)) {
      return null
    }
    return convertUnit(parsed, fromUnit, category)
  }, [inputText, fromUnit, category])

  function handleCategoryChange(newCategory: UnitCategory) {
    setCategory(newCategory)
    const newUnits = getUnitsForCategory(newCategory)
    if (newUnits.length > 0) {
      setFromUnit(newUnits[0].key)
    }
  }

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">単位をその場で変換する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Input</p>
            <h3>変換元を入力</h3>
            <p className="section-copy">カテゴリを選び、数値と変換元の単位を指定する。</p>
          </div>

          <div className="preset-row">
            {CATEGORY_LIST.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`tool-button${category === cat.key ? " tool-button--active" : ""}`}
                onClick={() => handleCategoryChange(cat.key)}
              >
                {cat.labelJa}
              </button>
            ))}
          </div>

          <div className="field">
            <label htmlFor="unit-value">数値</label>
            <input
              id="unit-value"
              type="text"
              inputMode="decimal"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="変換する数値を入力"
            />
          </div>

          <div className="field">
            <label htmlFor="unit-from">変換元の単位</label>
            <select
              id="unit-from"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
            >
              {units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.labelJa} ({u.label})
                </option>
              ))}
            </select>
          </div>

          <div className="preset-row">
            {["1", "100", "1000"].map((preset) => (
              <button key={preset} type="button" className="tool-button" onClick={() => setInputText(preset)}>
                {preset}
              </button>
            ))}
          </div>
        </section>

        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">Result</p>
            <h3>変換結果</h3>
            <p className="section-copy">選択したカテゴリの全単位へ一括変換した結果を表示する。</p>
          </div>

          <div className="tool-result tool-result--accent">
            <strong>Conversion Result</strong>
            {result === null ? (
              <span>数値を入力すると変換結果が表示されます。</span>
            ) : result.ok ? (
              <div className="result-stack">
                {result.results.map((r) => (
                  <span
                    key={r.unitKey}
                    className={`result-line${r.unitKey === fromUnit ? " result-line--primary" : ""}`}
                  >
                    {formatValue(r.value)} {r.labelJa} ({r.label})
                  </span>
                ))}
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
