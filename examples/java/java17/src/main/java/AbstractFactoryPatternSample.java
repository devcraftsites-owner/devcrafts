public class AbstractFactoryPatternSample {

    // 抽象製品A: Connection インターフェース
    interface DbConnection {
        String connect();
    }

    // 抽象製品B: Statement インターフェース
    interface DbStatement {
        String executeQuery(String sql);
    }

    // 抽象ファクトリー: DB ファクトリーインターフェース
    interface DbFactory {
        DbConnection createConnection();
        DbStatement createStatement();
    }

    // Java 17+: record で各製品クラスをシンプルに定義
    record MySqlConnection() implements DbConnection {
        @Override
        public String connect() {
            return "MySQL に接続しました（jdbc:mysql://localhost:3306/mydb）";
        }
    }

    record MySqlStatement() implements DbStatement {
        @Override
        public String executeQuery(String sql) {
            return "MySQL で実行: " + sql;
        }
    }

    record PostgreSqlConnection() implements DbConnection {
        @Override
        public String connect() {
            return "PostgreSQL に接続しました（jdbc:postgresql://localhost:5432/mydb）";
        }
    }

    record PostgreSqlStatement() implements DbStatement {
        @Override
        public String executeQuery(String sql) {
            return "PostgreSQL で実行: " + sql;
        }
    }

    // 具体ファクトリー1: MySQL（record を返す）
    static class MySqlFactory implements DbFactory {
        @Override
        public DbConnection createConnection() {
            return new MySqlConnection();
        }
        @Override
        public DbStatement createStatement() {
            return new MySqlStatement();
        }
    }

    // 具体ファクトリー2: PostgreSQL（record を返す）
    static class PostgreSqlFactory implements DbFactory {
        @Override
        public DbConnection createConnection() {
            return new PostgreSqlConnection();
        }
        @Override
        public DbStatement createStatement() {
            return new PostgreSqlStatement();
        }
    }

    // クライアントコード: ファクトリーを使って DB 操作
    static void runDbOperation(DbFactory factory) {
        // Java 17+: var でローカル変数の型宣言を省略
        var connection = factory.createConnection();
        var statement = factory.createStatement();
        System.out.println(connection.connect());
        System.out.println(statement.executeQuery("SELECT * FROM users"));
    }

    public static void main(String[] args) {
        System.out.println("=== MySQL（Java 17）===");
        runDbOperation(new MySqlFactory());

        System.out.println("\n=== PostgreSQL（Java 17）===");
        runDbOperation(new PostgreSqlFactory());
    }
}
