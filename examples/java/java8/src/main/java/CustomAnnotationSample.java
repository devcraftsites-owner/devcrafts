import java.lang.annotation.*;
import java.lang.reflect.Method;

public class CustomAnnotationSample {

    // カスタムアノテーション定義
    // @Retention: アノテーションをいつまで保持するか
    //   RUNTIME  → 実行時にリフレクションで取得可能（今回のケース）
    //   CLASS    → .class ファイルに残るが実行時取得不可
    //   SOURCE   → コンパイル時のみ（コード生成ツール用）
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD) // メソッドにのみ付与可能
    @interface TestCase {
        String description() default "テストケース";
        int priority() default 1; // 優先度（1=高、2=中、3=低）
    }

    // バリデーション用アノテーション
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.FIELD) // フィールドにのみ付与可能
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

    // アノテーションを処理するテストランナー（JUnit の仕組みの簡易版）
    static void runTests(Class<?> testClass) throws Exception {
        System.out.println("=== テスト実行: " + testClass.getSimpleName() + " ===");
        Object instance = testClass.getDeclaredConstructor().newInstance();

        for (Method method : testClass.getDeclaredMethods()) {
            if (method.isAnnotationPresent(TestCase.class)) {
                TestCase annotation = method.getAnnotation(TestCase.class);
                System.out.println("[Priority " + annotation.priority() + "] "
                        + method.getName() + " - " + annotation.description());
                method.invoke(instance);
            }
        }
    }

    // フィールドアノテーションのバリデーション
    static class User {
        @NotNull(message = "ユーザー名は必須です")
        String username;

        String email; // アノテーションなし

        User(String username, String email) {
            this.username = username;
            this.email = email;
        }
    }

    static void validate(Object obj) throws IllegalAccessException {
        for (java.lang.reflect.Field field : obj.getClass().getDeclaredFields()) {
            if (field.isAnnotationPresent(NotNull.class)) {
                field.setAccessible(true);
                Object value = field.get(obj);
                NotNull annotation = field.getAnnotation(NotNull.class);
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

        // バリデーションの実行
        System.out.println("=== バリデーション ===");
        validate(new User("田中太郎", "taro@example.com"));
        validate(new User(null, "taro@example.com"));
    }
}
