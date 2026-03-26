import java.io.*;
import java.net.Socket;

public class HttpSocketSample {

    // HTTP レスポンスを表すクラス
    static class HttpResponse {
        final int statusCode;
        final String statusMessage;
        final String body;

        HttpResponse(int statusCode, String statusMessage, String body) {
            this.statusCode = statusCode;
            this.statusMessage = statusMessage;
            this.body = body;
        }

        @Override
        public String toString() {
            int len = Math.min(body.length(), 200);
            return "HTTP " + statusCode + " " + statusMessage
                    + "\nBody（先頭 " + len + " 文字）: " + body.substring(0, len) + "...";
        }
    }

    // TCP ソケットで HTTP GET リクエストを送信
    static HttpResponse sendGet(String host, int port, String path) throws IOException {
        try (Socket socket = new Socket(host, port)) {
            // HTTP/1.1 リクエストを手作りする
            String request = "GET " + path + " HTTP/1.1\r\n"
                    + "Host: " + host + "\r\n"
                    + "User-Agent: JavaSocketClient/1.0\r\n"
                    + "Connection: close\r\n"
                    + "\r\n";  // ヘッダー終端（空行 CRLF）

            PrintWriter writer = new PrintWriter(
                new OutputStreamWriter(socket.getOutputStream()), true);
            writer.print(request);
            writer.flush();

            System.out.println("=== 送信したリクエスト ===");
            // \r\n を見やすく置換して表示
            System.out.println(request.replace("\r\n", "[CRLF]\n"));

            // レスポンスを受信する
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(socket.getInputStream()));

            // ステータス行を読む（例: "HTTP/1.1 200 OK"）
            String statusLine = reader.readLine();
            System.out.println("=== 受信したレスポンス ===");
            System.out.println(statusLine);

            int statusCode = 0;
            String statusMessage = "";
            if (statusLine != null && statusLine.startsWith("HTTP/")) {
                String[] parts = statusLine.split(" ", 3);
                if (parts.length >= 2) {
                    statusCode = Integer.parseInt(parts[1]);
                    statusMessage = parts.length > 2 ? parts[2] : "";
                }
            }

            // ヘッダー行を読む（空行まで）
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                System.out.println(line);
            }

            // ボディを読む
            StringBuilder body = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                body.append(line).append("\n");
            }

            return new HttpResponse(statusCode, statusMessage, body.toString());
        }
    }

    public static void main(String[] args) {
        System.out.println("=== HTTP の仕組みデモ（TCP ソケットで HTTP/1.1 リクエストを手作り） ===");
        System.out.println();

        // HTTP リクエストの構造説明
        System.out.println("--- HTTP GET リクエストの構造 ---");
        System.out.println("  GET /path HTTP/1.1       ← リクエスト行（メソッド・パス・バージョン）");
        System.out.println("  Host: example.com        ← 必須ヘッダー（HTTP/1.1 から必須）");
        System.out.println("  User-Agent: MyClient/1.0 ← 任意ヘッダー");
        System.out.println("  Connection: close        ← 接続を閉じる指示");
        System.out.println("  （空行 CRLF）            ← ヘッダーとボディの区切り");
        System.out.println();
        System.out.println("--- HTTP レスポンスの構造 ---");
        System.out.println("  HTTP/1.1 200 OK          ← ステータス行");
        System.out.println("  Content-Type: text/html  ← レスポンスヘッダー");
        System.out.println("  Content-Length: 1234");
        System.out.println("  （空行 CRLF）            ← ヘッダーとボディの区切り");
        System.out.println("  <html>...</html>         ← レスポンスボディ");
        System.out.println();

        // 実際のリクエスト（ネットワーク接続が必要）
        try {
            HttpResponse response = sendGet("example.com", 80, "/");
            System.out.println("\n=== レスポンス情報 ===");
            System.out.println("ステータス: " + response.statusCode + " " + response.statusMessage);
            int len = Math.min(response.body.length(), 200);
            System.out.println("ボディ（先頭 " + len + " 文字）: " + response.body.substring(0, len));
        } catch (IOException e) {
            System.out.println("接続エラー（ネットワーク環境に依存）: " + e.getMessage());
            System.out.println("このサンプルはネットワーク接続が必要です");
        }

        System.out.println();
        System.out.println("注意: 実務では N-01（HttpClient）または N-02（HttpURLConnection）を使用してください");
    }
}
