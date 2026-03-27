export type BusinessDaysSuccess = {
  ok: true
  businessDays: number
  totalDays: number
  weekendDays: number
  holidayDays: number
}

export type BusinessDaysFailure = {
  ok: false
  error: string
}

export type BusinessDaysResult = BusinessDaysSuccess | BusinessDaysFailure

function parseDate(input: string): Date | null {
  const match = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)))
  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(m) - 1 ||
    date.getUTCDate() !== Number(d)
  ) {
    return null
  }
  return date
}

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay()
  return day === 0 || day === 6
}

function toIsoDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, "0")
  const d = String(date.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function parseHolidayList(input: string): Set<string> {
  return new Set(
    input
      .split(/[\n,;]+/)
      .map((line) => line.trim())
      .filter((line) => /^\d{4}-\d{2}-\d{2}$/.test(line)),
  )
}

export function calculateBusinessDays(
  startInput: string,
  endInput: string,
  holidayListInput: string,
  excludeSaturday = true,
): BusinessDaysResult {
  const start = parseDate(startInput)
  const end = parseDate(endInput)

  if (!start) {
    return { ok: false, error: "開始日が不正です。YYYY-MM-DD 形式（ゼロ埋め）で入力してください。例: 2026-03-01" }
  }
  if (!end) {
    return { ok: false, error: "終了日が不正です。YYYY-MM-DD 形式（ゼロ埋め）で入力してください。例: 2026-03-31" }
  }
  if (start > end) {
    return { ok: false, error: "開始日は終了日以前にしてください。" }
  }

  const holidays = parseHolidayList(holidayListInput)
  let totalDays = 0
  let weekendDays = 0
  let holidayDays = 0

  const current = new Date(start)
  while (current <= end) {
    totalDays++
    const iso = toIsoDate(current)
    const dayOfWeek = current.getUTCDay()
    const isSunday = dayOfWeek === 0
    const isSaturday = dayOfWeek === 6

    if (isSunday || (excludeSaturday && isSaturday)) {
      weekendDays++
    } else if (holidays.has(iso)) {
      holidayDays++
    }

    current.setUTCDate(current.getUTCDate() + 1)
  }

  const businessDays = totalDays - weekendDays - holidayDays

  return {
    ok: true,
    businessDays,
    totalDays,
    weekendDays,
    holidayDays,
  }
}
