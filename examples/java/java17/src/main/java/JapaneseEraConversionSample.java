import java.time.LocalDate;
import java.time.chrono.JapaneseDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.util.Locale;

public class JapaneseEraConversionSample {

    // Java 17: switch 式（sealed classes / pattern matching preview は除外）
    private static final int REIWA_BASE  = 2018;
    private static final int HEISEI_BASE = 1988;
    private static final int SHOWA_BASE  = 1925;
    private static final int TAISHO_BASE = 1911;

    // ① 西暦 LocalDate → 和暦文字列（Java 8 と同じロジック）
    public static String toWareki(LocalDate date) {
        JapaneseDate jDate = JapaneseDate.from(date);
        DateTimeFormatter eraFmt = DateTimeFormatter.ofPattern("GGGG", Locale.JAPANESE);
        String eraName = eraFmt.format(jDate);
        int year = jDate.get(ChronoField.YEAR_OF_ERA);
        if (year == 1) {
            return eraName + "元年";
        }
        return eraName + year + "年";
    }

    // ② SHR英字略称 → 西暦年（Java 17: switch 式でスッキリ記述）
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
        // Java 17+: switch 式（fall-through なし・値を返せる）
        int base = switch (era) {
            case 'R' -> REIWA_BASE;
            case 'H' -> HEISEI_BASE;
            case 'S' -> SHOWA_BASE;
            case 'T' -> TAISHO_BASE;
            default  -> throw new IllegalArgumentException("不明な元号略称です: " + era);
        };
        return base + japYear;
    }

    // ③ 元号名 → 英字略称のマッピング（switch 式）
    public static String eraNameToAbbrev(String eraName) {
        return switch (eraName) {
            case "令和" -> "R";
            case "平成" -> "H";
            case "昭和" -> "S";
            case "大正" -> "T";
            case "明治" -> "M";
            default -> throw new IllegalArgumentException("不明な元号名: " + eraName);
        };
    }

    public static void main(String[] args) {
        // 西暦 → 和暦
        System.out.println(toWareki(LocalDate.of(2024, 4,  1))); // 令和6年
        System.out.println(toWareki(LocalDate.of(2019, 5,  1))); // 令和元年
        System.out.println(toWareki(LocalDate.of(2019, 4, 30))); // 平成31年
        System.out.println(toWareki(LocalDate.of(1989, 1,  7))); // 昭和64年

        // SHR略称 → 西暦年（switch 式版）
        System.out.println("R6  → " + abbreviationToSeireki("R6")  + "年");
        System.out.println("H30 → " + abbreviationToSeireki("H30") + "年");
        System.out.println("S64 → " + abbreviationToSeireki("S64") + "年");

        // 元号名 → 略称
        System.out.println(eraNameToAbbrev("令和")); // R
        System.out.println(eraNameToAbbrev("平成")); // H
    }
}
