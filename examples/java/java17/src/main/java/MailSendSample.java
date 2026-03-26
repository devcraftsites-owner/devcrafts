import java.util.Properties;
// Jakarta Mail を使用する場合のインポート（依存追加が必要）
// import jakarta.mail.*;
// import jakarta.mail.internet.*;

public class MailSendSample {

    // Java 17: var によるローカル変数型推論、テキストブロックで HTML 本文を表現

    // SMTP 接続設定を管理するクラス
    static class SmtpConfig {
        final String host;
        final int port;
        final String username;
        final String password;
        final boolean useTls;

        SmtpConfig(String host, int port, String username, String password, boolean useTls) {
            this.host = host;
            this.port = port;
            this.username = username;
            this.password = password;
            this.useTls = useTls;
        }
    }

    /*
     * テキストメール送信（Jakarta Mail 使用時）
     */
    static void sendTextMail(SmtpConfig config, String from, String to,
                              String subject, String body) {
        /*
        var props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", String.valueOf(config.useTls));
        props.put("mail.smtp.host", config.host);
        props.put("mail.smtp.port", String.valueOf(config.port));

        var session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(config.username, config.password);
            }
        });

        try {
            var message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject, "UTF-8");
            message.setText(body, "UTF-8");
            Transport.send(message);
            System.out.println("テキストメール送信成功: " + to);
        } catch (MessagingException e) {
            throw new RuntimeException("メール送信失敗", e);
        }
        */
        System.out.println("【テキストメール送信デモ】");
        System.out.println("送信先: " + to);
        System.out.println("件名: " + subject);
        System.out.println("本文: " + body);
    }

    /*
     * HTML メール送信（テキストブロックで HTML 本文を記述）
     */
    static void sendHtmlMail(SmtpConfig config, String from, String to, String subject) {
        // Java 15+ のテキストブロックで HTML を読みやすく記述できる
        String htmlBody = """
                <!DOCTYPE html>
                <html>
                <body>
                  <h1 style="color: #2563eb;">お知らせ</h1>
                  <p>Jakarta Mail を使った <strong>HTML メール</strong>のサンプルです。</p>
                  <p>テキストブロック（Java 15+）で HTML を読みやすく書けます。</p>
                </body>
                </html>
                """;

        /*
        // HTML メール送信（MimeBodyPart を使用）
        var session = createSession(config);
        try {
            var message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject, "UTF-8");

            var htmlPart = new MimeBodyPart();
            htmlPart.setContent(htmlBody, "text/html; charset=UTF-8");

            var multipart = new MimeMultipart();
            multipart.addBodyPart(htmlPart);
            message.setContent(multipart);

            Transport.send(message);
            System.out.println("HTML メール送信成功: " + to);
        } catch (MessagingException e) {
            throw new RuntimeException("HTML メール送信失敗", e);
        }
        */
        System.out.println("【HTML メール送信デモ】");
        System.out.println("送信先: " + to);
        System.out.println("件名: " + subject);
        System.out.println("HTML 本文（先頭100文字）: " + htmlBody.substring(0, Math.min(htmlBody.length(), 100)));
    }

    public static void main(String[] args) {
        var config = new SmtpConfig(
            "smtp.gmail.com", 587,
            "your-email@gmail.com", "your-app-password",
            true
        );

        System.out.println("=== Jakarta Mail サンプル（Java 17） ===");
        sendTextMail(config, "from@example.com", "to@example.com", "テスト件名", "テスト本文");
        System.out.println();
        sendHtmlMail(config, "from@example.com", "to@example.com", "HTML メールテスト");
    }
}
