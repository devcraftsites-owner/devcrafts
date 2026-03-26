import java.io.*;
import java.net.Socket;
import java.util.LinkedHashMap;
import java.util.Map;

public class HttpSocketSample {

    // Java 17: record で不変な HTTP レスポンスを表現（Java 16+）
    record HttpResponse(int statusCode, String statusMessage,
                        Map<String, String> headers, String body) {

        // 特定ヘッダーの値を取得（ヘッダー名は小文字に正規化して比較）
        String header(String name) {
            return headers.getOrDefault(name.toLowerCase(), "");
        }

        @Override
        public String toString() {
            int len = Math.min(body.length(), 200);
            return "HTTP " + statusCode + " " + statusMessage
                    + "\nContent-Type: " + header("content-type")
                    + "\nBody（先頭 " + len + " 文字）: " + body.substring(0, len);
        }
    }

    // TCP ソケットで HTTP GET リクエストを送信
    static HttpResponse sendGet(String host, int port, String path) throws IOException {
        try (var socket = new Socket(host, port)) {
            // HTTP/1.1 リクエストを文字列連結で組み立てる
            var request = "GET " + path + " HTTP/1.1\r\n"
                    + "Host: " + host + "\r\n"
                    + "User-Agent: JavaSocketClient/1.0\r\n"
                    + "Connection: close\r\n"
                    + "\r\n";

            var writer = new PrintWriter(new OutputStreamWriter(socket.getOutputStream()), true);
            writer.print(request);
            writer.flush();

            var reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

            // ステータス行を解析（例: "HTTP/1.1 200 OK"）
            var statusLine = reader.readLine();
            int statusCode = 0;
            String statusMessage = "";
            if (statusLine != null && statusLine.startsWith("HTTP/")) {
                var parts = statusLine.split(" ", 3);
                if (parts.length >= 2) {
                    statusCode = Integer.parseInt(parts[1]);
                    statusMessage = parts.length > 2 ? parts[2] : "";
                }
            }

            // ヘッダーを Key-Value で解析（小文字に正規化）
            var headers = new LinkedHashMap<String, String>();
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                int colon = line.indexOf(':');
                if (colon > 0) {
                    var key = line.substring(0, colon).trim().toLowerCase();
                    var value = line.substring(colon + 1).trim();
                    headers.put(key, value);
                }
            }

            // ボディを読む
            var body = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                body.append(line).append("\n");
            }

            return new HttpResponse(statusCode, statusMessage, headers, body.toString());
        }
    }

    public static void main(String[] args) {
        System.out.println("=== HTTP の仕組みデモ（Java 17 版） ===");
        System.out.println();

        // HTTP リクエストとレスポンスの構造（テキストブロックで見やすく表示）
        String requestExample = """
                GET /path HTTP/1.1
                Host: example.com
                User-Agent: MyClient/1.0
                Connection: close
                （空行）
                """;
        System.out.println("--- HTTP リクエスト例 ---");
        System.out.print(requestExample);

        try {
            var response = sendGet("example.com", 80, "/");
            System.out.println("\n=== レスポンス情報 ===");
            System.out.println("ステータス: " + response.statusCode() + " " + response.statusMessage());
            System.out.println("Content-Type: " + response.header("content-type"));
            int len = Math.min(response.body().length(), 200);
            System.out.println("ボディ（先頭 " + len + " 文字）: " + response.body().substring(0, len));
        } catch (IOException e) {
            System.out.println("接続エラー: " + e.getMessage());
        }

        System.out.println();
        System.out.println("注意: 実務では N-01（HttpClient）を使用してください");
    }
}
