import java.util.ArrayList;
import java.util.List;

public class InterpreterPatternSample {

    // 抽象式（Abstract Expression）: 式を評価するインターフェース
    interface Expression {
        int interpret();
    }

    // 終端式（Terminal Expression）: 数値リテラルを表す
    static class NumberExpression implements Expression {
        private final int value;

        NumberExpression(int value) {
            this.value = value;
        }

        @Override
        public int interpret() {
            // 数値そのものを返す
            return value;
        }
    }

    // 非終端式（Non-terminal Expression）: 加算を表す
    static class AddExpression implements Expression {
        private final Expression left;
        private final Expression right;

        AddExpression(Expression left, Expression right) {
            this.left = left;
            this.right = right;
        }

        @Override
        public int interpret() {
            // 左辺と右辺の評価結果を足し合わせる
            return left.interpret() + right.interpret();
        }
    }

    // 非終端式: 減算を表す
    static class SubtractExpression implements Expression {
        private final Expression left;
        private final Expression right;

        SubtractExpression(Expression left, Expression right) {
            this.left = left;
            this.right = right;
        }

        @Override
        public int interpret() {
            // 左辺から右辺の評価結果を引く
            return left.interpret() - right.interpret();
        }
    }

    // 非終端式: 乗算を表す
    static class MultiplyExpression implements Expression {
        private final Expression left;
        private final Expression right;

        MultiplyExpression(Expression left, Expression right) {
            this.left = left;
            this.right = right;
        }

        @Override
        public int interpret() {
            // 左辺と右辺の評価結果を掛け合わせる
            return left.interpret() * right.interpret();
        }
    }

    // 非終端式: 除算を表す
    static class DivideExpression implements Expression {
        private final Expression left;
        private final Expression right;

        DivideExpression(Expression left, Expression right) {
            this.left = left;
            this.right = right;
        }

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

    // 式ツリーを文字列で表現するユーティリティ
    static String toFormula(Expression expr) {
        if (expr instanceof NumberExpression) {
            NumberExpression num = (NumberExpression) expr;
            return String.valueOf(num.interpret());
        } else if (expr instanceof AddExpression) {
            AddExpression add = (AddExpression) expr;
            return "(" + toFormula(add.left) + " + " + toFormula(add.right) + ")";
        } else if (expr instanceof SubtractExpression) {
            SubtractExpression sub = (SubtractExpression) expr;
            return "(" + toFormula(sub.left) + " - " + toFormula(sub.right) + ")";
        } else if (expr instanceof MultiplyExpression) {
            MultiplyExpression mul = (MultiplyExpression) expr;
            return "(" + toFormula(mul.left) + " * " + toFormula(mul.right) + ")";
        } else if (expr instanceof DivideExpression) {
            DivideExpression div = (DivideExpression) expr;
            return "(" + toFormula(div.left) + " / " + toFormula(div.right) + ")";
        }
        return "?";
    }

    public static void main(String[] args) {
        System.out.println("=== Interpreter パターン: 四則演算インタープリター ===");

        // (3 + 5) * 2 - 4 を式ツリーで表現する
        Expression expr = new SubtractExpression(
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
        Expression simple = new AddExpression(
            new NumberExpression(10),
            new NumberExpression(20)
        );
        System.out.println("式: " + toFormula(simple));
        System.out.println("結果: " + simple.interpret());
        // 期待値: 10 + 20 = 30

        System.out.println();

        // 除算を含む式: (100 - 40) / 6
        Expression divExpr = new DivideExpression(
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

        // 変数を使った例: 複数の式を組み合わせて再利用
        System.out.println("=== 式の再利用 ===");
        Expression base = new AddExpression(
            new NumberExpression(5),
            new NumberExpression(3)
        );
        // base (= 5 + 3 = 8) を2倍にした式
        Expression doubled = new MultiplyExpression(base, new NumberExpression(2));
        // base を3倍にした式
        Expression tripled = new MultiplyExpression(base, new NumberExpression(3));

        System.out.println("base = " + toFormula(base) + " = " + base.interpret());
        System.out.println("doubled = " + toFormula(doubled) + " = " + doubled.interpret());
        System.out.println("tripled = " + toFormula(tripled) + " = " + tripled.interpret());
    }
}
