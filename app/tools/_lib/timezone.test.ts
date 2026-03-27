import { describe, expect, it } from "vitest"

import { convertTimezone, getTimezoneIds } from "./timezone"

describe("timezone conversions", () => {
  it("returns all supported timezone IDs", () => {
    const ids = getTimezoneIds()
    expect(ids).toContain("UTC")
    expect(ids).toContain("JST")
    expect(ids).toContain("PST")
    expect(ids.length).toBe(8)
  })

  it("converts JST noon to all timezones correctly", () => {
    const result = convertTimezone("2026-03-26 12:00", "JST")
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.sourceTimezone).toBe("JST")
    expect(result.sourceDateTime).toBe("2026-03-26 12:00")

    const utc = result.conversions.find((c) => c.timezone === "UTC")
    expect(utc?.datetime).toBe("2026-03-26 03:00")

    const est = result.conversions.find((c) => c.timezone === "EST")
    expect(est?.datetime).toBe("2026-03-25 22:00")

    const pst = result.conversions.find((c) => c.timezone === "PST")
    expect(pst?.datetime).toBe("2026-03-25 19:00")
  })

  it("converts UTC midnight to JST and IST", () => {
    const result = convertTimezone("2026-01-01 00:00", "UTC")
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const jst = result.conversions.find((c) => c.timezone === "JST")
    expect(jst?.datetime).toBe("2026-01-01 09:00")

    const ist = result.conversions.find((c) => c.timezone === "IST")
    expect(ist?.datetime).toBe("2026-01-01 05:30")
  })

  it("converts EST evening to next-day JST", () => {
    const result = convertTimezone("2026-06-15 20:00", "EST")
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const jst = result.conversions.find((c) => c.timezone === "JST")
    expect(jst?.datetime).toBe("2026-06-16 10:00")
  })

  it("handles date-only input as midnight", () => {
    const result = convertTimezone("2026-03-26", "UTC")
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const utc = result.conversions.find((c) => c.timezone === "UTC")
    expect(utc?.datetime).toBe("2026-03-26 00:00")

    const jst = result.conversions.find((c) => c.timezone === "JST")
    expect(jst?.datetime).toBe("2026-03-26 09:00")
  })

  describe("boundary values", () => {
    it("handles date line crossing at midnight UTC", () => {
      const result = convertTimezone("2026-01-01 00:00", "UTC")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const pst = result.conversions.find((c) => c.timezone === "PST")
      expect(pst?.datetime).toBe("2025-12-31 16:00")
      expect(pst?.date).toBe("2025-12-31")

      const aest = result.conversions.find((c) => c.timezone === "AEST")
      expect(aest?.datetime).toBe("2026-01-01 10:00")
    })

    it("handles year boundary crossing from AEST perspective", () => {
      const result = convertTimezone("2026-01-01 05:00", "AEST")
      expect(result.ok).toBe(true)
      if (!result.ok) return

      const utc = result.conversions.find((c) => c.timezone === "UTC")
      expect(utc?.datetime).toBe("2025-12-31 19:00")

      const pst = result.conversions.find((c) => c.timezone === "PST")
      expect(pst?.datetime).toBe("2025-12-31 11:00")
    })
  })

  describe("error handling", () => {
    it("rejects empty input", () => {
      const result = convertTimezone("", "JST")
      expect(result).toEqual({
        ok: false,
        error: "日時を入力してください。",
      })
    })

    it("rejects invalid format", () => {
      const result = convertTimezone("2026/03/26 12:00", "JST")
      expect(result).toEqual({
        ok: false,
        error: "日時は YYYY-MM-DD HH:mm または YYYY-MM-DD 形式で入力してください。",
      })
    })

    it("rejects unsupported timezone", () => {
      const result = convertTimezone("2026-03-26 12:00", "INVALID")
      expect(result).toEqual({
        ok: false,
        error: "未対応のタイムゾーンです: INVALID",
      })
    })

    it("rejects invalid date values", () => {
      const result = convertTimezone("2026-02-30 12:00", "JST")
      expect(result).toEqual({
        ok: false,
        error: "存在しない日時です。日付と時刻を確認してください。",
      })
    })
  })
})
