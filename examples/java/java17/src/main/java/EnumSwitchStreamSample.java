import java.util.Arrays;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;

public class EnumSwitchStreamSample {

    enum Day {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY;

        public boolean isWeekend() {
            return this == SATURDAY || this == SUNDAY;
        }
    }

    enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL;
    }

    public static void main(String[] args) {
        // Java 14+: switch 式（-> 記法）
        var day = Day.WEDNESDAY;
        String type = switch (day) {
            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> "平日";
            case SATURDAY, SUNDAY -> "休日";
        };
        System.out.println(day + " は " + type);

        // EnumSet: 特定の Enum 値の集合
        var weekdays = EnumSet.range(Day.MONDAY, Day.FRIDAY);
        var weekend  = EnumSet.of(Day.SATURDAY, Day.SUNDAY);
        System.out.println("平日: " + weekdays);
        System.out.println("週末: " + weekend);

        // Stream で Enum フィルタリング（Java 8+）
        System.out.println("\n週末の日（Stream）:");
        List<Day> weekendDays = Arrays.stream(Day.values())
            .filter(Day::isWeekend)
            .collect(Collectors.toList());
        weekendDays.forEach(d -> System.out.println("  " + d));

        // Stream で EnumMap を構築
        System.out.println("\n=== 平日の一覧 ===");
        Arrays.stream(Day.values())
            .filter(d -> !d.isWeekend())
            .forEach(d -> System.out.println("  " + d));

        // EnumMap: Enum をキーにした高速 Map
        var taskMap = new EnumMap<Priority, List<String>>(Priority.class);
        taskMap.put(Priority.HIGH,   List.of("サーバー障害対応"));
        taskMap.put(Priority.MEDIUM, List.of("定例ミーティング"));
        taskMap.put(Priority.LOW,    List.of("ドキュメント更新"));

        // 全タスクを優先度順に表示（EnumMap はキー挿入順を保持）
        System.out.println("\n=== タスク一覧（優先度順）===");
        for (var entry : taskMap.entrySet()) {
            entry.getValue().forEach(task ->
                System.out.println("[" + entry.getKey() + "] " + task)
            );
        }
    }
}
