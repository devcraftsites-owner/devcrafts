import java.io.Serializable;
import java.util.Arrays;

public class EnumSerializeSample {

    // ✅ 推奨: 明示的なコード値で永続化
    enum OrderStatus {
        PENDING("PEND"),
        PROCESSING("PROC"),
        COMPLETED("COMP"),
        CANCELLED("CANC");

        private final String dbCode; // DB・JSON保存用の固定コード

        OrderStatus(String dbCode) {
            this.dbCode = dbCode;
        }

        public String getDbCode() {
            return dbCode;
        }

        // switch 式で fromDbCode を実装（Java 21+）// Java 21+
        public static OrderStatus fromDbCode(String code) {
            return Arrays.stream(values())
                .filter(s -> s.dbCode.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("不明なコード: " + code));
        }
    }

    // record を使ったデータクラス（Java 16+）
    record Order(String orderId, OrderStatus status) implements Serializable {
        @Override
        public String toString() {
            return "Order{id='" + orderId + "', status=" + status
                + "('" + status.getDbCode() + "')}";
        }
    }

    // Java 21: パターンマッチング switch でシリアライズ形式を決定 // Java 21+
    static String toJsonValue(Object obj) {
        return switch (obj) {
            case OrderStatus s -> "\"" + s.getDbCode() + "\"";
            case String str    -> "\"" + str + "\"";
            case Integer i     -> String.valueOf(i);
            default            -> "null";
        };
    }

    public static void main(String[] args) {
        // DB保存イメージ: Enum → コード値
        var status = OrderStatus.PROCESSING;
        var dbValue = status.getDbCode(); // "PROC"
        System.out.println("DB保存値: " + dbValue);

        // DB読み込みイメージ: コード値 → Enum
        var restored = OrderStatus.fromDbCode(dbValue);
        System.out.println("DB復元: " + restored);

        // switch 式でメッセージ生成
        String message = switch (restored) {
            case PENDING    -> "受付待ちです";
            case PROCESSING -> "処理中です";
            case COMPLETED  -> "完了しました";
            case CANCELLED  -> "キャンセルされました";
        };
        System.out.println("メッセージ: " + message);

        // 全ステータスのコード値を表示
        System.out.println("\n=== ステータス一覧 ===");
        for (var s : OrderStatus.values()) {
            System.out.println(s.name() + " → dbCode=" + s.getDbCode());
        }

        var order = new Order("ORD-001", OrderStatus.COMPLETED);
        System.out.println("\n注文: " + order);

        // Java 21: パターンマッチング switch で JSON 値を生成 // Java 21+
        System.out.println("\n=== パターンマッチング switch（Java 21+）===");
        System.out.println("OrderStatus.COMPLETED → " + toJsonValue(OrderStatus.COMPLETED));
        System.out.println("\"hello\" → " + toJsonValue("hello"));
        System.out.println("42 → " + toJsonValue(42));
    }
}
