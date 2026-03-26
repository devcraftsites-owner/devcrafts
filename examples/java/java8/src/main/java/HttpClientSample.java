import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

// Java 8 では HttpURLConnection を使う
// Java 11 以降の HttpClient については Java 17+ タブを参照
public class HttpClientSample {

    // ① GETリクエスト（HttpURLConnection）
    public static String get(String urlString) throws IOException {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(urlString);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(10000);
            conn.setRequestProperty("Accept", "application/json");

            int status = conn.getResponseCode();
            if (status < 200 || status >= 300) {
                throw new IOException("HTTPエラー: " + status + " " + conn.getResponseMessage());
            }

            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            return sb.toString();
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    // ② POSTリクエスト（JSON ボディ）
    public static String post(String urlString, String jsonBody) throws IOException {
        HttpURLConnection conn = null;
        try {
            URL url = new URL(urlString);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(10000);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true); // リクエストボディを送信するために必要

            // リクエストボディを書き込む
            try (OutputStreamWriter writer = new OutputStreamWriter(
                    conn.getOutputStream(), StandardCharsets.UTF_8)) {
                writer.write(jsonBody);
            }

            int status = conn.getResponseCode();
            if (status < 200 || status >= 300) {
                throw new IOException("HTTPエラー: " + status + " " + conn.getResponseMessage());
            }

            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            return sb.toString();
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    public static void main(String[] args) throws IOException {
        // ※ 実際のAPIを叩く場合は適切なURLに変更してください
        //    以下の例は httpbin.org（テスト用のHTTPサービス）を使用しています

        // GETリクエスト例
        // String response = get("https://httpbin.org/get");
        // System.out.println(response);

        // POSTリクエスト例
        // String body = "{\"name\":\"太郎\",\"age\":25}";
        // String response = post("https://httpbin.org/post", body);
        // System.out.println(response);

        System.out.println("HttpClientSample: Java 8 では HttpURLConnection を使います。");
        System.out.println("Java 11 以降では HttpClient が追加され、よりシンプルに書けます。");
    }
}
