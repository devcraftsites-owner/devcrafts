import java.util.ArrayList;
import java.util.List;

public class PrototypePatternSample {

    // Java 17+: record を使ったイミュータブルな注文モデル
    // record はフィールドが final なので、コピーは「新しい値で新しいインスタンスを作る」スタイルになる
    record Order(String customerId, String productId, int quantity, List<String> notes) {

        // コンパクトコンストラクタ: notes を防御的にコピー
        Order {
            notes = List.copyOf(notes); // イミュータブルリストに変換
        }

        // withXxx() スタイルのコピーメソッド（wither パターン）
        Order withQuantity(int newQuantity) {
            return new Order(customerId, productId, newQuantity, notes);
        }

        Order withNote(String additionalNote) {
            List<String> newNotes = new ArrayList<>(notes);
            newNotes.add(additionalNote);
            return new Order(customerId, productId, quantity, newNotes);
        }
    }

    public static void main(String[] args) {
        // 雛形注文を作成
        var template = new Order("C001", "PROD-A", 1, List.of("通常便"));

        System.out.println("雛形: " + template);

        // withXxx() で値を変えた新しいインスタンスを生成（元の record は不変）
        var order1 = template.withQuantity(3).withNote("急便希望");
        var order2 = template.withQuantity(10);

        System.out.println("注文1: " + order1);
        System.out.println("注文2: " + order2);
        System.out.println("雛形（変化なし）: " + template);
    }
}
