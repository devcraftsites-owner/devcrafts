import java.util.List;
import java.util.function.*;
import java.util.stream.*;

public class FunctionCompositionSample {

    // Java 21: sealed interface で合成デモの種類を型安全に表現
    sealed interface CompositionDemo permits CompositionDemo.AndThen, CompositionDemo.Compose, CompositionDemo.PredicateDemo {
        record AndThen(String input) implements CompositionDemo {}
        record Compose(String input) implements CompositionDemo {}
        record PredicateDemo(int number) implements CompositionDemo {}
    }

    // switch パターンマッチングで各デモを実行（Java 21+）
    static void runDemo(CompositionDemo demo) {
        switch (demo) {
            case CompositionDemo.AndThen a -> {
                var trim = (Function<String, String>) String::trim;
                var toUpper = (Function<String, String>) String::toUpperCase;
                var trimThenUpper = trim.andThen(toUpper);
                System.out.println("andThen: \"" + a.input() + "\" → \"" + trimThenUpper.apply(a.input()) + "\"");
            }
            case CompositionDemo.Compose c -> {
                var trim = (Function<String, String>) String::trim;
                var toUpper = (Function<String, String>) String::toUpperCase;
                // toUpper.compose(trim) = toUpper(trim(x)) = trim してから toUpper
                var result = toUpper.compose(trim).apply(c.input());
                System.out.println("compose: \"" + c.input() + "\" → \"" + result + "\"");
            }
            case CompositionDemo.PredicateDemo p -> {
                var isPositive = (Predicate<Integer>) n -> n > 0;
                var isEven = (Predicate<Integer>) n -> n % 2 == 0;
                var isPositiveEven = isPositive.and(isEven);
                System.out.println("Predicate: " + p.number()
                    + " → 正=" + isPositive.test(p.number())
                    + ", 偶数=" + isEven.test(p.number())
                    + ", 正の偶数=" + isPositiveEven.test(p.number()));
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== sealed interface + switch パターンマッチング ===");

        var demos = List.of(
            new CompositionDemo.AndThen("  hello  "),
            new CompositionDemo.Compose("  world  "),
            new CompositionDemo.PredicateDemo(4),
            new CompositionDemo.PredicateDemo(-3),
            new CompositionDemo.PredicateDemo(7)
        );

        for (var demo : demos) {
            runDemo(demo);
        }

        System.out.println("\n=== Function.andThen(): f → g の順序合成 ===");
        var trim = (Function<String, String>) String::trim;
        var toUpper = (Function<String, String>) String::toUpperCase;
        var length = (Function<String, Integer>) String::length;

        var trimThenUpper = trim.andThen(toUpper);
        System.out.println(trimThenUpper.apply("  hello  ")); // HELLO

        var pipeline = trim.andThen(toUpper).andThen(length);
        System.out.println(pipeline.apply("  hello  ")); // 5

        System.out.println("\n=== Predicate.and() / or() / negate() ===");
        var isPositive = (Predicate<Integer>) n -> n > 0;
        var isEven = (Predicate<Integer>) n -> n % 2 == 0;

        var isPositiveEven = isPositive.and(isEven);
        var isPositiveOrEven = isPositive.or(isEven);
        var isNotPositive = isPositive.negate();

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

        var inputs = List.of(" Test@Example.COM ", "invalid", "  ", "user@test.com");
        for (var input : inputs) {
            var normalized = normalize.apply(input);
            var valid = isValidEmail.test(normalized);
            System.out.println(input.trim() + " → " + normalized + " → valid=" + valid);
        }
    }
}
