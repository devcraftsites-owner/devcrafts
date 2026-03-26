import java.util.ArrayList;
import java.util.List;

public class PrototypePatternSample {

    // Java 21+: sealed interface でバリアント（注文種別）を型安全に表現
    sealed interface Order permits Order.StandardOrder, Order.UrgentOrder {

        String customerId();
        String productId();
        int quantity();
        List<String> notes();

        // 標準注文
        record StandardOrder(String customerId, String productId,
                             int quantity, List<String> notes) implements Order {
            public StandardOrder {
                notes = List.copyOf(notes);
            }

            StandardOrder withQuantity(int newQuantity) {
                return new StandardOrder(customerId, productId, newQuantity, notes);
            }

            StandardOrder withNote(String note) {
                List<String> newNotes = new ArrayList<>(notes);
                newNotes.add(note);
                return new StandardOrder(customerId, productId, quantity, newNotes);
            }
        }

        // 緊急注文（追加フィールド: 希望納期）
        record UrgentOrder(String customerId, String productId,
                           int quantity, List<String> notes, String deadline) implements Order {
            public UrgentOrder {
                notes = List.copyOf(notes);
            }

            UrgentOrder withQuantity(int newQuantity) {
                return new UrgentOrder(customerId, productId, newQuantity, notes, deadline);
            }
        }
    }

    // Java 21+: switch パターンマッチングで注文種別を処理
    static String describeOrder(Order order) {
        return switch (order) {
            case Order.StandardOrder s ->
                "標準注文: 顧客=" + s.customerId() + ", 数量=" + s.quantity();
            case Order.UrgentOrder u ->
                "緊急注文: 顧客=" + u.customerId() + ", 数量=" + u.quantity() + ", 納期=" + u.deadline();
        };
    }

    public static void main(String[] args) {
        // 標準注文の雛形を作成
        var template = new Order.StandardOrder("C001", "PROD-A", 1, List.of("通常便"));

        System.out.println("雛形: " + describeOrder(template));

        // withXxx() でコピーして変化させる
        var order1 = template.withQuantity(3).withNote("急便希望");
        var order2 = template.withQuantity(10);

        System.out.println("注文1: " + describeOrder(order1));
        System.out.println("注文2: " + describeOrder(order2));
        System.out.println("雛形（変化なし）: " + describeOrder(template));

        // 緊急注文（別バリアント）
        var urgent = new Order.UrgentOrder("C002", "PROD-B", 5, List.of("速達"), "2024-03-31");
        System.out.println("緊急: " + describeOrder(urgent));
    }
}
