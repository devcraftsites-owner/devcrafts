public class InterpreterPatternSample {

    // sealed interface で式の種類を型安全に限定する（Java 17+）
    sealed interface Expression
            permits NumberExpression, AddExpression, SubtractExpression,
                    MultiplyExpression, DivideExpression {
        int interpret();
    }

    // 終端式（Terminal Expression）: 数値リテラルを record で定義（Java 17+）
    record NumberExpression(int value) implements Expression {
        @Override
        public int interpret() {
            // 数値そのものを返す
            return value;
        }
    }

    // 非終端式: 加算を record で定義
    record AddExpression(Expression left, Expression right) implements Expression {
        @Override
        public int interpret() {
            // 左辺と右辺の評価結果を足し合わせる
            return left.interpret() + right.interpret();
        }
    }

    // 非終端式: 減算を record で定義
    record SubtractExpression(Expression left, Expression right) implements Expression {
        @Override
        public int interpret() {
            // 左辺から右辺の評価結果を引く
            return left.interpret() - right.interpret();
        }
    }

    // 非終端式: 乗算を record で定義
    record MultiplyExpression(Expression left, Expression right) implements Expression {
        @Override
        public int interpret() {
            // 左辺と右辺の評価結果を掛け合わせる
            return left.interpret() * right.interpret();
        }
    }

    // 非終端式: 除算を record で定義（コンパクトコンストラクタでバリデーション）
    record DivideExpression(Expression left, Expression right) implements Expression {
        @Override
        public int interpret() {
            int divisor = right.interpret();
            if (divisor == 0) {
                throw new ArithmeticException("ゼロ除算は許可されていません");
            }
            // 左辺を右辺で割る（整数除算）
            return left.interpret() / divisor;
        }
    }

    // 式ツリーを文字列で表現するユーティリティ（Java 17: instanceof パターンマッチング）
    static String toFormula(Expression expr) {
        if (expr instanceof NumberExpression num) {
            return String.valueOf(num.value());
        } else if (expr instanceof AddExpression add) {
            return "(" + toFormula(add.left()) + " + " + toFormula(add.right()) + ")";
        } else if (expr instanceof SubtractExpression sub) {
            return "(" + toFormula(sub.left()) + " - " + toFormula(sub.right()) + ")";
        } else if (expr instanceof MultiplyExpression mul) {
            return "(" + toFormula(mul.left()) + " * " + toFormula(mul.right()) + ")";
        } else if (expr instanceof DivideExpression div) {
            return "(" + toFormula(div.left()) + " / " + toFormula(div.right()) + ")";
        }
        return "?";
    }

    public static void main(String[] args) {
        System.out.println("=== Interpreter パターン（Java 17: sealed interface + record）===");

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
        System.out.println("結果: " + expr.interpret());
        // 期待値: (3 + 5) * 2 - 4 = 12

        System.out.println();

        // シンプルな加算: 10 + 20
        var simple = new AddExpression(
            new NumberExpression(10),
            new NumberExpression(20)
        );
        System.out.println("式: " + toFormula(simple));
        System.out.println("結果: " + simple.interpret());
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
        System.out.println("結果: " + divExpr.interpret());
        // 期待値: (100 - 40) / 6 = 10

        System.out.println();

        // sealed interface により、すべての Expression のサブタイプが明示的に管理される
        System.out.println("=== sealed interface の型安全性 ===");
        // コンパイラが permits リストを網羅チェックしてくれる
        System.out.println("sealed interface で許可された型: NumberExpression, AddExpression,");
        System.out.println("  SubtractExpression, MultiplyExpression, DivideExpression");

        // 式の再利用
        var base = new AddExpression(
            new NumberExpression(5),
            new NumberExpression(3)
        );
        var doubled = new MultiplyExpression(base, new NumberExpression(2));
        System.out.println();
        System.out.println("base = " + toFormula(base) + " = " + base.interpret());
        System.out.println("doubled = " + toFormula(doubled) + " = " + doubled.interpret());
    }
}
