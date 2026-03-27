import type { BookRecommendation } from "../_data/java/types"

type BookCardListProps = {
  books: BookRecommendation[]
}

export function BookCardList({ books }: BookCardListProps) {
  return (
    <div className="article-section">
      <h2 className="section-title">関連書籍</h2>
      <p className="section-copy">
        この記事のテーマをさらに深く学びたい方へ。
      </p>
      <div className="compact-stack">
        {books.map((book) => (
          <a
            key={book.amazonUrl}
            href={book.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="book-card"
          >
            <strong>{book.title}</strong>
            <small className="book-card__author">{book.author}</small>
            <small className="book-card__comment">{book.comment}</small>
          </a>
        ))}
      </div>
      <p className="meta-copy" style={{ fontSize: "11px", marginTop: "4px" }}>
        ※ Amazon アソシエイトリンクを含みます
      </p>
    </div>
  )
}
