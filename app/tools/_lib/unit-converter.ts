// app/tools/_lib/unit-converter.ts

export type UnitCategory = "length" | "weight" | "temperature" | "speed" | "area"

type UnitDefinition = {
  key: string
  label: string
  labelJa: string
  toBase: (value: number) => number
  fromBase: (value: number) => number
}

type CategoryDefinition = {
  key: UnitCategory
  label: string
  labelJa: string
  baseUnitLabel: string
  units: UnitDefinition[]
}

export type UnitConversionSuccess = {
  ok: true
  fromValue: number
  fromUnit: string
  results: { unitKey: string; label: string; labelJa: string; value: number }[]
}

export type UnitConversionFailure = {
  ok: false
  error: string
}

export type UnitConversionResult = UnitConversionSuccess | UnitConversionFailure

function linearUnit(key: string, label: string, labelJa: string, factor: number): UnitDefinition {
  return {
    key,
    label,
    labelJa,
    toBase: (v) => v * factor,
    fromBase: (v) => v / factor,
  }
}

const LENGTH_UNITS: UnitDefinition[] = [
  linearUnit("mm", "Millimeter", "ミリメートル", 0.001),
  linearUnit("cm", "Centimeter", "センチメートル", 0.01),
  linearUnit("m", "Meter", "メートル", 1),
  linearUnit("km", "Kilometer", "キロメートル", 1000),
  linearUnit("in", "Inch", "インチ", 0.0254),
  linearUnit("ft", "Foot", "フィート", 0.3048),
  linearUnit("yd", "Yard", "ヤード", 0.9144),
  linearUnit("mi", "Mile", "マイル", 1609.344),
  linearUnit("nmi", "Nautical Mile", "海里", 1852),
  linearUnit("shaku", "Shaku (尺)", "尺", 10 / 33),
  linearUnit("sun", "Sun (寸)", "寸", 1 / 33),
]

const WEIGHT_UNITS: UnitDefinition[] = [
  linearUnit("mg", "Milligram", "ミリグラム", 0.001),
  linearUnit("g", "Gram", "グラム", 1),
  linearUnit("kg", "Kilogram", "キログラム", 1000),
  linearUnit("t", "Metric Ton", "トン", 1_000_000),
  linearUnit("oz", "Ounce", "オンス", 28.349523125),
  linearUnit("lb", "Pound", "ポンド", 453.59237),
  linearUnit("kan", "Kan (貫)", "貫", 3750),
  linearUnit("momme", "Momme (匁)", "匁", 3.75),
]

const TEMPERATURE_UNITS: UnitDefinition[] = [
  {
    key: "c",
    label: "Celsius",
    labelJa: "摂氏",
    toBase: (v) => v,
    fromBase: (v) => v,
  },
  {
    key: "f",
    label: "Fahrenheit",
    labelJa: "華氏",
    toBase: (v) => (v - 32) * (5 / 9),
    fromBase: (v) => v * (9 / 5) + 32,
  },
  {
    key: "k",
    label: "Kelvin",
    labelJa: "ケルビン",
    toBase: (v) => v - 273.15,
    fromBase: (v) => v + 273.15,
  },
]

const SPEED_UNITS: UnitDefinition[] = [
  linearUnit("m/s", "Meter/sec", "メートル毎秒", 1),
  linearUnit("km/h", "Kilometer/hour", "キロメートル毎時", 1 / 3.6),
  linearUnit("mph", "Mile/hour", "マイル毎時", 0.44704),
  linearUnit("knot", "Knot", "ノット", 1852 / 3600),
  linearUnit("ft/s", "Foot/sec", "フィート毎秒", 0.3048),
]

const AREA_UNITS: UnitDefinition[] = [
  linearUnit("mm2", "mm\u00B2", "平方ミリメートル", 1e-6),
  linearUnit("cm2", "cm\u00B2", "平方センチメートル", 1e-4),
  linearUnit("m2", "m\u00B2", "平方メートル", 1),
  linearUnit("km2", "km\u00B2", "平方キロメートル", 1e6),
  linearUnit("ha", "Hectare", "ヘクタール", 1e4),
  linearUnit("a", "Are", "アール", 100),
  linearUnit("ac", "Acre", "エーカー", 4046.8564224),
  linearUnit("sqft", "Square Foot", "平方フィート", 0.09290304),
  linearUnit("tsubo", "Tsubo (坪)", "坪", 400 / 121),
  linearUnit("jo", "Jo (畳)", "畳", 200 / 121),
]

const CATEGORIES: CategoryDefinition[] = [
  { key: "length", label: "Length", labelJa: "長さ", baseUnitLabel: "m", units: LENGTH_UNITS },
  { key: "weight", label: "Weight", labelJa: "重量", baseUnitLabel: "g", units: WEIGHT_UNITS },
  { key: "temperature", label: "Temperature", labelJa: "温度", baseUnitLabel: "°C", units: TEMPERATURE_UNITS },
  { key: "speed", label: "Speed", labelJa: "速度", baseUnitLabel: "m/s", units: SPEED_UNITS },
  { key: "area", label: "Area", labelJa: "面積", baseUnitLabel: "m²", units: AREA_UNITS },
]

export function getCategories() {
  return CATEGORIES.map((c) => ({ key: c.key, label: c.label, labelJa: c.labelJa }))
}

export function getUnitsForCategory(category: UnitCategory) {
  const cat = CATEGORIES.find((c) => c.key === category)
  if (!cat) return []
  return cat.units.map((u) => ({ key: u.key, label: u.label, labelJa: u.labelJa }))
}

export function convertUnit(
  value: number,
  fromUnitKey: string,
  category: UnitCategory,
): UnitConversionResult {
  const cat = CATEGORIES.find((c) => c.key === category)
  if (!cat) {
    return { ok: false, error: `カテゴリ「${category}」は存在しません。` }
  }

  const fromUnit = cat.units.find((u) => u.key === fromUnitKey)
  if (!fromUnit) {
    return { ok: false, error: `単位「${fromUnitKey}」はカテゴリ「${cat.labelJa}」に存在しません。` }
  }

  if (!Number.isFinite(value)) {
    return { ok: false, error: "有効な数値を入力してください。" }
  }

  const baseValue = fromUnit.toBase(value)

  const results = cat.units.map((u) => ({
    unitKey: u.key,
    label: u.label,
    labelJa: u.labelJa,
    value: u.fromBase(baseValue),
  }))

  return {
    ok: true,
    fromValue: value,
    fromUnit: fromUnitKey,
    results,
  }
}
