import java.util.ArrayList;
import java.util.List;

/**
 * DP-19: Observer パターン（Java 21+）
 *
 * Java 21 では sealed interface + switch パターンマッチングで
 * イベントの種類を型安全に分類して処理できます。
 */
public class ObserverPatternSample {

    // ---- Java 21: sealed interface でアプリケーションイベントを型安全に定義する ----
    sealed interface AppEvent
            permits AppEvent.UserRegistered, AppEvent.OrderPlaced, AppEvent.PaymentFailed {

        /** ユーザー登録イベント */
        record UserRegistered(String userId, String name) implements AppEvent {}

        /** 注文確定イベント */
        record OrderPlaced(String orderId, int amount) implements AppEvent {}

        /** 決済失敗イベント */
        record PaymentFailed(String orderId, String reason) implements AppEvent {}
    }

    // ---- オブザーバーのインターフェース ----
    interface EventListener {
        /** AppEvent を受け取って処理するメソッド */
        void onEvent(AppEvent event);
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

        public void publish(AppEvent event) {
            System.out.println("[Publisher] イベント発行: " + event);
            for (var listener : listeners) {
                listener.onEvent(event);
            }
        }
    }

    // ---- オブザーバー1: ログ出力リスナー（switch パターンマッチングで処理を分岐）----
    static class LogListener implements EventListener {
        @Override
        public void onEvent(AppEvent event) {
            // record deconstruction で各イベントのフィールドを直接取り出す（Java 21+）
            String message = switch (event) {
                case AppEvent.UserRegistered(var userId, var name) ->
                    "ユーザー登録: userId=" + userId + ", name=" + name;
                case AppEvent.OrderPlaced(var orderId, var amount) ->
                    "注文確定: orderId=" + orderId + ", amount=" + amount + "円";
                case AppEvent.PaymentFailed(var orderId, var reason) ->
                    "決済失敗: orderId=" + orderId + ", reason=" + reason;
            };
            System.out.println("[LogListener] " + message);
        }
    }

    // ---- オブザーバー2: メール通知リスナー ----
    static class EmailNotificationListener implements EventListener {
        @Override
        public void onEvent(AppEvent event) {
            switch (event) {
                case AppEvent.UserRegistered(var userId, var name) ->
                    System.out.println("[EmailListener] ウェルカムメール送信: " + name + " 様 (userId=" + userId + ")");
                case AppEvent.PaymentFailed(var orderId, var reason) ->
                    System.out.println("[EmailListener] 決済失敗通知メール送信: orderId=" + orderId);
                case AppEvent.OrderPlaced(var orderId, var amount) ->
                    System.out.println("[EmailListener] 注文確認メール送信: orderId=" + orderId + ", " + amount + "円");
            }
        }
    }

    // ---- オブザーバー3: 監査ログリスナー ----
    static class AuditListener implements EventListener {
        private int eventCount = 0;

        @Override
        public void onEvent(AppEvent event) {
            eventCount++;
            System.out.println("[AuditListener] 監査ログ #" + eventCount + ": " + event);
        }

        public int getEventCount() {
            return eventCount;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Observer パターン: イベント通知システム（Java 21）===");

        var publisher = new EventPublisher();

        System.out.println("\n--- リスナーの登録 ---");
        var logListener = new LogListener();
        var emailListener = new EmailNotificationListener();
        var auditListener = new AuditListener();

        publisher.subscribe(logListener);
        publisher.subscribe(emailListener);
        publisher.subscribe(auditListener);

        // sealed interface のサブタイプで型安全にイベントを作成する
        System.out.println("\n--- ユーザー登録イベントを発行 ---");
        publisher.publish(new AppEvent.UserRegistered("user_001", "山田太郎"));

        System.out.println("\n--- 注文確定イベントを発行 ---");
        publisher.publish(new AppEvent.OrderPlaced("ord_100", 5000));

        System.out.println("\n--- 決済失敗イベントを発行 ---");
        publisher.publish(new AppEvent.PaymentFailed("ord_101", "カード残高不足"));

        System.out.println("\n--- EmailListener を解除して再度ユーザー登録 ---");
        publisher.unsubscribe(emailListener);
        publisher.publish(new AppEvent.UserRegistered("user_002", "鈴木花子"));

        System.out.println("\n--- 監査ログの集計 ---");
        System.out.println("受け取ったイベント数: " + auditListener.getEventCount());
    }
}
