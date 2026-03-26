export type JavaCategory = {
  slug: string
  name: string
  articleCount: number
  summary: string
  priority: "high" | "medium" | "long_term"
}

export type JavaArticlePreview = {
  slug: string
  title: string
  categorySlug: string
  summary: string
  version: "Java 8" | "Java 17" | "Java 21"
  tags: string[]
  apiNames: string[]
  toolSlug?: string
}

export const JAVA_CATEGORIES: JavaCategory[] = [
  { slug: "dates", name: "日付・時刻", articleCount: 10, summary: "営業日、祝日、和暦、タイムゾーンなど、日本語圏の実務処理を優先する。", priority: "high" },
  { slug: "validation", name: "入力値バリデーション", articleCount: 2, summary: "数値、文字列、日付、業務ルールの検証を扱う。", priority: "high" },
  { slug: "db", name: "データベース", articleCount: 3, summary: "JDBC、プリペアドステートメント、トランザクションの基礎を押さえる。", priority: "high" },
  { slug: "fileio", name: "ファイルI/O", articleCount: 7, summary: "CSV、properties、NIO、JSON、XML など業務で触れる入出力をまとめる。", priority: "high" },
  { slug: "network", name: "ネットワーク", articleCount: 8, summary: "HTTP、TCP、UDP、SMTP、FTP まで Pure Java で仕組みを理解する。", priority: "high" },
  { slug: "strings", name: "文字列", articleCount: 5, summary: "null 安全、書式化、正規表現、全半角など文字列処理の定番を扱う。", priority: "medium" },
  { slug: "collections", name: "コレクション", articleCount: 3, summary: "List、Map、Set と Stream API の実務パターンをまとめる。", priority: "medium" },
  { slug: "functional", name: "関数型", articleCount: 3, summary: "関数型インターフェースと合成、Stream と組み合わせた書き方を扱う。", priority: "medium" },
  { slug: "enum", name: "Enum", articleCount: 5, summary: "列挙型の基本から実務コード設計まで扱う。", priority: "medium" },
  { slug: "records", name: "Record", articleCount: 4, summary: "Record と Sealed Classes を値オブジェクト設計の文脈で扱う。", priority: "medium" },
  { slug: "reflection", name: "リフレクション", articleCount: 2, summary: "クラス情報取得とカスタムアノテーション処理を扱う。", priority: "medium" },
  { slug: "serialization", name: "シリアライズ", articleCount: 4, summary: "標準シリアライズとリスク、Externalizable を整理する。", priority: "medium" },
  { slug: "encoding", name: "エンコーディング・圧縮", articleCount: 2, summary: "Base64 と ZIP/GZIP を中心に扱う。", priority: "medium" },
  { slug: "security", name: "セキュリティ", articleCount: 2, summary: "パスワードハッシュと AES-GCM を扱う。", priority: "medium" },
  { slug: "logging", name: "ロギング・例外処理", articleCount: 2, summary: "java.util.logging と例外チェーンの基本をまとめる。", priority: "medium" },
  { slug: "concurrency", name: "並行処理・メモリ", articleCount: 3, summary: "Atomic 操作、DB 採番、OOM の基本観点を扱う。", priority: "medium" },
  { slug: "threading", name: "マルチスレッド", articleCount: 8, summary: "Thread、Lock、Condition、デッドロック対策まで扱う。", priority: "medium" },
  { slug: "oop", name: "オブジェクト指向", articleCount: 3, summary: "interface / abstract class、SOLID、設計方針を扱う。", priority: "medium" },
  { slug: "patterns", name: "デザインパターン", articleCount: 23, summary: "GoF パターンを Java 標準ライブラリの文脈で整理する。", priority: "long_term" },
  { slug: "copying", name: "コピー", articleCount: 3, summary: "shallow / deep copy と落とし穴を整理する。", priority: "medium" },
  { slug: "misc", name: "その他", articleCount: 1, summary: "外部プロセス実行など単発テーマを置く。", priority: "long_term" },
  { slug: "testing", name: "テスト", articleCount: 1, summary: "JUnit 基本から将来のテスト連載への入口にする。", priority: "medium" },
  { slug: "gc", name: "GC", articleCount: 3, summary: "GC の基礎、JVM オプション、計測の入口を扱う。", priority: "long_term" },
  { slug: "httpserver", name: "HTTP サーバー自作", articleCount: 3, summary: "Socket ベースの最小 HTTP サーバー連載の受け皿。", priority: "long_term" },
  { slug: "perf", name: "パフォーマンス", articleCount: 2, summary: "処理時間とメモリ使用量の計測を扱う。", priority: "medium" },
]

