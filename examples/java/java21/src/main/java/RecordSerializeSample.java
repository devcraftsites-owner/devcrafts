import java.io.*;

public class RecordSerializeSample {

    // Java 21: sealed interface + record によるバリアントの JSON 変換
    // inner record は自動的に static 扱いになるため permits に自然に指定できる
    sealed interface Shape permits RecordSerializeSample.Circle,
                                   RecordSerializeSample.Rectangle,
                                   RecordSerializeSample.Triangle {}

    record Circle(double radius) implements Shape {}
    record Rectangle(double width, double height) implements Shape {}
    record Triangle(double base, double height) implements Shape {}

    // Java 21: switch パターンマッチングで型安全に JSON 変換
    static String shapeToJson(Shape shape) {
        return switch (shape) {
            case Circle c ->
                "{\"type\":\"circle\",\"radius\":" + c.radius() + "}";
            case Rectangle r ->
                "{\"type\":\"rectangle\",\"width\":" + r.width() + ",\"height\":" + r.height() + "}";
            case Triangle t ->
                "{\"type\":\"triangle\",\"base\":" + t.base() + ",\"height\":" + t.height() + "}";
        };
    }

    // 面積計算も switch パターンマッチングで簡潔に
    static double area(Shape shape) {
        return switch (shape) {
            case Circle c    -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
            case Triangle t  -> 0.5 * t.base() * t.height();
        };
    }

    // Java 17+ で使える通常の record シリアライズ（Serializable が必要）
    record UserDto(String id, String name, int age) implements Serializable {
        private static final long serialVersionUID = 1L;
    }

    static String toJson(UserDto user) {
        return "{\"id\":\"" + user.id() + "\","
                + "\"name\":\"" + user.name() + "\","
                + "\"age\":" + user.age() + "}";
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        System.out.println("=== sealed record の JSON 変換 ===");
        var shapes = new Shape[]{
            new Circle(5.0),
            new Rectangle(3.0, 4.0),
            new Triangle(6.0, 8.0)
        };

        for (var shape : shapes) {
            System.out.println("JSON: " + shapeToJson(shape));
            System.out.printf("面積: %.2f%n", area(shape));
        }

        System.out.println("\n=== record のバイナリシリアライズ ===");
        var user = new UserDto("U001", "田中太郎", 30);
        System.out.println("元オブジェクト: " + user);
        System.out.println("JSON: " + toJson(user));

        // バイナリシリアライズ
        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(user);
            bytes = baos.toByteArray();
        }

        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            var loaded = (UserDto) ois.readObject();
            System.out.println("復元: " + loaded);
        }
    }
}
