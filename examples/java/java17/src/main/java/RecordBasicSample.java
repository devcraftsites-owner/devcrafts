import java.util.List;

public class RecordBasicSample {

    // ✅ record: toString / equals / hashCode を自動生成
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

    // record はメソッドを追加できる
    record Rectangle(double width, double height) {
        public double area() { return width * height; }
        public double perimeter() { return 2 * (width + height); }
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

        System.out.println("\n=== record にメソッドを追加 ===");
        var rect = new Rectangle(5.0, 3.0);
        System.out.println("面積: " + rect.area() + ", 周囲: " + rect.perimeter());

        System.out.println("\n=== DTO としての活用 ===");
        var users = List.of(
            new UserDto(1, "taro@example.com", "田中太郎"),
            new UserDto(2, "hanako@example.com", "山田花子")
        );
        users.forEach(System.out::println);
    }
}
