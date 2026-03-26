import java.util.Arrays;
import java.util.List;
import java.util.function.*;
import java.util.stream.*;

public class FunctionCompositionSample {

    public static void main(String[] args) {
        System.out.println("=== Function.andThen(): f → g の順序合成 ===");
        Function<String, String> trim = String::trim;
        Function<String, String> toUpper = String::toUpperCase;
        Function<String, Integer> length = String::length;

        // trim してから toUpper
        Function<String, String> trimThenUpper = trim.andThen(toUpper);
        System.out.println(trimThenUpper.apply("  hello  ")); // HELLO

        // trim → toUpper → length の3段合成
        Function<String, Integer> pipeline = trim.andThen(toUpper).andThen(length);
        System.out.println(pipeline.apply("  hello  ")); // 5

        System.out.println("\n=== Function.compose(): g → f の逆順合成 ===");
        // compose は f.compose(g) = f(g(x)) つまり g を先に適用
        Function<String, String> upperThenTrim = toUpper.compose(trim);
        System.out.println(upperThenTrim.apply("  world  ")); // WORLD（trim してから upper）

        System.out.println("\n=== Predicate.and() / or() / negate() ===");
        Predicate<Integer> isPositive = n -> n > 0;
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isSmall = n -> n < 100;

        Predicate<Integer> isPositiveEven = isPositive.and(isEven);
        Predicate<Integer> isPositiveOrEven = isPositive.or(isEven);
        Predicate<Integer> isNotPositive = isPositive.negate();

        List<Integer> numbers = Arrays.asList(-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6);

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
        Consumer<String> log = s -> System.out.print("[LOG] " + s);
        Consumer<String> audit = s -> System.out.print(" [AUDIT] " + s);

        Consumer<String> logAndAudit = log.andThen(audit);
        logAndAudit.accept("処理完了");
        System.out.println();

        System.out.println("\n=== 実用例: バリデーションパイプライン ===");
        Function<String, String> trimFn = String::trim;
        Function<String, String> toLowerCase = String::toLowerCase;
        Predicate<String> notEmpty = s -> !s.isEmpty();
        Predicate<String> isEmail = s -> s.contains("@");

        Function<String, String> normalize = trimFn.andThen(toLowerCase);
        Predicate<String> isValidEmail = notEmpty.and(isEmail);

        List<String> inputs = Arrays.asList(" Test@Example.COM ", "invalid", "  ", "user@test.com");
        for (String input : inputs) {
            String normalized = normalize.apply(input);
            boolean valid = isValidEmail.test(normalized);
            System.out.println(input.trim() + " → " + normalized + " → valid=" + valid);
        }
    }
}
