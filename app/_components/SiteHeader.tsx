"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SearchBox } from "./SearchBox"
import { ThemeToggle } from "./ThemeToggle"

const navItems = [
  { href: "/java", label: "Java" },
  { href: "/tools", label: "Tools" },
  { href: "/about", label: "About" },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="site-shell site-header">
      <div className="site-header__top">
        <Link href="/" className="brand-mark">
          <span className="brand-kicker">DEV</span>
          <span className="brand-name">craft</span>
        </Link>
        <div className="site-header__actions">
          <ThemeToggle />
        </div>
      </div>
      <div className="site-header__bottom">
        <SearchBox />
        <nav className="site-nav" aria-label="Global">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
