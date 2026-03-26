public class StatePatternSample {

    // 自動販売機の状態を表すインターフェース
    interface VendingMachineState {
        void insertCoin(VendingMachine machine);
        void selectProduct(VendingMachine machine, String product);
        void dispense(VendingMachine machine);
    }

    // 状態遷移ログを保持する record（Java 17+）
    record StateTransition(String from, String to, String action) {
        @Override
        public String toString() {
            return "[遷移ログ] " + from + " --(" + action + ")--> " + to;
        }
    }

    // 状態1: コイン未投入（待機中）
    static class IdleState implements VendingMachineState {
        @Override
        public void insertCoin(VendingMachine machine) {
            System.out.println("[IDLE] コインを受け取りました。商品を選んでください。");
            var transition = new StateTransition("IDLE", "COIN_INSERTED", "insertCoin");
            System.out.println(transition);
            machine.setState(new CoinInsertedState());
        }

        @Override
        public void selectProduct(VendingMachine machine, String product) {
            System.out.println("[IDLE] コインを投入してください。");
        }

        @Override
        public void dispense(VendingMachine machine) {
            System.out.println("[IDLE] コインを投入してください。");
        }
    }

    // 状態2: コイン投入済み（商品待ち）
    static class CoinInsertedState implements VendingMachineState {
        @Override
        public void insertCoin(VendingMachine machine) {
            System.out.println("[COIN_INSERTED] 既にコインが投入されています。");
        }

        @Override
        public void selectProduct(VendingMachine machine, String product) {
            System.out.println("[COIN_INSERTED] 「" + product + "」を選択しました。");
            machine.setSelectedProduct(product);
            var transition = new StateTransition("COIN_INSERTED", "DISPENSING", "selectProduct");
            System.out.println(transition);
            machine.setState(new DispensingState());
        }

        @Override
        public void dispense(VendingMachine machine) {
            System.out.println("[COIN_INSERTED] 商品を選択してください。");
        }
    }

    // 状態3: 商品払い出し中
    static class DispensingState implements VendingMachineState {
        @Override
        public void insertCoin(VendingMachine machine) {
            System.out.println("[DISPENSING] 払い出し中です。しばらくお待ちください。");
        }

        @Override
        public void selectProduct(VendingMachine machine, String product) {
            System.out.println("[DISPENSING] 払い出し中です。しばらくお待ちください。");
        }

        @Override
        public void dispense(VendingMachine machine) {
            var product = machine.getSelectedProduct();
            System.out.println("[DISPENSING] 「" + product + "」を払い出しました。ありがとうございました。");
            var transition = new StateTransition("DISPENSING", "IDLE", "dispense");
            System.out.println(transition);
            machine.setSelectedProduct(null);
            machine.setState(new IdleState());
        }
    }

    // 自動販売機本体
    static class VendingMachine {
        private VendingMachineState state;
        private String selectedProduct;

        public VendingMachine() {
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
        System.out.println("=== State パターン: 自動販売機（Java 17）===\n");

        var machine = new VendingMachine();

        System.out.println("--- 正常フロー: コイン投入 → 商品選択 → 払い出し ---");
        machine.insertCoin();
        machine.selectProduct("コーヒー");
        machine.dispense();

        System.out.println();
        System.out.println("--- 異常操作: コイン未投入で商品を選ぼうとする ---");
        machine.selectProduct("お茶");

        System.out.println();
        System.out.println("--- 異常操作: コイン二重投入 ---");
        machine.insertCoin();
        machine.insertCoin();

        System.out.println();
        System.out.println("--- 異常操作: 商品未選択で払い出しを試みる ---");
        machine.dispense();
        machine.selectProduct("ジュース");
        machine.dispense();
    }
}
