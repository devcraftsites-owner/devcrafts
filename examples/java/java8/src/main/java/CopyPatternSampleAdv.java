import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CopyPatternSampleAdv {

    // パターン 1: コピーコンストラクタ（推奨）
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

        // ✅ パターン 1: コピーコンストラクタ
        Employee(Employee other) {
            this.name = other.name;
            this.age = other.age;
            this.address = new Address(other.address); // ネストも再帰的にコピー
            this.skills = new ArrayList<>(other.skills);
        }

        @Override
        public String toString() {
            return "Employee{name='" + name + "', age=" + age
                    + ", address=" + address + ", skills=" + skills + "}";
        }
    }

    // パターン 2: シリアライズによるディープコピー（全フィールドを自動コピー）
    @SuppressWarnings("unchecked")
    static <T extends Serializable> T deepCopyBySerialization(T original) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {
                oos.writeObject(original);
            }
            try (ObjectInputStream ois = new ObjectInputStream(
                    new ByteArrayInputStream(baos.toByteArray()))) {
                return (T) ois.readObject();
            }
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("ディープコピー失敗", e);
        }
    }

    public static void main(String[] args) {
        Employee original = new Employee(
                "田中太郎", 30,
                new Address("東京都", "渋谷区"),
                new ArrayList<>(Arrays.asList("Java", "Python")));
        System.out.println("元: " + original);

        // パターン 1: コピーコンストラクタ
        System.out.println("\n=== パターン 1: コピーコンストラクタ ===");
        Employee copy1 = new Employee(original);
        copy1.name = "鈴木次郎";
        copy1.address.city = "新宿区";
        copy1.skills.add("Go");
        System.out.println("元（変化なし）: " + original);
        System.out.println("コピー1:       " + copy1);

        // パターン 2: シリアライズによるディープコピー
        System.out.println("\n=== パターン 2: シリアライズによるディープコピー ===");
        Employee copy2 = deepCopyBySerialization(original);
        copy2.name = "佐藤三郎";
        copy2.address.prefecture = "大阪府";
        System.out.println("元（変化なし）: " + original);
        System.out.println("コピー2（シリアライズ）: " + copy2);
    }
}
