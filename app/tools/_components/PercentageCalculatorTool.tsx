"use client"

import { useMemo, useState } from "react"
import {
  type PercentageMode,
  calcChangeRate,
  calcFindTotal,
  calcPercentOf,
  calcWhatPercent,
} from "../_lib/percentage-calculator"

type ModeConfig = {
  key: PercentageMode
  label: string
  description: string
  fieldA: string
  fieldB: string
  presets: [string, string][]
  compute: (a: string, b: string) => ReturnType<typeof calcWhatPercent>
}

const MODES: ModeConfig[] = [
  {
    key: "whatPercent",
    label: "何%か",
    description: "A は B の何%かを求める。",
    fieldA: "部分の値 (A)",
    fieldB: "全体の値 (B)",
    presets: [["25", "200"], ["3", "8"], ["150", "100"]],
    compute: calcWhatPercent,
  },
  {
    key: "percentOf",
    label: "n%はいくつ",
    description: "A の n% がいくつかを求める。",
    fieldA: "元の値 (A)",
    fieldB: "パーセント (n%)",
    presets: [["200", "15"], ["1000", "7.5"], ["5000", "8"]],
    compute: calcPercentOf,
  },
  {
    key: "changeRate",
    label: "増減率",
    description: "A から B への変化率を求める。",
    fieldA: "変更前 (A)",
    fieldB: "変更後 (B)",
    presets: [["100", "125"], ["200", "150"], ["80", "80"]],
    compute: calcChangeRate,
  },
  {
    key: "findTotal",
    label: "全体を逆算",
    description: "部分が n% にあたるとき、全体を逆算する。",
    fieldA: "部分の値",
    fieldB: "パーセント (n%)",
    presets: [["30", "15"], ["75", "50"], ["250", "100"]],
    compute: calcFindTotal,
  },
]

export function PercentageCalculatorTool() {
  const [activeMode, setActiveMode] = useState<PercentageMode>("whatPercent")
  const [inputA, setInputA] = useState("25")
  const [inputB, setInputB] = useState("200")

  const mode = MODES.find((m) => m.key === activeMode)!

  const result = useMemo(
    () => mode.compute(inputA, inputB),
    [mode, inputA, inputB],
  )

  function switchMode(newMode: PercentageMode) {
    const newConfig = MODES.find((m) => m.key === newMode)!
    setActiveMode(newMode)
    setInputA(newConfig.presets[0][0])
    setInputB(newConfig.presets[0][1])
  }

  return (
    <section className="tool-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Interactive Tool</p>
          <h2 className="section-title">割合・パーセントを4つのパターンで計算する</h2>
        </div>
        <p className="meta-copy">処理はブラウザ内だけで完結し、入力は送信しません。</p>
      </div>

      <div className="preset-row">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`tool-button${m.key === activeMode ? " tool-button--active" : ""}`}
            onClick={() => switchMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="tool-workbench">
        <section className="tool-converter">
          <div className="tool-converter__header">
            <p className="eyebrow">{mode.label}</p>
            <h3>{mode.description}</h3>
          </div>

          <div className="field">
            <label htmlFor="pct-input-a">{mode.fieldA}</label>
            <input
              id="pct-input-a"
              type="text"
              inputMode="decimal"
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="pct-input-b">{mode.fieldB}</label>
            <input
              id="pct-input-b"
              type="text"
              inputMode="decimal"
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
            />
          </div>

          <div className="preset-row">
            {mode.presets.map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                type="button"
                className="tool-button"
                onClick={() => {
                  setInputA(a)
                  setInputB(b)
                }}
              >
                {a} / {b}
              </button>
            ))}
          </div>

          <div className="tool-result tool-result--accent">
            <strong>Calculation Result</strong>
            {result.ok ? (
              <div className="result-stack">
                <span className="result-line result-line--primary">{result.formatted}</span>
                <span className="result-line">{result.explanation}</span>
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
