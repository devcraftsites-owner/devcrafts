import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class CopyPatternSampleAdv {

    // パターン 1: コピーコンストラクタ
    static class Address implements Serializable {
        private static final long serialVersionUID = 1L;
        String prefecture;
        String city;

        Address(String prefecture, String city) {
            this.prefecture = prefecture;
            this.city = city;
        }

        // コピーコンストラクタ
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

        // コピーコンストラクタ
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

    // Java 17: record を使った不変のアドレス（コピー不要）
    record ImmutableAddress(String prefecture, String city) {
        @Override
        public String toString() {
            return prefecture + " " + city;
        }
    }

    // Java 17: record を使った不変の従業員（フィールドを変更する代わりに新しい record を作る）
    record ImmutableEmployee(String name, int age, ImmutableAddress address, List<String> skills) {
        // コンパクトコンストラクタでリストを防御コピー
        ImmutableEmployee {
            skills = List.copyOf(skills); // 不変リストにする
        }

        // "with" パターン: 一部フィールドだけ変更した新しい record を返す
        ImmutableEmployee withName(String newName) {
            return new ImmutableEmployee(newName, age, address, skills);
        }

        ImmutableEmployee withAddress(ImmutableAddress newAddress) {
            return new ImmutableEmployee(name, age, newAddress, skills);
        }
    }

    // シリアライズによるディープコピー
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

        // パターン 2: Java 17 record の "with" パターン
        System.out.println("\n=== パターン 2: record の with パターン（Java 17+） ===");
        var origEmp = new ImmutableEmployee("田中太郎", 30,
                new ImmutableAddress("東京都", "渋谷区"),
                List.of("Java", "Python"));
        // 名前だけ変えた新しい record を作成（元は変わらない）
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
