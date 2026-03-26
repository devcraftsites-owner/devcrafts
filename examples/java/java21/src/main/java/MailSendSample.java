import java.util.Properties;
// Jakarta Mail を使用する場合のインポート（依存追加が必要）
// import jakarta.mail.*;
// import jakarta.mail.internet.*;

public class MailSendSample {

    // Java 21: record で MailMessage・SmtpConfig を定義、switch 式でメール種別を処理

    // SMTP 設定を record で表現（Java 16+）
    record SmtpConfig(String host, int port, String username, String password, boolean useTls) {}

    // メールの種別を表す sealed interface（Java 17+）
    sealed interface MailMessage permits MailMessage.TextMail, MailMessage.HtmlMail {
        record TextMail(String from, String to, String subject, String body) implements MailMessage {}
        record HtmlMail(String from, String to, String subject, String htmlBody) implements MailMessage {}
    }

    /*
     * メール種別に応じた送信処理（pattern matching switch）
     */
    static void sendMail(SmtpConfig config, MailMessage mail) {
        // Java 21: pattern matching switch でメール種別を型安全に処理
        String description = switch (mail) {
            case MailMessage.TextMail m  -> "テキストメール → " + m.to() + " 件名: " + m.subject();
            case MailMessage.HtmlMail m  -> "HTML メール → " + m.to() + " 件名: " + m.subject();
        };
        System.out.println("送信: " + description);

        /*
        // 実際の Jakarta Mail 送信処理
        var props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", String.valueOf(config.useTls()));
        props.put("mail.smtp.host", config.host());
        props.put("mail.smtp.port", String.valueOf(config.port()));

        var session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(config.username(), config.password());
            }
        });

        try {
            var message = new MimeMessage(session);
            switch (mail) {
                case MailMessage.TextMail m -> {
                    message.setFrom(new InternetAddress(m.from()));
                    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(m.to()));
                    message.setSubject(m.subject(), "UTF-8");
                    message.setText(m.body(), "UTF-8");
                }
                case MailMessage.HtmlMail m -> {
                    message.setFrom(new InternetAddress(m.from()));
                    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(m.to()));
                    message.setSubject(m.subject(), "UTF-8");
                    var htmlPart = new MimeBodyPart();
                    htmlPart.setContent(m.htmlBody(), "text/html; charset=UTF-8");
                    var multipart = new MimeMultipart();
                    multipart.addBodyPart(htmlPart);
                    message.setContent(multipart);
                }
            }
            Transport.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("メール送信失敗", e);
        }
        */
    }

    public static void main(String[] args) {
        var config = new SmtpConfig(
            "smtp.gmail.com", 587,
            "your-email@gmail.com", "your-app-password",
            true
        );

        System.out.println("=== Jakarta Mail サンプル（Java 21） ===");

        // テキストメール
        sendMail(config, new MailMessage.TextMail(
            "from@example.com", "to@example.com",
            "テスト件名", "テスト本文です。"
        ));

        // HTML メール
        sendMail(config, new MailMessage.HtmlMail(
            "from@example.com", "to@example.com",
            "HTML テスト",
            "<h1>こんにちは</h1><p>HTML メールです。</p>"
        ));
    }
}
