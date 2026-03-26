public class SynchronizedSample {

    // スレッドアンセーフなカウンター（競合が発生する）
    static class UnsafeCounter {
        private int count = 0;

        public void increment() {
            count++; // 非アトミック: 読み取り・加算・書き戻しの3ステップ
        }

        public int getCount() {
            return count;
        }
    }

    // synchronized メソッドによるスレッドセーフなカウンター
    static class SafeCounterMethod {
        private int count = 0;

        public synchronized void increment() { // メソッド全体をロック
            count++;
        }

        public synchronized int getCount() {
            return count;
        }
    }

    // synchronized ブロック（スコープ最小化・推奨）
    static class SafeCounterBlock {
        private int count = 0;
        private final Object lock = new Object(); // 専用ロックオブジェクト

        public void increment() {
            synchronized (lock) { // 必要な箇所だけロック
                count++;
            }
        }

        public int getCount() {
            synchronized (lock) {
                return count;
            }
        }
    }

    // 競合を発生させて違いを示す（var を活用）
    static void runConcurrent(Object counter, boolean isSafe) throws InterruptedException {
        var threadCount = 10;
        var incrementsPerThread = 1000;

        var threads = new Thread[threadCount];
        for (var i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                for (var j = 0; j < incrementsPerThread; j++) {
                    if (counter instanceof UnsafeCounter c) {
                        c.increment(); // パターンマッチング instanceof（Java 16+）
                    } else if (counter instanceof SafeCounterMethod c) {
                        c.increment();
                    } else if (counter instanceof SafeCounterBlock c) {
                        c.increment();
                    }
                }
            });
            threads[i].start();
        }
        for (var t : threads) {
            t.join();
        }

        var expected = threadCount * incrementsPerThread;
        int actual;
        if (counter instanceof UnsafeCounter c) {
            actual = c.getCount();
        } else if (counter instanceof SafeCounterMethod c) {
            actual = c.getCount();
        } else {
            actual = ((SafeCounterBlock) counter).getCount();
        }
        System.out.printf("%s: 期待値=%d, 実際=%d, 一致=%b%n",
            isSafe ? "安全" : "危険", expected, actual, expected == actual);
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== スレッドセーフ比較 ===");
        runConcurrent(new UnsafeCounter(), false);
        runConcurrent(new SafeCounterMethod(), true);
        runConcurrent(new SafeCounterBlock(), true);
    }
}
