import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * DP-21: Strategy パターン（Java 8）
 *
 * Strategy パターンは「アルゴリズムをオブジェクト化して、実行時に切り替えられるようにする」パターンです。
 * Java の Comparator インターフェースはこのパターンそのものです。
 */
public class StrategyPatternSample {

    // ===== Strategy インターフェース =====

    /**
     * ソートアルゴリズムを表すインターフェース（Strategy）。
     * 実装クラスを差し替えることでアルゴリズムを切り替えられます。
     */
    interface SortStrategy {
        /**
         * 配列をソートして返します（元の配列は変更しません）。
         *
         * @param data ソート対象の配列
         * @return ソート済みの配列（新しい配列）
         */
        int[] sort(int[] data);
    }

    // ===== 具体的な Strategy 実装クラス =====

    /**
     * バブルソートによる実装。
     * 隣り合う要素を比較して並べ替えを繰り返します。
     * 計算量: O(n²)
     */
    static class BubbleSortStrategy implements SortStrategy {
        @Override
        public int[] sort(int[] data) {
            // 元の配列を変更しないようにコピーする
            int[] result = Arrays.copyOf(data, data.length);
            int n = result.length;
            for (int i = 0; i < n - 1; i++) {
                for (int j = 0; j < n - i - 1; j++) {
                    if (result[j] > result[j + 1]) {
                        // 隣り合う要素を交換
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

    /**
     * 選択ソートによる実装。
     * 未ソート部分から最小値を選んで先頭に移動することを繰り返します。
     * 計算量: O(n²)
     */
    static class SelectionSortStrategy implements SortStrategy {
        @Override
        public int[] sort(int[] data) {
            int[] result = Arrays.copyOf(data, data.length);
            int n = result.length;
            for (int i = 0; i < n - 1; i++) {
                // 未ソート部分の最小値のインデックスを探す
                int minIdx = i;
                for (int j = i + 1; j < n; j++) {
                    if (result[j] < result[minIdx]) {
                        minIdx = j;
                    }
                }
                // 最小値を先頭に移動
                int temp = result[minIdx];
                result[minIdx] = result[i];
                result[i] = temp;
            }
            System.out.println("  [選択ソート実行]");
            return result;
        }
    }

    // ===== Context クラス（Strategy を使う側） =====

    /**
     * データを処理するクラス。
     * SortStrategy を保持し、setStrategy() で切り替えられます。
     */
    static class DataProcessor {

        // 現在のソート戦略
        private SortStrategy strategy;

        public DataProcessor(SortStrategy strategy) {
            this.strategy = strategy;
        }

        /**
         * ソート戦略を切り替えます。
         * 実行時に動的に変更できるのが Strategy パターンの特徴です。
         *
         * @param strategy 新しいソート戦略
         */
        public void setStrategy(SortStrategy strategy) {
            this.strategy = strategy;
        }

        /**
         * 現在の戦略でデータをソートします。
         *
         * @param data ソート対象の配列
         * @return ソート済みの配列
         */
        public int[] process(int[] data) {
            return strategy.sort(data);
        }
    }

    // ===== Comparator を使った実践例（Strategy パターンの活用） =====

    /**
     * 社員情報を表すクラス。
     * ソート基準（Strategy）を Comparator で差し替えられます。
     */
    static class Employee {
        private final String name;
        private final int age;

        public Employee(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() { return name; }
        public int getAge() { return age; }

        @Override
        public String toString() {
            return name + "(" + age + "歳)";
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Strategy パターン: ソートアルゴリズムの切り替え ===");
        System.out.println();

        int[] data = {5, 2, 8, 1, 9, 3};
        System.out.println("ソート前: " + Arrays.toString(data));
        System.out.println();

        // バブルソート戦略で開始
        DataProcessor processor = new DataProcessor(new BubbleSortStrategy());
        int[] result1 = processor.process(data);
        System.out.println("バブルソート結果: " + Arrays.toString(result1));

        System.out.println();

        // 実行時に戦略を切り替え（選択ソートへ）
        System.out.println("--- 戦略を選択ソートに切り替え ---");
        processor.setStrategy(new SelectionSortStrategy());
        int[] result2 = processor.process(data);
        System.out.println("選択ソート結果: " + Arrays.toString(result2));

        System.out.println();
        System.out.println("=== Java の Comparator は Strategy パターンそのもの ===");
        System.out.println();

        // 社員リストを作成
        List<Employee> employees = new ArrayList<Employee>();
        employees.add(new Employee("田中", 35));
        employees.add(new Employee("佐藤", 28));
        employees.add(new Employee("鈴木", 42));
        employees.add(new Employee("山田", 25));

        System.out.println("元のリスト: " + employees);

        // 名前順でソート（戦略1: 名前アルファベット順）
        // Java 8 ではラムダ式で Comparator（Strategy）を定義できる
        List<Employee> byName = new ArrayList<Employee>(employees);
        byName.sort(new Comparator<Employee>() {
            @Override
            public int compare(Employee a, Employee b) {
                return a.getName().compareTo(b.getName());
            }
        });
        System.out.println("名前順: " + byName);

        // 年齢順でソート（戦略2: 年齢の若い順）
        List<Employee> byAge = new ArrayList<Employee>(employees);
        byAge.sort(new Comparator<Employee>() {
            @Override
            public int compare(Employee a, Employee b) {
                return Integer.compare(a.getAge(), b.getAge());
            }
        });
        System.out.println("年齢順: " + byAge);

        // ラムダ式を使った簡潔な記述（Java 8+）
        System.out.println();
        System.out.println("--- ラムダ式による Comparator（Strategy）---");
        List<Employee> byAgeDesc = new ArrayList<Employee>(employees);
        byAgeDesc.sort((a, b) -> Integer.compare(b.getAge(), a.getAge())); // 降順
        System.out.println("年齢降順（ラムダ）: " + byAgeDesc);
    }
}
