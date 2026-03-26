import java.time.LocalDate;
import java.time.chrono.JapaneseChronology;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class DateParserSample {

    // 対応する日付フォーマットの一覧（試行順に定義）
    private static final List<DateTimeFormatter> FORMATTERS = Arrays.asList(
        DateTimeFormatter.ISO_LOCAL_DATE,                                          // 2024-04-01
        DateTimeFormatter.ofPattern("yyyy/MM/dd"),                                 // 2024/04/01
        DateTimeFormatter.ofPattern("yyyyMMdd"),                                   // 20240401
        DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH),               // Apr 1, 2024
        DateTimeFormatter.ofPattern("GGGGy年M月d日")                               // 令和6年4月1日
            .withChronology(JapaneseChronology.INSTANCE)
            .withLocale(Locale.JAPANESE)
    );

    /**
     * 複数フォーマットに対応した日付解析メソッド。
     * フォーマットを順番に試し、成功したものを返す（フォールバックチェーン方式）。
     */
    public static LocalDate parse(String input) {
        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDate.from(formatter.parse(input));
            } catch (Exception e) {
                // このフォーマットでは解析できなかった → 次を試す
            }
        }
        throw new IllegalArgumentException("解析できない日付フォーマット: " + input);
    }

    public static void main(String[] args) {
        // サポートするすべてのフォーマットをテスト
        String[] inputs = {
            "2024-04-01",     // ISO 形式
            "2024/04/01",     // スラッシュ区切り
            "20240401",       // 数字8桁
            "Apr 1, 2024",    // 英語表記
            "令和6年4月1日",   // 和暦
        };

        for (String input : inputs) {
            LocalDate date = parse(input);
            System.out.printf("%-20s → %s%n", "\"" + input + "\"", date);
        }
    }
}
