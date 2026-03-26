import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

/**
 * 祝日計算サンプル（Java 21+）。
 * sealed interface + パターンマッチングで休日の種別を型安全に表現。
 */
public class HolidayCalcSample {

    /** 休日の種別を sealed interface で表現（Java 21+） */
    sealed interface HolidayType {
        record Fixed(String name)      implements HolidayType {}
        record Equinox(String name)    implements HolidayType {}
        record Substitute()            implements HolidayType {}
        record CitizensHoliday()       implements HolidayType {}
    }

    public static LocalDate springEquinox(int year) {
        int day = (int)(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4.0));
        return LocalDate.of(year, 3, day);
    }

    public static LocalDate autumnEquinox(int year) {
        int day = (int)(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4.0));
        return LocalDate.of(year, 9, day);
    }

    /**
     * 振替休日を追加。
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
        return Set.copyOf(result);
    }

    /**
     * 国民の休日を追加。
     */
    public static Set<LocalDate> addCitizensHolidays(Set<LocalDate> holidays) {
        var sorted = new TreeSet<>(holidays).stream().toList();
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

    /**
     * パターンマッチングで休日種別の説明を返す（Java 21+）。
     */
    public static String describeHolidayType(HolidayType type) {
        return switch (type) {
            case HolidayType.Fixed(var name)    -> "固定祝日: " + name;
            case HolidayType.Equinox(var name)  -> "天文計算による祝日: " + name;
            case HolidayType.Substitute()       -> "振替休日";
            case HolidayType.CitizensHoliday()  -> "国民の休日";
        };
    }

    public static void main(String[] args) {
        // 春分・秋分の計算
        for (int y = 2024; y <= 2027; y++) {
            System.out.printf("%d年: 春分=%s  秋分=%s%n", y, springEquinox(y), autumnEquinox(y));
        }

        // パターンマッチングで休日種別を説明
        System.out.println("\n--- 休日種別の説明 ---");
        var types = new HolidayType[]{
            new HolidayType.Fixed("元日"),
            new HolidayType.Equinox("春分の日"),
            new HolidayType.Substitute(),
            new HolidayType.CitizensHoliday()
        };
        for (var t : types) {
            System.out.println(describeHolidayType(t));
        }

        // 2026年9月の祝日（国民の休日が発生するケース）
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
            LocalDate.of(2026, 9, 21),
            LocalDate.of(2026, 10, 12),
            LocalDate.of(2026, 11, 3),
            LocalDate.of(2026, 11, 23)
        );

        new TreeSet<>(buildFullHolidays(2026, base2026)).stream()
            .filter(d -> d.getMonth() == Month.SEPTEMBER)
            .forEach(d -> System.out.println(d + " (" + d.getDayOfWeek() + ")"));
    }
}
