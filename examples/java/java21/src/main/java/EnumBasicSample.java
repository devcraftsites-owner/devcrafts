import java.util.EnumMap;
import java.util.EnumSet;

public class EnumBasicSample {

    // 基本的な Enum の定義
    enum Color {
        RED, GREEN, BLUE
    }

    // 曜日の Enum
    enum DayOfWeekJp {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY;

        // Enum にメソッドを追加できる
        public boolean isWeekend() {
            return this == SATURDAY || this == SUNDAY;
        }
    }

    // 注文ステータスの Enum（実務的な例）
    enum OrderStatus {
        PENDING,    // 未処理
        PROCESSING, // 処理中
        COMPLETED,  // 完了
        CANCELLED;  // キャンセル

        public boolean isTerminal() {
            return this == COMPLETED || this == CANCELLED;
        }
    }

    public static void main(String[] args) {
        // var を使ったローカル変数型推論（Java 10+）
        var color = Color.RED;
        System.out.println("色: " + color);                  // RED
        System.out.println("名前: " + color.name());         // RED
        System.out.println("順序: " + color.ordinal());      // 0

        System.out.println("\n--- values() で全要素取得 ---");
        for (var c : Color.values()) {
            System.out.println(c.name() + " (ordinal=" + c.ordinal() + ")");
        }

        System.out.println("\n--- valueOf() で文字列から変換 ---");
        var fromStr = Color.valueOf("GREEN");
        System.out.println("GREEN から変換: " + fromStr);

        System.out.println("\n--- 曜日: isWeekend() ---");
        for (var day : DayOfWeekJp.values()) {
            System.out.println(day + ": " + (day.isWeekend() ? "休日" : "平日"));
        }

        // Java 14+ switch 式（-> 記法）
        System.out.println("\n--- switch 式での使用（Java 14+）---");
        var status = OrderStatus.PROCESSING;
        String label = switch (status) {
            case PENDING    -> "注文待ち";
            case PROCESSING -> "処理中";
            case COMPLETED  -> "完了";
            case CANCELLED  -> "キャンセル";
        };
        System.out.println("ステータス: " + label);
        System.out.println("終端状態: " + status.isTerminal()); // false

        // EnumSet: Enum 専用の高速 Set（Java 21 でも利用可能）
        System.out.println("\n--- EnumSet ---");
        EnumSet<DayOfWeekJp> weekdays = EnumSet.range(DayOfWeekJp.MONDAY, DayOfWeekJp.FRIDAY);
        EnumSet<DayOfWeekJp> weekends = EnumSet.of(DayOfWeekJp.SATURDAY, DayOfWeekJp.SUNDAY);
        System.out.println("平日: " + weekdays);
        System.out.println("休日: " + weekends);

        // EnumMap: Enum をキーとする高速 Map
        System.out.println("\n--- EnumMap ---");
        EnumMap<OrderStatus, String> statusLabels = new EnumMap<>(OrderStatus.class);
        statusLabels.put(OrderStatus.PENDING,    "未処理");
        statusLabels.put(OrderStatus.PROCESSING, "処理中");
        statusLabels.put(OrderStatus.COMPLETED,  "完了");
        statusLabels.put(OrderStatus.CANCELLED,  "キャンセル");
        for (var entry : statusLabels.entrySet()) {
            System.out.println(entry.getKey() + " → " + entry.getValue());
        }
    }
}
