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
export const ADS: AdEntry[] = [
  {
    id: "cloud-xserver-01",
    category: "cloud",
    format: "banner",
    placement: ["tool", "any"],
    html: `<a href="https://px.a8.net/svt/ejp?a8mat=4AZPOT+6D7WOI+CO4+15XRUP" rel="nofollow"><img border="0" width="250" height="250" alt="" src="https://www28.a8.net/svt/bgt?aid=260327117385&wid=001&eno=01&mid=s00000001642007044000&mc=1"></a><img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4AZPOT+6D7WOI+CO4+15XRUP" alt="">`,
    label: "Xserver レンタルサーバー",
    size: "250x250",
  },
]

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
