import { describe, expect, it } from "vitest"
import { computeHash, computeHashSync } from "./hash"

describe("computeHash", () => {
  it("SHA-256 で空入力はエラーを返す", async () => {
    const result = await computeHash("", "SHA-256")
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain("入力")
    }
  })

  it("SHA-256 で既知の値を返す", async () => {
    const result = await computeHash("hello", "SHA-256")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.hex).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
      expect(result.algorithm).toBe("SHA-256")
      expect(result.inputByteSize).toBe(5)
    }
  })

  it("SHA-1 で既知の値を返す", async () => {
    const result = await computeHash("hello", "SHA-1")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.hex).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d")
    }
  })

  it("SHA-512 で正しいハッシュ長を返す", async () => {
    const result = await computeHash("hello", "SHA-512")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.hex).toHaveLength(128)
    }
  })

  it("SHA-384 で正しいハッシュ長を返す", async () => {
    const result = await computeHash("hello", "SHA-384")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.hex).toHaveLength(96)
    }
  })

  it("MD5 で既知の値を返す", async () => {
    const result = await computeHash("hello", "MD5")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.hex).toBe("5d41402abc4b2a76b9719d911017c592")
    }
  })

  it("日本語テキストのハッシュを計算できる", async () => {
    const result = await computeHash("こんにちは", "SHA-256")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.hex).toHaveLength(64)
      expect(result.inputByteSize).toBe(15)
    }
  })

  it("base64 出力も返す", async () => {
    const result = await computeHash("hello", "SHA-256")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.base64).toBe("LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=")
    }
  })
})

describe("computeHashSync", () => {
  it("MD5 同期で既知の値を返す", () => {
    const result = computeHashSync("hello", "MD5")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.hex).toBe("5d41402abc4b2a76b9719d911017c592")
    }
  })

  it("MD5 以外はエラーを返す", () => {
    const result = computeHashSync("hello", "SHA-256")
    expect(result.ok).toBe(false)
  })

  it("空文字列のMD5ハッシュを計算できる", async () => {
    const result = await computeHash(" test ", "MD5")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.hex).toBe("098f6bcd4621d373cade4e832627b4f6")
    }
  })
})
