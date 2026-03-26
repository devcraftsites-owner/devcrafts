import java.io.*;
import java.net.Socket;
import java.util.Base64;

public class SmtpSocketSample {

    // SMTP プロトコルの基本コマンド送受信クラス
    static class SmtpClient implements Closeable {
        private final Socket socket;
        private final BufferedReader reader;
        private final PrintWriter writer;

        SmtpClient(String host, int port) throws IOException {
            this.socket = new Socket(host, port);
            this.reader = new BufferedReader(
                new InputStreamReader(socket.getInputStream()));
            this.writer = new PrintWriter(
                new OutputStreamWriter(socket.getOutputStream()), true);
        }

        // コマンドを送信してレスポンスを受信（null の場合は受信のみ）
        String sendCommand(String command) throws IOException {
            if (command != null) {
                writer.println(command);
                System.out.println("C: " + command);
            }
            String response = reader.readLine();
            System.out.println("S: " + response);
            return response;
        }

        // レスポンスコードが期待値か確認し、違えば例外を投げる
        void expect(String command, int expectedCode) throws IOException {
            String response = sendCommand(command);
            if (!response.startsWith(String.valueOf(expectedCode))) {
                throw new IOException("予期しないレスポンス（期待: " + expectedCode + "）: " + response);
            }
        }

        @Override
        public void close() throws IOException {
            socket.close();
        }
    }

    // SMTP プロトコルの流れをコンソールに表示（仕組みの理解用）
    static void showSmtpFlow() {
        System.out.println("=== SMTP プロトコルの流れ（仕組みの説明） ===");
        System.out.println();
        System.out.println("1. TCP 接続");
        System.out.println("   Socket(\"smtp.example.com\", 587) で接続");
        System.out.println("   S: 220 smtp.example.com ESMTP ready");
        System.out.println();
        System.out.println("2. EHLO（拡張 SMTP のあいさつ）");
        System.out.println("   C: EHLO client.example.com");
        System.out.println("   S: 250-smtp.example.com");
        System.out.println("   S: 250-SIZE 35882577");
        System.out.println("   S: 250 AUTH LOGIN PLAIN");
        System.out.println();
        System.out.println("3. 認証（AUTH LOGIN）");
        System.out.println("   C: AUTH LOGIN");
        System.out.println("   S: 334 Username:");
        System.out.println("   C: " + Base64.getEncoder().encodeToString("user@example.com".getBytes()));
        System.out.println("   S: 334 Password:");
        System.out.println("   C: " + Base64.getEncoder().encodeToString("password".getBytes()));
        System.out.println("   S: 235 Authentication successful");
        System.out.println();
        System.out.println("4. 送信者の指定");
        System.out.println("   C: MAIL FROM:<from@example.com>");
        System.out.println("   S: 250 OK");
        System.out.println();
        System.out.println("5. 受信者の指定");
        System.out.println("   C: RCPT TO:<to@example.com>");
        System.out.println("   S: 250 OK");
        System.out.println();
        System.out.println("6. メール本文の送信");
        System.out.println("   C: DATA");
        System.out.println("   S: 354 Start mail input; end with <CRLF>.<CRLF>");
        System.out.println("   C: From: from@example.com");
        System.out.println("   C: To: to@example.com");
        System.out.println("   C: Subject: テストメール");
        System.out.println("   C: ");
        System.out.println("   C: メール本文");
        System.out.println("   C: .  ← 単独のドット（.）で本文終了を通知");
        System.out.println("   S: 250 Message accepted for delivery");
        System.out.println();
        System.out.println("7. 切断");
        System.out.println("   C: QUIT");
        System.out.println("   S: 221 Bye");
    }

    // Base64 エンコード（AUTH LOGIN で認証情報を送る際に使用）
    static String encodeBase64(String text) {
        return Base64.getEncoder().encodeToString(text.getBytes());
    }

    public static void main(String[] args) {
        showSmtpFlow();

        System.out.println();
        System.out.println("=== Base64 エンコード例（AUTH LOGIN 用） ===");
        System.out.println("ユーザー名: " + encodeBase64("user@example.com"));
        System.out.println("パスワード: " + encodeBase64("mypassword"));

        System.out.println();
        System.out.println("注意: 実務では N-05（Jakarta Mail）を使用してください");
        System.out.println("このサンプルは SMTP プロトコルの仕組みを学ぶためのものです");
    }
}
