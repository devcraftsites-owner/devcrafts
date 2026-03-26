import java.util.Properties;
// Jakarta Mail を使用する場合のインポート（依存追加が必要）
// import jakarta.mail.*;
// import jakarta.mail.internet.*;

public class MailSendSample {

    // Jakarta Mail を使ったメール送信のサンプルコード
    // 実際に動かすには pom.xml に Jakarta Mail 依存を追加すること
    //
    // pom.xml に以下を追加:
    // <dependency>
    //     <groupId>com.sun.mail</groupId>
    //     <artifactId>jakarta.mail</artifactId>
    //     <version>2.0.1</version>
    // </dependency>

    /*
     * テキストメール送信の基本パターン
     */
    static void sendTextMail(String smtpHost, int smtpPort,
                              String username, String password,
                              String from, String to,
                              String subject, String body) {
        /*
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", smtpHost);
        props.put("mail.smtp.port", String.valueOf(smtpPort));

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            // 日本語の件名には文字コード指定が必要
            message.setSubject(subject, "UTF-8");
            message.setText(body, "UTF-8");
            Transport.send(message);
            System.out.println("メール送信成功: " + to);
        } catch (MessagingException e) {
            throw new RuntimeException("メール送信失敗", e);
        }
        */
        // デモ: 実際には Jakarta Mail を使って送信する
        System.out.println("（Jakarta Mail 依存を追加すると実際に送信できます）");
        System.out.println("送信先: " + to);
        System.out.println("件名: " + subject);
        System.out.println("本文: " + body);
    }

    // SMTP 設定の説明（よく使う設定値）
    static void printSmtpSettings() {
        System.out.println("=== よく使う SMTP 設定 ===");
        System.out.println("Gmail:    smtp.gmail.com:587 (STARTTLS)");
        System.out.println("Gmail:    smtp.gmail.com:465 (SSL/TLS)");
        System.out.println("Mailtrap: sandbox.smtp.mailtrap.io:2525 (開発・テスト用)");
        System.out.println("社内メール: 環境依存（IT 部門に確認）");
    }

    public static void main(String[] args) {
        printSmtpSettings();

        System.out.println();
        System.out.println("=== メール送信サンプル（Jakarta Mail） ===");
        sendTextMail(
            "smtp.gmail.com", 587,
            "your-email@gmail.com", "your-app-password",
            "from@example.com", "to@example.com",
            "テスト件名", "テスト本文です。"
        );
    }
}
