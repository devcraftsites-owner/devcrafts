import java.util.ArrayList;
import java.util.List;

public class CopyPitfallSample {

    // Java 17: record で不変オブジェクトを定義（Java 16+）
    // record のフィールドは final なため、参照共有によるバグが起きにくい
    record ImmutablePerson(String name, List<String> hobbies) {}

    // 落とし穴の説明用に可変クラスも用意
    static class MutablePerson {
        String name;
        List<String> hobbies;

        MutablePerson(String name, List<String> hobbies) {
            this.name = name;
            this.hobbies = hobbies;
        }

        @Override
        public String toString() {
            return "MutablePerson{name='" + name + "', hobbies=" + hobbies + "}";
        }
    }

    public static void main(String[] args) {
        // ❌ 落とし穴 1: 参照のコピー
        System.out.println("=== 落とし穴 1: 参照コピー ===");
        var original = new ArrayList<String>(List.of("Java", "Python"));
        var ref = original; // 同じリストを参照
        ref.add("Kotlin");
        System.out.println("original: " + original); // Kotlin も入っている！
        System.out.println("ref:      " + ref);

        // ⚠️ 落とし穴 2: 浅いコピー（要素は共有）
        System.out.println("\n=== 落とし穴 2: 浅いコピー ===");
        var people = new ArrayList<MutablePerson>();
        people.add(new MutablePerson("田中", new ArrayList<>(List.of("サッカー"))));
        var shallowCopy = new ArrayList<>(people); // 浅いコピー
        shallowCopy.get(0).hobbies.add("テニス"); // 元も変わる！
        System.out.println("original[0]: " + people.get(0));
        System.out.println("copy[0]:     " + shallowCopy.get(0));

        // ⚠️ 落とし穴 3: Java 17 の List.copyOf() は元リスト変更後のスナップショット
        // List.copyOf() は呼び出し時点のコピー。呼び出し後の変更は反映されない
        System.out.println("\n=== 落とし穴 3: List.copyOf() はスナップショット ===");
        var mutable = new ArrayList<String>(List.of("A", "B"));
        var snapshot = List.copyOf(mutable); // この時点のスナップショット
        mutable.add("C");
        System.out.println("mutable:  " + mutable);   // [A, B, C]
        System.out.println("snapshot: " + snapshot);  // [A, B]（C は入っていない）
        // snapshot.add("D"); // → UnsupportedOperationException（不変リスト）

        // ✅ 対策: record + List.copyOf() で安全なコピー
        System.out.println("\n=== ✅ 対策: record + List.copyOf() ===");
        var original2 = new ImmutablePerson("田中", List.of("サッカー", "テニス"));
        // record のフィールドを変更することはできないため、「変更」は新しい record を作ること
        var copied = new ImmutablePerson(original2.name(), List.copyOf(original2.hobbies()));
        System.out.println("original: " + original2);
        System.out.println("copied:   " + copied);
        System.out.println("趣味リストは別オブジェクト: " + (original2.hobbies() != copied.hobbies()));
    }
}
