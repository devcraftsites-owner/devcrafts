import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class CopyPatternSample {

    // record は immutable（変更不可）なためディープコピーが不要
    // Java 16+
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

    public static void main(String[] args) {
        System.out.println("=== record は immutable なのでディープコピー不要 ===");
        var personRecord = new Person("田中太郎", 25);
        // record のフィールドは変更できないため、そもそもコピー問題が発生しない
        System.out.println("record は変更不可: " + personRecord);

        System.out.println("\n=== Shallow Copy（浅いコピー） ===");
        var original = new ArrayList<>(List.of(
            new MutablePerson("田中太郎", 25),
            new MutablePerson("山田花子", 30)
        ));

        var shallowCopy = new ArrayList<>(original); // リストは新規、要素は同じ参照

        // リストへの追加は影響しない
        shallowCopy.add(new MutablePerson("新しい人", 20));
        System.out.println("original サイズ: " + original.size()); // 2（影響なし）

        // 要素の変更は影響する（参照共有）
        shallowCopy.get(0).setName("変更された");
        System.out.println("original[0]: " + original.get(0)); // 変更されている

        System.out.println("\n=== Deep Copy（Stream で各要素を新規作成） ===");
        var original2 = new ArrayList<>(List.of(
            new MutablePerson("田中太郎", 25),
            new MutablePerson("山田花子", 30)
        ));

        // Stream + map で各要素を新規コピー
        var deepCopy = original2.stream()
            .map(p -> new MutablePerson(p.getName(), p.getAge()))
            .collect(Collectors.toCollection(ArrayList::new));

        deepCopy.get(0).setName("変更しても");
        System.out.println("original2[0]: " + original2.get(0)); // 変更されていない

        System.out.println("\n=== var を使った配列コピー ===");
        var arr = new int[]{1, 2, 3, 4, 5};
        var copiedArr = Arrays.copyOf(arr, arr.length); // 配列コピー

        arr[0] = 99;
        System.out.println("arr[0]: " + arr[0]);         // 99
        System.out.println("copiedArr[0]: " + copiedArr[0]); // 1（影響なし）
    }
}
