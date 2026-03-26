public class TemplateMethodSample {

    // Java 21: sealed interface でバッチの各ステップを型安全に表現する
    sealed interface BatchStep
            permits BatchStep.Read, BatchStep.Process, BatchStep.Write, BatchStep.Cleanup {
        record Read(String description) implements BatchStep {}   // description フィールドを持つ
        record Process() implements BatchStep {}
        record Write(String description) implements BatchStep {}  // description フィールドを持つ
        record Cleanup() implements BatchStep {}
    }

    // record でバッチ処理結果を保持する（Java 17+）
    record BatchResult(String batchName, int recordCount, boolean success) {}

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
            return new BatchResult(batchName, getRecordCount(), true);
        }

        protected abstract void readData();
        protected abstract void processData();
        protected abstract void writeData();

        protected int getRecordCount() {
            return 0;
        }

        protected void cleanup() {
            System.out.println("[後処理] 一時ファイルを削除しました（デフォルト）");
        }
    }

    // switch パターンマッチングで各ステップのログを出力する（Java 21+）
    static void logStep(BatchStep step) {
        switch (step) {
            case BatchStep.Read(var desc) ->
                System.out.println("[ステップログ] 読み込み: " + desc);
            case BatchStep.Process() ->
                System.out.println("[ステップログ] データ処理を実行しました");
            case BatchStep.Write(var desc) ->
                System.out.println("[ステップログ] 書き込み: " + desc);
            case BatchStep.Cleanup() ->
                System.out.println("[ステップログ] 後処理を実行しました");
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
        System.out.println("=== Template Method パターン: バッチ処理（Java 21）===");
        System.out.println();

        var userBatch = new UserMigrationBatch();
        var userResult = userBatch.execute();
        System.out.println("結果: batchName=\"" + userResult.batchName()
                + "\", recordCount=" + userResult.recordCount()
                + ", success=" + userResult.success());

        System.out.println();

        var orderBatch = new OrderMigrationBatch();
        var orderResult = orderBatch.execute();
        System.out.println("結果: batchName=\"" + orderResult.batchName()
                + "\", recordCount=" + orderResult.recordCount()
                + ", success=" + orderResult.success());

        System.out.println();
        System.out.println("=== sealed interface + switch パターンマッチング（Java 21+）===");

        // BatchStep を使って各ステップのログを型安全に出力する
        var steps = new BatchStep[]{
            new BatchStep.Read("旧システムDBからCSVエクスポート"),
            new BatchStep.Process(),
            new BatchStep.Write("新システムDBへインポート"),
            new BatchStep.Cleanup()
        };

        for (var step : steps) {
            logStep(step);
        }
    }
}
