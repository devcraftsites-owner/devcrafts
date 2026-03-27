// app/tools/_lib/percentage-calculator.test.ts

import { describe, expect, it } from "vitest"

import { calcChangeRate, calcFindTotal, calcPercentOf, calcWhatPercent } from "./percentage-calculator"

describe("percentage-calculator", () => {
  describe("calcWhatPercent — AはBの何%か", () => {
    it("基本的な割合を計算する", () => {
      expect(calcWhatPercent("25", "200")).toMatchObject({
        ok: true,
        result: 12.5,
        formatted: "12.5%",
      })
    })

    it("100%のケースを計算する", () => {
      expect(calcWhatPercent("500", "500")).toMatchObject({
        ok: true,
        result: 100,
      })
    })

    it("100%を超えるケースを計算する", () => {
      expect(calcWhatPercent("300", "200")).toMatchObject({
        ok: true,
        result: 150,
      })
    })

    it("全体が0のときエラーを返す", () => {
      expect(calcWhatPercent("10", "0")).toEqual({
        ok: false,
        error: "全体の値が 0 のときは割合を計算できません。",
      })
    })

    it("空入力でエラーを返す", () => {
      expect(calcWhatPercent("", "100")).toEqual({
        ok: false,
        error: "部分の値を入力してください。",
      })
    })
  })

  describe("calcPercentOf — Aのn%はいくつか", () => {
    it("基本的なパーセント計算をする", () => {
      expect(calcPercentOf("200", "15")).toMatchObject({
        ok: true,
        result: 30,
        formatted: "30",
      })
    })

    it("0%で0を返す", () => {
      expect(calcPercentOf("500", "0")).toMatchObject({
        ok: true,
        result: 0,
      })
    })

    it("小数のパーセントを計算する", () => {
      expect(calcPercentOf("1000", "7.5")).toMatchObject({
        ok: true,
        result: 75,
      })
    })

    it("不正な入力でエラーを返す", () => {
      expect(calcPercentOf("abc", "10")).toEqual({
        ok: false,
        error: "元の値は有効な数値で入力してください。",
      })
    })
  })

  describe("calcChangeRate — AからBへの増減率", () => {
    it("増加率を計算する", () => {
      expect(calcChangeRate("100", "125")).toMatchObject({
        ok: true,
        result: 25,
        formatted: "+25%",
      })
    })

    it("減少率を計算する", () => {
      expect(calcChangeRate("200", "150")).toMatchObject({
        ok: true,
        result: -25,
        formatted: "-25%",
      })
    })

    it("変化なしで0%を返す", () => {
      expect(calcChangeRate("80", "80")).toMatchObject({
        ok: true,
        result: 0,
        formatted: "+0%",
      })
    })

    it("変更前が0のときエラーを返す", () => {
      expect(calcChangeRate("0", "100")).toEqual({
        ok: false,
        error: "変更前の値が 0 のときは増減率を計算できません。",
      })
    })
  })

  describe("calcFindTotal — 部分がn%のとき全体を逆算", () => {
    it("全体を逆算する", () => {
      expect(calcFindTotal("30", "15")).toMatchObject({
        ok: true,
        result: 200,
        formatted: "200",
      })
    })

    it("50%から全体を逆算する", () => {
      expect(calcFindTotal("75", "50")).toMatchObject({
        ok: true,
        result: 150,
      })
    })

    it("100%のとき部分と全体が一致する", () => {
      expect(calcFindTotal("250", "100")).toMatchObject({
        ok: true,
        result: 250,
      })
    })

    it("パーセントが0のときエラーを返す", () => {
      expect(calcFindTotal("100", "0")).toEqual({
        ok: false,
        error: "パーセントが 0 のときは全体を逆算できません。",
      })
    })

    it("パーセントが空のときエラーを返す", () => {
      expect(calcFindTotal("100", "  ")).toEqual({
        ok: false,
        error: "パーセントを入力してください。",
      })
    })
  })
})
