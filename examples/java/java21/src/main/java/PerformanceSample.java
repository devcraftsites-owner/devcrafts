import java.util.ArrayList;
import java.util.LinkedList;

public class PerformanceSample {

    // ベンチマーク対象タスクを表す sealed interface（Java 17+）
    // 各 record がベンチマークの種類を表す
    sealed interface BenchmarkTask {
        record StringConcat(int n) implements BenchmarkTask {}
        record StringBuilderConcat(int n) implements BenchmarkTask {}
        record ArrayListAccess(int size) implements BenchmarkTask {}
        record LinkedListAccess(int size) implements BenchmarkTask {}
    }

    // 計測結果を保持する record
    record MeasureResult(String label, long nanos) {
        double toMillis() {
            return nanos / 1_000_000.0;
        }

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

    // BenchmarkTask に応じた処理を実行して MeasureResult を返す（Java 21 パターンマッチング switch）
    public static MeasureResult runBenchmark(BenchmarkTask task) {
        return switch (task) {
            case BenchmarkTask.StringConcat t -> {
                var nanos = measureNanoTime(() -> {
                    var result = "";
                    for (int i = 0; i < t.n(); i++) {
                        result = result + i; // 毎回新しい String を生成
                    }
                });
                yield new MeasureResult("文字列結合(" + t.n() + "回)", nanos);
            }
            case BenchmarkTask.StringBuilderConcat t -> {
                var nanos = measureNanoTime(() -> {
                    var sb = new StringBuilder();
                    for (int i = 0; i < t.n(); i++) {
                        sb.append(i); // 内部バッファを使い回す
                    }
                    sb.toString();
                });
                yield new MeasureResult("StringBuilder(" + t.n() + "回)", nanos);
            }
            case BenchmarkTask.ArrayListAccess t -> {
                var list = new ArrayList<Integer>();
                for (int i = 0; i < t.size(); i++) {
                    list.add(i);
                }
                var nanos = measureNanoTime(() -> {
                    for (int i = 0; i < 1000; i++) {
                        list.get(t.size() / 2);
                    }
                });
                yield new MeasureResult("ArrayList.get(中間) 1000回", nanos);
            }
            case BenchmarkTask.LinkedListAccess t -> {
                var list = new LinkedList<Integer>();
                for (int i = 0; i < t.size(); i++) {
                    list.add(i);
                }
                var nanos = measureNanoTime(() -> {
                    for (int i = 0; i < 1000; i++) {
                        list.get(t.size() / 2); // O(n) でリストを辿る
                    }
                });
                yield new MeasureResult("LinkedList.get(中間) 1000回", nanos);
            }
        };
    }

    // ウォームアップ付き計測
    public static MeasureResult measureWithWarmup(String label, Runnable task, int warmupCount, int measureCount) {
        for (int i = 0; i < warmupCount; i++) {
            task.run();
        }
        var total = 0L;
        for (int i = 0; i < measureCount; i++) {
            total += measureNanoTime(task);
        }
        return new MeasureResult(label, total / measureCount);
    }

    public static void main(String[] args) {
        System.out.println("=== 文字列結合 vs StringBuilder ===");
        // BenchmarkTask の record を使ってタスクを定義
        var concatTasks = new BenchmarkTask[]{
            new BenchmarkTask.StringConcat(10000),
            new BenchmarkTask.StringBuilderConcat(10000)
        };
        MeasureResult concatResult = null;
        MeasureResult sbResult = null;
        for (var t : concatTasks) {
            var result = runBenchmark(t);
            result.print();
            if (t instanceof BenchmarkTask.StringConcat) {
                concatResult = result;
            } else {
                sbResult = result;
            }
        }
        if (concatResult != null && sbResult != null && sbResult.nanos() > 0) {
            System.out.printf("StringBuilder は約 %.1f 倍高速%n", (double) concatResult.nanos() / sbResult.nanos());
        }

        System.out.println("\n=== ArrayList vs LinkedList ランダムアクセス ===");
        var listTasks = new BenchmarkTask[]{
            new BenchmarkTask.ArrayListAccess(10000),
            new BenchmarkTask.LinkedListAccess(10000)
        };
        for (var t : listTasks) {
            runBenchmark(t).print();
        }

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
