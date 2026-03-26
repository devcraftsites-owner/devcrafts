public class JUnit5BasicSample {

    // Java 17: record で不変な Calculator を定義
    // （インターフェースを経由してメソッドを呼び出す設計）
    record Calculator() {
        int add(int a, int b) { return a + b; }
        int subtract(int a, int b) { return a - b; }
        int multiply(int a, int b) { return a * b; }
        int divide(int a, int b) {
            if (b == 0) {
                throw new ArithmeticException("0除算はできません");
            }
            return a / b;
        }
    }

    /*
     * JUnit 5 テストクラスのサンプル（src/test/java/CalculatorTest.java）
     * Java 17 版: @Nested でテストを構造化
     *
     * import org.junit.jupiter.api.*;
     * import org.junit.jupiter.params.ParameterizedTest;
     * import org.junit.jupiter.params.provider.CsvSource;
     * import static org.junit.jupiter.api.Assertions.*;
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
     *     // @Nested でテストをグループ化（Java 17 の record との相性が良い）
     *     @Nested
     *     @DisplayName("加算テスト")
     *     class AddTests {
     *         @Test
     *         @DisplayName("正の数の加算")
     *         void addPositive() {
     *             assertEquals(8, calc.add(3, 5));
     *         }
     *
     *         @Test
     *         @DisplayName("負の数を含む加算")
     *         void addNegative() {
     *             assertEquals(-2, calc.add(-5, 3));
     *         }
     *
     *         @ParameterizedTest
     *         @CsvSource({ "1,2,3", "0,0,0", "-1,1,0", "100,200,300" })
     *         @DisplayName("様々な値の加算テスト")
     *         void addParameterized(int a, int b, int expected) {
     *             assertEquals(expected, calc.add(a, b));
     *         }
     *     }
     *
     *     @Nested
     *     @DisplayName("除算テスト")
     *     class DivideTests {
     *         @Test
     *         @DisplayName("正常な除算")
     *         void divideNormal() {
     *             assertEquals(5, calc.divide(10, 2));
     *         }
     *
     *         @Test
     *         @DisplayName("ゼロ除算で ArithmeticException が発生する")
     *         void divideByZero() {
     *             assertThrows(ArithmeticException.class,
     *                 () -> calc.divide(10, 0));
     *         }
     *     }
     *
     *     @AfterEach
     *     void tearDown() {
     *         // テスト後のクリーンアップ
     *     }
     * }
     */

    public static void main(String[] args) {
        var calc = new Calculator();
        System.out.println("=== Calculator のテスト（JUnit 5 + Java 17 サンプル） ===");
        System.out.println("add(3, 5) = " + calc.add(3, 5));
        System.out.println("subtract(10, 3) = " + calc.subtract(10, 3));
        System.out.println("multiply(4, 5) = " + calc.multiply(4, 5));
        System.out.println("divide(10, 2) = " + calc.divide(10, 2));
        try {
            calc.divide(10, 0);
        } catch (ArithmeticException e) {
            System.out.println("divide(10, 0) → 例外: " + e.getMessage());
        }
        System.out.println("\nJava 17 版: record で Calculator を不変に定義");
        System.out.println("@Nested アノテーションでテストを構造化できます");
    }
}
