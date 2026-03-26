import java.sql.*;
import java.util.*;

public class JdbcBasicSample {

    // DB接続を確立する
    // H2 インメモリDB（実務では MySQL/PostgreSQL の接続文字列に変更する）
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            "jdbc:h2:mem:jdbcbasic;DB_CLOSE_DELAY=-1", "sa", "");
    }

    // テーブル作成とサンプルデータ挿入
    public static void setup(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            stmt.execute(
                "CREATE TABLE IF NOT EXISTS employees (" +
                "  id     INT PRIMARY KEY," +
                "  name   VARCHAR(50)," +
                "  dept   VARCHAR(30)," +
                "  salary INT" +
                ")"
            );
            stmt.execute("DELETE FROM employees"); // 冪等のためクリア
            stmt.execute("INSERT INTO employees VALUES (1, '田中太郎', '営業', 350000)");
            stmt.execute("INSERT INTO employees VALUES (2, '鈴木花子', '開発', 420000)");
            stmt.execute("INSERT INTO employees VALUES (3, '佐藤次郎', '開発', 380000)");
        }
    }

    // SELECT: 全件取得
    public static List<String> findAll(Connection conn) throws SQLException {
        List<String> results = new ArrayList<>();
        String sql = "SELECT id, name, dept, salary FROM employees ORDER BY id";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                results.add(String.format("id=%d name=%s dept=%s salary=%d",
                    rs.getInt("id"), rs.getString("name"),
                    rs.getString("dept"), rs.getInt("salary")));
            }
        }
        return results;
    }

    // INSERT: 1件追加
    // ⚠️ 本番では PreparedStatement を使うこと（SQL インジェクション対策）
    public static int insert(Connection conn, int id, String name, String dept, int salary)
            throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            return stmt.executeUpdate(
                "INSERT INTO employees VALUES (" + id + ", '" + name + "', '" + dept + "', " + salary + ")"
            );
        }
    }

    // UPDATE: 給与変更
    public static int updateSalary(Connection conn, int id, int newSalary) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            return stmt.executeUpdate(
                "UPDATE employees SET salary = " + newSalary + " WHERE id = " + id);
        }
    }

    // DELETE: 1件削除
    public static int delete(Connection conn, int id) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            return stmt.executeUpdate("DELETE FROM employees WHERE id = " + id);
        }
    }

    public static void main(String[] args) throws SQLException {
        // try-with-resources で Connection を確実にクローズする
        try (Connection conn = getConnection()) {
            setup(conn);

            System.out.println("=== SELECT 全件 ===");
            for (String row : findAll(conn)) {
                System.out.println(row);
            }

            System.out.println("");
            System.out.println("=== INSERT ===");
            insert(conn, 4, "山田美咲", "総務", 310000);
            System.out.println("追加後: " + findAll(conn).size() + " 件");

            System.out.println("=== UPDATE ===");
            int updated = updateSalary(conn, 1, 370000);
            System.out.println("更新件数: " + updated);

            System.out.println("=== DELETE ===");
            int deleted = delete(conn, 4);
            System.out.println("削除件数: " + deleted);
            System.out.println("削除後: " + findAll(conn).size() + " 件");
        }
    }
}
