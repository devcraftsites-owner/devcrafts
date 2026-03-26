import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CopyPitfallSample {

    // Java 17+: record で不変オブジェクトを定義
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

    // Java 17+: コピー操作の種類を型安全に表す sealed interface
    sealed interface CopyOp permits CopyOp.Reference, CopyOp.Shallow, CopyOp.Deep {
        record Reference() implements CopyOp {}
        record Shallow() implements CopyOp {}
        record Deep() implements CopyOp {}
    }

    // Java 21: switch パターンマッチングでコピー操作を説明
    static void explain(CopyOp op) {
        switch (op) {
            case CopyOp.Reference r ->
                System.out.println("[参照コピー] 同じオブジェクトを参照。変更が両方に影響する。");
            case CopyOp.Shallow s ->
                System.out.println("[浅いコピー] コンテナは新規。要素オブジェクトは共有される。");
            case CopyOp.Deep d ->
                System.out.println("[深いコピー] コンテナも要素も新規。変更が互いに影響しない。");
        }
    }

    public static void main(String[] args) {
        // 各コピー操作の説明
        explain(new CopyOp.Reference());
        explain(new CopyOp.Shallow());
        explain(new CopyOp.Deep());
        System.out.println();

        // ❌ 落とし穴 1: 参照コピー
        System.out.println("=== 落とし穴 1: 参照コピー ===");
        var original = new ArrayList<String>(List.of("Java", "Python"));
        var ref = original;
        ref.add("Kotlin");
        System.out.println("original: " + original); // Kotlin も入っている！
        System.out.println("ref:      " + ref);

        // ⚠️ 落とし穴 2: 浅いコピー
        System.out.println("\n=== 落とし穴 2: 浅いコピー ===");
        var people = new ArrayList<MutablePerson>();
        people.add(new MutablePerson("田中", new ArrayList<>(List.of("サッカー"))));
        var shallowCopy = new ArrayList<>(people);
        shallowCopy.get(0).hobbies.add("テニス");
        System.out.println("original[0]: " + people.get(0));  // テニスが入っている！
        System.out.println("copy[0]:     " + shallowCopy.get(0));

        // ⚠️ 落とし穴 3: Stream.toList()（Java 16+）は不変リストを返す
        System.out.println("\n=== 落とし穴 3: Stream.toList() は不変リスト ===");
        var source = new ArrayList<String>(List.of("A", "B", "C"));
        var toList = source.stream().toList(); // Java 16+: 不変リストを返す
        System.out.println("toList: " + toList);
        // toList.add("D"); // → UnsupportedOperationException

        // ✅ 対策: record + Stream でのディープコピー
        System.out.println("\n=== ✅ 対策: record + Stream ディープコピー ===");
        var origPeople = List.of(
            new MutablePerson("田中", new ArrayList<>(List.of("サッカー"))),
            new MutablePerson("山田", new ArrayList<>(List.of("野球")))
        );
        // Java 21: Stream + map で各要素をコピー、toList() で不変リストを作成
        var deepCopy = origPeople.stream()
            .map(p -> new MutablePerson(p.name, new ArrayList<>(p.hobbies)))
            .collect(Collectors.toCollection(ArrayList::new));
        deepCopy.get(0).hobbies.add("テニス");
        System.out.println("original[0]: " + origPeople.get(0)); // 変わらない
        System.out.println("deepCopy[0]: " + deepCopy.get(0));
    }
}
