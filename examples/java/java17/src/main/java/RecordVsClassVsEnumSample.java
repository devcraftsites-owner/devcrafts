import java.util.List;

public class RecordVsClassVsEnumSample {

    // === Enum: 定数セット・固定値 ===
    enum OrderStatus {
        PENDING("受付中"),
        PROCESSING("処理中"),
        SHIPPED("発送済み"),
        DELIVERED("配達済み"),
        CANCELLED("キャンセル");

        private final String label;

        OrderStatus(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }

    // === Class（通常クラス）: ビジネスロジック・可変状態 ===
    static class OrderService {
        private int processedCount = 0; // 状態を持つ

        public OrderStatus advance(OrderStatus current) {
            processedCount++;
            if (current == OrderStatus.PENDING) return OrderStatus.PROCESSING;
            if (current == OrderStatus.PROCESSING) return OrderStatus.SHIPPED;
            return current;
        }

        public int getProcessedCount() {
            return processedCount;
        }
    }

    // === Java 17: record で DTO を簡潔に定義 ===
    record OrderDto(String orderId, String product, int quantity, OrderStatus status) {

        // イミュータブル更新: 新しいステータスの DTO を作成
        public OrderDto withStatus(OrderStatus newStatus) {
            return new OrderDto(orderId, product, quantity, newStatus);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Enum: 注文ステータス一覧 ===");
        var statuses = List.of(OrderStatus.values());
        statuses.forEach(s -> System.out.println(s.name() + " → " + s.getLabel()));

        System.out.println("\n=== Class: ビジネスロジック ===");
        var service = new OrderService();
        var status = OrderStatus.PENDING;
        status = service.advance(status);
        status = service.advance(status);
        System.out.println("現在のステータス: " + status.getLabel());
        System.out.println("処理回数: " + service.getProcessedCount());

        System.out.println("\n=== record OrderDto: 値オブジェクト ===");
        // Java 17: record のコンストラクタ、toString、equals、hashCode が自動生成される
        var order = new OrderDto("ORD-001", "ノートPC", 2, OrderStatus.PENDING);
        System.out.println(order); // toString が自動生成される
        var updated = order.withStatus(OrderStatus.PROCESSING);
        System.out.println(updated);
        System.out.println("元の order は変わらない: " + order.status().getLabel());

        System.out.println("\n=== 複数の注文を一覧表示 ===");
        var orders = List.of(
            new OrderDto("ORD-001", "ノートPC", 2, OrderStatus.PENDING),
            new OrderDto("ORD-002", "マウス", 5, OrderStatus.PROCESSING),
            new OrderDto("ORD-003", "キーボード", 1, OrderStatus.SHIPPED)
        );
        orders.forEach(o ->
            System.out.println(o.orderId() + ": " + o.product() + " → " + o.status().getLabel())
        );
    }
}
