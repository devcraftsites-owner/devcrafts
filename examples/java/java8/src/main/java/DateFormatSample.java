import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.Locale;

public class DateFormatSample {

    // SimpleDateFormat はスレッドアンセーフなため、ThreadLocal で1スレッド1インスタンスを保証する
    private static final ThreadLocal<SimpleDateFormat> SDF_YMD =
            ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy/MM/dd"));

    // DateTimeFormatter はスレッドセーフなため、static final フィールドで使い回せる
    private static final DateTimeFormatter DTF_YMD =
            DateTimeFormatter.ofPattern("yyyy/MM/dd");

    public static void main(String[] args) {

        // ① SimpleDateFormat でフォーマット（日付 → 文字列）
        Date date = new Date();
        String formatted = SDF_YMD.get().format(date);
        System.out.println("SimpleDateFormat フォーマット: " + formatted);

        // ② SimpleDateFormat でパース（文字列 → 日付）
        try {
            Date parsed = SDF_YMD.get().parse("2024/04/01");
            System.out.println("SimpleDateFormat パース: " + parsed);
        } catch (ParseException e) {
            System.out.println("パースエラー: " + e.getMessage());
        }

        // ③ DateTimeFormatter でフォーマット（LocalDate → 文字列）
        LocalDate localDate = LocalDate.of(2024, 4, 1);
        String dtfFormatted = localDate.format(DTF_YMD);
        System.out.println("DateTimeFormatter フォーマット: " + dtfFormatted);

        // ④ DateTimeFormatter でパース（文字列 → LocalDate）
        try {
            LocalDate dtfParsed = LocalDate.parse("2024/04/01", DTF_YMD);
            System.out.println("DateTimeFormatter パース: " + dtfParsed);
        } catch (DateTimeParseException e) {
            System.out.println("パースエラー: " + e.getMessage());
        }

        // ⑤ 曜日・時刻を含むフォーマット（日本語ロケール指定）
        DateTimeFormatter dtfFull =
                DateTimeFormatter.ofPattern("yyyy年MM月dd日(EEE) HH:mm", Locale.JAPANESE);
        LocalDateTime now = LocalDateTime.now();
        System.out.println("日本語フォーマット: " + now.format(dtfFull));
    }
}
