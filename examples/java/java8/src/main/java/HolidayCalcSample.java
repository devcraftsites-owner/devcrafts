import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

/**
 * 祝日計算サンプル（Java 8+）。
 * 春分の日・秋分の日の近似計算、振替休日、国民の休日を扱います。
 *
 * 注意: 春分・秋分の計算式は 2000〜2099 年に有効な近似式です。
 *       精密な天文計算は不要な場合が多く、この近似式で実用上は十分です。
 */
public class HolidayCalcSample {

    /**
     * 春分の日を計算する（2000〜2099 年の近似式）。
     * ほとんどの年で 3/20 または 3/21 になります。
     */
    public static LocalDate springEquinox(int year) {
        // 国立天文台公表の略算式をもとにした近似
        int day = (int)(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4.0));
        return LocalDate.of(year, 3, day);
    }

    /**
     * 秋分の日を計算する（2000〜2099 年の近似式）。
     * ほとんどの年で 9/22 または 9/23 になります。
     */
    public static LocalDate autumnEquinox(int year) {
        int day = (int)(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4.0));
        return LocalDate.of(year, 9, day);
    }

    /**
     * 振替休日を含む休日セットを計算する。
     * 「日曜が祝日のとき → 翌月曜が振替休日」のルールを繰り返し適用。
     * 振替休日が別の祝日と重なる場合、さらに翌日へ繰り延べされます。
     */
    public static Set<LocalDate> addSubstituteHolidays(Set<LocalDate> holidays) {
        Set<LocalDate> result = new TreeSet<>(holidays);
        boolean changed;
        do {
            changed = false;
            Set<LocalDate> toAdd = new TreeSet<>();
            for (LocalDate holiday : result) {
                if (holiday.getDayOfWeek() == DayOfWeek.SUNDAY) {
                    // 翌月曜から始めて、すでに祝日でない最初の平日を探す
                    LocalDate candidate = holiday.plusDays(1);
                    while (result.contains(candidate) || toAdd.contains(candidate)) {
                        candidate = candidate.plusDays(1);
                    }
                    toAdd.add(candidate);
                    changed = true;
                }
            }
            result.addAll(toAdd);
        } while (changed);
        return result;
    }

    /**
     * 国民の休日を追加する。
     * 「祝日と祝日に挟まれた平日は休日になる」ルールを適用します。
     * 例: 敬老の日（月）・[火曜：国民の休日]・秋分の日（水）
     */
    public static Set<LocalDate> addCitizensHolidays(Set<LocalDate> holidays) {
        Set<LocalDate> result = new TreeSet<>(holidays);
        // ソート済みリストで隣り合う祝日を探索
        LocalDate[] sorted = result.toArray(new LocalDate[0]);
        for (int i = 0; i < sorted.length - 1; i++) {
            LocalDate h1 = sorted[i];
            LocalDate h2 = sorted[i + 1];
            // 2日の差がちょうど 2 なら間に1日ある
            if (h2.equals(h1.plusDays(2))) {
                LocalDate middle = h1.plusDays(1);
                // 日曜でなく、まだ祝日でなければ国民の休日
                if (middle.getDayOfWeek() != DayOfWeek.SUNDAY && !result.contains(middle)) {
                    result.add(middle);
                }
            }
        }
        return result;
    }

    /**
     * 指定年の春分・秋分を加えた祝日セットを構築し、
     * 振替休日・国民の休日を追加して完全な休日セットを返す。
     *
     * @param year     対象年
     * @param base     D-04 等で用意したベースの祝日セット（春分・秋分を除く）
     */
    public static Set<LocalDate> buildFullHolidays(int year, Set<LocalDate> base) {
        Set<LocalDate> holidays = new HashSet<>(base);
        holidays.add(springEquinox(year));
        holidays.add(autumnEquinox(year));
        Set<LocalDate> withSubstitutes = addSubstituteHolidays(holidays);
        return addCitizensHolidays(withSubstitutes);
    }

    public static void main(String[] args) {
        // --- 春分・秋分の計算例 ---
        for (int y = 2024; y <= 2027; y++) {
            System.out.printf("%d年: 春分=%s  秋分=%s%n", y, springEquinox(y), autumnEquinox(y));
        }

        // --- 2026年で国民の休日が発生するケースを確認 ---
        // 敬老の日（9/21 月）と秋分の日（9/23 水）に挟まれた 9/22（火）が国民の休日になる
        System.out.println("\n--- 2026年9月の祝日 ---");
        // D-04 方式で用意したベース祝日（敬老の日を含む）
        Set<LocalDate> base2026 = new HashSet<>(Arrays.asList(
            LocalDate.of(2026, 1, 1),   // 元日
            LocalDate.of(2026, 1, 12),  // 成人の日（第2月曜）
            LocalDate.of(2026, 2, 11),  // 建国記念の日
            LocalDate.of(2026, 2, 23),  // 天皇誕生日
            LocalDate.of(2026, 4, 29),  // 昭和の日
            LocalDate.of(2026, 5, 3),   // 憲法記念日
            LocalDate.of(2026, 5, 4),   // みどりの日
            LocalDate.of(2026, 5, 5),   // こどもの日
            LocalDate.of(2026, 7, 20),  // 海の日（第3月曜）
            LocalDate.of(2026, 8, 11),  // 山の日
            LocalDate.of(2026, 9, 21),  // 敬老の日（第3月曜）
            LocalDate.of(2026, 10, 12), // スポーツの日（第2月曜）
            LocalDate.of(2026, 11, 3),  // 文化の日
            LocalDate.of(2026, 11, 23)  // 勤労感謝の日
        ));

        Set<LocalDate> full2026 = buildFullHolidays(2026, base2026);

        // 9月の祝日だけ表示
        for (LocalDate d : new TreeSet<>(full2026)) {
            if (d.getMonthValue() == 9) {
                System.out.println(d + " (" + d.getDayOfWeek() + ")");
            }
        }
        // 期待出力:
        //   2026-09-21 (MONDAY)   ← 敬老の日
        //   2026-09-22 (TUESDAY)  ← 国民の休日
        //   2026-09-23 (WEDNESDAY) ← 秋分の日
    }
}
