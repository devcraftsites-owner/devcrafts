import java.util.Arrays;
import java.util.List;
import java.util.function.*;

public class FunctionInterfaceSample {

    public static void main(String[] args) {
        System.out.println("=== Function<T, R>: T → R の変換 ===");
        Function<String, Integer> strLength = s -> s.length();
        Function<Integer, String> intToStr = n -> "数値: " + n;

        System.out.println(strLength.apply("Hello")); // 5
        System.out.println(intToStr.apply(42));        // 数値: 42

        // andThen で関数合成
        Function<String, String> combined = strLength.andThen(intToStr);
        System.out.println(combined.apply("Java")); // 数値: 4

        System.out.println("\n=== Consumer<T>: T → void（副作用のみ） ===");
        Consumer<String> printer = s -> System.out.println("[ログ] " + s);
        printer.accept("処理を開始しました");

        List<String> items = Arrays.asList("A", "B", "C");
        items.forEach(printer); // Consumer を forEach に渡す

        System.out.println("\n=== Supplier<T>: 引数なし → T を返す ===");
        Supplier<String> greeting = () -> "こんにちは！";
        System.out.println(greeting.get()); // こんにちは！

        // 遅延評価（呼び出すまで生成されない）
        Supplier<List<String>> listFactory = () -> Arrays.asList("x", "y", "z");
        System.out.println(listFactory.get());

        System.out.println("\n=== Predicate<T>: T → boolean（フィルタリング） ===");
        Predicate<Integer> isPositive = n -> n > 0;
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isPositiveAndEven = isPositive.and(isEven);

        System.out.println("5 は正の偶数: " + isPositiveAndEven.test(5));  // false
        System.out.println("4 は正の偶数: " + isPositiveAndEven.test(4));  // true
        System.out.println("-2 は正の偶数: " + isPositiveAndEven.test(-2)); // false

        System.out.println("\n=== BiFunction<T, U, R>: 2引数版 ===");
        BiFunction<String, Integer, String> repeat = (s, n) -> {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < n; i++) sb.append(s);
            return sb.toString();
        };
        System.out.println(repeat.apply("ab", 3)); // ababab

        System.out.println("\n=== UnaryOperator<T>: T → T（同じ型の変換） ===");
        UnaryOperator<String> toUpperCase = String::toUpperCase;
        System.out.println(toUpperCase.apply("hello")); // HELLO

        System.out.println("\n=== BinaryOperator<T>: (T, T) → T ===");
        BinaryOperator<Integer> add = (a, b) -> a + b;
        System.out.println(add.apply(3, 4)); // 7
    }
}
