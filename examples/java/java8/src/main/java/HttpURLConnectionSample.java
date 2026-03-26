import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HttpURLConnectionSample {

    // 接続タイムアウト（ミリ秒）
    private static final int CONNECT_TIMEOUT_MS = 5000;
    // 読み取りタイムアウト（ミリ秒）
    private static final int READ_TIMEOUT_MS = 10000;

    /**
     * GET リクエストを送信してレスポンスボディを返す。
     */
    public static String get(String urlStr) throws IOException {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        try {
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);
            conn.setRequestProperty("Accept", "application/json");

            int status = conn.getResponseCode();
            System.out.println("ステータスコード: " + status);

            if (status >= 400) {
                // エラー時は getErrorStream() からレスポンスを読む
                try (BufferedReader br = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    String body = readAll(br);
                    throw new IOException("HTTP エラー " + status + ": " + body);
                }
            }
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                return readAll(br);
            }
        } finally {
            conn.disconnect(); // 接続を明示的に切断する
        }
    }

    /**
     * POST リクエストを送信してレスポンスボディを返す。
     */
    public static String post(String urlStr, String jsonBody) throws IOException {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        try {
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);
            conn.setDoOutput(true); // リクエストボディの送信を有効化
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Accept", "application/json");

            // リクエストボディを書き込む
            byte[] bodyBytes = jsonBody.getBytes(StandardCharsets.UTF_8);
            conn.setRequestProperty("Content-Length", String.valueOf(bodyBytes.length));
            try (OutputStream os = conn.getOutputStream()) {
                os.write(bodyBytes);
            }

            int status = conn.getResponseCode();
            System.out.println("ステータスコード: " + status);

            if (status >= 400) {
                try (BufferedReader br = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    throw new IOException("HTTP エラー " + status + ": " + readAll(br));
                }
            }
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                return readAll(br);
            }
        } finally {
            conn.disconnect();
        }
    }

    /**
     * レスポンスヘッダーを取得する例。
     */
    public static void showHeaders(String urlStr) throws IOException {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        try {
            conn.setRequestMethod("HEAD"); // HEAD リクエストはボディを返さない
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);
            conn.connect();

            System.out.println("Content-Type: " + conn.getContentType());
            System.out.println("Content-Length: " + conn.getContentLength());
            System.out.println("Last-Modified: " + conn.getLastModified());
        } finally {
            conn.disconnect();
        }
    }

    // レスポンスの全行を1つの文字列に結合するヘルパー
    private static String readAll(BufferedReader br) throws IOException {
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    public static void main(String[] args) throws Exception {
        // 実際のエンドポイントに差し替えて実行してください
        // String response = get("https://httpbin.org/get");
        // System.out.println(response);

        // POST リクエスト例
        // String body = "{\"name\":\"山田太郎\",\"age\":30}";
        // String response = post("https://httpbin.org/post", body);
        // System.out.println(response);

        System.out.println("HttpURLConnectionSample: 実際の URL に差し替えて実行してください。");
        System.out.println("例: String response = get(\"https://httpbin.org/get\");");
    }
}
