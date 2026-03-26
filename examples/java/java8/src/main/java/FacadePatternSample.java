import java.util.HashMap;
import java.util.Map;

/**
 * DP-10: Facade パターン
 *
 * 複雑なサブシステム（認証・テンプレート・SMTP・ログ）を隠蔽し、
 * シンプルな窓口（EmailFacade）を提供するパターンのサンプルです。
 */
public class FacadePatternSample {

    // ---- サブシステム1: SMTP クライアント ----
    static class SmtpClient {
        private String connectedHost;

        /** SMTP サーバーに接続する */
        public void connect(String host) {
            this.connectedHost = host;
            System.out.println("[SMTP] " + host + " に接続しました");
        }

        /** 認証を行う */
        public void authenticate(String user, String password) {
            System.out.println("[SMTP] ユーザー " + user + " で認証しました");
        }

        /** メールを送信する */
        public void send(String to, String subject, String body) {
            System.out.println("[SMTP] 送信先: " + to);
            System.out.println("[SMTP] 件名: " + subject);
            System.out.println("[SMTP] 本文: " + body);
            System.out.println("[SMTP] 送信完了");
        }

        /** 接続を切断する */
        public void disconnect() {
            System.out.println("[SMTP] " + connectedHost + " から切断しました");
        }
    }

    // ---- サブシステム2: テンプレートエンジン ----
    static class TemplateEngine {

        /** テンプレートを読み込む（実際には外部ファイルを読む想定） */
        public String loadTemplate(String name) {
            if ("welcome".equals(name)) {
                return "こんにちは、{{userName}} さん！\nご登録ありがとうございます。";
            }
            return "テンプレートが見つかりません: " + name;
        }

        /** テンプレート内のプレースホルダーを変数で置換する */
        public String render(String template, Map<String, String> vars) {
            String result = template;
            for (Map.Entry<String, String> entry : vars.entrySet()) {
                result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
            }
            return result;
        }
    }

    // ---- サブシステム3: 監査ログ ----
    static class AuditLogger {

        /** メール送信の監査ログを記録する */
        public void logSend(String to, String subject) {
            System.out.println("[AUDIT] メール送信: to=" + to + ", subject=" + subject);
        }

        /** エラーログを記録する */
        public void logError(String message) {
            System.out.println("[AUDIT] エラー: " + message);
        }
    }

    // ---- Facade: 複雑なサブシステムをシンプルな窓口で隠蔽する ----
    static class EmailFacade {
        private final SmtpClient smtpClient;
        private final TemplateEngine templateEngine;
        private final AuditLogger auditLogger;

        private final String smtpHost;
        private final String smtpUser;
        private final String smtpPassword;

        public EmailFacade(String smtpHost, String smtpUser, String smtpPassword) {
            this.smtpClient = new SmtpClient();
            this.templateEngine = new TemplateEngine();
            this.auditLogger = new AuditLogger();
            this.smtpHost = smtpHost;
            this.smtpUser = smtpUser;
            this.smtpPassword = smtpPassword;
        }

        /**
         * ウェルカムメールを送信する。
         * 呼び出し側はこのメソッドだけ呼べば良く、内部の複雑な処理を意識しなくて済む。
         */
        public void sendWelcomeEmail(String to, String userName) {
            try {
                // 1. テンプレートを読み込んでレンダリングする
                String template = templateEngine.loadTemplate("welcome");
                Map<String, String> vars = new HashMap<String, String>();
                vars.put("userName", userName);
                String body = templateEngine.render(template, vars);

                // 2. SMTP に接続して認証する
                smtpClient.connect(smtpHost);
                smtpClient.authenticate(smtpUser, smtpPassword);

                // 3. メールを送信する
                String subject = "ご登録ありがとうございます";
                smtpClient.send(to, subject, body);

                // 4. 接続を切断する
                smtpClient.disconnect();

                // 5. 監査ログを記録する
                auditLogger.logSend(to, subject);

            } catch (Exception e) {
                auditLogger.logError("ウェルカムメール送信失敗: " + e.getMessage());
                throw e;
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Facade パターン: メール送信システム ===");

        System.out.println("\n--- Facade なし: 呼び出し側が全サブシステムを直接操作する ---");
        SmtpClient smtp = new SmtpClient();
        TemplateEngine engine = new TemplateEngine();
        AuditLogger logger = new AuditLogger();

        // 呼び出し側が手順を全て知る必要がある（複雑！）
        String template = engine.loadTemplate("welcome");
        Map<String, String> vars = new HashMap<String, String>();
        vars.put("userName", "田中");
        String body = engine.render(template, vars);
        smtp.connect("smtp.example.com");
        smtp.authenticate("user@example.com", "password");
        smtp.send("tanaka@example.com", "ご登録ありがとうございます", body);
        smtp.disconnect();
        logger.logSend("tanaka@example.com", "ご登録ありがとうございます");

        System.out.println("\n--- Facade あり: EmailFacade.sendWelcomeEmail() の1行で完結 ---");
        EmailFacade facade = new EmailFacade(
                "smtp.example.com", "user@example.com", "password");
        // 呼び出し側はこれだけ！複雑な手順を知らなくて良い
        facade.sendWelcomeEmail("yamada@example.com", "山田");
    }
}
