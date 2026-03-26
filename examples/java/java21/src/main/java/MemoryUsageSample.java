import java.util.ArrayList;

public class MemoryUsageSample {

    // メモリスナップショットを保持する record（Java 16+）
    record MemorySnapshot(long maxKb, long totalKb, long usedKb, long freeKb) {
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
    }

    // メモリ計測イベントを表す sealed interface（Java 17+）
    sealed interface MemoryEvent {
        record Before(MemorySnapshot snap) implements MemoryEvent {}
        record After(MemorySnapshot snap) implements MemoryEvent {}
    }

    // イベントに応じてラベルを出し分ける（Java 21 パターンマッチング switch）
    static void printEvent(MemoryEvent event) {
        switch (event) {
            case MemoryEvent.Before e -> {
                System.out.println("--- 計測前 ---");
                printSnapshot(e.snap());
            }
            case MemoryEvent.After e -> {
                System.out.println("--- 計測後 ---");
                printSnapshot(e.snap());
            }
        }
    }

    static void printSnapshot(MemorySnapshot snap) {
        System.out.printf("最大ヒープ   : %,d KB%n", snap.maxKb());
        System.out.printf("確保済みヒープ: %,d KB%n", snap.totalKb());
        System.out.printf("使用中       : %,d KB%n", snap.usedKb());
        System.out.printf("空き         : %,d KB%n", snap.freeKb());
    }

    // 大量データを生成してメモリ変化を計測
    static void measureLargeList() {
        printEvent(new MemoryEvent.Before(MemorySnapshot.capture()));

        var list = new ArrayList<String>();
        for (int i = 0; i < 100_000; i++) {
            list.add("item-" + i);
        }
        printEvent(new MemoryEvent.After(MemorySnapshot.capture()));

        list = null;
        System.gc(); // GC 要求（実行は JVM 次第）
        try { Thread.sleep(100); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        System.out.println("--- GC 後 ---");
        printSnapshot(MemorySnapshot.capture());
    }

    public static void main(String[] args) {
        System.out.println("=== ヒープメモリ計測 ===");
        measureLargeList();
    }
}
