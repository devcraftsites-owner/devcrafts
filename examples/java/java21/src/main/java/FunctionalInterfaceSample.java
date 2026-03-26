import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;

public class FunctionalInterfaceSample {

    // @FunctionalInterface: 抽象メソッドが1つのインターフェース
    @FunctionalInterface
    interface Validator<T> {
        boolean validate(T value);

        default Validator<T> and(Validator<T> other) {
            return value -> this.validate(value) && other.validate(value);
        }
    }

    // Strategy パターンをラムダで実装
    @FunctionalInterface
    interface PriceCalculator {
        int calculate(int basePrice);
    }

    // Java 17+: record で商品を表現
    record Product(String name, int price) {}

    // Java 21: sealed interface で割引戦略を型安全に表現
    sealed interface DiscountStrategy permits DiscountStrategy.None, DiscountStrategy.Percentage, DiscountStrategy.Fixed {
        record None() implements DiscountStrategy {}
        record Percentage(double rate) implements DiscountStrategy {}
        record Fixed(int amount) implements DiscountStrategy {}
    }

    // switch パターンマッチングで割引を適用（Java 21+）
    static int applyDiscount(int price, DiscountStrategy strategy) {
        return switch (strategy) {
            case DiscountStrategy.None n -> price;
            case DiscountStrategy.Percentage p -> (int) (price * (1.0 - p.rate()));
            case DiscountStrategy.Fixed f -> Math.max(0, price - f.amount());
        };
    }

    public static void main(String[] args) {
        System.out.println("=== @FunctionalInterface をラムダで実装 ===");
        Validator<String> notEmpty = value -> value != null && !value.isEmpty();
        Validator<String> notTooLong = value -> value.length() <= 20;
        var combined = notEmpty.and(notTooLong);

        System.out.println("空文字: " + combined.validate(""));
        System.out.println("OK: " + combined.validate("田中太郎"));

        System.out.println("\n=== sealed interface DiscountStrategy + switch パターンマッチング ===");
        int basePrice = 10000;
        var strategies = List.of(
            new DiscountStrategy.None(),
            new DiscountStrategy.Percentage(0.1),
            new DiscountStrategy.Fixed(2000)
        );
        for (var strategy : strategies) {
            System.out.println(strategy.getClass().getSimpleName()
                + ": " + applyDiscount(basePrice, strategy) + "円");
        }

        System.out.println("\n=== Comparator.comparing でソート ===");
        var products = List.of(
            new Product("A", 3000),
            new Product("B", 1000),
            new Product("C", 2000)
        );

        var byPrice = Comparator.comparing(Product::price);
        products.stream()
            .sorted(byPrice)
            .forEach(p -> System.out.println(p.name() + ": " + p.price() + "円"));

        System.out.println("\n=== メソッド参照 ===");
        var names = List.of("田中", "山田", "鈴木");
        names.forEach(System.out::println);
    }
}
