public class SingletonPatternSample {

    // パターン1: Eager Initialization（クラスロード時に生成）
    static class EagerSingleton {
        private static final EagerSingleton INSTANCE = new EagerSingleton();
        private int count = 0;

        private EagerSingleton() {}

        public static EagerSingleton getInstance() {
            return INSTANCE;
        }

        public void increment() { count++; }
        public int getCount() { return count; }
    }

    // パターン2: Lazy Initialization（スレッドアンセーフ - ❌）
    static class LazySingletonUnsafe {
        private static LazySingletonUnsafe instance = null;

        private LazySingletonUnsafe() {}

        public static LazySingletonUnsafe getInstance() {
            if (instance == null) { // ❌ 複数スレッドから同時に呼ばれると2つ生成される
                instance = new LazySingletonUnsafe();
            }
            return instance;
        }
    }

    // パターン3: Double-Checked Locking（スレッドセーフ）
    static class ThreadSafeSingleton {
        private static volatile ThreadSafeSingleton instance = null;

        private ThreadSafeSingleton() {}

        public static ThreadSafeSingleton getInstance() {
            if (instance == null) {
                synchronized (ThreadSafeSingleton.class) {
                    if (instance == null) {
                        instance = new ThreadSafeSingleton();
                    }
                }
            }
            return instance;
        }
    }

    // パターン4: Initialization-on-demand holder（推奨 - シンプルでスレッドセーフ）
    static class HolderSingleton {
        private int value = 42;

        private HolderSingleton() {}

        private static class Holder {
            static final HolderSingleton INSTANCE = new HolderSingleton();
        }

        public static HolderSingleton getInstance() {
            return Holder.INSTANCE;
        }

        public int getValue() { return value; }
    }

    // パターン5: Enum Singleton（最もシンプルで安全）
    enum EnumSingleton {
        INSTANCE;

        private int count = 0;

        public void increment() { count++; }
        public int getCount() { return count; }
    }

    public static void main(String[] args) {
        System.out.println("=== Eager Singleton（Java 17）===");

        // var でローカル変数の型宣言を簡潔に（Java 17+）
        var s1 = EagerSingleton.getInstance();
        var s2 = EagerSingleton.getInstance();
        s1.increment();
        s1.increment();
        System.out.println("同一インスタンス: " + (s1 == s2));
        System.out.println("s2.getCount(): " + s2.getCount()); // 2

        System.out.println("\n=== Holder Singleton（推奨）===");
        var holder = HolderSingleton.getInstance();
        System.out.println(holder.getValue());

        System.out.println("\n=== Enum Singleton ===");
        EnumSingleton.INSTANCE.increment();
        EnumSingleton.INSTANCE.increment();
        System.out.println("count: " + EnumSingleton.INSTANCE.getCount()); // 2

        System.out.println("\n=== java.lang.Runtime の例 ===");
        var rt = Runtime.getRuntime(); // Singleton の実例
        System.out.println("最大メモリ: " + rt.maxMemory() / 1024 / 1024 + " MB");
    }
}
