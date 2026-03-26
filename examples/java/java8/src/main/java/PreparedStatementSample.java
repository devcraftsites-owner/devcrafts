import java.sql.*;
import java.util.*;

public class PreparedStatementSample {

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            "jdbc:h2:mem:preptest;DB_CLOSE_DELAY=-1", "sa", "");
    }

    public static void setup(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            stmt.execute(
                "CREATE TABLE IF NOT EXISTS users (" +
                "  id       INT PRIMARY KEY," +
                "  username VARCHAR(50)," +
                "  email    VARCHAR(100)," +
                "  age      INT" +
                ")"
            );
            stmt.execute("DELETE FROM users");
        }
    }

    // PreparedStatement による安全な INSERT
    public static int insertUser(Connection conn, int id, String username, String email, int age) throws SQLException {
        String sql = "INSERT INTO users (id, username, email, age) VALUES (?, ?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);           // ? 1番目: INT
            pstmt.setString(2, username);  // ? 2番目: String
            pstmt.setString(3, email);     // ? 3番目: String
            pstmt.setInt(4, age);          // ? 4番目: INT
            return pstmt.executeUpdate();
        }
    }

    // PreparedStatement によるパラメータ付き SELECT
    public static List<String> findByAge(Connection conn, int minAge) throws SQLException {
        List<String> results = new ArrayList<>();
        String sql = "SELECT id, username, email, age FROM users WHERE age >= ? ORDER BY age";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, minAge);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    results.add(String.format("id=%d username=%s email=%s age=%d",
                        rs.getInt("id"), rs.getString("username"),
                        rs.getString("email"), rs.getInt("age")));
                }
            }
        }
        return results;
    }

    // バッチ処理: 複数件を一括 INSERT
    public static int[] batchInsert(Connection conn, int[][] data, String[] usernames, String[] emails) throws SQLException {
        String sql = "INSERT INTO users (id, username, email, age) VALUES (?, ?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            for (int i = 0; i < data.length; i++) {
                pstmt.setInt(1, data[i][0]);
                pstmt.setString(2, usernames[i]);
                pstmt.setString(3, emails[i]);
                pstmt.setInt(4, data[i][1]);
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
        try (Connection conn = getConnection()) {
            setup(conn);

            System.out.println("=== PreparedStatement INSERT ===");
            insertUser(conn, 1, "tanaka", "tanaka@example.com", 28);
            insertUser(conn, 2, "suzuki", "suzuki@example.com", 35);
            insertUser(conn, 3, "sato", "sato@example.com", 22);

            System.out.println("\n=== パラメータ付き SELECT (age >= 25) ===");
            for (String row : findByAge(conn, 25)) {
                System.out.println(row);
            }

            System.out.println("\n=== バッチ INSERT ===");
            int[][] ids = {{10, 30}, {11, 27}};
            String[] names = {"yamada", "ito"};
            String[] emails = {"yamada@example.com", "ito@example.com"};
            int[] counts = batchInsert(conn, ids, names, emails);
            System.out.println("バッチ件数: " + counts.length);

            System.out.println("\n=== SQL インジェクション脆弱例（解説のみ）===");
            System.out.println("悪意ある入力: " + vulnerableQuery("' OR '1'='1"));
        }
    }
}
