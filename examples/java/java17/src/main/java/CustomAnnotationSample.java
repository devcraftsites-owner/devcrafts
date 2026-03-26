import java.lang.annotation.*;
import java.lang.reflect.Method;

public class CustomAnnotationSample {

    // カスタムアノテーション定義（Java 8 と同じ構文）
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

    // アノテーションを処理するテストランナー
    static void runTests(Class<?> testClass) throws Exception {
        System.out.println("=== テスト実行: " + testClass.getSimpleName() + " ===");
        // Java 17: var でローカル変数の型推論
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

    // Java 17: record で不変のユーザーデータを定義（Java 16+）
    // record のフィールドは final なため、バリデーションはコンストラクタで行う
    record User(String username, String email) {
        // コンパクトコンストラクタでバリデーション
        User {
            if (username == null) {
                System.out.println("バリデーションエラー [username]: ユーザー名は必須です");
            } else {
                System.out.println("バリデーション OK [username]: " + username);
            }
        }
    }

    // フィールドアノテーションのバリデーション（通常クラス向け）
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
                if (value == null) {
                    System.out.println("バリデーションエラー [" + field.getName() + "]: "
                            + annotation.message());
                } else {
                    System.out.println("バリデーション OK [" + field.getName() + "]: " + value);
                }
            }
        }
    }

    public static void main(String[] args) throws Exception {
        // テストランナーの実行
        runTests(CalculatorTest.class);

        System.out.println();

        // バリデーション（通常クラス）
        System.out.println("=== バリデーション（アノテーション使用） ===");
        validate(new MutableUser("田中太郎", "taro@example.com"));
        validate(new MutableUser(null, "taro@example.com"));

        System.out.println();

        // Java 17: record を使ったバリデーション
        System.out.println("=== バリデーション（record のコンパクトコンストラクタ） ===");
        new User("鈴木次郎", "jiro@example.com");
        new User(null, "taro@example.com");
    }
}
