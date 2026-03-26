import java.util.List;

public class SolidPrinciplesSample {

    // === S: 単一責任原則 ===

    // Java 17: record で Order を表現（不変データクラス）
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

    interface DiscountStrategy {
        double apply(double price);
    }

    static class DiscountCalculator {
        public double calculate(DiscountStrategy strategy, double price) {
            return strategy.apply(price);
        }
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
        // Java 17: record で Order を生成
        var order = new Order("ノートPC", 1);
        new OrderRepository().save(order);
        new OrderNotification().sendEmail(order);

        System.out.println("\n=== O: 開放閉鎖原則（ラムダで戦略を定義） ===");
        var calc = new DiscountCalculator();

        // Java 17: ラムダ式で DiscountStrategy を実装
        DiscountStrategy studentDiscount = price -> price * 0.8;
        DiscountStrategy memberDiscount = price -> price * 0.9;
        DiscountStrategy vipDiscount = price -> price * 0.7; // 新タイプを追加しても既存コードを変更しない

        System.out.println("学生割引: " + calc.calculate(studentDiscount, 10000));
        System.out.println("会員割引: " + calc.calculate(memberDiscount, 10000));
        System.out.println("VIP割引: " + calc.calculate(vipDiscount, 10000));

        System.out.println("\n=== D: 依存性逆転原則 ===");
        // var でインターフェースを実装（コンストラクタ注入）
        OrderRepositoryInterface productionRepo = o -> System.out.println("本番DB に保存: " + o.product());
        var service = new GoodOrderService(productionRepo);
        service.processOrder(order);

        // テスト時はモックに差し替えるだけ
        OrderRepositoryInterface testRepo = o -> System.out.println("[テスト] モックDB に保存: " + o.product());
        var testService = new GoodOrderService(testRepo);
        testService.processOrder(order);
    }
}
