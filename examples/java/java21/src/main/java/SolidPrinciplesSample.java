import java.util.List;

public class SolidPrinciplesSample {

    // === S: 単一責任原則 ===

    // Java 21: record で Order を表現
    record Order(String product, int quantity) {}

    static class OrderRepository {
        public void save(Order order) {
            System.out.println("DB に保存: " + order.product());
        }
    }

    static class OrderNotification {
        public void sendEmail(Order order) {
            System.out.println("メール送信: " + order.product());
        }
    }

    // === O: 開放閉鎖原則 ===

    // Java 21: sealed interface で割引タイプを型安全に表現
    sealed interface DiscountType permits DiscountType.Student, DiscountType.Member, DiscountType.None {
        record Student() implements DiscountType {}
        record Member() implements DiscountType {}
        record None() implements DiscountType {}
    }

    // switch パターンマッチングで割引を適用（新タイプを追加してもここだけ変更すればよい）
    static double applyDiscount(DiscountType type, double price) {
        return switch (type) {
            case DiscountType.Student s -> price * 0.8;
            case DiscountType.Member m -> price * 0.9;
            case DiscountType.None n -> price;
        };
    }

    // === D: 依存性逆転原則 ===

    interface OrderRepositoryInterface {
        void save(Order order);
    }

    static class GoodOrderService {
        private final OrderRepositoryInterface repo;

        public GoodOrderService(OrderRepositoryInterface repo) {
            this.repo = repo;
        }

        public void processOrder(Order order) {
            repo.save(order);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== S: 単一責任原則 ===");
        var order = new Order("ノートPC", 1);
        new OrderRepository().save(order);
        new OrderNotification().sendEmail(order);

        System.out.println("\n=== O: 開放閉鎖原則（sealed interface + switch パターンマッチング） ===");
        var discounts = List.of(
            new DiscountType.Student(),
            new DiscountType.Member(),
            new DiscountType.None()
        );

        for (var discount : discounts) {
            var result = applyDiscount(discount, 10000);
            System.out.println(discount.getClass().getSimpleName() + " 割引後: " + result);
        }

        System.out.println("\n=== D: 依存性逆転原則 ===");
        OrderRepositoryInterface productionRepo = o -> System.out.println("本番DB に保存: " + o.product());
        var service = new GoodOrderService(productionRepo);
        service.processOrder(order);

        // テスト時はモックに差し替えるだけ
        OrderRepositoryInterface testRepo = o -> System.out.println("[テスト] モックDB に保存: " + o.product());
        var testService = new GoodOrderService(testRepo);
        testService.processOrder(order);
    }
}
