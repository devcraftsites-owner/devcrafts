import java.util.ArrayList;
import java.util.List;

/**
 * DP-19: Observer パターン（Java 17+）
 *
 * Java 17 では Event record でイベントデータをシンプルに表現できます。
 */
public class ObserverPatternSample {

    // ---- Java 17: record でイベントを表現する ----
    record Event(String type, Object data) {
        @Override
        public String toString() {
            return "Event{type='" + type + "', data=" + data + "}";
        }
    }

    // ---- オブザーバーのインターフェース ----
    interface EventListener {
        /** イベントが発生したときに呼び出されるメソッド */
        void onEvent(Event event);
    }

    // ---- イベント発行者 ----
    static class EventPublisher {
        private final List<EventListener> listeners = new ArrayList<>();

        public void subscribe(EventListener listener) {
            listeners.add(listener);
            System.out.println("[Publisher] リスナーを登録: " + listener.getClass().getSimpleName());
        }

        public void unsubscribe(EventListener listener) {
            listeners.remove(listener);
            System.out.println("[Publisher] リスナーを解除: " + listener.getClass().getSimpleName());
        }

        /** Event record を使って全オブザーバーに通知する */
        public void publish(Event event) {
            System.out.println("[Publisher] イベント発行: " + event);
            for (var listener : listeners) {
                listener.onEvent(event);
            }
        }
    }

    // ---- オブザーバー1: ログ出力リスナー ----
    static class LogListener implements EventListener {
        @Override
        public void onEvent(Event event) {
            // record のアクセサメソッドでフィールド値を取得する
            System.out.println("[LogListener] ログ記録: [" + event.type() + "] " + event.data());
        }
    }

    // ---- オブザーバー2: メール通知リスナー ----
    static class EmailNotificationListener implements EventListener {
        @Override
        public void onEvent(Event event) {
            if ("USER_REGISTERED".equals(event.type())) {
                System.out.println("[EmailListener] ウェルカムメールを送信: " + event.data());
            } else {
                System.out.println("[EmailListener] このイベントはメール対象外: " + event.type());
            }
        }
    }

    // ---- オブザーバー3: 監査ログリスナー ----
    static class AuditListener implements EventListener {
        private int eventCount = 0;

        @Override
        public void onEvent(Event event) {
            eventCount++;
            System.out.println("[AuditListener] 監査ログ #" + eventCount + ": " + event);
        }

        public int getEventCount() {
            return eventCount;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Observer パターン: イベント通知システム（Java 17）===");

        var publisher = new EventPublisher();

        System.out.println("\n--- リスナーの登録 ---");
        var logListener = new LogListener();
        var emailListener = new EmailNotificationListener();
        var auditListener = new AuditListener();

        publisher.subscribe(logListener);
        publisher.subscribe(emailListener);
        publisher.subscribe(auditListener);

        // Event record でイベントを生成して発行する
        System.out.println("\n--- ユーザー登録イベントを発行 ---");
        publisher.publish(new Event("USER_REGISTERED", "userId=user_001, name=山田太郎"));

        System.out.println("\n--- 注文イベントを発行 ---");
        publisher.publish(new Event("ORDER_PLACED", "orderId=ord_100, amount=5000"));

        System.out.println("\n--- EmailListener を解除して再度イベント発行 ---");
        publisher.unsubscribe(emailListener);
        publisher.publish(new Event("USER_REGISTERED", "userId=user_002, name=鈴木花子"));

        System.out.println("\n--- 監査ログの集計 ---");
        System.out.println("受け取ったイベント数: " + auditListener.getEventCount());
    }
}
