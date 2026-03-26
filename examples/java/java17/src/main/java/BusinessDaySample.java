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
        // Java 9+: Stream.iterate で日付を無限に生成し、営業日のみフィルタして n 番目を取得
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
                .datesUntil(yearMonth.atEndOfMonth().plusDays(1)) // Java 9+: datesUntil
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

        // Java 9+ の Set.of() で祝日データを初期化
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

        // ① N営業日後（Stream.iterate 版）
        LocalDate base = LocalDate.of(2024, 4, 26);
        LocalDate result1 = addBusinessDays(base, 3, holidays2024);
        System.out.println(base + " の 3営業日後: " + result1);

        // ② 月の第1営業日（datesUntil 版）
        YearMonth may2024 = YearMonth.of(2024, 5);
        LocalDate firstBiz = nthBusinessDayOfMonth(may2024, 1, holidays2024);
        System.out.println("2024年5月の第1営業日: " + firstBiz);

        // ③ 月末営業日
        YearMonth nov2024 = YearMonth.of(2024, 11);
        LocalDate lastBiz = lastBusinessDayOfMonth(nov2024, holidays2024);
        System.out.println("2024年11月の月末営業日: " + lastBiz);

        // ④ 営業日判定
        System.out.println(LocalDate.of(2024, 5, 1) + " 営業日: "
                + isBusinessDay(LocalDate.of(2024, 5, 1), holidays2024)); // true
        System.out.println(LocalDate.of(2024, 5, 3) + " 営業日: "
                + isBusinessDay(LocalDate.of(2024, 5, 3), holidays2024)); // false
    }
}
