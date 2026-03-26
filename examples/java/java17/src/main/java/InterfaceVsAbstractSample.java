import java.util.List;

public class InterfaceVsAbstractSample {

    // === インターフェース: 契約・能力定義（複数実装可） ===

    interface Printable {
        void print();
    }

    // Java 8+: default メソッド
    interface Saveable {
        void save(String path);

        default void saveToTemp() {
            save("/tmp/default.txt");
        }

        static Saveable noOp() {
            return path -> System.out.println("NoOp: " + path);
        }
    }

    // === 抽象クラス: 共通実装・状態を持つ ===

    abstract static class Animal {
        private final String name;

        public Animal(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public abstract String sound();

        public void introduce() {
            System.out.println("私は " + name + " です。" + sound() + " と鳴きます。");
        }
    }

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

    // Java 17: record でユーザー情報を表現
    record UserResult(int id, String name, String source) {}

    // DAO パターン: インターフェースで抽象化
    interface UserDao {
        UserResult findById(int id);
        void save(String user);
    }

    public static void main(String[] args) {
        System.out.println("=== 抽象クラス ===");
        var dog = new Dog("ポチ");
        dog.introduce();
        dog.print();
        dog.saveToTemp();

        System.out.println("\n=== DAO パターン（ラムダ式で実装） ===");
        // Java 17: ラムダ式で UserDao を実装
        UserDao mysqlDao = new UserDao() {
            @Override
            public UserResult findById(int id) {
                return new UserResult(id, "User-" + id, "MySQL");
            }
            @Override
            public void save(String user) {
                System.out.println("MySQL: saving " + user);
            }
        };

        UserDao memoryDao = new UserDao() {
            @Override
            public UserResult findById(int id) {
                return new UserResult(id, "User-" + id, "Memory");
            }
            @Override
            public void save(String user) {
                System.out.println("Memory: saving " + user);
            }
        };

        var daos = List.of(mysqlDao, memoryDao);
        for (var dao : daos) {
            var result = dao.findById(1);
            System.out.println(result); // record の toString が自動生成される
        }
    }
}
