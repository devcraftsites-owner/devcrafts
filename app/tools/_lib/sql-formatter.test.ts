import { describe, expect, it } from "vitest"

import { formatSql } from "./sql-formatter"

describe("formatSql", () => {
  it("formats basic select clauses on separate lines", () => {
    const result = formatSql("select id, name from users where active = 1 order by id")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.formatted).toContain("SELECT")
      expect(result.formatted).toContain("\nFROM users")
      expect(result.formatted).toContain("\nWHERE active = 1")
      expect(result.formatted).toContain("\nORDER BY id")
    }
  })

  it("uppercases join clauses", () => {
    const result = formatSql("select * from users left join departments on departments.id = users.department_id")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.formatted).toContain("LEFT JOIN departments")
      expect(result.formatted).toContain("\nON departments.id = users.department_id")
    }
  })

  it("rejects empty input", () => {
    expect(formatSql("   ")).toEqual({ ok: false, error: "SQL を入力してください。" })
  })
})
