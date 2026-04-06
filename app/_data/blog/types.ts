export type BlogArticle = {
  slug: string
  title: string
  description: string
  publishedAt: string
  tags: string[]
  relatedArticleSlugs: string[]
  relatedToolSlugs: string[]

  // 記事構成
  symptom: string
  environment: string
  wrongApproach: string
  rootCause: string
  solution: string
  solutionCode: string
  prevention: string

  // SEO
  searchKeywords: string[]

  // FAQ
  faq: BlogFaqItem[]
}

export type BlogFaqItem = {
  question: string
  answer: string
}
