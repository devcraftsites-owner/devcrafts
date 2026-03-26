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

    // sealed interface でカウント結果を型安全に表現（Java 21+）
    sealed interface CountResult permits CountResult.Match, CountResult.Mismatch {
        record Match(int value) implements CountResult {}
        record Mismatch(int expected, int actual) implements CountResult {}
    }

    // 期待値と実際の値を比較して CountResult を返す
    static CountResult checkCount(int expected, int actual) {
        if (expected == actual) {
            return new CountResult.Match(actual);
        } else {
            return new CountResult.Mismatch(expected, actual);
        }
    }

    // 競合を発生させて違いを示す（var とパターンマッチングを活用）
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

        // switch パターンマッチングで結果を出力（Java 21+）
        var result = checkCount(expected, actual);
        var label = isSafe ? "安全" : "危険";
        switch (result) {
            case CountResult.Match(var v) ->
                System.out.printf("%s: 期待値=%d, 実際=%d, 一致=true%n", label, v, v);
            case CountResult.Mismatch(var exp, var act) ->
                System.out.printf("%s: 期待値=%d, 実際=%d, 一致=false%n", label, exp, act);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== スレッドセーフ比較 ===");
        runConcurrent(new UnsafeCounter(), false);
        runConcurrent(new SafeCounterMethod(), true);
        runConcurrent(new SafeCounterBlock(), true);
    }
}
