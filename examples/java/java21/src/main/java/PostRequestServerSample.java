import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

public class PostRequestServerSample {

    static final int PORT = 8081;

    // Java 21: record でフォームデータを不変クラスとして表現
    record FormData(String name, String age) {
        boolean isValid() {
            return name != null && !name.isEmpty();
        }
    }

    // URL エンコードされたフォームデータをパース
    static Map<String, String> parseFormData(String body) throws UnsupportedEncodingException {
        var params = new HashMap<String, String>();
        if (body == null || body.isEmpty()) {
            return params;
        }
        for (var pair : body.split("&")) {
            var kv = pair.split("=", 2);
            var key = URLDecoder.decode(kv[0], "UTF-8");
            var value = kv.length > 1 ? URLDecoder.decode(kv[1], "UTF-8") : "";
            params.put(key, value);
        }
        return params;
    }

    static void sendResponse(OutputStream out, int status, String statusMsg,
                              String contentType, String body) throws IOException {
        var writer = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true);
        var bodyBytes = body.getBytes("UTF-8");
        writer.print("HTTP/1.1 " + status + " " + statusMsg + "\r\n");
        writer.print("Content-Type: " + contentType + "; charset=UTF-8\r\n");
        writer.print("Content-Length: " + bodyBytes.length + "\r\n");
        writer.print("Connection: close\r\n");
        writer.print("\r\n");
        writer.flush();
        out.write(bodyBytes);
        out.flush();
    }

    static void sendRedirect(OutputStream out, String location) throws IOException {
        var writer = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true);
        writer.print("HTTP/1.1 303 See Other\r\n");
        writer.print("Location: " + location + "\r\n");
        writer.print("Content-Length: 0\r\n");
        writer.print("Connection: close\r\n");
        writer.print("\r\n");
        writer.flush();
    }

    static void handleRequest(Socket socket) throws IOException {
        try (var in = socket.getInputStream();
             var out = socket.getOutputStream()) {
            var reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));

            var requestLine = reader.readLine();
            if (requestLine == null) return;
            System.out.println("リクエスト: " + requestLine);
            var parts = requestLine.split(" ");
            var method = parts[0];
            var path = parts.length > 1 ? parts[1] : "/";

            var headers = new HashMap<String, String>();
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                int idx = line.indexOf(':');
                if (idx > 0) {
                    headers.put(line.substring(0, idx).trim().toLowerCase(),
                                line.substring(idx + 1).trim());
                }
            }

            var body = "";
            if ("POST".equals(method)) {
                var contentLength = headers.get("content-length");
                if (contentLength != null) {
                    int length = Integer.parseInt(contentLength);
                    var buf = new char[length];
                    reader.read(buf, 0, length);
                    body = new String(buf);
                }
            }

            // Java 21: switch 式でルーティングをシンプルに記述
            if ("GET".equals(method) && "/".equals(path)) {
                var html = """
                        <html><body>
                        <h1>フォームデモ</h1>
                        <form method='POST' action='/submit'>
                        名前: <input name='name'><br>
                        年齢: <input name='age' type='number'><br>
                        <button>送信</button>
                        </form></body></html>
                        """;
                sendResponse(out, 200, "OK", "text/html", html);
            } else if ("POST".equals(method) && "/submit".equals(path)) {
                var paramMap = parseFormData(body);
                var formData = new FormData(
                    paramMap.getOrDefault("name", ""),
                    paramMap.getOrDefault("age", "")
                );
                System.out.println("フォームデータ: " + formData);
                sendRedirect(out, "/result?name=" + formData.name());
            } else if ("GET".equals(method) && path.startsWith("/result")) {
                sendResponse(out, 200, "OK", "text/html",
                    "<html><body><h1>送信完了</h1><p>"
                    + path + "</p><a href='/'>戻る</a></body></html>");
            } else {
                sendResponse(out, 404, "Not Found", "text/plain", "404 Not Found");
            }
        }
    }

    public static void main(String[] args) throws IOException {
        System.out.println("HTTP サーバー起動中... http://localhost:" + PORT);
        System.out.println("Java 21: Virtual Thread（仮想スレッド）で各リクエストを処理");

        try (var serverSocket = new ServerSocket(PORT)) {
            while (true) {
                var client = serverSocket.accept();
                // Java 21: Virtual Thread でリクエストごとに軽量スレッドを生成
                Thread.ofVirtual().start(() -> {
                    try { handleRequest(client); }
                    catch (IOException e) { System.out.println("エラー: " + e.getMessage()); }
                    finally { try { client.close(); } catch (IOException ignored) {} }
                });
            }
        }
    }
}
