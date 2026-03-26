import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BusinessRuleValidationSample {

    // バリデーション結果を表す
    static class ValidationResult {
        private final List<String> errors = new ArrayList<>();

        public void addError(String message) {
            errors.add(message);
        }

        public boolean isValid() {
            return errors.isEmpty();
        }

        public List<String> getErrors() {
            return errors;
        }
    }

    // 注文バリデーター
    static class OrderValidator {
        // 請求金額 > 0
        public static void validateAmount(BigDecimal amount, ValidationResult result) {
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                result.addError("請求金額は0より大きい値を指定してください");
            }
        }

        // 納期 > 本日
        public static void validateDeliveryDate(LocalDate deliveryDate, ValidationResult result) {
            if (deliveryDate == null || !deliveryDate.isAfter(LocalDate.now())) {
                result.addError("納期は本日より後の日付を指定してください");
            }
        }

        // 在庫数 >= 注文数
        public static void validateStock(int stockCount, int orderCount, ValidationResult result) {
            if (orderCount <= 0) {
                result.addError("注文数は1以上を指定してください");
            } else if (stockCount < orderCount) {
                result.addError("在庫数（" + stockCount + "）が注文数（" + orderCount + "）を下回っています");
            }
        }

        // 複合バリデーション（全フィールドまとめて）
        public static ValidationResult validateOrder(BigDecimal amount, LocalDate deliveryDate, int stockCount, int orderCount) {
            ValidationResult result = new ValidationResult();
            validateAmount(amount, result);
            validateDeliveryDate(deliveryDate, result);
            validateStock(stockCount, orderCount, result);
            return result;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 正常ケース ===");
        ValidationResult result1 = OrderValidator.validateOrder(
            new BigDecimal("10000"),
            LocalDate.now().plusDays(7),
            100,
            5
        );
        System.out.println("Valid: " + result1.isValid());

        System.out.println("\n=== 複数エラーケース ===");
        ValidationResult result2 = OrderValidator.validateOrder(
            new BigDecimal("-100"),
            LocalDate.now().minusDays(1),
            3,
            10
        );
        System.out.println("Valid: " + result2.isValid());
        for (String error : result2.getErrors()) {
            System.out.println(" - " + error);
        }
    }
}
