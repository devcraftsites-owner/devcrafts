import java.sql.*;
import java.util.*;

public class JdbcBasicSample {

    // 従業員を表す record（Java 16+）
    record Employee(int id, String name, String dept, int salary) {}

    // DB検索結果を型安全に表現する sealed interface（Java 17+）
    sealed interface DbResult {
        record Found(List<Employee> rows) implements DbResult {}
        record NotFound()               implements DbResult {}
        record Error(String message)    implements DbResult {}
    }

    // DB接続を確立する
    public static Connection getConnection() throws SQLException {
        // H2 インメモリDB（実務では MySQL/PostgreSQL の接続文字列に変更する）
        return DriverManager.getConnection(
            "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1", "sa", "");
    }

    // テーブル作成とサンプルデータ挿入（テキストブロックで SQL を見やすく書く）
    public static void setup(Connection conn) throws SQLException {
        try (var stmt = conn.createStatement()) {
            var createSql = """
                CREATE TABLE IF NOT EXISTS employees (
                    id     INT PRIMARY KEY,
                    name   VARCHAR(50),
                    dept   VARCHAR(30),
                    salary INT
                )
                """;
            stmt.execute(createSql);
            stmt.execute("DELETE FROM employees"); // 冪等のためクリア
            stmt.execute("INSERT INTO employees VALUES (1, '田中太郎', '営業', 350000)");
            stmt.execute("INSERT INTO employees VALUES (2, '鈴木花子', '開発', 420000)");
            stmt.execute("INSERT INTO employees VALUES (3, '佐藤次郎', '開発', 380000)");
        }
    }

    // SELECT: 全件取得（record のリストを返す）
    public static List<Employee> findAll(Connection conn) throws SQLException {
        var results = new ArrayList<Employee>();
        var sql = "SELECT id, name, dept, salary FROM employees ORDER BY id";
        try (var stmt = conn.createStatement();
             var rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                results.add(new Employee(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("dept"),
                    rs.getInt("salary")
                ));
            }
        }
        return results;
    }

    // SELECT: 部署で絞り込み、DbResult で結果を返す
    public static DbResult findByDept(Connection conn, String dept) {
        try {
            var results = new ArrayList<Employee>();
            var sql = "SELECT id, name, dept, salary FROM employees WHERE dept = ? ORDER BY id";
            try (var pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, dept);
                try (var rs = pstmt.executeQuery()) {
                    while (rs.next()) {
                        results.add(new Employee(
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("dept"),
                            rs.getInt("salary")
                        ));
                    }
                }
            }
            if (results.isEmpty()) {
                return new DbResult.NotFound();
            }
            return new DbResult.Found(results);
        } catch (SQLException e) {
            return new DbResult.Error(e.getMessage());
        }
    }

    // INSERT: 1件追加
    public static int insert(Connection conn, int id, String name, String dept, int salary) throws SQLException {
        try (var stmt = conn.createStatement()) {
            return stmt.executeUpdate(
                "INSERT INTO employees VALUES (" + id + ", '" + name + "', '" + dept + "', " + salary + ")"
                // ⚠️ 本番では PreparedStatement を使うこと（SQL インジェクション対策）
            );
        }
    }

    // UPDATE: 給与変更
    public static int updateSalary(Connection conn, int id, int newSalary) throws SQLException {
        try (var stmt = conn.createStatement()) {
            return stmt.executeUpdate(
                "UPDATE employees SET salary = " + newSalary + " WHERE id = " + id);
        }
    }

    // DELETE: 1件削除
    public static int delete(Connection conn, int id) throws SQLException {
        try (var stmt = conn.createStatement()) {
            return stmt.executeUpdate("DELETE FROM employees WHERE id = " + id);
        }
    }

    public static void main(String[] args) throws SQLException {
        try (var conn = getConnection()) {
            setup(conn);

            System.out.println("=== 全件取得 ===");
            for (var emp : findAll(conn)) {
                System.out.printf("id=%d name=%s dept=%s salary=%d%n",
                    emp.id(), emp.name(), emp.dept(), emp.salary());
            }

            System.out.println("\n=== INSERT ===");
            insert(conn, 4, "山田美咲", "総務", 310000);
            System.out.println("追加後: " + findAll(conn).size() + " 件");

            System.out.println("\n=== UPDATE ===");
            updateSalary(conn, 1, 370000);
            System.out.println("田中の給与更新完了");

            System.out.println("\n=== DELETE ===");
            delete(conn, 4);
            System.out.println("削除後: " + findAll(conn).size() + " 件");

            // Java 21: パターンマッチング switch で DbResult を処理する
            System.out.println("\n=== 部署別検索（sealed interface + パターンマッチング）===");
            for (var dept : new String[]{"開発", "総務"}) {
                var result = findByDept(conn, dept);
                // パターンマッチング switch（Java 21+）で全ケースを網羅的に処理
                switch (result) {
                    case DbResult.Found f -> {
                        System.out.println("[" + dept + "] " + f.rows().size() + " 件見つかりました");
                        f.rows().forEach(e -> System.out.println("  " + e.name()));
                    }
                    case DbResult.NotFound n -> System.out.println("[" + dept + "] 該当なし");
                    case DbResult.Error e    -> System.out.println("[" + dept + "] エラー: " + e.message());
                }
            }
        }
    }
}
