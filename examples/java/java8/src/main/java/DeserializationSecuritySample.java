import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class DeserializationSecuritySample {

    // 安全なクラス（ホワイトリストに含める）
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

    // Java 9+ の ObjectInputFilter を使ったホワイトリスト検証
    // Java 8 では手動で resolveClass をオーバーライドして検証
    static class SecureObjectInputStream extends ObjectInputStream {
        private final List<String> allowedClasses;

        SecureObjectInputStream(InputStream in, List<String> allowedClasses)
                throws IOException {
            super(in);
            this.allowedClasses = allowedClasses;
        }

        @Override
        protected Class<?> resolveClass(ObjectStreamClass desc)
                throws IOException, ClassNotFoundException {
            String className = desc.getName();
            boolean allowed = false;
            for (String allowedClass : allowedClasses) {
                if (className.equals(allowedClass)) {
                    allowed = true;
                    break;
                }
            }
            if (!allowed) {
                throw new InvalidClassException(
                    "デシリアライズ拒否（ホワイトリスト外のクラス）: " + className);
            }
            return super.resolveClass(desc);
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== デシリアライズのセキュリティリスク ===");
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
        SafeData original = new SafeData("テストデータ");

        // シリアライズ
        byte[] bytes;
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(original);
            bytes = baos.toByteArray();
        }

        // ホワイトリスト付きデシリアライズ
        List<String> allowedClasses = new ArrayList<>();
        allowedClasses.add(DeserializationSecuritySample.class.getName() + "$SafeData");
        allowedClasses.add("java.lang.String");

        try (SecureObjectInputStream sois = new SecureObjectInputStream(
                new ByteArrayInputStream(bytes), allowedClasses)) {
            Object obj = sois.readObject();
            System.out.println("\n安全なデシリアライズ成功: " + obj);
        }

        System.out.println("\n=== 対策まとめ ===");
        System.out.println("1. Java 9+: ObjectInputFilter でホワイトリスト設定");
        System.out.println("   ObjectInputFilter filter = ObjectInputFilter.Config.createFilter(");
        System.out.println("       \"com.example.SafeData;java.lang.*;!*\");");
        System.out.println("   ois.setObjectInputFilter(filter);");
        System.out.println("2. 信頼できないソースの ObjectInputStream は使用しない");
        System.out.println("3. JSON（Jackson/Gson）でのデータ交換に切り替える");
        System.out.println("4. serialization proxy パターンの採用");
    }
}
