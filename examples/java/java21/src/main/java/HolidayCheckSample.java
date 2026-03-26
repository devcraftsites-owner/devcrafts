import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

public class HolidayCheckSample {

    // Java 16+: record で祝日情報を表現
    record Holiday(LocalDate date, String name) {} // Java 16+

    /**
     * 指定日が祝日かどうかを判定する
     *
     * @param date     判定する日付
     * @param holidays 祝日のセット（事前に整形済みのデータを渡す）
     * @return 祝日の場合 true
     */
    public static boolean isHoliday(LocalDate date, Set<LocalDate> holidays) {
        return holidays.contains(date);
    }

    /**
     * 指定日が休日（土曜・日曜・祝日）かどうかを判定する
     *
     * @param date     判定する日付
     * @param holidays 祝日のセット
     * @return 休日の場合 true
     */
    public static boolean isNonWorkingDay(LocalDate date, Set<LocalDate> holidays) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return true;
        }
        return isHoliday(date, holidays);
    }

    public static void main(String[] args) {

        // Java 9+ の Set.of() で簡潔に祝日データを初期化（イミュータブル）
        Set<LocalDate> holidays2024 = Set.of(
                LocalDate.of(2024, 1, 1),   // 元日
                LocalDate.of(2024, 1, 8),   // 成人の日
                LocalDate.of(2024, 2, 11),  // 建国記念の日
                LocalDate.of(2024, 2, 12),  // 振替休日
                LocalDate.of(2024, 2, 23),  // 天皇誕生日
                LocalDate.of(2024, 3, 20),  // 春分の日
                LocalDate.of(2024, 4, 29),  // 昭和の日
                LocalDate.of(2024, 5, 3),   // 憲法記念日
                LocalDate.of(2024, 5, 4),   // みどりの日
                LocalDate.of(2024, 5, 5),   // こどもの日
                LocalDate.of(2024, 5, 6),   // 振替休日
                LocalDate.of(2024, 7, 15),  // 海の日
                LocalDate.of(2024, 8, 11),  // 山の日
                LocalDate.of(2024, 8, 12),  // 振替休日
                LocalDate.of(2024, 9, 16),  // 敬老の日
                LocalDate.of(2024, 9, 22),  // 秋分の日
                LocalDate.of(2024, 10, 14), // スポーツの日
                LocalDate.of(2024, 11, 3),  // 文化の日
                LocalDate.of(2024, 11, 4),  // 振替休日
                LocalDate.of(2024, 11, 23)  // 勤労感謝の日
        );

        // 判定サンプル
        LocalDate holiday = LocalDate.of(2024, 1, 1);   // 元日（祝日）
        LocalDate weekday = LocalDate.of(2024, 1, 4);   // 平日
        LocalDate saturday = LocalDate.of(2024, 1, 6);  // 土曜日

        System.out.println(holiday + " 祝日: " + isHoliday(holiday, holidays2024));
        System.out.println(weekday + " 祝日: " + isHoliday(weekday, holidays2024));
        System.out.println(saturday + " 休日: " + isNonWorkingDay(saturday, holidays2024));
        System.out.println(weekday + " 休日: " + isNonWorkingDay(weekday, holidays2024));

        // Java 21: record を使って祝日情報を保持する例
        var newYear = new Holiday(LocalDate.of(2024, 1, 1), "元日");
        System.out.println("Holiday record: " + newYear.date() + " " + newYear.name());

        // Java 21: パターンマッチングで曜日別メッセージを生成
        LocalDate checkDate = LocalDate.of(2024, 5, 3);
        String message = switch (checkDate.getDayOfWeek()) {
            case SATURDAY, SUNDAY -> "週末です";
            default -> isHoliday(checkDate, holidays2024) ? "祝日です" : "平日です";
        };
        System.out.println(checkDate + ": " + message);
    }
}
