import type { MetadataRoute } from "next"
import { JAVA_CATEGORIES, isPublishedArticle, getPublishedArticleCount } from "./_data/java"
import { JAVA_ARTICLES } from "./_data/java"
import { TOOLS } from "./_data/tools"
import { BLOG_ARTICLES } from "./_data/blog"

export const dynamic = "force-static"

const BASE_URL = "https://dev-craft.dev"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    "/",
    "/java/",
    "/tools/",
    "/blog/",
    "/about/",
    "/contact/",
    "/privacy/",
    "/terms/",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }))

  // 公開記事が1件もないカテゴリは「準備中」スタブしか表示されないため sitemap から除外する
  const categoryPages: MetadataRoute.Sitemap = JAVA_CATEGORIES
    .filter((cat) => getPublishedArticleCount(cat.slug) > 0)
    .map((cat) => ({
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

  const blogPages: MetadataRoute.Sitemap = BLOG_ARTICLES.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}/`,
    lastModified: article.publishedAt,
  }))

  return [...staticPages, ...categoryPages, ...articlePages, ...toolPages, ...blogPages]
}
