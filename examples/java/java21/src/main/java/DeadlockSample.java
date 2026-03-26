import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class DeadlockSample {

    // デッドロックのデモ（実際には起こさず、条件を示す）
    static class DeadlockDemo {
        private final Object lockA = new Object();
        private final Object lockB = new Object();

        public void thread1Task() {
            synchronized (lockA) {
                System.out.println("Thread1: lockA 取得");
                try { Thread.sleep(50); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
                synchronized (lockB) {
                    System.out.println("Thread1: lockB 取得");
                }
            }
        }

        public void thread2TaskBad() {
            synchronized (lockB) {
                System.out.println("Thread2: lockB 取得");
                try { Thread.sleep(50); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
                synchronized (lockA) {
                    System.out.println("Thread2: lockA 取得");
                }
            }
        }

        public void thread2TaskGood() {
            synchronized (lockA) {
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
            var gotA = lockA.tryLock(100, TimeUnit.MILLISECONDS);
            if (!gotA) return false;
            try {
                var gotB = lockB.tryLock(100, TimeUnit.MILLISECONDS);
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

    // Java 21: sealed interface でデッドロックの4条件を型安全に表現
    sealed interface DeadlockCondition
            permits DeadlockCondition.MutualExclusion, DeadlockCondition.HoldAndWait,
                    DeadlockCondition.NoPreemption, DeadlockCondition.CircularWait {
        record MutualExclusion(String description) implements DeadlockCondition {}
        record HoldAndWait(String description) implements DeadlockCondition {}
        record NoPreemption(String description) implements DeadlockCondition {}
        record CircularWait(String description) implements DeadlockCondition {}
    }

    // switch パターンマッチングで各条件と対策を出力（Java 21+）
    static void describeCondition(DeadlockCondition condition) {
        switch (condition) {
            case DeadlockCondition.MutualExclusion(var desc) ->
                System.out.println("[相互排除] " + desc);
            case DeadlockCondition.HoldAndWait(var desc) ->
                System.out.println("[保持と待機] " + desc);
            case DeadlockCondition.NoPreemption(var desc) ->
                System.out.println("[非横取り] " + desc);
            case DeadlockCondition.CircularWait(var desc) ->
                System.out.println("[循環待機] " + desc + " → ロック取得順序の統一で防止可能");
        }
    }

    // ThreadMXBean でデッドロック検出
    static void checkDeadlock() {
        var bean = ManagementFactory.getThreadMXBean();
        var deadlockedIds = bean.findDeadlockedThreads();
        if (deadlockedIds == null) {
            System.out.println("デッドロックなし");
        } else {
            System.out.println("デッドロック検出! スレッド数: " + deadlockedIds.length);
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== デッドロック検出（ThreadMXBean）===");
        checkDeadlock();

        System.out.println("\n=== tryLock によるデッドロック回避（Java 21）===");
        var demo = new TimeoutLockDemo();
        var success = demo.tryTask();
        System.out.println("タスク成功: " + success);

        System.out.println("\n=== sealed interface + switch パターンマッチング（Java 21+）===");
        describeCondition(new DeadlockCondition.MutualExclusion(
            "リソースは一度に1スレッドのみが使用できる"));
        describeCondition(new DeadlockCondition.HoldAndWait(
            "リソースを保持しながら別のリソースを待つ"));
        describeCondition(new DeadlockCondition.NoPreemption(
            "他スレッドのリソースを強制取得できない"));
        describeCondition(new DeadlockCondition.CircularWait(
            "スレッドが循環状に待機している"));
    }
}
