export type CsvJsonSuccess = {
  ok: true
  result: string
}

export type CsvJsonFailure = {
  ok: false
  error: string
}

export type CsvJsonResult = CsvJsonSuccess | CsvJsonFailure

export type CsvDelimiter = "," | "\t"

function parseCsvRows(input: string, delimiter: CsvDelimiter): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let value = ""
  let inQuotes = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    const next = input[i + 1]

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        value += "\""
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === delimiter) {
      row.push(value)
      value = ""
      continue
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        i += 1
      }
      row.push(value)
      rows.push(row)
      row = []
      value = ""
      continue
    }

    value += char
  }

  row.push(value)
  if (!(row.length === 1 && row[0] === "" && rows.length > 0)) {
    rows.push(row)
  }

  return rows
}

function escapeCsvCell(value: unknown, delimiter: CsvDelimiter): string {
  const text = typeof value === "string" ? value : JSON.stringify(value)
  if (text == null) {
    return ""
  }

  if (text.includes("\"") || text.includes("\n") || text.includes("\r") || text.includes(delimiter)) {
    return `"${text.replaceAll("\"", "\"\"")}"`
  }

  return text
}

export function csvToJson(input: string, delimiter: CsvDelimiter = ","): CsvJsonResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: "CSV を入力してください。" }
  }

  const rows = parseCsvRows(trimmed, delimiter)
  if (rows.length < 2) {
    return { ok: false, error: "ヘッダー行と1件以上のデータ行が必要です。" }
  }

  const headers = rows[0]
  if (headers.some((header) => !header.trim())) {
    return { ok: false, error: "ヘッダー行に空の列名があります。" }
  }

  const data = rows.slice(1).filter((row) => row.some((cell) => cell.length > 0))
  const objects = data.map((row) => {
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = row[index] ?? ""
    })
    return record
  })

  return {
    ok: true,
    result: JSON.stringify(objects, null, 2),
  }
}

export function jsonToCsv(input: string, delimiter: CsvDelimiter = ","): CsvJsonResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: "JSON を入力してください。" }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch (error) {
    return { ok: false, error: error instanceof Error ? `JSON の解析に失敗しました: ${error.message}` : "JSON の解析に失敗しました。" }
  }

  const items = Array.isArray(parsed) ? parsed : [parsed]
  if (items.length === 0) {
    return { ok: false, error: "1件以上のオブジェクトを含む JSON を入力してください。" }
  }

  if (!items.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
    return { ok: false, error: "JSON → CSV はオブジェクト配列に対応しています。" }
  }

  const records = items as Record<string, unknown>[]
  const headers = Array.from(new Set(records.flatMap((record) => Object.keys(record))))
  const lines = [
    headers.join(delimiter),
    ...records.map((record) =>
      headers.map((header) => escapeCsvCell(record[header] ?? "", delimiter)).join(delimiter),
    ),
  ]

  return {
    ok: true,
    result: lines.join("\n"),
  }
}
