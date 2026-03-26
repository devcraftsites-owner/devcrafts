import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HttpURLConnectionSample {

    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 10000;

    /**
     * GET リクエストを送信してレスポンスボディを返す。
     */
    public static String get(String urlStr) throws IOException {
        var conn = (HttpURLConnection) new URL(urlStr).openConnection();
        try {
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);
            conn.setRequestProperty("Accept", "application/json");

            var status = conn.getResponseCode();
            System.out.println("ステータスコード: " + status);

            if (status >= 400) {
                try (var br = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    throw new IOException("HTTP エラー " + status + ": " + readAll(br));
                }
            }
            try (var br = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                return readAll(br);
            }
        } finally {
            conn.disconnect();
        }
    }

    /**
     * POST リクエストを送信してレスポンスボディを返す。
     */
    public static String post(String urlStr, String jsonBody) throws IOException {
        var conn = (HttpURLConnection) new URL(urlStr).openConnection();
        try {
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            conn.setRequestProperty("Accept", "application/json");

            var bodyBytes = jsonBody.getBytes(StandardCharsets.UTF_8);
            conn.setRequestProperty("Content-Length", String.valueOf(bodyBytes.length));
            try (OutputStream os = conn.getOutputStream()) {
                os.write(bodyBytes);
            }

            var status = conn.getResponseCode();
            System.out.println("ステータスコード: " + status);

            if (status >= 400) {
                try (var br = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    throw new IOException("HTTP エラー " + status + ": " + readAll(br));
                }
            }
            try (var br = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                return readAll(br);
            }
        } finally {
            conn.disconnect();
        }
    }

    private static String readAll(BufferedReader br) throws IOException {
        var sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("HttpURLConnectionSample: 実際の URL に差し替えて実行してください。");
        System.out.println("例: var response = get(\"https://httpbin.org/get\");");
    }
}
