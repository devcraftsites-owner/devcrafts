import { describe, expect, it } from "vitest"

import { calculateBusinessDays } from "./business-days"

describe("calculateBusinessDays", () => {
  describe("normal cases", () => {
    it("counts weekday-only business days for a typical week", () => {
      // 2024-01-08 (Mon) to 2024-01-12 (Fri) = 5 weekdays, no holidays
      const result = calculateBusinessDays("2024-01-08", "2024-01-12", "")
      expect(result).toEqual({
        ok: true,
        businessDays: 5,
        totalDays: 5,
        weekendDays: 0,
        holidayDays: 0,
      })
    })

    it("excludes weekends from a two-week span", () => {
      // 2024-01-08 (Mon) to 2024-01-19 (Fri) = 12 total, 2 weekend days (Sat+Sun), 10 business days
      const result = calculateBusinessDays("2024-01-08", "2024-01-19", "")
      expect(result).toEqual({
        ok: true,
        businessDays: 10,
        totalDays: 12,
        weekendDays: 2,
        holidayDays: 0,
      })
    })

    it("excludes holidays that fall on weekdays", () => {
      // 2024-01-08 (Mon) to 2024-01-12 (Fri), with 2024-01-10 as holiday
      const result = calculateBusinessDays("2024-01-08", "2024-01-12", "2024-01-10")
      expect(result).toEqual({
        ok: true,
        businessDays: 4,
        totalDays: 5,
        weekendDays: 0,
        holidayDays: 1,
      })
    })

    it("handles multiple holidays separated by newlines", () => {
      const result = calculateBusinessDays("2024-01-08", "2024-01-12", "2024-01-09\n2024-01-11")
      expect(result).toEqual({
        ok: true,
        businessDays: 3,
        totalDays: 5,
        weekendDays: 0,
        holidayDays: 2,
      })
    })
  })

  describe("saturday exclusion option", () => {
    it("includes Saturday as business day when excludeSaturday is false", () => {
      // 2024-01-06 (Sat) to 2024-01-07 (Sun)
      // excludeSaturday=false: only Sunday is weekend
      const result = calculateBusinessDays("2024-01-06", "2024-01-07", "", false)
      expect(result).toEqual({
        ok: true,
        businessDays: 1,
        totalDays: 2,
        weekendDays: 1,
        holidayDays: 0,
      })
    })

    it("excludes Saturday when excludeSaturday is true (default)", () => {
      // 2024-01-06 (Sat) to 2024-01-07 (Sun)
      const result = calculateBusinessDays("2024-01-06", "2024-01-07", "")
      expect(result).toEqual({
        ok: true,
        businessDays: 0,
        totalDays: 2,
        weekendDays: 2,
        holidayDays: 0,
      })
    })
  })

  describe("boundary cases", () => {
    it("handles same start and end date on a weekday", () => {
      // 2024-01-08 (Mon) — single day
      const result = calculateBusinessDays("2024-01-08", "2024-01-08", "")
      expect(result).toEqual({
        ok: true,
        businessDays: 1,
        totalDays: 1,
        weekendDays: 0,
        holidayDays: 0,
      })
    })

    it("handles same start and end date on a weekend", () => {
      // 2024-01-06 (Sat) — single day, weekend
      const result = calculateBusinessDays("2024-01-06", "2024-01-06", "")
      expect(result).toEqual({
        ok: true,
        businessDays: 0,
        totalDays: 1,
        weekendDays: 1,
        holidayDays: 0,
      })
    })

    it("does not double-count a holiday that falls on a weekend", () => {
      // 2024-01-06 (Sat) listed as holiday — weekend takes precedence
      const result = calculateBusinessDays("2024-01-06", "2024-01-07", "2024-01-06")
      expect(result).toEqual({
        ok: true,
        businessDays: 0,
        totalDays: 2,
        weekendDays: 2,
        holidayDays: 0,
      })
    })
  })

  describe("error cases", () => {
    it("rejects invalid start date", () => {
      const result = calculateBusinessDays("not-a-date", "2024-01-12", "")
      expect(result).toEqual({
        ok: false,
        error: "開始日が不正です。YYYY-MM-DD 形式（ゼロ埋め）で入力してください。例: 2026-03-01",
      })
    })

    it("rejects invalid end date", () => {
      const result = calculateBusinessDays("2024-01-08", "2024-13-01", "")
      expect(result).toEqual({
        ok: false,
        error: "終了日が不正です。YYYY-MM-DD 形式（ゼロ埋め）で入力してください。例: 2026-03-31",
      })
    })

    it("rejects start date after end date", () => {
      const result = calculateBusinessDays("2024-01-12", "2024-01-08", "")
      expect(result).toEqual({
        ok: false,
        error: "開始日は終了日以前にしてください。",
      })
    })
  })
})
