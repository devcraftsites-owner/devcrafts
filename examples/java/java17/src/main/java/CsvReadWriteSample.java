import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class CsvReadWriteSample {

    /**
     * CSV ファイルを読み込み、行のリストを返す（java.nio 方式）
     *
     * @param path CSV ファイルのパス
     * @return 行のリスト
     */
    public static List<String> readCsv(Path path) throws IOException {
        // Files.readAllLines: 小〜中規模ファイル向け（全行を一括読み込み）
        return Files.readAllLines(path, StandardCharsets.UTF_8);
    }

    /**
     * CSV ファイルを書き込む（java.nio 方式）
     *
     * @param path  CSV ファイルのパス
     * @param lines 書き込む行のリスト
     */
    public static void writeCsv(Path path, List<String> lines) throws IOException {
        // Files.write: 行のリストをまとめて書き込む
        Files.write(path, lines, StandardCharsets.UTF_8);
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
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(sb.toString());
                sb = new StringBuilder();
            } else {
                sb.append(c);
            }
        }
        fields.add(sb.toString());
        return fields.toArray(String[]::new); // Java 11+: メソッド参照でジェネリック配列生成
    }

    public static void main(String[] args) throws IOException {

        List<String> csvLines = List.of(
                "name,price,category",
                "apple,100,fruit",
                "banana,150,fruit",
                "\"milk, low-fat\",200,dairy",
                "bread,120,bakery"
        );

        // 一時ファイルに書き込み
        Path tempFile = Files.createTempFile("sample", ".csv");
        tempFile.toFile().deleteOnExit();
        writeCsv(tempFile, new ArrayList<>(csvLines));
        System.out.println("CSV書き込み完了: " + tempFile);

        // ファイルを読み込み
        List<String> readLines = readCsv(tempFile);
        System.out.println("読み込み行数: " + readLines.size());

        // ヘッダー行をスキップして各行をパース
        readLines.stream()
                .skip(1) // ヘッダーをスキップ
                .forEach(line -> {
                    String[] fields = parseCsvLine(line);
                    System.out.println("name=" + fields[0]
                            + ", price=" + fields[1]
                            + ", category=" + fields[2]);
                });

        // 大容量CSV: Files.lines() でストリーム処理（メモリ節約）
        System.out.println("\n--- ストリーム処理 ---");
        try (var stream = Files.lines(tempFile, StandardCharsets.UTF_8)) { // Java 10+: var
            stream.skip(1) // ヘッダーをスキップ
                    .map(line -> parseCsvLine(line)[0]) // name フィールドのみ取得
                    .forEach(System.out::println);
        }
    }
}
