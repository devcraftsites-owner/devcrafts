import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class CsvReadWriteSample {

    /**
     * CSVファイルを1行ずつ読み込み、行のリストを返す（java.io 方式）
     *
     * @param filePath CSV ファイルのパス
     * @return 行のリスト（ヘッダー行を含む）
     */
    public static List<String> readCsv(String filePath) throws IOException {
        List<String> lines = new ArrayList<>();
        // try-with-resources で確実にクローズ
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(filePath), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
        }
        return lines;
    }

    /**
     * 行のリストを CSV ファイルに書き込む（java.io 方式）
     *
     * @param filePath CSV ファイルのパス
     * @param lines    書き込む行のリスト
     */
    public static void writeCsv(String filePath, List<String> lines) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream(filePath), StandardCharsets.UTF_8))) {
            for (String line : lines) {
                writer.write(line);
                writer.newLine(); // OS に応じた改行コードを使用
            }
        }
    }

    /**
     * カンマ区切りの行をフィールドの配列に分割する（簡易パース）
     * ダブルクォートで囲まれたフィールドも対応
     */
    public static String[] parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes; // クォートの開始・終了を切り替え
            } else if (c == ',' && !inQuotes) {
                fields.add(sb.toString()); // カンマで分割（クォート外のみ）
                sb = new StringBuilder();
            } else {
                sb.append(c);
            }
        }
        fields.add(sb.toString()); // 最後のフィールドを追加
        return fields.toArray(new String[0]);
    }

    public static void main(String[] args) throws IOException {

        // サンプルデータ（実際はファイルから読み込む）
        List<String> csvLines = new ArrayList<>();
        csvLines.add("name,price,category");          // ヘッダー行
        csvLines.add("apple,100,fruit");
        csvLines.add("banana,150,fruit");
        csvLines.add("\"milk, low-fat\",200,dairy");  // カンマ含むフィールドはダブルクォート
        csvLines.add("bread,120,bakery");

        // 一時ファイルに書き込み
        File tempFile = File.createTempFile("sample", ".csv");
        tempFile.deleteOnExit();
        writeCsv(tempFile.getAbsolutePath(), csvLines);
        System.out.println("CSV書き込み完了: " + tempFile.getAbsolutePath());

        // ファイルを読み込み
        List<String> readLines = readCsv(tempFile.getAbsolutePath());
        System.out.println("読み込み行数: " + readLines.size());

        // ヘッダー行をスキップして各行をパース
        boolean isHeader = true;
        for (String line : readLines) {
            if (isHeader) {
                isHeader = false;
                continue; // ヘッダーはスキップ
            }
            String[] fields = parseCsvLine(line);
            System.out.println("name=" + fields[0] + ", price=" + fields[1]
                    + ", category=" + fields[2]);
        }
    }
}
