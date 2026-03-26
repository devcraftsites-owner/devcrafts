import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class CsvReadWriteSample {

    public static List<String> readCsv(Path path) throws IOException {
        return Files.readAllLines(path, StandardCharsets.UTF_8);
    }

    public static void writeCsv(Path path, List<String> lines) throws IOException {
        Files.write(path, lines, StandardCharsets.UTF_8);
    }

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
        return fields.toArray(String[]::new);
    }

    public static void main(String[] args) throws IOException {

        List<String> csvLines = List.of(
                "name,price,category",
                "apple,100,fruit",
                "banana,150,fruit",
                "\"milk, low-fat\",200,dairy",
                "bread,120,bakery"
        );

        Path tempFile = Files.createTempFile("sample", ".csv");
        tempFile.toFile().deleteOnExit();
        writeCsv(tempFile, new ArrayList<>(csvLines));
        System.out.println("CSV書き込み完了: " + tempFile);

        List<String> readLines = readCsv(tempFile);
        System.out.println("読み込み行数: " + readLines.size());

        // ヘッダーをスキップしてパース
        readLines.stream()
                .skip(1)
                .forEach(line -> {
                    var fields = parseCsvLine(line); // Java 10+: var
                    System.out.println("name=" + fields[0]
                            + ", price=" + fields[1]
                            + ", category=" + fields[2]);
                });

        // 大容量CSV: Files.lines() でストリーム処理
        System.out.println("\n--- ストリーム処理 ---");
        try (var stream = Files.lines(tempFile, StandardCharsets.UTF_8)) {
            stream.skip(1)
                    .map(line -> parseCsvLine(line)[0])
                    .forEach(System.out::println);
        }

        // Java 21: Files.readString() で全文一括読み込み（小ファイル向け）
        String allContent = Files.readString(tempFile, StandardCharsets.UTF_8); // Java 11+
        System.out.println("\n全文:\n" + allContent.strip());
    }
}
