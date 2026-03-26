import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * 固定長ファイルの読込・書込サンプル（Java 8+）。
 *
 * レコード形式（1行80文字）:
 *   [0-3]  社員番号   4桁  右詰め・スペース埋め
 *   [4-23] 氏名      20桁  左詰め・スペース埋め
 *   [24-31] 部署コード  8桁  左詰め・スペース埋め
 *   [32-39] 給与      8桁  右詰め・ゼロ埋め
 *   [40-47] 入社日    8桁  yyyyMMdd 形式
 *
 * 注意: 日本語などのマルチバイト文字を含む場合は、
 *       文字数ではなくバイト数で位置を管理する必要があります。
 *       このサンプルは ASCII 文字（半角英数）を前提としています。
 */
public class FixedLengthSample {

    /** レコードを表すデータクラス */
    static class EmployeeRecord {
        final int    id;
        final String name;
        final String department;
        final int    salary;
        final String joinDate; // yyyyMMdd

        EmployeeRecord(int id, String name, String department, int salary, String joinDate) {
            this.id         = id;
            this.name       = name;
            this.department = department;
            this.salary     = salary;
            this.joinDate   = joinDate;
        }

        @Override
        public String toString() {
            return "EmployeeRecord{id=" + id + ", name=" + name
                + ", dept=" + department + ", salary=" + salary
                + ", joinDate=" + joinDate + "}";
        }
    }

    // ---- 書き込み ----

    /**
     * レコードを固定長1行の文字列にフォーマットする。
     *
     * String.format() のフォーマット指定:
     *   %-4d   → 幅4の左詰め整数（今回は右詰め）
     *   %4d    → 幅4の右詰め整数
     *   %-20s  → 幅20の左詰め文字列
     *   %08d   → 幅8・ゼロ埋め整数
     */
    public static String format(EmployeeRecord rec) {
        return String.format("%4d",  rec.id)         // [0-3]   社員番号（右詰め）
             + String.format("%-20s", rec.name)      // [4-23]  氏名（左詰め）
             + String.format("%-8s",  rec.department) // [24-31] 部署コード（左詰め）
             + String.format("%08d",  rec.salary)    // [32-39] 給与（ゼロ埋め）
             + rec.joinDate;                          // [40-47] 入社日
    }

    /**
     * レコードリストを固定長ファイル形式の文字列として出力する。
     */
    public static String write(List<EmployeeRecord> records) throws IOException {
        StringWriter sw = new StringWriter();
        BufferedWriter bw = new BufferedWriter(sw);
        for (EmployeeRecord rec : records) {
            bw.write(format(rec));
            bw.newLine();
        }
        bw.flush();
        return sw.toString();
    }

    // ---- 読み込み ----

    /**
     * 固定長1行の文字列からレコードを復元する。
     * substring(start, end) でフィールドを切り出し、trim() で空白を除去する。
     */
    public static EmployeeRecord parse(String line) {
        // フィールド定義に合わせて substring で切り出す
        int    id         = Integer.parseInt(line.substring(0, 4).trim());
        String name       = line.substring(4,  24).trim();
        String department = line.substring(24, 32).trim();
        int    salary     = Integer.parseInt(line.substring(32, 40).trim());
        String joinDate   = line.substring(40, 48).trim();
        return new EmployeeRecord(id, name, department, salary, joinDate);
    }

    /**
     * 固定長ファイル形式の文字列を1行ずつ読み込み、レコードリストを返す。
     * 空行はスキップする（大容量ファイルでもメモリ効率が良い）。
     */
    public static List<EmployeeRecord> read(String fileContent) throws IOException {
        List<EmployeeRecord> records = new ArrayList<>();
        BufferedReader br = new BufferedReader(new StringReader(fileContent));
        String line;
        while ((line = br.readLine()) != null) {
            if (!line.isEmpty()) {
                records.add(parse(line));
            }
        }
        return records;
    }

    public static void main(String[] args) throws IOException {
        // サンプルデータ
        List<EmployeeRecord> originals = new ArrayList<>();
        originals.add(new EmployeeRecord(1,    "Yamada Taro",    "DEV",     450000, "20200401"));
        originals.add(new EmployeeRecord(2,    "Suzuki Hanako",  "SALES",   380000, "20210601"));
        originals.add(new EmployeeRecord(1234, "Tanaka Jiro",    "HR",      320000, "20220401"));

        // 書き込み
        System.out.println("=== 固定長フォーマット ===");
        String fileContent = write(originals);
        System.out.print(fileContent);

        // 1行あたりの文字数を確認
        String firstLine = fileContent.split(System.lineSeparator())[0];
        System.out.println("1行の文字数: " + firstLine.length() + " 文字");

        // 読み込み（ラウンドトリップ確認）
        System.out.println("\n=== パース結果 ===");
        List<EmployeeRecord> parsed = read(fileContent);
        for (EmployeeRecord rec : parsed) {
            System.out.println(rec);
        }
    }
}
