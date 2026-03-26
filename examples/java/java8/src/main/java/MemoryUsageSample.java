import java.util.ArrayList;
import java.util.List;

public class MemoryUsageSample {

    // ヒープメモリ情報を表示するヘルパー
    static void printMemoryInfo(String label) {
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;

        System.out.println("--- " + label + " ---");
        System.out.printf("最大ヒープ   : %,d KB%n", maxMemory / 1024);
        System.out.printf("確保済みヒープ: %,d KB%n", totalMemory / 1024);
        System.out.printf("使用中       : %,d KB%n", usedMemory / 1024);
        System.out.printf("空き         : %,d KB%n", freeMemory / 1024);
    }

    // 大量データを生成してメモリ変化を計測
    static void measureLargeList() {
        printMemoryInfo("リスト生成前");
        List<String> list = new ArrayList<>();
        for (int i = 0; i < 100_000; i++) {
            list.add("item-" + i);
        }
        printMemoryInfo("リスト生成後（100万件）");
        list = null;
        System.gc(); // GC 要求（実行は JVM 次第）
        try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        printMemoryInfo("GC 後");
    }

    public static void main(String[] args) {
        System.out.println("=== ヒープメモリ計測 ===");
        measureLargeList();
    }
}
