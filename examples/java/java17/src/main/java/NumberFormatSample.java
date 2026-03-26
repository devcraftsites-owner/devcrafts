import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Locale;

public class NumberFormatSample {

    // ① カンマ区切り整数
    public static String formatInteger(long number) {
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.JAPAN);
        return nf.format(number);
    }

    // ② DecimalFormat パターン指定
    public static String formatDecimal(BigDecimal amount, String pattern) {
        var df = new DecimalFormat(pattern); // Java 10+ var
        return df.format(amount);
    }

    // ③ 通貨フォーマット
    public static String formatCurrency(long amount) {
        var cf = NumberFormat.getCurrencyInstance(Locale.JAPAN);
        return cf.format(amount);
    }

    // ④ パース
    public static long parseFormattedNumber(String str) throws ParseException {
        var nf = NumberFormat.getNumberInstance(Locale.JAPAN);
        return nf.parse(str).longValue();
    }

    // ⑤ Java 17: formatted() で文字列テンプレート的な書き方（String.format の代替）
    //    注: text block は Java 15+（ここでは通常の文字列を使用）
    public static String buildReport(String label, BigDecimal value) {
        // Java 15+ String.formatted()
        return "%s: %s円".formatted(label, formatDecimal(value, "#,##0"));
    }

    public static void main(String[] args) throws ParseException {
        System.out.println(formatInteger(1234567));      // 1,234,567
        System.out.println(formatDecimal(new BigDecimal("12345.678"), "#,##0.00")); // 12,345.68
        System.out.println(formatCurrency(9800));        // ¥9,800
        System.out.println(parseFormattedNumber("1,234,567")); // 1234567

        // formatted() を使ったレポート
        System.out.println(buildReport("売上合計", new BigDecimal("1234567"))); // 売上合計: 1,234,567円

        // ロケール別
        double d = 1234567.89;
        System.out.println("日本 : " + NumberFormat.getNumberInstance(Locale.JAPAN).format(d));
        System.out.println("米国 : " + NumberFormat.getNumberInstance(Locale.US).format(d));
        System.out.println("ドイツ: " + NumberFormat.getNumberInstance(Locale.GERMANY).format(d));
    }
}
