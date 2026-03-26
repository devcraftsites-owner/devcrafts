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

    // 競合を発生させて違いを示す
    static void runConcurrent(Object counter, boolean isSafe) throws InterruptedException {
        int threadCount = 10;
        int incrementsPerThread = 1000;

        Thread[] threads = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < incrementsPerThread; j++) {
                    if (counter instanceof UnsafeCounter) {
                        ((UnsafeCounter) counter).increment();
                    } else if (counter instanceof SafeCounterMethod) {
                        ((SafeCounterMethod) counter).increment();
                    } else if (counter instanceof SafeCounterBlock) {
                        ((SafeCounterBlock) counter).increment();
                    }
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }

        int expected = threadCount * incrementsPerThread;
        int actual;
        if (counter instanceof UnsafeCounter) {
            actual = ((UnsafeCounter) counter).getCount();
        } else if (counter instanceof SafeCounterMethod) {
            actual = ((SafeCounterMethod) counter).getCount();
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
