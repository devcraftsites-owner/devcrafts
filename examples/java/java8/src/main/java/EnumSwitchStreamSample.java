import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;

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
        // Java 8: 従来の switch 文
        Day day = Day.WEDNESDAY;
        String type;
        switch (day) {
            case MONDAY:
            case TUESDAY:
            case WEDNESDAY:
            case THURSDAY:
            case FRIDAY:
                type = "平日";
                break;
            default:
                type = "休日";
        }
        System.out.println(day + " は " + type);

        // EnumSet: 特定の Enum 値の集合（HashMap より高速）
        EnumSet<Day> weekdays = EnumSet.range(Day.MONDAY, Day.FRIDAY);
        EnumSet<Day> weekend = EnumSet.of(Day.SATURDAY, Day.SUNDAY);
        System.out.println("平日: " + weekdays);
        System.out.println("週末: " + weekend);

        // EnumSet で包含チェック
        System.out.println("MONDAY は平日?: " + weekdays.contains(Day.MONDAY));
        System.out.println("SUNDAY は平日?: " + weekdays.contains(Day.SUNDAY));

        // EnumMap: Enum をキーにした高速 Map
        EnumMap<Priority, List<String>> taskMap = new EnumMap<>(Priority.class);
        taskMap.put(Priority.HIGH, new ArrayList<>());
        taskMap.put(Priority.MEDIUM, new ArrayList<>());
        taskMap.put(Priority.LOW, new ArrayList<>());
        taskMap.get(Priority.HIGH).add("サーバー障害対応");
        taskMap.get(Priority.MEDIUM).add("定例ミーティング");
        taskMap.get(Priority.LOW).add("ドキュメント更新");

        // 全タスクを優先度順に表示
        System.out.println("\n=== タスク一覧（優先度順）===");
        for (Priority priority : Priority.values()) {
            List<String> tasks = taskMap.get(priority);
            if (tasks != null) {
                for (String task : tasks) {
                    System.out.println("[" + priority + "] " + task);
                }
            }
        }

        // for ループで Enum フィルタリング（Java 8 以前のスタイル）
        System.out.println("\n週末の日:");
        for (Day d : Day.values()) {
            if (d.isWeekend()) {
                System.out.println("  " + d);
            }
        }
    }
}
