import java.text.SimpleDateFormat;
import java.util.Date;

public class ThreadLocalSample {

    // ✅ ThreadLocal: 各スレッドに独立したデータを保持
    private static final ThreadLocal<Integer> userIdHolder = new ThreadLocal<Integer>();

    // 実用例: SimpleDateFormat はスレッドアンセーフ → ThreadLocal で解決
    private static final ThreadLocal<SimpleDateFormat> dateFormatHolder =
        new ThreadLocal<SimpleDateFormat>() {
            @Override
            protected SimpleDateFormat initialValue() {
                return new SimpleDateFormat("yyyy-MM-dd");
            }
        };

    // リクエストコンテキストの模擬
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

        Runnable task = new Runnable() {
            @Override
            public void run() {
                int threadId = (int) (Thread.currentThread().getId() % 1000);
                setUserId(threadId);

                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }

                // 他スレッドのデータに影響されない
                System.out.println(Thread.currentThread().getName()
                    + " → userId=" + getUserId());
                clearUserId(); // ✅ 使い終わったら必ず remove()
            }
        };

        Thread t1 = new Thread(task, "thread-A");
        Thread t2 = new Thread(task, "thread-B");
        Thread t3 = new Thread(task, "thread-C");
        t1.start(); t2.start(); t3.start();
        t1.join(); t2.join(); t3.join();

        System.out.println("\n=== SimpleDateFormat の ThreadLocal 解決策 ===");
        Runnable formatTask = new Runnable() {
            @Override
            public void run() {
                String result = formatDate(new Date());
                System.out.println(Thread.currentThread().getName() + " → " + result);
            }
        };
        Thread f1 = new Thread(formatTask, "format-1");
        Thread f2 = new Thread(formatTask, "format-2");
        f1.start(); f2.start();
        f1.join(); f2.join();
    }
}
