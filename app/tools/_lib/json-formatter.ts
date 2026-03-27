export type JsonFormatMode = "pretty" | "compact"

export type JsonFormatterSuccess = {
  ok: true
  formatted: string
  lineCount: number
  byteSize: number
}

export type JsonFormatterFailure = {
  ok: false
  error: string
  position?: number
}

export type JsonFormatterResult = JsonFormatterSuccess | JsonFormatterFailure

function byteLength(str: string): number {
  return new TextEncoder().encode(str).length
}

export function formatJson(
  input: string,
  mode: JsonFormatMode = "pretty",
  indent: number = 2,
): JsonFormatterResult {
  const trimmed = input.trim()

  if (!trimmed) {
    return { ok: false, error: "JSON 文字列を入力してください。" }
  }

  try {
    const parsed = JSON.parse(trimmed)
    const formatted =
      mode === "pretty"
        ? JSON.stringify(parsed, null, indent)
        : JSON.stringify(parsed)

    return {
      ok: true,
      formatted,
      lineCount: formatted.split("\n").length,
      byteSize: byteLength(formatted),
    }
  } catch (e) {
    const message = e instanceof SyntaxError ? e.message : "JSON の解析に失敗しました。"
    const posMatch = message.match(/position\s+(\d+)/i)
    const position = posMatch ? Number(posMatch[1]) : undefined

    return {
      ok: false,
      error: `構文エラー: ${message}`,
      position,
    }
  }
}
