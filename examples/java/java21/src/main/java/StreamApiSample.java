import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class StreamApiSample {

    record Product(String name, int price, String category) {}

    public static void main(String[] args) {

        List<String> names = List.of("Alice", "Bob", "Charlie", "Alice", "Dave", "Bob");
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // ① filter + toList（Java 16+: collect(toUnmodifiableList()) の簡略形）
        List<Integer> evens = numbers.stream()
                .filter(n -> n % 2 == 0)
                .toList(); // Java 16+
        System.out.println("偶数: " + evens);

        // ② map + distinct + sorted + toList
        List<String> sortedNames = names.stream()
                .distinct()
                .sorted()
                .toList();
        System.out.println("ソート済み: " + sortedNames);

        // ③ flatMap
        List<List<Integer>> nested = List.of(
                List.of(1, 2, 3), List.of(4, 5), List.of(6, 7, 8));
        List<Integer> flat = nested.stream().flatMap(List::stream).toList();
        System.out.println("flatMap: " + flat);

        // ④ joining
        String joined = names.stream().distinct().sorted()
                .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("joining: " + joined);

        // ⑤ groupingBy（record を使った例）
        List<Product> products = List.of(
                new Product("apple",  100, "fruit"),
                new Product("banana", 150, "fruit"),
                new Product("milk",   200, "dairy"),
                new Product("bread",  120, "bakery")
        );

        Map<String, List<String>> byCategory = products.stream()
                .collect(Collectors.groupingBy(
                        Product::category,
                        Collectors.mapping(Product::name, Collectors.toList())
                ));
        byCategory.forEach((cat, prods) ->
                System.out.println(cat + ": " + prods));

        // ⑥ 集計
        int total = products.stream().mapToInt(Product::price).sum();
        System.out.println("合計金額: " + total);

        // ⑦ Optional を返す終端操作
        Optional<Product> cheapest = products.stream()
                .min(java.util.Comparator.comparingInt(Product::price));
        System.out.println("最安値: " + cheapest.map(Product::name).orElse("なし"));

        // ⑧ Java 21: switch 式と Stream を組み合わせた分類
        products.stream().forEach(p -> {
            String label = switch (p.category()) {
                case "fruit" -> "食品（果物）";
                case "dairy" -> "食品（乳製品）";
                default -> "その他";
            };
            System.out.println(p.name() + ": " + label);
        });
    }
}
