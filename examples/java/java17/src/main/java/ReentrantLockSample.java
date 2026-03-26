import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.*;

public class ReentrantLockSample {

    // ロック操作の結果を表す record（Java 16+）
    record LockResult(boolean acquired, int value) {}

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
            // ラムダ式で Runnable を記述
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

        System.out.println("\n=== tryLock のデモ（var + record） ===");
        var tryCounter = new SafeCounterWithLock();
        var result = tryCounter.tryIncrement(100);
        // record の値を活用して結果を表示
        if (result.acquired()) {
            System.out.println("ロック取得成功: count=" + result.value());
        } else {
            System.out.println("ロック取得失敗（タイムアウト）");
        }

        System.out.println("\n=== ReadWriteLock ===");
        var cache = new CachedData();

        // 複数スレッドで同時読み取り（並行可）
        var r1 = new Thread(() -> cache.read(), "reader-1");
        var r2 = new Thread(() -> cache.read(), "reader-2");
        var w1 = new Thread(() -> cache.write("更新データ"), "writer-1");

        r1.start(); r2.start();
        r1.join(); r2.join();
        w1.start(); w1.join();
        cache.read();
    }
}
