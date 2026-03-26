import java.io.*;
import java.net.Socket;
import java.util.Base64;
import java.util.List;

public class SmtpSocketSample {

    // Java 17: var によるローカル変数型推論、テキストブロックで SMTP フロー説明

    // SMTP セッションのステップを record で表現（Java 16+）
    record SmtpStep(String commandLabel, String clientLine, String serverResponse) {}

    // SMTP プロトコルの流れをステップごとに説明
    static void showSmtpFlow() {
        // テキストブロック（Java 15+）で説明文を読みやすく記述
        String overview = """
                SMTP（Simple Mail Transfer Protocol）は
                メール送信に使われるテキストベースのプロトコルです。
                クライアントとサーバーがコマンドと応答コードをやり取りして
                メールを転送します。
                """;
        System.out.println(overview);

        // SMTP コマンドの一覧を List.of で定義
        var steps = List.of(
            new SmtpStep("接続", "(TCP 接続)", "220 smtp.example.com ESMTP ready"),
            new SmtpStep("あいさつ", "EHLO client.example.com", "250 AUTH LOGIN PLAIN"),
            new SmtpStep("認証開始", "AUTH LOGIN", "334 Username:"),
            new SmtpStep("ユーザー名", Base64.getEncoder().encodeToString("user@example.com".getBytes()), "334 Password:"),
            new SmtpStep("パスワード", Base64.getEncoder().encodeToString("password".getBytes()), "235 Authentication successful"),
            new SmtpStep("送信者指定", "MAIL FROM:<from@example.com>", "250 OK"),
            new SmtpStep("受信者指定", "RCPT TO:<to@example.com>", "250 OK"),
            new SmtpStep("本文開始", "DATA", "354 Start mail input"),
            new SmtpStep("本文終了", ".", "250 Message accepted"),
            new SmtpStep("切断", "QUIT", "221 Bye")
        );

        System.out.println("=== SMTP コマンドの流れ ===");
        for (var step : steps) {
            System.out.printf("%-10s  C: %-55s  S: %s%n",
                "[" + step.commandLabel() + "]",
                step.clientLine(),
                step.serverResponse());
        }
    }

    static String encodeBase64(String text) {
        return Base64.getEncoder().encodeToString(text.getBytes());
    }

    public static void main(String[] args) {
        showSmtpFlow();
        System.out.println();
        System.out.println("注意: 実務では N-05（Jakarta Mail）を使用してください");
    }
}
