import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class MinimalHttpServerSample {

    static final int PORT = 8080;

    // HTTP レスポンスを組み立てて送信
    static void sendResponse(OutputStream out, int statusCode,
                              String statusMessage, String contentType,
                              String body) throws IOException {
        var writer = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true);
        var bodyBytes = body.getBytes("UTF-8");
        writer.print("HTTP/1.1 " + statusCode + " " + statusMessage + "\r\n");
        writer.print("Content-Type: " + contentType + "; charset=UTF-8\r\n");
        writer.print("Content-Length: " + bodyBytes.length + "\r\n");
        writer.print("Connection: close\r\n");
        writer.print("\r\n");
        writer.flush();
        out.write(bodyBytes);
        out.flush();
    }

    static String[] parseRequestLine(String requestLine) {
        if (requestLine == null || requestLine.isEmpty()) {
            return new String[]{"GET", "/", "HTTP/1.1"};
        }
        var parts = requestLine.split(" ");
        if (parts.length < 2) {
            return new String[]{"GET", "/", "HTTP/1.1"};
        }
        return parts;
    }

    // リクエストを処理してレスポンスを返す
    static void handleRequest(Socket clientSocket) throws IOException {
        try (var in = clientSocket.getInputStream();
             var out = clientSocket.getOutputStream()) {

            var reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));
            var requestLine = reader.readLine();
            System.out.println("リクエスト: " + requestLine);

            // ヘッダーを読み飛ばす
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                // ヘッダー行を読み飛ばす
            }

            var parts = parseRequestLine(requestLine);
            var method = parts[0];
            var path = parts.length > 1 ? parts[1] : "/";

            if ("GET".equals(method)) {
                // Java 21: switch 式でパスのルーティングをシンプルに記述
                var response = switch (path) {
                    case "/" -> {
                        var html = """
                                <html><body>
                                <h1>Hello, Java HTTP Server!</h1>
                                <p>Socket ベースの最小 HTTP サーバーです。</p>
                                <p><a href='/hello'>Hello ページへ</a></p>
                                </body></html>
                                """;
                        yield new String[]{"200", "OK", "text/html", html};
                    }
                    case "/hello" -> new String[]{"200", "OK", "text/plain", "Hello, World!"};
                    default -> new String[]{"404", "Not Found", "text/html",
                        "<html><body><h1>404 Not Found</h1></body></html>"};
                };
                sendResponse(out, Integer.parseInt(response[0]), response[1], response[2], response[3]);
            } else {
                sendResponse(out, 405, "Method Not Allowed", "text/plain",
                    "405 Method Not Allowed");
            }
        }
    }

    public static void main(String[] args) throws IOException {
        System.out.println("HTTP サーバー起動中... http://localhost:" + PORT);
        System.out.println("Java 21: Virtual Thread（仮想スレッド）で各リクエストを処理");

        try (var serverSocket = new ServerSocket(PORT)) {
            while (true) {
                var clientSocket = serverSocket.accept();
                // Java 21: Virtual Thread でリクエストごとに軽量スレッドを生成
                Thread.ofVirtual().start(() -> {
                    try {
                        handleRequest(clientSocket);
                    } catch (IOException e) {
                        System.out.println("エラー: " + e.getMessage());
                    } finally {
                        try { clientSocket.close(); } catch (IOException ignored) {}
                    }
                });
            }
        }
    }
}
