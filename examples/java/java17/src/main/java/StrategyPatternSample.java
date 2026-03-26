import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * DP-21: Strategy パターン（Java 17）
 *
 * Java 17 では var（型推論）と record が使用できます。
 * Person record を使って、ラムダ式で Comparator（Strategy）を定義する例を紹介します。
 */
public class StrategyPatternSample {

    // ===== Strategy インターフェース =====

    interface SortStrategy {
        int[] sort(int[] data);
    }

    // ===== 具体的な Strategy 実装クラス =====

    static class BubbleSortStrategy implements SortStrategy {
        @Override
        public int[] sort(int[] data) {
            var result = Arrays.copyOf(data, data.length); // var で型推論
            int n = result.length;
            for (int i = 0; i < n - 1; i++) {
                for (int j = 0; j < n - i - 1; j++) {
                    if (result[j] > result[j + 1]) {
                        int temp = result[j];
                        result[j] = result[j + 1];
                        result[j + 1] = temp;
                    }
                }
            }
            System.out.println("  [バブルソート実行]");
            return result;
        }
    }

    static class SelectionSortStrategy implements SortStrategy {
        @Override
        public int[] sort(int[] data) {
            var result = Arrays.copyOf(data, data.length);
            int n = result.length;
            for (int i = 0; i < n - 1; i++) {
                int minIdx = i;
                for (int j = i + 1; j < n; j++) {
                    if (result[j] < result[minIdx]) {
                        minIdx = j;
                    }
                }
                int temp = result[minIdx];
                result[minIdx] = result[i];
                result[i] = temp;
            }
            System.out.println("  [選択ソート実行]");
            return result;
        }
    }

    // ===== Context クラス =====

    static class DataProcessor {
        private SortStrategy strategy;

        public DataProcessor(SortStrategy strategy) {
            this.strategy = strategy;
        }

        public void setStrategy(SortStrategy strategy) {
            this.strategy = strategy;
        }

        public int[] process(int[] data) {
            return strategy.sort(data);
        }
    }

    // ===== Java 17: record で人物情報を表現 =====

    /**
     * 人物情報を表す record（Java 17+）。
     * コンストラクタ・getter・equals・hashCode・toString が自動生成されます。
     */
    record Person(String name, int age) {}

    public static void main(String[] args) {
        System.out.println("=== Strategy パターン（Java 17）===");
        System.out.println();

        var data = new int[]{5, 2, 8, 1, 9, 3};
        System.out.println("ソート前: " + Arrays.toString(data));
        System.out.println();

        // var でローカル変数の型推論
        var processor = new DataProcessor(new BubbleSortStrategy());
        var result1 = processor.process(data);
        System.out.println("バブルソート結果: " + Arrays.toString(result1));

        System.out.println();
        System.out.println("--- 戦略を選択ソートに切り替え ---");
        processor.setStrategy(new SelectionSortStrategy());
        var result2 = processor.process(data);
        System.out.println("選択ソート結果: " + Arrays.toString(result2));

        System.out.println();
        System.out.println("=== Java 17: record + Comparator（Strategy） ===");
        System.out.println();

        // record でデータを定義
        var persons = new ArrayList<Person>();
        persons.add(new Person("田中", 35));
        persons.add(new Person("佐藤", 28));
        persons.add(new Person("鈴木", 42));
        persons.add(new Person("山田", 25));

        System.out.println("元のリスト: " + persons);

        // 名前順でソート（ラムダ式で Strategy を定義）
        var byName = new ArrayList<>(persons);
        byName.sort((a, b) -> a.name().compareTo(b.name()));
        System.out.println("名前順: " + byName);

        // 年齢順でソート
        var byAge = new ArrayList<>(persons);
        byAge.sort(Comparator.comparingInt(Person::age));
        System.out.println("年齢順: " + byAge);

        // ラムダ式で戦略を直接渡す（匿名クラスより簡潔）
        System.out.println();
        System.out.println("--- ラムダ式で Strategy を直接定義 ---");
        // SortStrategy インターフェースをラムダ式で実装
        SortStrategy lambdaStrategy = (d) -> {
            var sorted = Arrays.copyOf(d, d.length);
            Arrays.sort(sorted); // Java 標準のソートを使う戦略
            System.out.println("  [Arrays.sort 戦略実行]");
            return sorted;
        };

        var processor2 = new DataProcessor(lambdaStrategy);
        var result3 = processor2.process(data);
        System.out.println("Arrays.sort 結果: " + Arrays.toString(result3));
    }
}
