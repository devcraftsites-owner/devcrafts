import { describe, expect, it } from "vitest"

import { testRegex } from "./regex-tester"

describe("testRegex", () => {
  describe("basic matching", () => {
    it("finds all matches with global flag", () => {
      const result = testRegex("\\d+", "abc 123 def 456 ghi")
      expect(result).toMatchObject({ ok: true, matchCount: 2 })
      if (result.ok) {
        expect(result.matches[0]).toMatchObject({ index: 4, text: "123" })
        expect(result.matches[1]).toMatchObject({ index: 12, text: "456" })
      }
    })

    it("finds first match without global flag", () => {
      const result = testRegex("\\d+", "abc 123 def 456", { global: false, caseInsensitive: false, multiline: false, dotAll: false })
      expect(result).toMatchObject({ ok: true, matchCount: 1 })
      if (result.ok) {
        expect(result.matches[0]).toMatchObject({ index: 4, text: "123" })
      }
    })

    it("returns empty matches when pattern does not match", () => {
      const result = testRegex("xyz", "abc def")
      expect(result).toMatchObject({ ok: true, matchCount: 0, matches: [] })
    })
  })

  describe("capture groups", () => {
    it("extracts named-style capture groups", () => {
      const result = testRegex("(\\d{4})-(\\d{2})-(\\d{2})", "date: 2026-03-27")
      expect(result).toMatchObject({ ok: true, matchCount: 1 })
      if (result.ok) {
        expect(result.matches[0].groups).toEqual(["2026", "03", "27"])
      }
    })

    it("handles multiple capture groups across matches", () => {
      const result = testRegex("(\\w+)=(\\w+)", "a=1&b=2&c=3")
      expect(result).toMatchObject({ ok: true, matchCount: 3 })
      if (result.ok) {
        expect(result.matches[0].groups).toEqual(["a", "1"])
        expect(result.matches[2].groups).toEqual(["c", "3"])
      }
    })
  })

  describe("flags", () => {
    it("respects case-insensitive flag", () => {
      const withoutFlag = testRegex("hello", "Hello World", { global: true, caseInsensitive: false, multiline: false, dotAll: false })
      const withFlag = testRegex("hello", "Hello World", { global: true, caseInsensitive: true, multiline: false, dotAll: false })
      expect(withoutFlag).toMatchObject({ ok: true, matchCount: 0 })
      expect(withFlag).toMatchObject({ ok: true, matchCount: 1 })
    })

    it("respects multiline flag", () => {
      const input = "line1\nline2\nline3"
      const withoutFlag = testRegex("^line", input, { global: true, caseInsensitive: false, multiline: false, dotAll: false })
      const withFlag = testRegex("^line", input, { global: true, caseInsensitive: false, multiline: true, dotAll: false })
      expect(withoutFlag).toMatchObject({ ok: true, matchCount: 1 })
      expect(withFlag).toMatchObject({ ok: true, matchCount: 3 })
    })
  })

  describe("boundary cases", () => {
    it("handles zero-length matches without infinite loop", () => {
      const result = testRegex("(?=\\d)", "a1b2c3")
      expect(result).toMatchObject({ ok: true, matchCount: 3 })
    })

    it("handles Japanese text", () => {
      const result = testRegex("[ぁ-ん]+", "hello こんにちは world")
      expect(result).toMatchObject({ ok: true, matchCount: 1 })
      if (result.ok) {
        expect(result.matches[0].text).toBe("こんにちは")
      }
    })
  })

  describe("error cases", () => {
    it("rejects empty pattern", () => {
      expect(testRegex("", "test")).toEqual({
        ok: false,
        error: "正規表現パターンを入力してください。",
      })
    })

    it("rejects empty test string", () => {
      expect(testRegex("\\d+", "")).toEqual({
        ok: false,
        error: "テスト文字列を入力してください。",
      })
    })

    it("reports invalid regex syntax", () => {
      const result = testRegex("[invalid", "test")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain("パターンエラー")
      }
    })
  })
})
