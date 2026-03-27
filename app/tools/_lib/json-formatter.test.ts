import { describe, expect, it } from "vitest"

import { formatJson } from "./json-formatter"

describe("formatJson", () => {
  describe("pretty mode", () => {
    it("formats a simple object with default indent", () => {
      const result = formatJson('{"a":1,"b":2}')
      expect(result).toMatchObject({
        ok: true,
        formatted: '{\n  "a": 1,\n  "b": 2\n}',
        lineCount: 4,
      })
    })

    it("formats a nested object", () => {
      const result = formatJson('{"user":{"name":"Taro","age":30}}')
      expect(result).toMatchObject({ ok: true })
      if (result.ok) {
        expect(result.formatted).toContain('"user"')
        expect(result.formatted).toContain('"name": "Taro"')
        expect(result.lineCount).toBeGreaterThan(1)
      }
    })

    it("formats an array", () => {
      const result = formatJson("[1,2,3]")
      expect(result).toMatchObject({
        ok: true,
        formatted: "[\n  1,\n  2,\n  3\n]",
        lineCount: 5,
      })
    })

    it("respects custom indent size", () => {
      const result = formatJson('{"a":1}', "pretty", 4)
      expect(result).toMatchObject({
        ok: true,
        formatted: '{\n    "a": 1\n}',
      })
    })
  })

  describe("compact mode", () => {
    it("compresses formatted JSON into a single line", () => {
      const input = '{\n  "a": 1,\n  "b": 2\n}'
      const result = formatJson(input, "compact")
      expect(result).toMatchObject({
        ok: true,
        formatted: '{"a":1,"b":2}',
        lineCount: 1,
      })
    })
  })

  describe("byte size calculation", () => {
    it("reports correct byte size for ASCII content", () => {
      const result = formatJson('{"a":1}', "compact")
      expect(result).toMatchObject({ ok: true, byteSize: 7 })
    })

    it("reports correct byte size for multibyte content", () => {
      const result = formatJson('{"名前":"太郎"}', "compact")
      if (result.ok) {
        expect(result.byteSize).toBeGreaterThan(result.formatted.length)
      }
    })
  })

  describe("boundary cases", () => {
    it("handles primitives as valid JSON", () => {
      expect(formatJson('"hello"')).toMatchObject({ ok: true, formatted: '"hello"' })
      expect(formatJson("42")).toMatchObject({ ok: true, formatted: "42" })
      expect(formatJson("true")).toMatchObject({ ok: true, formatted: "true" })
      expect(formatJson("null")).toMatchObject({ ok: true, formatted: "null" })
    })

    it("trims surrounding whitespace before parsing", () => {
      const result = formatJson('  {"a":1}  ', "compact")
      expect(result).toMatchObject({ ok: true, formatted: '{"a":1}' })
    })
  })

  describe("error cases", () => {
    it("rejects empty input", () => {
      expect(formatJson("")).toEqual({
        ok: false,
        error: "JSON 文字列を入力してください。",
      })
      expect(formatJson("   ")).toEqual({
        ok: false,
        error: "JSON 文字列を入力してください。",
      })
    })

    it("rejects invalid JSON with syntax error", () => {
      const result = formatJson("{a:1}")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain("構文エラー")
      }
    })

    it("rejects trailing comma", () => {
      const result = formatJson('{"a":1,}')
      expect(result.ok).toBe(false)
    })
  })
})
