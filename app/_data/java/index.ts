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
  return getJavaArticlesByCategory(categorySlug).length
}
