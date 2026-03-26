import java.text.SimpleDateFormat;
import java.util.Date;

public class ThreadLocalSample {

    // ユーザーコンテキストを保持する record（Java 16+）
    record UserContext(int userId, String threadName) {}

    // ✅ ThreadLocal.withInitial() を使った簡潔な書き方（Java 8+）
    private static final ThreadLocal<Integer> userIdHolder = new ThreadLocal<>();

    // withInitial() で初期値を設定（ラムダ式で書ける）
    private static final ThreadLocal<SimpleDateFormat> dateFormatHolder =
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));

    public static void setUserId(int id) {
        userIdHolder.set(id);
    }

    public static Integer getUserId() {
        return userIdHolder.get();
    }

    public static void clearUserId() {
        userIdHolder.remove(); // ✅ 必ず remove() する（メモリリーク防止）
    }

    public static String formatDate(Date date) {
        return dateFormatHolder.get().format(date);
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== ThreadLocal でスレッド固有データを保持 ===");

        // ラムダ式で Runnable を記述
        Runnable task = () -> {
            var threadId = (int) (Thread.currentThread().getId() % 1000);
            setUserId(threadId);

            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }

            // UserContext record でコンテキスト情報をまとめる
            var context = new UserContext(getUserId(), Thread.currentThread().getName());
            System.out.println(context.threadName() + " → userId=" + context.userId());
            clearUserId(); // ✅ 使い終わったら必ず remove()
        };

        var t1 = new Thread(task, "thread-A");
        var t2 = new Thread(task, "thread-B");
        var t3 = new Thread(task, "thread-C");
        t1.start(); t2.start(); t3.start();
        t1.join(); t2.join(); t3.join();

        System.out.println("\n=== SimpleDateFormat の ThreadLocal 解決策 ===");
        Runnable formatTask = () -> {
            var result = formatDate(new Date());
            System.out.println(Thread.currentThread().getName() + " → " + result);
        };
        var f1 = new Thread(formatTask, "format-1");
        var f2 = new Thread(formatTask, "format-2");
        f1.start(); f2.start();
        f1.join(); f2.join();
    }
}
