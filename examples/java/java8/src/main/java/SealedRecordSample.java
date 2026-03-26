public class SealedRecordSample {

    // Java 8: sealed の代替 - abstract class + enum type で表現
    enum ShapeType { CIRCLE, RECTANGLE, TRIANGLE }

    static abstract class Shape {
        abstract double area();
        abstract ShapeType getType();
    }

    static class Circle extends Shape {
        private final double radius;
        Circle(double radius) { this.radius = radius; }

        @Override
        public double area() { return Math.PI * radius * radius; }

        @Override
        public ShapeType getType() { return ShapeType.CIRCLE; }

        @Override
        public String toString() { return "Circle(radius=" + radius + ")"; }
    }

    static class Rectangle extends Shape {
        private final double width;
        private final double height;
        Rectangle(double width, double height) {
            this.width = width;
            this.height = height;
        }

        @Override
        public double area() { return width * height; }

        @Override
        public ShapeType getType() { return ShapeType.RECTANGLE; }

        @Override
        public String toString() { return "Rectangle(" + width + "x" + height + ")"; }
    }

    static class Triangle extends Shape {
        private final double base;
        private final double height;
        Triangle(double base, double height) {
            this.base = base;
            this.height = height;
        }

        @Override
        public double area() { return 0.5 * base * height; }

        @Override
        public ShapeType getType() { return ShapeType.TRIANGLE; }

        @Override
        public String toString() { return "Triangle(base=" + base + ", height=" + height + ")"; }
    }

    static String describe(Shape shape) {
        switch (shape.getType()) {
            case CIRCLE:
                return "円形: 面積 = " + String.format("%.2f", shape.area());
            case RECTANGLE:
                return "長方形: 面積 = " + String.format("%.2f", shape.area());
            case TRIANGLE:
                return "三角形: 面積 = " + String.format("%.2f", shape.area());
            default:
                return "不明な図形";
        }
    }

    public static void main(String[] args) {
        Shape[] shapes = { new Circle(5.0), new Rectangle(3.0, 4.0), new Triangle(6.0, 8.0) };
        for (Shape shape : shapes) {
            System.out.println(describe(shape));
        }
    }
}
