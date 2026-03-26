import java.util.ArrayList;
import java.util.List;
import java.util.WeakHashMap;

/**
 * OutOfMemoryError / StackOverflowError のパターンと回避策（Java 17+）。
 */
public class OutOfMemorySample {

    // ---- パターン1: ヒープ枯渇 ----

    /**
     * ArrayList に大量オブジェクトを追加してヒープを使い切る。
     * java -Xmx64m で実行すると OutOfMemoryError: Java heap space が発生。
     */
    public static void heapExhaustion() {
        var list = new ArrayList<byte[]>();
        while (true) {
            list.add(new byte[1024 * 1024]); // 1MB ずつ追加
        }
    }

    // ---- パターン2: メモリリーク（static フィールド） ----

    /**
     * Java 17: record（値オブジェクト）を大量に static Map に追加するパターン。
     * GC が解放できず OOM になる典型例。
     */
    record SessionData(String userId, byte[] payload) {}

    // static フィールドは GC のルートになるため、中のオブジェクトが解放されない
    private static final java.util.Map<String, SessionData> SESSIONS
            = new java.util.HashMap<>();

    public static void registerSession(String id, byte[] data) {
        SESSIONS.put(id, new SessionData(id, data)); // 溜まり続けると OOM
    }

    // ---- パターン3: WeakHashMap で自動解放 ----

    private static final WeakHashMap<Object, byte[]> WEAK_CACHE = new WeakHashMap<>();

    public static void cacheWeakly(Object key, byte[] data) {
        WEAK_CACHE.put(key, data);
        // キーへの強参照が消えると GC がエントリを自動削除する
    }

    // ---- パターン4: StackOverflowError（無限再帰）----

    public static int infiniteRecursion(int n) {
        return infiniteRecursion(n + 1);
    }

    /** 末尾再帰的に書いてもJavaはTCOしないため、深い再帰はループに変換する */
    public static int safeCount(int n, int limit) {
        // 再帰の代わりにループで実装
        int result = 0;
        for (int i = n; i < limit; i++) {
            result = i;
        }
        return result;
    }

    // ---- JVM フラグ情報 ----

    /** OOM 発生時の推奨 JVM フラグを返す */
    public static List<String> recommendedFlags() {
        return List.of(
            "-Xmx256m                      // ヒープ上限（本番は適切に設定）",
            "-XX:+HeapDumpOnOutOfMemoryError  // OOM 時ヒープダンプ自動取得",
            "-XX:HeapDumpPath=/tmp/dump.hprof // ダンプ保存先",
            "-Xss512k                       // スタックサイズ（デフォルト通常 512k〜1m）"
        );
    }

    public static void main(String[] args) {
        System.out.println("=== 推奨 JVM フラグ ===");
        recommendedFlags().forEach(System.out::println);

        System.out.println("\n=== StackOverflowError を安全にデモ ===");
        try {
            infiniteRecursion(0);
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError を捕捉");
        }

        System.out.println("\n=== 安全な実装（ループ）===");
        System.out.println("safeCount(0, 5) = " + safeCount(0, 5));
    }
}
