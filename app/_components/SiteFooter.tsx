import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="site-shell site-footer">
      <div>
        <p className="footer-title">dev-craft</p>
        <p className="footer-copy">
          Java 実務レシピを主軸に、検索・比較・試用まで同一導線で整理する。
        </p>
      </div>
      <nav className="footer-links" aria-label="Footer">
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  )
}
