// app/tools/_lib/tax-calculator.ts

export type TaxRate = 10 | 8

export type RoundingMode = "floor" | "ceil" | "round"

export type TaxDirection = "exclusive-to-inclusive" | "inclusive-to-exclusive"

export type TaxCalculatorSuccess = {
  ok: true
  /** 税抜金額 */
  priceWithoutTax: number
  /** 税込金額 */
  priceWithTax: number
  /** 消費税額 */
  taxAmount: number
  /** 適用税率（%） */
  taxRate: TaxRate
  /** 端数処理 */
  roundingMode: RoundingMode
}

export type TaxCalculatorFailure = {
  ok: false
  error: string
}

export type TaxCalculatorResult = TaxCalculatorSuccess | TaxCalculatorFailure

function applyRounding(value: number, mode: RoundingMode): number {
  switch (mode) {
    case "floor":
      return Math.floor(value)
    case "ceil":
      return Math.ceil(value)
    case "round":
      return Math.round(value)
  }
}

function validateAmount(amount: number): string | null {
  if (!Number.isFinite(amount)) {
    return "金額は有効な数値で入力してください。"
  }
  if (amount < 0) {
    return "金額は 0 以上で入力してください。"
  }
  if (amount > 999_999_999_999) {
    return "金額が大きすぎます。999,999,999,999 以下で入力してください。"
  }
  return null
}

export function calculateTax(
  amount: number,
  direction: TaxDirection,
  taxRate: TaxRate = 10,
  roundingMode: RoundingMode = "floor",
): TaxCalculatorResult {
  const error = validateAmount(amount)
  if (error) {
    return { ok: false, error }
  }

  const rate = taxRate / 100

  if (direction === "exclusive-to-inclusive") {
    const taxAmount = applyRounding(amount * rate, roundingMode)
    return {
      ok: true,
      priceWithoutTax: amount,
      priceWithTax: amount + taxAmount,
      taxAmount,
      taxRate,
      roundingMode,
    }
  }

  // inclusive-to-exclusive
  // Use integer arithmetic to avoid floating-point errors:
  // amount / (1 + rate) = amount * 100 / (100 + taxRate)
  const priceWithoutTax = applyRounding((amount * 100) / (100 + taxRate), roundingMode)
  const taxAmount = amount - priceWithoutTax
  return {
    ok: true,
    priceWithoutTax,
    priceWithTax: amount,
    taxAmount,
    taxRate,
    roundingMode,
  }
}
