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

public class FileIoSample {

    // ① テキストファイルを読み込む（Java 21: java.io の書き方は 17 と同じ）
    public static List<String> readLines(String filePath) throws IOException {
        var lines = new ArrayList<String>();
        try (var reader = new BufferedReader(
                new InputStreamReader(
                        new FileInputStream(filePath), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
        }
        return lines;
    }

    // ② テキストファイルに書き込む
    public static void writeLines(String filePath, List<String> lines) throws IOException {
        try (var writer = new BufferedWriter(
                new OutputStreamWriter(
                        new FileOutputStream(filePath), StandardCharsets.UTF_8))) {
            for (var line : lines) {
                writer.write(line);
                writer.newLine();
            }
        }
    }

    // ③ ファイルに追記
    public static void appendLine(String filePath, String line) throws IOException {
        try (var writer = new BufferedWriter(
                new OutputStreamWriter(
                        new FileOutputStream(filePath, true), StandardCharsets.UTF_8))) {
            writer.write(line);
            writer.newLine();
        }
    }

    // ④ バイナリファイルのコピー
    public static void copyBinary(String src, String dest) throws IOException {
        try (var in = new FileInputStream(src);
             var out = new FileOutputStream(dest)) {
            var buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
    }

    // ⑤ File クラスでファイル情報を取得
    public static void printFileInfo(String filePath) {
        var file = new File(filePath);
        System.out.println("パス    : " + file.getAbsolutePath());
        System.out.println("存在    : " + file.exists());
        System.out.println("サイズ  : " + file.length() + " bytes");
        System.out.println("更新日時: " + new java.util.Date(file.lastModified()));
    }

    // ⑥ ディレクトリ作成・一覧取得
    public static boolean createDirectory(String dirPath) {
        return new File(dirPath).mkdirs();
    }

    public static File[] listFiles(String dirPath) {
        var dir = new File(dirPath);
        if (!dir.isDirectory()) {
            return new File[0];
        }
        var files = dir.listFiles();
        return (files != null) ? files : new File[0];
    }

    public static void main(String[] args) throws IOException {
        var tempDir = System.getProperty("java.io.tmpdir");
        var filePath = tempDir + "/fileio_sample.txt";

        writeLines(filePath, List.of(
                "1行目: Hello, Java!",
                "2行目: ファイルI/Oのサンプル",
                "3行目: UTF-8 で書き込み"
        ));
        System.out.println("書き込み完了: " + filePath);

        var readLines = readLines(filePath);
        System.out.println("読み込んだ行数: " + readLines.size());
        readLines.forEach(line -> System.out.println("  " + line));

        appendLine(filePath, "4行目: 追記した行");
        System.out.println("追記後: " + readLines(filePath).size() + "行");

        System.out.println("\n--- ファイル情報 ---");
        printFileInfo(filePath);

        new File(filePath).delete();
    }
}
