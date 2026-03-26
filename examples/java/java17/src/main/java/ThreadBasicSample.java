public class ThreadBasicSample {

    // パターン1: Thread クラスを継承
    static class CounterThread extends Thread {
        private final String threadName;
        private final int count;

        public CounterThread(String threadName, int count) {
            super(threadName); // スレッド名を設定
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

    // パターン2: record で Runnable を実装（Java 16+）
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
        var task = new PrintTask("Hello from record Runnable", 3);
        var t3 = new Thread(task, "worker-1");
        var t4 = new Thread(task, "worker-2");
        t3.start();
        t4.start();
        t3.join();
        t4.join();

        System.out.println("\n=== パターン3: ラムダ式で Runnable を書く（Java 8+）===");
        // ラムダ式で Runnable を直接記述できる
        var t5 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("[" + Thread.currentThread().getName() + "] lambda task: " + i);
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

        System.out.println("\n=== スレッド情報 ===");
        var current = Thread.currentThread();
        System.out.println("スレッド名: " + current.getName());
        System.out.println("スレッドID: " + current.getId());
        System.out.println("優先度: " + current.getPriority());
        System.out.println("デーモン: " + current.isDaemon());
    }
}
