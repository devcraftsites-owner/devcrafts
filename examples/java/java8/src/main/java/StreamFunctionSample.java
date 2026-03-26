import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class StreamFunctionSample {

    static class Product {
        private final String name;
        private final String category;
        private final int price;

        Product(String name, String category, int price) {
            this.name = name;
            this.category = category;
            this.price = price;
        }

        public String getName() { return name; }
        public String getCategory() { return category; }
        public int getPrice() { return price; }

        @Override
        public String toString() {
            return name + "(" + price + "円)";
        }
    }

    public static void main(String[] args) {
        List<Product> products = Arrays.asList(
            new Product("ノートPC", "電子機器", 80000),
            new Product("マウス", "電子機器", 3000),
            new Product("コーヒー", "食品", 500),
            new Product("紅茶", "食品", 400),
            new Product("キーボード", "電子機器", 8000),
            new Product("スナック", "食品", 200)
        );

        System.out.println("=== filter() + Predicate ===");
        Predicate<Product> isElectronics = p -> p.getCategory().equals("電子機器");
        Predicate<Product> isExpensive = p -> p.getPrice() >= 5000;

        products.stream()
            .filter(isElectronics.and(isExpensive))
            .forEach(System.out::println);

        System.out.println("\n=== map() + Function ===");
        Function<Product, String> toSummary =
            p -> p.getName() + " - " + p.getPrice() + "円";

        products.stream()
            .map(toSummary)
            .forEach(System.out::println);

        System.out.println("\n=== forEach() + Consumer ===");
        Consumer<Product> logProduct = p ->
            System.out.println("[" + p.getCategory() + "] " + p.getName());
        products.stream().forEach(logProduct);

        System.out.println("\n=== Stream.generate() + Supplier ===");
        Supplier<Integer> randomInt = () -> (int)(Math.random() * 100);
        List<Integer> randoms = Stream.generate(randomInt)
            .limit(5)
            .collect(Collectors.toList());
        System.out.println("乱数5件: " + randoms);

        System.out.println("\n=== collect() + groupingBy ===");
        Map<String, List<Product>> byCategory = products.stream()
            .collect(Collectors.groupingBy(Product::getCategory));
        byCategory.forEach((cat, items) ->
            System.out.println(cat + ": " + items));

        System.out.println("\n=== reduce() でカテゴリ別合計 ===");
        int totalElectronics = products.stream()
            .filter(isElectronics)
            .mapToInt(Product::getPrice)
            .sum();
        System.out.println("電子機器合計: " + totalElectronics + "円");
    }
}
