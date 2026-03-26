import java.math.BigDecimal;
import java.math.RoundingMode;

public class TaxCalculationSample {

    // 標準税率 10%
    private static final BigDecimal STANDARD_RATE = new BigDecimal("0.10");
    // 軽減税率 8%（食料品・新聞など）
    private static final BigDecimal REDUCED_RATE = new BigDecimal("0.08");

    public static void main(String[] args) {

        // ① double の浮動小数点誤差の例（使ってはいけないパターン）
        double d1 = 0.1 + 0.2;
        System.out.println("0.1 + 0.2 = " + d1); // 0.30000000000000004 になる

        double priceDouble = 1000.0;
        double taxDouble = priceDouble * 0.10;
        System.out.println("double で税計算: " + priceDouble + " * 0.10 = " + taxDouble);

        // ② BigDecimal で正確な計算（文字列コンストラクタを使うこと）
        BigDecimal price = new BigDecimal("1000");

        // 標準税率 10% の税込み計算（切り捨て）
        BigDecimal taxStandard = price.multiply(STANDARD_RATE)
                .setScale(0, RoundingMode.DOWN);
        BigDecimal totalStandard = price.add(taxStandard);
        System.out.println("1000円（10%）税額: " + taxStandard + "円、税込: " + totalStandard + "円");

        // 軽減税率 8% の税込み計算（切り捨て）
        BigDecimal taxReduced = price.multiply(REDUCED_RATE)
                .setScale(0, RoundingMode.DOWN);
        BigDecimal totalReduced = price.add(taxReduced);
        System.out.println("1000円（8%）税額: " + taxReduced + "円、税込: " + totalReduced + "円");

        // ③ 端数処理のバリエーション
        BigDecimal price2 = new BigDecimal("1080");
        BigDecimal tax2 = price2.multiply(STANDARD_RATE); // 108.0

        BigDecimal roundDown = tax2.setScale(0, RoundingMode.DOWN);    // 切り捨て
        BigDecimal roundUp = tax2.setScale(0, RoundingMode.UP);        // 切り上げ
        BigDecimal roundHalfUp = tax2.setScale(0, RoundingMode.HALF_UP); // 四捨五入

        System.out.println("税額 " + tax2 + " の端数処理:");
        System.out.println("  切り捨て(ROUND_DOWN):    " + roundDown);
        System.out.println("  切り上げ(ROUND_UP):      " + roundUp);
        System.out.println("  四捨五入(ROUND_HALF_UP): " + roundHalfUp);

        // ④ 税込み → 税抜き（逆算）
        BigDecimal taxIncluded = new BigDecimal("1100");
        BigDecimal divisor = BigDecimal.ONE.add(STANDARD_RATE); // 1.10
        BigDecimal priceExcluded = taxIncluded.divide(divisor, 0, RoundingMode.DOWN);
        System.out.println("税込 1100円 → 税抜: " + priceExcluded + "円");
    }
}
