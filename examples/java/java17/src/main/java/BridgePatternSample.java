public class BridgePatternSample {

    // 実装インターフェース（Implementor）: メッセージ送信手段
    interface MessageSender {
        void send(String to, String subject, String body);
    }

    // Java 17+: sealed interface で送信手段を型安全に限定
    sealed interface SenderType permits SenderType.Email, SenderType.Sms {
        record Email(String smtpHost) implements SenderType {}
        record Sms(String gateway) implements SenderType {}
    }

    // 具体実装1: メール送信（record で実装を簡潔に）
    record EmailSender(String smtpHost) implements MessageSender {
        @Override
        public void send(String to, String subject, String body) {
            System.out.println("[メール送信] SMTP: " + smtpHost);
            System.out.println("  宛先: " + to);
            System.out.println("  件名: " + subject);
            System.out.println("  本文: " + body);
        }
    }

    // 具体実装2: SMS 送信（record で実装を簡潔に）
    record SmsSender(String gateway) implements MessageSender {
        @Override
        public void send(String to, String subject, String body) {
            System.out.println("[SMS 送信] ゲートウェイ: " + gateway);
            System.out.println("  宛先: " + to);
            System.out.println("  内容: " + body);
        }
    }

    // 抽象クラス（Abstraction）: 通知の種類
    static abstract class Notification {
        protected final MessageSender sender; // ブリッジ

        Notification(MessageSender sender) {
            this.sender = sender;
        }

        abstract void notify(String recipient, String message);
    }

    // 具体抽象1: 緊急通知
    static class UrgentNotification extends Notification {
        UrgentNotification(MessageSender sender) {
            super(sender);
        }

        @Override
        void notify(String recipient, String message) {
            sender.send(recipient, "【緊急】" + message, "至急確認してください: " + message);
        }
    }

    // 具体抽象2: 定期レポート通知
    static class ReportNotification extends Notification {
        ReportNotification(MessageSender sender) {
            super(sender);
        }

        @Override
        void notify(String recipient, String message) {
            sender.send(recipient, "定期レポート", "本日のレポートをお届けします:\n" + message);
        }
    }

    public static void main(String[] args) {
        // Java 17+: var でローカル変数を簡潔に
        var urgentEmail = new UrgentNotification(new EmailSender("smtp.example.com"));
        urgentEmail.notify("admin@example.com", "サーバー障害");

        System.out.println();

        var urgentSms = new UrgentNotification(new SmsSender("sms-gw.example.com"));
        urgentSms.notify("090-1234-5678", "サーバー障害");

        System.out.println();

        var reportEmail = new ReportNotification(new EmailSender("smtp.example.com"));
        reportEmail.notify("manager@example.com", "売上: ¥1,000,000 / アクセス: 500件");
    }
}
