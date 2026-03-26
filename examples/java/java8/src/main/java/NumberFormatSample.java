import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Locale;

public class NumberFormatSample {

    // ① カンマ区切り整数（日本ロケール）
    public static String formatInteger(long number) {
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.JAPAN);
        return nf.format(number);
    }

    // ② DecimalFormat で小数・通貨パターンを指定
    public static String formatDecimal(BigDecimal amount, String pattern) {
        DecimalFormat df = new DecimalFormat(pattern);
        return df.format(amount);
    }

    // ③ 通貨フォーマット（¥ マーク付き）
    public static String formatCurrency(long amount) {
        NumberFormat cf = NumberFormat.getCurrencyInstance(Locale.JAPAN);
        return cf.format(amount);
    }

    // ④ カンマ区切り文字列 → long にパース
    public static long parseFormattedNumber(String str) throws ParseException {
        // NumberFormat.parse() の戻り値は Number 型（long/double を区別しない）
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.JAPAN);
        return nf.parse(str).longValue();
    }

    public static void main(String[] args) throws ParseException {
        // ① カンマ区切り整数
        System.out.println(formatInteger(1234567));      // 1,234,567
        System.out.println(formatInteger(-9876543));     // -9,876,543

        // ② DecimalFormat パターン
        BigDecimal amount = new BigDecimal("12345.678");
        System.out.println(formatDecimal(amount, "#,##0.00"));  // 12,345.68（四捨五入）
        System.out.println(formatDecimal(amount, "#,##0"));     // 12,346

        // ③ 通貨フォーマット
        System.out.println(formatCurrency(9800));   // ¥9,800
        System.out.println(formatCurrency(100000)); // ¥100,000

        // ④ パース（カンマ区切り文字列 → 数値）
        System.out.println(parseFormattedNumber("1,234,567")); // 1234567

        // ⑤ ロケールによる小数点記号の違い
        double d = 1234567.89;
        System.out.println("日本 : " + NumberFormat.getNumberInstance(Locale.JAPAN).format(d));
        System.out.println("米国 : " + NumberFormat.getNumberInstance(Locale.US).format(d));
        System.out.println("ドイツ: " + NumberFormat.getNumberInstance(Locale.GERMANY).format(d));
        // → 日本/米国: 1,234,567.89  ドイツ: 1.234.567,89（小数点と桁区切りが逆）
    }
}
