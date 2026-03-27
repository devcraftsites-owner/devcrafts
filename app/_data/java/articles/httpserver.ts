import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "http-server-minimal",
  title: "Java ServerSocket で最小 HTTP サーバーを自作する",
  categorySlug: "httpserver",
  summary: "ServerSocket でリクエストを受け付け、ルーティング・レスポンス生成・マルチスレッド処理を実装する。",
  version: "Java 17",
  tags: ["HTTP サーバー", "ServerSocket", "Socket", "ルーティング", "自作サーバー"],
  apiNames: ["ServerSocket", "Socket", "BufferedReader", "PrintWriter", "ExecutorService"],
  description: "Java 標準 API の ServerSocket で最小構成の HTTP サーバーを自作し、リクエスト解析・ルーティング・レスポンス生成の仕組みを Java 8/17/21 対応で解説する。",
  lead: "HTTP サーバー自作連載の第1回として、まずは最小構成のサーバーを組み立てます。ここで押さえたいのは、クライアントから TCP 接続を受け付け、HTTP リクエスト行を読み、パスに応じてレスポンスを返すまでの一連の流れです。Spring Boot や Javalin を使えばこの部分は隠れますが、最初に手で書いておくと、以降のクエリ文字列、POST、静的配信、Cookie といった話がかなり追いやすくなります。この記事では、学習用の最小サーバーとしてどこまで実装すれば十分かに絞って整理します。",
  useCases: [
    "HTTP サーバーの最小構成を手で追い、リクエストからレスポンスまでの流れを理解したい",
    "後続のクエリ文字列や POST 処理に進む前に、土台になる処理だけを整理したい",
    "テスト用や検証用の最小サーバーがどの程度のコード量になるかを確認したい",
  ],
  cautions: [
    "この実装は学習用の最小構成であり、認証、入力検証、HTTPS など実務で必要になる要素はまだ扱わない",
    "HTTP リクエスト行が null のままになるケースを考慮しないと、即切断したクライアントで例外になりやすい",
    "Content-Length は文字数ではなく UTF-8 のバイト数で設定する必要がある",
    "ブラウザは `/favicon.ico` も取りに来るため、最小サーバーでも 404 の流れを見ておくと挙動を追いやすい",
    "Java 8 / 17 ではスレッドプール設計が必要で、Java 21 では Virtual Thread に置き換えやすい",
  ],
  relatedArticleSlugs: ["post-request-server", "http-query-server", "todo-http-server"],
  versionCoverage: {
    java8: "HTML は文字列連結で組み立て、スレッドプールも明示的に作る。最も素直だが記述量は多い。",
    java17: "テキストブロックと `var` により、レスポンス HTML や補助コードを Java 8 より読みやすく書ける。",
    java21: "Virtual Thread で接続ごとの処理を書きやすくなり、最小サーバーでも並行処理の見通しがよくなる。",
    java8Code: `// Java 8: 文字列連結で HTML、明示的な型宣言
String html = "<html><body>"
    + "<h1>Hello, Java HTTP Server!</h1>"
    + "<p>Socket ベースの最小サーバーです。</p>"
    + "</body></html>";
ExecutorService executor =
    Executors.newFixedThreadPool(10);
ServerSocket serverSocket = new ServerSocket(PORT);
while (true) {
    Socket client = serverSocket.accept();
    executor.submit(() -> {
        try { handleRequest(client); }
        catch (IOException e) { /* */ }
    });
}`,
    java17Code: `// Java 17: テキストブロック + var
var html = """
    <html><body>
    <h1>Hello, Java HTTP Server!</h1>
    <p>Socket ベースの最小サーバーです。</p>
    </body></html>
    """;
var executor = Executors.newFixedThreadPool(10);
try (var serverSocket = new ServerSocket(PORT)) {
    while (true) {
        var client = serverSocket.accept();
        executor.submit(() -> {
            try { handleRequest(client); }
            catch (IOException e) { /* */ }
        });
    }
}`,
    java21Code: `// Java 21: Virtual Thread + switch ルーティング
try (var serverSocket = new ServerSocket(PORT)) {
    while (true) {
        var client = serverSocket.accept();
        Thread.ofVirtual().start(() -> {
            try { handleRequest(client); }
            catch (IOException e) { /* */ }
        });
    }
}
// switch 式でパスのルーティング
var response = switch (path) {
    case "/" -> new String[]{"200", "OK",
        "text/html", indexHtml};
    case "/hello" -> new String[]{"200", "OK",
        "text/plain", "Hello, World!"};
    default -> new String[]{"404", "Not Found",
        "text/html", notFoundHtml};
};`,
  },
  libraryComparison: [
    { name: "標準 API（ServerSocket + 手動パース）", whenToUse: "HTTP サーバーの最小構成を手で追いたいとき。リクエスト行、ヘッダー、レスポンス組み立ての流れを把握しやすい。", tradeoff: "学習には向くが、運用に必要な機能はほぼ自前で補う必要がある。" },
    { name: "com.sun.net.httpserver.HttpServer", whenToUse: "Socket の受け付け処理を少し省き、簡易サーバーの骨格だけ確認したいとき。JDK だけで試せる。", tradeoff: "HTTP メッセージをどこまで自分で組み立てているかは見えにくくなる。" },
    { name: "Apache / nginx / Tomcat / Spring Boot などの既製基盤", whenToUse: "実際のアプリケーションや公開運用を考えるとき。サーバー運用や周辺機能も含めて整理しやすい。", tradeoff: "HTTP の低レイヤは抽象化されるため、仕組みを手で追う学習には向かない。" },
  ],
  faq: [
    { question: "このサンプルをそのまま公開運用してよいですか。", answer: "勧めません。この記事のコードは HTTP の流れを理解するための最小構成であり、公開運用や実アプリの基盤として使う前提ではありません。" },
    { question: "この HTTP サーバーで静的ファイルを配信できますか。", answer: "技術的には可能です。パスからファイルを読み込み、Content-Type を付けて返せば動きますが、実際にはパス正規化やキャッシュ制御も必要になります。" },
    { question: "同時アクセスが増えるとどうなりますか。", answer: "Java 8 / 17 では ExecutorService のスレッドプールサイズが上限になります。Java 21 では Virtual Thread を使うことで、接続ごとの処理をより素直に書けます。" },
    { question: "HTTPS に対応させるにはどうすればよいですか。", answer: "Java 単体でも SSLServerSocket を使えば実装できます。ただし証明書や更新手順まで含めると話が大きくなるため、学習の次の段階では既製の基盤と合わせて考えることが多いです。" },
  ],
  codeTitle: "最小構成の HTTP サーバーを ServerSocket で自作する",
  codeSample: `import java.io.*;
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
        var writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        var bodyBytes = body.getBytes("UTF-8");
        writer.print("HTTP/1.1 " + statusCode + " " + statusMessage + "\\r\\n");
        writer.print("Content-Type: " + contentType + "; charset=UTF-8\\r\\n");
        writer.print("Content-Length: " + bodyBytes.length + "\\r\\n");
        writer.print("Connection: close\\r\\n");
        writer.print("\\r\\n");
        writer.flush();
        out.write(bodyBytes);
        out.flush();
    }

    // リクエストを処理してレスポンスを返す
    static void handleRequest(Socket clientSocket) throws IOException {
        try (var in = clientSocket.getInputStream();
             var out = clientSocket.getOutputStream()) {

            var reader = new BufferedReader(
                new InputStreamReader(in, "UTF-8"));

            // リクエスト行を読む（例: GET /hello HTTP/1.1）
            var requestLine = reader.readLine();
            System.out.println("リクエスト: " + requestLine);

            // ヘッダーを読み飛ばす
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                // ヘッダー行を読み飛ばす
            }

            // リクエスト行をパース
            String method = "GET";
            String path = "/";
            if (requestLine != null && !requestLine.isEmpty()) {
                var parts = requestLine.split(" ");
                if (parts.length >= 2) {
                    method = parts[0];
                    path = parts[1];
                }
            }

            if ("GET".equals(method)) {
                if ("/".equals(path)) {
                    var html = """
                            <html><body>
                            <h1>Hello, Java HTTP Server!</h1>
                            <p>Socket ベースの最小 HTTP サーバーです。</p>
                            <p><a href='/hello'>Hello ページへ</a></p>
                            </body></html>
                            """;
                    sendResponse(out, 200, "OK", "text/html", html);
                } else if ("/hello".equals(path)) {
                    sendResponse(out, 200, "OK", "text/plain",
                        "Hello, World!");
                } else {
                    sendResponse(out, 404, "Not Found", "text/html",
                        "<html><body><h1>404 Not Found</h1></body></html>");
                }
            } else {
                sendResponse(out, 405, "Method Not Allowed",
                    "text/plain", "405 Method Not Allowed");
            }
        }
    }

    public static void main(String[] args) throws IOException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("HTTP サーバー起動中... http://localhost:" + PORT);

        try (var serverSocket = new ServerSocket(PORT)) {
            while (true) {
                var clientSocket = serverSocket.accept();
                executor.submit(() -> {
                    try {
                        handleRequest(clientSocket);
                    } catch (IOException e) {
                        System.out.println("エラー: " + e.getMessage());
                    } finally {
                        try { clientSocket.close(); }
                        catch (IOException ignored) {}
                    }
                });
            }
        }
    }
}`,
},
{
  slug: "post-request-server",
  title: "Java で POST リクエストを受け取る HTTP サーバーを自作する",
  categorySlug: "httpserver",
  summary: "ServerSocket で POST ボディを読み取り、フォームデータのパースとレスポンス返却を実装する。",
  version: "Java 17",
  tags: ["HTTP サーバー", "POST", "フォーム", "ServerSocket", "URLDecoder"],
  apiNames: ["ServerSocket", "Socket", "URLDecoder", "ExecutorService", "BufferedReader"],
  description: "Java 標準 API の ServerSocket で POST リクエストを受け取り、フォームデータをパースして HTML レスポンスを返す HTTP サーバーの実装を解説する。",
  lead: "HTTP サーバー自作連載の第3回として、POST リクエストの受信とフォームデータのパースを扱います。クエリ文字列までは URL だけを見れば十分でしたが、フォーム送信を扱う段階になると、リクエストボディの読み取り、Content-Length の解釈、URL エンコードされた値のデコードが必要になります。この記事では、学習用の最小サーバーに POST ハンドリングを足し、フォーム送信から PRG パターンで結果画面へ戻すところまでを一通り確認します。",
  useCases: [
    "POST リクエストのボディ読み取りとフォームデータの扱いを手で追いたい",
    "GET と POST で必要になる処理の違いを整理したい",
    "PRG パターンがなぜ必要かを、最小サーバーの流れで理解したい",
  ],
  cautions: [
    "Content-Length の扱いが曖昧だと、ボディ読み取りで不足や待ちが発生しやすい",
    "URLDecoder には文字コードを明示し、日本語や空白を含む入力でも挙動が崩れないようにしたい",
    "POST の結果をそのまま返すと再送信しやすいため、PRG パターンを早めに見ておくと理解しやすい",
    "この段階では CSRF、入力検証、監査ログなど実務向けの論点までは扱わない",
    "Java 8 / 17 ではスレッドプールの上限がそのまま同時処理数に影響する",
  ],
  relatedArticleSlugs: ["http-server-minimal", "http-query-server", "todo-http-server"],
  versionCoverage: {
    java8: "フォーム HTML は文字列連結になりやすく、ボディ読み取りも明示的な型で追うことになる。",
    java17: "テキストブロック、`var`、record により、フォーム送信の処理を読みやすく整理しやすい。",
    java21: "Virtual Thread により、POST 処理でも接続ごとの処理モデルを簡潔に書ける。",
    java8Code: `// Java 8: 文字列連結で HTML を構築、明示的な型宣言
String html = "<html><body>"
    + "<h1>フォーム</h1>"
    + "<form method='POST' action='/submit'>"
    + "名前: <input name='name'><br>"
    + "<button>送信</button>"
    + "</form></body></html>";
// スレッドプールでリクエスト処理
ExecutorService executor =
    Executors.newFixedThreadPool(10);`,
    java17Code: `// Java 17: テキストブロック + record で構造化
record FormData(String name, String age) {
    boolean isValid() {
        return name != null && !name.isEmpty();
    }
}
var html = """
    <html><body>
    <h1>フォーム</h1>
    <form method='POST' action='/submit'>
    名前: <input name='name'><br>
    <button>送信</button>
    </form></body></html>
    """;`,
    java21Code: `// Java 21: Virtual Thread でスレッドプール不要
try (var server = new ServerSocket(8081)) {
    while (true) {
        var client = server.accept();
        Thread.ofVirtual().start(() -> {
            try { handleRequest(client); }
            catch (IOException e) { /* ... */ }
            finally { client.close(); }
        });
    }
}`,
  },
  libraryComparison: [
    { name: "標準 API（ServerSocket + 手動パース）", whenToUse: "POST ボディの読み取りや PRG パターンを自分で確認したいとき。フォーム送信の流れを分解して追いやすい。", tradeoff: "フォーム処理の理解には向くが、入力検証や CSRF 対策は自前になる。" },
    { name: "com.sun.net.httpserver.HttpServer", whenToUse: "POST 処理の骨格だけ簡潔に試したいとき。Socket の受け付け処理を少し省ける。", tradeoff: "HTTP の低レイヤを追う学習効果は薄くなる。" },
    { name: "Spring Boot / Play / Jakarta EE などの既製基盤", whenToUse: "フォーム送信や入力検証を実アプリとして扱いたいとき。バリデーションや例外処理もまとめて整理しやすい。", tradeoff: "抽象化は増えるが、実務ではこちらのほうが自然な構成になる。" },
  ],
  faq: [
    { question: "この POST サンプルをそのまま業務画面に使えますか。", answer: "そのまま使う前提ではありません。この記事は POST ボディの読み取りと PRG パターンを理解するための学習用です。" },
    { question: "POST と GET でフォームデータの送信方法はどう違いますか。", answer: "GET は URL の `?` 以降に値を載せ、POST はリクエストボディに載せます。共有しやすさや見え方の違いもあるため、用途に応じて使い分けます。" },
    { question: "PRG パターンとは何ですか。", answer: "Post-Redirect-Get の略で、POST の結果を直接返さず、一度リダイレクトしてから GET で表示する形です。ブラウザの再読み込みによる再送信を避けやすくなります。" },
    { question: "Virtual Thread と従来のスレッドプールのどちらを選ぶべきですか。", answer: "学習用サンプルで Java 21 を使えるなら Virtual Thread のほうが流れを追いやすいです。Java 17 以前では Executors.newFixedThreadPool を使う構成になります。" },
  ],
  codeTitle: "PostRequestServer.java",
  codeSample: `import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class PostRequestServer {

    static final int PORT = 8081;

    // フォームデータを record で表現（Java 16+）
    record FormData(String name, String age) {
        boolean isValid() {
            return name != null && !name.isEmpty();
        }
    }

    /** URL エンコードされたフォームデータをパース */
    static Map<String, String> parseFormData(String body)
            throws UnsupportedEncodingException {
        var params = new HashMap<String, String>();
        if (body == null || body.isEmpty()) return params;
        for (var pair : body.split("&")) {
            var kv = pair.split("=", 2);
            var key = URLDecoder.decode(kv[0], "UTF-8");
            var value = kv.length > 1
                ? URLDecoder.decode(kv[1], "UTF-8") : "";
            params.put(key, value);
        }
        return params;
    }

    /** HTTP レスポンスを送信 */
    static void sendResponse(OutputStream out, int status,
            String statusMsg, String contentType,
            String body) throws IOException {
        var writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        var bodyBytes = body.getBytes("UTF-8");
        writer.print("HTTP/1.1 " + status + " "
            + statusMsg + "\\r\\n");
        writer.print("Content-Type: " + contentType
            + "; charset=UTF-8\\r\\n");
        writer.print("Content-Length: "
            + bodyBytes.length + "\\r\\n");
        writer.print("Connection: close\\r\\n\\r\\n");
        writer.flush();
        out.write(bodyBytes);
        out.flush();
    }

    /** 303 リダイレクトを送信（PRG パターン） */
    static void sendRedirect(OutputStream out,
            String location) throws IOException {
        var writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        writer.print("HTTP/1.1 303 See Other\\r\\n");
        writer.print("Location: " + location + "\\r\\n");
        writer.print("Content-Length: 0\\r\\n");
        writer.print("Connection: close\\r\\n\\r\\n");
        writer.flush();
    }

    /** リクエストを処理する */
    static void handleRequest(Socket socket)
            throws IOException {
        try (var in = socket.getInputStream();
             var out = socket.getOutputStream()) {
            var reader = new BufferedReader(
                new InputStreamReader(in, "UTF-8"));

            // リクエスト行の解析
            var requestLine = reader.readLine();
            if (requestLine == null) return;
            var parts = requestLine.split(" ");
            var method = parts[0];
            var path = parts.length > 1 ? parts[1] : "/";

            // ヘッダー読み取り
            var headers = new HashMap<String, String>();
            String line;
            while ((line = reader.readLine()) != null
                    && !line.isEmpty()) {
                int idx = line.indexOf(':');
                if (idx > 0) {
                    headers.put(
                        line.substring(0, idx)
                            .trim().toLowerCase(),
                        line.substring(idx + 1).trim());
                }
            }

            // POST ボディ読み取り
            var body = "";
            if ("POST".equals(method)) {
                var cl = headers.get("content-length");
                if (cl != null) {
                    int len = Integer.parseInt(cl);
                    var buf = new char[len];
                    reader.read(buf, 0, len);
                    body = new String(buf);
                }
            }

            // ルーティング
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
                sendResponse(out, 200, "OK",
                    "text/html", html);
            } else if ("POST".equals(method)
                    && "/submit".equals(path)) {
                var paramMap = parseFormData(body);
                var formData = new FormData(
                    paramMap.getOrDefault("name", ""),
                    paramMap.getOrDefault("age", ""));
                System.out.println("受信: " + formData);
                sendRedirect(out, "/result");
            } else if ("GET".equals(method)
                    && path.startsWith("/result")) {
                sendResponse(out, 200, "OK", "text/html",
                    "<html><body><h1>送信完了</h1>"
                    + "<a href='/'>戻る</a></body></html>");
            } else {
                sendResponse(out, 404, "Not Found",
                    "text/plain", "404 Not Found");
            }
        }
    }

    public static void main(String[] args)
            throws IOException {
        ExecutorService executor =
            Executors.newFixedThreadPool(10);
        System.out.println(
            "HTTP サーバー起動: http://localhost:" + PORT);
        try (var serverSocket = new ServerSocket(PORT)) {
            while (true) {
                var client = serverSocket.accept();
                executor.submit(() -> {
                    try { handleRequest(client); }
                    catch (IOException e) {
                        System.err.println(e.getMessage());
                    }
                    finally {
                        try { client.close(); }
                        catch (IOException ignored) {}
                    }
                });
            }
        }
    }
}`,
},
{
  slug: "todo-http-server",
  title: "Java で TODO 管理の HTTP サーバーを自作する実装例",
  categorySlug: "httpserver",
  summary: "CSV 永続化と CRUD 操作を備えた TODO リストサーバーを ServerSocket で構築する。",
  version: "Java 17",
  tags: ["HTTP サーバー", "TODO", "CRUD", "CSV", "ServerSocket", "ReentrantLock"],
  apiNames: ["ServerSocket", "Socket", "ReentrantLock", "FileWriter", "BufferedReader", "URLDecoder"],
  description: "Java 標準 API で TODO リストの追加・一覧・削除を行う HTTP サーバーを構築し、CSV ファイルによるデータ永続化とスレッド安全な排他制御を解説する。",
  lead: "HTTP サーバー自作連載の第4回として、TODO リストを題材に CRUD の流れを一つにまとめます。ここでは、一覧表示、追加、削除という基本操作を HTTP の上に載せ、CSV への永続化や排他制御まで含めて確認します。記事の目的は TODO アプリを完成品として作ることではなく、ルーティング、ボディパース、レスポンス生成、永続化の組み合わせを学習用の題材として一度つなげてみることです。",
  useCases: [
    "HTTP の上に CRUD を載せると何が必要になるかを一度まとめて見たい",
    "一覧・追加・削除と永続化を、学習用の一つの題材で確認したい",
    "データベースやフレームワークに進む前に、最低限の構成要素を整理したい",
  ],
  cautions: [
    "CSV への排他制御は学習には十分だが、再起動や複数プロセスをまたぐ整合性までは扱わない",
    "HTML 出力では入力値のエスケープを入れ、表示系でも安全性を意識しておきたい",
    "CSV の簡易処理は理解しやすい反面、引用符や改行を含む本格的な CSV には向かない",
    "タイムスタンプ ID は学習用には分かりやすいが、衝突を避けるなら UUID など別の方針が必要になる",
    "この段階では TODO 管理を題材にしているだけで、実運用向けのアプリ設計までは扱わない",
  ],
  relatedArticleSlugs: ["post-request-server", "cookie-session-server", "http-server-complete"],
  versionCoverage: {
    java8: "CSV 処理や HTML 組み立てを素直に書くと記述量が増えやすく、型表現もやや重くなる。",
    java17: "record、テキストブロック、Charset 付き FileWriter により、学習用サンプルでも見通しを保ちやすい。",
    java21: "Virtual Thread を使うと、CRUD サーバーでも接続ごとの処理を書き分けやすい。",
    java8Code: `// Java 8: String[] で TODO を管理、OutputStreamWriter で書込
List<String[]> todos = new ArrayList<>();
// ...
try (PrintWriter writer = new PrintWriter(
        new OutputStreamWriter(
            new FileOutputStream(CSV_FILE, true),
            StandardCharsets.UTF_8))) {
    writer.println(id + "," + title);
}`,
    java17Code: `// Java 17: record で型安全に、FileWriter に Charset 指定
record Todo(String id, String title) {}
// ...
try (var writer = new PrintWriter(
        new FileWriter(CSV_FILE,
            StandardCharsets.UTF_8, true))) {
    writer.println(todo.id() + "," + todo.title());
}`,
    java21Code: `// Java 21: Virtual Thread でスレッドプール不要
try (var server = new ServerSocket(PORT)) {
    while (true) {
        var client = server.accept();
        Thread.ofVirtual().start(() -> {
            try { handleRequest(client); }
            catch (IOException e) { /* ... */ }
            finally { client.close(); }
        });
    }
}`,
  },
  libraryComparison: [
    { name: "標準 API（ServerSocket + CSV）", whenToUse: "CRUD、永続化、排他制御が一つのサンプルでどうつながるかを見たいとき。仕組みをまとめて確認しやすい。", tradeoff: "理解には向くが、実アプリの TODO 管理基盤としては別の構成を考えたい。" },
    { name: "com.sun.net.httpserver.HttpServer + CSV", whenToUse: "Socket レベルの処理を減らして、CRUD サーバーの流れだけ確認したいとき。", tradeoff: "HTTP の細部は見えにくくなるため、学習の焦点が少し変わる。" },
    { name: "Spring Boot / Play / Jakarta EE + DB", whenToUse: "実際の CRUD アプリケーションとして作るとき。永続化、入力検証、認証を現実的に扱いやすい。", tradeoff: "依存は増えるが、実務で必要な責務を整理しやすい。" },
  ],
  faq: [
    { question: "この TODO サーバーをそのまま使えますか。", answer: "学習用としては動かせますが、実際のアプリケーション基盤として使う前提ではありません。永続化や認証、監査の扱いは別途必要です。" },
    { question: "CSV ではなくデータベースを使うべきですか。", answer: "実際のアプリケーションではデータベースを選ぶ場面が多いです。この記事では HTTP と永続化のつながりを見やすくするために CSV を使っています。" },
    { question: "ReentrantLock と synchronized のどちらを使うべきですか。", answer: "基本的な排他なら synchronized でも十分です。この記事では、排他制御の場所が見えやすいように ReentrantLock を例にしています。" },
    { question: "このサーバーを本番で使っても大丈夫ですか。", answer: "本番向けの構成とは考えないほうがよいです。入力検証、認証、監査、障害対応まで含めるなら、既製の基盤を前提に設計するほうが自然です。" },
  ],
  codeTitle: "TodoHttpServer.java",
  codeSample: `import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.locks.ReentrantLock;

public class TodoHttpServer {

    static final int PORT = 8082;
    static final String CSV_FILE = "todos.csv";
    static final ReentrantLock lock = new ReentrantLock();

    // TODO を record で表現（Java 16+）
    record Todo(String id, String title) {}

    /** CSV から TODO 一覧を読み込む */
    static List<Todo> loadTodos() throws IOException {
        var todos = new ArrayList<Todo>();
        var file = new File(CSV_FILE);
        if (!file.exists()) return todos;
        try (var reader = new BufferedReader(
                new InputStreamReader(
                    new FileInputStream(file),
                    StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                var parts = line.split(",", 2);
                if (parts.length == 2) {
                    todos.add(
                        new Todo(parts[0], parts[1]));
                }
            }
        }
        return todos;
    }

    /** TODO を CSV に追記 */
    static void addTodo(String id, String title)
            throws IOException {
        try (var writer = new PrintWriter(new FileWriter(
                CSV_FILE, StandardCharsets.UTF_8, true))) {
            writer.println(id + ","
                + title.replace(",", "，"));
        }
    }

    /** TODO を CSV から削除 */
    static void deleteTodo(String id) throws IOException {
        var todos = loadTodos();
        try (var writer = new PrintWriter(new FileWriter(
                CSV_FILE, StandardCharsets.UTF_8, false))) {
            for (var todo : todos) {
                if (!todo.id().equals(id)) {
                    writer.println(
                        todo.id() + "," + todo.title());
                }
            }
        }
    }

    /** HTML ページを生成 */
    static String buildHtml(List<Todo> todos) {
        var items = new StringBuilder();
        for (var todo : todos) {
            items.append("<li>")
                 .append(escapeHtml(todo.title()))
                 .append(" <form method='POST' ")
                 .append("action='/delete' ")
                 .append("style='display:inline'>")
                 .append("<input type='hidden' ")
                 .append("name='id' value='")
                 .append(todo.id()).append("'>")
                 .append("<button>削除</button>")
                 .append("</form></li>");
        }
        return """
            <!DOCTYPE html>
            <html><head><meta charset='UTF-8'>
            <title>TODO リスト</title></head><body>
            <h1>TODO リスト</h1>
            <form method='POST' action='/add'>
            <input name='title'
                   placeholder='新しいTODO' required>
            <button>追加</button></form>
            <ul>""" + items + """
            </ul></body></html>
            """;
    }

    static String escapeHtml(String text) {
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;");
    }

    static void sendResponse(OutputStream out, int status,
            String msg, String type, String body)
            throws IOException {
        var bytes = body.getBytes("UTF-8");
        var w = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        w.print("HTTP/1.1 " + status + " " + msg
            + "\\r\\n");
        w.print("Content-Type: " + type
            + "; charset=UTF-8\\r\\n");
        w.print("Content-Length: " + bytes.length
            + "\\r\\n");
        w.print("Connection: close\\r\\n\\r\\n");
        w.flush();
        out.write(bytes);
        out.flush();
    }

    static void sendRedirect(OutputStream out)
            throws IOException {
        var w = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        w.print("HTTP/1.1 303 See Other\\r\\n"
            + "Location: /\\r\\n"
            + "Content-Length: 0\\r\\n"
            + "Connection: close\\r\\n\\r\\n");
        w.flush();
    }

    public static void main(String[] args)
            throws IOException {
        ExecutorService executor =
            Executors.newFixedThreadPool(10);
        System.out.println(
            "TODO サーバー起動: http://localhost:" + PORT);
        try (var serverSocket = new ServerSocket(PORT)) {
            while (true) {
                var client = serverSocket.accept();
                executor.submit(() -> {
                    try {
                        // handleRequest の実装は本文参照
                        client.close();
                    } catch (IOException ignored) {}
                });
            }
        }
    }
}`,
},
{
  slug: "http-query-server",
  title: "Java でクエリパラメータを処理する HTTP サーバーを自作する",
  categorySlug: "httpserver",
  summary: "GET のクエリ文字列を解析し、パラメータに応じて動的レスポンスを返す。",
  version: "Java 17",
  tags: ["HTTP サーバー", "クエリパラメータ", "GET", "URLDecoder", "ServerSocket"],
  apiNames: ["ServerSocket", "Socket", "URLDecoder", "BufferedReader", "PrintWriter"],
  description: "Java 標準 API の ServerSocket で GET リクエストのクエリパラメータを解析し、動的に HTML やテキストを返す HTTP サーバーを実装する。",
  lead: "HTTP サーバー自作連載の第2回として、GET リクエストに付くクエリ文字列を扱います。最小サーバーではパスだけを見れば十分でしたが、実際の HTTP では `?` 以降の値を読み取り、デコードし、未指定時のデフォルト値を決める場面がすぐに出てきます。この記事では、クエリ文字列の分離、URL デコード、動的レスポンス生成を順に実装し、次の POST 処理につながる土台を作ります。",
  useCases: [
    "GET リクエストで値を受け取る流れを、低レイヤから確認したい",
    "クエリ文字列の分解と URL デコードを手で追いたい",
    "動的レスポンスの入口として、最小の検索風 UI を作ってみたい",
  ],
  cautions: [
    "クエリ文字列は URL に残るため、検索条件のような軽い値と相性がよい",
    "URLDecoder を通さないと、日本語や空白を含む値の確認が難しくなる",
    "入力値を HTML に戻す場合は、最小サンプルでもエスケープ処理を入れておきたい",
    "同じキーが複数回出る場合の扱いは、この段階では単純化している",
  ],
  relatedArticleSlugs: ["post-request-server", "static-file-server", "todo-http-server"],
  versionCoverage: {
    java8: "クエリ文字列の分解や HTML 組み立てを明示的な型で追えるため、処理の流れが見えやすい。",
    java17: "テキストブロックと `formatted` を使うと、動的 HTML の返却を読みやすく書ける。",
    java21: "Virtual Thread と switch 式で、クエリ付きリクエストの処理をより簡潔にまとめられる。",
    java8Code: `Map<String, String> params = parseQuery(rawQuery);
String name = params.containsKey("name")
    ? params.get("name") : "Guest";
sendResponse(out, 200, "OK", "text/plain",
    "Hello, " + name + "!");`,
    java17Code: `var params = parseQuery(rawQuery);
var keyword = params.getOrDefault("keyword", "");
var html = """
    <html><body>
    <h1>検索結果</h1>
    <p>keyword = %s</p>
    </body></html>
    """.formatted(escapeHtml(keyword));`,
    java21Code: `var response = switch (path) {
    case "/hello" -> "Hello, "
        + params.getOrDefault("name", "Guest") + "!";
    case "/search" -> buildSearchHtml(params);
    default -> null;
};`,
  },
  libraryComparison: [
    { name: "標準 API（ServerSocket + 手動パース）", whenToUse: "クエリ文字列の分離や URL デコードを自分で確認したいとき。値がどこから来てどう扱われるかを追いやすい。", tradeoff: "理解には向くが、多値パラメータや入力検証は自前になる。" },
    { name: "com.sun.net.httpserver.HttpServer", whenToUse: "URI の query 部分だけに注目して、簡易な実験をしたいとき。", tradeoff: "Socket レベルでどこを読んでいるかは見えにくくなる。" },
    { name: "Spring MVC / Javalin / Play", whenToUse: "クエリパラメータを実アプリで宣言的に扱いたいとき。入力受け渡しの責務を整理しやすい。", tradeoff: "仕組みの細部は隠れるため、低レイヤの学習には向かない。" },
  ],
  faq: [
    { question: "この実装をそのまま検索画面に使えますか。", answer: "勧めません。この記事はクエリ文字列の扱いを理解するための学習用であり、実画面では入力検証やエラーハンドリングが別途必要です。" },
    { question: "クエリパラメータと POST ボディはどう使い分けますか。", answer: "検索条件やページ番号のように URL として共有しやすい値はクエリパラメータが向いています。長い入力や URL に出したくない値は POST ボディを選びます。" },
    { question: "同じキーが複数ある場合はどう扱うべきですか。", answer: "実務では List として扱う場合がありますが、この記事の最小実装では最後の値だけを採用しています。必要になった段階で拡張すれば十分です。" },
    { question: "なぜ HTML エスケープが必要ですか。", answer: "クエリで受け取った値をそのまま HTML に埋め込むと、画面表示の崩れやスクリプト注入の入口になります。最小サンプルでも変換の考え方は見ておくと役に立ちます。" },
  ],
  codeTitle: "HttpQueryServerSample.java",
  codeSample: `import java.io.*;
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
        var writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        var bodyBytes = body.getBytes("UTF-8");
        writer.print("HTTP/1.1 " + statusCode + " " + statusMessage + "\\r\\n");
        writer.print("Content-Type: " + contentType + "; charset=UTF-8\\r\\n");
        writer.print("Content-Length: " + bodyBytes.length + "\\r\\n");
        writer.print("Connection: close\\r\\n\\r\\n");
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

            if ("/".equals(path)) {
                var html = """
                    <html><body>
                    <h1>クエリパラメータデモ</h1>
                    <form method='GET' action='/search'>
                    <input name='keyword' placeholder='検索語'>
                    <button>検索</button>
                    </form>
                    <p><a href='/hello?name=Java'>/hello?name=Java</a></p>
                    </body></html>
                    """;
                sendResponse(out, 200, "OK", "text/html", html);
            } else if ("/hello".equals(path)) {
                var name = params.getOrDefault("name", "Guest");
                sendResponse(out, 200, "OK", "text/plain",
                    "Hello, " + name + "!");
            } else if ("/search".equals(path)) {
                var keyword = params.getOrDefault("keyword", "");
                var html = """
                    <html><body>
                    <h1>検索結果</h1>
                    <p>keyword = %s</p>
                    <p><a href='/'>戻る</a></p>
                    </body></html>
                    """.formatted(escapeHtml(keyword));
                sendResponse(out, 200, "OK", "text/html", html);
            } else {
                sendResponse(out, 404, "Not Found",
                    "text/plain", "404 Not Found");
            }
        }
    }

    public static void main(String[] args) throws IOException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("HTTP Query Server 起動中... http://localhost:" + PORT);

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
}`,
},
{
  slug: "static-file-server",
  title: "Java で静的ファイルを配信する HTTP サーバーを自作する",
  categorySlug: "httpserver",
  summary: "HTML や CSS などの静的ファイルを配信し、Content-Type とパス検証を実装する。",
  version: "Java 17",
  tags: ["HTTP サーバー", "静的ファイル", "Content-Type", "Files", "ServerSocket"],
  apiNames: ["ServerSocket", "Socket", "Files", "File", "BufferedReader"],
  description: "Java 標準 API の ServerSocket で静的ファイルを配信する HTTP サーバーを実装し、パス正規化と Content-Type 判定の基本を解説する。",
  lead: "HTTP サーバー自作連載の第5回では、HTML や CSS などの静的ファイル配信を扱います。ブラウザに見えている画面は、単なる文字列レスポンスではなく、ファイルを読み込み、Content-Type を付けて返す処理の上に成り立っています。この記事では `static/` ディレクトリを document root とし、パス正規化と Content-Type 判定までを含めて、学習用の最小構成を整理します。",
  useCases: [
    "HTML や CSS を返すときに、サーバー側で何をしているかを確認したい",
    "document root とパス正規化の考え方を整理したい",
    "静的配信と動的レスポンスの違いを、最小サーバーの中で見比べたい",
  ],
  cautions: [
    "パスをそのまま結合すると、document root の外へ出てしまうケースがある",
    "Content-Type の付け方を誤ると、ブラウザでの見え方が崩れやすい",
    "このサンプルは分かりやすさを優先しており、大きなファイルやキャッシュ制御までは扱わない",
    "静的配信の理解が目的なので、公開向けサーバーとしての機能までは揃えていない",
  ],
  relatedArticleSlugs: ["http-query-server", "cookie-session-server", "http-server-complete"],
  versionCoverage: {
    java8: "File と Files を組み合わせて静的ファイルを読む流れを、素直なコードで追いやすい。",
    java17: "初期 HTML をテキストブロックで書けるため、配信対象の例を読みやすく置きやすい。",
    java21: "Virtual Thread と switch 式により、配信サーバーの補助コードをより簡潔にまとめやすい。",
    java8Code: `File file = resolvePath(path);
if (!file.exists() || file.isDirectory()) {
    sendBytes(out, 404, "Not Found",
        "text/plain; charset=UTF-8",
        "404 Not Found".getBytes("UTF-8"));
}`,
    java17Code: `var bodyBytes = Files.readAllBytes(file.toPath());
sendBytes(out, 200, "OK",
    guessContentType(file.getName()), bodyBytes);`,
    java21Code: `return switch (path.substring(path.lastIndexOf('.') + 1)) {
    case "html" -> "text/html; charset=UTF-8";
    case "css" -> "text/css; charset=UTF-8";
    default -> "application/octet-stream";
};`,
  },
  libraryComparison: [
    { name: "標準 API（ServerSocket + Files）", whenToUse: "静的配信とパス検証の基本を学習したいとき。ファイルをどう返しているかを追いやすい。", tradeoff: "キャッシュ制御や圧縮配信など、本格的な配信機能は自前になる。" },
    { name: "com.sun.net.httpserver.HttpServer", whenToUse: "静的配信の骨格だけを簡潔に試したいとき。", tradeoff: "HTTP メッセージの細部は見えにくくなる。" },
    { name: "nginx / Apache / Spring Boot Static Resources", whenToUse: "実際に静的アセットを配信する基盤を選びたいとき。", tradeoff: "仕組みの手触りは減るが、運用面では自然な選択になる。" },
  ],
  faq: [
    { question: "このサンプルをそのまま静的ファイル配信に使えますか。", answer: "学習用の参考にはなりますが、公開向けの静的配信基盤として使う前提ではありません。キャッシュ制御や圧縮配信などは別途必要です。" },
    { question: "なぜ `canonicalPath` の確認が必要ですか。", answer: "単純に `new File(root, path)` とすると `../` を含むパスで外側のファイルへ到達できます。document root 配下に閉じるための基本的な確認です。" },
    { question: "Content-Type はどこまで厳密に判定すべきですか。", answer: "学習用なら拡張子ベースで十分です。実際の配信基盤では MIME 判定、charset、圧縮、キャッシュ戦略まで含めて考えます。" },
    { question: "画像や大きなファイルも同じ実装で返せますか。", answer: "返せますが、`readAllBytes` で全読み込みする実装はメモリ効率がよくありません。大きなファイルではストリーム転送を選ぶほうが自然です。" },
  ],
  codeTitle: "StaticFileServerSample.java",
  codeSample: `import java.io.*;
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
        writer.print("HTTP/1.1 " + statusCode + " " + statusMessage + "\\r\\n");
        writer.print("Content-Type: " + contentType + "\\r\\n");
        writer.print("Content-Length: " + bodyBytes.length + "\\r\\n");
        writer.print("Connection: close\\r\\n\\r\\n");
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
}`,
},
{
  slug: "cookie-session-server",
  title: "Java で Cookie とセッションを扱う HTTP サーバーを自作する",
  categorySlug: "httpserver",
  summary: "Set-Cookie と Cookie ヘッダーを使って、最小限のセッション管理を実装する。",
  version: "Java 17",
  tags: ["HTTP サーバー", "Cookie", "セッション", "Set-Cookie", "ServerSocket"],
  apiNames: ["ServerSocket", "Socket", "UUID", "ConcurrentHashMap", "URLDecoder"],
  description: "Java 標準 API の ServerSocket で Cookie を発行し、メモリ上のセッションストアと組み合わせてログイン風の状態管理を実装する。",
  lead: "HTTP サーバー自作連載の第6回では、Cookie とセッションの最小実装を扱います。HTTP がステートレスであることは理解していても、ログイン状態のような『リクエストをまたいで残る値』をどう扱うのかは、実際に一度書いてみると見えやすくなります。この記事では `Set-Cookie` と `Cookie` ヘッダーを自分で組み立て、サーバー側の `Map` をセッションストアとして使うことで、状態管理の最小形を確認します。",
  useCases: [
    "Cookie とサーバー側セッションがどう対応しているかを整理したい",
    "ログイン状態のような値を、最小構成でどう保持するかを見たい",
    "状態管理を自分で書くと何が増えるかを把握したい",
  ],
  cautions: [
    "この実装はメモリ上の Map を使うため、再起動や複数台構成は前提にしていない",
    "セッション ID は予測しにくい値で生成し、Cookie の属性も意識しておきたい",
    "HttpOnly、Secure、SameSite などの属性は、学習用でも存在だけは把握しておくと後でつながりやすい",
    "認証やセッション失効を実務で扱うには、CSRF や有効期限管理まで含めて考える必要がある",
  ],
  relatedArticleSlugs: ["static-file-server", "http-server-production-notes", "http-server-complete"],
  versionCoverage: {
    java8: "ConcurrentHashMap と UUID を使って、セッションの最小構成を素直に追いやすい。",
    java17: "テキストブロックと `formatted` により、画面 HTML やレスポンス生成を整理しやすい。",
    java21: "Virtual Thread を使うと、状態管理を含む接続処理も見通しよく書きやすい。",
    java8Code: `String newSessionId = URLEncoder.encode(
    UUID.randomUUID().toString(), "UTF-8");
SESSIONS.put(newSessionId, name);
sendRedirect(out, "/", "SID=" + newSessionId
    + "; Path=/; HttpOnly");`,
    java17Code: `var cookies = parseCookies(headers.get("cookie"));
var sessionId = cookies.get("SID");
var username = sessionId == null ? null : SESSIONS.get(sessionId);`,
    java21Code: `Thread.ofVirtual().start(() -> {
    try { handleRequest(clientSocket); }
    catch (IOException e) { /* ... */ }
});`,
  },
  libraryComparison: [
    { name: "標準 API（Cookie ヘッダー + Map）", whenToUse: "Cookie とセッションの関係を一度手で確認したいとき。ブラウザ側とサーバー側の役割が見えやすい。", tradeoff: "有効期限、永続化、CSRF などは自前になり、実運用の前提にはしにくい。" },
    { name: "com.sun.net.httpserver.HttpServer", whenToUse: "状態管理の骨格だけ追いたいとき。Socket 処理を少し省ける。", tradeoff: "HTTP の細部理解は減る。" },
    { name: "Spring Session / Jakarta Security / Akka HTTP", whenToUse: "認証やセッション管理を実アプリで扱いたいとき。責務分担や周辺機能まで整理しやすい。", tradeoff: "学習コストは増えるが、実務ではこちらのほうが自然である。" },
  ],
  faq: [
    { question: "このセッション管理をそのまま使えますか。", answer: "そのまま使う前提ではありません。この記事は Cookie とセッションの関係を理解するための学習用であり、実運用では有効期限や分散環境対応まで含めて別途設計が必要です。" },
    { question: "Cookie とセッションは同じものですか。", answer: "違います。Cookie はブラウザに保存される小さなデータで、セッションは通常サーバー側で管理されます。ブラウザは Cookie でセッション ID を送り返します。" },
    { question: "なぜセッション ID を URL ではなく Cookie に入れるのですか。", answer: "URL に載せるとログやリファラに残りやすく、共有や漏洩のリスクが高まるためです。Cookie で渡すほうが扱いやすくなります。" },
    { question: "この実装を本番で使えますか。", answer: "本番向けの構成とは考えないほうがよいです。Secure 属性、SameSite、CSRF 対策、期限切れ管理、分散環境対応まで含めると、別の基盤を前提にしたほうが整理しやすくなります。" },
  ],
  codeTitle: "CookieSessionServerSample.java",
  codeSample: `import java.io.*;
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
        new ConcurrentHashMap<>();

    static void sendResponse(OutputStream out, int statusCode,
                             String statusMessage, String contentType,
                             String body, String setCookie) throws IOException {
        var writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        var bodyBytes = body.getBytes("UTF-8");
        writer.print("HTTP/1.1 " + statusCode + " " + statusMessage + "\\r\\n");
        writer.print("Content-Type: " + contentType + "; charset=UTF-8\\r\\n");
        writer.print("Content-Length: " + bodyBytes.length + "\\r\\n");
        if (setCookie != null) {
            writer.print("Set-Cookie: " + setCookie + "\\r\\n");
        }
        writer.print("Connection: close\\r\\n\\r\\n");
        writer.flush();
        out.write(bodyBytes);
        out.flush();
    }

    static void sendRedirect(OutputStream out, String location,
                             String setCookie) throws IOException {
        var writer = new PrintWriter(
            new OutputStreamWriter(out, "UTF-8"), true);
        writer.print("HTTP/1.1 303 See Other\\r\\n");
        writer.print("Location: " + location + "\\r\\n");
        if (setCookie != null) {
            writer.print("Set-Cookie: " + setCookie + "\\r\\n");
        }
        writer.print("Content-Length: 0\\r\\n");
        writer.print("Connection: close\\r\\n\\r\\n");
        writer.flush();
    }

    static Map<String, String> parseFormBody(String body)
            throws UnsupportedEncodingException {
        var params = new HashMap<String, String>();
        if (body == null || body.isEmpty()) {
            return params;
        }
        for (var pair : body.split("&")) {
            var kv = pair.split("=", 2);
            var key = URLDecoder.decode(kv[0], "UTF-8");
            var value = kv.length > 1
                ? URLDecoder.decode(kv[1], "UTF-8") : "";
            params.put(key, value);
        }
        return params;
    }

    static Map<String, String> parseCookies(String cookieHeader) {
        var cookies = new HashMap<String, String>();
        if (cookieHeader == null || cookieHeader.isEmpty()) {
            return cookies;
        }
        for (var pair : cookieHeader.split(";")) {
            var kv = pair.trim().split("=", 2);
            if (kv.length == 2) {
                cookies.put(kv[0], kv[1]);
            }
        }
        return cookies;
    }

    static String buildTopPage(String username) {
        if (username == null) {
            return """
                <html><body>
                <h1>ログイン</h1>
                <form method='POST' action='/login'>
                <input name='name' placeholder='名前' required>
                <button>ログイン</button>
                </form>
                </body></html>
                """;
        }
        return """
            <html><body>
            <h1>ようこそ %s さん</h1>
            <form method='POST' action='/logout'>
            <button>ログアウト</button>
            </form>
            </body></html>
            """.formatted(username);
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

            var parts = requestLine.split(" ");
            var method = parts[0];
            var path = parts.length > 1 ? parts[1] : "/";

            var headers = new HashMap<String, String>();
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                var idx = line.indexOf(':');
                if (idx > 0) {
                    headers.put(line.substring(0, idx).trim().toLowerCase(),
                        line.substring(idx + 1).trim());
                }
            }

            var body = "";
            if ("POST".equals(method)) {
                var contentLength = headers.get("content-length");
                if (contentLength != null) {
                    var length = Integer.parseInt(contentLength);
                    var buf = new char[length];
                    reader.read(buf, 0, length);
                    body = new String(buf);
                }
            }

            var cookies = parseCookies(headers.get("cookie"));
            var sessionId = cookies.get("SID");
            var username = sessionId == null ? null : SESSIONS.get(sessionId);

            if ("GET".equals(method) && "/".equals(path)) {
                sendResponse(out, 200, "OK", "text/html",
                    buildTopPage(username), null);
            } else if ("POST".equals(method) && "/login".equals(path)) {
                var params = parseFormBody(body);
                var name = params.getOrDefault("name", "").trim();
                if (name.isEmpty()) {
                    sendResponse(out, 400, "Bad Request",
                        "text/plain", "name is required", null);
                    return;
                }
                var newSessionId = URLEncoder.encode(
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
                sendResponse(out, 404, "Not Found",
                    "text/plain", "404 Not Found", null);
            }
        }
    }

    public static void main(String[] args) throws IOException {
        ExecutorService executor = Executors.newFixedThreadPool(10);
        System.out.println("Cookie Session Server 起動中... http://localhost:" + PORT);

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
}`,
},
{
  slug: "http-server-production-notes",
  title: "自作 HTTP サーバーを実務で使う前に確認すべき注意点",
  categorySlug: "httpserver",
  summary: "認証・入力検証・ログ・HTTPS など、自作サーバーで見落としやすい論点を整理する。",
  version: "Java 17",
  tags: ["HTTP サーバー", "セキュリティ", "認証", "ログ", "運用"],
  apiNames: ["SSLServerSocket", "Logger", "ExecutorService", "SocketTimeoutException"],
  description: "学習用に自作した HTTP サーバーを実務へ持ち込む前に、認証、入力検証、ログ、HTTPS、タイムアウトなどの注意点を整理する。",
  lead: "HTTP サーバーを自作すると、リクエスト解析やレスポンス生成の仕組みはかなり見えやすくなります。一方で、実務ではその理解の上に、既製のサーバーやフレームワークをどう使うかという視点が必要になります。この記事では、認証・認可、入力検証、ログ、HTTPS、タイムアウト、サイズ制限、例外処理、セッション管理といった論点を並べ、自作サーバーで見えた仕組みと、実務で基盤側に任せる領域を整理します。",
  useCases: [
    "自作 HTTP サーバーで見えた仕組みと、実務で必要になる論点の差を整理したい",
    "認証、ログ、HTTPS、例外処理など、基盤選定の前に押さえたい観点を一覧で確認したい",
    "既製のサーバーやフレームワークに任せる領域を整理したい",
  ],
  cautions: [
    "認証・認可はログイン画面だけでは完結せず、権限分離やセッション失効まで含めて考える必要がある",
    "入力検証は形式チェックだけでなく、長さ制限や出力時エスケープまで含めて見ておきたい",
    "ログは調査に必要な情報を残しつつ、Cookie や個人情報をそのまま出さない配慮が必要になる",
    "HTTPS、タイムアウト、サイズ制限、同時接続数は、運用を考える段階で早めに論点になる",
    "例外時のレスポンスは、利用者向けの分かりやすさと情報を出しすぎないことの両立が必要になる",
    "単一プロセス前提のメモリ管理は、再起動や複数台構成になるとそのままでは扱いにくい",
    "ファイルアップロードや外部連携が入ると、エラーハンドリングと監査の論点が増える",
    "学習用に仕組みを理解した後は、既製の基盤にどこを任せるかまで整理しておくとつながりやすい",
  ],
  relatedArticleSlugs: ["cookie-session-server", "http-server-complete", "todo-http-server"],
  versionCoverage: {
    java8: "タイムアウト設定や `java.util.logging` の補助コードは Java 8 でも十分に書ける。記事の論点自体はこの時点でも追える。",
    java17: "補助コードや例示は Java 17 のほうが読みやすく書けるが、認証やログの論点そのものは Java 8 と大きく変わらない。",
    java21: "Virtual Thread によって接続処理の書き方は変えやすいが、この記事で整理する論点自体は引き続き同じである。",
    java8Code: `socket.setSoTimeout(5000);
logger.warning("timeout: " + clientAddress);`,
    java17Code: `logger.log(Level.WARNING,
    "invalid request path: {0}", path);`,
    java21Code: `Thread.ofVirtual().start(() -> {
    try { handleRequest(clientSocket); }
    catch (IOException e) { logger.warning(e.getMessage()); }
});`,
  },
  libraryComparison: [
    { name: "標準 API + 自前実装", whenToUse: "HTTP の仕組みを学ぶ、あるいは手元の検証コードとして最小構成を試したいとき。", tradeoff: "学習用としては有用だが、公開運用や実アプリの基盤としては前提にしないほうがよい。" },
    { name: "Apache / nginx + Tomcat などの既製サーバー", whenToUse: "HTTP サーバーやアプリケーション実行基盤を既製の構成で安定運用したいとき。Java アプリケーションを公開・運用する通常の選択肢。", tradeoff: "仕組みの細部は隠れるが、性能・安全性・運用性の面では現実的で、長期運用に向いている。" },
    { name: "Spring Boot / Play / Jakarta EE / Akka HTTP", whenToUse: "認証、バリデーション、ロギング、例外処理、運用基盤まで含めてアプリケーションとして構築したいとき。", tradeoff: "依存と学習コストは増えるが、実アプリに必要な責務を整理しやすく、再発明を避けられる。" },
  ],
  faq: [
    { question: "自作サーバーを公開すべきですか。", answer: "公開しないほうがよいです。この連載の自作サーバーは HTTP の仕組みを理解するための学習用であり、公開運用や実アプリの基盤として使う前提には向きません。" },
    { question: "自作サーバーに Basic 認証だけ付ければ十分ですか。", answer: "十分ではありません。認可、セッション固定化、CSRF、監査ログ、資格情報保護など、周辺要件が多数あります。" },
    { question: "ログには何を残すべきですか。", answer: "リクエスト ID、時刻、メソッド、パス、ステータス、処理時間などは有用です。一方で Cookie、Authorization、個人情報は原則そのまま出さないほうが安全です。" },
    { question: "HTTPS は Java 単体でも実装できますか。", answer: "できますが、証明書運用、暗号スイート、更新手順まで含めると負荷が高いため、実務ではリバースプロキシやフレームワークに任せることが多いです。" },
    { question: "どの時点でフレームワークに移行すべきですか。", answer: "実際のアプリケーションとして使う段階では、既製のサーバーやフレームワークを前提にしたほうが自然です。自作サーバーは仕組み理解のためにとどめるほうが整理しやすくなります。" },
    { question: "社内ツールなら自作サーバーでも許容されますか。", answer: "限定的な検証用途ならありえますが、継続利用するツールであれば、認証、操作ログ、障害対応まで含めて既製基盤を前提に考えるほうが無難です。" },
    { question: "最初に手を付けるべき安全対策は何ですか。", answer: "最低限でも入力値の長さ制限とエスケープ、タイムアウト設定、例外時の汎用エラーレスポンス、機密情報を含まないアクセスログは先に入れるべきです。" },
    { question: "なぜ認可のほうが認証より難しいのですか。", answer: "認証は『誰か』を確定する処理ですが、認可は『その人が何をしてよいか』を URL、操作、データ単位で判断する必要があるため、漏れやすく設計難易度が上がります。" },
    { question: "例外時に 500 を返すだけでは足りませんか。", answer: "利用者への応答としては 500 でよい場合がありますが、運用上は原因追跡のためのログ、相関 ID、再試行可否の判断材料が必要です。レスポンスだけ整えても不足します。" },
    { question: "この連載の続きをそのまま本番サーバー開発にしてはいけませんか。", answer: "勧めません。この連載は HTTP の仕組みを理解するための学習用です。実際のアプリケーションとして使うなら、Apache、nginx、Tomcat、Akka HTTP、Spring Boot、Jakarta EE など既製の基盤を前提に設計するほうが自然です。" },
  ],
  codeTitle: "ProductionNotesSnippet.java",
  codeSample: `import java.net.Socket;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ProductionNotesSnippet {

    private static final Logger logger =
        Logger.getLogger(ProductionNotesSnippet.class.getName());

    static void applySocketSafety(Socket socket) throws Exception {
        // 無限待ちを避けるため、読取タイムアウトを設定する
        socket.setSoTimeout(5000);
    }

    static void logRejectedPath(String path) {
        // ユーザー入力をログに残す場合も、必要最小限に留める
        logger.log(Level.WARNING, "Rejected path: {0}", path);
    }
}`,
},
{
  slug: "http-server-complete",
  title: "Java で学習用の HTTP サーバーを完成版として組み立てる",
  categorySlug: "httpserver",
  summary: "連載の要素をまとめ、ルーティング・POST・CSV・静的配信・Cookie を統合した完成版を整理する。",
  version: "Java 17",
  tags: ["HTTP サーバー", "完成版", "CSV", "Cookie", "ServerSocket"],
  apiNames: ["ServerSocket", "Socket", "ConcurrentHashMap", "Files", "URLDecoder"],
  description: "HTTP サーバー自作連載の総まとめとして、これまでの要素を統合した学習用完成版の構成とコードを整理する。",
  lead: "HTTP サーバー自作連載のまとめとして、ここまで扱ってきた要素を一つの学習用サーバーに並べて見直します。最小ルーティング、POST フォーム、TODO の CSV 永続化、静的ファイル配信、Cookie ベースの状態管理を一度つなげてみると、HTTP サーバーの内側で何が起きているかを通しで見やすくなります。ここでの完成版は実運用向けの完成品ではなく、連載全体の振り返り用です。",
  useCases: [
    "連載全体を通して HTTP サーバー自作の全体像を振り返りたい",
    "学習用サンプルとして、各要素がどうつながるかを見直したい",
    "既製の基盤に進む前に、ここまでの理解を一度まとめたい",
  ],
  cautions: [
    "完成版でも認証、アップロード、監査など実務で必要になる要素はかなり省いている",
    "一つのサンプルにまとめる構成は学習には向くが、責務分離の見本として使うものではない",
    "CSV 永続化とメモリセッションは、再起動や複数台構成を前提にしていない",
    "静的配信と動的処理を一つの学習用サーバーに載せているのは、理解しやすさを優先しているためである",
  ],
  relatedArticleSlugs: ["todo-http-server", "http-server-production-notes", "cookie-session-server"],
  versionCoverage: {
    java8: "複数の要素を一つにまとめると記述量が増えやすく、補助メソッドの切り出しが重要になる。",
    java17: "record、テキストブロック、`var` により、学習用のまとめコードでも読みやすさを保ちやすい。",
    java21: "Virtual Thread により接続処理は簡潔になるが、扱う要素の多さ自体は変わらない。",
    java8Code: `ExecutorService executor =
    Executors.newFixedThreadPool(10);`,
    java17Code: `record SessionUser(String name) {}
var sessions = new ConcurrentHashMap<String, SessionUser>();`,
    java21Code: `Thread.ofVirtual().start(() -> {
    try { handleRequest(client); }
    catch (IOException e) { /* ... */ }
});`,
  },
  libraryComparison: [
    { name: "学習用完成版（標準 API）", whenToUse: "連載全体の要素を一つにまとめて振り返りたいとき。", tradeoff: "理解には向くが、実務の構成や責務分離の見本にはならない。" },
    { name: "com.sun.net.httpserver.HttpServer + 補助クラス", whenToUse: "低レイヤを少し省いて、学習用のまとめを簡潔にしたいとき。", tradeoff: "Socket レベルの理解は薄くなる。" },
    { name: "Spring Boot / Play / Jakarta EE / Tomcat などの既製基盤", whenToUse: "学習後に実際のアプリケーション構成へ進むとき。", tradeoff: "抽象化は増えるが、運用と安全性の面で現実的になる。" },
  ],
  faq: [
    { question: "この完成版をそのままアプリの土台にしてよいですか。", answer: "勧めません。完成版は連載全体を振り返るための学習用まとめであり、実アプリの土台として使う前提ではありません。" },
    { question: "完成版コードをそのまま GitHub に公開してよいですか。", answer: "学習用サンプルとして公開するのは問題ありませんが、公開時には学習用であることを README などで明示しておくと誤解が少なくなります。" },
    { question: "完成版でもなぜ DB を使わないのですか。", answer: "連載の主眼が HTTP の仕組み理解だからです。永続化を DB に置き換えると、今度は DB 側の理解が主題になりやすくなります。" },
    { question: "次に学ぶべきは何ですか。", answer: "Spring Boot、Play、Jakarta EE などのフレームワーク実装に進み、認証・バリデーション・ログ・例外処理をどう基盤側に任せるかを見るのが自然です。" },
  ],
  codeTitle: "LearningHttpServerOverview.java",
  codeSample: `import java.io.IOException;
import java.net.ServerSocket;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LearningHttpServerOverview {

    static final int PORT = 8086;

    public static void main(String[] args) throws IOException {
        var sessions = new ConcurrentHashMap<String, String>();
        ExecutorService executor = Executors.newFixedThreadPool(10);

        try (var serverSocket = new ServerSocket(PORT)) {
            while (true) {
                var client = serverSocket.accept();
                executor.submit(() -> {
                    try {
                        // 1. リクエスト行とヘッダーを読む
                        // 2. ルーティングする
                        // 3. TODO は CSV に保存する
                        // 4. 静的ファイルは static/ から配信する
                        // 5. Cookie を読み、sessions で状態管理する
                        client.close();
                    } catch (IOException ignored) {
                    }
                });
            }
        }
    }
}`,
},
]
