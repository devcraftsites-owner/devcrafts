import java.time.LocalDateTime;

public class ChainOfResponsibilitySample {

    // ログレベルを表す enum
    enum LogLevel {
        DEBUG(1),
        INFO(2),
        WARN(3),
        ERROR(4);

        private final int level;

        LogLevel(int level) {
            this.level = level;
        }

        public int getLevel() {
            return level;
        }
    }

    // Java 17: record でログのデータを保持する（不変なデータ構造）
    // level（ログレベル）、message（内容）、timestamp（発生日時）を一まとめにする
    record LogRecord(LogLevel level, String message, LocalDateTime timestamp) {
        // コンパクトコンストラクタでバリデーションを追加できる
        LogRecord {
            if (message == null || message.isBlank()) {
                throw new IllegalArgumentException("メッセージは空にできません");
            }
        }

        // 表示用のフォーマット
        public String format() {
            return "[" + timestamp + "][" + level + "] " + message;
        }
    }

    // ログハンドラーの抽象基底クラス
    static abstract class LogHandler {
        private final LogLevel threshold;
        private LogHandler next;

        public LogHandler(LogLevel threshold) {
            this.threshold = threshold;
        }

        public LogHandler setNext(LogHandler next) {
            this.next = next;
            return next;
        }

        // LogRecord を受け取るように変更（Java 17+）
        public final void handle(LogRecord record) {
            if (record.level().getLevel() >= threshold.getLevel()) {
                writeLog(record);
            }
            if (next != null) {
                next.handle(record);
            }
        }

        protected abstract void writeLog(LogRecord record);
    }

    // WARN 以上をコンソール出力
    static class ConsoleHandler extends LogHandler {
        public ConsoleHandler() {
            super(LogLevel.WARN);
        }

        @Override
        protected void writeLog(LogRecord record) {
            System.out.println("[CONSOLE] " + record.format());
        }
    }

    // ERROR 以上をファイル出力（本サンプルでは System.out で代替）
    static class FileHandler extends LogHandler {
        public FileHandler() {
            super(LogLevel.ERROR);
        }

        @Override
        protected void writeLog(LogRecord record) {
            System.out.println("[FILE] error.log に書き込み: " + record.format());
        }
    }

    // ERROR 以上をメール通知（本サンプルでは System.out で代替）
    static class EmailHandler extends LogHandler {
        public EmailHandler() {
            super(LogLevel.ERROR);
        }

        @Override
        protected void writeLog(LogRecord record) {
            System.out.println("[EMAIL] 管理者にメール送信: " + record.format());
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Chain of Responsibility パターン: ログフィルタリング（Java 17）===");

        // var でローカル変数の型推論を使う（Java 17+）
        var consoleHandler = new ConsoleHandler();
        consoleHandler
                .setNext(new FileHandler())
                .setNext(new EmailHandler());

        var now = LocalDateTime.now();

        System.out.println("--- DEBUG ログ（どのハンドラーも処理しない）---");
        consoleHandler.handle(new LogRecord(LogLevel.DEBUG, "デバッグ情報: 接続確立", now));

        System.out.println("\n--- INFO ログ（どのハンドラーも処理しない）---");
        consoleHandler.handle(new LogRecord(LogLevel.INFO, "情報: ユーザーがログインしました", now));

        System.out.println("\n--- WARN ログ（ConsoleHandler が処理）---");
        consoleHandler.handle(new LogRecord(LogLevel.WARN, "警告: ディスク使用率が 80% を超えました", now));

        System.out.println("\n--- ERROR ログ（全ハンドラーが処理）---");
        consoleHandler.handle(new LogRecord(LogLevel.ERROR, "エラー: データベース接続に失敗しました", now));

        System.out.println("\n--- LogRecord record の確認 ---");
        var record1 = new LogRecord(LogLevel.ERROR, "テストエラー", now);
        var record2 = new LogRecord(LogLevel.ERROR, "テストエラー", now);
        System.out.println("record1: " + record1);
        System.out.println("record1.equals(record2): " + record1.equals(record2)); // true
    }
}
