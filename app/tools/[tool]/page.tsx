import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getJavaArticleBySlug, getJavaArticleHref } from "../../_data/java"
import { type ToolDefinition, getToolBySlug, getToolHref, TOOLS } from "../../_data/tools"
import { BusinessDaysTool } from "../_components/BusinessDaysTool"
import { JapanHolidaysTool } from "../_components/JapanHolidaysTool"
import { TaxCalculatorTool } from "../_components/TaxCalculatorTool"
import { TimezoneTool } from "../_components/TimezoneTool"
import { PercentageCalculatorTool } from "../_components/PercentageCalculatorTool"
import { UnitConverterTool } from "../_components/UnitConverterTool"
import { Base64Tool } from "../_components/Base64Tool"
import { JsonFormatterTool } from "../_components/JsonFormatterTool"
import { RegexTesterTool } from "../_components/RegexTesterTool"
import AdSlot from "../../_components/AdSlot"
import { SqlFormatterTool } from "../_components/SqlFormatterTool"
import { WarekiTool } from "../_components/WarekiTool"
import { CsvJsonTool } from "../_components/CsvJsonTool"
import { JsonToTsTool } from "../_components/JsonToTsTool"
import { HashTool } from "../_components/HashTool"

function renderToolComponent(entry: ToolDefinition): ReactNode | null {
  switch (entry.slug) {
    case "business-days":
      return (
        <BusinessDaysTool
          initialStart={entry.inputFields?.[0]?.value ?? "2026-03-01"}
          initialEnd={entry.inputFields?.[1]?.value ?? "2026-03-31"}
        />
      )
    case "japan-holidays":
      return (
        <JapanHolidaysTool
          initialYear={entry.inputFields?.[0]?.value ?? "2025"}
        />
      )
    case "wareki":
      return (
        <WarekiTool
          initialDate={entry.inputFields?.[0]?.value ?? "2019-05-01"}
          initialWareki={entry.inputFields?.[1]?.value ?? "令和元年5月1日"}
        />
      )
    case "tax-calculator":
      return (
        <TaxCalculatorTool
          initialAmount={entry.inputFields?.[0]?.value ?? "1000"}
        />
      )
    case "timezone":
      return (
        <TimezoneTool
          initialDateTime={entry.inputFields?.[0]?.value ?? "2026-03-26 12:00"}
          initialTimezone="JST"
        />
      )
    case "percentage-calculator":
      return <PercentageCalculatorTool />
    case "unit-converter":
      return (
        <UnitConverterTool
          initialCategory="length"
          initialValue={entry.inputFields?.[0]?.value ?? "1"}
          initialFromUnit="m"
        />
      )
    case "json-formatter":
      return <JsonFormatterTool />
    case "base64":
      return <Base64Tool />
    case "regex-tester":
      return <RegexTesterTool />
    case "sql-formatter":
      return <SqlFormatterTool />
    case "csv-json":
      return <CsvJsonTool />
    case "json-to-ts":
      return <JsonToTsTool />
    case "hash":
      return <HashTool />
    default:
      return null
  }
}

