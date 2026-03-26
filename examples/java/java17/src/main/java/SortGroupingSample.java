import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SortGroupingSample {

    // Java 16+: record でボイラープレートを削減
    record Employee(String name, String department, int salary) {
        @Override
        public String toString() {
            return name + "(" + department + ", " + salary + "円)";
        }
    }

    public static void main(String[] args) {
        // Java 16+ List.of() + record のコンストラクタ呼び出し
        var employees = List.of(
            new Employee("田中", "営業", 350000),
            new Employee("鈴木", "開発", 420000),
            new Employee("佐藤", "営業", 380000),
            new Employee("山田", "開発", 450000),
            new Employee("伊藤", "人事", 320000),
            new Employee("加藤", "開発", 390000)
        );

        // ① マルチキーソート（record のフィールドを直接参照）
        var sorted = employees.stream()
                .sorted(Comparator.comparing(Employee::department)
                        .thenComparingInt(Employee::salary))
                .toList(); // Java 16+ Stream.toList()（イミュータブル）
        System.out.println("部署→給与順:");
        sorted.forEach(e -> System.out.println("  " + e));

        // ② groupingBy + counting
        Map<String, Long> countByDept = employees.stream()
                .collect(Collectors.groupingBy(Employee::department, Collectors.counting()));
        System.out.println("\n部署別人数: " + countByDept);

        // ③ groupingBy + summingInt
        Map<String, Integer> totalByDept = employees.stream()
                .collect(Collectors.groupingBy(
                        Employee::department,
                        Collectors.summingInt(Employee::salary)));
        System.out.println("部署別給与合計: " + totalByDept);

        // ④ partitioningBy
        Map<Boolean, List<Employee>> partition = employees.stream()
                .collect(Collectors.partitioningBy(e -> e.salary() >= 400000));
        System.out.println("\n40万円以上: " + partition.get(true));
        System.out.println("40万円未満: " + partition.get(false));

        // ⑤ joining
        String nameList = employees.stream()
                .map(Employee::name)
                .collect(Collectors.joining("、"));
        System.out.println("\n社員一覧: " + nameList);
    }
}
