import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

/**
 * スレッドセーフな採番サンプル（Java 21+）。
 * sealed interface + パターンマッチングでカウンター戦略を型安全に表現。
 * Java 21 の Virtual Threads（仮想スレッド）による高並行デモも含む。
 */
public class AtomicCounterSample {

    /** カウンター戦略を sealed interface で表現（Java 21+） */
    sealed interface CounterStrategy {
        /** 連番の一意性が必要な用途（注文番号・リクエストIDなど） */
        record Sequential(AtomicLong counter) implements CounterStrategy {}
        /** 高並行環境での集計（アクセスカウンター・統計など） */
        record Distributed(LongAdder adder)  implements CounterStrategy {}
    }

    /** 戦略に応じてインクリメントするファクトリメソッド */
    public static long increment(CounterStrategy strategy) {
        return switch (strategy) {
            case CounterStrategy.Sequential(var c)  -> c.incrementAndGet();
            case CounterStrategy.Distributed(var a) -> { a.increment(); yield a.sum(); }
        };
    }

    /** 現在値を取得 */
    public static long current(CounterStrategy strategy) {
        return switch (strategy) {
            case CounterStrategy.Sequential(var c)  -> c.get();
            case CounterStrategy.Distributed(var a) -> a.sum();
        };
    }

    /** 採番クラスのシングルトンパターン */
    static class OrderNumberGenerator {
        private static final AtomicLong sequence = new AtomicLong(10000);

        public static String next() {
            return "ORD-" + sequence.incrementAndGet();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        int threads = 1000; // Java 21 の仮想スレッドは 1000 スレッドも軽量
        int incrementsPerThread = 100;
        long expected = (long) threads * incrementsPerThread;

        // Java 21 Virtual Threads（仮想スレッド）で大量並行処理
        // Executors.newVirtualThreadPerTaskExecutor() は OS スレッドを消費しない
        var counter = new AtomicLong(0);
        var latch = new CountDownLatch(threads);

        try (var pool = Executors.newVirtualThreadPerTaskExecutor()) { // Java 21+
            for (var i = 0; i < threads; i++) {
                pool.submit(() -> {
                    for (var j = 0; j < incrementsPerThread; j++) {
                        counter.incrementAndGet();
                    }
                    latch.countDown();
                });
            }
        } // try-with-resources で自動 shutdown

        latch.await();
        System.out.println("期待値 : " + expected);
        System.out.println("実結果 : " + counter.get()
            + (counter.get() == expected ? " ✓ 正確" : " ✗ 欠損"));

        // sealed interface でカウンター戦略を切り替え
        System.out.println("\n--- カウンター戦略パターンマッチング ---");
        var seq  = new CounterStrategy.Sequential(new AtomicLong(0));
        var dist = new CounterStrategy.Distributed(new LongAdder());
        increment(seq);
        increment(seq);
        increment(dist);
        System.out.println("Sequential: " + current(seq));   // 2
        System.out.println("Distributed: " + current(dist)); // 1

        // 注文番号生成
        System.out.println("\n--- 注文番号生成 ---");
        for (var i = 0; i < 5; i++) {
            System.out.println(OrderNumberGenerator.next());
        }
    }
}
