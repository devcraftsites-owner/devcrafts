import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class CopyPatternSampleAdv {

    // コピーコンストラクタ用クラス
    static class Address implements Serializable {
        private static final long serialVersionUID = 1L;
        String prefecture;
        String city;

        Address(String prefecture, String city) {
            this.prefecture = prefecture;
            this.city = city;
        }

        Address(Address other) {
            this.prefecture = other.prefecture;
            this.city = other.city;
        }

        @Override
        public String toString() {
            return prefecture + " " + city;
        }
    }

    static class Employee implements Serializable {
        private static final long serialVersionUID = 1L;
        String name;
        int age;
        Address address;
        List<String> skills;

        Employee(String name, int age, Address address, List<String> skills) {
            this.name = name;
            this.age = age;
            this.address = address;
            this.skills = skills;
        }

        Employee(Employee other) {
            this.name = other.name;
            this.age = other.age;
            this.address = new Address(other.address);
            this.skills = new ArrayList<>(other.skills);
        }

        @Override
        public String toString() {
            return "Employee{name='" + name + "', age=" + age
                    + ", address=" + address + ", skills=" + skills + "}";
        }
    }

    // Java 17+: record + sealed interface でコピーパターンを型安全に定義
    record ImmutableAddress(String prefecture, String city) {
        @Override
        public String toString() {
            return prefecture + " " + city;
        }
    }

    record ImmutableEmployee(String name, int age, ImmutableAddress address, List<String> skills) {
        ImmutableEmployee {
            skills = List.copyOf(skills);
        }

        ImmutableEmployee withName(String newName) {
            return new ImmutableEmployee(newName, age, address, skills);
        }

        ImmutableEmployee withAddress(ImmutableAddress newAddress) {
            return new ImmutableEmployee(name, age, newAddress, skills);
        }
    }

    // Java 21: コピー戦略を switch パターンマッチングで切り替え
    sealed interface CopyStrategy permits CopyStrategy.Constructor, CopyStrategy.Serialization, CopyStrategy.RecordWith {
        record Constructor() implements CopyStrategy {}
        record Serialization() implements CopyStrategy {}
        record RecordWith() implements CopyStrategy {}
    }

    static void describeStrategy(CopyStrategy strategy) {
        switch (strategy) {
            case CopyStrategy.Constructor c ->
                System.out.println("[コピーコンストラクタ] 明示的・型安全・推奨パターン");
            case CopyStrategy.Serialization s ->
                System.out.println("[シリアライズ] 自動的に全フィールドをコピー。Serializable が必要。");
            case CopyStrategy.RecordWith r ->
                System.out.println("[record with パターン] 不変オブジェクト。変更は新しいインスタンスを作成。");
        }
    }

    @SuppressWarnings("unchecked")
    static <T extends Serializable> T deepCopyBySerialization(T original) {
        try {
            var baos = new ByteArrayOutputStream();
            try (var oos = new ObjectOutputStream(baos)) {
                oos.writeObject(original);
            }
            try (var ois = new ObjectInputStream(
                    new ByteArrayInputStream(baos.toByteArray()))) {
                return (T) ois.readObject();
            }
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("ディープコピー失敗", e);
        }
    }

    public static void main(String[] args) {
        // 各戦略の説明
        System.out.println("=== コピー戦略一覧 ===");
        describeStrategy(new CopyStrategy.Constructor());
        describeStrategy(new CopyStrategy.Serialization());
        describeStrategy(new CopyStrategy.RecordWith());
        System.out.println();

        // パターン 1: コピーコンストラクタ
        System.out.println("=== パターン 1: コピーコンストラクタ ===");
        var original = new Employee("田中太郎", 30,
                new Address("東京都", "渋谷区"),
                new ArrayList<>(List.of("Java", "Python")));
        var copy1 = new Employee(original);
        copy1.name = "鈴木次郎";
        copy1.address.city = "新宿区";
        System.out.println("元（変化なし）: " + original);
        System.out.println("コピー1:       " + copy1);

        // パターン 2: record の with パターン（Java 17+）
        System.out.println("\n=== パターン 2: record の with パターン ===");
        var origEmp = new ImmutableEmployee("田中太郎", 30,
                new ImmutableAddress("東京都", "渋谷区"),
                List.of("Java", "Python"));
        var copied = origEmp.withName("鈴木次郎").withAddress(new ImmutableAddress("大阪府", "梅田"));
        System.out.println("元: " + origEmp);
        System.out.println("コピー（with パターン）: " + copied);

        // パターン 3: シリアライズによるディープコピー
        System.out.println("\n=== パターン 3: シリアライズによるディープコピー ===");
        var copy3 = deepCopyBySerialization(original);
        copy3.name = "佐藤三郎";
        copy3.address.prefecture = "愛知県";
        System.out.println("元（変化なし）: " + original);
        System.out.println("コピー3（シリアライズ）: " + copy3);
    }
}
