import java.util.ArrayList;
import java.util.concurrent.*;

public class ExecutorServiceSample {

    // タスク情報を保持する record（Java 16+）
    record Task(String name, long sleepMs) {}

    // タスクを Callable として実行するヘルパー
    static Callable<String> toCallable(Task task) {
        return () -> {
            Thread.sleep(task.sleepMs());
            return "完了: " + task.name() + " by " + Thread.currentThread().getName()
                + " (仮想: " + Thread.currentThread().isVirtual() + ")";
        };
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 固定スレッドプール（プラットフォームスレッド） ===");
        var executor = Executors.newFixedThreadPool(3);

        try {
            var futures = new ArrayList<Future<String>>();
            for (var i = 1; i <= 5; i++) {
                var task = new Task("タスク-" + i, 100);
                var future = executor.submit(toCallable(task));
                futures.add(future);
            }

            for (var future : futures) {
                System.out.println(future.get());
            }
        } finally {
            executor.shutdown(); // ✅ 必ず shutdown() する
            executor.awaitTermination(5, TimeUnit.SECONDS);
        }

        // Java 21: 仮想スレッドプール（タスクごとに仮想スレッドを割り当て）
        // プラットフォームスレッドと違い、OS スレッドを消費しないため大量タスクに向く
        System.out.println("\n=== 仮想スレッドプール（Java 21+） ===");
        // Executors.newVirtualThreadPerTaskExecutor() は各タスクに仮想スレッドを割り当てる
        // プラットフォームスレッドプール（newFixedThreadPool）とは異なり、
        // スレッド数の上限がなく、ブロッキング I/O でもスケールしやすい
        var virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();
        try {
            var futures = new ArrayList<Future<String>>();
            for (var i = 1; i <= 5; i++) {
                var task = new Task("仮想タスク-" + i, 100);
                futures.add(virtualExecutor.submit(toCallable(task)));
            }
            for (var future : futures) {
                System.out.println(future.get());
            }
        } finally {
            virtualExecutor.shutdown();
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
