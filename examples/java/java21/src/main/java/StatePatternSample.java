public class StatePatternSample {

    // sealed interface で状態の種類を型安全に制限する（Java 21+）
    // permits で許可されたクラス以外は MachineState を実装できない
    sealed interface MachineState
            permits MachineState.Idle, MachineState.CoinInserted, MachineState.Dispensing {

        // 待機中（コイン未投入）
        record Idle() implements MachineState {}

        // コイン投入済み（coinAmount は投入金額）
        record CoinInserted(int coinAmount) implements MachineState {}

        // 商品払い出し中（product は選択された商品名）
        record Dispensing(String product) implements MachineState {}
    }

    // 現在の状態を説明するメソッド: switch パターンマッチングで各 record を処理する（Java 21+）
    static String describeState(MachineState state) {
        return switch (state) {
            case MachineState.Idle()               -> "待機中（コインを投入してください）";
            case MachineState.CoinInserted(var amount) -> "コイン投入済み（投入金額: " + amount + "円）";
            case MachineState.Dispensing(var product)  -> "払い出し中（商品: " + product + "）";
        };
    }

    // イベントに応じて状態を遷移させるメソッド
    // 無効な操作はエラーメッセージを出力して現在の状態をそのまま返す
    static MachineState transition(MachineState current, String action) {
        return switch (current) {
            // 待機中 + "insertCoin" → コイン投入済みへ
            case MachineState.Idle() when action.equals("insertCoin") -> {
                System.out.println("[IDLE] コインを受け取りました（100円）。商品を選んでください。");
                yield new MachineState.CoinInserted(100);
            }
            // 待機中で "insertCoin" 以外の操作は無効
            case MachineState.Idle() -> {
                System.out.println("[IDLE] コインを投入してください。操作「" + action + "」は無効です。");
                yield current;
            }
            // コイン投入済み + "selectProduct:商品名" → 払い出し中へ
            case MachineState.CoinInserted(var amount) when action.startsWith("selectProduct:") -> {
                var product = action.substring("selectProduct:".length());
                System.out.println("[COIN_INSERTED] 「" + product + "」を選択しました（投入金額: " + amount + "円）。");
                yield new MachineState.Dispensing(product);
            }
            // コイン投入済みで "insertCoin" は二重投入エラー
            case MachineState.CoinInserted(var amount) when action.equals("insertCoin") -> {
                System.out.println("[COIN_INSERTED] 既にコインが投入されています（" + amount + "円）。");
                yield current;
            }
            // コイン投入済みでその他の操作は無効
            case MachineState.CoinInserted(var amount) -> {
                System.out.println("[COIN_INSERTED] 商品を選択してください。操作「" + action + "」は無効です。");
                yield current;
            }
            // 払い出し中 + "dispense" → 待機中へ
            case MachineState.Dispensing(var product) when action.equals("dispense") -> {
                System.out.println("[DISPENSING] 「" + product + "」を払い出しました。ありがとうございました。");
                yield new MachineState.Idle();
            }
            // 払い出し中のその他の操作は無効
            case MachineState.Dispensing(var product) -> {
                System.out.println("[DISPENSING] 払い出し中です（" + product + "）。しばらくお待ちください。");
                yield current;
            }
        };
    }

    public static void main(String[] args) {
        System.out.println("=== State パターン: 自動販売機（Java 21）===\n");

        // 初期状態: 待機中
        MachineState state = new MachineState.Idle();
        System.out.println("現在の状態: " + describeState(state));

        System.out.println("\n--- 正常フロー: コイン投入 → 商品選択 → 払い出し ---");
        state = transition(state, "insertCoin");
        System.out.println("現在の状態: " + describeState(state));

        state = transition(state, "selectProduct:コーヒー");
        System.out.println("現在の状態: " + describeState(state));

        state = transition(state, "dispense");
        System.out.println("現在の状態: " + describeState(state));

        System.out.println("\n--- 異常操作: コイン未投入で商品を選ぼうとする ---");
        state = transition(state, "selectProduct:お茶");
        System.out.println("現在の状態: " + describeState(state));

        System.out.println("\n--- 異常操作: コイン二重投入 ---");
        state = transition(state, "insertCoin");
        state = transition(state, "insertCoin");  // 二重投入
        System.out.println("現在の状態: " + describeState(state));

        System.out.println("\n--- 異常操作: 商品未選択で払い出しを試みる ---");
        state = transition(state, "dispense");     // 無効
        state = transition(state, "selectProduct:ジュース");
        state = transition(state, "dispense");
        System.out.println("現在の状態: " + describeState(state));
    }
}
