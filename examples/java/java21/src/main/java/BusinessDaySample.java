import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Set;
import java.util.stream.Stream;

public class BusinessDaySample {

    public static boolean isBusinessDay(LocalDate date, Set<LocalDate> holidays) {
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return false;
        }
        return !holidays.contains(date);
    }

    /**
     * N営業日後の日付を返す
     */
    public static LocalDate addBusinessDays(LocalDate from, int n, Set<LocalDate> holidays) {
        return Stream.iterate(from.plusDays(1), d -> d.plusDays(1))
                .filter(d -> isBusinessDay(d, holidays))
                .limit(n)
                .reduce((first, last) -> last)
                .orElseThrow();
    }

    /**
     * 月の第N営業日を返す
     */
    public static LocalDate nthBusinessDayOfMonth(
            YearMonth yearMonth, int n, Set<LocalDate> holidays) {
        return yearMonth.atDay(1)
                .datesUntil(yearMonth.atEndOfMonth().plusDays(1))
                .filter(d -> isBusinessDay(d, holidays))
                .skip(n - 1)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        yearMonth + " に第" + n + "営業日が存在しません"));
    }

    /**
     * 月末営業日を返す
     */
    public static LocalDate lastBusinessDayOfMonth(
            YearMonth yearMonth, Set<LocalDate> holidays) {
        LocalDate end = yearMonth.atEndOfMonth();
        return Stream.iterate(end, d -> d.minusDays(1))
                .filter(d -> isBusinessDay(d, holidays))
                .findFirst()
                .orElseThrow();
    }

    public static void main(String[] args) {

        Set<LocalDate> holidays2024 = Set.of(
                LocalDate.of(2024, 1, 1),
                LocalDate.of(2024, 1, 8),
                LocalDate.of(2024, 2, 11),
                LocalDate.of(2024, 2, 12),
                LocalDate.of(2024, 2, 23),
                LocalDate.of(2024, 3, 20),
                LocalDate.of(2024, 4, 29),
                LocalDate.of(2024, 5, 3),
                LocalDate.of(2024, 5, 4),
                LocalDate.of(2024, 5, 5),
                LocalDate.of(2024, 5, 6),
                LocalDate.of(2024, 7, 15),
                LocalDate.of(2024, 8, 11),
                LocalDate.of(2024, 8, 12),
                LocalDate.of(2024, 9, 16),
                LocalDate.of(2024, 9, 22),
                LocalDate.of(2024, 10, 14),
                LocalDate.of(2024, 11, 3),
                LocalDate.of(2024, 11, 4),
                LocalDate.of(2024, 11, 23)
        );

        // ① N営業日後
        LocalDate base = LocalDate.of(2024, 4, 26);
        System.out.println(base + " の 3営業日後: " + addBusinessDays(base, 3, holidays2024));

        // ② 月の第1営業日
        System.out.println("2024年5月の第1営業日: "
                + nthBusinessDayOfMonth(YearMonth.of(2024, 5), 1, holidays2024));

        // ③ 月末営業日
        System.out.println("2024年11月の月末営業日: "
                + lastBusinessDayOfMonth(YearMonth.of(2024, 11), holidays2024));

        // ④ Java 21: switch 式で営業日かどうかのメッセージを生成
        LocalDate check = LocalDate.of(2024, 5, 3); // 憲法記念日
        String msg = switch (check.getDayOfWeek()) {
            case SATURDAY, SUNDAY -> "週末";
            default -> holidays2024.contains(check) ? "祝日" : "営業日";
        };
        System.out.println(check + ": " + msg); // 祝日

        // ⑤ 当月の全営業日をリスト表示
        YearMonth apr2024 = YearMonth.of(2024, 4);
        System.out.println("2024年4月の営業日数: " + (int) apr2024.atDay(1)
                .datesUntil(apr2024.atEndOfMonth().plusDays(1))
                .filter(d -> isBusinessDay(d, holidays2024))
                .count());
    }
}
