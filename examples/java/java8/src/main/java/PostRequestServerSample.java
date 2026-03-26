import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class PostRequestServerSample {

    static final int PORT = 8081;

    // URL エンコードされたフォームデータをパース
    // 例: "name=%E7%94%B0%E4%B8%AD&age=30" → {"name": "田中", "age": "30"}
    static Map<String, String> parseFormData(String body) throws UnsupportedEncodingException {
        Map<String, String> params = new HashMap<>();
        if (body == null || body.isEmpty()) {
            return params;
        }
        String[] pairs = body.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=", 2);
            String key = URLDecoder.decode(kv[0], "UTF-8");
            String value = kv.length > 1 ? URLDecoder.decode(kv[1], "UTF-8") : "";
            params.put(key, value);
        }
        return params;
    }

    static void sendResponse(OutputStream out, int status, String statusMsg,
                              String contentType, String body) throws IOException {
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true);
        byte[] bodyBytes = body.getBytes("UTF-8");
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
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true);
        writer.print("HTTP/1.1 303 See Other\r\n");
        writer.print("Location: " + location + "\r\n");
        writer.print("Content-Length: 0\r\n");
        writer.print("Connection: close\r\n");
        writer.print("\r\n");
        writer.flush();
    }

    static void handleRequest(Socket socket) throws IOException {
        try (InputStream in = socket.getInputStream();
             OutputStream out = socket.getOutputStream()) {
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(in, "UTF-8"));

            // リクエスト行
            String requestLine = reader.readLine();
            if (requestLine == null) return;
            System.out.println("リクエスト: " + requestLine);
            String[] parts = requestLine.split(" ");
            String method = parts[0];
            String path = parts.length > 1 ? parts[1] : "/";

            // ヘッダー読み取り（Content-Length を取得）
            Map<String, String> headers = new HashMap<>();
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                int idx = line.indexOf(':');
                if (idx > 0) {
                    headers.put(line.substring(0, idx).trim().toLowerCase(),
                                line.substring(idx + 1).trim());
                }
            }

            // POST ボディ読み取り
            String body = "";
            if ("POST".equals(method)) {
                String contentLength = headers.get("content-length");
                if (contentLength != null) {
                    int length = Integer.parseInt(contentLength);
                    char[] buf = new char[length];
                    reader.read(buf, 0, length);
                    body = new String(buf);
                }
            }

            // ルーティング
            if ("GET".equals(method) && "/".equals(path)) {
                sendResponse(out, 200, "OK", "text/html",
                    "<html><body>"
                    + "<h1>フォームデモ</h1>"
                    + "<form method='POST' action='/submit'>"
                    + "名前: <input name='name'><br>"
                    + "年齢: <input name='age' type='number'><br>"
                    + "<button>送信</button>"
                    + "</form></body></html>");
            } else if ("POST".equals(method) && "/submit".equals(path)) {
                Map<String, String> params = parseFormData(body);
                System.out.println("フォームデータ: " + params);
                sendRedirect(out, "/result?name=" + params.getOrDefault("name", ""));
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
        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("HTTP サーバー起動中... http://localhost:" + PORT);
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket client = serverSocket.accept();
                executor.submit(() -> {
                    try { handleRequest(client); }
                    catch (IOException e) { System.out.println("エラー: " + e.getMessage()); }
                    finally { try { client.close(); } catch (IOException ignored) {} }
                });
            }
        }
    }
}
