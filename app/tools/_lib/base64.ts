export type Base64Direction = "encode" | "decode"

export type Base64Success = {
  ok: true
  result: string
  inputByteSize: number
  outputByteSize: number
}

export type Base64Failure = {
  ok: false
  error: string
}

export type Base64Result = Base64Success | Base64Failure

function byteLength(str: string): number {
  return new TextEncoder().encode(str).length
}

function encodeToBase64(input: string): Base64Result {
  try {
    const bytes = new TextEncoder().encode(input)
    const binString = Array.from(bytes, (b) => String.fromCodePoint(b)).join("")
    const encoded = btoa(binString)

    return {
      ok: true,
      result: encoded,
      inputByteSize: bytes.length,
      outputByteSize: encoded.length,
    }
  } catch {
    return { ok: false, error: "エンコードに失敗しました。" }
  }
}

function decodeFromBase64(input: string): Base64Result {
  const trimmed = input.replace(/\s/g, "")

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmed)) {
    return { ok: false, error: "有効な Base64 文字列ではありません。使用できるのは A-Z, a-z, 0-9, +, /, = です。" }
  }

  try {
    const binString = atob(trimmed)
    const bytes = Uint8Array.from(binString, (c) => c.codePointAt(0)!)
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes)

    return {
      ok: true,
      result: decoded,
      inputByteSize: trimmed.length,
      outputByteSize: bytes.length,
    }
  } catch {
    return { ok: false, error: "Base64 のデコードに失敗しました。不正な文字列か、UTF-8 として解釈できないバイナリデータです。" }
  }
}

export function convertBase64(
  input: string,
  direction: Base64Direction,
): Base64Result {
  const trimmed = input.trim()

  if (!trimmed) {
    return { ok: false, error: direction === "encode" ? "エンコードするテキストを入力してください。" : "デコードする Base64 文字列を入力してください。" }
  }

  return direction === "encode" ? encodeToBase64(trimmed) : decodeFromBase64(trimmed)
}
