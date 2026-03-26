import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class BusinessDaySample {

    /**
     * 指定日が営業日（平日かつ祝日でない）かどうかを判定する
     */
    public static boolean isBusinessDay(LocalDate date, Set<LocalDate> holidays) {
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return false;
        }
        return !holidays.contains(date);
    }

    /**
     * N営業日後の日付を返す
     *
     * @param from     起算日（この日は含まない）
     * @param n        営業日数（正の整数）
     * @param holidays 祝日セット
     * @return N営業日後の LocalDate
     */
    public static LocalDate addBusinessDays(LocalDate from, int n, Set<LocalDate> holidays) {
        LocalDate date = from;
        int count = 0;
        while (count < n) {
            date = date.plusDays(1);
            if (isBusinessDay(date, holidays)) {
                count++;
            }
        }
        return date;
    }

    /**
     * 月の第N営業日を返す
     *
     * @param yearMonth 対象年月
     * @param n         何番目の営業日か（1以上）
     * @param holidays  祝日セット
     * @return 第N営業日の LocalDate
     */
    public static LocalDate nthBusinessDayOfMonth(
            YearMonth yearMonth, int n, Set<LocalDate> holidays) {
        LocalDate date = yearMonth.atDay(1);
        int count = 0;
        while (true) {
            if (isBusinessDay(date, holidays)) {
                count++;
                if (count == n) {
                    return date;
                }
            }
            date = date.plusDays(1);
        }
    }

    /**
     * 月末営業日を返す
     *
     * @param yearMonth 対象年月
     * @param holidays  祝日セット
     * @return 月末営業日の LocalDate
     */
    public static LocalDate lastBusinessDayOfMonth(
            YearMonth yearMonth, Set<LocalDate> holidays) {
        LocalDate date = yearMonth.atEndOfMonth();
        while (!isBusinessDay(date, holidays)) {
            date = date.minusDays(1);
        }
        return date;
    }

    public static void main(String[] args) {

        // 2024年の主要祝日（Java 8: Arrays.asList で HashSet を作成）
        Set<LocalDate> holidays2024 = new HashSet<>(Arrays.asList(
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
        ));

        // ① N営業日後
        LocalDate base = LocalDate.of(2024, 4, 26); // 金曜日
        LocalDate result1 = addBusinessDays(base, 3, holidays2024);
        System.out.println(base + " の 3営業日後: " + result1);
        // 4/27(土)、4/28(日)、4/29(昭和の日) をスキップ → 5/2(木)

        // ② 月の第1営業日
        YearMonth may2024 = YearMonth.of(2024, 5);
        LocalDate firstBiz = nthBusinessDayOfMonth(may2024, 1, holidays2024);
        System.out.println("2024年5月の第1営業日: " + firstBiz);
        // 5/1(水) は祝日でない → 5/1

        // ③ 月末営業日
        YearMonth nov2024 = YearMonth.of(2024, 11);
        LocalDate lastBiz = lastBusinessDayOfMonth(nov2024, holidays2024);
        System.out.println("2024年11月の月末営業日: " + lastBiz);
        // 11/30(土) は土曜 → 11/29(金)

        // ④ 営業日判定の確認
        System.out.println(LocalDate.of(2024, 5, 1) + " 営業日: "
                + isBusinessDay(LocalDate.of(2024, 5, 1), holidays2024)); // true
        System.out.println(LocalDate.of(2024, 5, 3) + " 営業日: "
                + isBusinessDay(LocalDate.of(2024, 5, 3), holidays2024)); // false（憲法記念日）
    }
}
