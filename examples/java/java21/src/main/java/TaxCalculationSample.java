import java.math.BigDecimal;
import java.math.RoundingMode;

public class TaxCalculationSample {

    // 標準税率 10%
    private static final BigDecimal STANDARD_RATE = new BigDecimal("0.10");
    // 軽減税率 8%（食料品・新聞など）
    private static final BigDecimal REDUCED_RATE = new BigDecimal("0.08");

    // Java 16+: record で商品情報を表現
    record Item(String name, BigDecimal price, boolean isReducedTax) {} // Java 16+

    /**
     * 税込み金額を計算する（切り捨て）
     */
    public static BigDecimal calcTaxIncluded(BigDecimal price, BigDecimal taxRate) {
        BigDecimal tax = price.multiply(taxRate).setScale(0, RoundingMode.DOWN);
        return price.add(tax);
    }

    /**
     * アイテムの税率を取得する
     */
    public static BigDecimal getTaxRate(Item item) {
        return item.isReducedTax() ? REDUCED_RATE : STANDARD_RATE;
    }

    public static void main(String[] args) {

        // ① double の浮動小数点誤差の例
        double d1 = 0.1 + 0.2;
        System.out.println("0.1 + 0.2 = " + d1); // 0.30000000000000004

        // ② BigDecimal で正確な計算
        BigDecimal price = new BigDecimal("1000");
        System.out.println("1000円（10%）税込: " + calcTaxIncluded(price, STANDARD_RATE) + "円");
        System.out.println("1000円（8%）税込: " + calcTaxIncluded(price, REDUCED_RATE) + "円");

        // ③ 端数処理のバリエーション
        BigDecimal price2 = new BigDecimal("1080");
        BigDecimal tax2 = price2.multiply(STANDARD_RATE);

        System.out.println("税額 " + tax2 + " の端数処理:");
        System.out.println("  切り捨て(DOWN):     " + tax2.setScale(0, RoundingMode.DOWN));
        System.out.println("  切り上げ(UP):       " + tax2.setScale(0, RoundingMode.UP));
        System.out.println("  四捨五入(HALF_UP):  " + tax2.setScale(0, RoundingMode.HALF_UP));

        // ④ 税込み → 税抜き（逆算）
        BigDecimal taxIncluded = new BigDecimal("1100");
        BigDecimal divisor = BigDecimal.ONE.add(STANDARD_RATE);
        BigDecimal priceExcluded = taxIncluded.divide(divisor, 0, RoundingMode.DOWN);
        System.out.println("税込 1100円 → 税抜: " + priceExcluded + "円");

        // ⑤ Java 21: record + switch 式で商品ごとの税込み金額を計算
        var items = new Item[]{
                new Item("牛乳", new BigDecimal("200"), true),   // 軽減税率 8%
                new Item("ビール", new BigDecimal("300"), false), // 標準税率 10%
                new Item("新聞", new BigDecimal("150"), true)    // 軽減税率 8%
        };

        for (Item item : items) {
            BigDecimal rate = getTaxRate(item);
            BigDecimal total = calcTaxIncluded(item.price(), rate);
            System.out.println(item.name() + ": 税込 " + total + "円（税率 " + rate.multiply(new BigDecimal("100")).stripTrailingZeros().toPlainString() + "%）");
        }
    }
}
