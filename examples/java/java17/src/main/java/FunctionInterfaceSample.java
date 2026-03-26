import java.util.List;
import java.util.function.*;

public class FunctionInterfaceSample {

    // Java 17: record でデータクラスを簡潔に定義
    record Product(String name, int price) {}

    public static void main(String[] args) {
        System.out.println("=== Function<T, R>: T → R の変換 ===");
        // var で型推論
        var strLength = (Function<String, Integer>) s -> s.length();
        var intToStr = (Function<Integer, String>) n -> "数値: " + n;

        System.out.println(strLength.apply("Hello")); // 5
        System.out.println(intToStr.apply(42));        // 数値: 42

        // andThen で関数合成
        var combined = strLength.andThen(intToStr);
        System.out.println(combined.apply("Java")); // 数値: 4

        System.out.println("\n=== Consumer<T>: Product を表示 ===");
        // List.of() で不変リストを作成
        var products = List.of(
            new Product("ノートPC", 80000),
            new Product("マウス", 3000),
            new Product("キーボード", 12000)
        );

        Consumer<Product> printProduct = p ->
            System.out.println(p.name() + ": " + p.price() + "円");
        products.forEach(printProduct);

        System.out.println("\n=== Predicate<T>: Product のフィルタリング ===");
        Predicate<Product> isExpensive = p -> p.price() >= 10000;
        Predicate<Product> hasKeyboard = p -> p.name().contains("キーボード");
        Predicate<Product> isExpensiveOrKeyboard = isExpensive.or(hasKeyboard);

        System.out.println("高額または「キーボード」を含む商品:");
        products.stream()
            .filter(isExpensiveOrKeyboard)
            .forEach(p -> System.out.println("  " + p.name()));

        System.out.println("\n=== Function<Product, ...>: record のフィールドを変換 ===");
        Function<Product, String> toLabel = p -> "[" + p.name() + "] ¥" + p.price();
        products.stream()
            .map(toLabel)
            .forEach(System.out::println);

        System.out.println("\n=== BiFunction: 商品名と割引率から割引後価格を計算 ===");
        BiFunction<Product, Double, Integer> discounted =
            (p, rate) -> (int) (p.price() * (1.0 - rate));
        for (var product : products) {
            System.out.println(product.name() + " 10%引き: " + discounted.apply(product, 0.1) + "円");
        }
    }
}
