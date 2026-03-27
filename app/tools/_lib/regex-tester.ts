export type RegexMatch = {
  index: number
  text: string
  groups: string[]
}

export type RegexTesterSuccess = {
  ok: true
  matches: RegexMatch[]
  matchCount: number
}

export type RegexTesterFailure = {
  ok: false
  error: string
}

export type RegexTesterResult = RegexTesterSuccess | RegexTesterFailure

export type RegexFlags = {
  global: boolean
  caseInsensitive: boolean
  multiline: boolean
  dotAll: boolean
}

const DEFAULT_FLAGS: RegexFlags = {
  global: true,
  caseInsensitive: false,
  multiline: false,
  dotAll: false,
}

function buildFlagString(flags: RegexFlags): string {
  let result = ""
  if (flags.global) result += "g"
  if (flags.caseInsensitive) result += "i"
  if (flags.multiline) result += "m"
  if (flags.dotAll) result += "s"
  return result
}

export function testRegex(
  pattern: string,
  testString: string,
  flags: RegexFlags = DEFAULT_FLAGS,
): RegexTesterResult {
  if (!pattern) {
    return { ok: false, error: "正規表現パターンを入力してください。" }
  }

  if (!testString) {
    return { ok: false, error: "テスト文字列を入力してください。" }
  }

  let regex: RegExp
  try {
    regex = new RegExp(pattern, buildFlagString(flags))
  } catch (e) {
    const message = e instanceof SyntaxError ? e.message : "正規表現の構文エラーです。"
    return { ok: false, error: `パターンエラー: ${message}` }
  }

  const matches: RegexMatch[] = []

  if (flags.global) {
    let match: RegExpExecArray | null
    let safety = 0
    while ((match = regex.exec(testString)) !== null && safety < 1000) {
      matches.push({
        index: match.index,
        text: match[0],
        groups: match.slice(1),
      })
      if (match[0].length === 0) {
        regex.lastIndex++
      }
      safety++
    }
  } else {
    const match = regex.exec(testString)
    if (match) {
      matches.push({
        index: match.index,
        text: match[0],
        groups: match.slice(1),
      })
    }
  }

  return {
    ok: true,
    matches,
    matchCount: matches.length,
  }
}
