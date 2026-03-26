import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

/**
 * 固定長ファイルの読込・書込サンプル（Java 21+）。
 * sealed interface でフィールド定義を型安全に管理し、
 * パターンマッチングで柔軟な処理を実現。
 *
 * レコード形式（1行48文字）:
 *   [0-3]  社員番号   4桁  右詰め・スペース埋め
 *   [4-23] 氏名      20桁  左詰め・スペース埋め
 *   [24-31] 部署コード  8桁  左詰め・スペース埋め
 *   [32-39] 給与      8桁  右詰め・ゼロ埋め
 *   [40-47] 入社日    8桁  yyyyMMdd 形式
 */
public class FixedLengthSample {

    record EmployeeRecord(int id, String name, String department, int salary, String joinDate) {}

    /** フィールド定義を sealed interface + record で表現（Java 21+） */
    sealed interface FieldDef {
        /** 文字列をそのまま固定幅に整形するフィールド */
        record TextLeft(int start, int end)    implements FieldDef {}
        /** 整数を右詰めゼロ埋めで整形するフィールド */
        record NumberRight(int start, int end) implements FieldDef {}
        /** 整数を右詰めスペース埋めで整形するフィールド */
        record IntRight(int start, int end)    implements FieldDef {}
    }

    /**
     * フィールド定義に従って値をフォーマットする（パターンマッチング）。
     */
    public static String formatField(FieldDef def, Object value) {
        return switch (def) {
            case FieldDef.TextLeft(var s, var e)    -> "%-" + (e - s) + "s".formatted(value);
            case FieldDef.NumberRight(var s, var e) -> "%0" + (e - s) + "d".formatted(value);
            case FieldDef.IntRight(var s, var e)    -> "%" + (e - s) + "d".formatted(value);
        };
    }

    // ---- 書き込み ----

    public static String format(EmployeeRecord rec) {
        return formatField(new FieldDef.IntRight(0, 4),      rec.id())
             + formatField(new FieldDef.TextLeft(4, 24),     rec.name())
             + formatField(new FieldDef.TextLeft(24, 32),    rec.department())
             + formatField(new FieldDef.NumberRight(32, 40), rec.salary())
             + rec.joinDate();
    }

    public static String write(List<EmployeeRecord> records) {
        var sb = new StringBuilder();
        for (var rec : records) {
            sb.append(format(rec)).append(System.lineSeparator());
        }
        return sb.toString();
    }

    // ---- 読み込み ----

    public static EmployeeRecord parse(String line) {
        var id         = Integer.parseInt(line.substring(0,  4).trim());
        var name       = line.substring(4,  24).trim();
        var department = line.substring(24, 32).trim();
        var salary     = Integer.parseInt(line.substring(32, 40).trim());
        var joinDate   = line.substring(40, 48).trim();
        return new EmployeeRecord(id, name, department, salary, joinDate);
    }

    public static List<EmployeeRecord> read(String fileContent) throws IOException {
        var records = new ArrayList<EmployeeRecord>();
        try (var br = new BufferedReader(new StringReader(fileContent))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (!line.isBlank()) {
                    records.add(parse(line));
                }
            }
        }
        return records;
    }

    public static void main(String[] args) throws IOException {
        var records = List.of(
            new EmployeeRecord(1,    "Yamada Taro",   "DEV",   450000, "20200401"),
            new EmployeeRecord(2,    "Suzuki Hanako", "SALES", 380000, "20210601"),
            new EmployeeRecord(1234, "Tanaka Jiro",   "HR",    320000, "20220401")
        );

        System.out.println("=== 固定長フォーマット ===");
        var fileContent = write(records);
        System.out.print(fileContent);

        var firstLine = fileContent.lines().findFirst().orElse("");
        System.out.println("1行の文字数: " + firstLine.length() + " 文字");

        System.out.println("\n=== パース結果 ===");
        read(fileContent).forEach(System.out::println);
    }
}
