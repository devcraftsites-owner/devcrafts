import { type AdFormat, type AdPlacement, pickAd } from "../_data/ads"

type AdSlotProps = {
  placement: AdPlacement
  format: AdFormat
  className?: string
}

/**
 * 広告表示コンポーネント（Server Component）
 * ads.ts のデータからランダムに 1 件選んで表示する。
 * html フィールドは運営者が管理する A8.net タグのみ（外部入力なし）。
 */
export default function AdSlot({ placement, format, className }: AdSlotProps) {
  const ad = pickAd(placement, format)
  if (!ad) return null

  // ads.ts は運営者管理のアフィリエイトタグのみ格納。外部入力は含まれない。
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: ad.html }}
    />
  )
}
