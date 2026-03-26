import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

public class VolatileSample {

    // 記録用: フラグの状態を保持する record（Java 16+）
    record FlagState(boolean running) {}

    // sealed interface でメモリ可視性のデモ結果を型安全に表現（Java 21+）
    sealed interface MemoryVisibilityDemo
            permits MemoryVisibilityDemo.Volatile, MemoryVisibilityDemo.Atomic {
        record Volatile(int finalCount, int expectedCount) implements MemoryVisibilityDemo {}
        record Atomic(int finalCount, int expectedCount) implements MemoryVisibilityDemo {}
    }

    // ✅ volatile あり: 変更が即座に他スレッドから見える
    static class VolatileFlag {
        private volatile boolean running = true; // ✅

        public void stop() {
            running = false;
        }

        public boolean isRunning() {
            return running;
        }

        public FlagState getState() {
            return new FlagState(running);
        }
    }

    // ✅ AtomicBoolean: volatile + アトミック操作（compareAndSet も可能）
    static class AtomicFlag {
        private final AtomicBoolean running = new AtomicBoolean(true);

        public void stop() {
            running.set(false);
        }

        public boolean isRunning() {
            return running.get();
        }
    }

    // カウンターで volatile の限界を示す（インクリメントは非アトミック）
    static class VolatileCounter {
        private volatile int count = 0; // volatile でも count++ は非アトミック

        public void increment() {
            count++; // ❌ read → add → write の3ステップ、競合が発生
        }

        public int getCount() {
            return count;
        }
    }

    static class AtomicCounter {
        private final AtomicInteger count = new AtomicInteger(0);

        public void increment() {
            count.incrementAndGet(); // ✅ アトミック操作
        }

        public int getCount() {
            return count.get();
        }
    }

    // switch パターンマッチングで Volatile/Atomic の結果を比較表示（Java 21+）
    static void printResult(MemoryVisibilityDemo demo) {
        switch (demo) {
            case MemoryVisibilityDemo.Volatile(var finalCount, var expectedCount) ->
                System.out.printf("volatile: 期待=%d, 実際=%d, 一致=%b%n",
                    expectedCount, finalCount, finalCount == expectedCount);
            case MemoryVisibilityDemo.Atomic(var finalCount, var expectedCount) ->
                System.out.printf("atomic:   期待=%d, 実際=%d, 一致=%b%n",
                    expectedCount, finalCount, finalCount == expectedCount);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== volatile フラグのデモ ===");
        var flag = new VolatileFlag();

        // ラムダ式で Runnable を記述（Java 8+）
        var worker = new Thread(() -> {
            int count = 0;
            while (flag.isRunning()) {
                count++;
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
            System.out.println("ループ終了: " + count + " 回実行");
        }, "worker");

        worker.start();
        Thread.sleep(100);

        var stateBefore = flag.getState();
        System.out.println("停止前の状態: " + stateBefore);

        flag.stop(); // volatile なので worker スレッドに即座に伝わる
        worker.join();

        var stateAfter = flag.getState();
        System.out.println("停止後の状態: " + stateAfter);

        System.out.println("\n=== volatile counter の限界（競合） ===");
        var volatileCounter = new VolatileCounter();
        var atomicCounter = new AtomicCounter();

        var threads = new Thread[5];
        for (var i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (var j = 0; j < 1000; j++) {
                    volatileCounter.increment();
                    atomicCounter.increment();
                }
            });
            threads[i].start();
        }
        for (var t : threads) {
            t.join();
        }

        // sealed interface + switch パターンマッチングで結果を表示
        printResult(new MemoryVisibilityDemo.Volatile(volatileCounter.getCount(), 5000));
        printResult(new MemoryVisibilityDemo.Atomic(atomicCounter.getCount(), 5000));
    }
}
