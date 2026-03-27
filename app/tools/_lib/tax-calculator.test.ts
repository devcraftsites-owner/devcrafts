import { describe, expect, it } from "vitest"

import { calculateTax } from "./tax-calculator"

describe("tax-calculator", () => {
  describe("exclusive-to-inclusive (税抜 → 税込)", () => {
    it("calculates 10% tax with floor rounding", () => {
      expect(calculateTax(1000, "exclusive-to-inclusive", 10, "floor")).toMatchObject({
        ok: true,
        priceWithoutTax: 1000,
        priceWithTax: 1100,
        taxAmount: 100,
      })
    })

    it("calculates 8% tax (reduced rate)", () => {
      expect(calculateTax(1000, "exclusive-to-inclusive", 8, "floor")).toMatchObject({
        ok: true,
        priceWithoutTax: 1000,
        priceWithTax: 1080,
        taxAmount: 80,
      })
    })

    it("applies floor rounding for fractional tax", () => {
      // 999 * 0.10 = 99.9 → floor = 99
      expect(calculateTax(999, "exclusive-to-inclusive", 10, "floor")).toMatchObject({
        ok: true,
        taxAmount: 99,
        priceWithTax: 1098,
      })
    })

    it("applies ceil rounding for fractional tax", () => {
      // 999 * 0.10 = 99.9 → ceil = 100
      expect(calculateTax(999, "exclusive-to-inclusive", 10, "ceil")).toMatchObject({
        ok: true,
        taxAmount: 100,
        priceWithTax: 1099,
      })
    })

    it("applies round (四捨五入) for fractional tax", () => {
      // 999 * 0.10 = 99.9 → round = 100
      expect(calculateTax(999, "exclusive-to-inclusive", 10, "round")).toMatchObject({
        ok: true,
        taxAmount: 100,
        priceWithTax: 1099,
      })
    })
  })

  describe("inclusive-to-exclusive (税込 → 税抜)", () => {
    it("calculates 10% reverse with floor rounding", () => {
      // 1100 * 100 / 110 = 1000.0 → floor = 1000
      expect(calculateTax(1100, "inclusive-to-exclusive", 10, "floor")).toMatchObject({
        ok: true,
        priceWithoutTax: 1000,
        priceWithTax: 1100,
        taxAmount: 100,
      })
    })

    it("calculates 8% reverse with floor rounding", () => {
      // 1080 * 100 / 108 = 1000.0 → floor = 1000
      expect(calculateTax(1080, "inclusive-to-exclusive", 8, "floor")).toMatchObject({
        ok: true,
        priceWithoutTax: 1000,
        priceWithTax: 1080,
        taxAmount: 80,
      })
    })

    it("applies ceil rounding for reverse calculation", () => {
      // 1099 / 1.10 = 999.0909... → ceil = 1000
      expect(calculateTax(1099, "inclusive-to-exclusive", 10, "ceil")).toMatchObject({
        ok: true,
        priceWithoutTax: 1000,
        taxAmount: 99,
      })
    })
  })

  describe("boundary values", () => {
    it("handles zero amount", () => {
      expect(calculateTax(0, "exclusive-to-inclusive", 10, "floor")).toMatchObject({
        ok: true,
        priceWithoutTax: 0,
        priceWithTax: 0,
        taxAmount: 0,
      })
    })

    it("handles 1 yen (minimum positive)", () => {
      // 1 * 0.10 = 0.1 → floor = 0
      expect(calculateTax(1, "exclusive-to-inclusive", 10, "floor")).toMatchObject({
        ok: true,
        priceWithoutTax: 1,
        priceWithTax: 1,
        taxAmount: 0,
      })
    })

    it("handles 1 yen with ceil rounding", () => {
      // 1 * 0.10 = 0.1 → ceil = 1
      expect(calculateTax(1, "exclusive-to-inclusive", 10, "ceil")).toMatchObject({
        ok: true,
        priceWithoutTax: 1,
        priceWithTax: 2,
        taxAmount: 1,
      })
    })
  })

  describe("error cases", () => {
    it("rejects negative amounts", () => {
      expect(calculateTax(-100, "exclusive-to-inclusive", 10, "floor")).toEqual({
        ok: false,
        error: "金額は 0 以上で入力してください。",
      })
    })

    it("rejects NaN", () => {
      expect(calculateTax(Number.NaN, "exclusive-to-inclusive", 10, "floor")).toEqual({
        ok: false,
        error: "金額は有効な数値で入力してください。",
      })
    })

    it("rejects excessively large amounts", () => {
      expect(calculateTax(1_000_000_000_000, "exclusive-to-inclusive", 10, "floor")).toEqual({
        ok: false,
        error: "金額が大きすぎます。999,999,999,999 以下で入力してください。",
      })
    })
  })
})
