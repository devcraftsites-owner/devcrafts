import java.util.WeakHashMap;

public class GcEfficiencySample {

    // WeakReference: GC が必要な時に自動的に解放される参照
    static class SmartCache {
        private final WeakHashMap<String, byte[]> cache = new WeakHashMap<>();

        void put(String key, byte[] data) {
            cache.put(key, data);
        }

        byte[] get(String key) {
            return cache.get(key); // GC 後は null になる可能性あり
        }

        int size() {
            return cache.size();
        }
    }

    // 短命オブジェクト設計: メソッドスコープでのみ参照を持つ
    static long processData(int count) {
        var sum = 0L;
        for (int i = 0; i < count; i++) {
            // var で型推論（Java 10+）
            var temp = "item-" + i;
            sum += temp.length();
        }
        return sum;
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== FullGC を避けるメモリ設計 ===");

        // WeakReference の動作確認
        var cache = new SmartCache();
        byte[] data = new byte[10 * 1024 * 1024]; // 10MB
        cache.put("large-data", data);
        System.out.println("キャッシュサイズ（GC前）: " + cache.size());

        // 強参照を切る
        data = null;
        System.gc();
        Thread.sleep(100);
        System.out.println("キャッシュサイズ（GC後）: " + cache.size()); // 0 になる可能性

        // 短命オブジェクト設計
        System.out.println("\n=== 短命オブジェクト設計 ===");
        var rt = Runtime.getRuntime();
        var before = rt.totalMemory() - rt.freeMemory();
        var result = processData(100000);
        System.gc();
        Thread.sleep(100);
        var after = rt.totalMemory() - rt.freeMemory();
        System.out.println("処理結果: " + result);
        System.out.println("メモリ差: " + ((after - before) / 1024) + " KB（短命オブジェクトは回収済み）");

        // テキストブロックでベストプラクティスを表示（Java 15+）
        var bestPractices = """
            === FullGC を防ぐベストプラクティス ===
            1. オブジェクトのスコープを小さく保つ
            2. 大きなコレクションは適宜クリア・null 代入
            3. キャッシュには WeakReference / SoftReference を活用
            4. -Xmx を適切に設定（大きすぎると GC 時間増大）
            5. G1GC（Java 9+ デフォルト）/ ZGC（Java 15+）を使う
            6. record で不変オブジェクトを活用（短命化しやすい）
            """; // Java 15+
        System.out.println(bestPractices);
    }
}
