import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

public class ExecutorServiceSample {

    // タスク: 処理時間のシミュレーション
    static class SlowTask implements Callable<String> {
        private final String name;
        private final long sleepMs;

        public SlowTask(String name, long sleepMs) {
            this.name = name;
            this.sleepMs = sleepMs;
        }

        @Override
        public String call() throws Exception {
            Thread.sleep(sleepMs);
            return "完了: " + name + " by " + Thread.currentThread().getName();
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 固定スレッドプール ===");
        ExecutorService executor = Executors.newFixedThreadPool(3);

        try {
            List<Future<String>> futures = new ArrayList<Future<String>>();
            for (int i = 1; i <= 5; i++) {
                Future<String> future = executor.submit(new SlowTask("タスク-" + i, 100));
                futures.add(future);
            }

            for (Future<String> future : futures) {
                System.out.println(future.get()); // 結果を待機して取得
            }
        } finally {
            executor.shutdown(); // ✅ 必ず shutdown() する
            executor.awaitTermination(5, TimeUnit.SECONDS);
        }

        System.out.println("\n=== キャッシュスレッドプール ===");
        ExecutorService cached = Executors.newCachedThreadPool();
        try {
            Future<String> f1 = cached.submit(new SlowTask("キャッシュA", 50));
            Future<String> f2 = cached.submit(new SlowTask("キャッシュB", 50));
            System.out.println(f1.get());
            System.out.println(f2.get());
        } finally {
            cached.shutdown();
        }

        System.out.println("\n=== タイムアウト付き Future.get() ===");
        ExecutorService timeoutExecutor = Executors.newSingleThreadExecutor();
        try {
            Future<String> future = timeoutExecutor.submit(new SlowTask("重いタスク", 500));
            try {
                String result = future.get(200, TimeUnit.MILLISECONDS); // 200ms でタイムアウト
                System.out.println(result);
            } catch (TimeoutException e) {
                System.out.println("タイムアウト発生 → future.cancel()");
                future.cancel(true);
            }
        } finally {
            timeoutExecutor.shutdown();
        }
    }
}
