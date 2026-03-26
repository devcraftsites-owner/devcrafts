import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class StreamApiSample {

    public static void main(String[] args) {

        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "Alice", "Dave", "Bob");
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        // ① filter: 条件に合う要素だけ抽出
        List<Integer> evens = numbers.stream()
                .filter(n -> n % 2 == 0)
                .collect(Collectors.toList());
        System.out.println("偶数: " + evens); // [2, 4, 6, 8, 10]

        // ② map: 各要素を変換
        List<String> upperNames = names.stream()
                .map(s -> s.toUpperCase())
                .collect(Collectors.toList());
        System.out.println("大文字: " + upperNames);

        // ③ distinct: 重複排除
        List<String> distinct = names.stream()
                .distinct()
                .collect(Collectors.toList());
        System.out.println("重複排除: " + distinct); // [Alice, Bob, Charlie, Dave]

        // ④ sorted: ソート（自然順）
        List<String> sorted = names.stream()
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        System.out.println("ソート済み: " + sorted); // [Alice, Bob, Charlie, Dave]

        // ⑤ flatMap: ネストされたコレクションをフラット化
        List<List<Integer>> nested = Arrays.asList(
                Arrays.asList(1, 2, 3),
                Arrays.asList(4, 5),
                Arrays.asList(6, 7, 8, 9)
        );
        List<Integer> flat = nested.stream()
                .flatMap(list -> list.stream())
                .collect(Collectors.toList());
        System.out.println("flatMap: " + flat); // [1, 2, 3, 4, 5, 6, 7, 8, 9]

        // ⑥ joining: 文字列連結
        String joined = names.stream()
                .distinct()
                .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("joining: " + joined); // [Alice, Bob, Charlie, Dave]

        // ⑦ groupingBy: グループ化
        Map<Integer, List<String>> byLength = names.stream()
                .distinct()
                .collect(Collectors.groupingBy(s -> s.length()));
        System.out.println("文字数でグループ: " + byLength);

        // ⑧ 集計（sum / count / average）
        int sum = numbers.stream().mapToInt(Integer::intValue).sum();
        long count = numbers.stream().filter(n -> n > 5).count();
        System.out.println("合計: " + sum + ", 5より大きい個数: " + count);

        // ⑨ Optional を返す終端操作（findFirst / min / max）
        Optional<String> first = names.stream()
                .filter(s -> s.startsWith("C"))
                .findFirst();
        System.out.println("C始まり: " + first.orElse("なし")); // Charlie

        Optional<Integer> max = numbers.stream().max(Integer::compareTo);
        System.out.println("最大値: " + max.orElse(0)); // 10
    }
}
