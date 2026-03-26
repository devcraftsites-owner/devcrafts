import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * DB を使った ATOMIC 採番サンプル（Java 17+）。
 * var・テキストブロック・switch 式を活用した簡潔な実装。
 */
public class DbAtomicCounterSample {

    // ---- 採番テーブル方式 ----

    public static long nextVal(Connection conn, String seqName) throws SQLException {
        var updateSql = "UPDATE seq_table SET current_val = current_val + 1 "
                      + "WHERE seq_name = ?";
        var selectSql = "SELECT current_val FROM seq_table WHERE seq_name = ?";

        try (var upd = conn.prepareStatement(updateSql);
             var sel = conn.prepareStatement(selectSql)) {

            upd.setString(1, seqName);
            if (upd.executeUpdate() == 0) {
                throw new SQLException("採番行が見つかりません: " + seqName);
            }

            sel.setString(1, seqName);
            try (var rs = sel.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("current_val");
                }
                throw new SQLException("採番値の取得に失敗: " + seqName);
            }
        }
    }

    // ---- SELECT FOR UPDATE 方式 ----

    public static long nextValWithLock(Connection conn, String seqName) throws SQLException {
        // テキストブロック（Java 15+）で SQL を読みやすく記述
        var selectForUpdate = """
                SELECT current_val FROM seq_table
                WHERE seq_name = ? FOR UPDATE
                """;
        var updateSql = """
                UPDATE seq_table SET current_val = ?
                WHERE seq_name = ?
                """;

        try (var sel = conn.prepareStatement(selectForUpdate);
             var upd = conn.prepareStatement(updateSql)) {

            sel.setString(1, seqName);
            long current;
            try (var rs = sel.executeQuery()) {
                if (!rs.next()) {
                    throw new SQLException("採番行が見つかりません: " + seqName);
                }
                current = rs.getLong("current_val");
            }

            var next = current + 1;
            upd.setLong(1, next);
            upd.setString(2, seqName);
            upd.executeUpdate();
            return next;
        }
    }

    // ---- トランザクションヘルパー ----

    /**
     * Java 17: switch 式でトランザクション操作の結果を返す。
     */
    enum TxResult { COMMITTED, ROLLED_BACK }

    @FunctionalInterface
    interface TxWork<T> {
        T execute(Connection conn) throws SQLException;
    }

    /**
     * トランザクションを開始し、成功時に commit、例外時に rollback するユーティリティ。
     */
    public static <T> T runInTransaction(Connection conn, TxWork<T> work)
            throws SQLException {
        conn.setAutoCommit(false);
        try {
            T result = work.execute(conn);
            conn.commit();
            return result;
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        }
    }

    // ---- テーブル初期化 ----

    public static void setup(Connection conn) throws SQLException {
        try (var st = conn.createStatement()) {
            st.execute("""
                    CREATE TABLE IF NOT EXISTS seq_table (
                      seq_name    VARCHAR(64) PRIMARY KEY,
                      current_val BIGINT NOT NULL DEFAULT 0
                    )
                    """);
        }
        try (var ps = conn.prepareStatement(
                "INSERT INTO seq_table (seq_name, current_val) VALUES (?, ?)")) {
            ps.setString(1, "ORDER_SEQ");
            ps.setLong(2, 10000);
            ps.executeUpdate();
        }
        conn.commit();
    }

    public static void main(String[] args) throws Exception {
        var url = "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1";

        try (var conn = DriverManager.getConnection(url, "sa", "")) {
            conn.setAutoCommit(false);
            setup(conn);

            System.out.println("=== トランザクションヘルパー方式 ===");
            for (var i = 0; i < 5; i++) {
                var val = runInTransaction(conn, c -> nextVal(c, "ORDER_SEQ"));
                System.out.println("注文番号: ORD-" + val);
            }
        }
    }
}
