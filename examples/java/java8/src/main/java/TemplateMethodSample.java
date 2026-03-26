public class TemplateMethodSample {

    // バッチ処理の骨組みを定義する抽象クラス
    static abstract class DataMigrationBatch {
        private String batchName;

        public DataMigrationBatch(String batchName) {
            this.batchName = batchName;
        }

        // テンプレートメソッド: 処理の順序を定義する（サブクラスでオーバーライドさせない）
        public final void execute() {
            System.out.println("=== " + batchName + " 開始 ===");
            readData();      // データ読み込み（サブクラスで実装）
            processData();   // データ処理（サブクラスで実装）
            writeData();     // データ書き込み（サブクラスで実装）
            cleanup();       // 後処理（デフォルト実装あり、オーバーライド可能）
            System.out.println("=== " + batchName + " 終了 ===");
        }

        // サブクラスが必ず実装しなければならない抽象メソッド
        protected abstract void readData();
        protected abstract void processData();
        protected abstract void writeData();

        // フックメソッド: デフォルト実装を持ち、必要に応じてオーバーライドできる
        protected void cleanup() {
            System.out.println("[後処理] 一時ファイルを削除しました（デフォルト）");
        }

        public String getBatchName() {
            return batchName;
        }
    }

    // ユーザーデータ移行バッチ: DataMigrationBatch を具体化したサブクラス
    static class UserMigrationBatch extends DataMigrationBatch {
        public UserMigrationBatch() {
            super("ユーザーデータ移行バッチ");
        }

        @Override
        protected void readData() {
            System.out.println("[読み込み] 旧DBからユーザーデータを1000件読み込みました");
        }

        @Override
        protected void processData() {
            System.out.println("[処理] メールアドレスの正規化・重複チェックを実行しました");
        }

        @Override
        protected void writeData() {
            System.out.println("[書き込み] 新DBにユーザーデータを1000件書き込みました");
        }

        // cleanup はオーバーライドしない（デフォルト実装を利用する）
    }

    // 注文データ移行バッチ: DataMigrationBatch を具体化したサブクラス
    static class OrderMigrationBatch extends DataMigrationBatch {
        public OrderMigrationBatch() {
            super("注文データ移行バッチ");
        }

        @Override
        protected void readData() {
            System.out.println("[読み込み] CSVファイルから注文データを5000件読み込みました");
        }

        @Override
        protected void processData() {
            System.out.println("[処理] 金額の再計算・税率適用・バリデーションを実行しました");
        }

        @Override
        protected void writeData() {
            System.out.println("[書き込み] 注文データを新システムのDBに5000件書き込みました");
        }

        // cleanup をオーバーライドして追加処理を行う
        @Override
        protected void cleanup() {
            System.out.println("[後処理] 処理済みCSVファイルをアーカイブしました");
            System.out.println("[後処理] 処理完了メールを管理者に送信しました");
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Template Method パターン: バッチ処理 ===");
        System.out.println();

        // ユーザーデータ移行バッチを実行
        DataMigrationBatch userBatch = new UserMigrationBatch();
        userBatch.execute();

        System.out.println();

        // 注文データ移行バッチを実行
        DataMigrationBatch orderBatch = new OrderMigrationBatch();
        orderBatch.execute();
    }
}
