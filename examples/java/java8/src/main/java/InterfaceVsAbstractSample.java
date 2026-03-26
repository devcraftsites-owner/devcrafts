import java.util.Arrays;
import java.util.List;

public class InterfaceVsAbstractSample {

    // === インターフェース: 契約・能力定義（複数実装可） ===

    interface Printable {
        void print(); // 抽象メソッド
    }

    // Java 8+: default メソッド
    interface Saveable {
        void save(String path);

        default void saveToTemp() { // default メソッド: 実装を持てる
            save("/tmp/default.txt");
        }

        static Saveable noOp() { // static メソッド
            return path -> System.out.println("NoOp: " + path);
        }
    }

    // === 抽象クラス: 共通実装・状態を持つ ===

    abstract static class Animal {
        private final String name; // フィールドを持てる

        public Animal(String name) {
            this.name = name;
        }

        // 共通の実装
        public String getName() {
            return name;
        }

        // サブクラスで必ず実装する
        public abstract String sound();

        public void introduce() {
            System.out.println("私は " + name + " です。" + sound() + " と鳴きます。");
        }
    }

    // 具体クラス: 抽象クラスを継承 + インターフェースを複数実装
    static class Dog extends Animal implements Printable, Saveable {
        public Dog(String name) {
            super(name);
        }

        @Override
        public String sound() {
            return "ワン";
        }

        @Override
        public void print() {
            System.out.println("Dog: " + getName());
        }

        @Override
        public void save(String path) {
            System.out.println("Saving Dog to: " + path);
        }
    }

    // DAO パターン: インターフェースで抽象化
    interface UserDao {
        String findById(int id);
        void save(String user);
    }

    // 本番用実装
    static class MySqlUserDao implements UserDao {
        @Override
        public String findById(int id) {
            return "MySQL: User-" + id;
        }

        @Override
        public void save(String user) {
            System.out.println("MySQL: saving " + user);
        }
    }

    // テスト用スタブ
    static class InMemoryUserDao implements UserDao {
        @Override
        public String findById(int id) {
            return "Memory: User-" + id;
        }

        @Override
        public void save(String user) {
            System.out.println("Memory: saving " + user);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 抽象クラス ===");
        Dog dog = new Dog("ポチ");
        dog.introduce();
        dog.print();
        dog.saveToTemp(); // default メソッド

        System.out.println("\n=== DAO パターン（インターフェースによる抽象化） ===");
        List<UserDao> daos = Arrays.asList(new MySqlUserDao(), new InMemoryUserDao());
        for (UserDao dao : daos) {
            System.out.println(dao.findById(1));
        }
    }
}
