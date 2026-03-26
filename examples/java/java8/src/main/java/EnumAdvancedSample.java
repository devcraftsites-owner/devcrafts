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
            for (PaymentMethod pm : values()) {
                if (pm.code == code) {
                    return pm;
                }
            }
            throw new IllegalArgumentException("不明な支払方法コード: " + code);
        }
    }

    // abstract メソッドで各要素に異なる処理を実装
    enum TaxRate {
        STANDARD {
            @Override
            public double apply(double price) {
                return price * 1.10; // 標準税率 10%
            }
        },
        REDUCED {
            @Override
            public double apply(double price) {
                return price * 1.08; // 軽減税率 8%
            }
        };

        public abstract double apply(double price);
    }

    public static void main(String[] args) {
        System.out.println("=== 支払方法一覧 ===");
        for (PaymentMethod pm : PaymentMethod.values()) {
            System.out.printf("code=%d name=%s refund=%b%n",
                pm.getCode(), pm.getDisplayName(), pm.supportsRefund());
        }

        System.out.println("\n=== コードから変換 ===");
        PaymentMethod pm = PaymentMethod.fromCode(2);
        System.out.println("code=2 → " + pm.getDisplayName()); // 銀行振込

        System.out.println("\n=== 税率計算 ===");
        double price = 1000.0;
        System.out.printf("標準: %.0f 円%n", TaxRate.STANDARD.apply(price));
        System.out.printf("軽減: %.0f 円%n", TaxRate.REDUCED.apply(price));

        System.out.println("\n=== 返金可能な支払方法のみ ===");
        for (PaymentMethod p : PaymentMethod.values()) {
            if (p.supportsRefund()) {
                System.out.println("  " + p.getDisplayName());
            }
        }
    }
}
