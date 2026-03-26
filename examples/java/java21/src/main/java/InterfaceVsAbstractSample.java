import java.util.List;

public class InterfaceVsAbstractSample {

    // === インターフェース: 契約・能力定義（複数実装可） ===

    interface Printable {
        void print();
    }

    interface Saveable {
        void save(String path);

        default void saveToTemp() {
            save("/tmp/default.txt");
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

    // Java 21: record でユーザー情報を表現
    record UserResult(int id, String name, String source) {}

    // Java 21: sealed interface で DAO の戻り値を型安全に表現
    sealed interface DaoResult permits DaoResult.Found, DaoResult.NotFound {
        record Found(UserResult user) implements DaoResult {}
        record NotFound(int id) implements DaoResult {}
    }

    // DAO パターン: sealed interface を返すインターフェース
    interface UserDao {
        DaoResult findById(int id);
        void save(String user);
    }

    static class MySqlUserDao implements UserDao {
        @Override
        public DaoResult findById(int id) {
            if (id > 0) {
                return new DaoResult.Found(new UserResult(id, "User-" + id, "MySQL"));
            } else {
                return new DaoResult.NotFound(id);
            }
        }

        @Override
        public void save(String user) {
            System.out.println("MySQL: saving " + user);
        }
    }

    static class InMemoryUserDao implements UserDao {
        @Override
        public DaoResult findById(int id) {
            if (id > 0) {
                return new DaoResult.Found(new UserResult(id, "User-" + id, "Memory"));
            } else {
                return new DaoResult.NotFound(id);
            }
        }

        @Override
        public void save(String user) {
            System.out.println("Memory: saving " + user);
        }
    }

    // Java 21: switch パターンマッチングで結果を処理
    static void handleResult(DaoResult result) {
        switch (result) {
            case DaoResult.Found f -> System.out.println("見つかりました: " + f.user());
            case DaoResult.NotFound nf -> System.out.println("ID=" + nf.id() + " は見つかりませんでした");
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 抽象クラス ===");
        var dog = new Dog("ポチ");
        dog.introduce();
        dog.print();
        dog.saveToTemp();

        System.out.println("\n=== DAO パターン（sealed interface + switch パターンマッチング） ===");
        var daos = List.of(new MySqlUserDao(), new InMemoryUserDao());
        for (var dao : daos) {
            // 存在するIDの検索
            handleResult(dao.findById(1));
            // 存在しないIDの検索
            handleResult(dao.findById(-1));
        }
    }
}
