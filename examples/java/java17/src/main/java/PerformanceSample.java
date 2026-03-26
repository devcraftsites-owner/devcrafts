import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class PerformanceSample {

    // 計測結果を保持する record（Java 16+）
    record MeasureResult(String label, long nanos) {
        // ナノ秒をミリ秒に変換
        double toMillis() {
            return nanos / 1_000_000.0;
        }

        // 結果を見やすく表示
        void print() {
            System.out.printf("%s: %,d ns (%.3f ms)%n", label, nanos, toMillis());
        }
    }

    // System.nanoTime() による処理時間計測
    public static long measureNanoTime(Runnable task) {
        var start = System.nanoTime();
        task.run();
        var end = System.nanoTime();
        return end - start;
    }

    // ラベル付きで計測結果を record に包んで返す
    public static MeasureResult measure(String label, Runnable task) {
        return new MeasureResult(label, measureNanoTime(task));
    }

    // ループ処理の計測例: 文字列結合 vs StringBuilder
    public static void compareStringConcatenation(int n) {
        // 方法1: 文字列結合（+ 演算子）はラムダで記述（Java 8+）
        var r1 = measure("文字列結合(" + n + "回)", () -> {
            var result = "";
            for (int i = 0; i < n; i++) {
                result = result + i; // 毎回新しい String オブジェクトを生成
            }
        });

        // 方法2: StringBuilder はラムダで記述
        var r2 = measure("StringBuilder(" + n + "回)", () -> {
            var sb = new StringBuilder();
            for (int i = 0; i < n; i++) {
                sb.append(i); // 内部バッファを使い回す
            }
            sb.toString();
        });

        r1.print();
        r2.print();
        if (r2.nanos() > 0) {
            System.out.printf("StringBuilder は約 %.1f 倍高速%n", (double) r1.nanos() / r2.nanos());
        }
    }

    // ウォームアップ付き計測（JIT コンパイルの影響を除く）
    public static MeasureResult measureWithWarmup(String label, Runnable task, int warmupCount, int measureCount) {
        // ウォームアップ実行（JIT コンパイルを促す）
        for (int i = 0; i < warmupCount; i++) {
            task.run();
        }

        // 計測実行（複数回の平均）
        var total = 0L;
        for (int i = 0; i < measureCount; i++) {
            total += measureNanoTime(task);
        }
        return new MeasureResult(label, total / measureCount);
    }

    // ArrayList vs LinkedList のランダムアクセス比較
    public static void compareListAccess(int size) {
        var arrayList = new ArrayList<Integer>();
        var linkedList = new LinkedList<Integer>();

        for (int i = 0; i < size; i++) {
            arrayList.add(i);
            linkedList.add(i);
        }

        // get(index) による中間要素へのランダムアクセス
        var r1 = measure("ArrayList.get(中間) 1000回", () -> {
            for (int i = 0; i < 1000; i++) {
                arrayList.get(size / 2);
            }
        });

        var r2 = measure("LinkedList.get(中間) 1000回", () -> {
            for (int i = 0; i < 1000; i++) {
                linkedList.get(size / 2); // O(n) でリストを辿る
            }
        });

        r1.print();
        r2.print();
    }

    public static void main(String[] args) {
        System.out.println("=== 文字列結合 vs StringBuilder ===");
        compareStringConcatenation(10000);

        System.out.println("\n=== ArrayList vs LinkedList ランダムアクセス ===");
        compareListAccess(10000);

        System.out.println("\n=== ウォームアップ付き計測例 ===");
        var result = measureWithWarmup("100000回ループの平均", () -> {
            var sum = 0L;
            for (int i = 0; i < 100000; i++) {
                sum += i;
            }
        }, 5, 10);
        result.print();
    }
}
