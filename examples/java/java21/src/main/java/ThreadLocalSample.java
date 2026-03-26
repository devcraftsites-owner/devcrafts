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

    // --- Java 21 の注意点 ---
    // ScopedValue（Java 21 Preview → Java 23 で正式化予定）
    // ThreadLocal の問題点（継承、remove() 忘れ）を解決するために設計された新 API。
    // 使い方のイメージ:
    //   static final ScopedValue<Integer> SCOPED_USER_ID = ScopedValue.newInstance();
    //   ScopedValue.where(SCOPED_USER_ID, 42).run(() -> {
    //       System.out.println(SCOPED_USER_ID.get()); // 42
    //   });
    // ScopedValue は run() ブロックを抜けると自動的に解放されるため remove() が不要。
    //
    // 仮想スレッドと ThreadLocal の組み合わせ注意点:
    //   - 仮想スレッドは大量生成（数百万）が可能なため、ThreadLocal にサイズの大きいオブジェクトを
    //     保持すると大量のコピーが作られメモリ消費が増加する。
    //   - 仮想スレッドでは ThreadLocal よりも ScopedValue を使うことが推奨されている（JEP 446）。
    //   - 既存の ThreadLocal コードを仮想スレッドで再利用する場合は、保持するオブジェクトのサイズに注意する。

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== ThreadLocal でスレッド固有データを保持（Java 21） ===");

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

            var context = new UserContext(getUserId(), Thread.currentThread().getName());
            System.out.println(context.threadName() + " → userId=" + context.userId()
                + " (仮想スレッド: " + Thread.currentThread().isVirtual() + ")");
            clearUserId(); // ✅ 使い終わったら必ず remove()
        };

        // 通常スレッドでの実行
        System.out.println("--- プラットフォームスレッド ---");
        var t1 = new Thread(task, "thread-A");
        var t2 = new Thread(task, "thread-B");
        t1.start(); t2.start();
        t1.join(); t2.join();

        // 仮想スレッドでの実行（Java 21+）
        // 仮想スレッドでも ThreadLocal は動作するが、大量生成時はメモリに注意
        System.out.println("--- 仮想スレッド（Java 21+） ---");
        var vt1 = Thread.ofVirtual().name("virtual-A").start(task);
        var vt2 = Thread.ofVirtual().name("virtual-B").start(task);
        vt1.join(); vt2.join();

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
