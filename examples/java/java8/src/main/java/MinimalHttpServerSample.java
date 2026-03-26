import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MinimalHttpServerSample {

    static final int PORT = 8080;

    // HTTP レスポンスを組み立てて送信
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

    // HTTP リクエスト行をパース（例: "GET /hello HTTP/1.1"）
    static String[] parseRequestLine(String requestLine) {
        if (requestLine == null || requestLine.isEmpty()) {
            return new String[]{"GET", "/", "HTTP/1.1"};
        }
        String[] parts = requestLine.split(" ");
        if (parts.length < 2) {
            return new String[]{"GET", "/", "HTTP/1.1"};
        }
        return parts;
    }

    // リクエストを処理してレスポンスを返す
    static void handleRequest(Socket clientSocket) throws IOException {
        try (InputStream in = clientSocket.getInputStream();
             OutputStream out = clientSocket.getOutputStream()) {

            BufferedReader reader = new BufferedReader(
                new InputStreamReader(in, "UTF-8"));

            // リクエスト行を読む（例: GET /hello HTTP/1.1）
            String requestLine = reader.readLine();
            System.out.println("リクエスト: " + requestLine);

            // ヘッダーを読み飛ばす
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                // ヘッダー行を読み飛ばす
            }

            String[] parts = parseRequestLine(requestLine);
            String method = parts[0];
            String path = parts.length > 1 ? parts[1] : "/";

            // パスに応じてレスポンスを返す
            if ("GET".equals(method)) {
                if ("/".equals(path)) {
                    sendResponse(out, 200, "OK", "text/html",
                        "<html><body><h1>Hello, Java HTTP Server!</h1>"
                        + "<p>Socket ベースの最小 HTTP サーバーです。</p>"
                        + "<p><a href='/hello'>Hello ページへ</a></p>"
                        + "</body></html>");
                } else if ("/hello".equals(path)) {
                    sendResponse(out, 200, "OK", "text/plain",
                        "Hello, World!");
                } else {
                    sendResponse(out, 404, "Not Found", "text/html",
                        "<html><body><h1>404 Not Found</h1></body></html>");
                }
            } else {
                sendResponse(out, 405, "Method Not Allowed", "text/plain",
                    "405 Method Not Allowed");
            }
        }
    }

    public static void main(String[] args) throws IOException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("HTTP サーバー起動中... http://localhost:" + PORT);

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                executor.submit(() -> {
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
