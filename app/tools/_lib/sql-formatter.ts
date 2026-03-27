const KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "CROSS JOIN",
  "JOIN",
  "ON",
  "UNION ALL",
  "UNION",
  "AND",
  "OR",
]

const KEYWORD_PATTERN = KEYWORDS
  .slice()
  .sort((a, b) => b.length - a.length)
  .map((keyword) => keyword.replace(/\s+/g, "\\s+"))
  .join("|")

export type SqlFormatterResult =
  | { ok: true; formatted: string; lineCount: number }
  | { ok: false; error: string }

function tokenizeSql(input: string): string[] {
  const tokens: string[] = []
  let current = ""
  let quote: "'" | "\"" | "`" | null = null

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]

    if (quote) {
      current += char
      if (char === quote && input[i - 1] !== "\\") {
        tokens.push(current)
        current = ""
        quote = null
      }
      continue
    }

    if (char === "'" || char === "\"" || char === "`") {
      if (current.trim()) {
        tokens.push(current.trim())
      }
      current = char
      quote = char
      continue
    }

    if (/\s/.test(char)) {
      if (current.trim()) {
        tokens.push(current.trim())
      }
      current = ""
      continue
    }

    if (char === "," || char === "(" || char === ")" || char === ";") {
      if (current.trim()) {
        tokens.push(current.trim())
      }
      tokens.push(char)
      current = ""
      continue
    }

    current += char
  }

  if (current.trim()) {
    tokens.push(current.trim())
  }

  return tokens
}

function combineKeywords(tokens: string[]): string[] {
  const combined: string[] = []

  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i]
    const next = tokens[i + 1]
    const upper = current.toUpperCase()
    const pair = next ? `${upper} ${next.toUpperCase()}` : upper

    if (KEYWORDS.includes(pair)) {
      combined.push(pair)
      i += 1
      continue
    }

    if (KEYWORDS.includes(upper)) {
      combined.push(upper)
      continue
    }

    combined.push(current)
  }

  return combined
}

function normalizeKeyword(token: string): string {
  if (/^['"`]/.test(token)) {
    return token
  }

  return token.replace(new RegExp(`^(?:${KEYWORD_PATTERN})$`, "i"), (match) => match.toUpperCase())
}

function indent(level: number): string {
  return "  ".repeat(Math.max(level, 0))
}

export function formatSql(input: string): SqlFormatterResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: "SQL を入力してください。" }
  }

  const tokens = combineKeywords(tokenizeSql(trimmed)).map(normalizeKeyword)
  const lines: string[] = []
  let currentLine = ""
  let depth = 0

  const flush = () => {
    const value = currentLine.trimEnd()
    if (value) {
      lines.push(value)
    }
    currentLine = ""
  }

  const push = (value: string) => {
    currentLine += value
  }

  for (const token of tokens) {
    if (token === ")") {
      flush()
      depth -= 1
      currentLine = `${indent(depth)})`
      continue
    }

    if (
      [
        "SELECT",
        "FROM",
        "WHERE",
        "GROUP BY",
        "ORDER BY",
        "HAVING",
        "LIMIT",
        "OFFSET",
        "INSERT INTO",
        "VALUES",
        "UPDATE",
        "SET",
        "DELETE FROM",
        "INNER JOIN",
        "LEFT JOIN",
        "RIGHT JOIN",
        "FULL JOIN",
        "CROSS JOIN",
        "JOIN",
        "ON",
        "UNION",
        "UNION ALL",
        "AND",
        "OR",
      ].includes(token)
    ) {
      flush()
      currentLine = `${indent(depth)}${token}`
      continue
    }

    if (token === "(") {
      push(" (")
      flush()
      depth += 1
      currentLine = indent(depth)
      continue
    }

    if (token === ",") {
      push(",")
      flush()
      currentLine = indent(depth + (lines.at(-1)?.trimStart().startsWith("SELECT") ? 1 : 0))
      continue
    }

    if (token === ";") {
      push(";")
      flush()
      continue
    }

    if (!currentLine) {
      currentLine = indent(depth)
    } else if (!currentLine.endsWith(" ") && !currentLine.endsWith("(")) {
      currentLine += " "
    }

    push(token)
  }

  flush()

  const formatted = lines.join("\n")
  return { ok: true, formatted, lineCount: lines.length }
}
