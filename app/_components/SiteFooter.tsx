export function SiteFooter() {
  return (
    <footer className="site-shell site-footer">
      <div>
        <p className="footer-title">dev-craft</p>
        <p className="footer-copy">
          Java 実務レシピを主軸に、検索・比較・試用まで同一導線で整理する。
        </p>
      </div>
      <div className="footer-links">
        <a href="/about">About</a>
        <a href="/java/standard-preview">Article</a>
        <a href="/java/tool-enhanced-preview">Try Panel</a>
        <a href="/privacy">Privacy</a>
        <a href="/contact">Contact</a>
        <a href="/terms">Terms</a>
      </div>
    </footer>
  )
}
