import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

/**
 * スレッドセーフな採番サンプル（Java 8+）。
 *
 * 通常の long++ は複数スレッドから同時に呼ばれると「競合状態（Race Condition）」が発生し、
 * 番号が重複したり抜けたりします。AtomicLong や LongAdder を使うことで
 * synchronized なしでスレッドセーフな採番が実現できます。
 */
public class AtomicCounterSample {

    // ---- 危険なカウンター（スレッドアンセーフ）----

    /**
     * 通常の long++ は「読み取り→加算→書き込み」の3ステップ。
     * この間に別スレッドが割り込むと番号が重複する。
     */
    static long unsafeCounter = 0;

    public static long unsafeIncrement() {
        return ++unsafeCounter; // スレッドアンセーフ！
    }

    // ---- AtomicLong を使ったカウンター ----

    /**
     * AtomicLong は CAS（Compare-And-Swap）命令で 1 命令の ATOMIC 操作を実現。
     * synchronized より軽量で、競合が少ない環境に最適。
     * 用途: 注文番号・リクエストID・シーケンス番号の生成。
     */
    static final AtomicLong atomicCounter = new AtomicLong(0);

    public static long atomicIncrement() {
        return atomicCounter.incrementAndGet(); // ATOMIC に +1 して新しい値を返す
    }

    /** 採番カウンターのシングルトンパターン（実用例） */
    static class OrderNumberGenerator {
        // static final で JVM 起動時に 1 つだけ生成
        private static final AtomicLong sequence = new AtomicLong(10000);

        /** 「ORD-10001」形式の注文番号を生成する */
        public static String next() {
            return "ORD-" + sequence.incrementAndGet();
        }

        /** 現在の最終採番値を取得する */
        public static long current() {
            return sequence.get();
        }
    }

    // ---- LongAdder を使ったカウンター（Java 8+）----

    /**
     * LongAdder は高並行環境での競合を内部セルで分散させる。
     * 多数のスレッドが同時に加算する場面では AtomicLong より高速。
     * ただし sum() 取得のタイミングによって厳密な瞬間値は得られないため、
     * 「最終的な合計が正確であれば良い」用途（アクセスカウンター等）に向く。
     */
    static final LongAdder adderCounter = new LongAdder();

    public static void adderIncrement() {
        adderCounter.increment();
    }

    public static long adderSum() {
        return adderCounter.sum();
    }

    public static void main(String[] args) throws InterruptedException {
        int threads = 100;
        int incrementsPerThread = 1000;

        // --- AtomicLong のデモ ---
        AtomicLong counter = new AtomicLong(0);
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch latch = new CountDownLatch(threads);

        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                for (int j = 0; j < incrementsPerThread; j++) {
                    counter.incrementAndGet();
                }
                latch.countDown();
            });
        }
        latch.await();
        pool.shutdown();

        long expected = (long) threads * incrementsPerThread;
        System.out.println("期待値: " + expected);
        System.out.println("AtomicLong 結果: " + counter.get()
            + (counter.get() == expected ? " ✓ 正確" : " ✗ 欠損あり"));

        // --- OrderNumberGenerator のデモ ---
        System.out.println("\n--- 注文番号生成 ---");
        for (int i = 0; i < 5; i++) {
            System.out.println(OrderNumberGenerator.next());
        }
        System.out.println("最終採番値: " + OrderNumberGenerator.current());

        // --- LongAdder のデモ ---
        LongAdder adder = new LongAdder();
        ExecutorService pool2 = Executors.newFixedThreadPool(threads);
        CountDownLatch latch2 = new CountDownLatch(threads);
        for (int i = 0; i < threads; i++) {
            pool2.submit(() -> {
                for (int j = 0; j < incrementsPerThread; j++) {
                    adder.increment();
                }
                latch2.countDown();
            });
        }
        latch2.await();
        pool2.shutdown();

        System.out.println("\nLongAdder 結果: " + adder.sum()
            + (adder.sum() == expected ? " ✓ 正確" : " ✗ 欠損あり"));
    }
}
