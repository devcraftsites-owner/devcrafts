import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class CopyPatternSample {

    // record は immutable（変更不可）なためディープコピーが不要（Java 16+）
    record Person(String name, int age) {}

    // 変更可能なクラス（Shallow/Deep の違いを示すため）
    static class MutablePerson {
        private String name;
        private int age;

        public MutablePerson(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getAge() { return age; }

        @Override
        public String toString() {
            return "MutablePerson{name=" + name + ", age=" + age + "}";
        }
    }

    // コピー戦略を型安全に表す sealed interface（Java 17+）
    sealed interface CopyStrategy permits CopyStrategy.Shallow, CopyStrategy.Deep {
        record Shallow() implements CopyStrategy {}
        record Deep() implements CopyStrategy {}
    }

    // CopyStrategy の switch パターンマッチングでコピー方法を切り替え（Java 21+）
    public static List<MutablePerson> copyList(List<MutablePerson> src, CopyStrategy strategy) {
        return switch (strategy) {
            case CopyStrategy.Shallow s -> new ArrayList<>(src); // 浅いコピー
            case CopyStrategy.Deep d -> src.stream()             // 深いコピー
                .map(p -> new MutablePerson(p.getName(), p.getAge()))
                .collect(Collectors.toCollection(ArrayList::new));
        };
    }

    public static void main(String[] args) {
        System.out.println("=== record は immutable なのでディープコピー不要 ===");
        var personRecord = new Person("田中太郎", 25);
        System.out.println("record は変更不可: " + personRecord);

        var original = new ArrayList<>(List.of(
            new MutablePerson("田中太郎", 25),
            new MutablePerson("山田花子", 30)
        ));

        System.out.println("\n=== Shallow Copy（CopyStrategy.Shallow） ===");
        var shallowCopy = copyList(original, new CopyStrategy.Shallow());

        shallowCopy.add(new MutablePerson("新しい人", 20));
        System.out.println("original サイズ: " + original.size()); // 2（影響なし）

        shallowCopy.get(0).setName("変更された");
        System.out.println("original[0]: " + original.get(0)); // 変更されている

        // Deep Copy のために original を再初期化
        var original2 = new ArrayList<>(List.of(
            new MutablePerson("田中太郎", 25),
            new MutablePerson("山田花子", 30)
        ));

        System.out.println("\n=== Deep Copy（CopyStrategy.Deep） ===");
        var deepCopy = copyList(original2, new CopyStrategy.Deep());

        deepCopy.get(0).setName("変更しても");
        System.out.println("original2[0]: " + original2.get(0)); // 変更されていない

        System.out.println("\n=== 配列コピー ===");
        var arr = new int[]{1, 2, 3, 4, 5};
        var copiedArr = Arrays.copyOf(arr, arr.length);

        arr[0] = 99;
        System.out.println("arr[0]: " + arr[0]);              // 99
        System.out.println("copiedArr[0]: " + copiedArr[0]);  // 1（影響なし）
    }
}
