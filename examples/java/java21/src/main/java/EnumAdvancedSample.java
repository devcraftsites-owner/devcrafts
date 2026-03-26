import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class EnumAdvancedSample {

    // フィールドとメソッドを持つ Enum（支払方法）
    enum PaymentMethod {
        CREDIT(1, "クレジットカード", true),
        BANK_TRANSFER(2, "銀行振込", false),
        E_MONEY(3, "電子マネー", true),
        CASH(4, "現金", false);

        private final int code;              // DB 保存用コード
        private final String displayName;    // 画面表示用名称
        private final boolean supportsRefund; // 返金対応可否

        // コンストラクタ（Enum のコンストラクタは常に private）
        PaymentMethod(int code, String displayName, boolean supportsRefund) {
            this.code = code;
            this.displayName = displayName;
            this.supportsRefund = supportsRefund;
        }

        public int getCode() { return code; }
        public String getDisplayName() { return displayName; }
        public boolean supportsRefund() { return supportsRefund; }

        // コード値から Enum に変換するファクトリメソッド
        public static PaymentMethod fromCode(int code) {
            return Arrays.stream(values())
                .filter(pm -> pm.code == code)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("不明な支払方法コード: " + code));
        }
    }

    // switch 式で各要素ごとの処理を実装（Java 14+）
    enum TaxRate {
        STANDARD, REDUCED;

        public double apply(double price) {
            return switch (this) {
                case STANDARD -> price * 1.10; // 標準税率 10%
                case REDUCED  -> price * 1.08; // 軽減税率 8%
            };
        }
    }

    // Java 21: switch でパターンマッチング（Enum も対象）
    static String describePayment(Object obj) {
        return switch (obj) {
            case PaymentMethod p when p == PaymentMethod.CREDIT ->
                "カードで支払い（" + p.getDisplayName() + "）";
            case PaymentMethod p when p.supportsRefund() ->
                p.getDisplayName() + "（返金可）";
            case PaymentMethod p ->
                p.getDisplayName() + "（返金不可）";
            default -> "不明な支払方法";
        };
    }

    public static void main(String[] args) {
        System.out.println("=== 支払方法一覧 ===");
        for (var pm : PaymentMethod.values()) {
            System.out.printf("code=%d name=%s refund=%b%n",
                pm.getCode(), pm.getDisplayName(), pm.supportsRefund());
        }

        System.out.println("\n=== コードから変換 ===");
        var pm = PaymentMethod.fromCode(2);
        System.out.println("code=2 → " + pm.getDisplayName()); // 銀行振込

        System.out.println("\n=== 税率計算 ===");
        double price = 1000.0;
        System.out.printf("標準: %.0f 円%n", TaxRate.STANDARD.apply(price));
        System.out.printf("軽減: %.0f 円%n", TaxRate.REDUCED.apply(price));

        // Stream + filter で返金可能な支払方法を取得
        System.out.println("\n=== 返金可能な支払方法のみ（Stream）===");
        List<PaymentMethod> refundable = Arrays.stream(PaymentMethod.values())
            .filter(PaymentMethod::supportsRefund)
            .collect(Collectors.toList());
        refundable.forEach(p -> System.out.println("  " + p.getDisplayName()));

        // Java 21: パターンマッチング switch で Enum を記述
        System.out.println("\n=== パターンマッチング switch（Java 21+）===");
        for (var p : PaymentMethod.values()) {
            System.out.println(describePayment(p));
        }
    }
}
