import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class ExternalProcessSample {

    // Java 21: record でプロセスの実行結果を表現
    record ProcessResult(int exitCode, String output) {
        public boolean isSuccess() {
            return exitCode == 0;
        }
    }

    // Java 21: sealed interface で実行結果を型安全に表現
    sealed interface ExecResult permits ExecResult.Success, ExecResult.Failure {
        record Success(ProcessResult result) implements ExecResult {}
        record Failure(int exitCode, String error) implements ExecResult {}
    }

    // タイムアウト付きでコマンドを実行（Java 9+）
    public static ExecResult execute(String... command) {
        try {
            var pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);

            var process = pb.start();
            String output;
            try (var reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                output = reader.lines().collect(Collectors.joining("\n"));
            }

            // タイムアウト付きで終了を待つ（Java 9+）
            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return new ExecResult.Failure(-1, "タイムアウト（30秒）");
            }

            int exitCode = process.exitValue();
            if (exitCode == 0) {
                return new ExecResult.Success(new ProcessResult(exitCode, output));
            } else {
                return new ExecResult.Failure(exitCode, output);
            }

        } catch (IOException | InterruptedException e) {
            return new ExecResult.Failure(-1, e.getMessage());
        }
    }

    // switch パターンマッチングで結果を処理
    static void handleResult(ExecResult result) {
        switch (result) {
            case ExecResult.Success s -> {
                System.out.println("成功（終了コード: " + s.result().exitCode() + "）");
                System.out.println("出力: " + s.result().output());
            }
            case ExecResult.Failure f -> {
                System.out.println("失敗（終了コード: " + f.exitCode() + "）");
                System.out.println("エラー: " + f.error());
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Java バージョン確認 ===");
        handleResult(execute("java", "-version"));

        System.out.println("\n=== echo コマンド ===");
        var os = System.getProperty("os.name").toLowerCase();
        ExecResult echoResult;
        if (os.contains("win")) {
            echoResult = execute("cmd", "/c", "echo", "Hello from Process");
        } else {
            echoResult = execute("echo", "Hello from Process");
        }
        handleResult(echoResult);

        System.out.println("\n=== 存在しないコマンド（エラーハンドリング） ===");
        handleResult(execute("no_such_command_xyz"));
    }
}
