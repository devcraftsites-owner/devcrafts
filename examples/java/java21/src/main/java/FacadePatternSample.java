import java.util.HashMap;
import java.util.Map;

/**
 * DP-10: Facade パターン（Java 21+）
 *
 * Java 21 では sealed interface + switch パターンマッチングを使い、
 * 送信するメールの種類を型安全に表現できます。
 */
public class FacadePatternSample {

    // ---- Java 21: sealed interface でメールリクエストの種類を型安全に表現する ----
    sealed interface EmailRequest
            permits EmailRequest.Welcome, EmailRequest.Password, EmailRequest.Notification {

        /** ウェルカムメール: 新規登録ユーザーへ送る */
        record Welcome(String to, String userName) implements EmailRequest {}

        /** パスワードリセットメール */
        record Password(String to, String resetToken) implements EmailRequest {}

        /** お知らせメール */
        record Notification(String to, String message) implements EmailRequest {}
    }

    // ---- Java 17: record で設定値をまとめる ----
    record EmailConfig(String host, String user, String password) {}

    // ---- サブシステム1: SMTP クライアント ----
    static class SmtpClient {
        private String connectedHost;

        public void connect(String host) {
            this.connectedHost = host;
            System.out.println("[SMTP] " + host + " に接続しました");
        }

        public void authenticate(String user, String password) {
            System.out.println("[SMTP] ユーザー " + user + " で認証しました");
        }

        public void send(String to, String subject, String body) {
            System.out.println("[SMTP] 送信先: " + to);
            System.out.println("[SMTP] 件名: " + subject);
            System.out.println("[SMTP] 本文: " + body);
            System.out.println("[SMTP] 送信完了");
        }

        public void disconnect() {
            System.out.println("[SMTP] " + connectedHost + " から切断しました");
        }
    }

    // ---- サブシステム2: テンプレートエンジン ----
    static class TemplateEngine {

        public String render(String template, Map<String, String> vars) {
            var result = template;
            for (var entry : vars.entrySet()) {
                result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
            }
            return result;
        }
    }

    // ---- サブシステム3: 監査ログ ----
    static class AuditLogger {

        public void logSend(String to, String subject) {
            System.out.println("[AUDIT] メール送信: to=" + to + ", subject=" + subject);
        }

        public void logError(String message) {
            System.out.println("[AUDIT] エラー: " + message);
        }
    }

    // ---- Facade: EmailRequest の種類に応じて処理を切り替える ----
    static class EmailFacade {
        private final SmtpClient smtpClient;
        private final TemplateEngine templateEngine;
        private final AuditLogger auditLogger;
        private final EmailConfig config;

        public EmailFacade(EmailConfig config) {
            this.smtpClient = new SmtpClient();
            this.templateEngine = new TemplateEngine();
            this.auditLogger = new AuditLogger();
            this.config = config;
        }

        /**
         * メールリクエストの種類に応じてメールを送信する。
         * switch パターンマッチングで EmailRequest のサブタイプを処理する（Java 21+）
         */
        public void send(EmailRequest request) {
            // switch パターンマッチングで種類ごとに件名と本文を決定する
            String to;
            String subject;
            String body;

            // record deconstruction で各フィールドを直接取り出す（Java 21+）
            switch (request) {
                case EmailRequest.Welcome(var toAddr, var userName) -> {
                    to = toAddr;
                    subject = "ご登録ありがとうございます";
                    var vars = new HashMap<String, String>();
                    vars.put("userName", userName);
                    body = templateEngine.render(
                            "こんにちは、{{userName}} さん！\nご登録ありがとうございます。", vars);
                }
                case EmailRequest.Password(var toAddr, var token) -> {
                    to = toAddr;
                    subject = "パスワードリセットのご案内";
                    body = "リセットトークン: " + token + "\n有効期限は30分です。";
                }
                case EmailRequest.Notification(var toAddr, var message) -> {
                    to = toAddr;
                    subject = "お知らせ";
                    body = message;
                }
            }

            try {
                smtpClient.connect(config.host());
                smtpClient.authenticate(config.user(), config.password());
                smtpClient.send(to, subject, body);
                smtpClient.disconnect();
                auditLogger.logSend(to, subject);
            } catch (Exception e) {
                auditLogger.logError("メール送信失敗: " + e.getMessage());
                throw e;
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Facade パターン: メール送信システム（Java 21）===");

        var config = new EmailConfig("smtp.example.com", "user@example.com", "password");
        var facade = new EmailFacade(config);

        System.out.println("\n--- ウェルカムメールを送信 ---");
        facade.send(new EmailRequest.Welcome("yamada@example.com", "山田"));

        System.out.println("\n--- パスワードリセットメールを送信 ---");
        facade.send(new EmailRequest.Password("tanaka@example.com", "TOKEN-ABC-123"));

        System.out.println("\n--- お知らせメールを送信 ---");
        facade.send(new EmailRequest.Notification("all@example.com", "システムメンテナンスのお知らせです。"));
    }
}
