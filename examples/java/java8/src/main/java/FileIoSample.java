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

    // ① テキストファイルを1行ずつ読み込む（java.io 方式）
    //    ※ FileReader は文字コードを指定できないため InputStreamReader でラップする
    public static List<String> readLines(String filePath) throws IOException {
        List<String> lines = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
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
        try (BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(
                        new FileOutputStream(filePath), StandardCharsets.UTF_8))) {
            for (String line : lines) {
                writer.write(line);
                writer.newLine(); // OS に合わせた改行コードを挿入
            }
        }
    }

    // ③ ファイルに追記する（append モード）
    public static void appendLine(String filePath, String line) throws IOException {
        // FileOutputStream の第2引数 true = 追記モード
        try (BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(
                        new FileOutputStream(filePath, true), StandardCharsets.UTF_8))) {
            writer.write(line);
            writer.newLine();
        }
    }

    // ④ バイナリファイルのコピー（FileInputStream + FileOutputStream）
    public static void copyBinary(String src, String dest) throws IOException {
        try (FileInputStream in = new FileInputStream(src);
             FileOutputStream out = new FileOutputStream(dest)) {
            byte[] buffer = new byte[8192]; // 8KB バッファ
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
    }

    // ⑤ File クラスでファイル情報を取得
    public static void printFileInfo(String filePath) {
        File file = new File(filePath);
        System.out.println("パス    : " + file.getAbsolutePath());
        System.out.println("存在    : " + file.exists());
        System.out.println("ファイル: " + file.isFile());
        System.out.println("ディレクトリ: " + file.isDirectory());
        System.out.println("サイズ  : " + file.length() + " bytes");
        System.out.println("更新日時: " + new java.util.Date(file.lastModified()));
        System.out.println("読取可  : " + file.canRead());
        System.out.println("書込可  : " + file.canWrite());
    }

    // ⑥ ディレクトリを作成する
    public static boolean createDirectory(String dirPath) {
        File dir = new File(dirPath);
        return dir.mkdirs(); // 親ディレクトリも含めて作成
    }

    // ⑦ ディレクトリ内のファイル一覧を取得
    public static File[] listFiles(String dirPath) {
        File dir = new File(dirPath);
        if (!dir.isDirectory()) {
            return new File[0];
        }
        File[] files = dir.listFiles();
        return (files != null) ? files : new File[0];
    }

    public static void main(String[] args) throws IOException {
        // テスト用の一時ファイルを作成
        String tempDir = System.getProperty("java.io.tmpdir");
        String filePath = tempDir + "/fileio_sample.txt";

        // 書き込み
        List<String> linesToWrite = new ArrayList<>();
        linesToWrite.add("1行目: Hello, Java!");
        linesToWrite.add("2行目: ファイルI/Oのサンプル");
        linesToWrite.add("3行目: UTF-8 で書き込み");
        writeLines(filePath, linesToWrite);
        System.out.println("書き込み完了: " + filePath);

        // 読み込み
        List<String> readLines = readLines(filePath);
        System.out.println("\n読み込んだ行数: " + readLines.size());
        for (String line : readLines) {
            System.out.println("  " + line);
        }

        // 追記
        appendLine(filePath, "4行目: 追記した行");
        System.out.println("\n追記後の行数: " + readLines(filePath).size());

        // ファイル情報
        System.out.println("\n--- ファイル情報 ---");
        printFileInfo(filePath);

        // クリーンアップ
        new File(filePath).delete();
    }
}
