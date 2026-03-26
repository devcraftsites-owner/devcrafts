import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * DB を使った ATOMIC 採番サンプル（Java 21+）。
 * sealed interface で採番結果を型安全に表現。
 */
public class DbAtomicCounterSample {

    /** 採番結果を sealed interface で表現（Java 21+） */
    sealed interface SeqResult {
        record Success(String seqName, long value) implements SeqResult {}
        record Failure(String seqName, String reason) implements SeqResult {}
    }

    // ---- 採番テーブル方式 ----

    public static SeqResult nextVal(Connection conn, String seqName) {
        var updateSql = "UPDATE seq_table SET current_val = current_val + 1 "
                      + "WHERE seq_name = ?";
        var selectSql = "SELECT current_val FROM seq_table WHERE seq_name = ?";

        try (var upd = conn.prepareStatement(updateSql);
             var sel = conn.prepareStatement(selectSql)) {

            upd.setString(1, seqName);
            if (upd.executeUpdate() == 0) {
                return new SeqResult.Failure(seqName, "採番行が見つかりません");
            }
            sel.setString(1, seqName);
            try (var rs = sel.executeQuery()) {
                if (rs.next()) {
                    return new SeqResult.Success(seqName, rs.getLong("current_val"));
                }
                return new SeqResult.Failure(seqName, "値の取得に失敗");
            }
        } catch (SQLException e) {
            return new SeqResult.Failure(seqName, e.getMessage());
        }
    }

    /** パターンマッチングで採番結果を処理（Java 21+） */
    public static String formatResult(SeqResult result) {
        return switch (result) {
            case SeqResult.Success(var name, var val) ->
                "注文番号: ORD-" + val + " (seq=" + name + ")";
            case SeqResult.Failure(var name, var reason) ->
                "採番失敗 [" + name + "]: " + reason;
        };
    }

    @FunctionalInterface
    interface TxWork<T> {
        T execute(Connection conn) throws SQLException;
    }

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

            System.out.println("=== sealed interface による採番結果処理 ===");
            for (var i = 0; i < 5; i++) {
                // トランザクション内で採番し、結果をパターンマッチングで処理
                var result = runInTransaction(conn, c -> nextVal(c, "ORDER_SEQ"));
                System.out.println(formatResult(result));
            }

            // 存在しない採番名でエラーケース
            var failResult = runInTransaction(conn, c -> nextVal(c, "INVALID_SEQ"));
            System.out.println(formatResult(failResult));
        }
    }
}
