import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

        // ② Java 9+ の Map.of()（イミュータブルマップ、最大10エントリー）
        Map<String, Integer> immutableMap = Map.of( // Java 9+
                "apple", 100,
                "banana", 150,
                "cherry", 200
        );
        System.out.println("Map.of get(apple): " + immutableMap.get("apple"));
        // immutableMap.put("grape", 300); // UnsupportedOperationException

        // ③ Java 9+ の Set.of()（イミュータブルセット）
        Set<String> immutableSet = Set.of("A", "B", "C"); // Java 9+
        System.out.println("Set.of size: " + immutableSet.size());

        // ④ Map.ofEntries() で10エントリー以上のイミュータブルマップを作成
        Map<String, Integer> largeMap = Map.ofEntries( // Java 9+
                Map.entry("a", 1),
                Map.entry("b", 2),
                Map.entry("c", 3)
        );
        System.out.println("Map.ofEntries size: " + largeMap.size());

        // ⑤ Collections.unmodifiableList との違い
        // unmodifiableList は元のリストが変更されると影響を受ける
        ArrayList<String> base = new ArrayList<>();
        base.add("X");
        base.add("Y");
        List<String> unmodifiable = Collections.unmodifiableList(base);
        base.add("Z"); // 元のリストを変更
        System.out.println("unmodifiableList（元リスト変更後）: " + unmodifiable); // Z が反映される

        // List.of() は完全に独立したイミュータブルなコピーを作成する
        List<String> copy = List.copyOf(base); // Java 10+: 変更可能リストのイミュータブルコピー
        base.add("W");
        System.out.println("List.copyOf（元リスト変更後）: " + copy); // W は反映されない

        // ⑥ HashMap の基本操作
        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put("apple", 100);
        hashMap.put("banana", 150);
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
