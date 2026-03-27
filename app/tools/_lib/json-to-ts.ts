export type JsonToTsResult =
  | { ok: true; result: string }
  | { ok: false; error: string }

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function indent(level: number): string {
  return "  ".repeat(level)
}

function inferType(value: unknown, depth: number): string {
  if (value === null) {
    return "null"
  }

  switch (typeof value) {
    case "string":
      return "string"
    case "number":
      return "number"
    case "boolean":
      return "boolean"
    case "object":
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return "unknown[]"
        }

        const elementTypes = unique(value.map((item) => inferType(item, depth + 1))).sort()
        const arrayType = elementTypes.length === 1 ? elementTypes[0] : `(${elementTypes.join(" | ")})`
        return `${arrayType}[]`
      }

      return formatObjectType(value as Record<string, unknown>, depth)
    default:
      return "unknown"
  }
}

function formatObjectType(value: Record<string, unknown>, depth: number): string {
  const entries = Object.entries(value)
  if (entries.length === 0) {
    return "Record<string, never>"
  }

  const body = entries
    .map(([key, fieldValue]) => `${indent(depth + 1)}${safePropertyName(key)}: ${inferType(fieldValue, depth + 1)}`)
    .join("\n")

  return `{\n${body}\n${indent(depth)}}`
}

function safePropertyName(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key)
}

export function jsonToTypeScript(input: string, rootName: string = "Root"): JsonToTsResult {
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

  const typeName = /^[A-Za-z_][A-Za-z0-9_]*$/.test(rootName) ? rootName : "Root"
  return {
    ok: true,
    result: `type ${typeName} = ${inferType(parsed, 0)}`,
  }
}
