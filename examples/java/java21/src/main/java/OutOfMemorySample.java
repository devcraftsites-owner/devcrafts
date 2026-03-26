import java.util.ArrayList;
import java.util.List;
import java.util.WeakHashMap;

/**
 * OutOfMemoryError / StackOverflowError のパターンと回避策（Java 21+）。
 * sealed interface + パターンマッチングでメモリ問題の種別を型安全に分類。
 */
public class OutOfMemorySample {

    /** メモリ問題の種別を sealed interface で分類（Java 21+） */
    sealed interface MemoryIssue {
        /** ヒープ枯渇 */
        record HeapExhaustion(String cause, String fix) implements MemoryIssue {}
        /** メモリリーク */
        record MemoryLeak(String source, String fix)    implements MemoryIssue {}
        /** スタックオーバーフロー */
        record StackOverflow(int depth, String fix)     implements MemoryIssue {}
    }

    /** パターンマッチングで問題種別の説明を返す（Java 21+） */
    public static String describe(MemoryIssue issue) {
        return switch (issue) {
            case MemoryIssue.HeapExhaustion(var cause, var fix) ->
                "【ヒープ枯渇】原因: " + cause + " | 対策: " + fix;
            case MemoryIssue.MemoryLeak(var src, var fix) ->
                "【メモリリーク】発生源: " + src + " | 対策: " + fix;
            case MemoryIssue.StackOverflow(var depth, var fix) ->
                "【スタックオーバーフロー】再帰深さ: " + depth + " | 対策: " + fix;
        };
    }

    // ---- ヒープ枯渇のデモ ----

    public static void heapExhaustion() {
        var list = new ArrayList<byte[]>();
        while (true) {
            list.add(new byte[1024 * 1024]); // -Xmx64m で実行すると OOM
        }
    }

    // ---- メモリリークのデモ ----

    record SessionData(String userId, byte[] payload) {}

    private static final java.util.Map<String, SessionData> SESSIONS
            = new java.util.HashMap<>();

    public static void registerSession(String id, byte[] data) {
        SESSIONS.put(id, new SessionData(id, data));
    }

    // ---- WeakHashMap で自動解放 ----

    private static final WeakHashMap<Object, byte[]> WEAK_CACHE = new WeakHashMap<>();

    public static void cacheWeakly(Object key, byte[] data) {
        WEAK_CACHE.put(key, data);
    }

    // ---- StackOverflowError のデモ ----

    public static int infiniteRecursion(int n) {
        return infiniteRecursion(n + 1);
    }

    /** 末尾再帰的な処理はループに書き換えること（Java は TCO 非対応） */
    public static long sumUpTo(long n) {
        long result = 0;
        for (long i = 1; i <= n; i++) {
            result += i;
        }
        return result;
    }

    public static List<String> recommendedFlags() {
        return List.of(
            "-Xmx256m",
            "-XX:+HeapDumpOnOutOfMemoryError",
            "-XX:HeapDumpPath=/tmp/dump.hprof"
        );
    }

    public static void main(String[] args) {
        // パターンマッチングで問題種別を説明
        var issues = List.of(
            new MemoryIssue.HeapExhaustion(
                "ArrayList に大量オブジェクトを追加",
                "-Xmx 増加 または データを分割処理"),
            new MemoryIssue.MemoryLeak(
                "static Map への無限追加",
                "WeakHashMap または LRU キャッシュに変更"),
            new MemoryIssue.StackOverflow(
                Integer.MAX_VALUE,
                "再帰をループに書き換え（Java は TCO 非対応）")
        );

        System.out.println("=== メモリ問題の分類 ===");
        issues.forEach(i -> System.out.println(describe(i)));

        System.out.println("\n=== 推奨 JVM フラグ ===");
        recommendedFlags().forEach(System.out::println);

        System.out.println("\n=== StackOverflowError を安全にデモ ===");
        try {
            infiniteRecursion(0);
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError を捕捉");
        }

        System.out.println("ループ実装（安全）: sumUpTo(100) = " + sumUpTo(100));
    }
}
