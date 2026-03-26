import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.locks.ReentrantLock;

public class TodoHttpServerSample {

    static final int PORT = 8082;
    static final String CSV_FILE = "todos.csv";
    static final ReentrantLock lock = new ReentrantLock();

    // Java 17: record で TODO アイテムを不変クラスとして表現
    record Todo(String id, String title) {}

    // CSV からTODO一覧を読み込む
    static List<Todo> loadTodos() throws IOException {
        var todos = new ArrayList<Todo>();
        var file = new File(CSV_FILE);
        if (!file.exists()) return todos;
        try (var reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                var parts = line.split(",", 2);
                if (parts.length == 2) {
                    todos.add(new Todo(parts[0], parts[1]));
                }
            }
        }
        return todos;
    }

    // TODO を CSV に追記（Java 11+: new FileWriter(file, Charset, append) が使える）
    static void addTodo(String id, String title) throws IOException {
        try (var writer = new PrintWriter(
                new FileWriter(CSV_FILE, StandardCharsets.UTF_8, true))) {
            writer.println(id + "," + title.replace(",", "，"));
        }
    }

    // TODO を CSV から削除
    static void deleteTodo(String id) throws IOException {
        var todos = loadTodos();
        try (var writer = new PrintWriter(
                new FileWriter(CSV_FILE, StandardCharsets.UTF_8, false))) {
            for (var todo : todos) {
                if (!todo.id().equals(id)) {
                    writer.println(todo.id() + "," + todo.title());
                }
            }
        }
    }

    // HTML ページを生成（Java 17: テキストブロックで読みやすく）
    static String buildHtml(List<Todo> todos) {
        var items = new StringBuilder();
        for (var todo : todos) {
            items.append("<li>").append(escapeHtml(todo.title()));
            items.append(" <form method='POST' action='/delete' style='display:inline'>");
            items.append("<input type='hidden' name='id' value='").append(todo.id()).append("'>");
            items.append("<button>削除</button></form></li>");
        }
        return """
                <!DOCTYPE html><html><head><meta charset='UTF-8'>
                <title>TODO リスト</title></head><body>
                <h1>TODO リスト</h1>
                <form method='POST' action='/add'>
                <input name='title' placeholder='新しいTODO' required>
                <button>追加</button></form>
                <ul>""" + items + """
                </ul></body></html>
                """;
    }

    static String escapeHtml(String text) {
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    static void sendResponse(OutputStream out, int status, String msg,
                              String type, String body) throws IOException {
        var bytes = body.getBytes("UTF-8");
        var w = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true);
        w.print("HTTP/1.1 " + status + " " + msg + "\r\n");
        w.print("Content-Type: " + type + "; charset=UTF-8\r\n");
        w.print("Content-Length: " + bytes.length + "\r\n");
        w.print("Connection: close\r\n\r\n");
        w.flush();
        out.write(bytes);
        out.flush();
    }

    static void sendRedirect(OutputStream out) throws IOException {
        var w = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true);
        w.print("HTTP/1.1 303 See Other\r\nLocation: /\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
        w.flush();
    }

    static void handleRequest(Socket socket) throws IOException {
        try (var in = socket.getInputStream();
             var out = socket.getOutputStream()) {
            var reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));
            var requestLine = reader.readLine();
            if (requestLine == null) return;
            var parts = requestLine.split(" ");
            var method = parts[0];
            var path = parts.length > 1 ? parts[1] : "/";

            int contentLength = 0;
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                if (line.toLowerCase().startsWith("content-length:")) {
                    contentLength = Integer.parseInt(line.split(":")[1].trim());
                }
            }

            var body = "";
            if (contentLength > 0) {
                var buf = new char[contentLength];
                reader.read(buf, 0, contentLength);
                body = new String(buf);
            }

            lock.lock();
            try {
                if ("GET".equals(method) && "/".equals(path)) {
                    var todos = loadTodos();
                    sendResponse(out, 200, "OK", "text/html", buildHtml(todos));
                } else if ("POST".equals(method) && "/add".equals(path)) {
                    var title = "";
                    for (var kv : body.split("&")) {
                        var pair = kv.split("=", 2);
                        if ("title".equals(URLDecoder.decode(pair[0], "UTF-8"))) {
                            title = URLDecoder.decode(pair[1], "UTF-8");
                        }
                    }
                    if (!title.isEmpty()) {
                        addTodo(String.valueOf(System.currentTimeMillis()), title);
                    }
                    sendRedirect(out);
                } else if ("POST".equals(method) && "/delete".equals(path)) {
                    var id = "";
                    for (var kv : body.split("&")) {
                        var pair = kv.split("=", 2);
                        if ("id".equals(URLDecoder.decode(pair[0], "UTF-8"))) {
                            id = URLDecoder.decode(pair[1], "UTF-8");
                        }
                    }
                    if (!id.isEmpty()) {
                        deleteTodo(id);
                    }
                    sendRedirect(out);
                } else {
                    sendResponse(out, 404, "Not Found", "text/plain", "404 Not Found");
                }
            } finally {
                lock.unlock();
            }
        }
    }

    public static void main(String[] args) throws IOException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("TODO HTTP サーバー起動中... http://localhost:" + PORT);
        System.out.println("ブラウザで http://localhost:" + PORT + " を開いてください");
        try (var serverSocket = new ServerSocket(PORT)) {
            while (true) {
                var client = serverSocket.accept();
                executor.submit(() -> {
                    try { handleRequest(client); }
                    catch (IOException e) { System.out.println("エラー: " + e.getMessage()); }
                    finally { try { client.close(); } catch (IOException ignored) {} }
                });
            }
        }
    }
}
