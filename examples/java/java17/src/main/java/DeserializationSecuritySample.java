import java.io.*;
import java.io.ObjectInputFilter;
import java.util.List;

public class DeserializationSecuritySample {

    // 安全なクラス（シリアライズ対象）
    static class SafeData implements Serializable {
        private static final long serialVersionUID = 1L;
        private final String value;

        SafeData(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return "SafeData{value='" + value + "'}";
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== デシリアライズのセキュリティリスク（Java 17 版） ===");
        System.out.println();
        System.out.println("【脆弱性の仕組み】");
        System.out.println("1. 攻撃者が細工した悪意あるバイト列を送信");
        System.out.println("2. サーバーが ObjectInputStream.readObject() で読み込む");
        System.out.println("3. デシリアライズ時にガジェットチェーンが実行される");
        System.out.println("4. 任意コード実行（RCE: Remote Code Execution）");
        System.out.println();
        System.out.println("【有名な脆弱性事例】");
        System.out.println("- Apache Commons Collections（2015年）");
        System.out.println("- WebLogic, JBoss, Jenkins などに影響");
        System.out.println("- CVE-2015-7501 など");

        // 安全なデシリアライズの例
        var original = new SafeData("テストデータ");

        // シリアライズ
        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(original);
            bytes = baos.toByteArray();
        }

        // Java 9+: ObjectInputFilter でホワイトリスト設定
        // 許可するクラスを明示的に指定し、それ以外は拒否（!* で全拒否）
        String allowedClassName = DeserializationSecuritySample.class.getName() + "$SafeData";
        String filterPattern = allowedClassName + ";java.lang.*;!*";
        ObjectInputFilter filter = ObjectInputFilter.Config.createFilter(filterPattern);

        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            ois.setObjectInputFilter(filter);  // Java 9+ フィルター設定
            Object obj = ois.readObject();
            System.out.println("\n安全なデシリアライズ成功: " + obj);
        }

        System.out.println("\n=== ObjectInputFilter のフィルターパターン構文 ===");
        System.out.println("\"com.example.MyClass\"   → 特定クラスを許可");
        System.out.println("\"com.example.*\"          → パッケージ内の全クラスを許可");
        System.out.println("\"java.lang.*\"             → java.lang パッケージを許可");
        System.out.println("\"!*\"                      → その他全てを拒否（末尾に置く）");
        System.out.println("\"maxdepth=5\"              → オブジェクトグラフの深さ制限");
        System.out.println("\"maxarray=100\"            → 配列の最大サイズ制限");

        System.out.println("\n=== 対策まとめ ===");
        System.out.println("1. Java 9+: ObjectInputFilter でホワイトリスト設定（推奨）");
        System.out.println("2. 信頼できないソースの ObjectInputStream は使用しない");
        System.out.println("3. JSON（Jackson/Gson）でのデータ交換に切り替える");
        System.out.println("4. serialization proxy パターンの採用");
    }
}
