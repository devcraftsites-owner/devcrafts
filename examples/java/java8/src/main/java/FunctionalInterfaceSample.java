import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;

public class FunctionalInterfaceSample {

    // @FunctionalInterface: 抽象メソッドが1つのインターフェース
    @FunctionalInterface
    interface Validator<T> {
        boolean validate(T value);

        // default メソッドは持てる
        default Validator<T> and(Validator<T> other) {
            return value -> this.validate(value) && other.validate(value);
        }
    }

    // Strategy パターンをラムダで実装
    @FunctionalInterface
    interface PriceCalculator {
        int calculate(int basePrice);
    }

    static class Product {
        final String name;
        final int price;

        Product(String name, int price) {
            this.name = name;
            this.price = price;
        }

        @Override
        public String toString() {
            return name + "(" + price + "円)";
        }
    }

    public static void main(String[] args) {
        System.out.println("=== @FunctionalInterface をラムダで実装 ===");
        // 匿名クラスの従来の書き方
        Validator<String> notEmptyAnon = new Validator<String>() {
            @Override
            public boolean validate(String value) {
                return value != null && !value.isEmpty();
            }
        };

        // ラムダ式（同等だがシンプル）
        Validator<String> notEmpty = value -> value != null && !value.isEmpty();
        Validator<String> notTooLong = value -> value.length() <= 20;
        Validator<String> combined = notEmpty.and(notTooLong);

        System.out.println("空文字: " + combined.validate(""));       // false
        System.out.println("OK: " + combined.validate("田中太郎"));    // true

        System.out.println("\n=== Strategy パターンをラムダで ===");
        PriceCalculator noDiscount = price -> price;
        PriceCalculator tenPercent = price -> (int) (price * 0.9);
        PriceCalculator halfPrice = price -> price / 2;

        int basePrice = 10000;
        System.out.println("通常: " + noDiscount.calculate(basePrice));   // 10000
        System.out.println("10%引き: " + tenPercent.calculate(basePrice)); // 9000
        System.out.println("半額: " + halfPrice.calculate(basePrice));     // 5000

        System.out.println("\n=== Comparator（関数型インターフェース）でソート ===");
        List<Product> products = Arrays.asList(
            new Product("A", 3000),
            new Product("B", 1000),
            new Product("C", 2000)
        );

        // 匿名クラス
        Collections.sort(products, new Comparator<Product>() {
            @Override
            public int compare(Product a, Product b) {
                return Integer.compare(a.price, b.price);
            }
        });
        System.out.println("価格昇順: " + products);

        // ラムダで同等
        products.sort((a, b) -> Integer.compare(b.price, a.price)); // 降順
        System.out.println("価格降順: " + products);

        // メソッド参照
        System.out.println("\n=== メソッド参照 ===");
        List<String> names = Arrays.asList("田中", "山田", "鈴木");
        names.forEach(System.out::println); // インスタンスメソッド参照
    }
}
