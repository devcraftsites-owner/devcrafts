import java.util.List;
import java.util.logging.*;

public class LoggingSample {

    // クラス専用のロガーを取得（クラス名をロガー名に使うのがベストプラクティス）
    private static final Logger logger = Logger.getLogger(LoggingSample.class.getName());

    // ログの用途を表す sealed interface（Java 17+）
    sealed interface LogLevel {
        record Application() implements LogLevel {}  // 業務ログ（INFO 相当）
        record Debug() implements LogLevel {}        // デバッグ情報（FINE 相当）
        record Audit() implements LogLevel {}        // 監査ログ（SEVERE 相当）
    }

    // ログエントリを表す record
    record LogEntry(Level level, String message) {}

    // カスタムレベルを java.util.logging.Level にマッピング（パターンマッチング switch - Java 21+）
    public static Level getJulLevel(LogLevel logLevel) {
        return switch (logLevel) {
            case LogLevel.Application a -> Level.INFO;
            case LogLevel.Debug d -> Level.FINE;
            case LogLevel.Audit au -> Level.SEVERE;
        };
    }

    // カスタムレベルでログを記録
    public static void logWithCustomLevel(String message, LogLevel logLevel) {
        var level = getJulLevel(logLevel);
        var prefix = switch (logLevel) {
            case LogLevel.Application a -> "[APP]  ";
            case LogLevel.Debug d -> "[DEBUG]";
            case LogLevel.Audit au -> "[AUDIT]";
        };
        logger.log(level, prefix + " " + message);
    }

    // コンソールハンドラーを設定
    public static void setupLogger() {
        var rootLogger = Logger.getLogger("");
        for (var handler : rootLogger.getHandlers()) {
            rootLogger.removeHandler(handler);
        }

        var consoleHandler = new ConsoleHandler();
        consoleHandler.setLevel(Level.INFO);
        consoleHandler.setFormatter(new SimpleFormatter());

        logger.addHandler(consoleHandler);
        logger.setLevel(Level.ALL);
        logger.setUseParentHandlers(false);
    }

    // 各ログレベルの使い方
    public static void demonstrateLevels() {
        var entries = List.of(
                new LogEntry(Level.SEVERE, "SEVERE: システム障害・即時対応が必要なエラー"),
                new LogEntry(Level.WARNING, "WARNING: 想定外の状況だが処理は継続できる"),
                new LogEntry(Level.INFO, "INFO: 正常な業務ログ（処理開始・終了など）"),
                new LogEntry(Level.FINE, "FINE: デバッグ情報（通常は出力しない）")
        );
        entries.forEach(e -> logger.log(e.level(), e.message()));
    }

    // 例外をログに含める正しい方法
    public static void logWithException() {
        try {
            int result = 10 / 0; // 意図的な例外
            System.out.println(result); // 到達しない
        } catch (ArithmeticException e) {
            // NG: e.printStackTrace() は使わない
            // e.printStackTrace();

            // OK: logger でスタックトレースごと記録
            logger.log(Level.SEVERE, "計算処理でエラーが発生しました", e);
        }
    }

    public static void main(String[] args) {
        setupLogger();

        logger.info("アプリケーション起動");
        demonstrateLevels();
        logWithException();

        // カスタムレベルを使ったログ出力
        System.out.println("\n--- カスタムログレベル ---");
        logWithCustomLevel("ユーザーログイン: userId=12345", new LogLevel.Application());
        logWithCustomLevel("クエリ実行時間: 123ms", new LogLevel.Debug());
        logWithCustomLevel("設定変更: adminUser が実行", new LogLevel.Audit());

        logger.info("アプリケーション終了");
    }
}
