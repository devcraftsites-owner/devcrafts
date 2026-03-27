import { describe, expect, it } from "vitest"

import { jsonToTypeScript } from "./json-to-ts"

describe("jsonToTypeScript", () => {
  it("generates a root type from an object", () => {
    const result = jsonToTypeScript('{"id":1,"name":"田中","active":true}', "User")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result).toContain("type User = {")
      expect(result.result).toContain("id: number")
      expect(result.result).toContain("name: string")
      expect(result.result).toContain("active: boolean")
    }
  })

  it("generates array element types", () => {
    const result = jsonToTypeScript('[{"id":1},{"id":2,"name":"佐藤"}]')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result).toContain("type Root = ({")
      expect(result.result).toContain("name: string")
    }
  })

  it("rejects invalid json", () => {
    const result = jsonToTypeScript("{invalid}")
    expect(result.ok).toBe(false)
  })
})
