import java.util.List;

public class RecordBasicSample {

    // record: toString / equals / hashCode を自動生成
    record Person(String name, int age) {}

    // コンパクトコンストラクタでバリデーション
    record ValidatedAge(int value) {
        ValidatedAge {
            if (value < 0 || value > 150) {
                throw new IllegalArgumentException("年齢は 0〜150 の範囲で指定してください: " + value);
            }
        }
    }

    // DTO 例
    record UserDto(int id, String email, String displayName) {}

    // Java 21: sealed interface で図形の種類を表現
    sealed interface Shape permits Shape.Circle, Shape.Rectangle {
        record Circle(double radius) implements Shape {}
        record Rectangle(double width, double height) implements Shape {}
    }

    // switch パターンマッチングで面積を計算
    static double area(Shape shape) {
        return switch (shape) {
            case Shape.Circle c -> Math.PI * c.radius() * c.radius();
            case Shape.Rectangle r -> r.width() * r.height();
        };
    }

    public static void main(String[] args) {
        System.out.println("=== record の基本 ===");
        var p1 = new Person("田中太郎", 25);
        var p2 = new Person("田中太郎", 25);
        System.out.println(p1);
        System.out.println("equals: " + p1.equals(p2)); // true

        System.out.println("\n=== コンパクトコンストラクタでバリデーション ===");
        try {
            var age = new ValidatedAge(-1);
        } catch (IllegalArgumentException e) {
            System.out.println("バリデーションエラー: " + e.getMessage());
        }

        System.out.println("\n=== sealed interface + switch パターンマッチング ===");
        var shapes = List.of(
            new Shape.Circle(5.0),
            new Shape.Rectangle(4.0, 3.0)
        );

        for (var shape : shapes) {
            System.out.printf("%s の面積: %.2f%n", shape, area(shape));
        }

        System.out.println("\n=== record の分解（instanceof パターンマッチング） ===");
        Object obj = new Person("山田花子", 30);
        // Java 21: instanceof でフィールドを直接取り出す
        if (obj instanceof Person p) {
            System.out.println("名前: " + p.name() + ", 年齢: " + p.age());
        }

        System.out.println("\n=== DTO としての活用 ===");
        var users = List.of(
            new UserDto(1, "taro@example.com", "田中太郎"),
            new UserDto(2, "hanako@example.com", "山田花子")
        );
        users.forEach(System.out::println);
    }
}
