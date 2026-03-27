import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

public class HttpQueryServerSample {

    static final int PORT = 8083;

    static void sendResponse(OutputStream out, int statusCode,
                             String statusMessage, String contentType,
                             String body) throws IOException {
        var writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        var bodyBytes = body.getBytes("UTF-8");
        writer.print("HTTP/1.1 " + statusCode + " " + statusMessage + "\r\n");
        writer.print("Content-Type: " + contentType + "; charset=UTF-8\r\n");
        writer.print("Content-Length: " + bodyBytes.length + "\r\n");
        writer.print("Connection: close\r\n\r\n");
        writer.flush();
        out.write(bodyBytes);
        out.flush();
    }

    static Map<String, String> parseQuery(String rawQuery)
            throws UnsupportedEncodingException {
        var params = new HashMap<String, String>();
        if (rawQuery == null || rawQuery.isEmpty()) {
            return params;
        }
        for (var pair : rawQuery.split("&")) {
            var kv = pair.split("=", 2);
            var key = URLDecoder.decode(kv[0], "UTF-8");
            var value = kv.length > 1
                ? URLDecoder.decode(kv[1], "UTF-8") : "";
            params.put(key, value);
        }
        return params;
    }

    static String escapeHtml(String text) {
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;");
    }

    static void handleRequest(Socket clientSocket) throws IOException {
        try (var in = clientSocket.getInputStream();
             var out = clientSocket.getOutputStream()) {
            var reader = new BufferedReader(
                new InputStreamReader(in, "UTF-8"));
            var requestLine = reader.readLine();
            if (requestLine == null || requestLine.isEmpty()) {
                return;
            }

            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                // ヘッダーは今回は読み飛ばす
            }

            var parts = requestLine.split(" ");
            var method = parts[0];
            var target = parts.length > 1 ? parts[1] : "/";

            if (!"GET".equals(method)) {
                sendResponse(out, 405, "Method Not Allowed",
                    "text/plain", "405 Method Not Allowed");
                return;
            }

            var path = target;
            var rawQuery = "";
            var queryIndex = target.indexOf('?');
            if (queryIndex >= 0) {
                path = target.substring(0, queryIndex);
                rawQuery = target.substring(queryIndex + 1);
            }

            var params = parseQuery(rawQuery);
            var response = switch (path) {
                case "/" -> """
                    <html><body>
                    <h1>クエリパラメータデモ</h1>
                    <form method='GET' action='/search'>
                    <input name='keyword' placeholder='検索語'>
                    <button>検索</button>
                    </form>
                    <p><a href='/hello?name=Java'>/hello?name=Java</a></p>
                    </body></html>
                    """;
                case "/hello" -> "Hello, "
                    + params.getOrDefault("name", "Guest") + "!";
                case "/search" -> """
                    <html><body>
                    <h1>検索結果</h1>
                    <p>keyword = %s</p>
                    <p><a href='/'>戻る</a></p>
                    </body></html>
                    """.formatted(
                        escapeHtml(params.getOrDefault("keyword", "")));
                default -> null;
            };

            if (response == null) {
                sendResponse(out, 404, "Not Found",
                    "text/plain", "404 Not Found");
            } else if ("/hello".equals(path)) {
                sendResponse(out, 200, "OK", "text/plain", response);
            } else {
                sendResponse(out, 200, "OK", "text/html", response);
            }
        }
    }

    public static void main(String[] args) throws IOException {
        System.out.println("HTTP Query Server 起動中... http://localhost:" + PORT);

        try (var serverSocket = new ServerSocket(PORT)) {
            while (true) {
                var clientSocket = serverSocket.accept();
                Thread.ofVirtual().start(() -> {
                    try {
                        handleRequest(clientSocket);
                    } catch (IOException e) {
                        System.out.println("エラー: " + e.getMessage());
                    } finally {
                        try {
                            clientSocket.close();
                        } catch (IOException ignored) {
                        }
                    }
                });
            }
        }
    }
}
