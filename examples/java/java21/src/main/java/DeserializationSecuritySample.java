import java.io.*;
import java.io.ObjectInputFilter;

public class DeserializationSecuritySample {

    // Java 21: sealed interface でデシリアライズ可能な型を明示的に制限
    sealed interface SafePayload permits SafePayload.TextData, SafePayload.NumberData {
        record TextData(String value) implements SafePayload, Serializable {
            private static final long serialVersionUID = 1L;
        }
        record NumberData(int value) implements SafePayload, Serializable {
            private static final long serialVersionUID = 1L;
        }
    }

    // sealed interface の実装クラスのみをデシリアライズ対象に制限する
    static ObjectInputFilter buildSealedFilter() {
        String textDataClass = SafePayload.TextData.class.getName();
        String numberDataClass = SafePayload.NumberData.class.getName();
        // 許可するクラスのみ指定し、それ以外は拒否（!* で全拒否）
        String pattern = textDataClass + ";" + numberDataClass + ";java.lang.*;!*";
        return ObjectInputFilter.Config.createFilter(pattern);
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== デシリアライズのセキュリティリスク（Java 21 版） ===");
        System.out.println();
        System.out.println("【脆弱性の仕組み】");
        System.out.println("1. 攻撃者が細工した悪意あるバイト列を送信");
        System.out.println("2. サーバーが ObjectInputStream.readObject() で読み込む");
        System.out.println("3. デシリアライズ時にガジェットチェーンが実行される");
        System.out.println("4. 任意コード実行（RCE: Remote Code Execution）");
        System.out.println();
        System.out.println("【Java 21 での対策：sealed interface で型を制限】");
        System.out.println("sealed interface を使うと、デシリアライズ可能な型の集合を");
        System.out.println("コンパイル時に明示できます。ObjectInputFilter との組み合わせで");
        System.out.println("実行時も型を制限できます。");

        // TextData のシリアライズ
        var original = new SafePayload.TextData("テストデータ");
        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(original);
            bytes = baos.toByteArray();
        }

        // ObjectInputFilter でホワイトリスト設定（Java 9+）
        var filter = buildSealedFilter();
        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            ois.setObjectInputFilter(filter);
            Object obj = ois.readObject();

            // Java 21: パターンマッチング switch で型安全に処理
            if (obj instanceof SafePayload payload) {
                String result = switch (payload) {
                    case SafePayload.TextData   td -> "テキストデータ: " + td.value();
                    case SafePayload.NumberData nd -> "数値データ: " + nd.value();
                };
                System.out.println("\n安全なデシリアライズ成功: " + result);
            }
        }

        System.out.println("\n=== 対策まとめ ===");
        System.out.println("1. sealed interface で許可する型を明示する（設計レベルの制限）");
        System.out.println("2. ObjectInputFilter でホワイトリスト設定（実行時の制限）");
        System.out.println("3. 信頼できないソースの ObjectInputStream は使用しない");
        System.out.println("4. JSON（Jackson/Gson）でのデータ交換に切り替える");
    }
}
