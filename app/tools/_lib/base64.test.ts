import { describe, expect, it } from "vitest"

import { convertBase64 } from "./base64"

describe("convertBase64", () => {
  describe("encode", () => {
    it("encodes ASCII text", () => {
      const result = convertBase64("Hello, World!", "encode")
      expect(result).toMatchObject({
        ok: true,
        result: "SGVsbG8sIFdvcmxkIQ==",
      })
    })

    it("encodes Japanese text (multibyte UTF-8)", () => {
      const result = convertBase64("こんにちは", "encode")
      expect(result).toMatchObject({ ok: true })
      if (result.ok) {
        expect(result.result).toBe("44GT44KT44Gr44Gh44Gv")
        expect(result.inputByteSize).toBe(15)
      }
    })

    it("encodes empty-ish whitespace-only input as error", () => {
      expect(convertBase64("   ", "encode")).toMatchObject({
        ok: false,
        error: "エンコードするテキストを入力してください。",
      })
    })

    it("encodes a single character", () => {
      const result = convertBase64("A", "encode")
      expect(result).toMatchObject({ ok: true, result: "QQ==" })
    })
  })

  describe("decode", () => {
    it("decodes ASCII Base64 back to text", () => {
      const result = convertBase64("SGVsbG8sIFdvcmxkIQ==", "decode")
      expect(result).toMatchObject({
        ok: true,
        result: "Hello, World!",
      })
    })

    it("decodes Japanese Base64 back to text", () => {
      const result = convertBase64("44GT44KT44Gr44Gh44Gv", "decode")
      expect(result).toMatchObject({
        ok: true,
        result: "こんにちは",
      })
    })

    it("ignores whitespace in Base64 input", () => {
      const result = convertBase64("SGVs bG8s\nIFdv cmxk IQ==", "decode")
      expect(result).toMatchObject({ ok: true, result: "Hello, World!" })
    })
  })

  describe("boundary cases", () => {
    it("round-trips encode then decode", () => {
      const original = "テスト文字列 123 !@#"
      const encoded = convertBase64(original, "encode")
      expect(encoded.ok).toBe(true)
      if (encoded.ok) {
        const decoded = convertBase64(encoded.result, "decode")
        expect(decoded).toMatchObject({ ok: true, result: original })
      }
    })

    it("handles Base64 without padding", () => {
      const result = convertBase64("QQ", "decode")
      expect(result).toMatchObject({ ok: true, result: "A" })
    })
  })

  describe("error cases", () => {
    it("rejects empty input for decode", () => {
      expect(convertBase64("", "decode")).toMatchObject({
        ok: false,
        error: "デコードする Base64 文字列を入力してください。",
      })
    })

    it("rejects invalid Base64 characters", () => {
      const result = convertBase64("あいうえお", "decode")
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain("有効な Base64 文字列ではありません")
      }
    })
  })
})
