"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { getSearchSuggestions } from "../_data/search"

const labels = {
  article: "Article",
  tool: "Tool",
  tag: "Tag",
  api: "API",
} as const

export function SearchBox() {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  const suggestions = useMemo(() => getSearchSuggestions(query), [query])

  return (
    <div className="search-box">
      <input
        aria-label="Search site content"
        className="search-box__input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        placeholder="Search LocalDate, Stream.filter, 営業日, 和暦..."
      />
      {focused && suggestions.length > 0 ? (
        <div className="search-box__results" role="listbox" aria-label="Search suggestions">
          {suggestions.map((entry) => (
            <Link key={`${entry.type}-${entry.label}-${entry.href}`} href={entry.href} className="search-box__result">
              <span className={`search-box__type search-box__type--${entry.type}`}>{labels[entry.type]}</span>
              <span className="search-box__label">
                <span>{entry.label}</span>
                {entry.tryAvailable ? <span className="search-box__try">Try</span> : null}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
