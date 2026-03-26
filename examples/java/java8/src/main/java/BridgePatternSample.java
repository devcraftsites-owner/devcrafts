public class BridgePatternSample {

    // 実装インターフェース（Implementor）: メッセージ送信手段
    interface MessageSender {
        void send(String to, String subject, String body);
    }

    // 具体実装1: メール送信
    static class EmailSender implements MessageSender {
        @Override
        public void send(String to, String subject, String body) {
            System.out.println("[メール送信]");
            System.out.println("  宛先: " + to);
            System.out.println("  件名: " + subject);
            System.out.println("  本文: " + body);
        }
    }

    // 具体実装2: SMS 送信
    static class SmsSender implements MessageSender {
        @Override
        public void send(String to, String subject, String body) {
            System.out.println("[SMS 送信]");
            System.out.println("  宛先: " + to);
            // SMS は件名なし・本文のみ
            System.out.println("  内容: " + body);
        }
    }

    // 抽象クラス（Abstraction）: 通知の種類
    static abstract class Notification {
        protected MessageSender sender; // 実装への参照（ブリッジ）

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
        // 緊急通知 × メール
        Notification urgentEmail = new UrgentNotification(new EmailSender());
        urgentEmail.notify("admin@example.com", "サーバー障害");

        System.out.println();

        // 緊急通知 × SMS（送信手段だけ差し替え）
        Notification urgentSms = new UrgentNotification(new SmsSender());
        urgentSms.notify("090-1234-5678", "サーバー障害");

        System.out.println();

        // 定期レポート × メール（通知種類だけ差し替え）
        Notification reportEmail = new ReportNotification(new EmailSender());
        reportEmail.notify("manager@example.com", "売上: ¥1,000,000 / アクセス: 500件");
    }
}
