import type { MetadataRoute } from "next"
import { JAVA_CATEGORIES, isPublishedArticle } from "./_data/java"
import { JAVA_ARTICLES } from "./_data/java"
import { TOOLS } from "./_data/tools"

export const dynamic = "force-static"

const BASE_URL = "https://dev-craft.dev"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    "/",
    "/java/",
    "/tools/",
    "/about/",
    "/contact/",
    "/privacy/",
    "/terms/",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }))

  const categoryPages: MetadataRoute.Sitemap = JAVA_CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/java/${cat.slug}/`,
    lastModified: new Date(),
  }))

  const articlePages: MetadataRoute.Sitemap = JAVA_ARTICLES
    .filter((article) => isPublishedArticle(article.slug))
    .map((article) => ({
      url: `${BASE_URL}/java/${article.categorySlug}/${article.slug}/`,
      lastModified: new Date(),
    }))

  const toolPages: MetadataRoute.Sitemap = TOOLS
    .filter((tool) => tool.status === "ready")
    .map((tool) => ({
      url: `${BASE_URL}/tools/${tool.slug}/`,
      lastModified: new Date(),
    }))

  return [...staticPages, ...categoryPages, ...articlePages, ...toolPages]
}
