import type { BookRecommendation } from "./types"

const TAG = "craft-dev-22"
const url = (asin: string) => `https://www.amazon.co.jp/dp/${asin}?tag=${TAG}`

const effectiveJava: BookRecommendation = {
  title: "Effective Java 第3版",
  author: "Joshua Bloch 著 / 柴田芳樹 訳",
  amazonUrl: url("4621303252"),
  comment: "Java 開発者必携。API 設計、列挙型、ラムダ、ストリームなど現場で判断に迷う場面の指針が揃う。",
}

const designPatterns: BookRecommendation = {
  title: "Java言語で学ぶデザインパターン入門 第3版",
  author: "結城浩",
  amazonUrl: url("4815609802"),
  comment: "GoF 23 パターンを Java コードで丁寧に解説。パターンの「なぜそうするか」が腹落ちする。",
}

const javaConcurrency: BookRecommendation = {
  title: "Java並行処理プログラミング",
  author: "Brian Goetz ほか著 / 岩谷宏 訳",
  amazonUrl: url("4797337206"),
  comment: "スレッド安全性、ロック、Executor の設計原則を体系的に学べる並行処理のバイブル。",
}

const javaPerformance: BookRecommendation = {
  title: "Javaパフォーマンス",
  author: "Scott Oaks 著 / 牧野聡 ほか訳",
  amazonUrl: url("4873119871"),
  comment: "GC チューニング、JIT、メモリ管理を実測ベースで解説。パフォーマンス改善の実務に直結する。",
}

const readableCode: BookRecommendation = {
  title: "リーダブルコード",
  author: "Dustin Boswell, Trevor Foucher 著 / 角征典 訳",
  amazonUrl: url("4873115655"),
  comment: "命名、コメント、制御フローの改善ポイントを具体例で示す。日常のコードレビューに役立つ。",
}

const refactoring: BookRecommendation = {
  title: "リファクタリング 第2版",
  author: "Martin Fowler 著 / 児玉公信 ほか訳",
  amazonUrl: url("4274224546"),
  comment: "コードの「嫌な臭い」を特定し段階的に改善する技法集。設計判断の語彙が身につく。",
}

const junitIntro: BookRecommendation = {
  title: "JUnit実践入門",
  author: "渡辺修司",
  amazonUrl: url("477415377X"),
  comment: "JUnit の基本からテスト設計のパターンまで実践的に解説。テストを書く習慣づけに最適。",
}

const sqlAntipatterns: BookRecommendation = {
  title: "SQLアンチパターン",
  author: "Bill Karwin 著 / 和田卓人 監訳",
  amazonUrl: url("4873115892"),
  comment: "やりがちな DB 設計・クエリの失敗パターンとその対策を体系的にまとめた一冊。",
}

const robustJava: BookRecommendation = {
  title: "プログラミング言語Java 第4版",
  author: "Ken Arnold, James Gosling ほか著",
  amazonUrl: url("4894717166"),
  comment: "Java 言語仕様を設計者自ら解説したリファレンス。基本機能の「なぜこうなっているか」が分かる。",
}

const networkTcpIp: BookRecommendation = {
  title: "マスタリングTCP/IP 入門編 第6版",
  author: "井上直也 ほか",
  amazonUrl: url("4274224473"),
  comment: "TCP/IP の基礎からアプリケーション層まで体系的に理解できる。ネットワークプログラミングの前提知識に。",
}

/** カテゴリ slug → おすすめ書籍 */
const CATEGORY_BOOKS: Record<string, BookRecommendation[]> = {
  dates:         [effectiveJava, readableCode],
  validation:    [effectiveJava, readableCode],
  db:            [sqlAntipatterns, effectiveJava],
  fileio:        [effectiveJava, robustJava],
  network:       [networkTcpIp, effectiveJava],
  strings:       [effectiveJava, readableCode],
  collections:   [effectiveJava, refactoring],
  functional:    [effectiveJava, refactoring],
  enum:          [effectiveJava, designPatterns],
  records:       [effectiveJava, robustJava],
  reflection:    [effectiveJava, robustJava],
  serialization: [effectiveJava, robustJava],
  encoding:      [effectiveJava, robustJava],
  security:      [effectiveJava, robustJava],
  logging:       [effectiveJava, readableCode],
  concurrency:   [javaConcurrency, effectiveJava],
  threading:     [javaConcurrency, effectiveJava],
  oop:           [effectiveJava, refactoring],
  patterns:      [designPatterns, refactoring],
  copying:       [effectiveJava, refactoring],
  misc:          [effectiveJava, readableCode],
  testing:       [junitIntro, effectiveJava],
  gc:            [javaPerformance, effectiveJava],
  httpserver:    [networkTcpIp, effectiveJava],
  perf:          [javaPerformance, effectiveJava],
  batch:         [effectiveJava, readableCode],
}

/** カテゴリ slug からおすすめ書籍を取得 */
export function getBooksByCategory(categorySlug: string): BookRecommendation[] {
  return CATEGORY_BOOKS[categorySlug] ?? []
}
