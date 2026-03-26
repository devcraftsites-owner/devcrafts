import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class StreamFunctionSample {

    // Java 17: record でデータクラスを簡潔に定義
    record Product(String name, String category, int price) {
        @Override
        public String toString() {
            return name + "(" + price + "円)";
        }
    }

    public static void main(String[] args) {
        // List.of() で不変リストを作成
        var products = List.of(
            new Product("ノートPC", "電子機器", 80000),
            new Product("マウス", "電子機器", 3000),
            new Product("コーヒー", "食品", 500),
            new Product("紅茶", "食品", 400),
            new Product("キーボード", "電子機器", 8000),
            new Product("スナック", "食品", 200)
        );

        System.out.println("=== filter() + Predicate ===");
        // var で型推論
        var isElectronics = (Predicate<Product>) p -> p.category().equals("電子機器");
        var isExpensive = (Predicate<Product>) p -> p.price() >= 5000;

        products.stream()
            .filter(isElectronics.and(isExpensive))
            .forEach(System.out::println);

        System.out.println("\n=== map() + Function ===");
        var toSummary = (Function<Product, String>)
            p -> p.name() + " - " + p.price() + "円";

        products.stream()
            .map(toSummary)
            .forEach(System.out::println);

        System.out.println("\n=== forEach() + Consumer ===");
        var logProduct = (Consumer<Product>) p ->
            System.out.println("[" + p.category() + "] " + p.name());
        products.stream().forEach(logProduct);

        System.out.println("\n=== Stream.generate() + Supplier ===");
        var randomInt = (Supplier<Integer>) () -> (int)(Math.random() * 100);
        var randoms = Stream.generate(randomInt)
            .limit(5)
            .collect(Collectors.toList());
        System.out.println("乱数5件: " + randoms);

        System.out.println("\n=== collect() + groupingBy ===");
        var byCategory = products.stream()
            .collect(Collectors.groupingBy(Product::category));
        byCategory.forEach((cat, items) ->
            System.out.println(cat + ": " + items));

        System.out.println("\n=== mapToInt() でカテゴリ別合計 ===");
        var totalElectronics = products.stream()
            .filter(isElectronics)
            .mapToInt(Product::price)
            .sum();
        System.out.println("電子機器合計: " + totalElectronics + "円");
    }
}
