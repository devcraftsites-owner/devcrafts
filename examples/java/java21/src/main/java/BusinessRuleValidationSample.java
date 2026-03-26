import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class BusinessRuleValidationSample {

    // バリデーションルールを表す sealed interface（Java 17+）
    // permits を省略すると、同一ファイル内のクラスが自動的に許可される
    sealed interface ValidationRule {
        record AmountRule(BigDecimal amount) implements ValidationRule {}
        record DeliveryDateRule(LocalDate deliveryDate) implements ValidationRule {}
        record StockRule(int stock, int order) implements ValidationRule {}
    }

    // バリデーション結果を保持する record
    record ValidationResult(List<String> errors) {
        boolean isValid() {
            return errors.isEmpty();
        }
    }

    // 1つのルールを検証してエラーメッセージを返す（Java 21 パターンマッチング switch）
    public static Optional<String> validate(ValidationRule rule) {
        return switch (rule) {
            case ValidationRule.AmountRule r -> {
                if (r.amount() == null || r.amount().compareTo(BigDecimal.ZERO) <= 0) {
                    yield Optional.of("請求金額は0より大きい値を指定してください");
                }
                yield Optional.empty();
            }
            case ValidationRule.DeliveryDateRule r -> {
                if (r.deliveryDate() == null || !r.deliveryDate().isAfter(LocalDate.now())) {
                    yield Optional.of("納期は本日より後の日付を指定してください");
                }
                yield Optional.empty();
            }
            case ValidationRule.StockRule r -> {
                if (r.order() <= 0) {
                    yield Optional.of("注文数は1以上を指定してください");
                } else if (r.stock() < r.order()) {
                    yield Optional.of("在庫数（" + r.stock() + "）が注文数（" + r.order() + "）を下回っています");
                }
                yield Optional.empty();
            }
        };
    }

    // 複数ルールをまとめて評価して ValidationResult を返す
    public static ValidationResult validateOrder(
            BigDecimal amount, LocalDate deliveryDate, int stockCount, int orderCount) {
        var errors = new ArrayList<String>();
        // ルールを List.of(...) でまとめて一括評価
        var rules = List.of(
            new ValidationRule.AmountRule(amount),
            new ValidationRule.DeliveryDateRule(deliveryDate),
            new ValidationRule.StockRule(stockCount, orderCount)
        );
        for (var rule : rules) {
            validate(rule).ifPresent(errors::add);
        }
        return new ValidationResult(errors);
    }

    public static void main(String[] args) {
        System.out.println("=== 正常ケース ===");
        var result1 = validateOrder(
            new BigDecimal("10000"),
            LocalDate.now().plusDays(7),
            100,
            5
        );
        System.out.println("Valid: " + result1.isValid());

        System.out.println("\n=== 複数エラーケース ===");
        var result2 = validateOrder(
            new BigDecimal("-100"),
            LocalDate.now().minusDays(1),
            3,
            10
        );
        System.out.println("Valid: " + result2.isValid());
        for (var error : result2.errors()) {
            System.out.println(" - " + error);
        }
    }
}
