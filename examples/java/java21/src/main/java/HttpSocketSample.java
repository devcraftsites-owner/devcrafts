import java.io.*;
import java.net.Socket;
import java.util.LinkedHashMap;
import java.util.Map;

public class HttpSocketSample {

    // Java 21: record で HTTP レスポンスを表現、switch 式でステータスコードを分類

    // HTTP レスポンス（不変な record）
    record HttpResponse(int statusCode, String statusMessage,
                        Map<String, String> headers, String body) {

        // 特定ヘッダーの値を取得（ヘッダー名は小文字に正規化して比較）
        String header(String name) {
            return headers.getOrDefault(name.toLowerCase(), "");
        }
    }

    // HTTP ステータスカテゴリを sealed interface で定義（Java 17+）
    sealed interface HttpStatusCategory
            permits HttpStatusCategory.Success, HttpStatusCategory.Redirect,
                    HttpStatusCategory.ClientError, HttpStatusCategory.ServerError,
                    HttpStatusCategory.Unknown {
        record Success(int code)     implements HttpStatusCategory {}
        record Redirect(int code)    implements HttpStatusCategory {}
        record ClientError(int code) implements HttpStatusCategory {}
        record ServerError(int code) implements HttpStatusCategory {}
        record Unknown(int code)     implements HttpStatusCategory {}
    }

    // ステータスコードを分類（Java 21 switch 式）
    static HttpStatusCategory classify(int code) {
        return switch (code / 100) {
            case 2 -> new HttpStatusCategory.Success(code);
            case 3 -> new HttpStatusCategory.Redirect(code);
            case 4 -> new HttpStatusCategory.ClientError(code);
            case 5 -> new HttpStatusCategory.ServerError(code);
            default -> new HttpStatusCategory.Unknown(code);
        };
    }

    // ステータスカテゴリを pattern matching switch で処理（Java 21+）
    static void printStatusInfo(HttpStatusCategory category) {
        String info = switch (category) {
            case HttpStatusCategory.Success     s -> "[2xx 成功] " + s.code() + " リクエスト成功";
            case HttpStatusCategory.Redirect    s -> "[3xx リダイレクト] " + s.code() + " 別の URL に移動";
            case HttpStatusCategory.ClientError s -> "[4xx クライアントエラー] " + s.code() + " リクエスト内容に問題";
            case HttpStatusCategory.ServerError s -> "[5xx サーバーエラー] " + s.code() + " サーバー側の問題";
            case HttpStatusCategory.Unknown     s -> "[不明] " + s.code();
        };
        System.out.println(info);
    }

    // TCP ソケットで HTTP GET リクエストを送信
    static HttpResponse sendGet(String host, int port, String path) throws IOException {
        try (var socket = new Socket(host, port)) {
            var request = "GET " + path + " HTTP/1.1\r\n"
                    + "Host: " + host + "\r\n"
                    + "User-Agent: JavaSocketClient/1.0\r\n"
                    + "Connection: close\r\n"
                    + "\r\n";

            var writer = new PrintWriter(new OutputStreamWriter(socket.getOutputStream()), true);
            writer.print(request);
            writer.flush();

            var reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

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

            var headers = new LinkedHashMap<String, String>();
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                int colon = line.indexOf(':');
                if (colon > 0) {
                    headers.put(line.substring(0, colon).trim().toLowerCase(),
                                line.substring(colon + 1).trim());
                }
            }

            var body = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                body.append(line).append("\n");
            }

            return new HttpResponse(statusCode, statusMessage, headers, body.toString());
        }
    }

    public static void main(String[] args) {
        System.out.println("=== HTTP の仕組みデモ（Java 21 版） ===");
        System.out.println();

        try {
            var response = sendGet("example.com", 80, "/");
            printStatusInfo(classify(response.statusCode()));
            System.out.println("Content-Type: " + response.header("content-type"));
            int len = Math.min(response.body().length(), 200);
            System.out.println("ボディ（先頭 " + len + " 文字）: " + response.body().substring(0, len));
        } catch (IOException e) {
            System.out.println("接続エラー: " + e.getMessage());
        }

        // 各種ステータスコードの分類デモ
        System.out.println("\n=== ステータスコード分類デモ ===");
        for (int code : new int[]{200, 301, 404, 500, 999}) {
            printStatusInfo(classify(code));
        }

        System.out.println();
        System.out.println("注意: 実務では N-01（HttpClient）を使用してください");
    }
}
