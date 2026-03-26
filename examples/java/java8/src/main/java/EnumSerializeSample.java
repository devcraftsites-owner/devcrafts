import java.io.Serializable;

public class EnumSerializeSample {

    // ❌ ordinal による保存（脆弱な方式）
    // Enum の順番が変わると過去データが壊れる
    enum BadStatus {
        ACTIVE,    // ordinal=0
        INACTIVE,  // ordinal=1
        DELETED    // ordinal=2
    }

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

        // DB・JSON のコード値から Enum に変換
        public static OrderStatus fromDbCode(String code) {
            for (OrderStatus s : values()) {
                if (s.dbCode.equals(code)) {
                    return s;
                }
            }
            throw new IllegalArgumentException("不明なコード: " + code);
        }
    }

    // Java 標準シリアライズ（Enum は自動的に Serializable）
    // Enum はシングルトンが保証される（デシリアライズ後も同一インスタンス）
    static class Order implements Serializable {
        private static final long serialVersionUID = 1L;
        final String orderId;
        final OrderStatus status;

        Order(String orderId, OrderStatus status) {
            this.orderId = orderId;
            this.status = status;
        }

        @Override
        public String toString() {
            return "Order{id='" + orderId + "', status=" + status
                + "('" + status.getDbCode() + "')}";
        }
    }

    public static void main(String[] args) {
        // DB保存イメージ: Enum → コード値
        OrderStatus status = OrderStatus.PROCESSING;
        String dbValue = status.getDbCode(); // "PROC"
        System.out.println("DB保存値: " + dbValue);

        // DB読み込みイメージ: コード値 → Enum
        OrderStatus restored = OrderStatus.fromDbCode(dbValue);
        System.out.println("DB復元: " + restored);

        // name() による保存（ordinal よりは安全だが、リネームに注意）
        String nameValue = status.name(); // "PROCESSING"
        System.out.println("name(): " + nameValue);
        OrderStatus byName = OrderStatus.valueOf(nameValue);
        System.out.println("valueOf(): " + byName);

        // 全ステータスのコード値を表示
        System.out.println("\n=== ステータス一覧 ===");
        for (OrderStatus s : OrderStatus.values()) {
            System.out.println(s.name() + " → dbCode=" + s.getDbCode());
        }

        Order order = new Order("ORD-001", OrderStatus.COMPLETED);
        System.out.println("\n注文: " + order);

        // ordinal の危険性を示す例
        System.out.println("\n=== ordinal の危険性 ===");
        System.out.println("ACTIVE ordinal: " + BadStatus.ACTIVE.ordinal());
        System.out.println("INACTIVE ordinal: " + BadStatus.INACTIVE.ordinal());
        System.out.println("DELETED ordinal: " + BadStatus.DELETED.ordinal());
        System.out.println("※ 定義順を変更すると ordinal が変わりデータが壊れる");
    }
}
