import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryUsage;

public class JvmOptionsSample {

    public static void main(String[] args) {
        // var で型推論を活用（Java 17）
        var runtime = Runtime.getRuntime();
        System.out.println("=== JVM メモリ情報 ===");
        System.out.println("最大ヒープ (-Xmx): " + (runtime.maxMemory() / (1024 * 1024)) + " MB");
        System.out.println("現在のヒープ (-Xms 相当): " + (runtime.totalMemory() / (1024 * 1024)) + " MB");
        System.out.println("空きヒープ: " + (runtime.freeMemory() / (1024 * 1024)) + " MB");
        System.out.println("CPU コア数: " + runtime.availableProcessors());

        // ManagementFactory で詳細情報を取得
        var memBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memBean.getHeapMemoryUsage();
        MemoryUsage nonHeapUsage = memBean.getNonHeapMemoryUsage();

        System.out.println("\n=== ヒープメモリ詳細 ===");
        System.out.println("使用中: " + (heapUsage.getUsed() / (1024 * 1024)) + " MB");
        System.out.println("コミット済み: " + (heapUsage.getCommitted() / (1024 * 1024)) + " MB");
        System.out.println("最大: " + (heapUsage.getMax() / (1024 * 1024)) + " MB");

        System.out.println("\n=== 非ヒープメモリ（クラス定義など）===");
        System.out.println("使用中: " + (nonHeapUsage.getUsed() / (1024 * 1024)) + " MB");

        // GC 情報
        System.out.println("\n=== GC 情報 ===");
        for (GarbageCollectorMXBean gcBean : ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("GC 名: " + gcBean.getName());
            System.out.println("  回数: " + gcBean.getCollectionCount());
            System.out.println("  累計時間: " + gcBean.getCollectionTime() + " ms");
        }

        // テキストブロックでよく使う JVM オプションを一覧表示（Java 15+）
        var jvmOptions = """
            === よく使う JVM オプション ===
            -Xms256m                         : 初期ヒープサイズ 256MB
            -Xmx1g                           : 最大ヒープサイズ 1GB
            -XX:+UseG1GC                     : G1GC を使用（Java 9+ デフォルト）
            -XX:+UseZGC                      : ZGC を使用（Java 15+ 本番対応、低レイテンシ）
            -XX:+PrintGCDetails              : GC の詳細ログ出力（Java 8 まで）
            -Xlog:gc*                        : GC ログの統一形式出力（Java 9+）
            -XX:+HeapDumpOnOutOfMemoryError  : OOM 時にヒープダンプを自動生成
            -XX:HeapDumpPath=/tmp/heap.hprof : ヒープダンプの出力先
            """; // Java 15+
        System.out.println(jvmOptions);
    }
}
