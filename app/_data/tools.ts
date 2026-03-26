export type ToolPriority = "priority" | "supporting" | "conditional" | "deferred"

export type ToolDefinition = {
  slug: string
  name: string
  priority: ToolPriority
  summary: string
  category: string
}

export const TOOLS: ToolDefinition[] = [
  { slug: "business-days", name: "営業日計算", priority: "priority", category: "calc", summary: "開始日、終了日、土曜除外、祝日リストから営業日数を計算する。" },
  { slug: "japan-holidays", name: "日本の祝日計算", priority: "priority", category: "calc", summary: "指定年の祝日一覧を計算し、営業日計算へ流用しやすい日付リストを出力する。" },
  { slug: "wareki", name: "西暦・和暦変換", priority: "priority", category: "convert", summary: "西暦と和暦を相互変換し、元号境界と英字略号を扱う。" },
  { slug: "timezone", name: "タイムゾーン変換", priority: "priority", category: "convert", summary: "入力日時を複数タイムゾーンへ一括変換する。" },
  { slug: "tax-calculator", name: "消費税計算", priority: "priority", category: "calc", summary: "税抜・税込の相互計算、10% / 8% 税率、端数処理を扱う。" },
  { slug: "percentage-calculator", name: "割合・パーセント計算", priority: "priority", category: "calc", summary: "割合、増減率、逆算など 4 パターンの計算を扱う。" },
  { slug: "unit-converter", name: "単位変換", priority: "priority", category: "calc", summary: "長さ、重量、温度、速度、面積を基準単位経由で変換する。" },
  { slug: "json-formatter", name: "JSONフォーマッター", priority: "supporting", category: "format", summary: "整形、圧縮、構文チェック。" },
  { slug: "base64", name: "Base64変換", priority: "supporting", category: "encode", summary: "UTF-8 テキストのエンコード / デコード。" },
  { slug: "regex-tester", name: "正規表現テスター", priority: "supporting", category: "text", summary: "リアルタイムのマッチ確認とキャプチャ確認。" },
  { slug: "sql-formatter", name: "SQLフォーマッター", priority: "supporting", category: "format", summary: "SQL の整形と読みやすさ改善。" },
  { slug: "csv-json", name: "CSV ↔ JSON 変換", priority: "supporting", category: "convert", summary: "CSV と JSON の相互変換。" },
  { slug: "json-to-ts", name: "JSON → TypeScript型生成", priority: "supporting", category: "convert", summary: "JSON 入力から TypeScript 型の叩き台を生成する。" },
  { slug: "uuid-generator", name: "UUID生成", priority: "conditional", category: "generate", summary: "一括生成とコピーに対応した UUIDv4 生成。" },
  { slug: "url-encode", name: "URLエンコード", priority: "conditional", category: "encode", summary: "パーセントエンコーディング変換。" },
  { slug: "html-escape", name: "HTMLエスケープ", priority: "conditional", category: "encode", summary: "HTML 特殊文字のエスケープとアンエスケープ。" },
  { slug: "hash", name: "ハッシュ生成", priority: "conditional", category: "generate", summary: "SHA 系ハッシュの生成。" },
  { slug: "cron-parser", name: "cron式パーサー", priority: "conditional", category: "calc", summary: "cron 式の解釈補助。" },
  { slug: "password-generator", name: "パスワード生成", priority: "conditional", category: "generate", summary: "文字種を指定したランダム文字列生成。" },
  { slug: "password-strength", name: "パスワード強度チェック", priority: "conditional", category: "calc", summary: "強度の目安をブラウザ内で判定する。" },
  { slug: "number-base", name: "進数変換", priority: "conditional", category: "convert", summary: "2進、8進、10進、16進の相互変換。" },
  { slug: "bitwise-calculator", name: "ビット演算計算機", priority: "conditional", category: "calc", summary: "AND / OR / XOR / shift の確認。" },
  { slug: "semver", name: "Semantic Version 比較", priority: "conditional", category: "calc", summary: "semver の比較と差分確認。" },
  { slug: "git-commit-builder", name: "Gitコミットメッセージ生成", priority: "deferred", category: "generate", summary: "旧サイト由来。優先度は低い。" },
  { slug: "gitignore-generator", name: ".gitignore生成", priority: "deferred", category: "generate", summary: "旧サイト由来。優先度は低い。" },
  { slug: "qr-generator", name: "QRコード生成", priority: "deferred", category: "generate", summary: "旧サイト由来。優先度は低い。" },
  { slug: "ogp-preview", name: "OGPメタタグ プレビュー", priority: "deferred", category: "ref", summary: "旧サイト由来。優先度は低い。" },
  { slug: "http-status", name: "HTTPステータスコード一覧", priority: "deferred", category: "ref", summary: "旧サイト由来。優先度は低い。" },
  { slug: "port-numbers", name: "ポート番号一覧", priority: "deferred", category: "ref", summary: "旧サイト由来。優先度は低い。" },
  { slug: "csp-generator", name: "CSPジェネレーター", priority: "deferred", category: "generate", summary: "旧サイト由来。優先度は低い。" },
  { slug: "html-to-jsx", name: "HTML ↔ JSX 変換", priority: "deferred", category: "convert", summary: "旧サイト由来。優先度は低い。" },
]

export const PRIORITY_TOOLS = TOOLS.filter((tool) => tool.priority === "priority")
