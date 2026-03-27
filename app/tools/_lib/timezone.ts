type TimezoneDefinition = {
  id: string
  label: string
  offsetMinutes: number
}

type ConvertedTime = {
  timezone: string
  label: string
  datetime: string
  date: string
  time: string
  offsetLabel: string
}

export type TimezoneConversionSuccess = {
  ok: true
  sourceTimezone: string
  sourceDateTime: string
  conversions: ConvertedTime[]
}

export type TimezoneConversionFailure = {
  ok: false
  error: string
}

export type TimezoneConversionResult = TimezoneConversionSuccess | TimezoneConversionFailure

const TIMEZONES: TimezoneDefinition[] = [
  { id: "UTC", label: "UTC (協定世界時)", offsetMinutes: 0 },
  { id: "JST", label: "JST (日本標準時)", offsetMinutes: 540 },
  { id: "CST", label: "CST (中国標準時)", offsetMinutes: 480 },
  { id: "IST", label: "IST (インド標準時)", offsetMinutes: 330 },
  { id: "CET", label: "CET (中央ヨーロッパ時間)", offsetMinutes: 60 },
  { id: "EST", label: "EST (米国東部標準時)", offsetMinutes: -300 },
  { id: "PST", label: "PST (米国太平洋標準時)", offsetMinutes: -480 },
  { id: "AEST", label: "AEST (オーストラリア東部標準時)", offsetMinutes: 600 },
]

function pad(value: number): string {
  return value.toString().padStart(2, "0")
}

function formatOffsetLabel(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const absMinutes = Math.abs(offsetMinutes)
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60
  return `UTC${sign}${pad(hours)}:${pad(minutes)}`
}

function parseDateTimeInput(input: string): { year: number; month: number; day: number; hour: number; minute: number } | null {
  const normalized = input.trim()

  const matchFull = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{2})$/)
  if (matchFull) {
    const [, y, mo, d, h, mi] = matchFull
    return {
      year: Number.parseInt(y, 10),
      month: Number.parseInt(mo, 10),
      day: Number.parseInt(d, 10),
      hour: Number.parseInt(h, 10),
      minute: Number.parseInt(mi, 10),
    }
  }

  const matchDateOnly = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (matchDateOnly) {
    const [, y, mo, d] = matchDateOnly
    return {
      year: Number.parseInt(y, 10),
      month: Number.parseInt(mo, 10),
      day: Number.parseInt(d, 10),
      hour: 0,
      minute: 0,
    }
  }

  return null
}

function isValidDateTime(year: number, month: number, day: number, hour: number, minute: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return false
  }
  const candidate = new Date(Date.UTC(year, month - 1, day))
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  )
}

function findTimezone(id: string): TimezoneDefinition | undefined {
  return TIMEZONES.find((tz) => tz.id === id)
}

function toUtcMinutes(year: number, month: number, day: number, hour: number, minute: number, sourceOffsetMinutes: number): number {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute))
  return date.getTime() / 60000 - sourceOffsetMinutes
}

function fromUtcMinutes(utcMinutes: number, targetOffsetMinutes: number): { year: number; month: number; day: number; hour: number; minute: number } {
  const targetMs = (utcMinutes + targetOffsetMinutes) * 60000
  const date = new Date(targetMs)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  }
}

function formatDateTime(parts: { year: number; month: number; day: number; hour: number; minute: number }): string {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}`
}

function formatDate(parts: { year: number; month: number; day: number }): string {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

function formatTime(parts: { hour: number; minute: number }): string {
  return `${pad(parts.hour)}:${pad(parts.minute)}`
}

export function getTimezoneIds(): string[] {
  return TIMEZONES.map((tz) => tz.id)
}

export function convertTimezone(dateTimeInput: string, sourceTimezoneId: string): TimezoneConversionResult {
  if (!dateTimeInput.trim()) {
    return { ok: false, error: "日時を入力してください。" }
  }

  const sourceTz = findTimezone(sourceTimezoneId)
  if (!sourceTz) {
    return { ok: false, error: `未対応のタイムゾーンです: ${sourceTimezoneId}` }
  }

  const parsed = parseDateTimeInput(dateTimeInput)
  if (!parsed) {
    return { ok: false, error: "日時は YYYY-MM-DD HH:mm または YYYY-MM-DD 形式で入力してください。" }
  }

  const { year, month, day, hour, minute } = parsed
  if (!isValidDateTime(year, month, day, hour, minute)) {
    return { ok: false, error: "存在しない日時です。日付と時刻を確認してください。" }
  }

  const utcMinutes = toUtcMinutes(year, month, day, hour, minute, sourceTz.offsetMinutes)

  const conversions: ConvertedTime[] = TIMEZONES.map((tz) => {
    const converted = fromUtcMinutes(utcMinutes, tz.offsetMinutes)
    return {
      timezone: tz.id,
      label: tz.label,
      datetime: formatDateTime(converted),
      date: formatDate(converted),
      time: formatTime(converted),
      offsetLabel: formatOffsetLabel(tz.offsetMinutes),
    }
  })

  return {
    ok: true,
    sourceTimezone: sourceTz.id,
    sourceDateTime: formatDateTime({ year, month, day, hour, minute }),
    conversions,
  }
}
