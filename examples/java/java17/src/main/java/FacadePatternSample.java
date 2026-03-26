import java.util.HashMap;
import java.util.Map;

/**
 * DP-10: Facade パターン（Java 17+）
 *
 * Java 17 では var によるローカル変数型推論と
 * EmailConfig record でコードをより簡潔に記述できます。
 */
public class FacadePatternSample {

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

        public String loadTemplate(String name) {
            if ("welcome".equals(name)) {
                return "こんにちは、{{userName}} さん！\nご登録ありがとうございます。";
            }
            return "テンプレートが見つかりません: " + name;
        }

        public String render(String template, Map<String, String> vars) {
            // var でローカル変数の型宣言を省略する（Java 17+）
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

    // ---- Facade: EmailConfig record を受け取るコンストラクタ ----
    static class EmailFacade {
        private final SmtpClient smtpClient;
        private final TemplateEngine templateEngine;
        private final AuditLogger auditLogger;
        private final EmailConfig config; // record で設定をまとめて保持する

        public EmailFacade(EmailConfig config) {
            this.smtpClient = new SmtpClient();
            this.templateEngine = new TemplateEngine();
            this.auditLogger = new AuditLogger();
            this.config = config;
        }

        /** ウェルカムメールを送信する */
        public void sendWelcomeEmail(String to, String userName) {
            try {
                // var で型宣言を省略する
                var template = templateEngine.loadTemplate("welcome");
                var vars = new HashMap<String, String>();
                vars.put("userName", userName);
                var body = templateEngine.render(template, vars);

                smtpClient.connect(config.host()); // record のアクセサメソッドで値を取得する
                smtpClient.authenticate(config.user(), config.password());

                var subject = "ご登録ありがとうございます";
                smtpClient.send(to, subject, body);
                smtpClient.disconnect();
                auditLogger.logSend(to, subject);

            } catch (Exception e) {
                auditLogger.logError("ウェルカムメール送信失敗: " + e.getMessage());
                throw e;
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Facade パターン: メール送信システム（Java 17）===");

        // record で設定をシンプルに生成する
        var config = new EmailConfig("smtp.example.com", "user@example.com", "password");
        var facade = new EmailFacade(config);

        System.out.println("\n--- EmailConfig record の内容 ---");
        System.out.println("host: " + config.host());
        System.out.println("user: " + config.user());
        // toString() も自動生成される
        System.out.println("config.toString(): " + config);

        System.out.println("\n--- Facade 経由でメール送信 ---");
        facade.sendWelcomeEmail("yamada@example.com", "山田");
    }
}
