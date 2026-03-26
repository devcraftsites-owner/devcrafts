import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

/**
 * 固定長ファイルの読込・書込サンプル（Java 17+）。
 * record 型で不変なレコードオブジェクトを簡潔に定義。
 *
 * レコード形式（1行48文字）:
 *   [0-3]  社員番号   4桁  右詰め・スペース埋め
 *   [4-23] 氏名      20桁  左詰め・スペース埋め
 *   [24-31] 部署コード  8桁  左詰め・スペース埋め
 *   [32-39] 給与      8桁  右詰め・ゼロ埋め
 *   [40-47] 入社日    8桁  yyyyMMdd 形式
 */
public class FixedLengthSample {

    // record 型（Java 16+）で不変な値オブジェクトを定義
    record EmployeeRecord(int id, String name, String department, int salary, String joinDate) {}

    // ---- 書き込み ----

    public static String format(EmployeeRecord rec) {
        return "%4d".formatted(rec.id())                // [0-3]   社員番号（右詰め）
             + "%-20s".formatted(rec.name())            // [4-23]  氏名（左詰め）
             + "%-8s".formatted(rec.department())       // [24-31] 部署コード（左詰め）
             + "%08d".formatted(rec.salary())           // [32-39] 給与（ゼロ埋め）
             + rec.joinDate();                           // [40-47] 入社日
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
                if (!line.isBlank()) { // Java 11+: isBlank() で空白のみの行もスキップ
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

        // 書き込み
        System.out.println("=== 固定長フォーマット ===");
        var fileContent = write(records);
        System.out.print(fileContent);

        var firstLine = fileContent.lines().findFirst().orElse("");
        System.out.println("1行の文字数: " + firstLine.length() + " 文字");

        // 読み込み（ラウンドトリップ確認）
        System.out.println("\n=== パース結果 ===");
        read(fileContent).forEach(System.out::println);
    }
}
