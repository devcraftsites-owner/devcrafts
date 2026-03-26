import java.sql.*;
import java.util.*;

public class PreparedStatementSample {

    // ユーザーを表す record（Java 16+）
    record User(int id, String username, String email, int age) {}

    // SELECT 結果を型安全に表現する sealed interface（Java 17+）
    sealed interface QueryResult {
        record Success(List<User> users) implements QueryResult {}
        record Empty()                  implements QueryResult {}
    }

    // 型安全なパラメータバインディング用 sealed interface（Java 17+）
    sealed interface SqlParam {
        record IntParam(int value)      implements SqlParam {}
        record StringParam(String value) implements SqlParam {}
        record NullParam(int sqlType)   implements SqlParam {}
    }

    // SqlParam を PreparedStatement にバインドするヘルパー
    public static void bindParam(PreparedStatement pstmt, int index, SqlParam param) throws SQLException {
        // パターンマッチング switch（Java 21+）で型に応じて処理を分岐
        switch (param) {
            case SqlParam.IntParam p    -> pstmt.setInt(index, p.value());
            case SqlParam.StringParam p -> pstmt.setString(index, p.value());
            case SqlParam.NullParam p   -> pstmt.setNull(index, p.sqlType());
        }
    }

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

    // PreparedStatement による安全な INSERT（SqlParam ヘルパーを使用）
    public static int insertUser(Connection conn, User user) throws SQLException {
        var sql = """
            INSERT INTO users (id, username, email, age)
            VALUES (?, ?, ?, ?)
            """;
        try (var pstmt = conn.prepareStatement(sql)) {
            bindParam(pstmt, 1, new SqlParam.IntParam(user.id()));
            bindParam(pstmt, 2, new SqlParam.StringParam(user.username()));
            bindParam(pstmt, 3, new SqlParam.StringParam(user.email()));
            bindParam(pstmt, 4, new SqlParam.IntParam(user.age()));
            return pstmt.executeUpdate();
        }
    }

    // PreparedStatement によるパラメータ付き SELECT（QueryResult を返す）
    public static QueryResult findByAge(Connection conn, int minAge) throws SQLException {
        var results = new ArrayList<User>();
        var sql = "SELECT id, username, email, age FROM users WHERE age >= ? ORDER BY age";
        try (var pstmt = conn.prepareStatement(sql)) {
            bindParam(pstmt, 1, new SqlParam.IntParam(minAge));
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
        if (results.isEmpty()) {
            return new QueryResult.Empty();
        }
        return new QueryResult.Success(results);
    }

    // バッチ処理: 複数件を一括 INSERT
    public static int[] batchInsert(Connection conn, List<User> users) throws SQLException {
        var sql = """
            INSERT INTO users (id, username, email, age)
            VALUES (?, ?, ?, ?)
            """;
        try (var pstmt = conn.prepareStatement(sql)) {
            for (var user : users) {
                bindParam(pstmt, 1, new SqlParam.IntParam(user.id()));
                bindParam(pstmt, 2, new SqlParam.StringParam(user.username()));
                bindParam(pstmt, 3, new SqlParam.StringParam(user.email()));
                bindParam(pstmt, 4, new SqlParam.IntParam(user.age()));
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
            insertUser(conn, new User(1, "tanaka", "tanaka@example.com", 28));
            insertUser(conn, new User(2, "suzuki", "suzuki@example.com", 35));
            insertUser(conn, new User(3, "sato",   "sato@example.com",   22));

            System.out.println("\n=== パラメータ付き SELECT (age >= 25) ===");
            // パターンマッチング switch（Java 21+）で QueryResult を処理
            switch (findByAge(conn, 25)) {
                case QueryResult.Success s -> {
                    System.out.println(s.users().size() + " 件見つかりました");
                    s.users().forEach(u -> System.out.printf(
                        "  id=%d username=%s age=%d%n", u.id(), u.username(), u.age()));
                }
                case QueryResult.Empty e -> System.out.println("該当なし");
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
