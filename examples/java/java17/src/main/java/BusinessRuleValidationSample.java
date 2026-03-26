import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BusinessRuleValidationSample {

    // 注文データを表す record（Java 16+）
    record Order(BigDecimal amount, LocalDate deliveryDate, int stockCount, int orderCount) {}

    // バリデーション結果を保持する record
    record ValidationResult(List<String> errors) {
        boolean isValid() {
            return errors.isEmpty();
        }
    }

    // 注文バリデーター
    static class OrderValidator {
        // 請求金額 > 0
        public static void validateAmount(BigDecimal amount, List<String> errors) {
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                errors.add("請求金額は0より大きい値を指定してください");
            }
        }

        // 納期 > 本日
        public static void validateDeliveryDate(LocalDate deliveryDate, List<String> errors) {
            if (deliveryDate == null || !deliveryDate.isAfter(LocalDate.now())) {
                errors.add("納期は本日より後の日付を指定してください");
            }
        }

        // 在庫数 >= 注文数
        public static void validateStock(int stockCount, int orderCount, List<String> errors) {
            if (orderCount <= 0) {
                errors.add("注文数は1以上を指定してください");
            } else if (stockCount < orderCount) {
                errors.add("在庫数（" + stockCount + "）が注文数（" + orderCount + "）を下回っています");
            }
        }

        // 複合バリデーション（Order record を受け取って一括チェック）
        public static ValidationResult validateOrder(Order order) {
            var errors = new ArrayList<String>();
            validateAmount(order.amount(), errors);
            validateDeliveryDate(order.deliveryDate(), errors);
            validateStock(order.stockCount(), order.orderCount(), errors);
            return new ValidationResult(errors);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 正常ケース ===");
        var order1 = new Order(
            new BigDecimal("10000"),
            LocalDate.now().plusDays(7),
            100,
            5
        );
        var result1 = OrderValidator.validateOrder(order1);
        System.out.println("Valid: " + result1.isValid());

        System.out.println("\n=== 複数エラーケース ===");
        var order2 = new Order(
            new BigDecimal("-100"),
            LocalDate.now().minusDays(1),
            3,
            10
        );
        var result2 = OrderValidator.validateOrder(order2);
        System.out.println("Valid: " + result2.isValid());
        for (var error : result2.errors()) {
            System.out.println(" - " + error);
        }
    }
}
