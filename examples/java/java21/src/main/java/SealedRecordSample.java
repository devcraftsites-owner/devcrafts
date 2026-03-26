public class SealedRecordSample {

    // Java 21: sealed interface + record
    sealed interface Shape permits SealedRecordSample.Circle,
                                   SealedRecordSample.Rectangle,
                                   SealedRecordSample.Triangle {}

    record Circle(double radius) implements Shape {
        double area() { return Math.PI * radius * radius; }
    }

    record Rectangle(double width, double height) implements Shape {
        double area() { return width * height; }
    }

    record Triangle(double base, double height) implements Shape {
        double area() { return 0.5 * base * height; }
    }

    // Java 21: switch パターンマッチング（正式）で全バリアントを網羅チェック付きで処理
    static String describe(Shape shape) {
        return switch (shape) {
            case Circle c ->
                "円形 半径=" + c.radius() + " 面積=" + String.format("%.2f", c.area());
            case Rectangle r ->
                "長方形 " + r.width() + "x" + r.height() + " 面積=" + String.format("%.2f", r.area());
            case Triangle t ->
                "三角形 底辺=" + t.base() + " 面積=" + String.format("%.2f", t.area());
            // sealed interface のため permits 外のサブタイプは存在しない
            // コンパイラが全ケースの網羅性を保証する
        };
    }

    public static void main(String[] args) {
        var shapes = new Shape[]{
            new Circle(5.0),
            new Rectangle(3.0, 4.0),
            new Triangle(6.0, 8.0)
        };

        System.out.println("=== sealed interface + switch パターンマッチング（Java 21） ===");
        for (var shape : shapes) {
            System.out.println(describe(shape));
        }

        System.out.println("\n=== 型の安全性確認 ===");
        // 新しい図形型を追加して permits に加えないと、describe() でコンパイルエラーになる
        // これが sealed interface の強み: 型の追加漏れをコンパイル時に検出できる
        Shape circle = new Circle(10.0);
        if (circle instanceof Circle c) {
            System.out.println("半径: " + c.radius());
        }
    }
}
