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
    // 複数スレッドから同時に CSV を操作しないようにロックを使う
    static final ReentrantLock lock = new ReentrantLock();

    // CSV からTODO一覧を読み込む
    static List<String[]> loadTodos() throws IOException {
        List<String[]> todos = new ArrayList<>();
        File file = new File(CSV_FILE);
        if (!file.exists()) return todos;
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(file), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",", 2);
                if (parts.length == 2) {
                    todos.add(parts);
                }
            }
        }
        return todos;
    }

    // TODO を CSV に追記（Java 8: OutputStreamWriter でエンコーディングを明示）
    static void addTodo(String id, String title) throws IOException {
        // Java 8 では new FileWriter(file, Charset, append) が使えないため
        // OutputStreamWriter + FileOutputStream を組み合わせる
        try (PrintWriter writer = new PrintWriter(
                new OutputStreamWriter(
                    new FileOutputStream(CSV_FILE, true), StandardCharsets.UTF_8))) {
            writer.println(id + "," + title.replace(",", "，"));
        }
    }

    // TODO を CSV から削除
    static void deleteTodo(String id) throws IOException {
        List<String[]> todos = loadTodos();
        try (PrintWriter writer = new PrintWriter(
                new OutputStreamWriter(
                    new FileOutputStream(CSV_FILE, false), StandardCharsets.UTF_8))) {
            for (String[] todo : todos) {
                if (!todo[0].equals(id)) {
                    writer.println(todo[0] + "," + todo[1]);
                }
            }
        }
    }

    // HTML ページを生成
    static String buildHtml(List<String[]> todos) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        sb.append("<title>TODO リスト</title></head><body>");
        sb.append("<h1>TODO リスト</h1>");
        sb.append("<form method='POST' action='/add'>");
        sb.append("<input name='title' placeholder='新しいTODO' required>");
        sb.append("<button>追加</button></form><ul>");
        for (String[] todo : todos) {
            sb.append("<li>").append(escapeHtml(todo[1]));
            sb.append(" <form method='POST' action='/delete' style='display:inline'>");
            sb.append("<input type='hidden' name='id' value='").append(todo[0]).append("'>");
            sb.append("<button>削除</button></form></li>");
        }
        sb.append("</ul></body></html>");
        return sb.toString();
    }

    // HTML エスケープ（XSS 対策）
    static String escapeHtml(String text) {
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    static void sendResponse(OutputStream out, int status, String msg,
                              String type, String body) throws IOException {
        byte[] bytes = body.getBytes("UTF-8");
        PrintWriter w = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true);
        w.print("HTTP/1.1 " + status + " " + msg + "\r\n");
        w.print("Content-Type: " + type + "; charset=UTF-8\r\n");
        w.print("Content-Length: " + bytes.length + "\r\n");
        w.print("Connection: close\r\n\r\n");
        w.flush();
        out.write(bytes);
        out.flush();
    }

    static void sendRedirect(OutputStream out) throws IOException {
        PrintWriter w = new PrintWriter(new OutputStreamWriter(out, "UTF-8"), true);
        w.print("HTTP/1.1 303 See Other\r\nLocation: /\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");
        w.flush();
    }

    static void handleRequest(Socket socket) throws IOException {
        try (InputStream in = socket.getInputStream();
             OutputStream out = socket.getOutputStream()) {
            BufferedReader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));
            String requestLine = reader.readLine();
            if (requestLine == null) return;
            String[] parts = requestLine.split(" ");
            String method = parts[0];
            String path = parts.length > 1 ? parts[1] : "/";

            // Content-Length を取得
            int contentLength = 0;
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                if (line.toLowerCase().startsWith("content-length:")) {
                    contentLength = Integer.parseInt(line.split(":")[1].trim());
                }
            }

            String body = "";
            if (contentLength > 0) {
                char[] buf = new char[contentLength];
                reader.read(buf, 0, contentLength);
                body = new String(buf);
            }

            lock.lock();
            try {
                if ("GET".equals(method) && "/".equals(path)) {
                    List<String[]> todos = loadTodos();
                    sendResponse(out, 200, "OK", "text/html", buildHtml(todos));
                } else if ("POST".equals(method) && "/add".equals(path)) {
                    String title = "";
                    for (String kv : body.split("&")) {
                        String[] pair = kv.split("=", 2);
                        if ("title".equals(URLDecoder.decode(pair[0], "UTF-8"))) {
                            title = URLDecoder.decode(pair[1], "UTF-8");
                        }
                    }
                    if (!title.isEmpty()) {
                        addTodo(String.valueOf(System.currentTimeMillis()), title);
                    }
                    sendRedirect(out);
                } else if ("POST".equals(method) && "/delete".equals(path)) {
                    String id = "";
                    for (String kv : body.split("&")) {
                        String[] pair = kv.split("=", 2);
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
