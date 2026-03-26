import java.util.Arrays;

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

        // Stream を使ったコード逆引き
        public static PaymentMethod fromCode(String code) {
            return Arrays.stream(values())
                .filter(m -> m.code.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("不明な支払コード: " + code));
        }
    }

    // 注文ステータス: switch 式で状態遷移を記述
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

        // switch 式で遷移可否を判定
        public boolean canTransitionTo(OrderStatus next) {
            return switch (this) {
                case PENDING    -> next == PROCESSING || next == CANCELLED;
                case PROCESSING -> next == COMPLETED  || next == CANCELLED;
                case COMPLETED, CANCELLED -> false; // 終端状態
            };
        }
    }

    // 取引種別
    enum TransactionType {
        PURCHASE("PUR", "購入", true),
        REFUND("REF", "返金", false),
        TRANSFER("TRF", "振替", true),
        ADJUSTMENT("ADJ", "調整", false);

        private final String code;
        private final String label;
        private final boolean debitSide;

        TransactionType(String code, String label, boolean debitSide) {
            this.code = code;
            this.label = label;
            this.debitSide = debitSide;
        }

        public String getCode() { return code; }
        public String getLabel() { return label; }
        public boolean isDebitSide() { return debitSide; }
    }

    // Java 21: パターンマッチング switch で支払方法を説明 // Java 21+
    static String describePayment(PaymentMethod method) {
        return switch (method) {
            case CREDIT        -> "クレジットカード（手数料なし・ポイント付与）";
            case BANK_TRANSFER -> "銀行振込（入金確認後に処理）";
            case E_MONEY       -> "電子マネー（即時決済）";
            case CASH          -> "現金（店頭のみ対応）";
        };
    }

    public static void main(String[] args) {
        // Stream による逆引き
        var method = PaymentMethod.fromCode("02");
        System.out.println("支払方法: " + method.getLabel()); // 銀行振込

        // 全支払方法の一覧表示
        System.out.println("\n=== 支払方法一覧 ===");
        for (var pm : PaymentMethod.values()) {
            System.out.println("code=" + pm.getCode() + " label=" + pm.getLabel());
        }

        // 状態遷移バリデーション
        System.out.println("\n=== 注文ステータス遷移 ===");
        var status = OrderStatus.PENDING;
        System.out.println("現在: " + status.getLabel());

        if (status.canTransitionTo(OrderStatus.PROCESSING)) {
            status = OrderStatus.PROCESSING;
            System.out.println("→ " + status.getLabel());
        }

        // Java 21: パターンマッチング switch でメッセージ生成 // Java 21+
        System.out.println("\n=== パターンマッチング switch（Java 21+）===");
        for (var pm : PaymentMethod.values()) {
            System.out.println(describePayment(pm));
        }

        // 取引種別の表示
        System.out.println("\n=== 取引種別一覧 ===");
        for (var type : TransactionType.values()) {
            System.out.println(
                "code=" + type.getCode()
                + " label=" + type.getLabel()
                + " debit=" + type.isDebitSide()
            );
        }
    }
}
