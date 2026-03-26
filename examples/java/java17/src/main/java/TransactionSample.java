import java.sql.*;
import java.util.*;

public class TransactionSample {

    // アカウントを表す record（Java 16+）
    record Account(int id, String owner, int balance) {}

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            "jdbc:h2:mem:txtest;DB_CLOSE_DELAY=-1", "sa", "");
    }

    public static void setup(Connection conn) throws SQLException {
        try (var stmt = conn.createStatement()) {
            var createSql = """
                CREATE TABLE IF NOT EXISTS accounts (
                    id      INT PRIMARY KEY,
                    owner   VARCHAR(50),
                    balance INT
                )
                """;
            stmt.execute(createSql);
            stmt.execute("DELETE FROM accounts");
            stmt.execute("INSERT INTO accounts VALUES (1, '田中太郎', 100000)");
            stmt.execute("INSERT INTO accounts VALUES (2, '鈴木花子', 50000)");
        }
    }

    // 送金処理: 2つの UPDATE を1トランザクションで実行
    // 途中で例外が発生すると両方ロールバックされる
    public static void transfer(Connection conn, int fromId, int toId, int amount) throws SQLException {
        // 自動コミットを OFF にする（デフォルトは ON）
        conn.setAutoCommit(false);
        try {
            try (var stmt = conn.createStatement()) {
                // 送金元の残高を減らす
                var rows1 = stmt.executeUpdate(
                    "UPDATE accounts SET balance = balance - " + amount + " WHERE id = " + fromId);
                if (rows1 == 0) {
                    throw new SQLException("送金元アカウントが見つかりません: id=" + fromId);
                }

                // 残高不足チェック
                try (var rs = stmt.executeQuery(
                        "SELECT balance FROM accounts WHERE id = " + fromId)) {
                    if (rs.next() && rs.getInt("balance") < 0) {
                        throw new SQLException("残高不足: id=" + fromId);
                    }
                }

                // 送金先の残高を増やす
                var rows2 = stmt.executeUpdate(
                    "UPDATE accounts SET balance = balance + " + amount + " WHERE id = " + toId);
                if (rows2 == 0) {
                    throw new SQLException("送金先アカウントが見つかりません: id=" + toId);
                }
            }

            conn.commit(); // 全て成功 → コミット
            System.out.println("送金完了: " + amount + " 円");

        } catch (SQLException e) {
            conn.rollback(); // 失敗 → ロールバック（両方の変更が取り消される）
            System.out.println("送金失敗（ロールバック）: " + e.getMessage());
            throw e;
        } finally {
            conn.setAutoCommit(true); // 自動コミットを元に戻す
        }
    }

    // 残高照会（Account の List を返す）
    public static List<Account> getBalances(Connection conn) throws SQLException {
        var results = new ArrayList<Account>();
        var sql = "SELECT id, owner, balance FROM accounts ORDER BY id";
        try (var stmt = conn.createStatement();
             var rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                results.add(new Account(
                    rs.getInt("id"),
                    rs.getString("owner"),
                    rs.getInt("balance")
                ));
            }
        }
        return results;
    }

    public static void printBalances(Connection conn) throws SQLException {
        for (var account : getBalances(conn)) {
            System.out.printf("  id=%d %s: %,d 円%n",
                account.id(), account.owner(), account.balance());
        }
    }

    public static void main(String[] args) throws SQLException {
        try (var conn = getConnection()) {
            setup(conn);

            System.out.println("=== 初期残高 ===");
            printBalances(conn);

            System.out.println("\n=== 正常送金（田中→鈴木 30,000円）===");
            try {
                transfer(conn, 1, 2, 30000);
            } catch (SQLException e) { /* 処理済み */ }
            printBalances(conn);

            System.out.println("\n=== 残高不足で失敗（田中→鈴木 200,000円）===");
            try {
                transfer(conn, 1, 2, 200000);
            } catch (SQLException e) { /* 処理済み */ }
            System.out.println("ロールバック後の残高:");
            printBalances(conn);
        }
    }
}
