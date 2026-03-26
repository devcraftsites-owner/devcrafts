import java.io.*;

public class TransientSerialVersionSample {

    // Java 17: sealed interface を使った安全なシリアライズ設計
    // sealed クラスはサブクラスを限定できるため、デシリアライズ時の型安全性が高まる
    sealed interface Account permits UserAccount, AdminAccount {}

    // 通常ユーザー: パスワードは transient で除外
    static final class UserAccount implements Account, Serializable {
        private static final long serialVersionUID = 1L;

        private final String userId;
        private final String email;

        // transient: シリアライズされないフィールド
        private transient String password;

        UserAccount(String userId, String email, String password) {
            this.userId = userId;
            this.email = email;
            this.password = password;
        }

        public String userId()   { return userId; }
        public String email()    { return email; }
        public String password() { return password; }

        @Override
        public String toString() {
            return "UserAccount{userId='" + userId + "', email='" + email
                    + "', password='" + password + "'}";
        }
    }

    // 管理者ユーザー
    static final class AdminAccount implements Account, Serializable {
        private static final long serialVersionUID = 1L;

        private final String adminId;
        // 管理者トークンも transient で除外
        private transient String secretToken;

        AdminAccount(String adminId, String secretToken) {
            this.adminId = adminId;
            this.secretToken = secretToken;
        }

        public String adminId()     { return adminId; }
        public String secretToken() { return secretToken; }

        @Override
        public String toString() {
            return "AdminAccount{adminId='" + adminId
                    + "', secretToken='" + secretToken + "'}";
        }
    }

    // アカウントの種別を文字列で返すヘルパーメソッド（Java 17: instanceof パターンマッチング使用）
    static String describeAccount(Account acc) {
        if (acc instanceof UserAccount u) {
            // Java 16+ の instanceof パターンマッチング
            return "ユーザー: " + u.userId();
        } else if (acc instanceof AdminAccount a) {
            return "管理者: " + a.adminId();
        } else {
            return "不明なアカウント";
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        var account = new UserAccount("U001", "taro@example.com", "secret123");
        System.out.println("シリアライズ前: " + account);

        // シリアライズ
        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(account);
            bytes = baos.toByteArray();
        }
        System.out.println("シリアライズサイズ: " + bytes.length + " bytes");

        // デシリアライズ
        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            var loaded = (UserAccount) ois.readObject();
            // password は transient なので null
            System.out.println("デシリアライズ後: " + loaded);

            // Java 16+: instanceof パターンマッチングで型ごとの処理
            Account acc = loaded;
            System.out.println("判定結果: " + describeAccount(acc));
        }
    }
}
