import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class StreamApiSample {

    // Java 16+: record を使ってデータクラスを定義
    record Product(String name, int price, String category) {}

    public static void main(String[] args) {

        List<String> names = List.of("Alice", "Bob", "Charlie", "Alice", "Dave", "Bob");
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // ① filter
        List<Integer> evens = numbers.stream()
                .filter(n -> n % 2 == 0)
                .collect(Collectors.toList());
        System.out.println("偶数: " + evens);

        // ② map
        List<String> upper = names.stream()
                .map(String::toUpperCase) // メソッド参照
                .distinct()
                .collect(Collectors.toList());
        System.out.println("大文字（重複排除）: " + upper);

        // ③ sorted + distinct
        List<String> sortedNames = names.stream()
                .distinct()
                .sorted()
                .toList(); // Java 16+: collect(Collectors.toUnmodifiableList()) の簡略形
        System.out.println("ソート済み: " + sortedNames);

        // ④ flatMap
        List<List<Integer>> nested = List.of(
                List.of(1, 2, 3),
                List.of(4, 5),
                List.of(6, 7, 8)
        );
        List<Integer> flat = nested.stream()
                .flatMap(List::stream)
                .toList(); // Java 16+
        System.out.println("flatMap: " + flat);

        // ⑤ joining
        String joined = names.stream()
                .distinct()
                .sorted()
                .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("joining: " + joined);

        // ⑥ groupingBy（record を使った例）
        List<Product> products = List.of(
                new Product("apple",  100, "fruit"),
                new Product("banana", 150, "fruit"),
                new Product("milk",   200, "dairy"),
                new Product("bread",  120, "bakery")
        );

        Map<String, List<Product>> byCategory = products.stream()
                .collect(Collectors.groupingBy(Product::category));
        byCategory.forEach((cat, prods) -> {
            System.out.println(cat + ": " + prods.stream()
                    .map(Product::name).collect(Collectors.joining(", ")));
        });

        // ⑦ 集計
        int totalPrice = products.stream()
                .mapToInt(Product::price)
                .sum();
        System.out.println("合計金額: " + totalPrice);

        double avgPrice = products.stream()
                .collect(Collectors.averagingInt(Product::price));
        System.out.println("平均金額: " + avgPrice);

        // ⑧ Optional を返す終端操作
        Optional<Product> cheapest = products.stream()
                .min((a, b) -> Integer.compare(a.price(), b.price()));
        System.out.println("最安値: " + cheapest.map(Product::name).orElse("なし"));
    }
}
