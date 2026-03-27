export type JapanHolidaysSuccess = {
  ok: true
  holidays: Array<{ date: string; name: string }>
  count: number
}

export type JapanHolidaysFailure = {
  ok: false
  error: string
}

export type JapanHolidaysResult = JapanHolidaysSuccess | JapanHolidaysFailure

function springEquinoxDay(year: number): number {
  if (year <= 1947) return 21
  if (year <= 1979) return Math.floor(20.8357 + 0.242194 * (year - 1980) - Math.floor((year - 1983) / 4))
  if (year <= 2099) return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
  return 21
}

function autumnEquinoxDay(year: number): number {
  if (year <= 1947) return 23
  if (year <= 1979) return Math.floor(23.2588 + 0.242194 * (year - 1980) - Math.floor((year - 1983) / 4))
  if (year <= 2099) return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
  return 23
}

function nthWeekday(year: number, month: number, weekday: number, nth: number): number {
  const first = new Date(Date.UTC(year, month - 1, 1))
  let day = 1 + ((weekday - first.getUTCDay() + 7) % 7)
  day += (nth - 1) * 7
  return day
}

function dayOfWeek(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

function pad(n: number): string {
  return String(n).padStart(2, "0")
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

function getFixedHolidays(year: number): Array<{ date: string; name: string }> {
  const holidays: Array<{ date: string; name: string }> = []

  if (year >= 1949) holidays.push({ date: toIso(year, 1, 1), name: "元日" })
  if (year >= 2000) holidays.push({ date: toIso(year, 1, nthWeekday(year, 1, 1, 2)), name: "成人の日" })
  else if (year >= 1949) holidays.push({ date: toIso(year, 1, 15), name: "成人の日" })
  if (year >= 1967) holidays.push({ date: toIso(year, 2, 11), name: "建国記念の日" })
  if (year >= 2020) holidays.push({ date: toIso(year, 2, 23), name: "天皇誕生日" })
  else if (year >= 1989 && year <= 2018) holidays.push({ date: toIso(year, 12, 23), name: "天皇誕生日" })
  holidays.push({ date: toIso(year, 3, springEquinoxDay(year)), name: "春分の日" })
  if (year >= 1949) holidays.push({ date: toIso(year, 4, 29), name: year >= 2007 ? "昭和の日" : year >= 1989 ? "みどりの日" : "天皇誕生日" })
  if (year >= 1949) holidays.push({ date: toIso(year, 5, 3), name: "憲法記念日" })
  if (year >= 2007) holidays.push({ date: toIso(year, 5, 4), name: "みどりの日" })
  if (year >= 1949) holidays.push({ date: toIso(year, 5, 5), name: "こどもの日" })
  if (year >= 2003) holidays.push({ date: toIso(year, 7, nthWeekday(year, 7, 1, 3)), name: "海の日" })
  else if (year >= 1996) holidays.push({ date: toIso(year, 7, 20), name: "海の日" })
  if (year >= 2016) holidays.push({ date: toIso(year, 8, 11), name: "山の日" })
  if (year >= 2003) holidays.push({ date: toIso(year, 9, nthWeekday(year, 9, 1, 3)), name: "敬老の日" })
  else if (year >= 1966) holidays.push({ date: toIso(year, 9, 15), name: "敬老の日" })
  holidays.push({ date: toIso(year, 9, autumnEquinoxDay(year)), name: "秋分の日" })
  if (year >= 2000) holidays.push({ date: toIso(year, 10, nthWeekday(year, 10, 1, 2)), name: "スポーツの日" })
  else if (year >= 1966) holidays.push({ date: toIso(year, 10, 10), name: "体育の日" })
  if (year >= 1948) holidays.push({ date: toIso(year, 11, 3), name: "文化の日" })
  if (year >= 1948) holidays.push({ date: toIso(year, 11, 23), name: "勤労感謝の日" })

  return holidays
}

function addSubstituteHolidays(holidays: Array<{ date: string; name: string }>): Array<{ date: string; name: string }> {
  const dateSet = new Set(holidays.map((h) => h.date))
  const result = [...holidays]

  for (const holiday of holidays) {
    const [y, m, d] = holiday.date.split("-").map(Number)
    if (dayOfWeek(y, m, d) === 0) {
      let candidate = new Date(Date.UTC(y, m - 1, d + 1))
      while (dateSet.has(toIso(candidate.getUTCFullYear(), candidate.getUTCMonth() + 1, candidate.getUTCDate()))) {
        candidate.setUTCDate(candidate.getUTCDate() + 1)
      }
      const iso = toIso(candidate.getUTCFullYear(), candidate.getUTCMonth() + 1, candidate.getUTCDate())
      dateSet.add(iso)
      result.push({ date: iso, name: "振替休日" })
    }
  }

  return result
}

export function getJapanHolidays(yearInput: string): JapanHolidaysResult {
  const year = Number(yearInput)
  if (!Number.isInteger(year) || year < 1948 || year > 2100) {
    return { ok: false, error: "年は 1948〜2100 の整数で入力してください。" }
  }

  const fixed = getFixedHolidays(year)
  const withSubstitutes = addSubstituteHolidays(fixed)
  const sorted = withSubstitutes.sort((a, b) => a.date.localeCompare(b.date))

  return {
    ok: true,
    holidays: sorted,
    count: sorted.length,
  }
}