type ToolPageProps = {
  params: Promise<{
    tool: string
  }>
}

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    tool: tool.slug,
  }))
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { tool } = await params
  const entry = getToolBySlug(tool)

  if (!entry) {
    return {}
  }

  const baseDescription = entry.description ?? entry.summary
  let description = baseDescription
  if (entry.features && description.length < 80) {
    const featuresSuffix = entry.features.slice(0, 2).join("。")
    description = `${baseDescription}${featuresSuffix}。`
  }
  if (description.length > 120) {
    description = `${description.slice(0, 117)}...`
  }

  return {
    title: `${entry.name} — ${entry.summary.replace(/。$/, "")}｜ブラウザ完結`.slice(0, 50),
    description,
    alternates: { canonical: "./" },
    ...(entry.status !== "ready" && { robots: "noindex" }),
  }
}

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { tool } = await params
  const entry = getToolBySlug(tool)

  if (!entry) {
    notFound()
  }

  const relatedArticles = (entry.relatedArticleSlugs ?? [])
    .map((slug) => getJavaArticleBySlug(slug))
    .filter((article): article is NonNullable<typeof article> => Boolean(article))

  // JSON-LD: static data only (no user input), safe to serialize
  const jsonLd = entry.status === "ready" ? JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: entry.name,
        applicationCategory: "UtilitiesApplication",
        description: entry.description ?? entry.summary,
        offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
        operatingSystem: "Web Browser",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://dev-craft.dev/" },
          { "@type": "ListItem", position: 2, name: "Tools", item: "https://dev-craft.dev/tools/" },
          { "@type": "ListItem", position: 3, name: entry.name },
        ],
      },
      ...((entry.faq ?? []).length > 0
        ? [{
            "@type": "FAQPage",
            mainEntity: (entry.faq ?? []).map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }]
        : []),
    ],
  }) : null

  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} /> : null}
    <div className="docs-page">
      <section className="hero-panel hero-panel--compact">
        <div>
          <div className="breadcrumbs">
            <Link href="/">Home</Link> / <Link href="/tools">Tools</Link> / {entry.name}
          </div>
          <p className="eyebrow">Tool Detail</p>
          <h1 className="hero-title hero-title--compact">{entry.name}</h1>
          <p className="hero-copy">{entry.description ?? entry.summary}</p>
        </div>
        <div className="hero-actions">
          <span className={`badge ${entry.status === "ready" ? "" : "badge--muted"}`}>
            {entry.status === "ready" ? "Ready" : "Planned"}
          </span>
          <span className="filter-chip">{entry.category}</span>
        </div>
      </section>

      <section className="tool-detail-layout">
        <section className="compact-stack">
          {entry.status === "ready" && renderToolComponent(entry) ? (
            renderToolComponent(entry)
          ) : (
            <section className="panel">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Status</p>
                  <h2 className="section-title">このツールは準備中です</h2>
                </div>
              </div>
              <p className="section-copy">
                現在公開準備を進めています。他の公開済みツールもぜひご活用ください。
              </p>
            </section>
          )}

          <section className="panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">How It Works</p>
                <h2 className="section-title">仕様と確認ポイント</h2>
              </div>
            </div>
            <div className="article-grid">
              <section className="panel panel--soft">
                <p className="eyebrow">Features</p>
                <div className="compact-stack">
                  {(entry.features ?? [entry.summary]).map((feature) => (
                    <div key={feature} className="tree-item">
                      <small>{feature}</small>
                    </div>
                  ))}
                </div>
              </section>
              <section className="panel panel--soft">
                <p className="eyebrow">Input Preview</p>
                <div className="compact-stack">
                  {(entry.inputFields ?? []).map((field) => (
                    <div key={field.label} className="tree-item">
                      <strong>{field.label}</strong>
                      <small>{field.value}</small>
                      {field.helpText ? <small>{field.helpText}</small> : null}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {entry.resultPreview ? (
              <div className="tool-result">
                <strong>Result Preview</strong>
                {entry.resultPreview}
              </div>
            ) : null}
          </section>

          {entry.status === "ready" ? (
            <AdSlot placement="tool" format="text" className="ad-seat ad-seat--inline" />
          ) : null}

          {entry.cautions?.length ? (
            <section className="panel">
              <div className="section-header">
                <div>
                  <p className="eyebrow">Cautions</p>
                  <h2 className="section-title">利用時の注意点</h2>
                </div>
              </div>
              <div className="compact-stack">
                {entry.cautions.map((caution) => (
                  <div key={caution} className="tree-item">
                    <small>{caution}</small>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {entry.faq?.length ? (
            <section className="panel">
              <div className="section-header">
                <div>
                  <p className="eyebrow">FAQ</p>
                  <h2 className="section-title">実務で迷いやすい点</h2>
                </div>
              </div>
              <div className="compact-stack">
                {entry.faq.map((item) => (
                  <section key={item.question} className="panel panel--soft">
                    <strong>{item.question}</strong>
                    <p className="section-copy">{item.answer}</p>
                  </section>
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <aside className="rail-stack">
          <section className="panel">
            <div className="section-caption">Related Articles</div>
            <div className="compact-stack">
              {relatedArticles.length > 0 ? (
                relatedArticles.map((article) => (
                  <Link key={article.slug} href={getJavaArticleHref(article)} className="mini-link">
                    <strong>{article.title}</strong>
                    <small>{article.summary}</small>
                  </Link>
                ))
              ) : (
                <div className="tree-item">
                  <small>関連する Java 記事が見つかり次第追加します。</small>
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="section-caption">Catalog</div>
            <div className="compact-stack">
              {TOOLS.filter((toolItem) => toolItem.priority === "priority").map((toolItem) => (
                <Link key={toolItem.slug} href={getToolHref(toolItem.slug)} className="mini-link">
                  <strong>{toolItem.name}</strong>
                  <small>{toolItem.status === "ready" ? "公開中" : "準備中"}</small>
                </Link>
              ))}
            </div>
          </section>

          <AdSlot placement="tool" format="banner" className="ad-seat sticky-ad" />
        </aside>
      </section>
    </div>
    </>
  )
}
