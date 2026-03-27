type EraDefinition = {
  key: "reiwa" | "heisei" | "showa" | "taisho"
  kanji: string
  short: string
  start: string
  end?: string
  baseYear: number
}

type GregorianParts = {
  year: number
  month: number
  day: number
}

type WarekiParts = {
  era: EraDefinition
  yearOfEra: number
  month: number
  day: number
}

export type WarekiConversionSuccess = {
  ok: true
  isoDate: string
  wareki: string
  shortWareki: string
}

export type WarekiConversionFailure = {
  ok: false
  error: string
}

export type WarekiConversionResult = WarekiConversionSuccess | WarekiConversionFailure

const ERAS: EraDefinition[] = [
  { key: "reiwa", kanji: "令和", short: "R", start: "2019-05-01", baseYear: 2018 },
  { key: "heisei", kanji: "平成", short: "H", start: "1989-01-08", end: "2019-04-30", baseYear: 1988 },
  { key: "showa", kanji: "昭和", short: "S", start: "1926-12-25", end: "1989-01-07", baseYear: 1925 },
  { key: "taisho", kanji: "大正", short: "T", start: "1912-07-30", end: "1926-12-24", baseYear: 1911 },
]

function pad(value: number) {
  return value.toString().padStart(2, "0")
}

function compareIsoDate(left: string, right: string) {
  return left.localeCompare(right)
}

function buildIsoDate(parts: GregorianParts) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

function parseGregorianDate(input: string): GregorianParts | null {
  const normalized = input.trim()
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)

  if (!match) {
    return null
  }

  const [, yearText, monthText, dayText] = match
  const year = Number.parseInt(yearText, 10)
  const month = Number.parseInt(monthText, 10)
  const day = Number.parseInt(dayText, 10)

  if (!isValidDate(year, month, day)) {
    return null
  }

  return { year, month, day }
}

function isValidDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false
  }

  const candidate = new Date(Date.UTC(year, month - 1, day))

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  )
}

function findEraByGregorianDate(isoDate: string) {
  return ERAS.find((era) => compareIsoDate(isoDate, era.start) >= 0 && (!era.end || compareIsoDate(isoDate, era.end) <= 0))
}

function formatYearOfEra(yearOfEra: number) {
  return yearOfEra === 1 ? "元" : String(yearOfEra)
}

function formatWarekiFromParts(parts: WarekiParts) {
  return `${parts.era.kanji}${formatYearOfEra(parts.yearOfEra)}年${parts.month}月${parts.day}日`
}

function formatShortWareki(parts: WarekiParts) {
  return `${parts.era.short}${parts.yearOfEra}-${pad(parts.month)}-${pad(parts.day)}`
}

function normalizeWarekiInput(input: string) {
  return input
    .trim()
    .replace(/\s+/g, "")
    .replace(/[／]/g, "/")
    .replace(/[－ー―]/g, "-")
}

function parseWarekiInput(input: string): WarekiParts | WarekiConversionFailure {
  const normalized = normalizeWarekiInput(input)

  if (!normalized) {
    return { ok: false, error: "和暦入力が空です。" }
  }

  for (const era of ERAS) {
    const kanjiPattern = new RegExp(`^${era.kanji}(元|\\d{1,2})年(\\d{1,2})月(\\d{1,2})日$`)
    const shortPattern = new RegExp(`^${era.short}(\\d{1,2}|元)[-/](\\d{1,2})[-/](\\d{1,2})$`, "i")
    const kanjiMatch = normalized.match(kanjiPattern)
    const shortMatch = normalized.match(shortPattern)
    const match = kanjiMatch ?? shortMatch

    if (!match) {
      continue
    }

    const [, yearText, monthText, dayText] = match
    const yearOfEra = yearText === "元" ? 1 : Number.parseInt(yearText, 10)
    const month = Number.parseInt(monthText, 10)
    const day = Number.parseInt(dayText, 10)

    if (yearOfEra < 1 || !isValidDate(era.baseYear + yearOfEra, month, day)) {
      return { ok: false, error: "和暦の日付として解釈できません。" }
    }

    return {
      era,
      yearOfEra,
      month,
      day,
    }
  }

  return { ok: false, error: "対応している和暦形式は 令和/平成/昭和/大正 または R/H/S/T です。" }
}

function toSuccess(parts: WarekiParts): WarekiConversionSuccess {
  const isoDate = buildIsoDate({
    year: parts.era.baseYear + parts.yearOfEra,
    month: parts.month,
    day: parts.day,
  })

  return {
    ok: true,
    isoDate,
    wareki: formatWarekiFromParts(parts),
    shortWareki: formatShortWareki(parts),
  }
}

export function convertGregorianToWareki(input: string): WarekiConversionResult {
  const parts = parseGregorianDate(input)

  if (!parts) {
    return { ok: false, error: "西暦は YYYY-MM-DD 形式で入力してください。" }
  }

  const isoDate = buildIsoDate(parts)
  const era = findEraByGregorianDate(isoDate)

  if (!era) {
    return { ok: false, error: "大正以降の和暦にのみ対応しています。" }
  }

  const yearOfEra = parts.year - era.baseYear

  return {
    ok: true,
    isoDate,
    wareki: formatWarekiFromParts({ era, yearOfEra, month: parts.month, day: parts.day }),
    shortWareki: formatShortWareki({ era, yearOfEra, month: parts.month, day: parts.day }),
  }
}

export function convertWarekiToGregorian(input: string): WarekiConversionResult {
  const parsed = parseWarekiInput(input)

  if ("ok" in parsed) {
    return parsed
  }

  const result = toSuccess(parsed)
  const matchingEra = findEraByGregorianDate(result.isoDate)

  if (!matchingEra || matchingEra.key !== parsed.era.key) {
    return { ok: false, error: "元号境界をまたぐため、その日付は指定した和暦では存在しません。" }
  }

  return result
}
