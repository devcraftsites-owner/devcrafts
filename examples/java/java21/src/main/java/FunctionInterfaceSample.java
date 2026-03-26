import java.util.List;
import java.util.function.*;

public class FunctionInterfaceSample {

    // Java 17+: record でデータクラスを簡潔に定義
    record Product(String name, int price) {}

    // Java 21: sealed interface で文字列操作の種類を型安全に表現
    sealed interface Operation permits Operation.Upper, Operation.Trim, Operation.Length {
        record Upper() implements Operation {}
        record Trim() implements Operation {}
        record Length() implements Operation {}
    }

    // switch パターンマッチングで操作を適用（Java 21+）
    static String applyOperation(String s, Operation op) {
        return switch (op) {
            case Operation.Upper u -> s.toUpperCase();
            case Operation.Trim t -> s.trim();
            case Operation.Length l -> String.valueOf(s.length());
        };
    }

    public static void main(String[] args) {
        System.out.println("=== Function<T, R>: T → R の変換 ===");
        var strLength = (Function<String, Integer>) s -> s.length();
        var intToStr = (Function<Integer, String>) n -> "数値: " + n;

        System.out.println(strLength.apply("Hello")); // 5
        System.out.println(intToStr.apply(42));        // 数値: 42

        var combined = strLength.andThen(intToStr);
        System.out.println(combined.apply("Java")); // 数値: 4

        System.out.println("\n=== sealed interface Operation + switch パターンマッチング ===");
        var input = "  Hello World  ";
        var operations = List.of(
            new Operation.Trim(),
            new Operation.Upper(),
            new Operation.Length()
        );
        for (var op : operations) {
            System.out.println(op.getClass().getSimpleName() + ": " + applyOperation(input, op));
        }

        System.out.println("\n=== Consumer<T>: Product を表示 ===");
        var products = List.of(
            new Product("ノートPC", 80000),
            new Product("マウス", 3000),
            new Product("キーボード", 12000)
        );

        Consumer<Product> printProduct = p ->
            System.out.println(p.name() + ": " + p.price() + "円");
        products.forEach(printProduct);

        System.out.println("\n=== Predicate<T>: フィルタリング ===");
        Predicate<Product> isExpensive = p -> p.price() >= 10000;
        Predicate<Product> isCheap = isExpensive.negate();

        System.out.println("高額商品（1万円以上）:");
        products.stream().filter(isExpensive).forEach(p -> System.out.println("  " + p.name()));

        System.out.println("低価格商品（1万円未満）:");
        products.stream().filter(isCheap).forEach(p -> System.out.println("  " + p.name()));

        System.out.println("\n=== BiFunction: 商品名と割引率から割引後価格を計算 ===");
        BiFunction<Product, Double, Integer> discounted =
            (p, rate) -> (int) (p.price() * (1.0 - rate));
        for (var product : products) {
            System.out.println(product.name() + " 10%引き: " + discounted.apply(product, 0.1) + "円");
        }
    }
}
