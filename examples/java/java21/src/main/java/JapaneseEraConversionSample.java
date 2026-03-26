import java.time.LocalDate;
import java.time.chrono.JapaneseDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.util.Locale;

public class JapaneseEraConversionSample {

    private static final int REIWA_BASE  = 2018;
    private static final int HEISEI_BASE = 1988;
    private static final int SHOWA_BASE  = 1925;
    private static final int TAISHO_BASE = 1911;

    // ① 西暦 LocalDate → 和暦文字列
    public static String toWareki(LocalDate date) {
        JapaneseDate jDate = JapaneseDate.from(date);
        var eraFmt = DateTimeFormatter.ofPattern("GGGG", Locale.JAPANESE);
        String eraName = eraFmt.format(jDate);
        int year = jDate.get(ChronoField.YEAR_OF_ERA);
        return (year == 1) ? eraName + "元年" : eraName + year + "年";
    }

    // ② SHR英字略称 → 西暦年（Java 21: switch 式 + null チェック in switch）
    public static int abbreviationToSeireki(String abbrev) {
        if (abbrev == null || abbrev.length() < 2) {
            throw new IllegalArgumentException("不正な元号略称です: " + abbrev);
        }
        char era = Character.toUpperCase(abbrev.charAt(0));
        int japYear;
        try {
            japYear = Integer.parseInt(abbrev.substring(1));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("年数が数値ではありません: " + abbrev);
        }
        int base = switch (era) {
            case 'R' -> REIWA_BASE;
            case 'H' -> HEISEI_BASE;
            case 'S' -> SHOWA_BASE;
            case 'T' -> TAISHO_BASE;
            default  -> throw new IllegalArgumentException("不明な元号略称です: " + era);
        };
        return base + japYear;
    }

    // ③ Java 21: sealed interface + pattern matching switch で元号を型安全に表現
    sealed interface Era permits Era.Reiwa, Era.Heisei, Era.Showa, Era.Taisho {
        record Reiwa(int year)  implements Era {}
        record Heisei(int year) implements Era {}
        record Showa(int year)  implements Era {}
        record Taisho(int year) implements Era {}
    }

    // LocalDate → sealed Era 型に変換
    public static Era toEra(LocalDate date) {
        JapaneseDate jDate = JapaneseDate.from(date);
        var eraFmt = DateTimeFormatter.ofPattern("G", Locale.JAPANESE);
        String shortEra = eraFmt.format(jDate);
        int year = jDate.get(ChronoField.YEAR_OF_ERA);
        return switch (shortEra) {
            case "令"  -> new Era.Reiwa(year);
            case "平"  -> new Era.Heisei(year);
            case "昭"  -> new Era.Showa(year);
            case "大"  -> new Era.Taisho(year);
            default   -> throw new IllegalArgumentException("不明な元号: " + shortEra);
        };
    }

    // sealed Era → 表示文字列（pattern matching switch）
    public static String eraToString(Era era) {
        return switch (era) {
            case Era.Reiwa  r  -> "令和" + (r.year() == 1 ? "元" : r.year()) + "年";
            case Era.Heisei h  -> "平成" + (h.year() == 1 ? "元" : h.year()) + "年";
            case Era.Showa  s  -> "昭和" + (s.year() == 1 ? "元" : s.year()) + "年";
            case Era.Taisho t  -> "大正" + (t.year() == 1 ? "元" : t.year()) + "年";
        };
    }

    public static void main(String[] args) {
        // 西暦 → 和暦
        System.out.println(toWareki(LocalDate.of(2024, 4,  1))); // 令和6年
        System.out.println(toWareki(LocalDate.of(2019, 5,  1))); // 令和元年
        System.out.println(toWareki(LocalDate.of(2019, 4, 30))); // 平成31年
        System.out.println(toWareki(LocalDate.of(1989, 1,  7))); // 昭和64年

        // SHR略称 → 西暦年
        System.out.println("R6  → " + abbreviationToSeireki("R6")  + "年");
        System.out.println("H30 → " + abbreviationToSeireki("H30") + "年");

        // sealed Era + pattern matching switch
        Era era = toEra(LocalDate.of(2024, 4, 1));
        System.out.println(eraToString(era)); // 令和6年

        Era heisei = toEra(LocalDate.of(1989, 1, 8));
        System.out.println(eraToString(heisei)); // 平成元年
    }
}
