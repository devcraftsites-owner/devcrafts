import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SequencedCollection;
import java.util.TreeMap;

public class CollectionBasicSample {

    public static void main(String[] args) {

        // ① Java 9+ の List.of()（イミュータブルリスト）
        List<String> immutableList = List.of("Java", "Python", "Go"); // Java 9+
        System.out.println("List.of: " + immutableList);
        // immutableList.add("Kotlin"); // UnsupportedOperationException が発生する

        // 変更可能なリストにするには ArrayList でラップする
        List<String> mutableList = new ArrayList<>(immutableList);
        mutableList.add("Kotlin");
        System.out.println("変更可能なリスト: " + mutableList);

        // ② Java 9+ の Map.of()（イミュータブルマップ）
        Map<String, Integer> immutableMap = Map.of(
                "apple", 100,
                "banana", 150,
                "cherry", 200
        );
        System.out.println("Map.of get(apple): " + immutableMap.get("apple"));

        // ③ Java 9+ の Set.of()（イミュータブルセット）
        Set<String> immutableSet = Set.of("A", "B", "C");
        System.out.println("Set.of size: " + immutableSet.size());

        // ④ Java 21: SequencedCollection インターフェース（順序付きコレクション）
        SequencedCollection<String> seqList = new ArrayList<>(List.of("X", "Y", "Z")); // Java 21+
        System.out.println("最初の要素: " + seqList.getFirst()); // Java 21+
        System.out.println("最後の要素: " + seqList.getLast());  // Java 21+
        seqList.addFirst("W"); // 先頭に追加 Java 21+
        System.out.println("addFirst後: " + seqList);

        // ⑤ Collections.unmodifiableList との違い
        ArrayList<String> base = new ArrayList<>();
        base.add("A");
        base.add("B");
        List<String> unmodifiable = Collections.unmodifiableList(base);
        base.add("C"); // 元のリストを変更
        System.out.println("unmodifiableList（元リスト変更後）: " + unmodifiable); // C が反映される

        List<String> copy = List.copyOf(base); // Java 10+: 独立したイミュータブルコピー
        base.add("D");
        System.out.println("List.copyOf（元リスト変更後）: " + copy); // D は反映されない

        // ⑥ HashMap と getOrDefault
        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put("apple", 100);
        int val = hashMap.getOrDefault("grape", 0);
        System.out.println("getOrDefault(grape): " + val); // 0

        // ⑦ TreeMap（キー昇順）
        TreeMap<String, Integer> treeMap = new TreeMap<>();
        treeMap.put("cherry", 200);
        treeMap.put("apple", 100);
        treeMap.put("banana", 150);
        System.out.println("TreeMap（昇順）: " + treeMap);
    }
}
