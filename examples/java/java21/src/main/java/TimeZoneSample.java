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

        // ③ UTC → JST 変換（DB取得値を表示用に変換）
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

        // ⑥ DB保存は UTC、表示は JST パターン
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
        String dbValue = now.withZoneSameInstant(ZoneId.of("UTC"))
                .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        System.out.println("DB保存値(UTC): " + dbValue);

        ZonedDateTime fromDb = ZonedDateTime.parse(dbValue);
        String display = fromDb.withZoneSameInstant(ZoneId.of("Asia/Tokyo"))
                .format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm"));
        System.out.println("表示(JST): " + display);

        // ⑦ Java 21: switch 式でタイムゾーン別の表示フォーマットを切り替える
        String zone = "Asia/Tokyo";
        String label = switch (zone) {
            case "Asia/Tokyo" -> "日本標準時（JST）";
            case "UTC" -> "協定世界時（UTC）";
            case "America/New_York" -> "東部時間（ET）";
            default -> zone;
        };
        System.out.println("タイムゾーン説明: " + label);
    }
}
