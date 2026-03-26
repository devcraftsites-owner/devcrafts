import java.util.Objects;

public class RecordBasicSample {

    // Java 8 では record を使えないので、手動で等価クラスを作成
    // record Person(String name, int age) と同等の実装

    static final class Person {
        private final String name; // ✅ final フィールド（不変性）
        private final int age;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        // record は以下を自動生成する
        public String name() { return name; } // ゲッターは get なし
        public int age() { return age; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Person)) return false;
            Person p = (Person) o;
            return age == p.age && Objects.equals(name, p.name);
        }

        @Override
        public int hashCode() {
            return Objects.hash(name, age);
        }

        @Override
        public String toString() {
            return "Person[name=" + name + ", age=" + age + "]";
        }
    }

    // DTO 例: APIレスポンスの表現
    static final class UserDto {
        private final int id;
        private final String email;
        private final String displayName;

        public UserDto(int id, String email, String displayName) {
            this.id = id;
            this.email = email;
            this.displayName = displayName;
        }

        public int id() { return id; }
        public String email() { return email; }
        public String displayName() { return displayName; }

        @Override
        public String toString() {
            return "UserDto[id=" + id + ", email=" + email + ", displayName=" + displayName + "]";
        }

        @Override
        public boolean equals(Object o) {
            if (!(o instanceof UserDto)) return false;
            UserDto u = (UserDto) o;
            return id == u.id && Objects.equals(email, u.email);
        }

        @Override
        public int hashCode() { return Objects.hash(id, email); }
    }

    public static void main(String[] args) {
        System.out.println("=== Person クラス（record の Java 8 相当） ===");
        Person p1 = new Person("田中太郎", 25);
        Person p2 = new Person("田中太郎", 25);
        Person p3 = new Person("山田花子", 30);

        System.out.println(p1);
        System.out.println("p1.equals(p2): " + p1.equals(p2)); // true（同じ値）
        System.out.println("p1.equals(p3): " + p1.equals(p3)); // false
        System.out.println("p1 == p2: " + (p1 == p2)); // false（別インスタンス）

        System.out.println("\n=== UserDto ===");
        UserDto user = new UserDto(1, "taro@example.com", "田中太郎");
        System.out.println(user);
    }
}
