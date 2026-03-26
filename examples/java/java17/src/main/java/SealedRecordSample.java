public class SealedRecordSample {

    // Java 17: sealed interface + record（Java 17+）
    // sealed interface は permits で許可するサブタイプを明示する
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

    // instanceof パターンマッチング（Java 16+）で型安全に処理
    static String describe(Shape shape) {
        if (shape instanceof Circle c) {
            return "円形 半径=" + c.radius() + " 面積=" + String.format("%.2f", c.area());
        } else if (shape instanceof Rectangle r) {
            return "長方形 " + r.width() + "x" + r.height() + " 面積=" + String.format("%.2f", r.area());
        } else if (shape instanceof Triangle t) {
            return "三角形 底辺=" + t.base() + " 面積=" + String.format("%.2f", t.area());
        }
        return "不明な図形";
    }

    public static void main(String[] args) {
        var shapes = new Shape[]{
            new Circle(5.0),
            new Rectangle(3.0, 4.0),
            new Triangle(6.0, 8.0)
        };

        for (var shape : shapes) {
            System.out.println(describe(shape));
        }
    }
}
