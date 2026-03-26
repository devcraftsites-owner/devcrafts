import java.util.ArrayList;
import java.util.List;

public class SolidPrinciplesSample {

    // === S: 単一責任原則 ===

    // ❌ 悪い例: Order クラスが注文データ + 永続化 + メール通知の責任を持つ
    static class BadOrder {
        private String product;
        private int quantity;

        public BadOrder(String product, int quantity) {
            this.product = product;
            this.quantity = quantity;
        }

        public void save() { // 永続化責任（本来は Repository の仕事）
            System.out.println("DB に保存: " + product);
        }

        public void sendEmail() { // 通知責任（本来は Notification の仕事）
            System.out.println("メール送信: " + product);
        }
    }

    // ✅ 良い例: 責任を分離
    static class Order {
        private final String product;
        private final int quantity;

        public Order(String product, int quantity) {
            this.product = product;
            this.quantity = quantity;
        }

        public String getProduct() { return product; }
        public int getQuantity() { return quantity; }
    }

    static class OrderRepository {
        public void save(Order order) {
            System.out.println("DB に保存: " + order.getProduct());
        }
    }

    static class OrderNotification {
        public void sendEmail(Order order) {
            System.out.println("メール送信: " + order.getProduct());
        }
    }

    // === O: 開放閉鎖原則 ===

    // ❌ 悪い例: 新しい割引タイプを追加するたびに if-else を修正
    static class BadDiscountCalculator {
        public double calculate(String type, double price) {
            if (type.equals("STUDENT")) {
                return price * 0.8;
            } else if (type.equals("MEMBER")) {
                return price * 0.9;
            }
            // 新タイプを追加するたびにこのクラスを変更 ❌
            return price;
        }
    }

    // ✅ 良い例: 拡張に開く（新タイプを追加しても既存コードを変更しない）
    interface DiscountStrategy {
        double apply(double price);
    }

    static class StudentDiscount implements DiscountStrategy {
        @Override
        public double apply(double price) { return price * 0.8; }
    }

    static class MemberDiscount implements DiscountStrategy {
        @Override
        public double apply(double price) { return price * 0.9; }
    }

    static class DiscountCalculator {
        public double calculate(DiscountStrategy strategy, double price) {
            return strategy.apply(price); // 既存コードを変更せず新タイプを追加可能
        }
    }

    // === D: 依存性逆転原則 ===

    // ❌ 悪い例: 具体クラスに依存
    static class BadOrderService {
        private final MySqlOrderRepository repo = new MySqlOrderRepository(); // 具体実装に依存

        void processOrder(Order order) {
            repo.save(order);
        }
    }

    static class MySqlOrderRepository {
        public void save(Order order) {
            System.out.println("MySQL に保存: " + order.getProduct());
        }
    }

    // ✅ 良い例: インターフェースに依存（テスト・実装の差し替えが容易）
    interface OrderRepositoryInterface {
        void save(Order order);
    }

    static class ProductionRepository implements OrderRepositoryInterface {
        @Override
        public void save(Order order) {
            System.out.println("本番DB に保存: " + order.getProduct());
        }
    }

    static class GoodOrderService {
        private final OrderRepositoryInterface repo; // インターフェースに依存 ✅

        public GoodOrderService(OrderRepositoryInterface repo) { // コンストラクタ注入
            this.repo = repo;
        }

        public void processOrder(Order order) {
            repo.save(order);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== S: 単一責任原則 ===");
        Order order = new Order("ノートPC", 1);
        new OrderRepository().save(order);
        new OrderNotification().sendEmail(order);

        System.out.println("\n=== O: 開放閉鎖原則 ===");
        DiscountCalculator calc = new DiscountCalculator();
        System.out.println("学生割引: " + calc.calculate(new StudentDiscount(), 10000));
        System.out.println("会員割引: " + calc.calculate(new MemberDiscount(), 10000));

        System.out.println("\n=== D: 依存性逆転原則 ===");
        GoodOrderService service = new GoodOrderService(new ProductionRepository());
        service.processOrder(order);
    }
}
