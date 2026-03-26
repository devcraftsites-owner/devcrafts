import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

/**
 * スレッドセーフな採番サンプル（Java 17+）。
 * var・record・switch 式を活用した簡潔な実装。
 */
public class AtomicCounterSample {

    // ---- AtomicLong カウンター ----

    static final AtomicLong atomicCounter = new AtomicLong(0);

    public static long atomicIncrement() {
        return atomicCounter.incrementAndGet();
    }

    // record（Java 16+）で採番結果を型安全に保持
    record CounterResult(long value, String type) {
        @Override
        public String toString() {
            return type + ": " + value;
        }
    }

    /** 採番クラスのシングルトンパターン */
    static class OrderNumberGenerator {
        private static final AtomicLong sequence = new AtomicLong(10000);

        public static String next() {
            return "ORD-" + sequence.incrementAndGet();
        }

        public static long current() {
            return sequence.get();
        }
    }

    // ---- LongAdder カウンター ----

    static final LongAdder adderCounter = new LongAdder();

    // ---- AtomicLong vs LongAdder の使い分け判定 ----

    /** 用途に応じてどちらを使うかを示す（switch 式, Java 14+） */
    enum CounterUseCase { ORDER_NUMBER, ACCESS_COUNT, HIGH_CONCURRENCY }

    public static String recommend(CounterUseCase useCase) {
        return switch (useCase) {
            case ORDER_NUMBER     -> "AtomicLong: 連番の一意性が必要";
            case ACCESS_COUNT     -> "LongAdder: 最終合計が正確であれば良い";
            case HIGH_CONCURRENCY -> "LongAdder: 高並行環境ではセル分散で高速";
        };
    }

    public static void main(String[] args) throws InterruptedException {
        int threads = 100;
        int incrementsPerThread = 1000;
        long expected = (long) threads * incrementsPerThread;

        // AtomicLong のデモ（var で変数宣言を簡潔に）
        var counter = new AtomicLong(0);
        var pool = Executors.newFixedThreadPool(threads);
        var latch = new CountDownLatch(threads);

        for (var i = 0; i < threads; i++) {
            pool.submit(() -> {
                for (var j = 0; j < incrementsPerThread; j++) {
                    counter.incrementAndGet();
                }
                latch.countDown();
            });
        }
        latch.await();
        pool.shutdown();

        System.out.println(new CounterResult(counter.get(), "AtomicLong"));
        System.out.println(counter.get() == expected ? "✓ 正確" : "✗ 欠損");

        // 使い分け推奨
        System.out.println("\n--- 使い分け ---");
        for (var useCase : CounterUseCase.values()) {
            System.out.println(useCase + " → " + recommend(useCase));
        }

        // 注文番号生成
        System.out.println("\n--- 注文番号生成 ---");
        for (var i = 0; i < 5; i++) {
            System.out.println(OrderNumberGenerator.next());
        }
    }
}
