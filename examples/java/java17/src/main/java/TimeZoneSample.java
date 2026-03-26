import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class TimeZoneSample {

    public static void main(String[] args) {

        // ① ZonedDateTime: タイムゾーンルール（DST対応）付きの日時
        ZonedDateTime jstNow = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
        System.out.println("JST 現在時刻: " + jstNow);

        // ② JST → UTC 変換
        ZonedDateTime utcNow = jstNow.withZoneSameInstant(ZoneId.of("UTC"));
        System.out.println("UTC 変換後: " + utcNow);

        // ③ UTC → JST 変換
        ZonedDateTime utcTime = ZonedDateTime.of(
                LocalDateTime.of(2024, 4, 1, 12, 0, 0),
                ZoneId.of("UTC"));
        ZonedDateTime jstTime = utcTime.withZoneSameInstant(ZoneId.of("Asia/Tokyo"));
        System.out.println("UTC 12:00 → JST: " + jstTime.toLocalDateTime()); // 21:00

        // ④ OffsetDateTime: 固定オフセット（DSTの影響を受けない）
        OffsetDateTime jstOffset = OffsetDateTime.now(ZoneOffset.of("+09:00"));
        System.out.println("OffsetDateTime(JST): " + jstOffset);

        // ⑤ 夏時間（DST）のある地域での注意点
        ZonedDateTime nyWinter = ZonedDateTime.of(
                LocalDateTime.of(2024, 1, 15, 12, 0),
                ZoneId.of("America/New_York"));
        ZonedDateTime nySummer = ZonedDateTime.of(
                LocalDateTime.of(2024, 7, 15, 12, 0),
                ZoneId.of("America/New_York"));
        System.out.println("NY 冬(EST): " + nyWinter.getOffset()); // -05:00
        System.out.println("NY 夏(EDT): " + nySummer.getOffset()); // -04:00

        // ⑥ ISO 8601 フォーマットで出力
        System.out.println("ISO形式: " + jstOffset.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));

        // ⑦ DB保存は UTC、表示は JST に変換するパターン
        // Java 17: switch 式で出力フォーマットを切り替える例
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
        String dbValue = now.withZoneSameInstant(ZoneId.of("UTC"))
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        System.out.println("DB保存値(UTC): " + dbValue);

        ZonedDateTime fromDb = ZonedDateTime.parse(dbValue);
        String display = fromDb.withZoneSameInstant(ZoneId.of("Asia/Tokyo"))
                .format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm"));
        System.out.println("表示(JST): " + display);
    }
}
