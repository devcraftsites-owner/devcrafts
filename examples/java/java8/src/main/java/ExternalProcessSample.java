import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class ExternalProcessSample {

    // ✅ パターン1: 戻り値を使う（推奨）
    public static int runWithOutput(String[] command) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true); // 標準エラーを標準出力にマージ

        Process process = pb.start();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[出力] " + line);
            }
        }

        int exitCode = process.waitFor();
        System.out.println("終了コード: " + exitCode);
        return exitCode;
    }

    // ✅ 標準出力と標準エラーを分けて処理
    public static void runWithSeparateStreams(String[] command) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        Process process = pb.start();

        // 標準出力を読み取る
        try (BufferedReader stdout = new BufferedReader(
                new InputStreamReader(process.getInputStream()));
             BufferedReader stderr = new BufferedReader(
                new InputStreamReader(process.getErrorStream()))) {

            String line;
            while ((line = stdout.readLine()) != null) {
                System.out.println("[stdout] " + line);
            }
            while ((line = stderr.readLine()) != null) {
                System.out.println("[stderr] " + line);
            }
        }

        process.waitFor();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== Java バージョン確認 ===");
        // OS によって動作が変わるため、クロスプラットフォームな java -version を使用
        runWithOutput(new String[]{"java", "-version"});

        System.out.println("\n=== echo コマンド ===");
        // Linux/Mac では echo, Windows では cmd /c echo を使用
        String os = System.getProperty("os.name").toLowerCase();
        if (os.contains("win")) {
            runWithOutput(new String[]{"cmd", "/c", "echo", "Hello from Process"});
        } else {
            runWithOutput(new String[]{"echo", "Hello from Process"});
        }

        System.out.println("\n=== 終了コードで成功・失敗を判断 ===");
        int exitCode = runWithOutput(new String[]{"java", "-version"});
        if (exitCode == 0) {
            System.out.println("コマンド成功");
        } else {
            System.out.println("コマンド失敗: exitCode=" + exitCode);
        }
    }
}
