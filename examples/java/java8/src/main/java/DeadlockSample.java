import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class DeadlockSample {

    // デッドロックのデモ（実際には起こさず、条件を示す）
    static class DeadlockDemo {
        private final Object lockA = new Object();
        private final Object lockB = new Object();

        // スレッド1: A → B の順にロック
        public void thread1Task() {
            synchronized (lockA) {
                System.out.println("Thread1: lockA 取得");
                try { Thread.sleep(50); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
                synchronized (lockB) { // Thread2 が lockB を保持しているとデッドロック
                    System.out.println("Thread1: lockB 取得");
                }
            }
        }

        // スレッド2: B → A の順にロック（❌ 逆順 → デッドロック発生）
        public void thread2TaskBad() {
            synchronized (lockB) {
                System.out.println("Thread2: lockB 取得");
                try { Thread.sleep(50); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
                synchronized (lockA) { // Thread1 が lockA を保持しているとデッドロック
                    System.out.println("Thread2: lockA 取得");
                }
            }
        }

        // ✅ 対策: 常に同じ順番でロックを取得（A → B の統一）
        public void thread2TaskGood() {
            synchronized (lockA) { // lockA を先に取得（順序統一）
                System.out.println("Thread2 (fixed): lockA 取得");
                synchronized (lockB) {
                    System.out.println("Thread2 (fixed): lockB 取得");
                }
            }
        }
    }

    // ✅ tryLock でタイムアウト付きデッドロック回避
    static class TimeoutLockDemo {
        private final Lock lockA = new ReentrantLock();
        private final Lock lockB = new ReentrantLock();

        public boolean tryTask() throws InterruptedException {
            boolean gotA = lockA.tryLock(100, java.util.concurrent.TimeUnit.MILLISECONDS);
            if (!gotA) return false;
            try {
                boolean gotB = lockB.tryLock(100, java.util.concurrent.TimeUnit.MILLISECONDS);
                if (!gotB) return false;
                try {
                    System.out.println("両ロック取得成功");
                    return true;
                } finally {
                    lockB.unlock();
                }
            } finally {
                lockA.unlock();
            }
        }
    }

    // ThreadMXBean でデッドロック検出
    static void checkDeadlock() {
        ThreadMXBean bean = ManagementFactory.getThreadMXBean();
        long[] deadlockedIds = bean.findDeadlockedThreads();
        if (deadlockedIds == null) {
            System.out.println("デッドロックなし");
        } else {
            System.out.println("デッドロック検出! スレッド数: " + deadlockedIds.length);
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== デッドロック検出（ThreadMXBean）===");
        checkDeadlock(); // デッドロックなし

        System.out.println("\n=== tryLock によるデッドロック回避 ===");
        TimeoutLockDemo demo = new TimeoutLockDemo();
        boolean success = demo.tryTask();
        System.out.println("タスク成功: " + success);

        System.out.println("\n=== デッドロックの条件（説明） ===");
        System.out.println("1. 相互排除: リソースは一度に1スレッドのみが使用できる");
        System.out.println("2. 保持と待機: リソースを保持しながら別のリソースを待つ");
        System.out.println("3. 非横取り: 他スレッドのリソースを強制取得できない");
        System.out.println("4. 循環待機: スレッドが循環状に待機している");
        System.out.println("→ 対策: ロック取得順序を統一 / tryLock でタイムアウト設定");
    }
}
