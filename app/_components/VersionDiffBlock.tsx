"use client"

import { useState } from "react"
import type { JavaArticleVersionCoverage } from "../_data/java"
import { CopyButton } from "./CopyButton"

type VersionDiffBlockProps = {
  coverage: JavaArticleVersionCoverage
}

const VERSIONS = [
  { key: "java8" as const, label: "Java 8", codeKey: "java8Code" as const },
  { key: "java17" as const, label: "Java 17", codeKey: "java17Code" as const },
  { key: "java21" as const, label: "Java 21", codeKey: "java21Code" as const },
]

export function VersionDiffBlock({ coverage }: VersionDiffBlockProps) {
  const hasCode = coverage.java8Code || coverage.java17Code || coverage.java21Code
  const [active, setActive] = useState<"java8" | "java17" | "java21">(
    coverage.java17Code ? "java17" : coverage.java8Code ? "java8" : "java21",
  )

  if (!hasCode) {
    return null
  }

  const activeVersion = VERSIONS.find((v) => v.key === active)!
  const description = coverage[active]
  const code = coverage[activeVersion.codeKey]

  return (
    <div className="version-diff">
      <div className="version-diff__tabs">
        {VERSIONS.map((v) => (
          <button
            key={v.key}
            type="button"
            className={`version-diff__tab ${active === v.key ? "version-diff__tab--active" : ""}`}
            onClick={() => setActive(v.key)}
            aria-pressed={active === v.key}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="section-copy">{description}</p>
      {code ? (
        <div className="code-block">
          <div className="code-block__top">
            <span>{activeVersion.label}</span>
            <CopyButton text={code} />
          </div>
          <pre>{code}</pre>
        </div>
      ) : null}
    </div>
  )
}
