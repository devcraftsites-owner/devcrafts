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
        // 基本的な使い方
        Color color = Color.RED;
        System.out.println("色: " + color);                  // RED
        System.out.println("名前: " + color.name());         // RED
        System.out.println("順序: " + color.ordinal());      // 0

        System.out.println("\n--- values() で全要素取得 ---");
        for (Color c : Color.values()) {
            System.out.println(c.name() + " (ordinal=" + c.ordinal() + ")");
        }

        System.out.println("\n--- valueOf() で文字列から変換 ---");
        Color fromStr = Color.valueOf("GREEN");
        System.out.println("GREEN から変換: " + fromStr);

        // Enum は == で比較できる（equals() 不要）
        System.out.println("\n--- == による比較 ---");
        System.out.println(color == Color.RED);    // true
        System.out.println(color == Color.BLUE);   // false

        System.out.println("\n--- 曜日: isWeekend() ---");
        for (DayOfWeekJp day : DayOfWeekJp.values()) {
            System.out.println(day + ": " + (day.isWeekend() ? "休日" : "平日"));
        }

        System.out.println("\n--- switch 文での使用 ---");
        OrderStatus status = OrderStatus.PROCESSING;
        switch (status) {
            case PENDING:
                System.out.println("注文待ち");
                break;
            case PROCESSING:
                System.out.println("処理中");
                break;
            case COMPLETED:
                System.out.println("完了");
                break;
            case CANCELLED:
                System.out.println("キャンセル");
                break;
        }
        System.out.println("終端状態: " + status.isTerminal()); // false
    }
}
