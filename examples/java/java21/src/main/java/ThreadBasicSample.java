public class ThreadBasicSample {

    // パターン1: Thread クラスを継承
    static class CounterThread extends Thread {
        private final String threadName;
        private final int count;

        public CounterThread(String threadName, int count) {
            super(threadName);
            this.threadName = threadName;
            this.count = count;
        }

        @Override
        public void run() {
            for (int i = 1; i <= count; i++) {
                System.out.println(threadName + ": " + i);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt(); // interrupt フラグを再セット
                    System.out.println(threadName + ": 中断されました");
                    return;
                }
            }
        }
    }

    // record で Runnable を実装（Java 16+）
    record PrintTask(String message, int repeat) implements Runnable {
        @Override
        public void run() {
            for (int i = 0; i < repeat; i++) {
                System.out.println("[" + Thread.currentThread().getName() + "] " + message);
                try {
                    Thread.sleep(150);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== パターン1: Thread クラスを継承 ===");
        var t1 = new CounterThread("スレッドA", 3);
        var t2 = new CounterThread("スレッドB", 3);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("\n=== パターン2: record + Runnable（推奨）===");
        var task = new PrintTask("Hello from Runnable", 3);
        var t3 = new Thread(task, "worker-1");
        var t4 = new Thread(task, "worker-2");
        t3.start();
        t4.start();
        t3.join();
        t4.join();

        System.out.println("\n=== パターン3: ラムダ式で Runnable を書く ===");
        var t5 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("[" + Thread.currentThread().getName() + "] lambda: " + i);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }, "lambda-thread");
        t5.start();
        t5.join();

        System.out.println("\n=== Java 21: 仮想スレッド（Virtual Threads）===");
        // Thread.ofVirtual() で仮想スレッドを作成（Java 21+）
        // 仮想スレッドは OS スレッドを消費しないため、大量生成が可能
        var vThread1 = Thread.ofVirtual().name("virtual-1").start(() -> {
            System.out.println("[" + Thread.currentThread().getName() + "] 仮想スレッドで実行中");
            System.out.println("  isVirtual: " + Thread.currentThread().isVirtual());
        });

        // Thread.startVirtualThread() の簡易記法
        var vThread2 = Thread.startVirtualThread(() -> {
            System.out.println("[" + Thread.currentThread().getName() + "] startVirtualThread の簡易記法");
            System.out.println("  isVirtual: " + Thread.currentThread().isVirtual());
        });

        vThread1.join();
        vThread2.join();

        System.out.println("\n=== プラットフォームスレッド vs 仮想スレッドの比較 ===");
        // プラットフォームスレッド（通常のスレッド）
        var platformThread = Thread.ofPlatform().name("platform-1").start(() ->
            System.out.println("プラットフォームスレッド isVirtual: " + Thread.currentThread().isVirtual())
        );
        // 仮想スレッド
        var virtualThread = Thread.ofVirtual().name("virtual-2").start(() ->
            System.out.println("仮想スレッド        isVirtual: " + Thread.currentThread().isVirtual())
        );
        platformThread.join();
        virtualThread.join();

        System.out.println("\n=== スレッド情報 ===");
        var current = Thread.currentThread();
        System.out.println("スレッド名: " + current.getName());
        System.out.println("優先度: " + current.getPriority());
        System.out.println("デーモン: " + current.isDaemon());
        System.out.println("isVirtual: " + current.isVirtual());
    }
}