export const PRIORITY_JAVA_TOPICS = [
  "営業日計算",
  "日本の祝日判定",
  "和暦・元号変換",
  "タイムゾーン処理",
  "消費税計算",
]

export const JAVA_ARTICLE_PREVIEWS: JavaArticlePreview[] = [
  {
    slug: "localdate-business-days",
    title: "LocalDate で営業日を数える実装",
    categorySlug: "dates",
    summary: "土日祝除外、締日スライド、業務ルールを LocalDate で扱う実装例。",
    version: "Java 17",
    tags: ["営業日", "LocalDate", "締日"],
    apiNames: ["LocalDate", "ChronoUnit.DAYS.between"],
    toolSlug: "business-days",
  },
  {
    slug: "japan-holiday-list",
    title: "日本の祝日一覧を扱いやすい日付リストに変換する",
    categorySlug: "dates",
    summary: "営業日ロジックへ流用しやすい yyyy-mm-dd 形式の出力を整える。",
    version: "Java 17",
    tags: ["祝日", "日付配列", "実務"],
    apiNames: ["LocalDate", "List<String>"],
    toolSlug: "japan-holidays",
  },
  {
    slug: "wareki-conversion",
    title: "和暦と西暦を相互変換し、元号境界を安全に扱う",
    categorySlug: "dates",
    summary: "令和・平成の境界日、略号、帳票入力を見据えた変換ロジック。",
    version: "Java 21",
    tags: ["和暦", "元号", "帳票"],
    apiNames: ["JapaneseDate", "DateTimeFormatter"],
    toolSlug: "wareki",
  },
  {
    slug: "timezone-conversion",
    title: "ZonedDateTime でタイムゾーン差をまとめて比較する",
    categorySlug: "dates",
    summary: "JST / UTC / EST の時差確認と、保存時刻のズレ防止を扱う。",
    version: "Java 21",
    tags: ["タイムゾーン", "UTC", "ZonedDateTime"],
    apiNames: ["ZonedDateTime", "ZoneId"],
    toolSlug: "timezone",
  },
  {
    slug: "stream-filter-map",
    title: "Stream.filter と map を業務コードで組み合わせる",
    categorySlug: "collections",
    summary: "DTO 変換や一覧絞り込みを読みやすく実装するパターン。",
    version: "Java 17",
    tags: ["Stream", "filter", "map"],
    apiNames: ["Stream.filter", "Stream.map"],
  },
  {
    slug: "tax-calculation",
    title: "BigDecimal で消費税計算の端数処理を揃える",
    categorySlug: "validation",
    summary: "税抜・税込の相互変換と、四捨五入 / 切り捨ての扱い。",
    version: "Java 17",
    tags: ["消費税", "BigDecimal", "端数処理"],
    apiNames: ["BigDecimal", "RoundingMode"],
    toolSlug: "tax-calculator",
  },
  {
    slug: "percentage-calculation",
    title: "割合・増減率・逆算を BigDecimal で実装する",
    categorySlug: "validation",
    summary: "売上比較や KPI 集計でよく使う割合計算の基礎をまとめる。",
    version: "Java 17",
    tags: ["割合", "増減率", "BigDecimal"],
    apiNames: ["BigDecimal", "MathContext"],
    toolSlug: "percentage-calculator",
  },
  {
    slug: "unit-conversion",
    title: "単位変換を基準単位経由で安全に実装する",
    categorySlug: "validation",
    summary: "長さ、重量、温度、速度を変換テーブルで扱う設計パターン。",
    version: "Java 17",
    tags: ["単位変換", "enum", "設計"],
    apiNames: ["enum", "Map<String, BigDecimal>"],
    toolSlug: "unit-converter",
  },
]

export const TOOL_ENHANCED_ARTICLE_SLUGS = new Set(
  JAVA_ARTICLE_PREVIEWS.filter((article) => article.toolSlug).map((article) => article.slug),
)
