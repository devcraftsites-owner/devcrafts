public class ChainOfResponsibilitySample {

    // ログレベルを表す enum（数値が大きいほど重要度が高い）
    enum LogLevel {
        DEBUG(1),
        INFO(2),
        WARN(3),
        ERROR(4);

        private final int level; // 優先度（数値）

        LogLevel(int level) {
            this.level = level;
        }

        public int getLevel() {
            return level;
        }
    }

    // ログハンドラーの抽象基底クラス
    // テンプレートメソッドパターンと組み合わせて「いつ処理するか」の判断を共通化する
    static abstract class LogHandler {
        private final LogLevel threshold; // この閾値以上のログを処理する
        private LogHandler next;          // 次のハンドラー（チェーンの次のリンク）

        public LogHandler(LogLevel threshold) {
            this.threshold = threshold;
        }

        // 次のハンドラーを設定する（メソッドチェーンで書けるよう自分自身を返す）
        public LogHandler setNext(LogHandler next) {
            this.next = next;
            return next;
        }

        // ログを処理する（テンプレートメソッド）
        // このメソッドは final にして、サブクラスが呼び出しの流れを変えられないようにする
        public final void handle(LogLevel level, String message) {
            if (level.getLevel() >= threshold.getLevel()) {
                // 自分の閾値以上のログは writeLog で処理する
                writeLog(message);
            }
            if (next != null) {
                // 次のハンドラーにも渡す（チェーンを継続する）
                next.handle(level, message);
            }
        }

        // サブクラスが実装する実際のログ出力メソッド
        protected abstract void writeLog(String message);
    }

    // WARN 以上のログをコンソールに出力するハンドラー
    static class ConsoleHandler extends LogHandler {
        public ConsoleHandler() {
            super(LogLevel.WARN);
        }

        @Override
        protected void writeLog(String message) {
            System.out.println("[CONSOLE] " + message);
        }
    }

    // ERROR 以上のログをファイルに出力するハンドラー（本サンプルでは System.out で代替）
    static class FileHandler extends LogHandler {
        public FileHandler() {
            super(LogLevel.ERROR);
        }

        @Override
        protected void writeLog(String message) {
            // 実際のアプリケーションではファイルに書き込む
            System.out.println("[FILE] error.log に書き込み: " + message);
        }
    }

    // ERROR 以上のログをメール通知するハンドラー（本サンプルでは System.out で代替）
    static class EmailHandler extends LogHandler {
        public EmailHandler() {
            super(LogLevel.ERROR);
        }

        @Override
        protected void writeLog(String message) {
            // 実際のアプリケーションではメール送信処理を行う
            System.out.println("[EMAIL] 管理者にメール送信: " + message);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Chain of Responsibility パターン: ログフィルタリング ===");

        // チェーンを構築する: ConsoleHandler -> FileHandler -> EmailHandler
        ConsoleHandler consoleHandler = new ConsoleHandler();
        consoleHandler
                .setNext(new FileHandler())
                .setNext(new EmailHandler());

        System.out.println("--- DEBUG ログ（閾値未満: どのハンドラーも処理しない）---");
        consoleHandler.handle(LogLevel.DEBUG, "デバッグ情報: 接続確立");

        System.out.println("\n--- INFO ログ（閾値未満: どのハンドラーも処理しない）---");
        consoleHandler.handle(LogLevel.INFO, "情報: ユーザーがログインしました");

        System.out.println("\n--- WARN ログ（ConsoleHandler が処理）---");
        consoleHandler.handle(LogLevel.WARN, "警告: ディスク使用率が 80% を超えました");

        System.out.println("\n--- ERROR ログ（全ハンドラーが処理）---");
        consoleHandler.handle(LogLevel.ERROR, "エラー: データベース接続に失敗しました");
    }
}
