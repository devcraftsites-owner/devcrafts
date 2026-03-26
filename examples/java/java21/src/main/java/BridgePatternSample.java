public class BridgePatternSample {

    // 実装インターフェース（Implementor）: メッセージ送信手段
    interface MessageSender {
        void send(String to, String subject, String body);
        String senderType(); // 送信手段の名前を返す
    }

    // 具体実装1: メール送信
    record EmailSender(String smtpHost) implements MessageSender {
        @Override
        public void send(String to, String subject, String body) {
            System.out.println("[メール送信] SMTP: " + smtpHost);
            System.out.println("  宛先: " + to);
            System.out.println("  件名: " + subject);
            System.out.println("  本文: " + body);
        }

        @Override
        public String senderType() {
            return "Email";
        }
    }

    // 具体実装2: SMS 送信
    record SmsSender(String gateway) implements MessageSender {
        @Override
        public void send(String to, String subject, String body) {
            System.out.println("[SMS 送信] ゲートウェイ: " + gateway);
            System.out.println("  宛先: " + to);
            System.out.println("  内容: " + body);
        }

        @Override
        public String senderType() {
            return "SMS";
        }
    }

    // Java 21+: sealed interface で通知種別を型安全に限定
    sealed interface NotificationType
            permits NotificationType.Urgent, NotificationType.Report {
        record Urgent(String message) implements NotificationType {}
        record Report(String summary) implements NotificationType {}
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

    // Java 21+: switch パターンマッチングで通知種別と送信先を処理
    static void dispatch(NotificationType type, MessageSender sender, String recipient) {
        switch (type) {
            case NotificationType.Urgent(var msg) -> {
                Notification n = new UrgentNotification(sender);
                n.notify(recipient, msg);
            }
            case NotificationType.Report(var summary) -> {
                Notification n = new ReportNotification(sender);
                n.notify(recipient, summary);
            }
        }
    }

    public static void main(String[] args) {
        var emailSender = new EmailSender("smtp.example.com");
        var smsSender = new SmsSender("sms-gw.example.com");

        // switch パターンマッチングで通知種別を処理
        dispatch(new NotificationType.Urgent("サーバー障害"), emailSender, "admin@example.com");
        System.out.println();

        dispatch(new NotificationType.Urgent("サーバー障害"), smsSender, "090-1234-5678");
        System.out.println();

        dispatch(new NotificationType.Report("売上: ¥1,000,000 / アクセス: 500件"),
                 emailSender, "manager@example.com");
    }
}
