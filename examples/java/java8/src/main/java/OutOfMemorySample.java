import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.WeakHashMap;

/**
 * OutOfMemoryError / StackOverflowError の再現と回避パターン（Java 8+）。
 *
 * ⚠️ このサンプルの main() を実行するとヒープが枯渇します。
 *    IDE から直接実行せず、-Xmx64m 等でヒープ上限を下げてから実行してください。
 *    テストコードでは安全な範囲でのみ検証することを推奨します。
 */
public class OutOfMemorySample {

    // ---- パターン1: ヒープ枯渇（大量オブジェクトの蓄積）----

    /**
     * ArrayList に大量オブジェクトを追加してヒープを使い切る。
     * 実行すると java.lang.OutOfMemoryError: Java heap space が発生。
     *
     * 再現方法: java -Xmx64m OutOfMemorySample
     */
    public static void heapExhaustion() {
        List<byte[]> list = new ArrayList<>();
        while (true) {
            // 1MB のバイト配列を繰り返し追加
            list.add(new byte[1024 * 1024]);
        }
        // → OutOfMemoryError: Java heap space
    }

    // ---- パターン2: メモリリーク（static Map への無限追加）----

    /** static フィールドに保持されると GC できない（メモリリークの典型例） */
    private static final Map<String, byte[]> CACHE = new HashMap<>();

    /**
     * リクエストごとに static Map に追加し続けると、
     * GC が解放できずメモリリークになる。
     *
     * 対策: 容量上限付き LRU キャッシュや WeakHashMap を使う。
     */
    public static void addToCache(String key, byte[] data) {
        CACHE.put(key, data); // ← これが溜まり続けると OOM
    }

    // ---- パターン3: WeakHashMap を使ったメモリリーク回避 ----

    /**
     * WeakHashMap はキーへの強参照がなくなると GC が自動的にエントリを削除する。
     * キャッシュ用途に適しているが、キーが常に保持されている場合は効果がない。
     */
    private static final WeakHashMap<String, byte[]> WEAK_CACHE = new WeakHashMap<>();

    public static void addToWeakCache(String key, byte[] data) {
        WEAK_CACHE.put(key, data); // キーが GC されればエントリも消える
    }

    // ---- パターン4: StackOverflowError（無限再帰）----

    /**
     * 終了条件のない再帰呼び出しはスタックを使い切り StackOverflowError を起こす。
     * デフォルトのスタックサイズは JVM によるが約 512KB〜1MB 程度。
     *
     * 再現: java -Xss256k OutOfMemorySample（スタックを小さく設定）
     */
    public static int infiniteRecursion(int n) {
        return infiniteRecursion(n + 1); // 終了条件なし → StackOverflowError
    }

    // ---- パターン5: ヒープダンプ取得の JVM フラグ ----

    /**
     * 以下の JVM フラグを追加すると、OOM 発生時にヒープダンプを自動取得できる。
     * 取得した hprof ファイルは Eclipse MAT や VisualVM で分析できる。
     *
     * -XX:+HeapDumpOnOutOfMemoryError
     * -XX:HeapDumpPath=/tmp/heapdump.hprof
     */
    public static String heapDumpFlags() {
        return "-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heapdump.hprof";
    }

    public static void main(String[] args) {
        System.out.println("=== OOM パターン説明 ===");
        System.out.println("1. ヒープ枯渇: heapExhaustion() を呼ぶと OOM が発生します");
        System.out.println("   再現: java -Xmx64m OutOfMemorySample");
        System.out.println();
        System.out.println("2. メモリリーク: static Map への無限追加");
        System.out.println("   対策: WeakHashMap または LRU キャッシュを使う");
        System.out.println();
        System.out.println("3. StackOverflow: 終了条件のない再帰");
        System.out.println("   対策: 再帰をループに書き換える");
        System.out.println();
        System.out.println("ヒープダンプ取得フラグ: " + heapDumpFlags());

        // StackOverflowError の安全なデモ（try-catch で捕捉）
        System.out.println("\n=== StackOverflowError を安全に捕捉 ===");
        try {
            infiniteRecursion(0);
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError を捕捉しました");
        }
        // ※ StackOverflowError は Error のサブクラス。
        //   通常の業務コードでは catch しないこと。
    }
}
