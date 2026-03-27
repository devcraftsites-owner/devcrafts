import { JAVA_ARTICLE_PREVIEWS, JAVA_CATEGORIES, PRIORITY_JAVA_TOPICS, getJavaArticleHref, getJavaCategoryHref } from "./java"
import { PRIORITY_TOOLS, getToolHref } from "./tools"

export type SearchEntryType = "article" | "tool" | "tag" | "api"

export type SearchEntry = {
  label: string
  type: SearchEntryType
  href: string
  keywords: string[]
  tryAvailable?: boolean
}

const articleEntries: SearchEntry[] = JAVA_ARTICLE_PREVIEWS.flatMap((article) => [
  {
    label: article.title,
    type: "article",
    href: getJavaArticleHref(article),
    keywords: [article.title, article.summary, article.version, ...article.tags, ...article.apiNames],
    tryAvailable: Boolean(article.toolSlug),
  },
  ...article.tags.map((tag) => ({
    label: tag,
    type: "tag" as const,
    href: getJavaCategoryHref(article.categorySlug),
    keywords: [tag, article.title],
  })),
  ...article.apiNames.map((apiName) => ({
    label: apiName,
    type: "api" as const,
    href: getJavaArticleHref(article),
    keywords: [apiName, article.title],
  })),
])

const topicEntries: SearchEntry[] = PRIORITY_JAVA_TOPICS.map((topic) => ({
  label: topic,
  type: "tag",
  href: "/java",
  keywords: [topic, "注目テーマ"],
}))

const toolEntries: SearchEntry[] = PRIORITY_TOOLS.map((tool) => ({
  label: tool.name,
  type: "tool",
  href: getToolHref(tool.slug),
  keywords: [tool.name, tool.summary, tool.slug, ...(tool.keywords ?? [])],
}))

const categoryEntries: SearchEntry[] = JAVA_CATEGORIES.map((category) => ({
  label: category.name,
  type: "tag",
  href: getJavaCategoryHref(category.slug),
  keywords: [category.name, category.summary, category.slug],
}))

export const SEARCH_INDEX: SearchEntry[] = [...articleEntries, ...topicEntries, ...toolEntries, ...categoryEntries]

function getSearchEntryKey(entry: SearchEntry) {
  return `${entry.type}:${entry.label}:${entry.href}`
}

function normalize(value: string) {
  return value.toLowerCase().trim()
}

export function getSearchSuggestions(query: string, limit = 8) {
  const normalized = normalize(query)

  if (normalized.length < 2) {
    return []
  }

  const seen = new Set<string>()

  return SEARCH_INDEX.filter((entry) => {
    const haystack = [entry.label, ...entry.keywords].join(" ").toLowerCase()
    return haystack.includes(normalized)
  })
    .filter((entry) => {
      const key = getSearchEntryKey(entry)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
    .slice(0, limit)
}
