import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

public class DateFormatSample {

    // DateTimeFormatter はスレッドセーフなため、static final フィールドで使い回せる
    private static final DateTimeFormatter DTF_YMD =
            DateTimeFormatter.ofPattern("yyyy/MM/dd");

    public static void main(String[] args) {

        // ① DateTimeFormatter でフォーマット（LocalDate → 文字列）
        LocalDate localDate = LocalDate.of(2024, 4, 1);
        String formatted = localDate.format(DTF_YMD);
        System.out.println("DateTimeFormatter フォーマット: " + formatted);

        // ② DateTimeFormatter でパース（文字列 → LocalDate）
        try {
            LocalDate parsed = LocalDate.parse("2024/04/01", DTF_YMD);
            System.out.println("DateTimeFormatter パース: " + parsed);
        } catch (DateTimeParseException e) {
            System.out.println("パースエラー: " + e.getMessage());
        }

        // ③ 曜日・時刻を含む日本語フォーマット
        DateTimeFormatter dtfFull =
                DateTimeFormatter.ofPattern("yyyy年MM月dd日(EEE) HH:mm", Locale.JAPANESE);
        LocalDateTime now = LocalDateTime.now();
        System.out.println("日本語フォーマット: " + now.format(dtfFull));

        // ④ ISO 標準フォーマット（DateTimeFormatter.ISO_LOCAL_DATE）
        String isoFormatted = localDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
        System.out.println("ISO フォーマット: " + isoFormatted); // 2024-04-01

        // ⑤ Java 17: switch 式（preview）は関係ないが、テキストブロックでフォーマット文字列を整理できる
        // Java 15+ のテキストブロックでパターン文字列を読みやすくする例
        String pattern = """
                yyyy年MM月dd日(EEE) HH:mm
                """.strip();
        DateTimeFormatter dtfTextBlock = DateTimeFormatter.ofPattern(pattern, Locale.JAPANESE); // Java 17+
        System.out.println("テキストブロックで定義したフォーマット: " + now.format(dtfTextBlock));
    }
}
