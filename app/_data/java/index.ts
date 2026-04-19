// Types
export type {
  JavaPriority,
  JavaVersionLabel,
  JavaCategory,
  JavaArticlePreview,
  JavaArticleFaqItem,
  JavaLibraryAlternative,
  JavaArticleVersionCoverage,
  JavaArticleDetail,
} from "./types"

// Data
export { JAVA_CATEGORIES, PRIORITY_JAVA_TOPICS } from "./categories"
export { JAVA_ARTICLES } from "./articles/index"

// Derived
import type { JavaArticlePreview } from "./types"
import { JAVA_CATEGORIES } from "./categories"
import { JAVA_ARTICLES } from "./articles/index"

/**
 * AdSense 再審査向け公開記事リスト。
 * ここに含まれない記事は noindex になり、一覧・サイトマップ・検索から除外される。
 * 審査通過後、品質改善した記事から順に追加していく。
 */
const PUBLISHED_SLUGS = new Set([
  // --- ツール連携記事 (7) ---
  "localdate-business-days",
  "japan-holiday-list",
  "wareki-conversion",
  "timezone-conversion",
  "tax-calculation",
  "percentage-calculation",
  "unit-conversion",
  // --- カテゴリ代表記事 (21) ---
  "singleton-pattern",
  "builder-pattern",
  "regex-basics",
  "null-safe-string",
  "stream-filter-map",
  "csv-read-write",
  "json-parsing",
  "zengin-format",
  "zengin-edi-zedi",
  "zengin-charset",
  "thread-basics",
  "executor-service",
  "virtual-threads",
  "base64-encoding",
  "password-hashing",
  "junit5-basics",
  "jdbc-basics",
  "http-client-basic",
  "batch-basic-structure",
  "exception-chain",
  "enum-basics",
  "jvm-options",
  "jvm-options-version-diff",
])

export function isPublishedArticle(slug: string): boolean {
  return PUBLISHED_SLUGS.has(slug)
}

export const JAVA_ARTICLE_PREVIEWS: JavaArticlePreview[] = JAVA_ARTICLES.map(
  ({ slug, title, categorySlug, summary, version, tags, apiNames, toolSlug }) => ({
    slug,
    title,
    categorySlug,
    summary,
    version,
    tags,
    apiNames,
    toolSlug,
  }),
)

/** 公開記事のみのプレビュー（一覧ページ・トップページ用） */
export const PUBLISHED_ARTICLE_PREVIEWS: JavaArticlePreview[] =
  JAVA_ARTICLE_PREVIEWS.filter((a) => PUBLISHED_SLUGS.has(a.slug))

export const TOOL_ENHANCED_ARTICLE_SLUGS = new Set(
  JAVA_ARTICLE_PREVIEWS.filter((article) => article.toolSlug).map((article) => article.slug),
)

export function getJavaCategories() {
  return JAVA_CATEGORIES
}

export function getJavaCategory(slug: string) {
  return JAVA_CATEGORIES.find((category) => category.slug === slug)
}

export function getJavaArticlesByCategory(categorySlug: string) {
  return JAVA_ARTICLES.filter((article) => article.categorySlug === categorySlug)
}

export function getJavaArticle(categorySlug: string, articleSlug: string) {
  return JAVA_ARTICLES.find((article) => article.categorySlug === categorySlug && article.slug === articleSlug)
}

export function getJavaArticleBySlug(articleSlug: string) {
  return JAVA_ARTICLES.find((article) => article.slug === articleSlug)
}

export function getJavaCategoryHref(categorySlug: string) {
  return `/java/${categorySlug}`
}

export function getJavaArticleHref(article: Pick<JavaArticlePreview, "categorySlug" | "slug">) {
  return `${getJavaCategoryHref(article.categorySlug)}/${article.slug}`
}

export function getPublishedArticleCount(categorySlug: string) {
  return getJavaArticlesByCategory(categorySlug).filter((a) => PUBLISHED_SLUGS.has(a.slug)).length
}
