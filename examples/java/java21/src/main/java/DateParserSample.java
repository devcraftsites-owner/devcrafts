import java.time.LocalDate;
import java.time.chrono.JapaneseChronology;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Stream;

public class DateParserSample {

    // ① sealed interface でサポートするフォーマットを型安全に列挙（Java 17+）
    //    Java 21 の pattern matching switch と組み合わせて余分な default 不要になる
    sealed interface DateFormat
            permits DateFormat.Iso, DateFormat.Slash, DateFormat.Compact,
                    DateFormat.English, DateFormat.Japanese {
        record Iso()      implements DateFormat {}
        record Slash()    implements DateFormat {}
        record Compact()  implements DateFormat {}
        record English()  implements DateFormat {}
        record Japanese() implements DateFormat {}
    }

    // ② フォーマット種別 → DateTimeFormatter の変換（pattern matching switch）
    private static DateTimeFormatter toFormatter(DateFormat fmt) {
        return switch (fmt) {
            case DateFormat.Iso      f -> DateTimeFormatter.ISO_LOCAL_DATE;
            case DateFormat.Slash    f -> DateTimeFormatter.ofPattern("yyyy/MM/dd");
            case DateFormat.Compact  f -> DateTimeFormatter.ofPattern("yyyyMMdd");
            case DateFormat.English  f -> DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);
            case DateFormat.Japanese f -> DateTimeFormatter.ofPattern("GGGGy年M月d日")
                    .withChronology(JapaneseChronology.INSTANCE)
                    .withLocale(Locale.JAPANESE);
        };
        // sealed + exhaustive switch のため default は不要
    }

    // ③ 全フォーマットを試してパース（Stream + Optional によるフォールバック）
    public static LocalDate parse(String input) {
        return Stream.<DateFormat>of(
                new DateFormat.Iso(),
                new DateFormat.Slash(),
                new DateFormat.Compact(),
                new DateFormat.English(),
                new DateFormat.Japanese()
            )
            .map(fmt -> tryParse(input, toFormatter(fmt)))
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
