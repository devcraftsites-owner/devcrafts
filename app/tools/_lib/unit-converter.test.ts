// app/tools/_lib/unit-converter.test.ts

import { describe, expect, it } from "vitest"

import { convertUnit } from "./unit-converter"
import type { UnitConversionSuccess } from "./unit-converter"

function findResult(result: UnitConversionSuccess, unitKey: string) {
  return result.results.find((r) => r.unitKey === unitKey)
}

describe("unit-converter", () => {
  describe("normal conversions", () => {
    it("converts meters to kilometers and centimeters", () => {
      const result = convertUnit(1, "m", "length")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const km = findResult(result, "km")
      expect(km).toBeDefined()
      expect(km!.value).toBeCloseTo(0.001, 6)

      const cm = findResult(result, "cm")
      expect(cm).toBeDefined()
      expect(cm!.value).toBeCloseTo(100, 6)
    })

    it("converts kilograms to pounds", () => {
      const result = convertUnit(1, "kg", "weight")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const lb = findResult(result, "lb")
      expect(lb).toBeDefined()
      expect(lb!.value).toBeCloseTo(2.20462, 4)
    })

    it("converts Celsius to Fahrenheit and Kelvin", () => {
      const result = convertUnit(100, "c", "temperature")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const f = findResult(result, "f")
      expect(f).toBeDefined()
      expect(f!.value).toBeCloseTo(212, 4)

      const k = findResult(result, "k")
      expect(k).toBeDefined()
      expect(k!.value).toBeCloseTo(373.15, 4)
    })

    it("converts km/h to m/s", () => {
      const result = convertUnit(3.6, "km/h", "speed")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const ms = findResult(result, "m/s")
      expect(ms).toBeDefined()
      expect(ms!.value).toBeCloseTo(1, 6)
    })

    it("converts square meters to tsubo", () => {
      const result = convertUnit(3.305785, "m2", "area")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const tsubo = findResult(result, "tsubo")
      expect(tsubo).toBeDefined()
      expect(tsubo!.value).toBeCloseTo(1, 3)
    })
  })

  describe("boundary values", () => {
    it("converts zero correctly", () => {
      const result = convertUnit(0, "m", "length")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      for (const r of result.results) {
        expect(r.value).toBe(0)
      }
    })

    it("converts zero Celsius to 32 Fahrenheit and 273.15 Kelvin", () => {
      const result = convertUnit(0, "c", "temperature")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const f = findResult(result, "f")
      expect(f!.value).toBeCloseTo(32, 6)

      const k = findResult(result, "k")
      expect(k!.value).toBeCloseTo(273.15, 6)
    })

    it("handles negative temperatures", () => {
      const result = convertUnit(-40, "c", "temperature")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const f = findResult(result, "f")
      expect(f!.value).toBeCloseTo(-40, 6)
    })
  })

  describe("error cases", () => {
    it("rejects invalid category", () => {
      const result = convertUnit(1, "m", "volume" as never)
      expect(result).toEqual({
        ok: false,
        error: "カテゴリ「volume」は存在しません。",
      })
    })

    it("rejects invalid unit key", () => {
      const result = convertUnit(1, "parsec", "length")
      expect(result).toEqual({
        ok: false,
        error: "単位「parsec」はカテゴリ「長さ」に存在しません。",
      })
    })

    it("rejects NaN input", () => {
      const result = convertUnit(NaN, "m", "length")
      expect(result).toEqual({
        ok: false,
        error: "有効な数値を入力してください。",
      })
    })

    it("rejects Infinity input", () => {
      const result = convertUnit(Infinity, "kg", "weight")
      expect(result).toEqual({
        ok: false,
        error: "有効な数値を入力してください。",
      })
    })
  })
})
