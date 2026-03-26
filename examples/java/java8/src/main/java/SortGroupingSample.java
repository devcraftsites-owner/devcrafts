import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SortGroupingSample {

    // サンプルデータ用クラス
    static class Employee {
        final String name;
        final String department;
        final int salary;

        Employee(String name, String department, int salary) {
            this.name = name;
            this.department = department;
            this.salary = salary;
        }

        @Override
        public String toString() {
            return name + "(" + department + ", " + salary + "円)";
        }
    }

    public static void main(String[] args) {
        List<Employee> employees = Arrays.asList(
            new Employee("田中", "営業", 350000),
            new Employee("鈴木", "開発", 420000),
            new Employee("佐藤", "営業", 380000),
            new Employee("山田", "開発", 450000),
            new Employee("伊藤", "人事", 320000),
            new Employee("加藤", "開発", 390000)
        );

        // ① マルチキーソート（部署昇順 → 給与昇順）
        List<Employee> sorted = employees.stream()
                .sorted(Comparator.comparing((Employee e) -> e.department)
                        .thenComparingInt(e -> e.salary))
                .collect(Collectors.toList());
        System.out.println("部署→給与順:");
        sorted.forEach(e -> System.out.println("  " + e));

        // ② groupingBy + counting（部署別人数）
        Map<String, Long> countByDept = employees.stream()
                .collect(Collectors.groupingBy(e -> e.department, Collectors.counting()));
        System.out.println("\n部署別人数: " + countByDept);

        // ③ groupingBy + summingInt（部署別給与合計）
        Map<String, Integer> totalByDept = employees.stream()
                .collect(Collectors.groupingBy(
                        e -> e.department,
                        Collectors.summingInt(e -> e.salary)));
        System.out.println("部署別給与合計: " + totalByDept);

        // ④ groupingBy + averagingInt（部署別平均給与）
        Map<String, Double> avgByDept = employees.stream()
                .collect(Collectors.groupingBy(
                        e -> e.department,
                        Collectors.averagingInt(e -> e.salary)));
        System.out.println("部署別平均給与: " + avgByDept);

        // ⑤ partitioningBy（400,000円以上/未満で2グループに分割）
        Map<Boolean, List<Employee>> partition = employees.stream()
                .collect(Collectors.partitioningBy(e -> e.salary >= 400000));
        System.out.println("\n40万円以上: " + partition.get(true));
        System.out.println("40万円未満: " + partition.get(false));

        // ⑥ joining（名前一覧を「、」区切りで結合）
        String nameList = employees.stream()
                .map(e -> e.name)
                .collect(Collectors.joining("、"));
        System.out.println("\n社員一覧: " + nameList);
    }
}
