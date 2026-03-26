import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class ConditionLockSample {

    // Condition を使ったプロデューサー・コンシューマー
    static class BoundedQueue<T> {
        private final Deque<T> queue = new ArrayDeque<T>();
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
                    notFull.await(); // 満杯でなくなるまで待機
                }
                queue.addLast(item);
                System.out.println("[Producer] 追加: " + item + " (サイズ: " + queue.size() + ")");
                notEmpty.signalAll(); // コンシューマーに通知
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
                    notEmpty.await(); // 空でなくなるまで待機
                }
                T item = queue.removeFirst();
                System.out.println("[Consumer] 取得: " + item + " (サイズ: " + queue.size() + ")");
                notFull.signalAll(); // プロデューサーに通知
                return item;
            } finally {
                lock.unlock();
            }
        }

        // タイムアウト付き取得（Java 8+）
        T poll(long timeoutMs) throws InterruptedException {
            lock.lock();
            try {
                long remaining = timeoutMs;
                while (queue.isEmpty()) {
                    if (remaining <= 0) {
                        System.out.println("[Consumer] タイムアウト");
                        return null;
                    }
                    remaining = notEmpty.awaitNanos(remaining * 1_000_000L) / 1_000_000L;
                }
                T item = queue.removeFirst();
                notFull.signalAll();
                return item;
            } finally {
                lock.unlock();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        final BoundedQueue<Integer> queue = new BoundedQueue<Integer>(3);

        // プロデューサースレッド
        Thread producer = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    for (int i = 1; i <= 5; i++) {
                        queue.put(i);
                        Thread.sleep(100);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        // コンシューマースレッド
        Thread consumer = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    for (int i = 0; i < 5; i++) {
                        queue.take();
                        Thread.sleep(200);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
        System.out.println("完了");
    }
}
