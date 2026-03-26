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

    // Java 17: record で商品を表現
    record Product(String name, int price) {}

    public static void main(String[] args) {
        System.out.println("=== @FunctionalInterface をラムダで実装 ===");
        Validator<String> notEmpty = value -> value != null && !value.isEmpty();
        Validator<String> notTooLong = value -> value.length() <= 20;
        var combined = notEmpty.and(notTooLong);

        System.out.println("空文字: " + combined.validate(""));       // false
        System.out.println("OK: " + combined.validate("田中太郎"));    // true

        System.out.println("\n=== Strategy パターンをラムダで ===");
        PriceCalculator noDiscount = price -> price;
        PriceCalculator tenPercent = price -> (int) (price * 0.9);
        PriceCalculator halfPrice = price -> price / 2;

        int basePrice = 10000;
        System.out.println("通常: " + noDiscount.calculate(basePrice));
        System.out.println("10%引き: " + tenPercent.calculate(basePrice));
        System.out.println("半額: " + halfPrice.calculate(basePrice));

        System.out.println("\n=== Comparator.comparing でソート（Java 17 + record） ===");
        var products = List.of(
            new Product("A", 3000),
            new Product("B", 1000),
            new Product("C", 2000)
        );

        // Comparator.comparing でフィールド参照
        var byPrice = Comparator.comparing(Product::price);
        var sorted = products.stream()
            .sorted(byPrice)
            .toList(); // Java 16+
        System.out.println("価格昇順: " + sorted);

        var sortedDesc = products.stream()
            .sorted(byPrice.reversed())
            .toList();
        System.out.println("価格降順: " + sortedDesc);

        System.out.println("\n=== Predicate でフィルタリング ===");
        Predicate<Product> isExpensive = p -> p.price() >= 2000;
        var expensive = products.stream()
            .filter(isExpensive)
            .toList();
        System.out.println("2000円以上: " + expensive);

        System.out.println("\n=== メソッド参照 ===");
        var names = List.of("田中", "山田", "鈴木");
        names.forEach(System.out::println);
    }
}
