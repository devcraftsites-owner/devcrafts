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

    // ① レスポンス結果を sealed interface で型安全に表現（Java 17+）
    sealed interface HttpResult permits HttpResult.Ok, HttpResult.Err {
        record Ok(int status, String body)  implements HttpResult {}
        record Err(int status, String body) implements HttpResult {}
    }

    /**
     * GET リクエストを実行して HttpResult を返す。
     */
    public static HttpResult get(String urlStr) throws IOException {
        var conn = (HttpURLConnection) new URL(urlStr).openConnection();
        try {
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);
            conn.setRequestProperty("Accept", "application/json");
            conn.connect();

            var status = conn.getResponseCode();
            var stream = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
            try (var br = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                var body = readAll(br);
                return status >= 400 ? new HttpResult.Err(status, body) : new HttpResult.Ok(status, body);
            }
        } finally {
            conn.disconnect();
        }
    }

    /**
     * POST リクエストを実行して HttpResult を返す。
     */
    public static HttpResult post(String urlStr, String jsonBody) throws IOException {
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
            var stream = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
            try (var br = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                var body = readAll(br);
                return status >= 400 ? new HttpResult.Err(status, body) : new HttpResult.Ok(status, body);
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
        // ② sealed interface + pattern matching switch でレスポンスを処理
        // HttpResult result = get("https://httpbin.org/get");
        // String message = switch (result) {
        //     case HttpResult.Ok  r -> "成功 " + r.status() + ": " + r.body();
        //     case HttpResult.Err r -> "失敗 " + r.status() + ": " + r.body();
        // };
        // System.out.println(message);

        System.out.println("HttpURLConnectionSample: 実際の URL に差し替えて実行してください。");
    }
}
