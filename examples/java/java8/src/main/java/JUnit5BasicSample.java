public class JUnit5BasicSample {

    // テスト対象クラス（実際は本番コード）
    static class Calculator {
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
     *     @BeforeEach  // 各テストメソッドの前に実行
     *     void setUp() {
     *         calc = new Calculator();
     *     }
     *
     *     @Test
     *     @DisplayName("正の数の加算が正しく計算される")
     *     void testAddPositive() {
     *         // Given-When-Then パターン
     *         int result = calc.add(3, 5);
     *         assertEquals(8, result, "3 + 5 は 8 のはず");
     *     }
     *
     *     @Test
     *     @DisplayName("ゼロ除算で ArithmeticException が発生する")
     *     void testDivideByZero() {
     *         assertThrows(ArithmeticException.class,
     *             () -> calc.divide(10, 0),
     *             "0除算は例外を投げるはず");
     *     }
     *
     *     @ParameterizedTest
     *     @CsvSource({ "1,2,3", "0,0,0", "-1,1,0", "100,200,300" })
     *     @DisplayName("様々な値の加算テスト")
     *     void testAddParameterized(int a, int b, int expected) {
     *         assertEquals(expected, calc.add(a, b));
     *     }
     *
     *     @Test
     *     @DisplayName("複数のアサーションをまとめて検証")
     *     void testMultipleAssertions() {
     *         assertAll("加算と減算の検証",
     *             () -> assertEquals(8,  calc.add(3, 5)),
     *             () -> assertEquals(-2, calc.subtract(3, 5)),
     *             () -> assertEquals(15, calc.multiply(3, 5))
     *         );
     *     }
     *
     *     @AfterEach  // 各テストメソッドの後に実行
     *     void tearDown() {
     *         // テスト後のクリーンアップ（必要な場合）
     *         calc = null;
     *     }
     * }
     */

    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println("=== Calculator のテスト（JUnit 5 サンプル） ===");
        System.out.println("add(3, 5) = " + calc.add(3, 5));
        System.out.println("subtract(10, 3) = " + calc.subtract(10, 3));
        System.out.println("multiply(4, 5) = " + calc.multiply(4, 5));
        System.out.println("divide(10, 2) = " + calc.divide(10, 2));
        try {
            calc.divide(10, 0);
        } catch (ArithmeticException e) {
            System.out.println("divide(10, 0) → 例外: " + e.getMessage());
        }
        System.out.println("\n上記コードのテストは CalculatorTest.java（JUnit 5）で確認してください");
    }
}
