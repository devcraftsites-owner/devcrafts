import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Arrays;
import java.util.Base64;

public class PasswordHashingSample {

    private static final int ITERATIONS = 310_000; // OWASP 推奨（2023年）
    private static final int KEY_LENGTH = 256;     // ビット数

    // ソルト生成（毎回ランダム・16バイト以上推奨）
    public static byte[] generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return salt;
    }

    // PBKDF2 でパスワードハッシュを生成
    public static byte[] hashPassword(char[] password, byte[] salt)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_LENGTH);
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } finally {
            spec.clearPassword(); // パスワード文字列をメモリからクリア
        }
    }

    // パスワード検証（定数時間比較でタイミング攻撃を防ぐ）
    public static boolean verifyPassword(char[] inputPassword, byte[] storedHash, byte[] salt)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] inputHash = hashPassword(inputPassword, salt);
        return MessageDigest.isEqual(inputHash, storedHash); // タイミング攻撃対策
    }

    // ❌ アンチパターン: MD5 は使ってはいけない
    public static String badHashMd5(String password) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = md.digest(password.getBytes());
        return Base64.getEncoder().encodeToString(hash);
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== PBKDF2 パスワードハッシュのデモ ===");

        char[] password = "MySecureP@ssw0rd".toCharArray();

        // ハッシュ生成
        byte[] salt = generateSalt();
        byte[] hash = hashPassword(password, salt);

        System.out.println("ソルト(Base64): " + Base64.getEncoder().encodeToString(salt));
        System.out.println("ハッシュ(Base64): " + Base64.getEncoder().encodeToString(hash));

        // 正しいパスワードで検証
        boolean valid = verifyPassword(password, hash, salt);
        System.out.println("正しいパスワード: " + valid); // true

        // 誤ったパスワードで検証
        boolean invalid = verifyPassword("wrongPassword".toCharArray(), hash, salt);
        System.out.println("誤ったパスワード: " + invalid); // false

        System.out.println("\n=== ❌ アンチパターン（MD5）===");
        System.out.println("MD5 ハッシュ: " + badHashMd5("password123"));
        System.out.println("※ MD5 は高速すぎて GPU による総当たり攻撃に脆弱です");
    }
}
