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
 * 公開記事リスト。ここに含まれない記事は noindex になり、一覧・サイトマップ・検索から除外される。
 * 現在は全記事を公開している（2026-07 に全公開へ切り替え）。
 * 記事を絞り込む必要が生じた場合は、ここで対象 slug を列挙する形に戻す。
 */
const PUBLISHED_SLUGS = new Set(JAVA_ARTICLES.map((article) => article.slug))

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
