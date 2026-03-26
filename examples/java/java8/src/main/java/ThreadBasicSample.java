public class ThreadBasicSample {

    // パターン1: Thread クラスを継承
    static class CounterThread extends Thread {
        private final String name;
        private final int count;

        public CounterThread(String name, int count) {
            super(name); // スレッド名を設定
            this.name = name;
            this.count = count;
        }

        @Override
        public void run() {
            for (int i = 1; i <= count; i++) {
                System.out.println(name + ": " + i);
                try {
                    Thread.sleep(100); // 100ms 待機
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt(); // interrupt フラグを再セット
                    System.out.println(name + ": 中断されました");
                    return;
                }
            }
        }
    }

    // パターン2: Runnable インターフェースを実装（推奨）
    static class PrintTask implements Runnable {
        private final String message;
        private final int repeat;

        public PrintTask(String message, int repeat) {
            this.message = message;
            this.repeat = repeat;
        }

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
        CounterThread t1 = new CounterThread("スレッドA", 3);
        CounterThread t2 = new CounterThread("スレッドB", 3);
        t1.start(); // 新しいスレッドで run() を実行
        t2.start();
        t1.join(); // スレッド終了まで待機
        t2.join();

        System.out.println("\n=== パターン2: Runnable を実装（推奨）===");
        Thread t3 = new Thread(new PrintTask("Hello from Runnable", 3), "worker-1");
        Thread t4 = new Thread(new PrintTask("Hello from Runnable", 3), "worker-2");
        t3.start();
        t4.start();
        t3.join();
        t4.join();

        System.out.println("\n=== よくある間違い: run() を直接呼ぶ ===");
        Thread badThread = new Thread(new PrintTask("直接 run() 呼び出し", 2), "bad-thread");
        badThread.run(); // start() ではなく run() を直接呼ぶとメインスレッドで実行される
        System.out.println("run() 直接呼び出しはメインスレッドで実行される");

        System.out.println("\n=== スレッド情報 ===");
        Thread current = Thread.currentThread();
        System.out.println("スレッド名: " + current.getName());
        System.out.println("スレッドID: " + current.getId());
        System.out.println("優先度: " + current.getPriority());
        System.out.println("デーモン: " + current.isDaemon());
    }
}
