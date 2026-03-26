public class TemplateMethodSample {

    // Java 17: record でバッチ処理結果を保持する
    record BatchResult(String batchName, int recordCount, boolean success) {
        @Override
        public String toString() {
            return "BatchResult{batchName=\"" + batchName
                    + "\", recordCount=" + recordCount
                    + ", success=" + success + "}";
        }
    }

    // バッチ処理の骨組みを定義する抽象クラス
    static abstract class DataMigrationBatch {
        private final String batchName;

        public DataMigrationBatch(String batchName) {
            this.batchName = batchName;
        }

        // テンプレートメソッド: 処理の順序を定義し、BatchResult を返す
        public final BatchResult execute() {
            System.out.println("=== " + batchName + " 開始 ===");
            readData();
            processData();
            writeData();
            cleanup();
            System.out.println("=== " + batchName + " 終了 ===");

            // var を使って結果を返す（Java 17+）
            var result = new BatchResult(batchName, getRecordCount(), true);
            return result;
        }

        protected abstract void readData();
        protected abstract void processData();
        protected abstract void writeData();

        // フックメソッド: 処理件数を返す（サブクラスでオーバーライドして実際の件数を返す）
        protected int getRecordCount() {
            return 0;
        }

        // フックメソッド: デフォルトの後処理
        protected void cleanup() {
            System.out.println("[後処理] 一時ファイルを削除しました（デフォルト）");
        }
    }

    // ユーザーデータ移行バッチ
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

        @Override
        protected int getRecordCount() {
            return 1000;
        }
    }

    // 注文データ移行バッチ
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

        @Override
        protected int getRecordCount() {
            return 5000;
        }

        @Override
        protected void cleanup() {
            System.out.println("[後処理] 処理済みCSVファイルをアーカイブしました");
            System.out.println("[後処理] 処理完了メールを管理者に送信しました");
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Template Method パターン: バッチ処理（Java 17）===");
        System.out.println();

        // var でローカル変数の型宣言を省略（Java 17+）
        var userBatch = new UserMigrationBatch();
        var userResult = userBatch.execute();
        System.out.println("結果: " + userResult);

        System.out.println();

        var orderBatch = new OrderMigrationBatch();
        var orderResult = orderBatch.execute();
        System.out.println("結果: " + orderResult);
    }
}
