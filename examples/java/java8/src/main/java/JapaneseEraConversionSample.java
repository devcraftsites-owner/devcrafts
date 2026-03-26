import java.time.LocalDate;
import java.time.chrono.JapaneseDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.util.Locale;

public class JapaneseEraConversionSample {

    // 元号略称の開始オフセット（略称の年数を足すと西暦年になる）
    private static final int REIWA_BASE  = 2018; // R1 = 2019年
    private static final int HEISEI_BASE = 1988; // H1 = 1989年
    private static final int SHOWA_BASE  = 1925; // S1 = 1926年
    private static final int TAISHO_BASE = 1911; // T1 = 1912年

    // ① 西暦 LocalDate → 和暦文字列（JapaneseDate + DateTimeFormatter 方式）
    //    元号の変更日（月・日レベル）を正確に処理できる
    public static String toWareki(LocalDate date) {
        JapaneseDate jDate = JapaneseDate.from(date);
        // GGGG + Locale.JAPANESE で元号の正式名称（令和/平成/昭和...）を取得
        DateTimeFormatter eraFmt = DateTimeFormatter.ofPattern("GGGG", Locale.JAPANESE);
        String eraName = eraFmt.format(jDate);
        int year = jDate.get(ChronoField.YEAR_OF_ERA);
        if (year == 1) {
            return eraName + "元年";
        }
        return eraName + year + "年";
    }

    // ② SHR英字略称 → 西暦年（年だけを変換する簡易方式）
    //    例: "R6" → 2024,  "H30" → 2018,  "S64" → 1989,  "T1" → 1912
    //    ※ 年レベルの変換のみ。月・日をまたぐ正確な境界判定は JapaneseDate 方式を使うこと
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
        if (era == 'R') {
            return REIWA_BASE + japYear;
        }
        if (era == 'H') {
            return HEISEI_BASE + japYear;
        }
        if (era == 'S') {
            return SHOWA_BASE + japYear;
        }
        if (era == 'T') {
            return TAISHO_BASE + japYear;
        }
        throw new IllegalArgumentException("不明な元号略称です: " + era);
    }

    public static void main(String[] args) {
        // ① 西暦 → 和暦（元号変更日をまたぐ境界も正確に処理）
        System.out.println(toWareki(LocalDate.of(2024, 4,  1))); // 令和6年
        System.out.println(toWareki(LocalDate.of(2019, 5,  1))); // 令和元年
        System.out.println(toWareki(LocalDate.of(2019, 4, 30))); // 平成31年
        System.out.println(toWareki(LocalDate.of(1989, 1,  8))); // 平成元年
        System.out.println(toWareki(LocalDate.of(1989, 1,  7))); // 昭和64年

        // ② SHR略称 → 西暦年（年レベルのみ）
        System.out.println("R6  → " + abbreviationToSeireki("R6")  + "年"); // 2024年
        System.out.println("H30 → " + abbreviationToSeireki("H30") + "年"); // 2018年
        System.out.println("S64 → " + abbreviationToSeireki("S64") + "年"); // 1989年
        System.out.println("T1  → " + abbreviationToSeireki("T1")  + "年"); // 1912年
    }
}
