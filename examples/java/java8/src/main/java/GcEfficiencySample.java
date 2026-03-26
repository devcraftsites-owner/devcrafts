import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;
import java.util.WeakHashMap;

public class GcEfficiencySample {

    // アンチパターン: 不要な参照を保持し続ける
    static class BadCache {
        private final List<byte[]> cache = new ArrayList<>();

        void addData(byte[] data) {
            cache.add(data); // 追加するだけで削除しない → 旧世代に蓄積
        }
    }

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
        long sum = 0;
        for (int i = 0; i < count; i++) {
            // ループ内のオブジェクトはすぐ GC 対象 → Young Generation で回収
            String temp = "item-" + i;
            sum += temp.length();
        }
        return sum; // temp は全てスコープを外れ GC 可能
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== FullGC を避けるメモリ設計 ===");

        // WeakReference の動作確認
        SmartCache cache = new SmartCache();
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
        Runtime rt = Runtime.getRuntime();
        long before = rt.totalMemory() - rt.freeMemory();
        long result = processData(100000);
        System.gc();
        Thread.sleep(100);
        long after = rt.totalMemory() - rt.freeMemory();
        System.out.println("処理結果: " + result);
        System.out.println("メモリ差: " + ((after - before) / 1024) + " KB（短命オブジェクトは回収済み）");

        System.out.println("\n=== FullGC を防ぐベストプラクティス ===");
        System.out.println("1. オブジェクトのスコープを小さく保つ");
        System.out.println("2. 大きなコレクションは適宜クリア・null 代入");
        System.out.println("3. キャッシュには WeakReference / SoftReference を活用");
        System.out.println("4. -Xmx を適切に設定（大きすぎると GC 時間増大）");
        System.out.println("5. G1GC / ZGC を使う（Java 9+/15+）");
    }
}
