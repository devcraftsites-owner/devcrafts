import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class ConditionLockSample {

    // Condition を使ったプロデューサー・コンシューマー
    static class BoundedQueue<T> {
        private final Deque<T> queue = new ArrayDeque<>();
        private final int capacity;
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition();  // キューが満杯でない条件
        private final Condition notEmpty = lock.newCondition(); // キューが空でない条件

        BoundedQueue(int capacity) {
            this.capacity = capacity;
        }

        // プロデューサー: キューに追加（満杯なら待機）
        void put(T item) throws InterruptedException {
            lock.lock();
            try {
                while (queue.size() == capacity) {
                    System.out.println("[Producer] キュー満杯 → 待機中...");
                    notFull.await();
                }
                queue.addLast(item);
                System.out.println("[Producer] 追加: " + item + " (サイズ: " + queue.size() + ")");
                notEmpty.signalAll();
            } finally {
                lock.unlock();
            }
        }

        // コンシューマー: キューから取り出し（空なら待機）
        T take() throws InterruptedException {
            lock.lock();
            try {
                while (queue.isEmpty()) {
                    System.out.println("[Consumer] キュー空 → 待機中...");
                    notEmpty.await();
                }
                var item = queue.removeFirst();
                System.out.println("[Consumer] 取得: " + item + " (サイズ: " + queue.size() + ")");
                notFull.signalAll();
                return item;
            } finally {
                lock.unlock();
            }
        }

        // タイムアウト付き取得
        T poll(long timeoutMs) throws InterruptedException {
            lock.lock();
            try {
                var remaining = timeoutMs;
                while (queue.isEmpty()) {
                    if (remaining <= 0) {
                        System.out.println("[Consumer] タイムアウト");
                        return null;
                    }
                    remaining = notEmpty.awaitNanos(remaining * 1_000_000L) / 1_000_000L;
                }
                var item = queue.removeFirst();
                notFull.signalAll();
                return item;
            } finally {
                lock.unlock();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        var queue = new BoundedQueue<Integer>(3);

        // Java 21: Virtual Thread でプロデューサー・コンシューマーを起動
        var producer = Thread.ofVirtual().start(() -> {
            try {
                for (var i = 1; i <= 5; i++) {
                    queue.put(i);
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        var consumer = Thread.ofVirtual().start(() -> {
            try {
                for (var i = 0; i < 5; i++) {
                    queue.take();
                    Thread.sleep(200);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.join();
        consumer.join();
        System.out.println("完了（Virtual Thread 使用）");
    }
}
