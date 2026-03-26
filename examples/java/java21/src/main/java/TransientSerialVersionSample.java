import java.io.*;

public class TransientSerialVersionSample {

    // Java 21: sealed interface + switch パターンマッチング
    sealed interface Account permits UserAccount, AdminAccount {}

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

    static final class AdminAccount implements Account, Serializable {
        private static final long serialVersionUID = 1L;

        private final String adminId;
        // secretToken は transient で除外
        private transient String secretToken;

        AdminAccount(String adminId, String secretToken) {
            this.adminId = adminId;
            this.secretToken = secretToken;
        }

        public String adminId()      { return adminId; }
        public String secretToken()  { return secretToken; }

        @Override
        public String toString() {
            return "AdminAccount{adminId='" + adminId
                    + "', secretToken='" + secretToken + "'}";
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

            // Java 21: switch パターンマッチング（型チェック + 変数バインド）
            Account acc = loaded;
            String result = switch (acc) {
                case UserAccount u  -> "ユーザー: " + u.userId() + "（パスワード保護）";
                case AdminAccount a -> "管理者: " + a.adminId() + "（トークン保護）";
            };
            System.out.println("判定結果: " + result);
        }
    }
}
