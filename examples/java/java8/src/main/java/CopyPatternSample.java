import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CopyPatternSample {

    static class Person {
        private String name;
        private int age;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getAge() { return age; }

        // ディープコピー用コンストラクタ
        public Person deepCopy() {
            return new Person(this.name, this.age);
        }

        @Override
        public String toString() {
            return "Person{name=" + name + ", age=" + age + "}";
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 参照コピー（コピーになっていない） ===");
        List<Person> original = new ArrayList<>();
        original.add(new Person("田中太郎", 25));
        original.add(new Person("山田花子", 30));

        List<Person> sameRef = original; // 同じリスト
        sameRef.get(0).setName("変更された名前");
        System.out.println("original[0]: " + original.get(0)); // 変更されている

        System.out.println("\n=== Shallow Copy（浅いコピー） ===");
        List<Person> original2 = new ArrayList<>(Arrays.asList(
            new Person("田中太郎", 25),
            new Person("山田花子", 30)
        ));

        List<Person> shallowCopy = new ArrayList<>(original2); // リストは新規

        // リストへの追加は影響しない
        shallowCopy.add(new Person("新しい人", 20));
        System.out.println("original2 サイズ: " + original2.size()); // 2（影響なし）

        // 要素の変更は影響する（参照共有）
        shallowCopy.get(0).setName("変更された");
        System.out.println("original2[0]: " + original2.get(0)); // 変更されている

        System.out.println("\n=== Deep Copy（深いコピー） ===");
        List<Person> original3 = new ArrayList<>(Arrays.asList(
            new Person("田中太郎", 25),
            new Person("山田花子", 30)
        ));

        List<Person> deepCopy = new ArrayList<>();
        for (Person p : original3) {
            deepCopy.add(p.deepCopy()); // 各要素も新規コピー
        }

        deepCopy.get(0).setName("変更しても");
        System.out.println("original3[0]: " + original3.get(0)); // 変更されていない

        System.out.println("\n=== int[] の配列コピー ===");
        int[] arr = {1, 2, 3, 4, 5};
        int[] shallowArr = arr;       // 参照コピー
        int[] copiedArr = Arrays.copyOf(arr, arr.length); // 配列コピー

        arr[0] = 99;
        System.out.println("shallowArr[0]: " + shallowArr[0]); // 99（影響あり）
        System.out.println("copiedArr[0]: " + copiedArr[0]);   // 1（影響なし）
    }
}
