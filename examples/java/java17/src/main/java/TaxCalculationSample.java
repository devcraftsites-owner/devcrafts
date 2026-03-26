import java.math.BigDecimal;
import java.math.RoundingMode;

public class TaxCalculationSample {

    // 標準税率 10%
    private static final BigDecimal STANDARD_RATE = new BigDecimal("0.10");
    // 軽減税率 8%（食料品・新聞など）
    private static final BigDecimal REDUCED_RATE = new BigDecimal("0.08");

    /**
     * 税込み金額を計算する（切り捨て）
     *
     * @param price    税抜き価格
     * @param taxRate  税率（例: new BigDecimal("0.10")）
     * @return 税込み金額
     */
    public static BigDecimal calcTaxIncluded(BigDecimal price, BigDecimal taxRate) {
        BigDecimal tax = price.multiply(taxRate).setScale(0, RoundingMode.DOWN);
        return price.add(tax);
    }

    public static void main(String[] args) {

        // ① double の浮動小数点誤差の例（使ってはいけないパターン）
        double d1 = 0.1 + 0.2;
        System.out.println("0.1 + 0.2 = " + d1); // 0.30000000000000004

        // ② BigDecimal で正確な計算
        BigDecimal price = new BigDecimal("1000");

        BigDecimal totalStandard = calcTaxIncluded(price, STANDARD_RATE);
        BigDecimal totalReduced = calcTaxIncluded(price, REDUCED_RATE);
        System.out.println("1000円（10%）税込: " + totalStandard + "円");
        System.out.println("1000円（8%）税込: " + totalReduced + "円");

        // ③ 端数処理のバリエーション
        BigDecimal price2 = new BigDecimal("1080");
        BigDecimal tax2 = price2.multiply(STANDARD_RATE); // 108.0

        BigDecimal roundDown   = tax2.setScale(0, RoundingMode.DOWN);    // 切り捨て
        BigDecimal roundUp     = tax2.setScale(0, RoundingMode.UP);      // 切り上げ
        BigDecimal roundHalfUp = tax2.setScale(0, RoundingMode.HALF_UP); // 四捨五入

        System.out.println("税額 " + tax2 + " の端数処理:");
        System.out.println("  切り捨て(DOWN):     " + roundDown);
        System.out.println("  切り上げ(UP):       " + roundUp);
        System.out.println("  四捨五入(HALF_UP):  " + roundHalfUp);

        // ④ 税込み → 税抜き（逆算）
        BigDecimal taxIncluded = new BigDecimal("1100");
        BigDecimal divisor = BigDecimal.ONE.add(STANDARD_RATE); // 1.10
        BigDecimal priceExcluded = taxIncluded.divide(divisor, 0, RoundingMode.DOWN);
        System.out.println("税込 1100円 → 税抜: " + priceExcluded + "円");

        // ⑤ Java 17: switch 式で税率を切り替える例
        String itemType = "food"; // "food" または "other"
        BigDecimal rate = switch (itemType) { // Java 14+
            case "food", "newspaper" -> REDUCED_RATE; // 軽減税率 8%
            default -> STANDARD_RATE; // 標準税率 10%
        };
        System.out.println("アイテム種別 '" + itemType + "' の税率: " + rate);
    }
}
