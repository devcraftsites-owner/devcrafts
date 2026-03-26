public class InterpreterPatternSample {

    // sealed interface で式の種類を型安全に限定する（Java 17+）
    sealed interface Expression
            permits NumberExpression, AddExpression, SubtractExpression,
                    MultiplyExpression, DivideExpression {
    }

    // 終端式（Terminal Expression）: 数値リテラルを record で定義
    record NumberExpression(int value) implements Expression {}

    // 非終端式: 加算を record で定義
    record AddExpression(Expression left, Expression right) implements Expression {}

    // 非終端式: 減算を record で定義
    record SubtractExpression(Expression left, Expression right) implements Expression {}

    // 非終端式: 乗算を record で定義
    record MultiplyExpression(Expression left, Expression right) implements Expression {}

    // 非終端式: 除算を record で定義
    record DivideExpression(Expression left, Expression right) implements Expression {}

    // switch パターンマッチングで式を評価する（Java 21+）
    // sealed interface + record により、コンパイラが網羅性を保証する
    static int interpret(Expression expr) {
        return switch (expr) {
            case NumberExpression(var value) -> value;
            case AddExpression(var left, var right) -> interpret(left) + interpret(right);
            case SubtractExpression(var left, var right) -> interpret(left) - interpret(right);
            case MultiplyExpression(var left, var right) -> interpret(left) * interpret(right);
            case DivideExpression(var left, var right) -> {
                int divisor = interpret(right);
                if (divisor == 0) {
                    throw new ArithmeticException("ゼロ除算は許可されていません");
                }
                yield interpret(left) / divisor;
            }
        };
    }

    // switch パターンマッチングで式を文字列に変換する（Java 21+）
    static String toFormula(Expression expr) {
        return switch (expr) {
            case NumberExpression(var value) -> String.valueOf(value);
            case AddExpression(var left, var right) ->
                "(" + toFormula(left) + " + " + toFormula(right) + ")";
            case SubtractExpression(var left, var right) ->
                "(" + toFormula(left) + " - " + toFormula(right) + ")";
            case MultiplyExpression(var left, var right) ->
                "(" + toFormula(left) + " * " + toFormula(right) + ")";
            case DivideExpression(var left, var right) ->
                "(" + toFormula(left) + " / " + toFormula(right) + ")";
        };
    }

    public static void main(String[] args) {
        System.out.println("=== Interpreter パターン（Java 21: switch パターンマッチング）===");

        // (3 + 5) * 2 - 4 を式ツリーで表現する
        var expr = new SubtractExpression(
            new MultiplyExpression(
                new AddExpression(
                    new NumberExpression(3),
                    new NumberExpression(5)
                ),
                new NumberExpression(2)
            ),
            new NumberExpression(4)
        );

        System.out.println("式: " + toFormula(expr));
        System.out.println("結果: " + interpret(expr));
        // 期待値: (3 + 5) * 2 - 4 = 12

        System.out.println();

        // シンプルな加算: 10 + 20
        var simple = new AddExpression(
            new NumberExpression(10),
            new NumberExpression(20)
        );
        System.out.println("式: " + toFormula(simple));
        System.out.println("結果: " + interpret(simple));
        // 期待値: 10 + 20 = 30

        System.out.println();

        // 除算を含む式: (100 - 40) / 6
        var divExpr = new DivideExpression(
            new SubtractExpression(
                new NumberExpression(100),
                new NumberExpression(40)
            ),
            new NumberExpression(6)
        );
        System.out.println("式: " + toFormula(divExpr));
        System.out.println("結果: " + interpret(divExpr));
        // 期待値: (100 - 40) / 6 = 10

        System.out.println();

        // record のデコンストラクションパターン活用例
        System.out.println("=== record デコンストラクション（Java 21+）===");
        Expression e = new AddExpression(new NumberExpression(7), new NumberExpression(3));
        if (e instanceof AddExpression(var left, var right)) {
            // record のフィールドを直接取り出せる
            System.out.println("加算式の左辺: " + toFormula(left) + ", 右辺: " + toFormula(right));
        }

        // sealed + switch により、全ケース網羅をコンパイラが保証する
        System.out.println();
        System.out.println("=== 式の再利用 ===");
        var base = new AddExpression(
            new NumberExpression(5),
            new NumberExpression(3)
        );
        var doubled = new MultiplyExpression(base, new NumberExpression(2));
        System.out.println("base = " + toFormula(base) + " = " + interpret(base));
        System.out.println("doubled = " + toFormula(doubled) + " = " + interpret(doubled));
    }
}
