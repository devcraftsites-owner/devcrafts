public class GcBasicSample {

    // GC の動作を観察するためのサンプルクラス
    static class HeavyObject {
        private final byte[] data;
        private final int id;

        HeavyObject(int id, int sizeMb) {
            this.id = id;
            this.data = new byte[sizeMb * 1024 * 1024]; // 指定MBのデータ
        }

        @Override
        public String toString() {
            return "HeavyObject#" + id + "(" + data.length / (1024 * 1024) + "MB)";
        }
    }

    // ランタイムのメモリ情報を表示
    static void printMemoryStatus(String label) {
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        long maxMemory = runtime.maxMemory();

        System.out.println("--- " + label + " ---");
        System.out.println("  使用中: " + (usedMemory / (1024 * 1024)) + " MB");
        System.out.println("  空き:   " + (freeMemory / (1024 * 1024)) + " MB");
        System.out.println("  合計:   " + (totalMemory / (1024 * 1024)) + " MB");
        System.out.println("  最大:   " + (maxMemory / (1024 * 1024)) + " MB");
    }

    public static void main(String[] args) throws InterruptedException {
        printMemoryStatus("初期状態");

        // 短命オブジェクトの生成（Young Generation に入る）
        System.out.println("\n短命オブジェクトを大量生成...");
        for (int i = 0; i < 1000; i++) {
            // ローカル変数にしか参照がないため、すぐに GC 対象になる
            String temp = new String("一時的な文字列 " + i);
            if (i % 100 == 0) {
                System.out.print(i + " ");
            }
        }
        System.out.println();

        printMemoryStatus("短命オブジェクト生成後");

        // 明示的 GC 要求（推奨しないが、動作確認用）
        System.out.println("\nGC 要求（System.gc()）...");
        System.gc();
        Thread.sleep(100); // GC の実行を待つ

        printMemoryStatus("GC 後");

        // finalize() の代わりに try-with-resources を使うことを推奨
        System.out.println("\n推奨: try-with-resources で確実なリソース解放を");
        System.out.println("非推奨: finalize() はデストラクタではない（実行タイミング不定）");
    }
}
