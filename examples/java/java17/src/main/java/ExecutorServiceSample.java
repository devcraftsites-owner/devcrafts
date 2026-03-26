import java.util.ArrayList;
import java.util.concurrent.*;

public class ExecutorServiceSample {

    // タスク情報を保持する record（Java 16+）
    record Task(String name, long sleepMs) {}

    // タスクを Callable として実行するヘルパー
    static Callable<String> toCallable(Task task) {
        // ラムダ式で Callable を記述
        return () -> {
            Thread.sleep(task.sleepMs());
            return "完了: " + task.name() + " by " + Thread.currentThread().getName();
        };
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 固定スレッドプール ===");
        var executor = Executors.newFixedThreadPool(3);

        try {
            var futures = new ArrayList<Future<String>>();
            for (var i = 1; i <= 5; i++) {
                var task = new Task("タスク-" + i, 100);
                var future = executor.submit(toCallable(task));
                futures.add(future);
            }

            for (var future : futures) {
                System.out.println(future.get()); // 結果を待機して取得
            }
        } finally {
            executor.shutdown(); // ✅ 必ず shutdown() する
            executor.awaitTermination(5, TimeUnit.SECONDS);
        }

        System.out.println("\n=== キャッシュスレッドプール ===");
        var cached = Executors.newCachedThreadPool();
        try {
            var f1 = cached.submit(toCallable(new Task("キャッシュA", 50)));
            var f2 = cached.submit(toCallable(new Task("キャッシュB", 50)));
            System.out.println(f1.get());
            System.out.println(f2.get());
        } finally {
            cached.shutdown();
        }

        System.out.println("\n=== タイムアウト付き Future.get() ===");
        var timeoutExecutor = Executors.newSingleThreadExecutor();
        try {
            var future = timeoutExecutor.submit(toCallable(new Task("重いタスク", 500)));
            try {
                var result = future.get(200, TimeUnit.MILLISECONDS); // 200ms でタイムアウト
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
