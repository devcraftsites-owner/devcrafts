import java.util.List;
import java.util.logging.*;

public class LoggingSample {

    // クラス専用のロガーを取得（クラス名をロガー名に使うのがベストプラクティス）
    private static final Logger logger = Logger.getLogger(LoggingSample.class.getName());

    // ログエントリを表す record（Java 16+）
    record LogEntry(Level level, String message) {}

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

    // record のリストを使ってまとめてログ出力
    public static void demonstrateLevels() {
        var entries = List.of(
                new LogEntry(Level.SEVERE, "SEVERE: システム障害・即時対応が必要なエラー"),
                new LogEntry(Level.WARNING, "WARNING: 想定外の状況だが処理は継続できる"),
                new LogEntry(Level.INFO, "INFO: 正常な業務ログ（処理開始・終了など）"),
                new LogEntry(Level.FINE, "FINE: デバッグ情報（通常は出力しない）"),
                new LogEntry(Level.FINER, "FINER: より詳細なデバッグ情報"),
                new LogEntry(Level.FINEST, "FINEST: 最も詳細なトレース情報")
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

    // メッセージの遅延評価（パフォーマンス最適化）
    public static void lazyLogging() {
        if (logger.isLoggable(Level.FINE)) {
            logger.fine("詳細情報: " + System.currentTimeMillis());
        }
    }

    public static void main(String[] args) {
        setupLogger();

        logger.info("アプリケーション起動");
        demonstrateLevels();
        logWithException();
        lazyLogging();
        logger.info("アプリケーション終了");

        // テキストブロックを使った設定確認（Java 15+）
        var configInfo = """
                === ロガー設定情報 ===
                ロガー名: %s
                ログレベル: %s
                ハンドラー数: %d
                """.formatted(
                logger.getName(),
                logger.getLevel(),
                logger.getHandlers().length
        );
        System.out.println(configInfo);
    }
}
