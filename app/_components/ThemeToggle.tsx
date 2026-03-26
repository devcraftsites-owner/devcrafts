"use client"

import { useEffect, useState } from "react"

type ThemeMode = "light" | "dark"

function getResolvedTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light"
  }

  const stored = window.localStorage.getItem("theme-mode")
  if (stored === "light" || stored === "dark") {
    return stored
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme
  window.localStorage.setItem("theme-mode", theme)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => getResolvedTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle color theme">
      <span className="theme-toggle__dot" />
      <span suppressHydrationWarning>{theme === "light" ? "Light" : "Dark"}</span>
    </button>
  )
}
