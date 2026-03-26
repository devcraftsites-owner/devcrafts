import { JAVA_ARTICLE_PREVIEWS, JAVA_CATEGORIES, PRIORITY_JAVA_TOPICS } from "./java"
import { PRIORITY_TOOLS } from "./tools"

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
    href: article.toolSlug ? "/java/tool-enhanced-preview" : "/java/standard-preview",
    keywords: [article.title, article.summary, article.version, ...article.tags, ...article.apiNames],
    tryAvailable: Boolean(article.toolSlug),
  },
  ...article.tags.map((tag) => ({
    label: tag,
    type: "tag" as const,
    href: "/java",
    keywords: [tag, article.title],
  })),
  ...article.apiNames.map((apiName) => ({
    label: apiName,
    type: "api" as const,
    href: article.toolSlug ? "/java/tool-enhanced-preview" : "/java/standard-preview",
    keywords: [apiName, article.title],
  })),
])

const topicEntries: SearchEntry[] = PRIORITY_JAVA_TOPICS.map((topic) => ({
  label: topic,
  type: "tag",
  href: "/java",
  keywords: [topic, "priority"],
}))

const toolEntries: SearchEntry[] = PRIORITY_TOOLS.map((tool) => ({
  label: tool.name,
  type: "tool",
  href: "/tools",
  keywords: [tool.name, tool.summary, tool.slug],
}))

const categoryEntries: SearchEntry[] = JAVA_CATEGORIES.map((category) => ({
  label: category.name,
  type: "tag",
  href: "/java",
  keywords: [category.name, category.summary, category.slug],
}))

export const SEARCH_INDEX: SearchEntry[] = [...articleEntries, ...topicEntries, ...toolEntries, ...categoryEntries]

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
      const key = `${entry.type}:${entry.label}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
    .slice(0, limit)
}
