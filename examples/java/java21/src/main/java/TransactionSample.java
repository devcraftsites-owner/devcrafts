import java.sql.*;
import java.util.*;

public class TransactionSample {

    // アカウントを表す record（Java 16+）
    record Account(int id, String owner, int balance) {}

    // トランザクション結果を型安全に表現する sealed interface（Java 17+）
    sealed interface TxResult {
        record Committed(String msg)    implements TxResult {}
        record RolledBack(String reason) implements TxResult {}
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(
            "jdbc:h2:mem:txtest;DB_CLOSE_DELAY=-1", "sa", "");
    }

    public static void setup(Connection conn) throws SQLException {
        try (var stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id      INT PRIMARY KEY,
                    owner   VARCHAR(50),
                    balance INT
                )
                """);
            stmt.execute("DELETE FROM accounts");
            stmt.execute("INSERT INTO accounts VALUES (1, '田中太郎', 100000)");
            stmt.execute("INSERT INTO accounts VALUES (2, '鈴木花子', 50000)");
        }
    }

    // 送金処理: TxResult を返す（例外を型で表現する）
    public static TxResult transfer(Connection conn, int fromId, int toId, int amount) {
        // 自動コミットを OFF にする（デフォルトは ON）
        try {
            conn.setAutoCommit(false);
        } catch (SQLException e) {
            return new TxResult.RolledBack("setAutoCommit失敗: " + e.getMessage());
        }

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
            return new TxResult.Committed(amount + " 円の送金が完了しました");

        } catch (SQLException e) {
            try {
                conn.rollback(); // 失敗 → ロールバック
            } catch (SQLException re) {
                return new TxResult.RolledBack("ロールバック自体も失敗: " + re.getMessage());
            }
            return new TxResult.RolledBack(e.getMessage());
        } finally {
            try {
                conn.setAutoCommit(true); // 自動コミットを元に戻す
            } catch (SQLException e) {
                // setAutoCommit の復元失敗は警告のみ
                System.out.println("警告: setAutoCommit(true) 復元失敗: " + e.getMessage());
            }
        }
    }

    // 残高照会（Account の List を返す）
    public static List<Account> getBalances(Connection conn) throws SQLException {
        var results = new ArrayList<Account>();
        try (var stmt = conn.createStatement();
             var rs = stmt.executeQuery("SELECT id, owner, balance FROM accounts ORDER BY id")) {
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

    public static void main(String[] args) throws SQLException {
        try (var conn = getConnection()) {
            setup(conn);

            System.out.println("=== 初期残高 ===");
            getBalances(conn).forEach(a ->
                System.out.printf("  id=%d %s: %,d 円%n", a.id(), a.owner(), a.balance()));

            System.out.println("\n=== 正常送金（田中→鈴木 30,000円）===");
            // パターンマッチング switch（Java 21+）で TxResult を処理
            var result1 = transfer(conn, 1, 2, 30000);
            switch (result1) {
                case TxResult.Committed c   -> System.out.println("成功: " + c.msg());
                case TxResult.RolledBack rb -> System.out.println("失敗: " + rb.reason());
            }
            getBalances(conn).forEach(a ->
                System.out.printf("  id=%d %s: %,d 円%n", a.id(), a.owner(), a.balance()));

            System.out.println("\n=== 残高不足で失敗（田中→鈴木 200,000円）===");
            var result2 = transfer(conn, 1, 2, 200000);
            switch (result2) {
                case TxResult.Committed c   -> System.out.println("成功: " + c.msg());
                case TxResult.RolledBack rb -> System.out.println("失敗（ロールバック）: " + rb.reason());
            }
            System.out.println("ロールバック後の残高:");
            getBalances(conn).forEach(a ->
                System.out.printf("  id=%d %s: %,d 円%n", a.id(), a.owner(), a.balance()));
        }
    }
}
