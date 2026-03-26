import { describe, expect, it } from "vitest"

import { getSearchSuggestions } from "./search"
import { JAVA_ARTICLE_PREVIEWS, JAVA_CATEGORIES, PRIORITY_JAVA_TOPICS, TOOL_ENHANCED_ARTICLE_SLUGS } from "./java"
import { PRIORITY_TOOLS, TOOLS } from "./tools"

describe("site data", () => {
  it("keeps priority Java topics aligned with category coverage", () => {
    expect(PRIORITY_JAVA_TOPICS.length).toBeGreaterThan(0)
    expect(JAVA_CATEGORIES.some((category) => category.priority === "high")).toBe(true)
  })

  it("keeps priority tools present in the tool catalog", () => {
    const toolCategories = new Set(TOOLS.map((tool) => tool.category))

    expect(PRIORITY_TOOLS.length).toBeGreaterThan(0)
    expect(toolCategories.size).toBeGreaterThan(0)
    expect(PRIORITY_TOOLS.every((tool) => toolCategories.has(tool.category))).toBe(true)
  })

  it("limits tool-enhanced articles to entries with a matching tool slug", () => {
    expect(TOOL_ENHANCED_ARTICLE_SLUGS.size).toBeGreaterThan(0)
    expect(
      JAVA_ARTICLE_PREVIEWS.filter((article) => TOOL_ENHANCED_ARTICLE_SLUGS.has(article.slug)).every((article) => article.toolSlug),
    ).toBe(true)
  })

  it("returns search suggestions for API names and tool-related terms", () => {
    const streamSuggestions = getSearchSuggestions("Stream")
    const businessDaySuggestions = getSearchSuggestions("営業日")

    expect(streamSuggestions.some((entry) => entry.label.includes("Stream"))).toBe(true)
    expect(businessDaySuggestions.some((entry) => entry.label.includes("営業日"))).toBe(true)
  })
})
