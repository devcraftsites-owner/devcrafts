import java.util.Objects;

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

    // === Java 8 での record 相当: 値オブジェクト（DTO）===
    static final class OrderDto {
        private final String orderId;
        private final String product;
        private final int quantity;
        private final OrderStatus status;

        public OrderDto(String orderId, String product, int quantity, OrderStatus status) {
            this.orderId = orderId;
            this.product = product;
            this.quantity = quantity;
            this.status = status;
        }

        public String orderId() { return orderId; }
        public String product() { return product; }
        public int quantity() { return quantity; }
        public OrderStatus status() { return status; }

        // 新しい状態の DTO を作成（イミュータブル更新）
        public OrderDto withStatus(OrderStatus newStatus) {
            return new OrderDto(orderId, product, quantity, newStatus);
        }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof OrderDto)) return false;
            OrderDto dto = (OrderDto) o;
            return quantity == dto.quantity
                && Objects.equals(orderId, dto.orderId)
                && Objects.equals(product, dto.product)
                && status == dto.status;
        }

        @Override
        public int hashCode() {
            return Objects.hash(orderId, product, quantity, status);
        }

        @Override
        public String toString() {
            return "OrderDto{orderId=" + orderId + ", product=" + product
                + ", quantity=" + quantity + ", status=" + status.getLabel() + "}";
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Enum: 注文ステータス ===");
        for (OrderStatus s : OrderStatus.values()) {
            System.out.println(s.name() + " → " + s.getLabel());
        }

        System.out.println("\n=== Class: ビジネスロジック ===");
        OrderService service = new OrderService();
        OrderStatus status = OrderStatus.PENDING;
        status = service.advance(status);
        status = service.advance(status);
        System.out.println("現在のステータス: " + status.getLabel());
        System.out.println("処理回数: " + service.getProcessedCount());

        System.out.println("\n=== DTO: 値オブジェクト ===");
        OrderDto order = new OrderDto("ORD-001", "ノートPC", 2, OrderStatus.PENDING);
        System.out.println(order);
        OrderDto updated = order.withStatus(OrderStatus.PROCESSING);
        System.out.println(updated);
        System.out.println("元の order は変わらない: " + order.status().getLabel());
    }
}
