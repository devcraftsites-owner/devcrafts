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

    // Java 21: パターンマッチング switch（when ガード付き）// Java 21+
    static String describeDay(Day day) {
        return switch (day) {
            case Day d when d.isWeekend() -> d + "（週末）";
            case Day d -> d + "（平日）";
        };
    }

    public static void main(String[] args) {
        // switch 式（Java 14+）
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

        // Stream で Enum フィルタリング
        System.out.println("\n週末の日（Stream）:");
        List<Day> weekendDays = Arrays.stream(Day.values())
            .filter(Day::isWeekend)
            .collect(Collectors.toList());
        weekendDays.forEach(d -> System.out.println("  " + d));

        // Java 21: パターンマッチング switch で全曜日を分類 // Java 21+
        System.out.println("\n=== パターンマッチング switch（Java 21+）===");
        for (var d : Day.values()) {
            System.out.println(describeDay(d));
        }

        // EnumMap: Enum をキーにした高速 Map
        var taskMap = new EnumMap<Priority, List<String>>(Priority.class);
        taskMap.put(Priority.HIGH,   List.of("サーバー障害対応"));
        taskMap.put(Priority.MEDIUM, List.of("定例ミーティング"));
        taskMap.put(Priority.LOW,    List.of("ドキュメント更新"));

        System.out.println("\n=== タスク一覧（優先度順）===");
        for (var entry : taskMap.entrySet()) {
            entry.getValue().forEach(task ->
                System.out.println("[" + entry.getKey() + "] " + task)
            );
        }
    }
}
