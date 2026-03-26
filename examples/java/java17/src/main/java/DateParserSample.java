import java.time.LocalDate;
import java.time.chrono.JapaneseChronology;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Stream;

public class DateParserSample {

    // フォーマット検出の列挙型（Java 8 の Arrays.asList より Stream.of の方が読みやすい）
    private static final DateTimeFormatter ISO      = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter SLASH    = DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final DateTimeFormatter COMPACT  = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter ENGLISH  = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter JAPANESE = DateTimeFormatter.ofPattern("GGGGy年M月d日")
            .withChronology(JapaneseChronology.INSTANCE)
            .withLocale(Locale.JAPANESE);

    /**
     * 複数フォーマットに対応した日付解析。
     * Stream + Optional を使ってフォールバックチェーンを実装。
     */
    public static LocalDate parse(String input) {
        return Stream.of(ISO, SLASH, COMPACT, ENGLISH, JAPANESE)
                .map(fmt -> tryParse(input, fmt))
                .filter(Optional::isPresent)
                .findFirst()
                .flatMap(opt -> opt)
                .orElseThrow(() -> new IllegalArgumentException("解析できない日付フォーマット: " + input));
    }

    private static Optional<LocalDate> tryParse(String input, DateTimeFormatter fmt) {
        try {
            return Optional.of(LocalDate.from(fmt.parse(input)));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public static void main(String[] args) {
        var inputs = new String[]{
            "2024-04-01",
            "2024/04/01",
            "20240401",
            "Apr 1, 2024",
            "令和6年4月1日",
        };

        for (var input : inputs) {
            var date = parse(input);
            System.out.printf("%-20s → %s%n", "\"" + input + "\"", date);
        }
    }
}
