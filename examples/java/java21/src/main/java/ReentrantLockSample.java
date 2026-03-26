import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.*;

public class ReentrantLockSample {

    // ロック操作の結果を表す record（Java 16+）
    record LockResult(boolean acquired, int value) {}

    // sealed interface でロック操作の種別を型安全に表現（Java 21+）
    sealed interface LockOperation
            permits LockOperation.Increment, LockOperation.TryIncrement {
        record Increment() implements LockOperation {}
        record TryIncrement(long timeoutMs) implements LockOperation {}
    }

    // ✅ ReentrantLock: synchronized より細粒度な制御
    static class SafeCounterWithLock {
        private int count = 0;
        private final Lock lock = new ReentrantLock();

        public void increment() {
            lock.lock();
            try {
                count++;
            } finally {
                lock.unlock(); // ✅ finally で必ず unlock()
            }
        }

        // タイムアウト付きロック取得
        public LockResult tryIncrement(long timeoutMs) throws InterruptedException {
            if (lock.tryLock(timeoutMs, TimeUnit.MILLISECONDS)) {
                try {
                    count++;
                    return new LockResult(true, count);
                } finally {
                    lock.unlock();
                }
            }
            return new LockResult(false, count); // ロック取得失敗
        }

        public int getCount() {
            return count;
        }
    }

    // switch パターンマッチングで LockOperation を処理（Java 21+）
    static LockResult execute(LockOperation op, SafeCounterWithLock counter)
            throws InterruptedException {
        return switch (op) {
            case LockOperation.Increment() -> {
                counter.increment();
                yield new LockResult(true, counter.getCount());
            }
            case LockOperation.TryIncrement(var timeoutMs) ->
                counter.tryIncrement(timeoutMs);
        };
    }

    // ✅ ReadWriteLock: 読み取り多・書き込み少ない場面に最適
    static class CachedData {
        private String data = "初期データ";
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
        private final Lock readLock = rwLock.readLock();
        private final Lock writeLock = rwLock.writeLock();

        // 読み取りは並行可
        public String read() {
            readLock.lock();
            try {
                System.out.println("[読み取り] " + Thread.currentThread().getName()
                    + " → " + data);
                return data;
            } finally {
                readLock.unlock();
            }
        }

        // 書き込みは排他的
        public void write(String newData) {
            writeLock.lock();
            try {
                System.out.println("[書き込み] " + Thread.currentThread().getName()
                    + " → " + newData);
                data = newData;
            } finally {
                writeLock.unlock();
            }
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== ReentrantLock ===");
        var counter = new SafeCounterWithLock();
        var threads = new Thread[5];
        for (var i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (var j = 0; j < 1000; j++) {
                    counter.increment();
                }
            });
            threads[i].start();
        }
        for (var t : threads) {
            t.join();
        }
        System.out.println("結果: " + counter.getCount() + " (期待: 5000)");

        System.out.println("\n=== sealed interface + switch パターンマッチング（Java 21+） ===");
        var opCounter = new SafeCounterWithLock();

        // Increment 操作
        var r1 = execute(new LockOperation.Increment(), opCounter);
        System.out.println("Increment: acquired=" + r1.acquired() + ", count=" + r1.value());

        // TryIncrement 操作（100ms タイムアウト）
        var r2 = execute(new LockOperation.TryIncrement(100), opCounter);
        System.out.println("TryIncrement: acquired=" + r2.acquired() + ", count=" + r2.value());

        System.out.println("\n=== ReadWriteLock ===");
        var cache = new CachedData();

        // 複数スレッドで同時読み取り（並行可）
        var r = new Thread(() -> cache.read(), "reader-1");
        var r2t = new Thread(() -> cache.read(), "reader-2");
        var w1 = new Thread(() -> cache.write("更新データ"), "writer-1");

        r.start(); r2t.start();
        r.join(); r2t.join();
        w1.start(); w1.join();
        cache.read();
    }
}
