import java.io.*;

public class ExternalizableSample {

    // Externalizable: writeExternal/readExternal を自分で実装
    // Java 21 でも record は Externalizable 不可（final フィールドのため）
    // カスタムシリアライズには通常クラスを使う
    static class ProductCatalog implements Externalizable {
        private String productId;
        private String productName;
        private int price;
        private String internalNote; // 保存したくない内部メモ

        // Externalizable には public 引数なしコンストラクタが必須
        public ProductCatalog() {}

        ProductCatalog(String productId, String productName, int price, String internalNote) {
            this.productId = productId;
            this.productName = productName;
            this.price = price;
            this.internalNote = internalNote;
        }

        // 保存するフィールドを明示的に指定
        @Override
        public void writeExternal(ObjectOutput out) throws IOException {
            out.writeUTF(productId);
            out.writeUTF(productName);
            out.writeInt(price);
            // internalNote は保存しない
        }

        // 読み込み順序は writeExternal と完全に一致させる
        @Override
        public void readExternal(ObjectInput in) throws IOException {
            this.productId = in.readUTF();
            this.productName = in.readUTF();
            this.price = in.readInt();
            this.internalNote = null;
        }

        // Java 21: switch 式で価格帯判定（guarded パターンは参照型のみ。int は従来の switch を使う）
        public String priceCategory() {
            if (price < 1000) {
                return "低価格（1,000円未満）";
            } else if (price < 3000) {
                return "普通（1,000〜2,999円）";
            } else if (price < 5000) {
                return "やや高め（3,000〜4,999円）";
            } else {
                return "高価格（5,000円以上）";
            }
        }

        @Override
        public String toString() {
            return "Product{id='" + productId + "', name='" + productName
                    + "', price=" + price + ", internalNote='" + internalNote + "'}";
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        var original = new ProductCatalog("P001", "Java入門書", 3800, "在庫少注意");
        System.out.println("元オブジェクト: " + original);
        System.out.println("価格帯: " + original.priceCategory());

        // シリアライズ
        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(original);
            bytes = baos.toByteArray();
        }
        System.out.println("データサイズ: " + bytes.length + " bytes");

        // デシリアライズ
        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            var loaded = (ProductCatalog) ois.readObject();
            System.out.println("復元オブジェクト: " + loaded);
            // internalNote は保存されていないので null
            System.out.println("価格帯（復元後）: " + loaded.priceCategory());
        }
    }
}
