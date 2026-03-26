import java.util.*;
import java.util.logging.*;

public class ExceptionChainSample {

    private static final Logger logger = Logger.getLogger(ExceptionChainSample.class.getName());

    // 例外情報を保持する record（Java 16+）
    record ExceptionInfo(String type, String message) {}

    // 例外チェーン中の位置を型安全に表現する sealed interface（Java 17+）
    sealed interface ExceptionLevel {
        record Root()    implements ExceptionLevel {}  // 根本原因（最下層）
        record Wrapper() implements ExceptionLevel {}  // 中間ラップ例外
        record Top()     implements ExceptionLevel {}  // 最上位例外（ユーザーに見える層）
    }

    // カスタム例外クラス
    static class DataAccessException extends Exception {
        public DataAccessException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    static class ServiceException extends Exception {
        public ServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    // 例外チェーン中の位置を分類する（パターンマッチング switch - Java 21+）
    public static ExceptionLevel classifyException(Throwable e, int depth) {
        if (depth == 0) {
            return new ExceptionLevel.Top();
        }
        if (e.getCause() == null) {
            return new ExceptionLevel.Root();
        }
        return new ExceptionLevel.Wrapper();
    }

    // DB アクセス層: 低レベルの例外を DataAccessException にラップ
    public static String findUser(int id) throws DataAccessException {
        try {
            if (id <= 0) {
                throw new IllegalArgumentException("IDは1以上を指定してください: " + id);
            }
            if (id > 100) {
                throw new RuntimeException("DB接続タイムアウト（シミュレーション）");
            }
            return "User-" + id;
        } catch (Exception e) {
            // 原因例外（cause）を保持したままラップ
            throw new DataAccessException("ユーザー取得失敗: id=" + id, e);
        }
    }

    // サービス層: DataAccessException を ServiceException にラップ
    public static String getUserDisplayName(int id) throws ServiceException {
        try {
            var user = findUser(id);
            return user.toUpperCase();
        } catch (DataAccessException e) {
            throw new ServiceException("ユーザー表示名の取得に失敗しました", e);
        }
    }

    // 例外チェーンを辿って ExceptionInfo のリストを構築する
    public static List<ExceptionInfo> buildExceptionChain(Throwable e) {
        var chain = new ArrayList<ExceptionInfo>();
        var current = e;
        while (current != null) {
            chain.add(new ExceptionInfo(
                current.getClass().getSimpleName(),
                current.getMessage()
            ));
            current = current.getCause(); // getCause() で原因例外を遡る
        }
        return chain;
    }

    // 例外チェーンをラベル付きで表示する（パターンマッチング switch - Java 21+）
    public static void printExceptionChain(Throwable e) {
        var current = e;
        int depth = 0;
        while (current != null) {
            var level = classifyException(current, depth);
            // パターンマッチング switch でラベルを決定
            var label = switch (level) {
                case ExceptionLevel.Top t     -> "[TOP]  ";
                case ExceptionLevel.Wrapper w -> "[WRAP] ";
                case ExceptionLevel.Root r    -> "[ROOT] ";
            };
            System.out.println("  " + "  ".repeat(depth) + label
                + current.getClass().getSimpleName() + ": " + current.getMessage());
            current = current.getCause();
            depth++;
        }
    }

    // OK: Logger でスタックトレースを記録する
    public static void goodLogging(String message, Exception e) {
        logger.log(Level.SEVERE, message, e); // スタックトレースごとログに記録
    }

    public static void main(String[] args) {
        System.out.println("=== 正常ケース ===");
        try {
            System.out.println(getUserDisplayName(1));
        } catch (ServiceException e) {
            logger.log(Level.SEVERE, "サービスエラー", e);
        }

        System.out.println("\n=== 例外チェーンのデモ（DBタイムアウト）===");
        try {
            getUserDisplayName(200); // DB タイムアウトをシミュレート
        } catch (ServiceException e) {
            System.out.println("例外チェーン:");
            printExceptionChain(e);
            goodLogging("ユーザー取得でエラーが発生しました", e);
        }

        System.out.println("\n=== 引数エラーの例外チェーン ===");
        try {
            getUserDisplayName(-1); // 不正 ID
        } catch (ServiceException e) {
            System.out.println("例外チェーン:");
            printExceptionChain(e);
        }
    }
}
