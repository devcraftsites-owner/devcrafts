import { describe, expect, it } from "vitest"

import { csvToJson, jsonToCsv } from "./csv-json"

describe("csvToJson", () => {
  it("converts headered csv to json array", () => {
    const result = csvToJson("id,name\n1,田中\n2,佐藤")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result).toContain('"name": "田中"')
      expect(result.result).toContain('"id": "2"')
    }
  })

  it("handles quoted commas and newlines", () => {
    const result = csvToJson('id,comment\n1,"1行目\n2行目,続き"')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result).toContain("2行目,続き")
    }
  })
})

describe("jsonToCsv", () => {
  it("converts object array to csv", () => {
    const result = jsonToCsv('[{"id":1,"name":"田中"},{"id":2,"name":"佐藤"}]')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result).toContain("id,name")
      expect(result.result).toContain("1,田中")
    }
  })

  it("stringifies nested values", () => {
    const result = jsonToCsv('[{"id":1,"meta":{"role":"admin"}}]')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result).toContain('"{""role"":""admin""}"')
    }
  })

  it("rejects non-object arrays", () => {
    expect(jsonToCsv('["a","b"]')).toEqual({
      ok: false,
      error: "JSON → CSV はオブジェクト配列に対応しています。",
    })
  })
})
