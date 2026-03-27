import { describe, expect, it } from "vitest"

import { getJapanHolidays } from "./japan-holidays"

describe("getJapanHolidays", () => {
  describe("normal cases", () => {
    it("returns all holidays for 2024 with correct count", () => {
      const result = getJapanHolidays("2024")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.count).toBeGreaterThanOrEqual(16)
      expect(result.holidays[0]).toEqual({ date: "2024-01-01", name: "元日" })

      const names = result.holidays.map((h) => h.name)
      expect(names).toContain("成人の日")
      expect(names).toContain("建国記念の日")
      expect(names).toContain("天皇誕生日")
      expect(names).toContain("春分の日")
      expect(names).toContain("昭和の日")
      expect(names).toContain("憲法記念日")
      expect(names).toContain("みどりの日")
      expect(names).toContain("こどもの日")
      expect(names).toContain("海の日")
      expect(names).toContain("山の日")
      expect(names).toContain("敬老の日")
      expect(names).toContain("秋分の日")
      expect(names).toContain("スポーツの日")
      expect(names).toContain("文化の日")
      expect(names).toContain("勤労感謝の日")
    })

    it("returns holidays sorted by date", () => {
      const result = getJapanHolidays("2025")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      for (let i = 1; i < result.holidays.length; i++) {
        expect(result.holidays[i].date >= result.holidays[i - 1].date).toBe(true)
      }
    })

    it("includes substitute holidays when a holiday falls on Sunday", () => {
      // 2023-01-01 is Sunday, so 2023-01-02 should be a substitute holiday
      const result = getJapanHolidays("2023")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const substituteOnJan2 = result.holidays.find(
        (h) => h.date === "2023-01-02" && h.name === "振替休日"
      )
      expect(substituteOnJan2).toBeDefined()
    })

    it("uses old holiday names for years before law changes", () => {
      // Before 2007: 4/29 should be "みどりの日", not "昭和の日"
      const result = getJapanHolidays("2006")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const apr29 = result.holidays.find((h) => h.date === "2006-04-29")
      expect(apr29?.name).toBe("みどりの日")
    })
  })

  describe("boundary values", () => {
    it("accepts the minimum year 1948", () => {
      const result = getJapanHolidays("1948")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.holidays.length).toBeGreaterThan(0)
      const names = result.holidays.map((h) => h.name)
      expect(names).toContain("文化の日")
      expect(names).toContain("勤労感謝の日")
    })

    it("accepts the maximum year 2100", () => {
      const result = getJapanHolidays("2100")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.holidays.length).toBeGreaterThan(0)
    })

    it("uses fixed date for Coming of Age Day before 2000 and Happy Monday after", () => {
      // 1999: fixed Jan 15
      const result1999 = getJapanHolidays("1999")
      expect(result1999.ok).toBe(true)
      if (!result1999.ok) return
      const seijin1999 = result1999.holidays.find((h) => h.name === "成人の日")
      expect(seijin1999?.date).toBe("1999-01-15")

      // 2000: second Monday of January
      const result2000 = getJapanHolidays("2000")
      expect(result2000.ok).toBe(true)
      if (!result2000.ok) return
      const seijin2000 = result2000.holidays.find((h) => h.name === "成人の日")
      expect(seijin2000?.date).toBe("2000-01-10")
    })
  })

  describe("error cases", () => {
    it("rejects years below 1948", () => {
      const result = getJapanHolidays("1947")
      expect(result).toEqual({
        ok: false,
        error: "年は 1948〜2100 の整数で入力してください。",
      })
    })

    it("rejects years above 2100", () => {
      const result = getJapanHolidays("2101")
      expect(result).toEqual({
        ok: false,
        error: "年は 1948〜2100 の整数で入力してください。",
      })
    })

    it("rejects non-integer input", () => {
      expect(getJapanHolidays("abc")).toEqual({
        ok: false,
        error: "年は 1948〜2100 の整数で入力してください。",
      })

      expect(getJapanHolidays("2024.5")).toEqual({
        ok: false,
        error: "年は 1948〜2100 の整数で入力してください。",
      })
    })

    it("rejects empty input", () => {
      expect(getJapanHolidays("")).toEqual({
        ok: false,
        error: "年は 1948〜2100 の整数で入力してください。",
      })
    })
  })
})
