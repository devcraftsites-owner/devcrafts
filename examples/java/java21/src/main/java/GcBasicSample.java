import java.util.concurrent.Executors;

public class GcBasicSample {

    // GC の動作を観察するためのサンプルクラス（Java 21: record + sealed interface）
    record MemoryStatus(String label, long usedMb, long freeMb, long totalMb, long maxMb) { // Java 17+
        void print() {
            System.out.println("--- " + label + " ---");
            System.out.println("  使用中: " + usedMb + " MB");
            System.out.println("  空き:   " + freeMb + " MB");
            System.out.println("  合計:   " + totalMb + " MB");
            System.out.println("  最大:   " + maxMb + " MB");
        }
    }

    // GC イベントの種類を sealed interface でモデリング（Java 17+）
    sealed interface GcEvent { // Java 17+
        record MinorGc(long durationMs) implements GcEvent {}
        record FullGc(long durationMs) implements GcEvent {}
        record NoGc() implements GcEvent {}
    }

    // GcEvent に応じたメッセージを switch パターンマッチングで返す（Java 21）
    static String describeGcEvent(GcEvent event) {
        return switch (event) { // Java 21 パターンマッチング switch
            case GcEvent.MinorGc e -> "Minor GC 発生: " + e.durationMs() + " ms（Young Generation 回収）";
            case GcEvent.FullGc e  -> "Full GC 発生: " + e.durationMs() + " ms（全世代回収・アプリ一時停止）";
            case GcEvent.NoGc e    -> "GC なし（メモリ十分）";
        };
    }

    // ランタイムのメモリ情報を取得して record に包む
    static MemoryStatus captureMemoryStatus(String label) {
        var runtime = Runtime.getRuntime();
        var totalMemory = runtime.totalMemory();
        var freeMemory = runtime.freeMemory();
        var usedMemory = totalMemory - freeMemory;
        var maxMemory = runtime.maxMemory();
        return new MemoryStatus(
            label,
            usedMemory / (1024 * 1024),
            freeMemory / (1024 * 1024),
            totalMemory / (1024 * 1024),
            maxMemory / (1024 * 1024)
        );
    }

    public static void main(String[] args) throws InterruptedException {
        captureMemoryStatus("初期状態").print();

        // 短命オブジェクトの生成（Young Generation に入る）
        System.out.println("\n短命オブジェクトを大量生成...");
        for (int i = 0; i < 1000; i++) {
            var temp = new String("一時的な文字列 " + i);
            if (i % 100 == 0) {
                System.out.print(i + " ");
            }
        }
        System.out.println();

        captureMemoryStatus("短命オブジェクト生成後").print();

        System.gc();
        Thread.sleep(100);
        captureMemoryStatus("GC 後").print();

        // GcEvent のデモ
        System.out.println("\n=== GC イベント説明 ===");
        System.out.println(describeGcEvent(new GcEvent.MinorGc(5)));
        System.out.println(describeGcEvent(new GcEvent.FullGc(200)));
        System.out.println(describeGcEvent(new GcEvent.NoGc()));

        // Java 21: Virtual Threads のメモリ効率
        // Platform Thread: OS スレッドにマップ、スタック ~1MB
        // Virtual Thread : JVM が管理、スタック ~数KB（GC プレッシャーが低い）
        System.out.println("\n=== Virtual Thread のメモリ効率（Java 21+）===");
        var before = captureMemoryStatus("Virtual Thread 生成前");
        before.print();

        // Virtual Thread を 1000 個生成（Platform Thread より大幅にメモリ消費が少ない）
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) { // Java 21+
            for (int i = 0; i < 1000; i++) {
                executor.submit(() -> {
                    // 軽量なスタックを持つ Virtual Thread
                    return Thread.currentThread().isVirtual();
                });
            }
        }

        Thread.sleep(100);
        var after = captureMemoryStatus("Virtual Thread 生成後（完了後）");
        after.print();
        System.out.println("メモリ増加量: " + (after.usedMb() - before.usedMb()) + " MB");
        System.out.println("Virtual Thread はスタックが ~数KB と軽量なので GC プレッシャーが低い");
    }
}
