import { describe, expect, it } from "vitest"

import { SEARCH_INDEX, getSearchSuggestions } from "./search"
import {
  JAVA_ARTICLE_PREVIEWS,
  JAVA_ARTICLES,
  JAVA_CATEGORIES,
  PRIORITY_JAVA_TOPICS,
  TOOL_ENHANCED_ARTICLE_SLUGS,
  getPublishedArticleCount,
  getJavaArticleHref,
  isPublishedArticle,
} from "./java"
import { BLOG_ARTICLES } from "./blog"
import { PRIORITY_TOOLS, TOOLS, getToolBySlug, getToolHref } from "./tools"
import sitemap from "../sitemap"

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
      JAVA_ARTICLE_PREVIEWS
        .filter((article) => TOOL_ENHANCED_ARTICLE_SLUGS.has(article.slug))
        .every((article) => article.toolSlug && getToolBySlug(article.toolSlug)),
    ).toBe(true)
  })

  it("resolves priority tools to detail pages", () => {
    expect(PRIORITY_TOOLS.every((tool) => getToolHref(tool.slug) === `/tools/${tool.slug}`)).toBe(true)
  })

  it("keeps article relations and generated hrefs aligned", () => {
    const articleSlugs = new Set(JAVA_ARTICLES.map((article) => article.slug))

    expect(
      JAVA_ARTICLES.every(
        (article) =>
          article.relatedArticleSlugs.every((slug) => articleSlugs.has(slug)) &&
          getJavaArticleHref(article) === `/java/${article.categorySlug}/${article.slug}`,
      ),
    ).toBe(true)
  })

  it("keeps published article counts at or below the planned category count", () => {
    expect(
      JAVA_CATEGORIES.every((category) => getPublishedArticleCount(category.slug) <= category.articleCount),
    ).toBe(true)
  })

  it("returns multiple article and api suggestions for BigDecimal", () => {
    const bigDecimalSuggestions = getSearchSuggestions("BigDecimal")
    const articleSuggestions = bigDecimalSuggestions.filter((entry) => entry.type === "article")
    const apiSuggestions = bigDecimalSuggestions.filter((entry) => entry.type === "api")

    expect(bigDecimalSuggestions.length).toBeGreaterThan(2)
    expect(articleSuggestions.length).toBeGreaterThan(1)
    expect(apiSuggestions.length).toBeGreaterThan(0)
  })

  it("returns search suggestions for API names and tool-related terms", () => {
    const streamSuggestions = getSearchSuggestions("Stream")
    const businessDaySuggestions = getSearchSuggestions("営業日")

    expect(streamSuggestions.some((entry) => entry.label.includes("Stream"))).toBe(true)
    expect(businessDaySuggestions.some((entry) => entry.label.includes("営業日"))).toBe(true)
  })

  it("indexes every ready tool and blog article in search", () => {
    const searchHrefs = new Set(SEARCH_INDEX.map((entry) => entry.href))

    for (const tool of TOOLS.filter((t) => t.status === "ready")) {
      expect(searchHrefs, `ready tool ${tool.slug} missing from search index`).toContain(getToolHref(tool.slug))
    }
    for (const article of BLOG_ARTICLES) {
      expect(searchHrefs, `blog article ${article.slug} missing from search index`).toContain(`/blog/${article.slug}`)
    }
  })

  it("resolves blog related slugs to existing articles and tools", () => {
    const articleSlugs = new Set(JAVA_ARTICLES.map((article) => article.slug))
    const readyToolSlugs = new Set(TOOLS.filter((t) => t.status === "ready").map((t) => t.slug))

    for (const blog of BLOG_ARTICLES) {
      for (const slug of blog.relatedArticleSlugs) {
        expect(articleSlugs, `blog ${blog.slug} references unknown article ${slug}`).toContain(slug)
      }
      for (const slug of blog.relatedToolSlugs) {
        expect(readyToolSlugs, `blog ${blog.slug} references non-ready tool ${slug}`).toContain(slug)
      }
    }
  })

  it("resolves tool related article slugs to existing articles", () => {
    const articleSlugs = new Set(JAVA_ARTICLES.map((article) => article.slug))

    for (const tool of TOOLS) {
      for (const slug of tool.relatedArticleSlugs ?? []) {
        expect(articleSlugs, `tool ${tool.slug} references unknown article ${slug}`).toContain(slug)
      }
    }
  })
})

describe("sitemap", () => {
  const urls = sitemap().map((entry) => entry.url)
  const urlSet = new Set(urls)

  it("includes the blog index and every published blog article", () => {
    expect(urlSet).toContain("https://dev-craft.dev/blog/")
    for (const article of BLOG_ARTICLES) {
      expect(urlSet, `blog article ${article.slug} missing from sitemap`).toContain(
        `https://dev-craft.dev/blog/${article.slug}/`,
      )
    }
  })

  it("includes every ready tool", () => {
    for (const tool of TOOLS.filter((t) => t.status === "ready")) {
      expect(urlSet, `ready tool ${tool.slug} missing from sitemap`).toContain(
        `https://dev-craft.dev/tools/${tool.slug}/`,
      )
    }
  })

  it("excludes categories without published articles", () => {
    for (const category of JAVA_CATEGORIES) {
      const url = `https://dev-craft.dev/java/${category.slug}/`
      if (getPublishedArticleCount(category.slug) > 0) {
        expect(urlSet, `category ${category.slug} missing from sitemap`).toContain(url)
      } else {
        expect(urlSet, `empty category ${category.slug} should not be in sitemap`).not.toContain(url)
      }
    }
  })

  it("only lists published java articles", () => {
    const articleUrls = urls.filter((url) => /^https:\/\/dev-craft\.dev\/java\/[^/]+\/[^/]+\/$/.test(url))
    for (const url of articleUrls) {
      const slug = url.replace(/\/$/, "").split("/").pop() as string
      expect(isPublishedArticle(slug), `unpublished article ${slug} found in sitemap`).toBe(true)
    }
  })

  it("has no duplicate urls", () => {
    expect(urlSet.size).toBe(urls.length)
  })
})
