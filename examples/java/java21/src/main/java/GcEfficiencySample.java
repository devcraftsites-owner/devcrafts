import java.util.WeakHashMap;
import java.util.concurrent.Executors;

public class GcEfficiencySample {

    // キャッシュ戦略を sealed interface でモデリング（Java 17+）
    sealed interface CacheStrategy { // Java 17+
        record StrongRef(int maxSize) implements CacheStrategy {}
        record WeakRef() implements CacheStrategy {}
        record SoftRef() implements CacheStrategy {}
    }

    // WeakReference: GC が必要な時に自動的に解放される参照
    static class SmartCache {
        private final WeakHashMap<String, byte[]> cache = new WeakHashMap<>();

        void put(String key, byte[] data) {
            cache.put(key, data);
        }

        byte[] get(String key) {
            return cache.get(key);
        }

        int size() {
            return cache.size();
        }
    }

    // キャッシュ戦略の説明を switch パターンマッチングで返す（Java 21）
    static String describeCacheStrategy(CacheStrategy strategy) {
        return switch (strategy) { // Java 21
            case CacheStrategy.StrongRef s ->
                "強参照キャッシュ（最大 " + s.maxSize() + " 件）: GC に回収されない。OOM に注意。";
            case CacheStrategy.WeakRef w ->
                "WeakReference キャッシュ: GC が必要なときに自動解放。ヒット率が下がる可能性あり。";
            case CacheStrategy.SoftRef s ->
                "SoftReference キャッシュ: メモリ不足時のみ GC に回収。キャッシュとして最適。";
        };
    }

    // 短命オブジェクト設計
    static long processData(int count) {
        var sum = 0L;
        for (int i = 0; i < count; i++) {
            var temp = "item-" + i;
            sum += temp.length();
        }
        return sum;
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== FullGC を避けるメモリ設計 ===");

        // キャッシュ戦略の選択肢を表示
        System.out.println("\n--- キャッシュ戦略 ---");
        System.out.println(describeCacheStrategy(new CacheStrategy.StrongRef(1000)));
        System.out.println(describeCacheStrategy(new CacheStrategy.WeakRef()));
        System.out.println(describeCacheStrategy(new CacheStrategy.SoftRef()));

        // WeakReference の動作確認
        System.out.println("\n--- WeakReference 動作確認 ---");
        var cache = new SmartCache();
        byte[] data = new byte[10 * 1024 * 1024]; // 10MB
        cache.put("large-data", data);
        System.out.println("キャッシュサイズ（GC前）: " + cache.size());

        data = null;
        System.gc();
        Thread.sleep(100);
        System.out.println("キャッシュサイズ（GC後）: " + cache.size());

        // 短命オブジェクト設計
        System.out.println("\n--- 短命オブジェクト設計 ---");
        var rt = Runtime.getRuntime();
        var before = rt.totalMemory() - rt.freeMemory();
        var result = processData(100000);
        System.gc();
        Thread.sleep(100);
        var after = rt.totalMemory() - rt.freeMemory();
        System.out.println("処理結果: " + result);
        System.out.println("メモリ差: " + ((after - before) / 1024) + " KB");

        // Java 21 Virtual Thread: Platform Thread よりスタックが軽量なので FullGC を起こしにくい
        System.out.println("\n--- Virtual Thread のメモリ効率（Java 21+）---");
        var beforeVt = rt.totalMemory() - rt.freeMemory();
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) { // Java 21+
            for (int i = 0; i < 10000; i++) {
                executor.submit(() -> {
                    // 軽量なスタック（~数KB）で大量のスレッドを処理
                    return Thread.currentThread().isVirtual();
                });
            }
        }
        Thread.sleep(200);
        var afterVt = rt.totalMemory() - rt.freeMemory();
        System.out.println("Virtual Thread 10000個のメモリ増加: " + ((afterVt - beforeVt) / (1024 * 1024)) + " MB");
        System.out.println("Platform Thread なら ~10GB 必要（1スレッド ~1MB）");

        var bestPractices = """
            === FullGC を防ぐベストプラクティス ===
            1. オブジェクトのスコープを小さく保つ
            2. 大きなコレクションは適宜クリア・null 代入
            3. キャッシュには WeakReference / SoftReference を活用
            4. -Xmx を適切に設定（大きすぎると GC 時間増大）
            5. G1GC（Java 9+ デフォルト）/ ZGC（Java 15+）を使う
            6. Java 21 Virtual Thread: スタック軽量でヒープ圧迫が少ない
            """; // Java 15+
        System.out.println(bestPractices);
    }
}
