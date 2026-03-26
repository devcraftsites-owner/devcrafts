import java.io.*;
import java.net.Socket;
import java.util.Base64;
import java.util.List;

public class SmtpSocketSample {

    // Java 21: record で SMTP コマンドを型安全に表現、sealed interface でステータスを分類

    // SMTP コマンドを record で型安全に定義（Java 16+）
    record SmtpCommand(String name, String arg) {
        // 引数なしコマンドのファクトリメソッド
        static SmtpCommand of(String name) {
            return new SmtpCommand(name, null);
        }

        // コマンド文字列を生成
        String toCommandLine() {
            if (arg == null || arg.isEmpty()) {
                return name;
            }
            return name + " " + arg;
        }
    }

    // SMTP レスポンスのステータス種別を sealed interface で分類（Java 17+）
    sealed interface SmtpStatus permits SmtpStatus.Success, SmtpStatus.Intermediate, SmtpStatus.Error {
        record Success(int code, String message)      implements SmtpStatus {}
        record Intermediate(int code, String message) implements SmtpStatus {}
        record Error(int code, String message)        implements SmtpStatus {}
    }

    // レスポンスコードから SmtpStatus に変換
    static SmtpStatus parseResponse(String response) {
        if (response == null || response.length() < 3) {
            return new SmtpStatus.Error(0, "レスポンスなし");
        }
        int code = Integer.parseInt(response.substring(0, 3));
        String message = response.length() > 4 ? response.substring(4) : "";

        // Java 21: switch 式でコードの範囲を分類
        return switch (code / 100) {
            case 2 -> new SmtpStatus.Success(code, message);
            case 3 -> new SmtpStatus.Intermediate(code, message);
            default -> new SmtpStatus.Error(code, message);
        };
    }

    // SmtpStatus を pattern matching switch で処理（Java 21+）
    static void handleStatus(SmtpStatus status) {
        String log = switch (status) {
            case SmtpStatus.Success      s -> "[成功 " + s.code() + "] " + s.message();
            case SmtpStatus.Intermediate s -> "[継続 " + s.code() + "] " + s.message();
            case SmtpStatus.Error        s -> "[エラー " + s.code() + "] " + s.message();
        };
        System.out.println(log);
    }

    // SMTP コマンドシーケンスをデモ表示
    static void showSmtpFlow() {
        var commands = List.of(
            new SmtpCommand("EHLO", "client.example.com"),
            new SmtpCommand("AUTH LOGIN", null),
            new SmtpCommand("（Base64）", Base64.getEncoder().encodeToString("user@example.com".getBytes())),
            new SmtpCommand("MAIL FROM", "<from@example.com>"),
            new SmtpCommand("RCPT TO", "<to@example.com>"),
            SmtpCommand.of("DATA"),
            SmtpCommand.of(".")
        );

        var responses = List.of(
            "250 AUTH LOGIN PLAIN",
            "334 Username:",
            "334 Password:",
            "250 OK",
            "250 OK",
            "354 Start mail input",
            "250 Message accepted"
        );

        System.out.println("=== SMTP プロトコルの流れ（Java 21 版） ===");
        System.out.println("S: 220 smtp.example.com ESMTP ready");
        for (int i = 0; i < commands.size() && i < responses.size(); i++) {
            System.out.println("C: " + commands.get(i).toCommandLine());
            SmtpStatus status = parseResponse(responses.get(i));
            handleStatus(status);
        }
        System.out.println("C: QUIT");
        handleStatus(parseResponse("221 Bye"));
    }

    public static void main(String[] args) {
        showSmtpFlow();
        System.out.println();
        System.out.println("注意: 実務では N-05（Jakarta Mail）を使用してください");
        System.out.println("このサンプルは SMTP プロトコルの仕組みを学ぶためのものです");
    }
}
