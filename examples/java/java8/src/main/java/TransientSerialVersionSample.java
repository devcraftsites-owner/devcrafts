import java.io.*;

public class TransientSerialVersionSample {

    // serialVersionUID: クラスの「バージョン識別子」
    // 省略するとコンパイラが自動生成するが、クラス変更のたびに変わる危険性がある
    static class UserAccount implements Serializable {
        private static final long serialVersionUID = 1L; // 明示的に定義

        private final String userId;
        private final String email;

        // transient: このフィールドはシリアライズされない
        // パスワード・秘密鍵などのセキュリティ情報は除外すべき
        private transient String password;

        // static フィールドもシリアライズされない（インスタンス固有でないため）
        private static int instanceCount = 0;

        UserAccount(String userId, String email, String password) {
            this.userId = userId;
            this.email = email;
            this.password = password;
            instanceCount++;
        }

        @Override
        public String toString() {
            return "UserAccount{userId='" + userId + "', email='" + email
                    + "', password='" + password + "'}";
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        UserAccount account = new UserAccount("U001", "taro@example.com", "secret123");
        System.out.println("シリアライズ前: " + account);

        // シリアライズ（ByteArray に書き出す）
        byte[] bytes;
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(account);
            bytes = baos.toByteArray();
        }
        System.out.println("シリアライズサイズ: " + bytes.length + " bytes");

        // デシリアライズ
        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             ObjectInputStream ois = new ObjectInputStream(bais)) {
            UserAccount loaded = (UserAccount) ois.readObject();
            // password は transient なので null になる
            System.out.println("デシリアライズ後: " + loaded);
            // → password='null' になることを確認
        }
    }
}
