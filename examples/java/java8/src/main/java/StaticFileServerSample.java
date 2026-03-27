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
        PrintWriter writer = new PrintWriter(
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
        String path = "/".equals(requestPath) ? "/index.html" : requestPath;
        File file = new File(DOCUMENT_ROOT, path);
        File canonicalRoot = DOCUMENT_ROOT.getCanonicalFile();
        File canonicalFile = file.getCanonicalFile();
        if (!canonicalFile.getPath().startsWith(canonicalRoot.getPath())) {
            return null;
        }
        return canonicalFile;
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
                // ヘッダーは読み飛ばす
            }

            String[] parts = requestLine.split(" ");
            String method = parts[0];
            String path = parts.length > 1 ? parts[1] : "/";

            if (!"GET".equals(method)) {
                sendBytes(out, 405, "Method Not Allowed",
                    "text/plain; charset=UTF-8",
                    "405 Method Not Allowed".getBytes("UTF-8"));
                return;
            }

            File file = resolvePath(path);
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

            byte[] bodyBytes = Files.readAllBytes(file.toPath());
            sendBytes(out, 200, "OK",
                guessContentType(file.getName()), bodyBytes);
        }
    }

    public static void main(String[] args) throws IOException {
        if (!DOCUMENT_ROOT.exists()) {
            DOCUMENT_ROOT.mkdirs();
            File index = new File(DOCUMENT_ROOT, "index.html");
            Writer writer = new OutputStreamWriter(
                new FileOutputStream(index), StandardCharsets.UTF_8);
            writer.write("<html><body><h1>Static File Server</h1>"
                + "<p>static/index.html を配信しています。</p>"
                + "</body></html>");
            writer.close();
        }

        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("Static File Server 起動中... http://localhost:" + PORT);

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
