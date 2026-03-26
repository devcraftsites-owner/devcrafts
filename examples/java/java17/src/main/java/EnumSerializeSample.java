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

        // Stream を使ったコード逆引き（Java 8+）
        public static OrderStatus fromDbCode(String code) {
            return Arrays.stream(values())
                .filter(s -> s.dbCode.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("不明なコード: " + code));
        }
    }

    // Java 16+ record を使ったデータクラス
    record Order(String orderId, OrderStatus status) implements Serializable {
        @Override
        public String toString() {
            return "Order{id='" + orderId + "', status=" + status
                + "('" + status.getDbCode() + "')}";
        }
    }

    public static void main(String[] args) {
        // DB保存イメージ: Enum → コード値
        var status = OrderStatus.PROCESSING;
        var dbValue = status.getDbCode(); // "PROC"
        System.out.println("DB保存値: " + dbValue);

        // DB読み込みイメージ: コード値 → Enum
        var restored = OrderStatus.fromDbCode(dbValue);
        System.out.println("DB復元: " + restored);

        // name() による保存
        var nameValue = status.name(); // "PROCESSING"
        System.out.println("name(): " + nameValue);
        var byName = OrderStatus.valueOf(nameValue);
        System.out.println("valueOf(): " + byName);

        // switch 式でコード値からメッセージ生成（Java 14+）
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
    }
}
