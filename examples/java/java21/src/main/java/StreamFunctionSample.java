import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class StreamFunctionSample {

    // Java 17+: record でデータクラスを簡潔に定義
    record Product(String name, String category, int price) {
        @Override
        public String toString() {
            return name + "(" + price + "円)";
        }
    }

    // Java 21: sealed interface で Stream 操作の種類を型安全に表現
    sealed interface StreamOp permits StreamOp.Filter, StreamOp.Map, StreamOp.Group {
        record Filter(String category) implements StreamOp {}
        record Map(Function<Product, String> fn) implements StreamOp {}
        record Group() implements StreamOp {}
    }

    // switch パターンマッチングで操作を適用（Java 21+）
    static void applyOp(List<Product> products, StreamOp op) {
        switch (op) {
            case StreamOp.Filter f -> {
                System.out.println("フィルタ（" + f.category() + "）:");
                products.stream()
                    .filter(p -> p.category().equals(f.category()))
                    .forEach(System.out::println);
            }
            case StreamOp.Map m -> {
                System.out.println("マッピング:");
                products.stream()
                    .map(m.fn())
                    .forEach(System.out::println);
            }
            case StreamOp.Group g -> {
                System.out.println("グルーピング:");
                var byCategory = products.stream()
                    .collect(Collectors.groupingBy(Product::category));
                byCategory.forEach((cat, items) ->
                    System.out.println("  " + cat + ": " + items));
            }
        }
    }

    public static void main(String[] args) {
        var products = List.of(
            new Product("ノートPC", "電子機器", 80000),
            new Product("マウス", "電子機器", 3000),
            new Product("コーヒー", "食品", 500),
            new Product("紅茶", "食品", 400),
            new Product("キーボード", "電子機器", 8000),
            new Product("スナック", "食品", 200)
        );

        System.out.println("=== sealed interface + switch パターンマッチング ===");

        // Filter 操作
        applyOp(products, new StreamOp.Filter("電子機器"));

        // Map 操作
        applyOp(products, new StreamOp.Map(p -> p.name() + " - " + p.price() + "円"));

        // Group 操作
        applyOp(products, new StreamOp.Group());

        System.out.println("\n=== filter() + Predicate ===");
        var isElectronics = (Predicate<Product>) p -> p.category().equals("電子機器");
        var isExpensive = (Predicate<Product>) p -> p.price() >= 5000;

        products.stream()
            .filter(isElectronics.and(isExpensive))
            .forEach(System.out::println);

        System.out.println("\n=== Stream.generate() + Supplier ===");
        var randomInt = (Supplier<Integer>) () -> (int)(Math.random() * 100);
        var randoms = Stream.generate(randomInt)
            .limit(5)
            .collect(Collectors.toList());
        System.out.println("乱数5件: " + randoms);

        System.out.println("\n=== mapToInt() でカテゴリ別合計 ===");
        var totalElectronics = products.stream()
            .filter(isElectronics)
            .mapToInt(Product::price)
            .sum();
        System.out.println("電子機器合計: " + totalElectronics + "円");
    }
}
