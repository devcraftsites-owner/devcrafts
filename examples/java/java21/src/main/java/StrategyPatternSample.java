import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

/**
 * DP-21: Strategy パターン（Java 21）
 *
 * Java 21 では sealed interface と switch パターンマッチングを使って、
 * ソートの種類を型安全に表現し、各種類に応じたアルゴリズムを切り替えられます。
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
            var result = Arrays.copyOf(data, data.length);
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

    static class MergeSortStrategy implements SortStrategy {
        @Override
        public int[] sort(int[] data) {
            var result = Arrays.copyOf(data, data.length);
            mergeSort(result, 0, result.length - 1);
            System.out.println("  [マージソート実行]");
            return result;
        }

        private void mergeSort(int[] arr, int left, int right) {
            if (left < right) {
                int mid = (left + right) / 2;
                mergeSort(arr, left, mid);
                mergeSort(arr, mid + 1, right);
                merge(arr, left, mid, right);
            }
        }

        private void merge(int[] arr, int left, int mid, int right) {
            int n1 = mid - left + 1;
            int n2 = right - mid;
            int[] leftArr = new int[n1];
            int[] rightArr = new int[n2];
            System.arraycopy(arr, left, leftArr, 0, n1);
            System.arraycopy(arr, mid + 1, rightArr, 0, n2);
            int i = 0, j = 0, k = left;
            while (i < n1 && j < n2) {
                if (leftArr[i] <= rightArr[j]) {
                    arr[k++] = leftArr[i++];
                } else {
                    arr[k++] = rightArr[j++];
                }
            }
            while (i < n1) { arr[k++] = leftArr[i++]; }
            while (j < n2) { arr[k++] = rightArr[j++]; }
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

    // ===== Java 21: sealed interface でソート仕様を表現 =====

    /**
     * ソートの仕様を表す sealed interface（Java 21+）。
     * ByBubble: バブルソートの仕様
     * BySelection: 選択ソートの仕様
     * ByMerge: マージソートの仕様
     */
    sealed interface SortSpec permits SortSpec.ByBubble, SortSpec.BySelection, SortSpec.ByMerge {
        /** バブルソートの仕様 */
        record ByBubble(boolean ascending) implements SortSpec {}
        /** 選択ソートの仕様 */
        record BySelection(boolean ascending) implements SortSpec {}
        /** マージソートの仕様（計算量 O(n log n)） */
        record ByMerge(boolean ascending, boolean stable) implements SortSpec {}
    }

    // ===== switch パターンマッチングで仕様に応じた Strategy を選択 =====

    /**
     * SortSpec に応じた SortStrategy を返します。
     * sealed interface のおかげで switch が全パターンを網羅しているかコンパイル時に確認されます。
     *
     * @param spec ソートの仕様
     * @return 対応する SortStrategy
     */
    static SortStrategy createStrategy(SortSpec spec) {
        return switch (spec) {
            // record deconstruction パターン: フィールドを直接取り出せる（Java 21+）
            case SortSpec.ByBubble(var ascending) -> {
                System.out.println("  バブルソート選択（昇順=" + ascending + ")");
                yield new BubbleSortStrategy();
            }
            case SortSpec.BySelection(var ascending) -> {
                System.out.println("  選択ソート選択（昇順=" + ascending + ")");
                yield new SelectionSortStrategy();
            }
            case SortSpec.ByMerge(var ascending, var stable) -> {
                System.out.println("  マージソート選択（昇順=" + ascending + ", 安定=" + stable + ")");
                yield new MergeSortStrategy();
            }
        };
    }

    // ===== record で人物情報を表現 =====

    record Person(String name, int age) {}

    public static void main(String[] args) {
        System.out.println("=== Strategy パターン（Java 21）===");
        System.out.println();

        var data = new int[]{5, 2, 8, 1, 9, 3};
        System.out.println("ソート前: " + Arrays.toString(data));

        System.out.println();
        System.out.println("=== sealed interface + switch パターンマッチング（Java 21+）===");

        // バブルソート仕様でファクトリーから Strategy を取得
        System.out.println("[バブルソート仕様]");
        var bubbleSpec = new SortSpec.ByBubble(true);
        var bubbleStrategy = createStrategy(bubbleSpec);
        var processor = new DataProcessor(bubbleStrategy);
        System.out.println("結果: " + Arrays.toString(processor.process(data)));

        System.out.println();

        // マージソート仕様に切り替え
        System.out.println("[マージソート仕様]");
        var mergeSpec = new SortSpec.ByMerge(true, true);
        processor.setStrategy(createStrategy(mergeSpec));
        System.out.println("結果: " + Arrays.toString(processor.process(data)));

        System.out.println();
        System.out.println("=== Comparator は Strategy パターン: Person の多軸ソート ===");
        System.out.println();

        var persons = new ArrayList<Person>();
        persons.add(new Person("田中", 35));
        persons.add(new Person("佐藤", 28));
        persons.add(new Person("鈴木", 42));
        persons.add(new Person("山田", 25));

        System.out.println("元のリスト: " + persons);

        // 名前順（ラムダ式 Strategy）
        var byName = new ArrayList<>(persons);
        byName.sort((a, b) -> a.name().compareTo(b.name()));
        System.out.println("名前順: " + byName);

        // 年齢順（メソッド参照 Strategy）
        var byAge = new ArrayList<>(persons);
        byAge.sort(Comparator.comparingInt(Person::age));
        System.out.println("年齢順: " + byAge);
    }
}
