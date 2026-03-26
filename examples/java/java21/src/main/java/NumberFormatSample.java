import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Locale;

public class NumberFormatSample {

    public static String formatInteger(long number) {
        return NumberFormat.getNumberInstance(Locale.JAPAN).format(number);
    }

    public static String formatDecimal(BigDecimal amount, String pattern) {
        return new DecimalFormat(pattern).format(amount);
    }

    public static String formatCurrency(long amount) {
        return NumberFormat.getCurrencyInstance(Locale.JAPAN).format(amount);
    }

    public static long parseFormattedNumber(String str) throws ParseException {
        return NumberFormat.getNumberInstance(Locale.JAPAN).parse(str).longValue();
    }

    // Java 21: Collectors.teeing で合計と平均を1回のストリーム処理で集計
    record Summary(long total, double average) {}

    public static Summary summarize(java.util.List<Long> amounts) {
        return amounts.stream()
                .collect(java.util.stream.Collectors.teeing(
                        java.util.stream.Collectors.summingLong(Long::longValue),
                        java.util.stream.Collectors.averagingLong(Long::longValue),
                        Summary::new));
    }

    public static void main(String[] args) throws ParseException {
        System.out.println(formatInteger(1234567));
        System.out.println(formatDecimal(new BigDecimal("12345.678"), "#,##0.00"));
        System.out.println(formatCurrency(9800));
        System.out.println(parseFormattedNumber("1,234,567"));

        // Collectors.teeing で合計＆平均を同時集計
        var amounts = java.util.List.of(1000L, 2000L, 3000L, 4000L, 5000L);
        var summary = summarize(amounts);
        System.out.println("合計: " + formatInteger(summary.total()) + "円");
        System.out.printf("平均: %s円%n", formatInteger((long) summary.average()));

        // ロケール別
        double d = 1234567.89;
        System.out.println("日本 : " + NumberFormat.getNumberInstance(Locale.JAPAN).format(d));
        System.out.println("米国 : " + NumberFormat.getNumberInstance(Locale.US).format(d));
        System.out.println("ドイツ: " + NumberFormat.getNumberInstance(Locale.GERMANY).format(d));
    }
}
