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

    // 具体ファクトリー1: MySQL
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

    // 具体ファクトリー2: PostgreSQL
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

    // 具体製品: MySQL 接続
    static class MySqlConnection implements DbConnection {
        @Override
        public String connect() {
            return "MySQL に接続しました（jdbc:mysql://localhost:3306/mydb）";
        }
    }

    // 具体製品: MySQL ステートメント
    static class MySqlStatement implements DbStatement {
        @Override
        public String executeQuery(String sql) {
            return "MySQL で実行: " + sql;
        }
    }

    // 具体製品: PostgreSQL 接続
    static class PostgreSqlConnection implements DbConnection {
        @Override
        public String connect() {
            return "PostgreSQL に接続しました（jdbc:postgresql://localhost:5432/mydb）";
        }
    }

    // 具体製品: PostgreSQL ステートメント
    static class PostgreSqlStatement implements DbStatement {
        @Override
        public String executeQuery(String sql) {
            return "PostgreSQL で実行: " + sql;
        }
    }

    // クライアントコード: ファクトリーを使って DB 操作
    static void runDbOperation(DbFactory factory) {
        DbConnection connection = factory.createConnection();
        DbStatement statement = factory.createStatement();
        System.out.println(connection.connect());
        System.out.println(statement.executeQuery("SELECT * FROM users"));
    }

    public static void main(String[] args) {
        System.out.println("=== MySQL ===");
        runDbOperation(new MySqlFactory());

        System.out.println("\n=== PostgreSQL ===");
        runDbOperation(new PostgreSqlFactory());
    }
}
