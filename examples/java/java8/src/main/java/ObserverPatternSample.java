import java.util.ArrayList;
import java.util.List;

/**
 * DP-19: Observer パターン
 *
 * 状態変化（イベント）を複数のオブザーバーに通知するパターンです。
 * イベント発行者（Publisher）とリスナーが疎結合になります。
 *
 * 注意: java.util.Observer / java.util.Observable は Java 9 以降で非推奨です。
 *       java.beans.PropertyChangeListener の使用が推奨されています。
 */
public class ObserverPatternSample {

    // ---- オブザーバーのインターフェース ----
    interface EventListener {
        /** イベントが発生したときに呼び出されるメソッド */
        void onEvent(String eventType, Object data);
    }

    // ---- イベント発行者（Publisher / Subject）----
    static class EventPublisher {
        private final List<EventListener> listeners = new ArrayList<EventListener>();

        /** オブザーバーを登録する */
        public void subscribe(EventListener listener) {
            listeners.add(listener);
            System.out.println("[Publisher] リスナーを登録: " + listener.getClass().getSimpleName());
        }

        /** オブザーバーの登録を解除する */
        public void unsubscribe(EventListener listener) {
            listeners.remove(listener);
            System.out.println("[Publisher] リスナーを解除: " + listener.getClass().getSimpleName());
        }

        /**
         * 登録済みの全オブザーバーにイベントを通知する（Push型）。
         * Push型では Publisher がデータを全て送る。
         */
        public void publish(String eventType, Object data) {
            System.out.println("[Publisher] イベント発行: type=" + eventType + ", data=" + data);
            for (EventListener listener : listeners) {
                listener.onEvent(eventType, data);
            }
        }
    }

    // ---- オブザーバー1: ログ出力リスナー ----
    static class LogListener implements EventListener {
        @Override
        public void onEvent(String eventType, Object data) {
            System.out.println("[LogListener] ログ記録: [" + eventType + "] " + data);
        }
    }

    // ---- オブザーバー2: メール通知リスナー ----
    static class EmailNotificationListener implements EventListener {
        @Override
        public void onEvent(String eventType, Object data) {
            // 「USER_REGISTERED」イベントのときだけメールを送信する
            if ("USER_REGISTERED".equals(eventType)) {
                System.out.println("[EmailListener] ウェルカムメールを送信: " + data);
            } else {
                System.out.println("[EmailListener] このイベントはメール対象外: " + eventType);
            }
        }
    }

    // ---- オブザーバー3: 監査ログリスナー ----
    static class AuditListener implements EventListener {
        private int eventCount = 0;

        @Override
        public void onEvent(String eventType, Object data) {
            eventCount++;
            System.out.println("[AuditListener] 監査ログ #" + eventCount
                    + ": type=" + eventType + ", data=" + data);
        }

        public int getEventCount() {
            return eventCount;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Observer パターン: イベント通知システム ===");

        EventPublisher publisher = new EventPublisher();

        // オブザーバーを登録する
        System.out.println("\n--- リスナーの登録 ---");
        LogListener logListener = new LogListener();
        EmailNotificationListener emailListener = new EmailNotificationListener();
        AuditListener auditListener = new AuditListener();

        publisher.subscribe(logListener);
        publisher.subscribe(emailListener);
        publisher.subscribe(auditListener);

        // ユーザー登録イベントを発行する（3つのリスナー全員が通知を受ける）
        System.out.println("\n--- ユーザー登録イベントを発行 ---");
        publisher.publish("USER_REGISTERED", "userId=user_001, name=山田太郎");

        // 注文イベントを発行する
        System.out.println("\n--- 注文イベントを発行 ---");
        publisher.publish("ORDER_PLACED", "orderId=ord_100, amount=5000");

        // オブザーバーの登録解除
        System.out.println("\n--- EmailListener を解除して再度イベント発行 ---");
        publisher.unsubscribe(emailListener);
        publisher.publish("USER_REGISTERED", "userId=user_002, name=鈴木花子");

        System.out.println("\n--- 監査ログの集計 ---");
        System.out.println("受け取ったイベント数: " + auditListener.getEventCount());
    }
}
