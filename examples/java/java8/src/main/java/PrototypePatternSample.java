import java.util.ArrayList;
import java.util.List;

public class PrototypePatternSample {

    // ❌ アンチパターン: Object.clone() の使用（Java では非推奨）
    static class BadOrderCloneable implements Cloneable {
        String customerId;
        String productId;
        int quantity;

        @Override
        public BadOrderCloneable clone() {
            try {
                return (BadOrderCloneable) super.clone();
                // 問題1: CloneNotSupportedException が発生しうる
                // 問題2: フィールドが参照型の場合、浅いコピーになる（シャローコピー）
            } catch (CloneNotSupportedException e) {
                throw new RuntimeException("複製できません", e);
            }
        }
    }

    // ✅ 推奨: コピーコンストラクタを使った深いコピー（ディープコピー）
    static class Order {
        private final String customerId;
        private final String productId;
        private int quantity;
        private final List<String> notes;

        // 通常コンストラクタ
        Order(String customerId, String productId, int quantity) {
            this.customerId = customerId;
            this.productId = productId;
            this.quantity = quantity;
            this.notes = new ArrayList<>();
        }

        // コピーコンストラクタ（ディープコピー）
        Order(Order other) {
            this.customerId = other.customerId;
            this.productId = other.productId;
            this.quantity = other.quantity;
            this.notes = new ArrayList<>(other.notes); // リストも新規作成
        }

        void addNote(String note) {
            notes.add(note);
        }

        void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        @Override
        public String toString() {
            return "Order{customerId='" + customerId + "', productId='" + productId
                    + "', quantity=" + quantity + ", notes=" + notes + "}";
        }
    }

    public static void main(String[] args) {
        // 雛形注文を作成
        Order template = new Order("C001", "PROD-A", 1);
        template.addNote("通常便");

        System.out.println("雛形: " + template);

        // コピーして別の注文を作成
        Order order1 = new Order(template);
        order1.setQuantity(3);
        order1.addNote("急便希望");

        Order order2 = new Order(template);
        order2.setQuantity(10);

        System.out.println("注文1: " + order1);
        System.out.println("注文2: " + order2);
        System.out.println("雛形（変化なし）: " + template);
    }
}
