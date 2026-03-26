import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CopyPitfallSample {

    static class Person {
        String name;
        List<String> hobbies;

        Person(String name, List<String> hobbies) {
            this.name = name;
            this.hobbies = hobbies;
        }

        @Override
        public String toString() {
            return "Person{name='" + name + "', hobbies=" + hobbies + "}";
        }
    }

    public static void main(String[] args) {
        // ❌ 落とし穴 1: 参照のコピー（同じオブジェクトを指す）
        System.out.println("=== 落とし穴 1: 参照コピー ===");
        List<String> original = new ArrayList<>();
        original.add("Java");
        original.add("Python");
        List<String> ref = original; // 同じリストを参照
        ref.add("Kotlin");
        System.out.println("original: " + original); // Kotlin も入っている！
        System.out.println("ref:      " + ref);

        // ⚠️ 落とし穴 2: 浅いコピー（要素は共有）
        System.out.println("\n=== 落とし穴 2: 浅いコピー ===");
        List<Person> people = new ArrayList<>();
        people.add(new Person("田中", new ArrayList<>(Collections.singletonList("サッカー"))));
        List<Person> shallowCopy = new ArrayList<>(people); // 浅いコピー
        shallowCopy.get(0).hobbies.add("テニス"); // 要素は共有されているので元も変わる
        System.out.println("original[0]: " + people.get(0));     // テニスが入っている！
        System.out.println("copy[0]:     " + shallowCopy.get(0));

        // ⚠️ 落とし穴 3: unmodifiableList は元リストの変更を反映
        System.out.println("\n=== 落とし穴 3: unmodifiableList の誤解 ===");
        List<String> mutable = new ArrayList<>();
        mutable.add("A");
        mutable.add("B");
        List<String> unmodifiable = Collections.unmodifiableList(mutable);
        mutable.add("C"); // 元リストを変更
        System.out.println("unmodifiable: " + unmodifiable); // C が入っている！
        // unmodifiable.add("D"); // → UnsupportedOperationException

        // ✅ 対策: ディープコピーを自分で実装
        System.out.println("\n=== ✅ 対策: ディープコピー ===");
        List<Person> deepCopy = new ArrayList<>();
        for (Person p : people) {
            deepCopy.add(new Person(p.name, new ArrayList<>(p.hobbies)));
        }
        deepCopy.get(0).hobbies.add("野球");
        System.out.println("original[0]: " + people.get(0));  // 変わらない
        System.out.println("deepCopy[0]: " + deepCopy.get(0));
    }
}
