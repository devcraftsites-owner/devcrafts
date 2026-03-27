import { describe, expect, it } from "vitest"

import { convertGregorianToWareki, convertWarekiToGregorian } from "./wareki"

describe("wareki conversions", () => {
  it("converts Gregorian boundary dates into wareki labels", () => {
    expect(convertGregorianToWareki("2019-05-01")).toMatchObject({
      ok: true,
      wareki: "令和元年5月1日",
      shortWareki: "R1-05-01",
    })

    expect(convertGregorianToWareki("2019-04-30")).toMatchObject({
      ok: true,
      wareki: "平成31年4月30日",
      shortWareki: "H31-04-30",
    })
  })

  it("converts wareki strings back to Gregorian dates", () => {
    expect(convertWarekiToGregorian("令和元年5月1日")).toMatchObject({
      ok: true,
      isoDate: "2019-05-01",
    })

    expect(convertWarekiToGregorian("S64-01-07")).toMatchObject({
      ok: true,
      isoDate: "1989-01-07",
      wareki: "昭和64年1月7日",
    })
  })

  it("rejects wareki values that cross era boundaries", () => {
    expect(convertWarekiToGregorian("平成31年5月1日")).toEqual({
      ok: false,
      error: "元号境界をまたぐため、その日付は指定した和暦では存在しません。",
    })
  })

  it("rejects unsupported or invalid inputs", () => {
    expect(convertGregorianToWareki("2019/05/01")).toEqual({
      ok: false,
      error: "西暦は YYYY-MM-DD 形式で入力してください。",
    })

    expect(convertWarekiToGregorian("明治45年7月29日")).toEqual({
      ok: false,
      error: "対応している和暦形式は 令和/平成/昭和/大正 または R/H/S/T です。",
    })
  })
})
