public class StatePatternSample {

    // 自動販売機の状態を表すインターフェース
    interface VendingMachineState {
        // コインを投入する操作
        void insertCoin(VendingMachine machine);
        // 商品を選択する操作
        void selectProduct(VendingMachine machine, String product);
        // 商品を払い出す操作
        void dispense(VendingMachine machine);
    }

    // 状態1: コイン未投入（待機中）
    static class IdleState implements VendingMachineState {
        @Override
        public void insertCoin(VendingMachine machine) {
            System.out.println("[IDLE] コインを受け取りました。商品を選んでください。");
            // CoinInsertedState へ遷移する
            machine.setState(new CoinInsertedState());
        }

        @Override
        public void selectProduct(VendingMachine machine, String product) {
            // コイン未投入なので商品を選べない
            System.out.println("[IDLE] コインを投入してください。");
        }

        @Override
        public void dispense(VendingMachine machine) {
            // コイン未投入なので払い出せない
            System.out.println("[IDLE] コインを投入してください。");
        }
    }

    // 状態2: コイン投入済み（商品待ち）
    static class CoinInsertedState implements VendingMachineState {
        @Override
        public void insertCoin(VendingMachine machine) {
            // すでにコインが入っている
            System.out.println("[COIN_INSERTED] 既にコインが投入されています。");
        }

        @Override
        public void selectProduct(VendingMachine machine, String product) {
            System.out.println("[COIN_INSERTED] 「" + product + "」を選択しました。");
            // 選択した商品を記録し、DispensingState へ遷移する
            machine.setSelectedProduct(product);
            machine.setState(new DispensingState());
        }

        @Override
        public void dispense(VendingMachine machine) {
            // 商品が未選択なので払い出せない
            System.out.println("[COIN_INSERTED] 商品を選択してください。");
        }
    }

    // 状態3: 商品払い出し中
    static class DispensingState implements VendingMachineState {
        @Override
        public void insertCoin(VendingMachine machine) {
            // 払い出し中はコインを受け付けない
            System.out.println("[DISPENSING] 払い出し中です。しばらくお待ちください。");
        }

        @Override
        public void selectProduct(VendingMachine machine, String product) {
            // 払い出し中は商品を選べない
            System.out.println("[DISPENSING] 払い出し中です。しばらくお待ちください。");
        }

        @Override
        public void dispense(VendingMachine machine) {
            String product = machine.getSelectedProduct();
            System.out.println("[DISPENSING] 「" + product + "」を払い出しました。ありがとうございました。");
            // 払い出しが完了したら IdleState に戻る
            machine.setSelectedProduct(null);
            machine.setState(new IdleState());
        }
    }

    // 自動販売機本体: 現在の状態と選択商品を保持する
    static class VendingMachine {
        // 現在の状態
        private VendingMachineState state;
        // 選択された商品
        private String selectedProduct;

        public VendingMachine() {
            // 初期状態は IdleState（待機中）
            this.state = new IdleState();
            this.selectedProduct = null;
        }

        public void setState(VendingMachineState state) {
            this.state = state;
        }

        public void setSelectedProduct(String product) {
            this.selectedProduct = product;
        }

        public String getSelectedProduct() {
            return selectedProduct;
        }

        // 操作メソッド: 現在の状態に処理を委譲する
        public void insertCoin() {
            state.insertCoin(this);
        }

        public void selectProduct(String product) {
            state.selectProduct(this, product);
        }

        public void dispense() {
            state.dispense(this);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== State パターン: 自動販売機 ===\n");

        VendingMachine machine = new VendingMachine();

        System.out.println("--- 正常フロー: コイン投入 → 商品選択 → 払い出し ---");
        machine.insertCoin();                      // IDLE → COIN_INSERTED
        machine.selectProduct("コーヒー");          // COIN_INSERTED → DISPENSING
        machine.dispense();                        // DISPENSING → IDLE

        System.out.println();
        System.out.println("--- 異常操作: コイン未投入で商品を選ぼうとする ---");
        machine.selectProduct("お茶");             // IDLE: コインを投入してください

        System.out.println();
        System.out.println("--- 異常操作: コイン二重投入 ---");
        machine.insertCoin();                      // IDLE → COIN_INSERTED
        machine.insertCoin();                      // 既にコインが入っている

        System.out.println();
        System.out.println("--- 異常操作: 商品未選択で払い出しを試みる ---");
        machine.dispense();                        // 商品を選択してください
        machine.selectProduct("ジュース");          // COIN_INSERTED → DISPENSING
        machine.dispense();                        // DISPENSING → IDLE
    }
}
