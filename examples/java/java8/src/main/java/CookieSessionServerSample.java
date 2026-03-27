import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CookieSessionServerSample {

    static final int PORT = 8085;
    static final Map<String, String> SESSIONS =
        new ConcurrentHashMap<String, String>();

    static void sendResponse(OutputStream out, int statusCode,
                             String statusMessage, String contentType,
                             String body, String setCookie) throws IOException {
        PrintWriter writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        byte[] bodyBytes = body.getBytes("UTF-8");
        writer.print("HTTP/1.1 " + statusCode + " " + statusMessage + "\r\n");
        writer.print("Content-Type: " + contentType + "; charset=UTF-8\r\n");
        writer.print("Content-Length: " + bodyBytes.length + "\r\n");
        if (setCookie != null) {
            writer.print("Set-Cookie: " + setCookie + "\r\n");
        }
        writer.print("Connection: close\r\n\r\n");
        writer.flush();
        out.write(bodyBytes);
        out.flush();
    }

    static void sendRedirect(OutputStream out, String location,
                             String setCookie) throws IOException {
        PrintWriter writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        writer.print("HTTP/1.1 303 See Other\r\n");
        writer.print("Location: " + location + "\r\n");
        if (setCookie != null) {
            writer.print("Set-Cookie: " + setCookie + "\r\n");
        }
        writer.print("Content-Length: 0\r\n");
        writer.print("Connection: close\r\n\r\n");
        writer.flush();
    }

    static Map<String, String> parseFormBody(String body)
            throws UnsupportedEncodingException {
        Map<String, String> params = new HashMap<String, String>();
        if (body == null || body.isEmpty()) {
            return params;
        }
        String[] pairs = body.split("&");
        for (String pair : pairs) {
            String[] kv = pair.split("=", 2);
            String key = URLDecoder.decode(kv[0], "UTF-8");
            String value = kv.length > 1
                ? URLDecoder.decode(kv[1], "UTF-8") : "";
            params.put(key, value);
        }
        return params;
    }

    static Map<String, String> parseCookies(String cookieHeader) {
        Map<String, String> cookies = new HashMap<String, String>();
        if (cookieHeader == null || cookieHeader.isEmpty()) {
            return cookies;
        }
        String[] pairs = cookieHeader.split(";");
        for (String pair : pairs) {
            String[] kv = pair.trim().split("=", 2);
            if (kv.length == 2) {
                cookies.put(kv[0], kv[1]);
            }
        }
        return cookies;
    }

    static String buildTopPage(String username) {
        if (username == null) {
            return "<html><body><h1>ログイン</h1>"
                + "<form method='POST' action='/login'>"
                + "<input name='name' placeholder='名前' required>"
                + "<button>ログイン</button></form>"
                + "</body></html>";
        }
        return "<html><body><h1>ようこそ " + username + " さん</h1>"
            + "<form method='POST' action='/logout'>"
            + "<button>ログアウト</button></form>"
            + "</body></html>";
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

            String[] parts = requestLine.split(" ");
            String method = parts[0];
            String path = parts.length > 1 ? parts[1] : "/";

            Map<String, String> headers = new HashMap<String, String>();
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                int idx = line.indexOf(':');
                if (idx > 0) {
                    headers.put(line.substring(0, idx).trim().toLowerCase(),
                        line.substring(idx + 1).trim());
                }
            }

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

            Map<String, String> cookies =
                parseCookies(headers.get("cookie"));
            String sessionId = cookies.get("SID");
            String username = sessionId == null ? null : SESSIONS.get(sessionId);

            if ("GET".equals(method) && "/".equals(path)) {
                sendResponse(out, 200, "OK", "text/html",
                    buildTopPage(username), null);
            } else if ("POST".equals(method) && "/login".equals(path)) {
                Map<String, String> params = parseFormBody(body);
                String name = params.containsKey("name")
                    ? params.get("name").trim() : "";
                if (name.isEmpty()) {
                    sendResponse(out, 400, "Bad Request", "text/plain",
                        "name is required", null);
                    return;
                }
                String newSessionId = URLEncoder.encode(
                    UUID.randomUUID().toString(), "UTF-8");
                SESSIONS.put(newSessionId, name);
                sendRedirect(out, "/", "SID=" + newSessionId
                    + "; Path=/; HttpOnly");
            } else if ("POST".equals(method) && "/logout".equals(path)) {
                if (sessionId != null) {
                    SESSIONS.remove(sessionId);
                }
                sendRedirect(out, "/", "SID=deleted; Path=/; Max-Age=0");
            } else {
                sendResponse(out, 404, "Not Found", "text/plain",
                    "404 Not Found", null);
            }
        }
    }

    public static void main(String[] args) throws IOException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("Cookie Session Server 起動中... http://localhost:" + PORT);

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
