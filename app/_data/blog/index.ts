export type { BlogArticle, BlogFaqItem } from "./types"

import type { BlogArticle } from "./types"
import { article as sslClientCert } from "./ssl-client-cert"
import { article as csvExportOom } from "./csv-export-oom"
import { article as strutsSessionDestroy } from "./struts-session-destroy"
import { article as strutsStaticBottleneck } from "./struts-static-bottleneck"

const ALL_BLOG_ARTICLES: BlogArticle[] = [strutsStaticBottleneck, strutsSessionDestroy, csvExportOom, sslClientCert]

export const BLOG_ARTICLES: BlogArticle[] = ALL_BLOG_ARTICLES.filter(
  (a) => a.publishedAt <= new Date().toISOString().slice(0, 10),
)

// --- Derived helpers ---

export function getBlogArticles() {
  return BLOG_ARTICLES
}

export function getBlogArticle(slug: string) {
  return BLOG_ARTICLES.find((a) => a.slug === slug)
}

export function getBlogArticleHref(slug: string) {
  return `/blog/${slug}`
}
