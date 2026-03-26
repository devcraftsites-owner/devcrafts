import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

public class VolatileSample {

    // ❌ volatile なし: スレッド B がフラグ変更を認識できない場合がある
    static class NonVolatileFlag {
        private boolean running = true; // ❌ volatile なし

        public void stop() {
            running = false;
        }

        public boolean isRunning() {
            return running;
        }
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
    }

    // ✅ AtomicBoolean: volatile + アトミック操作
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

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== volatile フラグのデモ ===");
        VolatileFlag flag = new VolatileFlag();
        Thread worker = new Thread(new Runnable() {
            @Override
            public void run() {
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
            }
        }, "worker");

        worker.start();
        Thread.sleep(100);
        flag.stop(); // volatile なので worker スレッドに即座に伝わる
        worker.join();

        System.out.println("\n=== volatile counter の限界（競合） ===");
        VolatileCounter volatileCounter = new VolatileCounter();
        AtomicCounter atomicCounter = new AtomicCounter();

        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(new Runnable() {
                @Override
                public void run() {
                    for (int j = 0; j < 1000; j++) {
                        volatileCounter.increment();
                        atomicCounter.increment();
                    }
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.printf("volatile: 期待=%d, 実際=%d%n", 5000, volatileCounter.getCount());
        System.out.printf("atomic:   期待=%d, 実際=%d%n", 5000, atomicCounter.getCount());
    }
}
