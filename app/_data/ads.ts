// ---------------------------------------------------------------------------
// 広告データ管理
// A8.net 等のアフィリエイトタグを一元管理し、カテゴリ別に出し分ける
// ---------------------------------------------------------------------------

/** 広告の表示形式 */
export type AdFormat = "banner" | "text"

/** 広告カテゴリ — ページ内容との親和性で出し分けに使う */
export type AdCategory = "job" | "school" | "cloud" | "book" | "general"

/** ページ種別 — どのページに表示するか */
export type AdPlacement = "java" | "tool" | "top" | "any"

export type AdEntry = {
  id: string
  category: AdCategory
  format: AdFormat
  /** この広告を表示するページ種別。"any" はどこでも表示 */
  placement: AdPlacement[]
  /** バナーの場合: img タグ含む HTML（A8.net の素材をそのまま貼る） */
  html: string
  /** alt / ラベル用。管理画面での識別にも使う */
  label: string
  /** 250x250 等のサイズ（バナー用、参考情報） */
  size?: string
}

// ---------------------------------------------------------------------------
// 広告エントリ
// A8.net からタグを取得したら html フィールドに貼り付ける
// ---------------------------------------------------------------------------
// AdSense 審査中のため一時停止
export const ADS: AdEntry[] = []

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

/** placement と format でフィルタし、ランダムに 1 件返す */
export function pickAd(
  placement: AdPlacement,
  format: AdFormat,
): AdEntry | null {
  const pool = ADS.filter(
    (ad) =>
      (ad.placement.includes(placement) || ad.placement.includes("any")) &&
      ad.format === format,
  )
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

/** placement でフィルタしバナーを 1 件、テキストを 1 件返す */
export function pickAds(placement: AdPlacement): {
  banner: AdEntry | null
  text: AdEntry | null
} {
  return {
    banner: pickAd(placement, "banner"),
    text: pickAd(placement, "text"),
  }
}
