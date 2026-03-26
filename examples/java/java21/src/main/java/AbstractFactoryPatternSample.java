public class AbstractFactoryPatternSample {

    // Java 21+: sealed interface で製品の種類を型安全に限定
    sealed interface DbProduct permits DbProduct.Connection, DbProduct.Statement {
        record Connection(String dbType, String url) implements DbProduct {
            public String connect() {
                return dbType + " に接続しました（" + url + "）";
            }
        }
        record Statement(String dbType) implements DbProduct {
            public String executeQuery(String sql) {
                return dbType + " で実行: " + sql;
            }
        }
    }

    // 抽象ファクトリー: DB ファクトリーインターフェース
    interface DbFactory {
        DbProduct.Connection createConnection();
        DbProduct.Statement createStatement();
    }

    // 具体ファクトリー1: MySQL
    static class MySqlFactory implements DbFactory {
        @Override
        public DbProduct.Connection createConnection() {
            return new DbProduct.Connection("MySQL", "jdbc:mysql://localhost:3306/mydb");
        }
        @Override
        public DbProduct.Statement createStatement() {
            return new DbProduct.Statement("MySQL");
        }
    }

    // 具体ファクトリー2: PostgreSQL
    static class PostgreSqlFactory implements DbFactory {
        @Override
        public DbProduct.Connection createConnection() {
            return new DbProduct.Connection("PostgreSQL", "jdbc:postgresql://localhost:5432/mydb");
        }
        @Override
        public DbProduct.Statement createStatement() {
            return new DbProduct.Statement("PostgreSQL");
        }
    }

    // Java 21+: switch パターンマッチングで製品の種類を型安全に処理
    static String describeProduct(DbProduct product) {
        return switch (product) {
            case DbProduct.Connection c -> "接続製品: " + c.connect();
            case DbProduct.Statement s -> "ステートメント製品: " + s.dbType();
        };
    }

    // クライアントコード: ファクトリーを使って DB 操作
    static void runDbOperation(DbFactory factory) {
        var connection = factory.createConnection();
        var statement = factory.createStatement();
        System.out.println(connection.connect());
        System.out.println(statement.executeQuery("SELECT * FROM users"));
        System.out.println(describeProduct(connection));
    }

    public static void main(String[] args) {
        System.out.println("=== MySQL（Java 21）===");
        runDbOperation(new MySqlFactory());

        System.out.println("\n=== PostgreSQL（Java 21）===");
        runDbOperation(new PostgreSqlFactory());
    }
}
