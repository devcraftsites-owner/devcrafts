import java.lang.annotation.*;
import java.lang.reflect.Method;

public class CustomAnnotationSample {

    // カスタムアノテーション定義
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface TestCase {
        String description() default "テストケース";
        int priority() default 1;
    }

    // バリデーション用アノテーション
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.FIELD)
    @interface NotNull {
        String message() default "null は許可されていません";
    }

    // アノテーションを付けたクラス
    static class CalculatorTest {

        @TestCase(description = "正の数の加算", priority = 1)
        void testAddPositive() {
            int result = 3 + 5;
            System.out.println("  testAddPositive: 3 + 5 = " + result);
        }

        @TestCase(description = "ゼロの加算", priority = 2)
        void testAddZero() {
            int result = 0 + 5;
            System.out.println("  testAddZero: 0 + 5 = " + result);
        }

        void notATest() {
            System.out.println("  このメソッドはテストではありません");
        }
    }

    // バリデーション結果を型安全に表す sealed interface（Java 17+）
    sealed interface ValidationResult permits ValidationResult.Ok, ValidationResult.Error {
        record Ok(String fieldName, Object value) implements ValidationResult {}
        record Error(String fieldName, String message) implements ValidationResult {}
    }

    // Java 21: switch パターンマッチングで結果を出力
    static void printResult(ValidationResult result) {
        switch (result) {
            case ValidationResult.Ok ok ->
                System.out.println("バリデーション OK [" + ok.fieldName() + "]: " + ok.value());
            case ValidationResult.Error error ->
                System.out.println("バリデーションエラー [" + error.fieldName() + "]: " + error.message());
        }
    }

    // アノテーションを処理するテストランナー
    static void runTests(Class<?> testClass) throws Exception {
        System.out.println("=== テスト実行: " + testClass.getSimpleName() + " ===");
        var instance = testClass.getDeclaredConstructor().newInstance();

        for (var method : testClass.getDeclaredMethods()) {
            if (method.isAnnotationPresent(TestCase.class)) {
                var annotation = method.getAnnotation(TestCase.class);
                System.out.println("[Priority " + annotation.priority() + "] "
                        + method.getName() + " - " + annotation.description());
                method.invoke(instance);
            }
        }
    }

    // フィールドアノテーションのバリデーション（ValidationResult を返す）
    static class MutableUser {
        @NotNull(message = "ユーザー名は必須です")
        String username;

        String email;

        MutableUser(String username, String email) {
            this.username = username;
            this.email = email;
        }
    }

    static void validate(Object obj) throws IllegalAccessException {
        for (var field : obj.getClass().getDeclaredFields()) {
            if (field.isAnnotationPresent(NotNull.class)) {
                field.setAccessible(true);
                var value = field.get(obj);
                var annotation = field.getAnnotation(NotNull.class);
                // Java 21: バリデーション結果を sealed interface で表現
                ValidationResult result;
                if (value == null) {
                    result = new ValidationResult.Error(field.getName(), annotation.message());
                } else {
                    result = new ValidationResult.Ok(field.getName(), value);
                }
                printResult(result);
            }
        }
    }

    public static void main(String[] args) throws Exception {
        // テストランナーの実行
        runTests(CalculatorTest.class);

        System.out.println();

        // バリデーションの実行
        System.out.println("=== バリデーション（switch パターンマッチングで結果表示） ===");
        validate(new MutableUser("田中太郎", "taro@example.com"));
        validate(new MutableUser(null, "taro@example.com"));
    }
}
