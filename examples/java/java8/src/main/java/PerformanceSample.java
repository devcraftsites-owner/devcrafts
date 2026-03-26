public class PerformanceSample {

    // System.nanoTime() による処理時間計測
    // nanoTime: 相対時間計測に使う（OS の時刻同期の影響を受けない）
    // currentTimeMillis: 壁時計時間なので OS の時刻調整の影響を受ける
    public static long measureNanoTime(Runnable task) {
        long start = System.nanoTime();
        task.run();
        long end = System.nanoTime();
        return end - start;
    }

    // ループ処理の計測例: 文字列結合 vs StringBuilder
    public static void compareStringConcatenation(int n) {
        // 方法1: 文字列結合（+ 演算子）
        long time1 = measureNanoTime(new Runnable() {
            @Override
            public void run() {
                String result = "";
                for (int i = 0; i < n; i++) {
                    result = result + i; // 毎回新しい String オブジェクトを生成
                }
            }
        });

        // 方法2: StringBuilder
        long time2 = measureNanoTime(new Runnable() {
            @Override
            public void run() {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < n; i++) {
                    sb.append(i); // 内部バッファを使い回す
                }
                sb.toString();
            }
        });

        System.out.printf("文字列結合(%d回): %,d ms%n", n, time1 / 1_000_000);
        System.out.printf("StringBuilder(%d回): %,d ms%n", n, time2 / 1_000_000);
        if (time2 > 0) {
            System.out.printf("StringBuilder は約 %.1f 倍高速%n", (double) time1 / time2);
        }
    }

    // ウォームアップ付き計測（JIT コンパイルの影響を除く）
    public static long measureWithWarmup(Runnable task, int warmupCount, int measureCount) {
        // ウォームアップ実行（JIT コンパイルを促す）
        for (int i = 0; i < warmupCount; i++) {
            task.run();
        }

        // 計測実行（複数回の平均）
        long total = 0;
        for (int i = 0; i < measureCount; i++) {
            total += measureNanoTime(task);
        }
        return total / measureCount;
    }

    // ArrayList vs LinkedList のランダムアクセス比較
    public static void compareListAccess(int size) {
        java.util.List<Integer> arrayList = new java.util.ArrayList<>();
        java.util.List<Integer> linkedList = new java.util.LinkedList<>();

        for (int i = 0; i < size; i++) {
            arrayList.add(i);
            linkedList.add(i);
        }

        // get(index) による中間要素へのランダムアクセス
        long t1 = measureNanoTime(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    arrayList.get(size / 2);
                }
            }
        });

        long t2 = measureNanoTime(new Runnable() {
            @Override
            public void run() {
                for (int i = 0; i < 1000; i++) {
                    linkedList.get(size / 2); // O(n) でリストを辿る
                }
            }
        });

        System.out.printf("ArrayList.get(中間) 1000回: %,d ns%n", t1 / 1000);
        System.out.printf("LinkedList.get(中間) 1000回: %,d ns%n", t2 / 1000);
    }

    public static void main(String[] args) {
        System.out.println("=== 文字列結合 vs StringBuilder ===");
        compareStringConcatenation(10000);

        System.out.println("\n=== ArrayList vs LinkedList ランダムアクセス ===");
        compareListAccess(10000);

        System.out.println("\n=== ウォームアップ付き計測例 ===");
        Runnable task = new Runnable() {
            @Override
            public void run() {
                long sum = 0;
                for (int i = 0; i < 100000; i++) {
                    sum += i;
                }
            }
        };
        long avgNs = measureWithWarmup(task, 5, 10);
        System.out.printf("100000回ループの平均: %,d ns (%.3f ms)%n", avgNs, avgNs / 1_000_000.0);
    }
}
