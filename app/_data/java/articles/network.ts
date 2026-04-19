import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "mail-send",
  title: "Java でメール送信を実装する方法と SMTP 設定の基礎知識",
  categorySlug: "network",
  summary: "Jakarta Mail による SMTP メール送信の基本構成と、テキスト・HTML メールの実装パターンを整理する。",
  version: "Java 17",
  tags: ["メール送信", "SMTP", "Jakarta Mail", "JavaMail", "HTML メール"],
  apiNames: ["Properties", "Session", "MimeMessage", "Transport", "MimeBodyPart"],
  description: "Jakarta Mail を使った SMTP メール送信の基本パターンと設定・認証・文字コードの扱いを外部ライブラリ比較とともに Java 8/17/21 対応で解説する。",
  lead: "通知メール、パスワードリセット、帳票の送付――業務システムでメール送信が必要になる場面は今でも多く残っています。Java 標準 API にはメール送信機能が含まれていませんが、Jakarta Mail（旧 JavaMail）を使えば、SMTP の接続設定からテキスト・HTML メールの組み立てまでを比較的少ないコードで実装できます。ただし、SMTP 認証の設定、STARTTLS と SSL/TLS の違い、日本語件名の文字コード指定、HTML メールでの MimeBodyPart の組み立てなど、初見で引っかかるポイントは少なくありません。この記事では、SMTP 設定の構造化から、テキストメール・HTML メールの送信、Java バージョンごとの書き方の違いまでを一通り整理します。開発環境では Mailtrap や MailHog を使うことで、実際のメールボックスに影響を与えずにテストできます。",
  useCases: [
    "ユーザー登録完了時に確認メールを自動送信し、認証リンクを本文に含める",
    "月次バッチ処理の結果サマリーを管理者宛にテキストメールで送信する",
    "請求書 PDF を HTML メールに添付して取引先へ送付する",
  ],
  cautions: [
    "Gmail の SMTP を使う場合、2022年以降はアプリパスワードの生成が必要（通常のパスワードでは認証できない）。二段階認証を有効にしたうえで Google アカウント設定からアプリパスワードを発行する",
    "日本語の件名には message.setSubject(subject, \"UTF-8\") で文字コードを明示する必要がある。省略すると文字化けの原因になる",
    "STARTTLS（ポート587）と SSL/TLS（ポート465）は設定が異なる。mail.smtp.starttls.enable と mail.smtp.ssl.enable を混同しないこと",
    "開発・テスト環境では Mailtrap や MailHog などのダミー SMTP サーバーを使い、本番メールサーバーへの誤送信を防ぐこと",
    "Jakarta Mail と旧 JavaMail（javax.mail）はパッケージ名が異なる。Jakarta EE 9 以降は jakarta.mail に移行している。依存のバージョンを確認すること",
  ],
  relatedArticleSlugs: [],
  versionCoverage: {
    java8: "javax.mail パッケージ（JavaMail）を使用。SMTP 設定は Properties に文字列で投入し、匿名クラスで Authenticator を実装する。型宣言が冗長になる。",
    java17: "jakarta.mail パッケージに移行。var による型推論で記述量が減る。テキストブロックで HTML メール本文を読みやすく記述できる。SMTP 設定を record で構造化するのも効果的。",
    java21: "sealed interface + record でメール種別（テキスト/HTML）を型として表現し、switch 式のパターンマッチングで種別ごとの送信処理を分岐できる。",
    java8Code: `// Java 8: javax.mail + 匿名クラスで Authenticator を実装
Properties props = new Properties();
props.put("mail.smtp.auth", "true");
props.put("mail.smtp.starttls.enable", "true");
props.put("mail.smtp.host", "smtp.gmail.com");
props.put("mail.smtp.port", "587");
Session session = Session.getInstance(props,
    new Authenticator() {
        protected PasswordAuthentication
                getPasswordAuthentication() {
            return new PasswordAuthentication(user, pass);
        }
    });`,
    java17Code: `// Java 17: record で SMTP 設定を構造化
record SmtpConfig(String host, int port,
                  String username, String password,
                  boolean useTls) {}
var config = new SmtpConfig(
    "smtp.gmail.com", 587, user, pass, true);
// テキストブロックで HTML 本文を記述
var html = """
    <h1>お知らせ</h1>
    <p>HTML メールのサンプルです。</p>
    """;`,
    java21Code: `// Java 21: sealed interface でメール種別を型安全に
sealed interface MailMessage {
    record TextMail(String from, String to,
        String subject, String body)
        implements MailMessage {}
    record HtmlMail(String from, String to,
        String subject, String htmlBody)
        implements MailMessage {}
}
switch (mail) {
    case TextMail m  -> sendText(m);
    case HtmlMail m  -> sendHtml(m);
}`,
  },
  libraryComparison: [
    { name: "Jakarta Mail（旧 JavaMail）", whenToUse: "SMTP 接続の細かい制御が必要な場合。テキスト・HTML・添付ファイルなど多様なメール形式を扱うとき。", tradeoff: "依存追加が必要（jakarta.mail）。低レベル API のため、Session・MimeMessage の組み立てがやや冗長。" },
    { name: "Spring Mail（JavaMailSender）", whenToUse: "Spring Boot プロジェクトで、DI と application.yml による設定管理を活用したいとき。", tradeoff: "Spring 依存が前提。非 Spring プロジェクトへの適用は過剰になる。" },
    { name: "Apache Commons Email", whenToUse: "Jakarta Mail のラッパーとして、簡潔な API でメール送信を済ませたいとき。", tradeoff: "依存が増える割に、Jakarta Mail を直接使う場合との差分は限定的。保守状況の確認が必要。" },
  ],
  faq: [
    { question: "開発環境でメール送信をテストするにはどうすればよいですか。", answer: "Mailtrap や MailHog などのダミー SMTP サーバーを使うのが一般的です。実際のメールボックスに影響を与えず、送信内容をブラウザで確認できます。" },
    { question: "javax.mail と jakarta.mail の違いは何ですか。", answer: "Jakarta EE 9 以降でパッケージ名が javax.mail から jakarta.mail に変更されました。API の構造は同じですが、import 文とライブラリ依存の groupId/artifactId が異なります。新規プロジェクトでは jakarta.mail を選んでください。" },
    { question: "添付ファイル付きメールを送るにはどうすればよいですか。", answer: "MimeMultipart に MimeBodyPart を複数追加し、テキスト/HTML パートと添付ファイルパートを組み合わせます。添付パートには DataHandler と FileDataSource を使ってファイルを設定します。" },
  ],
  codeTitle: "MailSender.java",
  codeSample: `import java.util.Properties;

/**
 * Jakarta Mail によるメール送信のサンプル。
 * 実行には pom.xml に jakarta.mail 依存の追加が必要です。
 *
 * <dependency>
 *   <groupId>com.sun.mail</groupId>
 *   <artifactId>jakarta.mail</artifactId>
 *   <version>2.0.1</version>
 * </dependency>
 */
public class MailSender {

    // SMTP 設定を record で構造化（Java 16+）
    record SmtpConfig(String host, int port,
                      String username, String password,
                      boolean useTls) {}

    /** SMTP 接続用の Properties を生成する */
    static Properties buildSmtpProperties(SmtpConfig config) {
        var props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable",
                  String.valueOf(config.useTls()));
        props.put("mail.smtp.host", config.host());
        props.put("mail.smtp.port",
                  String.valueOf(config.port()));
        return props;
    }

    /*
     * テキストメール送信（Jakarta Mail 使用時のコード構成）
     *
     * var session = Session.getInstance(props, authenticator);
     * var message = new MimeMessage(session);
     * message.setFrom(new InternetAddress(from));
     * message.setRecipients(
     *     Message.RecipientType.TO, InternetAddress.parse(to));
     * message.setSubject(subject, "UTF-8");
     * message.setText(body, "UTF-8");
     * Transport.send(message);
     */
    static void sendTextMail(SmtpConfig config,
            String from, String to,
            String subject, String body) {
        System.out.println("=== テキストメール送信 ===");
        System.out.println("SMTP: " + config.host()
                + ":" + config.port());
        System.out.println("From: " + from);
        System.out.println("To:   " + to);
        System.out.println("件名: " + subject);
        System.out.println("本文: " + body);
    }

    /*
     * HTML メール送信（テキストブロックで HTML を記述）
     */
    static void sendHtmlMail(SmtpConfig config,
            String from, String to, String subject) {
        var htmlBody = """
                <!DOCTYPE html>
                <html>
                <body>
                  <h1 style="color: #2563eb;">お知らせ</h1>
                  <p>Jakarta Mail を使った
                     <strong>HTML メール</strong>のサンプルです。</p>
                </body>
                </html>
                """;
        System.out.println("=== HTML メール送信 ===");
        System.out.println("SMTP: " + config.host()
                + ":" + config.port());
        System.out.println("To:   " + to);
        System.out.println("件名: " + subject);
    }

    public static void main(String[] args) {
        var config = new SmtpConfig(
            "smtp.gmail.com", 587,
            "your-email@gmail.com", "your-app-password",
            true
        );

        sendTextMail(config,
            "from@example.com", "to@example.com",
            "テスト件名", "テスト本文です。");

        System.out.println();

        sendHtmlMail(config,
            "from@example.com", "to@example.com",
            "HTML メールテスト");
    }
}`,
},
{
  slug: "http-client-basic",
  title: "Java HttpClient で HTTP 通信を実装する方法",
  categorySlug: "network",
  summary: "Java 11 以降の HttpClient で GET/POST を送信し、タイムアウトやステータスコードの扱いを整理する。",
  version: "Java 17",
  tags: ["HttpClient", "HTTP", "GET", "POST", "REST API"],
  apiNames: ["HttpClient", "HttpRequest", "HttpResponse", "URI", "Duration"],
  description: "Java 11 以降の HttpClient で GET/POST リクエストを送信する方法を、タイムアウト設定・ステータスコード判定・非同期処理まで Java 8/17/21 対応で解説する。",
  lead: "外部 API との連携やマイクロサービス間通信など、業務システムで HTTP リクエストを送信する場面は日常的に発生します。Java 11 で追加された HttpClient は、それまでの HttpURLConnection と比べてビルダーパターンで直感的に組み立てられ、タイムアウト設定やレスポンス処理も簡潔です。ただし Java 8 環境ではこの API が使えないため、HttpURLConnection との使い分けを理解しておく必要があります。HttpClient による GET/POST の基本パターンから、ステータスコードの判定、接続・読み取りタイムアウトの設定、Java 21 での非同期処理まで、実務で必要になるポイントを整理した。",
  useCases: [
    "外部 REST API から JSON データを取得し、業務システムのマスタ情報を更新する",
    "決済サービスの API に POST リクエストで注文情報を送信し、レスポンスを処理する",
    "複数の外部 API を並行して呼び出し、レスポンスを集約してダッシュボードに表示する",
  ],
  cautions: [
    "HttpClient は Java 11 以降でのみ使用可能。Java 8 環境では HttpURLConnection を使うこと",
    "HttpClient インスタンスはスレッドセーフなので、static final で共有して使い回すのが効率的。リクエストごとに new しない",
    "connectTimeout はサーバーへの接続確立の制限時間、request の timeout はレスポンス全体の制限時間。両方を適切に設定すること",
    "ステータスコード 2xx 以外をエラーとして扱う場合、HttpClient は例外を投げないため自分で判定ロジックを書く必要がある",
    "実務では外部 API のタイムアウトを設定していないコードを保守案件でよく見かける。外部 API 呼び出しにはconnectTimeout と request timeout を必ず設定し、値は API の SLA を参考に決めること。",
  ],
  relatedArticleSlugs: ["json-parsing", "exception-chain"],
  versionCoverage: {
    java8: "HttpClient は使用不可。HttpURLConnection で GET/POST を手動で組み立てる必要がある。ストリームの読み書きが冗長になる。",
    java17: "HttpClient のビルダーパターンと var を組み合わせて簡潔に記述できる。同期送信が基本パターン。",
    java21: "sendAsync + CompletableFuture で非同期リクエストを効率的に扱える。複数 API の並行呼び出しに有効。",
    java8Code: `// Java 8: HttpURLConnection で GET（冗長）
HttpURLConnection conn =
    (HttpURLConnection) new URL(url).openConnection();
conn.setRequestMethod("GET");
conn.setConnectTimeout(5000);
conn.setReadTimeout(10000);
try (BufferedReader br = new BufferedReader(
        new InputStreamReader(conn.getInputStream()))) {
    String line;
    while ((line = br.readLine()) != null) {
        sb.append(line);
    }
} finally {
    conn.disconnect();
}`,
    java17Code: `// Java 17: HttpClient で GET（簡潔）
private static final HttpClient CLIENT =
    HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build();

var request = HttpRequest.newBuilder()
    .uri(URI.create(url))
    .timeout(Duration.ofSeconds(10))
    .header("Accept", "application/json")
    .GET().build();
var response = CLIENT.send(request,
    HttpResponse.BodyHandlers.ofString());`,
    java21Code: `// Java 21: sendAsync で非同期 GET
CompletableFuture<String> future =
    CLIENT.sendAsync(request,
        HttpResponse.BodyHandlers.ofString())
    .thenApply(response -> {
        if (response.statusCode() >= 300)
            throw new RuntimeException("HTTP " +
                response.statusCode());
        return response.body();
    });`,
  },
  libraryComparison: [
    { name: "標準 HttpClient（Java 11+）", whenToUse: "Java 11 以降の環境で HTTP 通信を行う場合。依存追加なしで簡潔に書ける。", tradeoff: "Java 8 では使えない。リトライやインターセプターは自前で実装する必要がある。" },
    { name: "OkHttp", whenToUse: "リトライ、インターセプター、コネクションプール制御など高度な制御が必要な場合。", tradeoff: "外部依存が増える。単純な GET/POST なら標準 HttpClient で十分。" },
    { name: "Apache HttpComponents", whenToUse: "Java 8 環境で HttpURLConnection より扱いやすい HTTP クライアントが必要な場合。", tradeoff: "依存が大きい。Java 11 以降では標準 HttpClient のほうが軽量。" },
  ],
  faq: [
    { question: "HttpClient と HttpURLConnection はどちらを使うべきですか。", answer: "Java 11 以降であれば HttpClient を選んでください。ビルダーパターンで組み立てやすく、非同期処理もサポートしています。Java 8 環境では HttpURLConnection を使います。" },
    { question: "リクエストにカスタムヘッダーを追加するにはどうしますか。", answer: "HttpRequest.newBuilder().header(\"Authorization\", \"Bearer xxx\") のように header メソッドをチェーンします。複数ヘッダーは header を繰り返すか headers メソッドで一括指定します。" },
    { question: "タイムアウトはどのくらいに設定すべきですか。", answer: "connectTimeout は 3〜5 秒、request の timeout は API の応答特性に応じて 10〜30 秒が目安です。バッチ処理では長めに、画面応答では短めに設定します。" },
  ],
  codeTitle: "HttpClient で GET/POST リクエストを送信する",
  codeSample: `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import java.io.IOException;

public class HttpClientSample {

    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public static String get(String url) throws IOException, InterruptedException {
        var request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Accept", "application/json")
                .GET()
                .build();

        var response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("HTTP エラー: " + response.statusCode());
        }
        return response.body();
    }

    public static String post(String url, String jsonBody)
            throws IOException, InterruptedException {
        var request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        var response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("HTTP エラー: " + response.statusCode());
        }
        return response.body();
    }

    public static void main(String[] args) throws IOException, InterruptedException {

        String body = get("https://httpbin.org/get");
        System.out.println(body);

        String json = "{\\"name\\":\\"太郎\\",\\"age\\":25}";
        String result = post("https://httpbin.org/post", json);
        System.out.println(result);
    }
}`,
},
{
  slug: "httpurlconnection",
  title: "Java HttpURLConnection で HTTP 通信する基本実装",
  categorySlug: "network",
  summary: "Java 8 でも使える HttpURLConnection で GET/POST を実装し、エラーストリームやタイムアウトの扱いを整理する。",
  version: "Java 17",
  tags: ["HttpURLConnection", "HTTP", "GET", "POST", "Java 8"],
  apiNames: ["HttpURLConnection", "URL", "BufferedReader", "OutputStream", "InputStreamReader"],
  description: "Java 標準 API の HttpURLConnection で GET/POST リクエストを送信する方法を、エラー処理・タイムアウト・レスポンスヘッダー読み取りまで解説する。",
  lead: "HttpURLConnection は Java 1.1 から存在する HTTP 通信の標準 API です。Java 11 以降では HttpClient が推奨されますが、Java 8 環境の保守案件や、外部ライブラリを追加できない制約のあるプロジェクトでは今でも現役で使われています。ただし、ストリームの読み書きやエラーレスポンスの扱い、disconnect のタイミングなど、初見で引っかかるポイントが多い API でもあります。この記事では、GET/POST の基本パターンから、エラーストリームの正しい読み取り方、タイムアウト設定、レスポンスヘッダーの取得まで、実務で困らないレベルの知識を整理します。Java 21 では sealed interface で成功/失敗を型安全に表現するパターンも紹介します。",
  useCases: [
    "Java 8 環境の保守案件で外部 API にリクエストを送信する",
    "外部ライブラリの追加が制限された環境で HTTP 通信を実装する",
    "テスト環境で簡易的な HTTP リクエストを送信してエンドポイントの疎通確認を行う",
  ],
  cautions: [
    "getErrorStream() は 4xx/5xx のときだけ非 null を返す。getInputStream() をそのまま呼ぶと IOException が発生する",
    "disconnect() を finally ブロックで必ず呼ぶこと。呼ばないとソケットが解放されずリソースリークになる",
    "setDoOutput(true) を呼ばないと POST のリクエストボディを送信できない。GET の場合は false（デフォルト）のままにする",
    "URL クラスのコンストラクタは Java 20 で非推奨になった。将来的には URI.create().toURL() への移行が必要",
  ],
  relatedArticleSlugs: ["http-client-basic", "http-socket-raw", "mail-send"],
  versionCoverage: {
    java8: "明示的な型宣言と try-finally による手動リソース管理が必要。エラー処理が冗長になりがち。",
    java17: "var（JEP 286）による型推論で HttpURLConnection の型宣言を省略でき、記述が簡潔になる。エラーストリームの処理パターンも整理しやすい。",
    java21: "sealed interface + record でレスポンスを Ok/Err に分類し、pattern matching switch で安全に処理できる。",
    java8Code: `// Java 8: 明示的な型宣言
URL url = new URL(urlStr);
HttpURLConnection conn =
    (HttpURLConnection) url.openConnection();
try {
    conn.setRequestMethod("GET");
    conn.setConnectTimeout(5000);
    int status = conn.getResponseCode();
    if (status >= 400) {
        BufferedReader br = new BufferedReader(
            new InputStreamReader(
                conn.getErrorStream()));
        throw new IOException(readAll(br));
    }
} finally {
    conn.disconnect();
}`,
    java17Code: `// Java 17: var で簡潔に
var conn = (HttpURLConnection)
    new URL(urlStr).openConnection();
try {
    conn.setRequestMethod("GET");
    var status = conn.getResponseCode();
    if (status >= 400) {
        try (var br = new BufferedReader(
                new InputStreamReader(
                    conn.getErrorStream()))) {
            throw new IOException(readAll(br));
        }
    }
} finally {
    conn.disconnect();
}`,
    java21Code: `// Java 21: sealed interface で結果を型安全に
sealed interface HttpResult
        permits HttpResult.Ok, HttpResult.Err {
    record Ok(int status, String body)
        implements HttpResult {}
    record Err(int status, String body)
        implements HttpResult {}
}
String msg = switch (result) {
    case Ok  r -> "成功: " + r.body();
    case Err r -> "失敗: " + r.status();
};`,
  },
  libraryComparison: [
    { name: "標準 HttpURLConnection", whenToUse: "Java 8 環境や外部ライブラリ追加不可の制約がある場合。", tradeoff: "ストリーム操作が冗長。リダイレクト追跡やクッキー管理は手動で行う必要がある。" },
    { name: "標準 HttpClient（Java 11+）", whenToUse: "Java 11 以降の環境。ビルダーパターンで組み立てやすく、非同期もサポート。", tradeoff: "Java 8 では使えない。" },
    { name: "OkHttp", whenToUse: "Java 8 環境でも HttpURLConnection より扱いやすいクライアントが必要な場合。", tradeoff: "外部依存が追加される。Kotlin ランタイムも含まれる。" },
  ],
  faq: [
    { question: "HttpURLConnection は非推奨ですか。", answer: "API 自体は非推奨ではありません。ただし Java 11 以降の新規プロジェクトでは HttpClient が推奨です。Java 8 環境や保守案件では引き続き使用できます。" },
    { question: "リダイレクト（3xx）を自動追跡するにはどうしますか。", answer: "HttpURLConnection.setFollowRedirects(true) でデフォルトで有効です。ただし HTTP から HTTPS へのリダイレクトは自動追跡されないため、手動でリダイレクト先 URL を取得して再接続する必要があります。" },
    { question: "エラーレスポンスのボディを読むにはどうしますか。", answer: "ステータスコードが 400 以上の場合、getInputStream() ではなく getErrorStream() からレスポンスボディを読みます。null チェックも忘れずに行ってください。" },
  ],
  codeTitle: "HttpURLConnection で GET/POST を実装する",
  codeSample: `import java.io.BufferedReader;

public class HttpURLConnectionSample {

    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 10000;

    public static String get(String urlStr) throws IOException {
        var conn = (HttpURLConnection) new URL(urlStr).openConnection();
        try {
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);
            conn.setRequestProperty("Accept", "application/json");

            var status = conn.getResponseCode();
            if (status >= 400) {
                try (var br = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    throw new IOException("HTTP エラー " + status + ": " + readAll(br));
                }
            }
            try (var br = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                return readAll(br);
            }
        } finally {
            conn.disconnect();
        }
    }

    public static String post(String urlStr, String jsonBody) throws IOException {
        var conn = (HttpURLConnection) new URL(urlStr).openConnection();
        try {
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
            conn.setReadTimeout(READ_TIMEOUT_MS);
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");

            var bodyBytes = jsonBody.getBytes(StandardCharsets.UTF_8);
            conn.setRequestProperty("Content-Length", String.valueOf(bodyBytes.length));
            try (OutputStream os = conn.getOutputStream()) {
                os.write(bodyBytes);
            }

            var status = conn.getResponseCode();
            if (status >= 400) {
                try (var br = new BufferedReader(
                        new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8))) {
                    throw new IOException("HTTP エラー " + status + ": " + readAll(br));
                }
            }
            try (var br = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                return readAll(br);
            }
        } finally {
            conn.disconnect();
        }
    }

    private static String readAll(BufferedReader br) throws IOException {
        var sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            sb.append(line);
        }
        return sb.toString();
    }

    public static void main(String[] args) throws IOException {
        String response = get("https://httpbin.org/get");
        System.out.println(response);
    }
}`,
},
{
  slug: "tcp-socket",
  title: "Java TCP ソケットでクライアント/サーバー通信を実装する",
  categorySlug: "network",
  summary: "ServerSocket と Socket でエコーサーバーを構築し、TCP 通信の基本フローを理解する。",
  version: "Java 17",
  tags: ["TCP", "Socket", "ServerSocket", "エコーサーバー", "ソケット通信"],
  apiNames: ["ServerSocket", "Socket", "BufferedReader", "PrintWriter", "ExecutorService"],
  description: "Java 標準 API の ServerSocket と Socket で TCP エコーサーバーを構築し、接続・送受信・切断の基本フローを Java 8/17/21 対応で解説する。",
  lead: "TCP ソケット通信は HTTP や SMTP といった上位プロトコルの基盤であり、ネットワークプログラミングの出発点です。Java では ServerSocket でサーバーを待ち受け、Socket でクライアントから接続するという明確な構造が用意されています。この記事では、最もシンプルなエコーサーバーを例に、TCP の接続確立からメッセージの送受信、切断までの一連の流れを実装します。Java 8 では匿名クラスと明示的な型宣言で書いていた処理が、Java 17 では record や var で簡潔になり、Java 21 では仮想スレッドで接続ごとのスレッド管理から解放されるという進化も確認できます。",
  useCases: [
    "社内ツール間のプロセス間通信を TCP ソケットで実装し、コマンドを送受信する",
    "既存のテキストベースプロトコル（POP3、FTP など）のクライアントを Java で実装する",
    "テスト用のモックサーバーを ServerSocket で構築し、クライアント側の通信処理を検証する",
  ],
  cautions: [
    "ServerSocket.accept() はブロッキング呼び出し。メインスレッドで呼ぶと他の処理が止まるため、別スレッドで実行すること",
    "クライアント側の Socket は try-with-resources で確実にクローズする。クローズし忘れるとポート枯渇の原因になる",
    "BufferedReader.readLine() は改行文字を待つ。送信側が println() ではなく print() を使うと受信側が永久にブロックする",
    "ループバック（localhost）では動作するが、異なるマシン間ではファイアウォールやポート開放の設定が必要",
  ],
  relatedArticleSlugs: ["udp-socket", "http-socket-raw", "smtp-socket", "mail-send"],
  versionCoverage: {
    java8: "匿名 Runnable クラスでサーバーのリクエスト処理を記述する。Socket や BufferedReader の型宣言が冗長になる。",
    java17: "record でメッセージを型安全に表現し、var で記述を簡潔にできる。テキストブロックも活用可能。",
    java21: "Executors.newVirtualThreadPerTaskExecutor() で仮想スレッドを使い、接続ごとに軽量スレッドを割り当てられる。",
    java8Code: `// Java 8: 匿名クラスでサーバースレッドを起動
executor.submit(new Runnable() {
    @Override
    public void run() {
        try {
            Socket client = serverSocket.accept();
            BufferedReader in = new BufferedReader(
                new InputStreamReader(
                    client.getInputStream()));
            PrintWriter out = new PrintWriter(
                client.getOutputStream(), true);
            String line;
            while ((line = in.readLine()) != null) {
                out.println("ECHO: " + line);
            }
        } catch (IOException e) { /* */ }
    }
});`,
    java17Code: `// Java 17: record + var で簡潔に
record ClientMessage(String text) {}
var messages = List.of(
    new ClientMessage("Hello"),
    new ClientMessage("EXIT"));
try (var socket = new Socket("localhost", port);
     var out = new PrintWriter(
         socket.getOutputStream(), true);
     var in = new BufferedReader(
         new InputStreamReader(
             socket.getInputStream()))) {
    for (var msg : messages) {
        out.println(msg.text());
        System.out.println(in.readLine());
    }
}`,
    java21Code: `// Java 21: 仮想スレッドで接続を処理
var executor = Executors
    .newVirtualThreadPerTaskExecutor();
executor.submit(() -> {
    var client = serverSocket.accept();
    try (var vte = Executors
            .newVirtualThreadPerTaskExecutor()) {
        vte.submit(() -> {

            handleClient(client);
            return null;
        });
    }
});`,
  },
  libraryComparison: [
    { name: "標準 API（ServerSocket/Socket）", whenToUse: "TCP 通信の仕組み学習や、テスト用モックサーバーの構築。依存なしで動作する。", tradeoff: "プロトコル解析やフレーム管理は全て自前。本番用途には向かない。" },
    { name: "Netty", whenToUse: "高性能な非同期 TCP サーバーを構築する場合。チャネルパイプラインでプロトコル処理を組み立てられる。", tradeoff: "学習コストが高い。小規模な用途にはオーバースペック。" },
    { name: "gRPC / Protocol Buffers", whenToUse: "マイクロサービス間の型安全な RPC 通信が必要な場合。", tradeoff: "TCP の生の通信を理解する目的には合わない。プロトコル定義ファイルの管理が必要。" },
  ],
  faq: [
    { question: "TCP と UDP の使い分けはどうすればよいですか。", answer: "信頼性が必要な通信（ファイル転送、API 呼び出し）は TCP、速度優先で多少のパケットロスが許容される場合（ログ配信、ストリーミング）は UDP を選びます。" },
    { question: "同時に複数クライアントを処理するにはどうしますか。", answer: "accept() で受け取った Socket を ExecutorService に渡してスレッドプールで処理します。Java 21 なら Virtual Thread で接続ごとにスレッドを生成できます。" },
    { question: "ソケット通信のデバッグはどうすればよいですか。", answer: "Wireshark でパケットキャプチャするか、telnet / nc コマンドで手動接続してプロトコルの動作を確認するのが効果的です。" },
  ],
  codeTitle: "TCP エコーサーバーとクライアント",
  codeSample: `import java.io.*;

public class TcpSocketSample {

    record ClientMessage(String text) {}

    public static void startEchoServer(int port, ExecutorService executor)
            throws IOException {
        var serverSocket = new ServerSocket(port);
        executor.submit(() -> {
            try {
                var client = serverSocket.accept();
                try (var in = new BufferedReader(
                         new InputStreamReader(client.getInputStream()));
                     var out = new PrintWriter(
                         client.getOutputStream(), true)) {
                    String line;
                    while ((line = in.readLine()) != null) {
                        out.println("ECHO: " + line);
                        if ("EXIT".equals(line)) break;
                    }
                }
                serverSocket.close();
            } catch (IOException e) {

            }
        });
    }

    public static void runClient(int port) throws IOException {
        var messages = List.of(
            new ClientMessage("Hello, Server!"),
            new ClientMessage("EXIT")
        );
        try (var socket = new Socket("localhost", port);
             var out = new PrintWriter(socket.getOutputStream(), true);
             var in = new BufferedReader(
                 new InputStreamReader(socket.getInputStream()))) {
            for (var msg : messages) {
                out.println(msg.text());
                System.out.println("受信: " + in.readLine());
            }
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 9000;
        var executor = Executors.newSingleThreadExecutor();
        startEchoServer(port, executor);
        Thread.sleep(100);
        runClient(port);
        executor.shutdown();
    }
}`,
},
{
  slug: "udp-socket",
  title: "Java UDP ソケットでデータグラム通信を実装する方法と注意点",
  categorySlug: "network",
  summary: "DatagramSocket と DatagramPacket で UDP 送受信を実装し、TCP との違いを整理する。",
  version: "Java 17",
  tags: ["UDP", "DatagramSocket", "DatagramPacket", "ソケット通信", "非接続型"],
  apiNames: ["DatagramSocket", "DatagramPacket", "InetAddress", "ExecutorService"],
  description: "Java 標準 API の DatagramSocket で UDP データグラム通信を実装し、TCP との違いや実務での使いどころを Java 8/17/21 対応で解説する。",
  lead: "UDP は TCP と異なり、接続を確立せずにデータグラム（パケット）を送信するプロトコルです。到着順序やパケットロスの保証がない代わりに、オーバーヘッドが小さく高速に通信できる特徴があります。業務システムでは syslog やメトリクス送信、DNS クエリなどの場面で使われています。Java では DatagramSocket と DatagramPacket を使うことで、UDP の送受信を標準 API だけで実装できます。この記事では、送信側と受信側の基本パターンから、パケットサイズの制約、文字コードの指定、Java 21 での仮想スレッドとの組み合わせまで、実務で必要な知識を整理します。",
  useCases: [
    "アプリケーションのメトリクスデータを Graphite や StatsD サーバーに UDP で送信する",
    "社内ネットワークの監視エージェントから中央サーバーにログを UDP で配信する",
    "軽量な通知プロトコルを UDP で実装し、サービス間のイベント通知を低遅延で行う",
  ],
  cautions: [
    "UDP はパケットの到達を保証しない。重要なデータの送信には TCP を使うか、アプリケーション層で再送制御を実装すること",
    "DatagramPacket のバッファサイズを超えるデータは切り捨てられる。受信側のバッファサイズを十分に確保すること",
    "UDP のペイロード最大サイズは 65,507 バイトだが、MTU（通常 1,500 バイト）を超えるとフラグメント化が起こり、パケットロスの確率が上がる",
    "ファイアウォールで UDP ポートがブロックされている場合が多い。ネットワーク管理者に確認すること",
  ],
  relatedArticleSlugs: ["tcp-socket", "http-socket-raw", "mail-send"],
  versionCoverage: {
    java8: "匿名 Runnable クラスで受信スレッドを記述する。DatagramPacket や DatagramSocket の型宣言が冗長になる。",
    java17: "record でデータグラムのメタ情報を構造化し、var で記述を簡潔にできる。テキストブロックで受信結果を整形できる。",
    java21: "仮想スレッドで受信処理を効率的に並行実行できる。sealed interface でイベントを型安全に表現可能。",
    java8Code: `// Java 8: 匿名 Runnable で受信スレッドを起動
DatagramSocket socket = new DatagramSocket(PORT);
executor.submit(new Runnable() {
    @Override
    public void run() {
        try {
            byte[] buf = new byte[1024];
            DatagramPacket pkt =
                new DatagramPacket(buf, buf.length);
            socket.receive(pkt);
            String msg = new String(pkt.getData(),
                0, pkt.getLength(), "UTF-8");
            System.out.println("受信: " + msg);
        } catch (IOException e) { /* */ }
    }
});`,
    java17Code: `// Java 17: record + var で受信データを構造化
record DatagramMessage(String text,
        InetAddress from, int port) {}
var buf = new byte[1024];
var pkt = new DatagramPacket(buf, buf.length);
socket.receive(pkt);
var msg = new DatagramMessage(
    new String(pkt.getData(), 0,
        pkt.getLength(), "UTF-8"),
    pkt.getAddress(), pkt.getPort());
System.out.printf("""
    受信: %s (from %s:%d)%n""",
    msg.text(), msg.from(), msg.port());`,
    java21Code: `// Java 21: sealed interface でイベント分類
sealed interface UdpEvent
        permits UdpEvent.Sent, UdpEvent.Received {
    record Sent(String msg) implements UdpEvent {}
    record Received(String msg, InetAddress from)
        implements UdpEvent {}
}
String log = switch (event) {
    case Sent     e -> "[送信] " + e.msg();
    case Received e -> "[受信] " + e.msg();
};`,
  },
  libraryComparison: [
    { name: "標準 API（DatagramSocket）", whenToUse: "UDP 通信の学習や、軽量なメトリクス送信・ログ配信。依存なしで動作する。", tradeoff: "信頼性保証や再送制御は自前で実装する必要がある。" },
    { name: "Netty（UDP チャネル）", whenToUse: "高スループットの UDP サーバーを構築する場合。非同期 I/O で多数のパケットを効率的に処理できる。", tradeoff: "学習コストが高い。小規模な用途にはオーバースペック。" },
  ],
  faq: [
    { question: "UDP でデータが届かない場合の検知方法はありますか。", answer: "UDP 自体にはパケットロスの検知機能がありません。アプリケーション層でシーケンス番号を付与し、受信側で欠番を検知する方法が一般的です。" },
    { question: "マルチキャスト送信はできますか。", answer: "MulticastSocket を使えば、複数の受信者にデータグラムを同時送信できます。受信側は指定のグループアドレスに joinGroup() で参加します。" },
    { question: "DatagramPacket のバッファサイズはどのくらいに設定すべきですか。", answer: "送信データの最大サイズに合わせて設定します。一般的にはフラグメント化を避けるため 1,400 バイト以下に抑えるのが安全です。" },
  ],
  codeTitle: "UDP データグラムの送信と受信",
  codeSample: `import java.io.*;

public class UdpSocketSample {
    private static final int PORT = 9001;
    private static final String HOST = "localhost";

    record DatagramMessage(String text, InetAddress from, int port) {}

    public static void startReceiver(ExecutorService executor) throws Exception {
        var receiverSocket = new DatagramSocket(PORT);
        executor.submit(() -> {
            try {
                var buffer = new byte[1024];
                var packet = new DatagramPacket(buffer, buffer.length);
                receiverSocket.receive(packet);

                var msg = new DatagramMessage(
                    new String(packet.getData(), 0, packet.getLength(), "UTF-8"),
                    packet.getAddress(),
                    packet.getPort()
                );
                System.out.printf("受信: %s (from %s:%d)%n",
                    msg.text(), msg.from(), msg.port());
                receiverSocket.close();
            } catch (IOException e) {

            }
        });
    }

    public static void sendMessage(String message) throws IOException {
        try (var senderSocket = new DatagramSocket()) {
            var data = message.getBytes("UTF-8");
            var address = InetAddress.getByName(HOST);
            var packet = new DatagramPacket(data, data.length, address, PORT);
            senderSocket.send(packet);
            System.out.println("送信: " + message);
        }
    }

    public static void main(String[] args) throws Exception {
        var executor = Executors.newSingleThreadExecutor();
        startReceiver(executor);
        Thread.sleep(100);
        sendMessage("ログメッセージ: サービス起動完了");
        executor.awaitTermination(2, TimeUnit.SECONDS);
        executor.shutdown();
    }
}`,
},
{
  slug: "smtp-socket",
  title: "Java ソケットで SMTP プロトコルの仕組みを理解する",
  categorySlug: "network",
  summary: "TCP ソケットで SMTP コマンドを手作りし、メール送信プロトコルの基本フローを理解する。",
  version: "Java 17",
  tags: ["SMTP", "Socket", "メール", "プロトコル", "Base64"],
  apiNames: ["Socket", "BufferedReader", "PrintWriter", "Base64"],
  description: "TCP ソケットで SMTP コマンドを手動送信し、EHLO・AUTH LOGIN・MAIL FROM・DATA の一連のフローを Java 8/17/21 対応で理解する。",
  lead: "SMTP（Simple Mail Transfer Protocol）はメール送信の基盤となるプロトコルです。実務では Jakarta Mail や Spring Mail を使うため直接触る機会は少ないですが、メール送信のトラブルシューティングでは SMTP コマンドの理解が欠かせません。認証エラーの原因がクレデンシャルなのか TLS 設定なのか、SMTP のレベルで切り分けられるかどうかが解決速度を左右します。この記事では、TCP ソケットを使って SMTP コマンドを手作りし、EHLO による接続確立、AUTH LOGIN による認証、MAIL FROM / RCPT TO / DATA によるメール送信の一連のフローを確認します。実務での送信は Jakarta Mail を使うべきですが、プロトコルの構造を理解しておくことで障害対応の幅が広がります。",
  useCases: [
    "メール送信が失敗した際に、SMTP レベルのコマンドを手動実行して原因を切り分ける",
    "SMTP サーバーの EHLO レスポンスを確認し、対応する認証方式や拡張機能を調べる",
    "メール配信システムの監視ツールで、SMTP の疎通確認を行うヘルスチェック機能を実装する",
  ],
  cautions: [
    "この記事のコードは SMTP プロトコルの仕組み理解が目的。実務でのメール送信には Jakarta Mail を使うこと",
    "AUTH LOGIN の認証情報は Base64 エンコードされるだけで暗号化されない。必ず TLS/STARTTLS と組み合わせること",
    "SMTP サーバーのレスポンスコードは 3 桁の数字で始まる。2xx は成功、3xx は追加情報要求、4xx/5xx はエラーを表す",
    "Gmail などのサービスではアプリパスワードの発行が必要。通常のパスワードでは認証できない",
  ],
  relatedArticleSlugs: ["tcp-socket", "mail-send", "http-socket-raw"],
  versionCoverage: {
    java8: "SmtpClient クラスを手動で定義し、コマンド送受信を手続き的に記述する。SMTP フローの説明は System.out.println の羅列になる。",
    java17: "record で SMTP ステップを構造化し、テキストブロックでプロトコルの説明文を読みやすく記述できる。List.of で不変リストを活用。",
    java21: "sealed interface で SMTP レスポンスのステータス種別（成功/継続/エラー）を型安全に分類し、pattern matching switch で処理できる。",
    java8Code: `// Java 8: System.out.println で SMTP フローを説明
System.out.println("1. TCP 接続");
System.out.println("   S: 220 smtp.example.com");
System.out.println("2. EHLO");
System.out.println("   C: EHLO client.example.com");
System.out.println("   S: 250 AUTH LOGIN PLAIN");
System.out.println("3. AUTH LOGIN");
System.out.println("   C: AUTH LOGIN");
System.out.println("   S: 334 Username:");
String encoded = Base64.getEncoder()
    .encodeToString("user@example.com"
    .getBytes());`,
    java17Code: `// Java 17: record + テキストブロック
record SmtpStep(String label,
    String clientLine, String serverResponse) {}
var steps = List.of(
    new SmtpStep("接続", "(TCP 接続)",
        "220 smtp.example.com ESMTP ready"),
    new SmtpStep("あいさつ",
        "EHLO client.example.com",
        "250 AUTH LOGIN PLAIN"));
String overview = """
    SMTP は メール送信に使われる
    テキストベースのプロトコルです。
    """;`,
    java21Code: `// Java 21: sealed interface でレスポンス分類
sealed interface SmtpStatus
        permits SmtpStatus.Success,
        SmtpStatus.Intermediate, SmtpStatus.Error {
    record Success(int code, String msg)
        implements SmtpStatus {}
    record Intermediate(int code, String msg)
        implements SmtpStatus {}
    record Error(int code, String msg)
        implements SmtpStatus {}
}
String log = switch (status) {
    case Success      s -> "[成功] " + s.code();
    case Intermediate s -> "[継続] " + s.code();
    case Error        s -> "[エラー] " + s.code();
};`,
  },
  libraryComparison: [
    { name: "標準 API（Socket + 手動コマンド送信）", whenToUse: "SMTP プロトコルの学習や障害切り分けツールの実装。", tradeoff: "TLS ハンドシェイク、MIME エンコーディング、添付ファイルなど全て自前で実装する必要がある。" },
    { name: "Jakarta Mail（旧 JavaMail）", whenToUse: "実務でのメール送信。SMTP の接続・認証・MIME 組み立てを一括で扱える。", tradeoff: "外部依存が追加される。プロトコルの詳細は隠蔽されるため学習には向かない。" },
    { name: "Spring Mail（JavaMailSender）", whenToUse: "Spring Boot プロジェクトでの DI ベースのメール送信。", tradeoff: "Spring 依存が前提。SMTP の仕組み理解には役立たない。" },
  ],
  faq: [
    { question: "EHLO と HELO の違いは何ですか。", answer: "EHLO は拡張 SMTP（ESMTP）のあいさつコマンドで、サーバーが対応する拡張機能（認証方式など）を返します。HELO は旧仕様で機能拡張の情報が返りません。現在は EHLO を使うのが標準です。" },
    { question: "STARTTLS と SSL/TLS の違いは何ですか。", answer: "STARTTLS はポート 587 で平文接続を開始し、途中で TLS に昇格します。SSL/TLS はポート 465 で最初から暗号化接続です。現在は STARTTLS（ポート 587）が推奨されています。" },
    { question: "このコードで実際にメールを送信できますか。", answer: "プロトコルの理解用のデモコードです。実際のメール送信には TLS 接続や MIME エンコーディングが必要で、Jakarta Mail の使用を推奨します。" },
  ],
  codeTitle: "SMTP プロトコルの基本フローをソケットで確認する",
  codeSample: `import java.io.*;

public class SmtpSocketSample {

    record SmtpStep(String commandLabel, String clientLine,
                    String serverResponse) {}

    static void showSmtpFlow() {
        String overview = """
                SMTP（Simple Mail Transfer Protocol）は
                メール送信に使われるテキストベースのプロトコルです。
                クライアントとサーバーがコマンドと応答コードを
                やり取りしてメールを転送します。
                """;
        System.out.println(overview);

        var steps = List.of(
            new SmtpStep("接続", "(TCP 接続)",
                "220 smtp.example.com ESMTP ready"),
            new SmtpStep("あいさつ", "EHLO client.example.com",
                "250 AUTH LOGIN PLAIN"),
            new SmtpStep("認証開始", "AUTH LOGIN", "334 Username:"),
            new SmtpStep("ユーザー名",
                Base64.getEncoder().encodeToString(
                    "user@example.com".getBytes()),
                "334 Password:"),
            new SmtpStep("送信者指定", "MAIL FROM:<from@example.com>",
                "250 OK"),
            new SmtpStep("受信者指定", "RCPT TO:<to@example.com>",
                "250 OK"),
            new SmtpStep("本文開始", "DATA",
                "354 Start mail input"),
            new SmtpStep("本文終了", ".", "250 Message accepted"),
            new SmtpStep("切断", "QUIT", "221 Bye")
        );

        System.out.println("=== SMTP コマンドの流れ ===");
        for (var step : steps) {
            System.out.printf("%-10s  C: %-40s  S: %s%n",
                "[" + step.commandLabel() + "]",
                step.clientLine(),
                step.serverResponse());
        }
    }

    public static void main(String[] args) {
        showSmtpFlow();
        System.out.println();
        System.out.println("注意: 実務では Jakarta Mail を使用してください");
    }
}`,
},
{
  slug: "ftp-client",
  title: "Java ソケットで FTP プロトコルの仕組みを理解する実装例",
  categorySlug: "network",
  summary: "TCP ソケットで FTP コマンドを手作りし、コマンドチャネル・データチャネル・PASV モードを理解する。",
  version: "Java 17",
  tags: ["FTP", "Socket", "ファイル転送", "PASV", "プロトコル"],
  apiNames: ["Socket", "BufferedReader", "PrintWriter"],
  description: "Java の TCP ソケットで FTP コマンドを手動送信し、コマンドチャネル・PASV モード・ファイル転送の仕組みを Java 8/17/21 対応で理解する。",
  lead: "FTP（File Transfer Protocol）はファイル転送の古典的なプロトコルで、レガシーシステムとのデータ連携や、定期的なファイル配信の場面で今でも使われています。HTTP と異なり、FTP ではコマンド用とデータ転送用の 2 つの TCP 接続を使うことや、PASV モードによるファイアウォール越しの接続方式など、独自の構造があります。実務では Apache Commons Net の FTPClient を使いますが、プロトコルの仕組みを理解しておくとトラブルシューティングで「どこで止まっているのか」を切り分けやすくなります。この記事では、FTP コマンドの基本（USER/PASS/PASV/STOR/RETR）を TCP ソケットレベルで確認し、応答コードの意味と PASV モードのポート計算を実装します。",
  useCases: [
    "FTP サーバーとの接続でタイムアウトやエラーが発生した際に、コマンドレベルで原因を切り分ける",
    "社内システムのファイル連携で FTP を使っている案件で、プロトコルの動作を理解して保守する",
    "FTP 経由のファイル配信バッチで、PASV モードの接続失敗を調査する",
  ],
  cautions: [
    "この記事のコードは FTP プロトコルの仕組み理解が目的。実務では Apache Commons Net の FTPClient を使うこと",
    "FTP の認証情報は平文で送信される。セキュリティが必要な場合は SFTP（SSH）または FTPS（FTP over TLS）を使うこと",
    "PASV モードのポート計算は「上位バイト * 256 + 下位バイト」。この計算を間違えるとデータチャネルの接続に失敗する",
    "アクティブモード（PORT コマンド）はクライアント側にサーバーからの接続を受け付けるポートが必要。NAT 環境では PASV モードを使う",
  ],
  relatedArticleSlugs: ["tcp-socket", "http-socket-raw", "smtp-socket", "mail-send"],
  versionCoverage: {
    java8: "FTP コマンドとレスポンスコードの説明は System.out.println の羅列で記述する。型宣言が冗長。",
    java17: "record で FTP コマンドを構造化し、switch 式で応答コードを分類できる。コードの見通しが改善される。",
    java21: "sealed interface で応答カテゴリ（成功/追加情報要求/一時エラー/永続エラー）を型安全に表現し、pattern matching switch で処理できる。",
    java8Code: `// Java 8: 応答コード分類は if-else チェーン
int code = 230;
String category;
if (code / 100 == 1) {
    category = "処理継続中";
} else if (code / 100 == 2) {
    category = "成功";
} else if (code / 100 == 3) {
    category = "追加情報要求";
} else if (code / 100 == 4) {
    category = "一時エラー";
} else {
    category = "永続エラー";
}`,
    java17Code: `// Java 17: record + switch 式で構造化
record FtpCommand(String name, String arg) {
    String toCommandLine() {
        return arg.isEmpty()
            ? name + "\\r\\n"
            : name + " " + arg + "\\r\\n";
    }
}
String category = switch (code / 100) {
    case 1 -> "処理継続中";
    case 2 -> "成功";
    case 3 -> "追加情報要求";
    case 4 -> "一時エラー";
    default -> "永続エラー";
};`,
    java21Code: `// Java 21: sealed interface で応答カテゴリ分類
sealed interface FtpResponseCategory
    permits Completion, Intermediate,
            TransientNeg, PermanentNeg {
    record Completion(int code, String msg)
        implements FtpResponseCategory {}
    record Intermediate(int code, String msg)
        implements FtpResponseCategory {}
    record TransientNeg(int code, String msg)
        implements FtpResponseCategory {}
    record PermanentNeg(int code, String msg)
        implements FtpResponseCategory {}
}
String desc = switch (category) {
    case Completion r -> "[2xx] " + r.msg();
    case Intermediate r -> "[3xx] " + r.msg();
    case TransientNeg r -> "[4xx] " + r.msg();
    case PermanentNeg r -> "[5xx] " + r.msg();
};`,
  },
  libraryComparison: [
    { name: "標準 API（Socket + 手動コマンド送信）", whenToUse: "FTP プロトコルの学習やトラブルシューティングの切り分けツール。", tradeoff: "PASV ポート計算、データチャネル接続、バイナリ転送の全てを自前で実装する必要がある。" },
    { name: "Apache Commons Net（FTPClient）", whenToUse: "実務での FTP ファイル転送。接続管理、PASV モード、バイナリ/テキスト転送を一括で扱える。", tradeoff: "外部依存が追加される。プロトコルの詳細は隠蔽される。" },
    { name: "JSch / Apache Mina SSHD", whenToUse: "SFTP（SSH ベースのファイル転送）が必要な場合。", tradeoff: "FTP とは別プロトコル。SSH の設定と鍵管理が必要になる。" },
  ],
  faq: [
    { question: "FTP と SFTP の違いは何ですか。", answer: "FTP は専用プロトコルで認証情報が平文で流れます。SFTP は SSH 上のファイル転送プロトコルで、通信が暗号化されます。セキュリティが必要な場合は SFTP を選んでください。" },
    { question: "PASV モードとアクティブモードの違いは何ですか。", answer: "アクティブモードはサーバーからクライアントに接続しますが、NAT やファイアウォール越しでは使えません。PASV モードはクライアントからサーバーに接続するため、NAT 環境でも動作します。" },
    { question: "PASV レスポンスのポート番号はどう計算しますか。", answer: "レスポンスの最後の 2 つの数値を使い、上位バイト * 256 + 下位バイト で計算します。例: (192,168,1,1,196,10) なら 196*256+10=50186 がデータポートです。" },
  ],
  codeTitle: "FTP コマンドの基本フローとPASVポート計算",
  codeSample: `import java.io.*;

public class FtpClientSample {

    record FtpCommand(String name, String arg) {
        FtpCommand(String name) { this(name, ""); }

        String toCommandLine() {
            if (arg.isEmpty()) return name + "\\r\\n";
            return name + " " + arg + "\\r\\n";
        }
    }

    static void showFtpProtocol() {
        System.out.println("=== FTP プロトコルの基本 ===");
        System.out.println("1. コマンドチャネル接続: Socket(ftpserver, 21)");
        System.out.println("   S: 220 FTP Service Ready");
        System.out.println("2. 認証:");
        System.out.println("   C: USER anonymous  /  S: 331 Password required");
        System.out.println("   C: PASS guest@...  /  S: 230 Login successful");
        System.out.println("3. PASV モード:");
        System.out.println("   C: PASV");
        System.out.println("   S: 227 Entering Passive Mode (127,0,0,1,196,10)");
        System.out.println("   -> データポート = 196*256+10 = 50186");
    }

    static int parsePasvPort(String pasvResponse) {
        var start = pasvResponse.indexOf('(');
        var end = pasvResponse.indexOf(')');
        if (start < 0 || end < 0) {
            throw new IllegalArgumentException(
                "PASV レスポンスの形式が不正: " + pasvResponse);
        }
        var parts = pasvResponse.substring(start + 1, end).split(",");
        int p1 = Integer.parseInt(parts[4].trim());
        int p2 = Integer.parseInt(parts[5].trim());
        return p1 * 256 + p2;
    }

    static String classifyResponseCode(int code) {
        return switch (code / 100) {
            case 1 -> "処理継続中（" + code + "）";
            case 2 -> "成功（" + code + "）";
            case 3 -> "追加情報要求（" + code + "）";
            case 4 -> "一時エラー（" + code + "）";
            case 5 -> "永続エラー（" + code + "）";
            default -> "不明（" + code + "）";
        };
    }

    public static void main(String[] args) {
        showFtpProtocol();

        var commands = new FtpCommand[]{
            new FtpCommand("USER", "anonymous"),
            new FtpCommand("PASS", "guest@example.com"),
            new FtpCommand("PASV"),
            new FtpCommand("TYPE", "I"),
            new FtpCommand("STOR", "test.txt"),
            new FtpCommand("RETR", "test.txt"),
            new FtpCommand("QUIT"),
        };
        System.out.println("\\n=== FTP コマンド ===");
        for (var cmd : commands) {
            System.out.println("  " + cmd.toCommandLine().trim());
        }

        var pasvResp = "227 Entering Passive Mode (192,168,1,1,196,10)";
        System.out.println("\\nPASV ポート: " + parsePasvPort(pasvResp));

        System.out.println("\\n=== 応答コード分類 ===");
        for (int code : new int[]{220, 230, 331, 530, 550}) {
            System.out.println(classifyResponseCode(code));
        }

        System.out.println("\\n実務では Apache Commons Net の FTPClient を使用してください");
    }
}`,
},
{
  slug: "http-socket-raw",
  title: "Java ソケットで HTTP リクエストを手作りしてプロトコルを理解する",
  categorySlug: "network",
  summary: "TCP ソケットで HTTP/1.1 リクエストを手動構築し、ステータス行・ヘッダー・ボディの構造を理解する。",
  version: "Java 17",
  tags: ["HTTP", "Socket", "プロトコル", "HTTP/1.1", "リクエスト手作り"],
  apiNames: ["Socket", "BufferedReader", "PrintWriter", "LinkedHashMap"],
  description: "Java の TCP ソケットで HTTP/1.1 リクエストを手動構築し、リクエスト行・ヘッダー・ボディの構造を外部ライブラリ不要で Java 8/17/21 対応で理解する。",
  lead: "HTTP はリクエスト行、ヘッダー、空行、ボディという単純なテキスト構造のプロトコルです。HttpClient や HttpURLConnection はこの構造を抽象化してくれますが、一度は生のソケットで HTTP リクエストを手作りしてみることで、「Host ヘッダーはなぜ必須か」「空行の CRLF がなぜ重要か」「Connection: close は何を意味するか」といった疑問が腹落ちします。この記事では、TCP ソケットを使って HTTP GET リクエストを手動で組み立て、サーバーからのレスポンスをステータス行・ヘッダー・ボディに分解して読み取ります。フレームワークの裏で何が起きているかを一度理解しておくと、通信トラブルの原因特定が格段に速くなります。",
  useCases: [
    "HTTP 通信のトラブルシューティングで、プロトコルレベルの動作を確認する",
    "新人研修や勉強会で、HTTP プロトコルの構造を手を動かして理解する",
    "プロキシやロードバランサーの動作検証で、生の HTTP リクエストを送信して応答を確認する",
  ],
  cautions: [
    "この記事のコードは HTTP プロトコルの仕組み理解が目的。実務では HttpClient または HttpURLConnection を使うこと",
    "HTTP/1.1 では Host ヘッダーが必須。省略するとサーバーが 400 Bad Request を返す場合がある",
    "Connection: close を指定しないと、サーバーがキープアライブで接続を保持し、読み取りがブロックする場合がある",
    "HTTPS（TLS）には対応していない。HTTPS サーバーへの接続には SSLSocket が必要",
  ],
  relatedArticleSlugs: ["http-client-basic", "httpurlconnection", "tcp-socket", "mail-send"],
  versionCoverage: {
    java8: "HTTP レスポンスは static inner class で表現する。ヘッダー解析の Map や BufferedReader の型宣言が冗長になる。",
    java17: "record でレスポンスを不変オブジェクトとして表現し、テキストブロックでリクエスト例を読みやすく記述できる。",
    java21: "sealed interface でステータスコードのカテゴリ（2xx/3xx/4xx/5xx）を型安全に分類し、pattern matching switch で処理できる。",
    java8Code: `// Java 8: 内部クラスで HTTP レスポンスを表現
static class HttpResponse {
    final int statusCode;
    final String statusMessage;
    final String body;
    HttpResponse(int code, String msg, String body) {
        this.statusCode = code;
        this.statusMessage = msg;
        this.body = body;
    }
}

String request = "GET " + path + " HTTP/1.1\\r\\n"
    + "Host: " + host + "\\r\\n"
    + "Connection: close\\r\\n"
    + "\\r\\n";`,
    java17Code: `// Java 17: record でレスポンスを表現
record HttpResponse(int statusCode,
    String statusMessage,
    Map<String, String> headers, String body) {
    String header(String name) {
        return headers.getOrDefault(
            name.toLowerCase(), "");
    }
}

String example = """
    GET /path HTTP/1.1
    Host: example.com
    Connection: close
    （空行）
    """;`,
    java21Code: `// Java 21: sealed interface でステータス分類
sealed interface HttpStatusCategory
    permits Success, Redirect, ClientError,
            ServerError, Unknown {
    record Success(int code)
        implements HttpStatusCategory {}
    record ClientError(int code)
        implements HttpStatusCategory {}
}
String info = switch (classify(code)) {
    case Success s -> "[2xx] 成功";
    case Redirect s -> "[3xx] リダイレクト";
    case ClientError s -> "[4xx] クライアントエラー";
    case ServerError s -> "[5xx] サーバーエラー";
    case Unknown s -> "[不明]";
};`,
  },
  libraryComparison: [
    { name: "標準 API（Socket + 手動リクエスト構築）", whenToUse: "HTTP プロトコルの学習や、プロキシ・ロードバランサーの動作検証。", tradeoff: "TLS、チャンク転送、リダイレクト追跡などは全て自前で実装する必要がある。実用には向かない。" },
    { name: "標準 HttpClient（Java 11+）", whenToUse: "実務での HTTP 通信。プロトコルの詳細を意識せずに使える。", tradeoff: "プロトコルの仕組みは隠蔽される。" },
    { name: "curl / telnet コマンド", whenToUse: "HTTP リクエストの手動テスト。Java コードを書かずに確認できる。", tradeoff: "Java コードへの組み込みはできない。" },
  ],
  faq: [
    { question: "HTTPS サーバーにもソケットで接続できますか。", answer: "SSLSocketFactory で SSLSocket を作成すれば TLS 接続が可能です。ただし証明書検証の設定が必要になるため、実務では HttpClient を使うのが安全です。" },
    { question: "HTTP/2 にもソケットで対応できますか。", answer: "HTTP/2 はバイナリプロトコルのため、テキストベースの手作りリクエストでは対応できません。HttpClient は HTTP/2 をサポートしています。" },
    { question: "レスポンスボディが途中で切れる場合はどうすればよいですか。", answer: "Transfer-Encoding: chunked の場合、チャンクサイズの解析が必要です。Connection: close であればソケットが閉じるまで読めば全データを取得できます。" },
  ],
  codeTitle: "TCP ソケットで HTTP GET リクエストを手動送信する",
  codeSample: `import java.io.*;

public class HttpSocketSample {

    record HttpResponse(int statusCode, String statusMessage,
                        Map<String, String> headers, String body) {
        String header(String name) {
            return headers.getOrDefault(name.toLowerCase(), "");
        }
    }

    static HttpResponse sendGet(String host, int port, String path)
            throws IOException {
        try (var socket = new Socket(host, port)) {
            var request = "GET " + path + " HTTP/1.1\\r\\n"
                    + "Host: " + host + "\\r\\n"
                    + "User-Agent: JavaSocketClient/1.0\\r\\n"
                    + "Connection: close\\r\\n"
                    + "\\r\\n";

            var writer = new PrintWriter(
                new OutputStreamWriter(socket.getOutputStream()), true);
            writer.print(request);
            writer.flush();

            var reader = new BufferedReader(
                new InputStreamReader(socket.getInputStream()));

            var statusLine = reader.readLine();
            int statusCode = 0;
            String statusMessage = "";
            if (statusLine != null && statusLine.startsWith("HTTP/")) {
                var parts = statusLine.split(" ", 3);
                if (parts.length >= 2) {
                    statusCode = Integer.parseInt(parts[1]);
                    statusMessage = parts.length > 2 ? parts[2] : "";
                }
            }

            var headers = new LinkedHashMap<String, String>();
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                int colon = line.indexOf(':');
                if (colon > 0) {
                    headers.put(
                        line.substring(0, colon).trim().toLowerCase(),
                        line.substring(colon + 1).trim());
                }
            }

            var body = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                body.append(line).append("\\n");
            }

            return new HttpResponse(statusCode, statusMessage,
                headers, body.toString());
        }
    }

    public static void main(String[] args) {
        try {
            var response = sendGet("example.com", 80, "/");
            System.out.println("ステータス: " + response.statusCode()
                + " " + response.statusMessage());
            System.out.println("Content-Type: "
                + response.header("content-type"));
            int len = Math.min(response.body().length(), 200);
            System.out.println("ボディ（先頭 " + len + " 文字）: "
                + response.body().substring(0, len));
        } catch (IOException e) {
            System.out.println("接続エラー: " + e.getMessage());
        }

        System.out.println("\\n注意: 実務では HttpClient を使用してください");
    }
}`,
},
]
