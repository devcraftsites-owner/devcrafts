import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * 祝日計算サンプル（Java 17+）。
 * Stream API・var・テキストブロックを活用した簡潔な実装。
 */
public class HolidayCalcSample {

    public static LocalDate springEquinox(int year) {
        int day = (int)(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4.0));
        return LocalDate.of(year, 3, day);
    }

    public static LocalDate autumnEquinox(int year) {
        int day = (int)(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4.0));
        return LocalDate.of(year, 9, day);
    }

    /**
     * 振替休日を追加する。
     * 日曜日が祝日のとき、翌月曜（または翌日が祝日であればさらに翌日）を振替休日とする。
     */
    public static Set<LocalDate> addSubstituteHolidays(Set<LocalDate> holidays) {
        var result = new TreeSet<>(holidays);
        boolean changed;
        do {
            changed = false;
            var toAdd = new TreeSet<LocalDate>();
            for (var holiday : result) {
                if (holiday.getDayOfWeek() == DayOfWeek.SUNDAY) {
                    var candidate = holiday.plusDays(1);
                    while (result.contains(candidate) || toAdd.contains(candidate)) {
                        candidate = candidate.plusDays(1);
                    }
                    toAdd.add(candidate);
                    changed = true;
                }
            }
            result.addAll(toAdd);
        } while (changed);
        return Set.copyOf(result); // Java 10+: イミュータブルな Set を返す
    }

    /**
     * 国民の休日を追加する。Stream API で隣り合う祝日ペアを探索。
     */
    public static Set<LocalDate> addCitizensHolidays(Set<LocalDate> holidays) {
        var sorted = new TreeSet<>(holidays).stream().toList(); // Java 16+: toList()
        var toAdd = new HashSet<LocalDate>();

        for (int i = 0; i < sorted.size() - 1; i++) {
            var h1 = sorted.get(i);
            var h2 = sorted.get(i + 1);
            if (h2.equals(h1.plusDays(2))) {
                var middle = h1.plusDays(1);
                if (middle.getDayOfWeek() != DayOfWeek.SUNDAY && !holidays.contains(middle)) {
                    toAdd.add(middle);
                }
            }
        }

        if (toAdd.isEmpty()) {
            return holidays;
        }
        var result = new HashSet<>(holidays);
        result.addAll(toAdd);
        return Set.copyOf(result);
    }

    public static Set<LocalDate> buildFullHolidays(int year, Set<LocalDate> base) {
        var holidays = new HashSet<>(base);
        holidays.add(springEquinox(year));
        holidays.add(autumnEquinox(year));
        return addCitizensHolidays(addSubstituteHolidays(holidays));
    }

    public static void main(String[] args) {
        // 春分・秋分の計算
        for (var y = 2024; y <= 2027; y++) {
            System.out.printf("%d年: 春分=%s  秋分=%s%n", y, springEquinox(y), autumnEquinox(y));
        }

        // 2026年9月の国民の休日
        System.out.println("\n--- 2026年9月の祝日 ---");
        var base2026 = Set.of(
            LocalDate.of(2026, 1, 1),
            LocalDate.of(2026, 1, 12),
            LocalDate.of(2026, 2, 11),
            LocalDate.of(2026, 2, 23),
            LocalDate.of(2026, 4, 29),
            LocalDate.of(2026, 5, 3),
            LocalDate.of(2026, 5, 4),
            LocalDate.of(2026, 5, 5),
            LocalDate.of(2026, 7, 20),
            LocalDate.of(2026, 8, 11),
            LocalDate.of(2026, 9, 21),  // 敬老の日（第3月曜）
            LocalDate.of(2026, 10, 12),
            LocalDate.of(2026, 11, 3),
            LocalDate.of(2026, 11, 23)
        );

        new TreeSet<>(buildFullHolidays(2026, base2026)).stream()
            .filter(d -> d.getMonthValue() == 9)
            .forEach(d -> System.out.println(d + " (" + d.getDayOfWeek() + ")"));
        // 2026-09-21 (MONDAY)    ← 敬老の日
        // 2026-09-22 (TUESDAY)   ← 国民の休日
        // 2026-09-23 (WEDNESDAY) ← 秋分の日
    }
}
