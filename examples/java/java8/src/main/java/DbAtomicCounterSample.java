import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * DB を使った ATOMIC 採番サンプル（Java 8+）。
 *
 * AtomicLong は単一 JVM 内でのみ有効。
 * 複数サーバ（マルチ JVM）が共通の採番を必要とする場合は DB を使った方式を選ぶ。
 *
 * 動作確認: H2 インメモリ DB（テスト用）を使用。
 * 実務では MySQL / PostgreSQL 等のドライバを CLASSPATH に追加してください。
 *
 * Maven 依存（テスト用 H2）:
 *   <dependency>
 *     <groupId>com.h2database</groupId>
 *     <artifactId>h2</artifactId>
 *     <version>2.2.224</version>
 *   </dependency>
 */
public class DbAtomicCounterSample {

    // ---- 採番テーブル方式（UPDATE seq SET val = val + 1） ----

    /**
     * UPDATE 文で採番テーブルのカウンターを 1 増やし、新しい値を返す。
     * UPDATE は行ロックを取得するため、複数 JVM から同時実行しても安全。
     *
     * @param conn    トランザクション中の Connection（autoCommit=false 推奨）
     * @param seqName 採番テーブルの行名（用途別に区別）
     */
    public static long nextVal(Connection conn, String seqName) throws SQLException {
        String updateSql = "UPDATE seq_table SET current_val = current_val + 1 "
                         + "WHERE seq_name = ?";
        String selectSql = "SELECT current_val FROM seq_table WHERE seq_name = ?";

        try (PreparedStatement upd = conn.prepareStatement(updateSql);
             PreparedStatement sel = conn.prepareStatement(selectSql)) {

            upd.setString(1, seqName);
            int updated = upd.executeUpdate();
            if (updated == 0) {
                throw new SQLException("採番行が見つかりません: " + seqName);
            }

            sel.setString(1, seqName);
            try (ResultSet rs = sel.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("current_val");
                }
                throw new SQLException("採番値の取得に失敗: " + seqName);
            }
        }
    }

    // ---- SELECT FOR UPDATE 方式 ----

    /**
     * SELECT FOR UPDATE で行をロックしてから値を読み取り、インクリメントして返す。
     * UPDATE 方式より柔軟だが、デッドロックのリスクに注意。
     *
     * @param conn    autoCommit=false の Connection
     * @param seqName 採番名
     */
    public static long nextValWithLock(Connection conn, String seqName) throws SQLException {
        String selectForUpdate = "SELECT current_val FROM seq_table "
                               + "WHERE seq_name = ? FOR UPDATE";
        String updateSql = "UPDATE seq_table SET current_val = ? "
                         + "WHERE seq_name = ?";

        try (PreparedStatement sel = conn.prepareStatement(selectForUpdate);
             PreparedStatement upd = conn.prepareStatement(updateSql)) {

            sel.setString(1, seqName);
            long current;
            try (ResultSet rs = sel.executeQuery()) {
                if (!rs.next()) {
                    throw new SQLException("採番行が見つかりません: " + seqName);
                }
                current = rs.getLong("current_val");
            }

            long next = current + 1;
            upd.setLong(1, next);
            upd.setString(2, seqName);
            upd.executeUpdate();
            return next;
        }
    }

    // ---- テーブル初期化ユーティリティ ----

    public static void createSeqTable(Connection conn) throws SQLException {
        try (Statement st = conn.createStatement()) {
            st.execute(
                "CREATE TABLE IF NOT EXISTS seq_table ("
                + "  seq_name    VARCHAR(64) PRIMARY KEY,"
                + "  current_val BIGINT NOT NULL DEFAULT 0"
                + ")"
            );
        }
    }

    public static void insertSeq(Connection conn, String seqName, long initVal)
            throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO seq_table (seq_name, current_val) VALUES (?, ?)")) {
            ps.setString(1, seqName);
            ps.setLong(2, initVal);
            ps.executeUpdate();
        }
    }

    public static void main(String[] args) throws Exception {
        // H2 インメモリ DB で動作確認
        // 実務では "jdbc:mysql://localhost:3306/mydb" 等に変更する
        String url = "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1";

        try (Connection conn = DriverManager.getConnection(url, "sa", "")) {
            // テーブル準備
            createSeqTable(conn);
            conn.setAutoCommit(false);
            insertSeq(conn, "ORDER_SEQ", 10000);
            conn.commit();

            // 採番テーブル方式で5回採番
            System.out.println("=== 採番テーブル方式 ===");
            for (int i = 0; i < 5; i++) {
                conn.setAutoCommit(false);
                try {
                    long val = nextVal(conn, "ORDER_SEQ");
                    System.out.println("注文番号: ORD-" + val);
                    conn.commit();
                } catch (SQLException e) {
                    conn.rollback();
                    throw e;
                }
            }
        }
    }
}
