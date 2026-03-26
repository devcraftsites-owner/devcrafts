import java.sql.*;
import java.util.*;

public class PreparedStatementSample {

    // ユーザーを表す record（Java 16+）
    record User(int id, String username, String email, int age) {}

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            "jdbc:h2:mem:preptest;DB_CLOSE_DELAY=-1", "sa", "");
    }

    public static void setup(Connection conn) throws SQLException {
        try (var stmt = conn.createStatement()) {
            var createSql = """
                CREATE TABLE IF NOT EXISTS users (
                    id       INT PRIMARY KEY,
                    username VARCHAR(50),
                    email    VARCHAR(100),
                    age      INT
                )
                """;
            stmt.execute(createSql);
            stmt.execute("DELETE FROM users");
        }
    }

    // PreparedStatement による安全な INSERT
    public static int insertUser(Connection conn, int id, String username, String email, int age) throws SQLException {
        var sql = """
            INSERT INTO users (id, username, email, age)
            VALUES (?, ?, ?, ?)
            """;
        try (var pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);           // ? 1番目: INT
            pstmt.setString(2, username);  // ? 2番目: String
            pstmt.setString(3, email);     // ? 3番目: String
            pstmt.setInt(4, age);          // ? 4番目: INT
            return pstmt.executeUpdate();
        }
    }

    // PreparedStatement によるパラメータ付き SELECT（record のリストを返す）
    public static List<User> findByAge(Connection conn, int minAge) throws SQLException {
        var results = new ArrayList<User>();
        var sql = "SELECT id, username, email, age FROM users WHERE age >= ? ORDER BY age";
        try (var pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, minAge);
            try (var rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    results.add(new User(
                        rs.getInt("id"),
                        rs.getString("username"),
                        rs.getString("email"),
                        rs.getInt("age")
                    ));
                }
            }
        }
        return results;
    }

    // バッチ処理: 複数件を一括 INSERT（record を受け取る）
    public static int[] batchInsert(Connection conn, List<User> users) throws SQLException {
        var sql = """
            INSERT INTO users (id, username, email, age)
            VALUES (?, ?, ?, ?)
            """;
        try (var pstmt = conn.prepareStatement(sql)) {
            for (var user : users) {
                pstmt.setInt(1, user.id());
                pstmt.setString(2, user.username());
                pstmt.setString(3, user.email());
                pstmt.setInt(4, user.age());
                pstmt.addBatch(); // バッチに追加
            }
            return pstmt.executeBatch(); // まとめて実行
        }
    }

    // SQL インジェクション脆弱なコード例（解説用・本番使用禁止）
    public static String vulnerableQuery(String username) {
        // username に "' OR '1'='1" を入れると全件取得されてしまう
        return "SELECT * FROM users WHERE username = '" + username + "'";
    }

    public static void main(String[] args) throws SQLException {
        try (var conn = getConnection()) {
            setup(conn);

            System.out.println("=== PreparedStatement INSERT ===");
            insertUser(conn, 1, "tanaka", "tanaka@example.com", 28);
            insertUser(conn, 2, "suzuki", "suzuki@example.com", 35);
            insertUser(conn, 3, "sato", "sato@example.com", 22);

            System.out.println("\n=== パラメータ付き SELECT (age >= 25) ===");
            for (var user : findByAge(conn, 25)) {
                System.out.printf("id=%d username=%s email=%s age=%d%n",
                    user.id(), user.username(), user.email(), user.age());
            }

            System.out.println("\n=== バッチ INSERT ===");
            var batchUsers = List.of(
                new User(10, "yamada", "yamada@example.com", 30),
                new User(11, "ito",    "ito@example.com",    27)
            );
            var counts = batchInsert(conn, batchUsers);
            System.out.println("バッチ件数: " + counts.length);

            System.out.println("\n=== SQL インジェクション脆弱例（解説のみ）===");
            System.out.println("悪意ある入力: " + vulnerableQuery("' OR '1'='1"));
        }
    }
}
