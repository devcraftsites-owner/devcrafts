import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

// Java 11 以降で使える HttpClient（Java 8 の HttpURLConnection より簡潔）
public class HttpClientSample {

    // ① HttpClient はスレッドセーフなので static final で使い回す
    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    // ② GETリクエスト（同期）
    public static String get(String url) throws IOException, InterruptedException {
        var request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Accept", "application/json")
                .GET()
                .build();

        var response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("HTTPエラー: " + response.statusCode());
        }
        return response.body();
    }

    // ③ POSTリクエスト（JSON ボディ）
    public static String post(String url, String jsonBody)
            throws IOException, InterruptedException {
        var request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        var response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("HTTPエラー: " + response.statusCode());
        }
        return response.body();
    }

    // ④ ステータスコードとボディの両方を取得したい場合
    public static void getWithStatus(String url) throws IOException, InterruptedException {
        var request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        var response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("ステータス: " + response.statusCode());
        System.out.println("ボディ（先頭200文字）: " +
                response.body().substring(0, Math.min(200, response.body().length())));
    }

    public static void main(String[] args) throws IOException, InterruptedException {
        // ※ 実際のAPIを叩く場合は適切なURLに変更してください

        // GETリクエスト例
        // String response = get("https://httpbin.org/get");
        // System.out.println(response);

        // POSTリクエスト例
        // String body = "{\"name\":\"太郎\",\"age\":25}";
        // String response = post("https://httpbin.org/post", body);
        // System.out.println(response);

        System.out.println("HttpClientSample: Java 11+ の HttpClient を使います。");
        System.out.println("HttpURLConnection より簡潔に書けます（Java 8 タブと比較してください）。");
    }
}
