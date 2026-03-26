public class EnumFinancialSample {

    // 支払方法: コード値とラベルを持つ Enum
    enum PaymentMethod {
        CREDIT("01", "クレジットカード"),
        BANK_TRANSFER("02", "銀行振込"),
        E_MONEY("03", "電子マネー"),
        CASH("04", "現金");

        private final String code;   // DB保存用コード
        private final String label;  // 画面表示用ラベル

        PaymentMethod(String code, String label) {
            this.code = code;
            this.label = label;
        }

        public String getCode() { return code; }
        public String getLabel() { return label; }

        // コード値から Enum を逆引き
        public static PaymentMethod fromCode(String code) {
            for (PaymentMethod method : values()) {
                if (method.code.equals(code)) {
                    return method;
                }
            }
            throw new IllegalArgumentException("不明な支払コード: " + code);
        }
    }

    // 注文ステータス: 状態遷移のバリデーション付き
    enum OrderStatus {
        PENDING("受付中"),
        PROCESSING("処理中"),
        COMPLETED("完了"),
        CANCELLED("キャンセル");

        private final String label;

        OrderStatus(String label) {
            this.label = label;
        }

        public String getLabel() { return label; }

        // 次の状態への遷移が有効かチェック
        public boolean canTransitionTo(OrderStatus next) {
            if (this == PENDING) {
                return next == PROCESSING || next == CANCELLED;
            }
            if (this == PROCESSING) {
                return next == COMPLETED || next == CANCELLED;
            }
            return false; // COMPLETED, CANCELLED は終端
        }
    }

    // 取引種別: 金融取引の分類
    enum TransactionType {
        PURCHASE("PUR", "購入", true),
        REFUND("REF", "返金", false),
        TRANSFER("TRF", "振替", true),
        ADJUSTMENT("ADJ", "調整", false);

        private final String code;        // 取引コード
        private final String label;       // 表示名
        private final boolean debitSide;  // 借方側かどうか

        TransactionType(String code, String label, boolean debitSide) {
            this.code = code;
            this.label = label;
            this.debitSide = debitSide;
        }

        public String getCode() { return code; }
        public String getLabel() { return label; }
        public boolean isDebitSide() { return debitSide; }
    }

    public static void main(String[] args) {
        // コード値から Enum を取得（DB読み込み想定）
        PaymentMethod method = PaymentMethod.fromCode("02");
        System.out.println("支払方法: " + method.getLabel()); // 銀行振込

        // 全支払方法の一覧表示
        System.out.println("\n=== 支払方法一覧 ===");
        for (PaymentMethod pm : PaymentMethod.values()) {
            System.out.println("code=" + pm.getCode() + " label=" + pm.getLabel());
        }

        // 状態遷移バリデーション
        System.out.println("\n=== 注文ステータス遷移 ===");
        OrderStatus status = OrderStatus.PENDING;
        System.out.println("現在: " + status.getLabel());

        if (status.canTransitionTo(OrderStatus.PROCESSING)) {
            status = OrderStatus.PROCESSING;
            System.out.println("→ " + status.getLabel());
        }

        if (status.canTransitionTo(OrderStatus.CANCELLED)) {
            status = OrderStatus.CANCELLED;
            System.out.println("→ " + status.getLabel());
        }

        // 完了後は遷移不可
        if (!status.canTransitionTo(OrderStatus.COMPLETED)) {
            System.out.println("キャンセル後は完了へ遷移できません");
        }

        // 取引種別の表示
        System.out.println("\n=== 取引種別一覧 ===");
        for (TransactionType type : TransactionType.values()) {
            System.out.println(
                "code=" + type.getCode()
                + " label=" + type.getLabel()
                + " debit=" + type.isDebitSide()
            );
        }
    }
}
