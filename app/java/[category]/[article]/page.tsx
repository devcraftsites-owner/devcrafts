import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { JavaArticlePage } from "../../../_components/JavaArticlePage"
import { getJavaArticle, getJavaCategory, JAVA_ARTICLES } from "../../../_data/java"

type ArticlePageProps = {
  params: Promise<{
    category: string
    article: string
  }>
}

export async function generateStaticParams() {
  return JAVA_ARTICLES.map((article) => ({
    category: article.categorySlug,
    article: article.slug,
  }))
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { category, article } = await params
  const entry = getJavaArticle(category, article)

  if (!entry) {
    return {}
  }

  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: "./" },
  }
}

export default async function JavaArticleRoutePage({ params }: ArticlePageProps) {
  const { category, article } = await params
  const entry = getJavaArticle(category, article)

  if (!entry) {
    notFound()
  }

  const cat = getJavaCategory(entry.categorySlug)
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: entry.title,
        description: entry.description,
        proficiencyLevel: "Beginner",
        author: { "@type": "Organization", name: "dev-craft" },
        publisher: { "@type": "Organization", name: "dev-craft", url: "https://dev-craft.dev" },
        inLanguage: "ja",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://dev-craft.dev/" },
          { "@type": "ListItem", position: 2, name: "Java", item: "https://dev-craft.dev/java/" },
          { "@type": "ListItem", position: 3, name: cat?.name ?? entry.categorySlug, item: `https://dev-craft.dev/java/${entry.categorySlug}/` },
          { "@type": "ListItem", position: 4, name: entry.title },
        ],
      },
      ...(entry.faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: entry.faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
          ]
        : []),
    ],
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <JavaArticlePage article={entry} />
    </>
  )
}
