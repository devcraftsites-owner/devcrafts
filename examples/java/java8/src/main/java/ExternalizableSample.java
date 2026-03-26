import java.io.*;

public class ExternalizableSample {

    // Externalizable: writeExternal/readExternal を自分で実装
    static class ProductCatalog implements Externalizable {
        private String productId;
        private String productName;
        private int price;
        private String internalNote; // 保存したくない内部メモ

        // Externalizable には public 引数なしコンストラクタが必須
        // デシリアライズ時にリフレクションで呼び出される
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
            // internalNote は保存しない（意図的に除外）
        }

        // 読み込み順序は writeExternal と完全に一致させる
        @Override
        public void readExternal(ObjectInput in) throws IOException {
            this.productId = in.readUTF();
            this.productName = in.readUTF();
            this.price = in.readInt();
            this.internalNote = null; // 保存しなかったので null
        }

        @Override
        public String toString() {
            return "Product{id='" + productId + "', name='" + productName
                    + "', price=" + price + ", internalNote='" + internalNote + "'}";
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        ProductCatalog original = new ProductCatalog("P001", "Java入門書", 3800, "在庫少注意");
        System.out.println("元オブジェクト: " + original);

        // シリアライズ
        byte[] bytes;
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(original);
            bytes = baos.toByteArray();
        }
        System.out.println("データサイズ: " + bytes.length + " bytes");

        // デシリアライズ
        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             ObjectInputStream ois = new ObjectInputStream(bais)) {
            ProductCatalog loaded = (ProductCatalog) ois.readObject();
            System.out.println("復元オブジェクト: " + loaded);
            // internalNote は保存されていないので null
        }
    }
}
