import java.util.logging.*;
import java.io.*;

public class LoggingSample {

    // クラス専用のロガーを取得（クラス名をロガー名に使うのがベストプラクティス）
    private static final Logger logger = Logger.getLogger(LoggingSample.class.getName());

    // コンソールハンドラーを設定
    public static void setupLogger() {
        // デフォルトの ConsoleHandler を除去して独自設定する
        Logger rootLogger = Logger.getLogger("");
        for (Handler handler : rootLogger.getHandlers()) {
            rootLogger.removeHandler(handler);
        }

        // コンソールハンドラー（INFO 以上を出力）
        ConsoleHandler consoleHandler = new ConsoleHandler();
        consoleHandler.setLevel(Level.INFO);
        consoleHandler.setFormatter(new SimpleFormatter());

        logger.addHandler(consoleHandler);
        logger.setLevel(Level.ALL); // ロガー自体は ALL レベル以上を受け付ける
        logger.setUseParentHandlers(false); // 親ロガーへの伝播を停止
    }

    // 各ログレベルの使い方
    public static void demonstrateLevels() {
        logger.severe("SEVERE: システム障害・即時対応が必要なエラー");
        logger.warning("WARNING: 想定外の状況だが処理は継続できる");
        logger.info("INFO: 正常な業務ログ（処理開始・終了など）");
        logger.fine("FINE: デバッグ情報（通常は出力しない）");
        logger.finer("FINER: より詳細なデバッグ情報");
        logger.finest("FINEST: 最も詳細なトレース情報");
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
        // 文字列結合は Logger.isLoggable() で事前チェック
        if (logger.isLoggable(Level.FINE)) {
            // FINE レベルが有効なときだけ文字列結合を実行
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
    }
}
