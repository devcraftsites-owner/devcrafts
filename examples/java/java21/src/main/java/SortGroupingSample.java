import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SortGroupingSample {

    // Java 21: record（Java 16 で正式化）
    record Employee(String name, String department, int salary) {
        @Override
        public String toString() {
            return name + "(" + department + ", " + salary + "円)";
        }
    }

    // 集計結果を record で表現
    record DeptSummary(long count, int total, double average) {}

    public static void main(String[] args) {
        var employees = List.of(
            new Employee("田中", "営業", 350000),
            new Employee("鈴木", "開発", 420000),
            new Employee("佐藤", "営業", 380000),
            new Employee("山田", "開発", 450000),
            new Employee("伊藤", "人事", 320000),
            new Employee("加藤", "開発", 390000)
        );

        // ① マルチキーソート
        var sorted = employees.stream()
                .sorted(Comparator.comparing(Employee::department)
                        .thenComparingInt(Employee::salary))
                .toList();
        System.out.println("部署→給与順:");
        sorted.forEach(e -> System.out.println("  " + e));

        // ② groupingBy + counting
        Map<String, Long> countByDept = employees.stream()
                .collect(Collectors.groupingBy(Employee::department, Collectors.counting()));
        System.out.println("\n部署別人数: " + countByDept);

        // ③ Java 21: Collectors.teeing で 合計と件数を1ストリームで同時集計
        Map<String, DeptSummary> summaryByDept = employees.stream()
                .collect(Collectors.groupingBy(
                        Employee::department,
                        Collectors.teeing(
                                Collectors.counting(),
                                Collectors.summingInt(Employee::salary),
                                (count, total) -> new DeptSummary(count, total, (double) total / count)
                        )
                ));
        summaryByDept.forEach((dept, summary) ->
                System.out.printf("%s: %d人, 合計%d円, 平均%.0f円%n",
                        dept, summary.count(), summary.total(), summary.average()));

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
