import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

public class CollectionBasicSample {

    public static void main(String[] args) {

        // ① ArrayList の基本操作（ランダムアクセスが速い）
        List<String> arrayList = new ArrayList<>();
        arrayList.add("Java");
        arrayList.add("Python");
        arrayList.add("Go");
        arrayList.add(1, "Kotlin"); // インデックス1に挿入
        System.out.println("ArrayList: " + arrayList);
        System.out.println("get(0): " + arrayList.get(0)); // ランダムアクセス O(1)
        arrayList.remove("Python");
        System.out.println("remove後: " + arrayList);

        // ② LinkedList の基本操作（先頭・末尾への挿入が速い）
        LinkedList<String> linkedList = new LinkedList<>();
        linkedList.add("first");
        linkedList.addFirst("before_first"); // 先頭に追加 O(1)
        linkedList.addLast("last");          // 末尾に追加 O(1)
        System.out.println("LinkedList: " + linkedList);

        // ③ HashMap の基本操作（キー検索が O(1)）
        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put("apple", 100);
        hashMap.put("banana", 150);
        hashMap.put("cherry", 200);
        System.out.println("HashMap get(apple): " + hashMap.get("apple"));
        System.out.println("containsKey(banana): " + hashMap.containsKey("banana"));

        // getOrDefault: キーが存在しない場合のデフォルト値
        int val = hashMap.getOrDefault("grape", 0);
        System.out.println("getOrDefault(grape): " + val); // 0

        // エントリーのループ
        for (Map.Entry<String, Integer> entry : hashMap.entrySet()) {
            System.out.println("  " + entry.getKey() + ": " + entry.getValue());
        }

        // ④ TreeMap（キー昇順で管理）
        Map<String, Integer> treeMap = new TreeMap<>();
        treeMap.put("cherry", 200);
        treeMap.put("apple", 100);
        treeMap.put("banana", 150);
        System.out.println("TreeMap（昇順）: " + treeMap); // {apple=100, banana=150, cherry=200}

        // ⑤ HashSet の基本操作（重複なし・順序なし）
        Set<String> hashSet = new HashSet<>();
        hashSet.add("A");
        hashSet.add("B");
        hashSet.add("A"); // 重複は無視される
        System.out.println("HashSet size: " + hashSet.size()); // 2

        // ⑥ Collections.unmodifiableList() で変更不可リストを作成
        List<String> base = new ArrayList<>(Arrays.asList("X", "Y", "Z"));
        List<String> unmodifiable = Collections.unmodifiableList(base);
        System.out.println("unmodifiableList: " + unmodifiable);
        // unmodifiable.add("W"); // UnsupportedOperationException が発生する
    }
}
