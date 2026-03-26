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

    // ハッシュとソルトをまとめて保持する record（Java 16+）
    record HashResult(byte[] hash, byte[] salt) {}

    // 検証結果を表す sealed interface（Java 17+）
    sealed interface HashVerifyResult permits HashVerifyResult.Match, HashVerifyResult.Mismatch {
        record Match(String message) implements HashVerifyResult {}
        record Mismatch(String message) implements HashVerifyResult {}
    }

    // ソルト生成（毎回ランダム・16バイト以上推奨）
    public static byte[] generateSalt() {
        var random = new SecureRandom();
        var salt = new byte[16];
        random.nextBytes(salt);
        return salt;
    }

    // PBKDF2 でパスワードハッシュを生成
    public static byte[] hashPassword(char[] password, byte[] salt)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        var spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_LENGTH);
        try {
            var factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            return factory.generateSecret(spec).getEncoded();
        } finally {
            spec.clearPassword(); // パスワード文字列をメモリからクリア
        }
    }

    // ソルト生成からハッシュまで一括実行して HashResult を返す
    public static HashResult hashNewPassword(char[] password)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        var salt = generateSalt();
        var hash = hashPassword(password, salt);
        return new HashResult(hash, salt);
    }

    // パスワード検証（定数時間比較でタイミング攻撃を防ぐ）
    public static boolean verify(char[] password, HashResult stored)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        var inputHash = hashPassword(password, stored.salt());
        return MessageDigest.isEqual(inputHash, stored.hash()); // タイミング攻撃対策
    }

    // HashVerifyResult を返す検証メソッド（Java 21 sealed interface 活用）
    public static HashVerifyResult verifyWithResult(char[] password, HashResult stored)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        if (verify(password, stored)) {
            return new HashVerifyResult.Match("パスワードが一致しました");
        } else {
            return new HashVerifyResult.Mismatch("パスワードが一致しません");
        }
    }

    // ❌ アンチパターン: MD5 は使ってはいけない
    public static String badHashMd5(String password) throws NoSuchAlgorithmException {
        var md = MessageDigest.getInstance("MD5");
        var hash = md.digest(password.getBytes());
        return Base64.getEncoder().encodeToString(hash);
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== PBKDF2 パスワードハッシュのデモ（Java 21） ===");

        var password = "MySecureP@ssw0rd".toCharArray();

        // ソルト生成 + ハッシュを一括実行（record で結果をまとめる）
        var result = hashNewPassword(password);

        System.out.println("ソルト(Base64): " + Base64.getEncoder().encodeToString(result.salt()));
        System.out.println("ハッシュ(Base64): " + Base64.getEncoder().encodeToString(result.hash()));

        // sealed interface + switch パターンマッチングで結果をハンドリング（Java 21+）
        var matchResult = verifyWithResult(password, result);
        switch (matchResult) {
            case HashVerifyResult.Match m -> System.out.println("✅ " + m.message());
            case HashVerifyResult.Mismatch mm -> System.out.println("❌ " + mm.message());
        }

        var mismatchResult = verifyWithResult("wrongPassword".toCharArray(), result);
        switch (mismatchResult) {
            case HashVerifyResult.Match m -> System.out.println("✅ " + m.message());
            case HashVerifyResult.Mismatch mm -> System.out.println("❌ " + mm.message());
        }

        System.out.println("\n=== ❌ アンチパターン（MD5）===");
        System.out.println("MD5 ハッシュ: " + badHashMd5("password123"));
        System.out.println("※ MD5 は高速すぎて GPU による総当たり攻撃に脆弱です");
    }
}
