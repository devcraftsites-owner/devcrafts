import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryUsage;

public class JvmOptionsSample {

    // JVM オプションをグループ化する sealed interface（Java 17+）
    sealed interface JvmOption { // Java 17+
        record HeapOption(String flag, String description) implements JvmOption {}
        record GcOption(String flag, String description) implements JvmOption {}
        record DiagOption(String flag, String description) implements JvmOption {}
    }

    // JvmOption の種類を判定してカテゴリ名を返す（Java 21 パターンマッチング switch）
    static String categoryOf(JvmOption option) {
        return switch (option) { // Java 21
            case JvmOption.HeapOption o  -> "[ヒープサイズ]";
            case JvmOption.GcOption o    -> "[GC アルゴリズム]";
            case JvmOption.DiagOption o  -> "[診断・ログ]";
        };
    }

    public static void main(String[] args) {
        var runtime = Runtime.getRuntime();
        System.out.println("=== JVM メモリ情報 ===");
        System.out.println("最大ヒープ (-Xmx): " + (runtime.maxMemory() / (1024 * 1024)) + " MB");
        System.out.println("現在のヒープ (-Xms 相当): " + (runtime.totalMemory() / (1024 * 1024)) + " MB");
        System.out.println("空きヒープ: " + (runtime.freeMemory() / (1024 * 1024)) + " MB");
        System.out.println("CPU コア数: " + runtime.availableProcessors());

        var memBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapUsage = memBean.getHeapMemoryUsage();
        MemoryUsage nonHeapUsage = memBean.getNonHeapMemoryUsage();

        System.out.println("\n=== ヒープメモリ詳細 ===");
        System.out.println("使用中: " + (heapUsage.getUsed() / (1024 * 1024)) + " MB");
        System.out.println("コミット済み: " + (heapUsage.getCommitted() / (1024 * 1024)) + " MB");
        System.out.println("最大: " + (heapUsage.getMax() / (1024 * 1024)) + " MB");

        System.out.println("\n=== 非ヒープメモリ（クラス定義など）===");
        System.out.println("使用中: " + (nonHeapUsage.getUsed() / (1024 * 1024)) + " MB");

        System.out.println("\n=== GC 情報 ===");
        for (GarbageCollectorMXBean gcBean : ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("GC 名: " + gcBean.getName());
            System.out.println("  回数: " + gcBean.getCollectionCount());
            System.out.println("  累計時間: " + gcBean.getCollectionTime() + " ms");
        }

        // JVM オプションをカテゴリ別に分類して表示（sealed interface + switch）
        var options = new JvmOption[] {
            new JvmOption.HeapOption("-Xms256m", "初期ヒープサイズ 256MB"),
            new JvmOption.HeapOption("-Xmx1g", "最大ヒープサイズ 1GB"),
            new JvmOption.GcOption("-XX:+UseG1GC", "G1GC を使用（Java 9+ デフォルト）"),
            new JvmOption.GcOption("-XX:+UseZGC", "ZGC を使用（Java 15+ 本番対応）"),
            new JvmOption.GcOption("-XX:+UseVirtualThreads", "Virtual Threads 有効（Java 21+）"),
            new JvmOption.DiagOption("-Xlog:gc*", "GC ログの統一形式出力（Java 9+）"),
            new JvmOption.DiagOption("-XX:+HeapDumpOnOutOfMemoryError", "OOM 時にヒープダンプ"),
        };

        System.out.println("\n=== JVM オプション一覧 ===");
        for (var option : options) {
            var category = categoryOf(option);
            // switch でフィールドにアクセス
            var flag = switch (option) {
                case JvmOption.HeapOption o  -> o.flag();
                case JvmOption.GcOption o    -> o.flag();
                case JvmOption.DiagOption o  -> o.flag();
            };
            var desc = switch (option) {
                case JvmOption.HeapOption o  -> o.description();
                case JvmOption.GcOption o    -> o.description();
                case JvmOption.DiagOption o  -> o.description();
            };
            System.out.printf("%-10s %-45s %s%n", category, flag, desc);
        }

        // Java 21 Virtual Thread に関するメモリ情報
        var vtNote = """
            === Virtual Thread とメモリ（Java 21+）===
            Platform Thread : OS スレッドにマップ。スタック ~1MB 固定。
            Virtual Thread  : JVM が管理。スタック ~数KB（必要に応じ拡張）。
            → Virtual Thread を大量生成してもヒープ圧迫が少ない。
            → -Xss（スタックサイズ）の調整も Platform Thread のみ対象。
            """; // Java 15+
        System.out.println(vtNote);
    }
}
