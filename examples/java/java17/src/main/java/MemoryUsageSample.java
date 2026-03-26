import java.util.ArrayList;

public class MemoryUsageSample {

    // メモリスナップショットを保持する record（Java 16+）
    record MemorySnapshot(long maxKb, long totalKb, long usedKb, long freeKb) {
        // 現在のヒープ状態をキャプチャするファクトリメソッド
        static MemorySnapshot capture() {
            var runtime = Runtime.getRuntime();
            var maxMemory = runtime.maxMemory();
            var totalMemory = runtime.totalMemory();
            var freeMemory = runtime.freeMemory();
            var usedMemory = totalMemory - freeMemory;
            return new MemorySnapshot(
                maxMemory / 1024,
                totalMemory / 1024,
                usedMemory / 1024,
                freeMemory / 1024
            );
        }

        void print(String label) {
            System.out.println("--- " + label + " ---");
            System.out.printf("最大ヒープ   : %,d KB%n", maxKb);
            System.out.printf("確保済みヒープ: %,d KB%n", totalKb);
            System.out.printf("使用中       : %,d KB%n", usedKb);
            System.out.printf("空き         : %,d KB%n", freeKb);
        }
    }

    // 大量データを生成してメモリ変化を計測
    static void measureLargeList() {
        MemorySnapshot.capture().print("リスト生成前");

        var list = new ArrayList<String>();
        for (int i = 0; i < 100_000; i++) {
            list.add("item-" + i);
        }
        MemorySnapshot.capture().print("リスト生成後（100万件）");

        list = null;
        System.gc(); // GC 要求（実行は JVM 次第）
        try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        MemorySnapshot.capture().print("GC 後");
    }

    public static void main(String[] args) {
        System.out.println("=== ヒープメモリ計測 ===");
        measureLargeList();
    }
}
