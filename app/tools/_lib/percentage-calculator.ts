// app/tools/_lib/percentage-calculator.ts

export type PercentageMode = "whatPercent" | "percentOf" | "changeRate" | "findTotal"

export type PercentageSuccess = {
  ok: true
  mode: PercentageMode
  result: number
  formatted: string
  explanation: string
}

export type PercentageFailure = {
  ok: false
  error: string
}

export type PercentageResult = PercentageSuccess | PercentageFailure

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function formatNumber(value: number): string {
  return roundTo(value, 6).toString()
}

function parseNumericInput(input: string, label: string): number | PercentageFailure {
  const trimmed = input.trim()
  if (trimmed === "") {
    return { ok: false, error: `${label}を入力してください。` }
  }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) {
    return { ok: false, error: `${label}は有効な数値で入力してください。` }
  }
  return value
}

/**
 * 「AはBの何%か」を計算する
 * result = (part / whole) * 100
 */
export function calcWhatPercent(partInput: string, wholeInput: string): PercentageResult {
  const part = parseNumericInput(partInput, "部分の値")
  if (typeof part !== "number") return part
  const whole = parseNumericInput(wholeInput, "全体の値")
  if (typeof whole !== "number") return whole

  if (whole === 0) {
    return { ok: false, error: "全体の値が 0 のときは割合を計算できません。" }
  }

  const result = (part / whole) * 100
  return {
    ok: true,
    mode: "whatPercent",
    result: roundTo(result, 6),
    formatted: `${formatNumber(result)}%`,
    explanation: `${partInput} は ${wholeInput} の ${formatNumber(result)}%`,
  }
}

/**
 * 「Aの n% はいくつか」を計算する
 * result = base * (percent / 100)
 */
export function calcPercentOf(baseInput: string, percentInput: string): PercentageResult {
  const base = parseNumericInput(baseInput, "元の値")
  if (typeof base !== "number") return base
  const percent = parseNumericInput(percentInput, "パーセント")
  if (typeof percent !== "number") return percent

  const result = base * (percent / 100)
  return {
    ok: true,
    mode: "percentOf",
    result: roundTo(result, 6),
    formatted: formatNumber(result),
    explanation: `${baseInput} の ${percentInput}% は ${formatNumber(result)}`,
  }
}

/**
 * 「AからBへの増減率」を計算する
 * result = ((after - before) / before) * 100
 */
export function calcChangeRate(beforeInput: string, afterInput: string): PercentageResult {
  const before = parseNumericInput(beforeInput, "変更前の値")
  if (typeof before !== "number") return before
  const after = parseNumericInput(afterInput, "変更後の値")
  if (typeof after !== "number") return after

  if (before === 0) {
    return { ok: false, error: "変更前の値が 0 のときは増減率を計算できません。" }
  }

  const result = ((after - before) / before) * 100
  const sign = result >= 0 ? "+" : ""
  return {
    ok: true,
    mode: "changeRate",
    result: roundTo(result, 6),
    formatted: `${sign}${formatNumber(result)}%`,
    explanation: `${beforeInput} → ${afterInput} は ${sign}${formatNumber(result)}% の変化`,
  }
}

/**
 * 「部分がn%のとき、全体はいくつか」を逆算する
 * result = part / (percent / 100)
 */
export function calcFindTotal(partInput: string, percentInput: string): PercentageResult {
  const part = parseNumericInput(partInput, "部分の値")
  if (typeof part !== "number") return part
  const percent = parseNumericInput(percentInput, "パーセント")
  if (typeof percent !== "number") return percent

  if (percent === 0) {
    return { ok: false, error: "パーセントが 0 のときは全体を逆算できません。" }
  }

  const result = part / (percent / 100)
  return {
    ok: true,
    mode: "findTotal",
    result: roundTo(result, 6),
    formatted: formatNumber(result),
    explanation: `${partInput} が ${percentInput}% にあたるとき、全体は ${formatNumber(result)}`,
  }
}
