public class JvmOptionsSample {

    public static void main(String[] args) {
        // 現在の JVM ヒープ設定を表示
        Runtime runtime = Runtime.getRuntime();
        System.out.println("=== JVM メモリ情報 ===");
        System.out.println("最大ヒープ (-Xmx): " + (runtime.maxMemory() / (1024 * 1024)) + " MB");
        System.out.println("現在のヒープ (-Xms 相当): " + (runtime.totalMemory() / (1024 * 1024)) + " MB");
        System.out.println("空きヒープ: " + (runtime.freeMemory() / (1024 * 1024)) + " MB");
        System.out.println("CPU コア数: " + runtime.availableProcessors());

        // ManagementFactory で詳細情報を取得
        java.lang.management.MemoryMXBean memBean =
            java.lang.management.ManagementFactory.getMemoryMXBean();
        java.lang.management.MemoryUsage heapUsage = memBean.getHeapMemoryUsage();
        java.lang.management.MemoryUsage nonHeapUsage = memBean.getNonHeapMemoryUsage();

        System.out.println("\n=== ヒープメモリ詳細 ===");
        System.out.println("使用中: " + (heapUsage.getUsed() / (1024 * 1024)) + " MB");
        System.out.println("コミット済み: " + (heapUsage.getCommitted() / (1024 * 1024)) + " MB");
        System.out.println("最大: " + (heapUsage.getMax() / (1024 * 1024)) + " MB");

        System.out.println("\n=== 非ヒープメモリ（クラス定義など）===");
        System.out.println("使用中: " + (nonHeapUsage.getUsed() / (1024 * 1024)) + " MB");

        // GC 情報
        System.out.println("\n=== GC 情報 ===");
        for (java.lang.management.GarbageCollectorMXBean gcBean :
             java.lang.management.ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("GC 名: " + gcBean.getName());
            System.out.println("  回数: " + gcBean.getCollectionCount());
            System.out.println("  累計時間: " + gcBean.getCollectionTime() + " ms");
        }

        System.out.println("\n=== よく使う JVM オプション ===");
        System.out.println("-Xms256m      : 初期ヒープサイズ 256MB");
        System.out.println("-Xmx1g        : 最大ヒープサイズ 1GB");
        System.out.println("-XX:+UseG1GC  : G1GC を使用（Java 9+ デフォルト）");
        System.out.println("-XX:+PrintGCDetails : GC の詳細ログ出力");
        System.out.println("-XX:+HeapDumpOnOutOfMemoryError : OOM 時にヒープダンプ");
    }
}
