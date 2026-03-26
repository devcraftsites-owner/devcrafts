import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.List;

public class HttpClientSample {

    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    // ① 同期GETリクエスト（Java 17 と同じ）
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

    // ② 非同期GETリクエスト（Java 21: CompletableFuture + sendAsync）
    //    複数のAPIを並行して呼び出すときに有効
    public static CompletableFuture<String> getAsync(String url) {
        var request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        return CLIENT.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    if (response.statusCode() < 200 || response.statusCode() >= 300) {
                        throw new RuntimeException("HTTPエラー: " + response.statusCode());
                    }
                    return response.body();
                });
    }

    // ③ 複数URLを並行取得（allOf で全完了を待つ）
    public static List<String> getAll(List<String> urls)
            throws Exception {
        var futures = urls.stream()
                .map(HttpClientSample::getAsync)
                .toList();

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        return futures.stream()
                .map(CompletableFuture::join)
                .toList();
    }

    // ④ POSTリクエスト（JSON ボディ）
    public static String post(String url, String jsonBody)
            throws IOException, InterruptedException {
        var request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        var response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("HTTPエラー: " + response.statusCode());
        }
        return response.body();
    }

    public static void main(String[] args) throws Exception {
        // ※ 実際のAPIを叩く場合は適切なURLに変更してください

        // 非同期GET例
        // getAsync("https://httpbin.org/get")
        //         .thenAccept(body -> System.out.println("非同期レスポンス: " + body))
        //         .join();

        // 並行取得例
        // var urls = List.of("https://httpbin.org/get", "https://httpbin.org/ip");
        // var results = getAll(urls);
        // results.forEach(System.out::println);

        System.out.println("HttpClientSample: Java 21 では sendAsync + CompletableFuture で非同期処理できます。");
    }
}
