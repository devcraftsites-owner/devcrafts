import java.util.List;
import java.util.function.*;
import java.util.stream.*;

public class FunctionCompositionSample {

    public static void main(String[] args) {
        System.out.println("=== Function.andThen(): f → g の順序合成 ===");
        // var で型推論
        var trim = (Function<String, String>) String::trim;
        var toUpper = (Function<String, String>) String::toUpperCase;
        var length = (Function<String, Integer>) String::length;

        // trim してから toUpper
        var trimThenUpper = trim.andThen(toUpper);
        System.out.println(trimThenUpper.apply("  hello  ")); // HELLO

        // trim → toUpper → length の3段合成
        var pipeline = trim.andThen(toUpper).andThen(length);
        System.out.println(pipeline.apply("  hello  ")); // 5

        System.out.println("\n=== Function.compose(): g → f の逆順合成 ===");
        // compose は f.compose(g) = f(g(x)) つまり g を先に適用
        var upperThenTrim = toUpper.compose(trim);
        System.out.println(upperThenTrim.apply("  world  ")); // WORLD（trim してから upper）

        System.out.println("\n=== Predicate.and() / or() / negate() ===");
        var isPositive = (Predicate<Integer>) n -> n > 0;
        var isEven = (Predicate<Integer>) n -> n % 2 == 0;

        var isPositiveEven = isPositive.and(isEven);
        var isPositiveOrEven = isPositive.or(isEven);
        var isNotPositive = isPositive.negate();

        // List.of() で不変リストを作成
        var numbers = List.of(-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6);

        System.out.print("正の偶数: ");
        numbers.stream().filter(isPositiveEven).forEach(n -> System.out.print(n + " "));
        System.out.println();

        System.out.print("正または偶数: ");
        numbers.stream().filter(isPositiveOrEven).forEach(n -> System.out.print(n + " "));
        System.out.println();

        System.out.print("正でない: ");
        numbers.stream().filter(isNotPositive).forEach(n -> System.out.print(n + " "));
        System.out.println();

        System.out.println("\n=== Consumer.andThen(): 複数の副作用を連結 ===");
        var log = (Consumer<String>) s -> System.out.print("[LOG] " + s);
        var audit = (Consumer<String>) s -> System.out.print(" [AUDIT] " + s);

        var logAndAudit = log.andThen(audit);
        logAndAudit.accept("処理完了");
        System.out.println();

        System.out.println("\n=== 実用例: バリデーションパイプライン ===");
        var trimFn = (Function<String, String>) String::trim;
        var toLowerCase = (Function<String, String>) String::toLowerCase;
        var notEmpty = (Predicate<String>) s -> !s.isEmpty();
        var isEmail = (Predicate<String>) s -> s.contains("@");

        var normalize = trimFn.andThen(toLowerCase);
        var isValidEmail = notEmpty.and(isEmail);

        // List.of() で入力リストを作成
        var inputs = List.of(" Test@Example.COM ", "invalid", "  ", "user@test.com");
        for (var input : inputs) {
            var normalized = normalize.apply(input);
            var valid = isValidEmail.test(normalized);
            System.out.println(input.trim() + " → " + normalized + " → valid=" + valid);
        }
    }
}
