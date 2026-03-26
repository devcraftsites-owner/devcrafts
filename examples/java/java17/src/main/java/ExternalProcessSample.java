import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

public class ExternalProcessSample {

    // Java 17: record でプロセスの実行結果を表現
    record ProcessResult(int exitCode, String output) {
        public boolean isSuccess() {
            return exitCode == 0;
        }
    }

    // ✅ 出力を文字列として返す
    public static ProcessResult run(String[] command) throws IOException, InterruptedException {
        var pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true); // 標準エラーを標準出力にマージ

        var process = pb.start();
        String output;
        try (var reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            output = reader.lines().collect(Collectors.joining("\n"));
        }

        int exitCode = process.waitFor();
        return new ProcessResult(exitCode, output);
    }

    // ✅ inheritIO(): 親プロセスの標準入出力をそのまま使う
    public static int runInherited(String[] command) throws IOException, InterruptedException {
        var pb = new ProcessBuilder(command);
        pb.inheritIO(); // 標準入出力を親プロセスから継承（ターミナルにそのまま出力）
        var process = pb.start();
        return process.waitFor();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== Java バージョン確認（record で結果を受け取る） ===");
        var result = run(new String[]{"java", "-version"});
        System.out.println("終了コード: " + result.exitCode());
        System.out.println("出力:\n" + result.output());

        System.out.println("\n=== 成功・失敗の判定 ===");
        if (result.isSuccess()) {
            System.out.println("コマンド成功");
        } else {
            System.out.println("コマンド失敗");
        }

        System.out.println("\n=== echo コマンド ===");
        var os = System.getProperty("os.name").toLowerCase();
        ProcessResult echoResult;
        if (os.contains("win")) {
            echoResult = run(new String[]{"cmd", "/c", "echo", "Hello from Process"});
        } else {
            echoResult = run(new String[]{"echo", "Hello from Process"});
        }
        System.out.println("出力: " + echoResult.output());
    }
}
