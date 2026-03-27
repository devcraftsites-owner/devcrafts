export type JavaPriority = "high" | "medium" | "long_term"
export type JavaVersionLabel = "Java 8" | "Java 17" | "Java 21"

export type JavaCategory = {
  slug: string
  name: string
  articleCount: number
  summary: string
  priority: JavaPriority
  purpose: string
  audience: string
  featuredTopics: string[]
}

export type JavaArticlePreview = {
  slug: string
  title: string
  categorySlug: string
  summary: string
  version: JavaVersionLabel
  tags: string[]
  apiNames: string[]
  toolSlug?: string
}

export type JavaArticleFaqItem = {
  question: string
  answer: string
}

export type JavaLibraryAlternative = {
  name: string
  whenToUse: string
  tradeoff: string
}

export type JavaArticleVersionCoverage = {
  java8: string
  java17: string
  java21: string
  java8Code?: string
  java17Code?: string
  java21Code?: string
}

export type BookRecommendation = {
  title: string
  author: string
  amazonUrl: string
  comment: string
}

export type JavaArticleDetail = JavaArticlePreview & {
  description: string
  lead: string
  useCases: string[]
  cautions: string[]
  relatedArticleSlugs: string[]
  versionCoverage: JavaArticleVersionCoverage
  libraryComparison: JavaLibraryAlternative[]
  faq: JavaArticleFaqItem[]
  codeTitle: string
  codeSample: string
  tryPanelTitle?: string
  tryPanelDescription?: string
  tryPanelFields?: Array<{ label: string; value: string }>
  tryPanelResult?: string
  recommendedBooks?: BookRecommendation[]
}
