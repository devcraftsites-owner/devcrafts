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

        // ④ Java 21: switch 式でフォーマットを切り替える例（パターンマッチング）
        Object dateObj = localDate;
        String result = switch (dateObj) { // Java 21: パターンマッチング for switch
            case LocalDate d -> d.format(DTF_YMD);
            case LocalDateTime dt -> dt.format(dtfFull);
            default -> dateObj.toString();
        };
        System.out.println("パターンマッチング結果: " + result);

        // ⑤ ISO 標準フォーマット（DateTimeFormatter.ISO_LOCAL_DATE）
        String isoFormatted = localDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
        System.out.println("ISO フォーマット: " + isoFormatted); // 2024-04-01
    }
}
