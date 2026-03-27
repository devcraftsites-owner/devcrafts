import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class HttpQueryServerSample {

    static final int PORT = 8083;

    static void sendResponse(OutputStream out, int statusCode,
                             String statusMessage, String contentType,
                             String body) throws IOException {
        PrintWriter writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        byte[] bodyBytes = body.getBytes("UTF-8");
        writer.print("HTTP/1.1 " + statusCode + " " + statusMessage + "\r\n");
        writer.print("Content-Type: " + contentType + "; charset=UTF-8\r\n");
        writer.print("Content-Length: " + bodyBytes.length + "\r\n");
        writer.print("Connection: close\r\n");
        writer.print("\r\n");
        writer.flush();
        out.write(bodyBytes);
        out.flush();
    }

    static Map<String, String> parseQuery(String rawQuery)
            throws UnsupportedEncodingException {
        Map<String, String> params = new HashMap<String, String>();
        if (rawQuery == null || rawQuery.isEmpty()) {
            return params;
        }
        String[] pairs = rawQuery.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=", 2);
            String key = URLDecoder.decode(kv[0], "UTF-8");
            String value = kv.length > 1
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
        try (InputStream in = clientSocket.getInputStream();
             OutputStream out = clientSocket.getOutputStream()) {
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(in, "UTF-8"));
            String requestLine = reader.readLine();
            if (requestLine == null || requestLine.isEmpty()) {
                return;
            }

            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                // ヘッダーは今回は読み飛ばす
            }

            String[] parts = requestLine.split(" ");
            String method = parts[0];
            String target = parts.length > 1 ? parts[1] : "/";

            if (!"GET".equals(method)) {
                sendResponse(out, 405, "Method Not Allowed",
                    "text/plain", "405 Method Not Allowed");
                return;
            }

            String path = target;
            String rawQuery = "";
            int queryIndex = target.indexOf('?');
            if (queryIndex >= 0) {
                path = target.substring(0, queryIndex);
                rawQuery = target.substring(queryIndex + 1);
            }

            Map<String, String> params = parseQuery(rawQuery);

            if ("/".equals(path)) {
                String html = "<html><body>"
                    + "<h1>クエリパラメータデモ</h1>"
                    + "<form method='GET' action='/search'>"
                    + "<input name='keyword' placeholder='検索語'>"
                    + "<button>検索</button>"
                    + "</form>"
                    + "<p><a href='/hello?name=Java'>/hello?name=Java</a></p>"
                    + "</body></html>";
                sendResponse(out, 200, "OK", "text/html", html);
            } else if ("/hello".equals(path)) {
                String name = params.containsKey("name")
                    ? params.get("name") : "Guest";
                sendResponse(out, 200, "OK", "text/plain",
                    "Hello, " + name + "!");
            } else if ("/search".equals(path)) {
                String keyword = params.containsKey("keyword")
                    ? params.get("keyword") : "";
                String html = "<html><body>"
                    + "<h1>検索結果</h1>"
                    + "<p>keyword = " + escapeHtml(keyword) + "</p>"
                    + "<p><a href='/'>戻る</a></p>"
                    + "</body></html>";
                sendResponse(out, 200, "OK", "text/html", html);
            } else {
                sendResponse(out, 404, "Not Found", "text/plain",
                    "404 Not Found");
            }
        }
    }

    public static void main(String[] args) throws IOException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("HTTP Query Server 起動中... http://localhost:" + PORT);

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                final Socket clientSocket = serverSocket.accept();
                executor.submit(new Runnable() {
                    @Override
                    public void run() {
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
                    }
                });
            }
        }
    }
}
