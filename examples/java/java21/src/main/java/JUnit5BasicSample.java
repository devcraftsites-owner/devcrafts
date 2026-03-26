public class JUnit5BasicSample {

    // Java 21: switch 式で演算を切り替える Calculator
    enum Operation { ADD, SUBTRACT, MULTIPLY, DIVIDE }

    static class Calculator {
        int calculate(int a, int b, Operation op) {
            return switch (op) {
                case ADD      -> a + b;
                case SUBTRACT -> a - b;
                case MULTIPLY -> a * b;
                case DIVIDE   -> {
                    if (b == 0) {
                        throw new ArithmeticException("0除算はできません");
                    }
                    yield a / b;
                }
            };
        }

        int add(int a, int b)      { return calculate(a, b, Operation.ADD); }
        int subtract(int a, int b) { return calculate(a, b, Operation.SUBTRACT); }
        int multiply(int a, int b) { return calculate(a, b, Operation.MULTIPLY); }
        int divide(int a, int b)   { return calculate(a, b, Operation.DIVIDE); }
    }

    /*
     * JUnit 5 テストクラスのサンプル（src/test/java/CalculatorTest.java）
     * Java 21 版: @TestFactory で動的テストを生成
     *
     * import org.junit.jupiter.api.*;
     * import org.junit.jupiter.api.DynamicTest;
     * import org.junit.jupiter.params.ParameterizedTest;
     * import org.junit.jupiter.params.provider.CsvSource;
     * import java.util.stream.Stream;
     * import static org.junit.jupiter.api.Assertions.*;
     * import static org.junit.jupiter.api.DynamicTest.dynamicTest;
     *
     * class CalculatorTest {
     *
     *     private Calculator calc;
     *
     *     @BeforeEach
     *     void setUp() {
     *         calc = new Calculator();
     *     }
     *
     *     // @TestFactory で動的テストを生成（Java 21 の switch 式と相性が良い）
     *     @TestFactory
     *     @DisplayName("全演算の動的テスト")
     *     Stream<DynamicTest> dynamicOperationTests() {
     *         // テストデータ: {a, b, op, expected}
     *         record TestCase(int a, int b, Operation op, int expected) {}
     *         var cases = java.util.List.of(
     *             new TestCase(3, 5, Operation.ADD,      8),
     *             new TestCase(10, 3, Operation.SUBTRACT, 7),
     *             new TestCase(4, 5, Operation.MULTIPLY, 20),
     *             new TestCase(10, 2, Operation.DIVIDE,   5)
     *         );
     *         return cases.stream().map(tc ->
     *             dynamicTest(tc.op() + "(" + tc.a() + ", " + tc.b() + ") == " + tc.expected(),
     *                 () -> assertEquals(tc.expected(), calc.calculate(tc.a(), tc.b(), tc.op())))
     *         );
     *     }
     *
     *     @Test
     *     @DisplayName("ゼロ除算で ArithmeticException が発生する")
     *     void divideByZero() {
     *         assertThrows(ArithmeticException.class,
     *             () -> calc.divide(10, 0));
     *     }
     *
     *     @ParameterizedTest
     *     @CsvSource({ "1,2,3", "0,0,0", "-1,1,0", "100,200,300" })
     *     @DisplayName("加算パラメータ化テスト")
     *     void addParameterized(int a, int b, int expected) {
     *         assertEquals(expected, calc.add(a, b));
     *     }
     *
     *     @AfterEach
     *     void tearDown() {
     *         calc = null;
     *     }
     * }
     */

    public static void main(String[] args) {
        var calc = new Calculator();
        System.out.println("=== Calculator のテスト（JUnit 5 + Java 21 サンプル） ===");
        System.out.println("add(3, 5) = " + calc.add(3, 5));
        System.out.println("subtract(10, 3) = " + calc.subtract(10, 3));
        System.out.println("multiply(4, 5) = " + calc.multiply(4, 5));
        System.out.println("divide(10, 2) = " + calc.divide(10, 2));

        // switch 式で全演算をテスト
        System.out.println("\n=== switch 式で全演算 ===");
        for (var op : Operation.values()) {
            try {
                int result = calc.calculate(10, 3, op);
                System.out.println(op + "(10, 3) = " + result);
            } catch (ArithmeticException e) {
                System.out.println(op + "(10, 0) → 例外: " + e.getMessage());
            }
        }

        try {
            calc.divide(10, 0);
        } catch (ArithmeticException e) {
            System.out.println("divide(10, 0) → 例外: " + e.getMessage());
        }
        System.out.println("\nJava 21 版: switch 式で演算を切り替え、@TestFactory で動的テストを生成できます");
    }
}
