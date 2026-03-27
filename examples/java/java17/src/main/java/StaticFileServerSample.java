import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class StaticFileServerSample {

    static final int PORT = 8084;
    static final File DOCUMENT_ROOT = new File("static");

    static void sendBytes(OutputStream out, int statusCode,
                          String statusMessage, String contentType,
                          byte[] bodyBytes) throws IOException {
        var writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        writer.print("HTTP/1.1 " + statusCode + " " + statusMessage + "\r\n");
        writer.print("Content-Type: " + contentType + "\r\n");
        writer.print("Content-Length: " + bodyBytes.length + "\r\n");
        writer.print("Connection: close\r\n\r\n");
        writer.flush();
        out.write(bodyBytes);
        out.flush();
    }

    static String guessContentType(String path) {
        if (path.endsWith(".html")) return "text/html; charset=UTF-8";
        if (path.endsWith(".css")) return "text/css; charset=UTF-8";
        if (path.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (path.endsWith(".txt")) return "text/plain; charset=UTF-8";
        if (path.endsWith(".png")) return "image/png";
        return "application/octet-stream";
    }

    static File resolvePath(String requestPath) throws IOException {
        var path = "/".equals(requestPath) ? "/index.html" : requestPath;
        var file = new File(DOCUMENT_ROOT, path);
        var canonicalRoot = DOCUMENT_ROOT.getCanonicalFile();
        var canonicalFile = file.getCanonicalFile();
        if (!canonicalFile.getPath().startsWith(canonicalRoot.getPath())) {
            return null;
        }
        return canonicalFile;
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
                // ヘッダーは読み飛ばす
            }

            var parts = requestLine.split(" ");
            var method = parts[0];
            var path = parts.length > 1 ? parts[1] : "/";

            if (!"GET".equals(method)) {
                sendBytes(out, 405, "Method Not Allowed",
                    "text/plain; charset=UTF-8",
                    "405 Method Not Allowed".getBytes("UTF-8"));
                return;
            }

            var file = resolvePath(path);
            if (file == null) {
                sendBytes(out, 403, "Forbidden",
                    "text/plain; charset=UTF-8",
                    "403 Forbidden".getBytes("UTF-8"));
                return;
            }
            if (!file.exists() || file.isDirectory()) {
                sendBytes(out, 404, "Not Found",
                    "text/plain; charset=UTF-8",
                    "404 Not Found".getBytes("UTF-8"));
                return;
            }

            var bodyBytes = Files.readAllBytes(file.toPath());
            sendBytes(out, 200, "OK",
                guessContentType(file.getName()), bodyBytes);
        }
    }

    public static void main(String[] args) throws IOException {
        if (!DOCUMENT_ROOT.exists()) {
            DOCUMENT_ROOT.mkdirs();
            var index = new File(DOCUMENT_ROOT, "index.html");
            try (var writer = new OutputStreamWriter(
                    new FileOutputStream(index), StandardCharsets.UTF_8)) {
                writer.write("""
                    <html><body>
                    <h1>Static File Server</h1>
                    <p>static/index.html を配信しています。</p>
                    </body></html>
                    """);
            }
        }

        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("Static File Server 起動中... http://localhost:" + PORT);

        try (var serverSocket = new ServerSocket(PORT)) {
            while (true) {
                var clientSocket = serverSocket.accept();
                executor.submit(() -> {
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
