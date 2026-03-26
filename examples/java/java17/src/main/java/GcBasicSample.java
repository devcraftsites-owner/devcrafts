public class GcBasicSample {

    // GC の動作を観察するためのサンプルクラス（Java 17: record で不変データを表現）
    record MemoryStatus(String label, long usedMb, long freeMb, long totalMb, long maxMb) { // Java 17+
        void print() {
            System.out.println("--- " + label + " ---");
            System.out.println("  使用中: " + usedMb + " MB");
            System.out.println("  空き:   " + freeMb + " MB");
            System.out.println("  合計:   " + totalMb + " MB");
            System.out.println("  最大:   " + maxMb + " MB");
        }
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
            // ローカル変数にしか参照がないため、すぐに GC 対象になる
            var temp = new String("一時的な文字列 " + i);
            if (i % 100 == 0) {
                System.out.print(i + " ");
            }
        }
        System.out.println();

        captureMemoryStatus("短命オブジェクト生成後").print();

        // 明示的 GC 要求（推奨しないが、動作確認用）
        System.out.println("\nGC 要求（System.gc()）...");
        System.gc();
        Thread.sleep(100); // GC の実行を待つ

        captureMemoryStatus("GC 後").print();

        // Java 9+ では Cleaner クラスが finalize() の代替として推奨
        System.out.println("\n推奨: try-with-resources または java.lang.ref.Cleaner（Java 9+）");
        System.out.println("非推奨: finalize() はデストラクタではない（実行タイミング不定）");

        // テキストブロックで GC の世代構造を説明（Java 15+）
        var gcExplain = """
            === GC 世代構造 ===
            Young Generation（新生代）: 新しいオブジェクト置き場。Minor GC で頻繁に回収。
            Old Generation（旧世代）  : 長生きしたオブジェクト。Full GC でまとめて回収。
            Minor GC: Young のみ対象（短時間・低コスト）
            Full GC : Old を含む全 GC  （長時間・アプリ一時停止）
            """; // Java 15+
        System.out.println(gcExplain);
    }
}
