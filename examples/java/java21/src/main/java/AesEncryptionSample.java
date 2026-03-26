import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

public class AesEncryptionSample {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;  // GCM 推奨: 12 バイト
    private static final int GCM_TAG_LENGTH = 128; // 認証タグ: 128 ビット

    // IV と暗号文をまとめて保持する record（Java 16+）
    record EncryptedData(byte[] iv, byte[] cipherText) {}

    // 暗号化・復号の操作を表す sealed interface（Java 17+）
    sealed interface CipherOperation permits CipherOperation.Encrypt, CipherOperation.Decrypt {
        record Encrypt(String plainText) implements CipherOperation {}
        record Decrypt(EncryptedData data) implements CipherOperation {}
    }

    // AES-256 鍵を生成
    public static SecretKey generateKey() throws Exception {
        var keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256, new SecureRandom()); // 256ビット鍵
        return keyGen.generateKey();
    }

    // 暗号化（EncryptedData record で結果を返す）
    public static EncryptedData encrypt(String plainText, SecretKey key) throws Exception {
        var iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv); // ❗ 毎回必ず異なる IV を使う

        var cipher = Cipher.getInstance(ALGORITHM);
        var parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec);

        var cipherText = cipher.doFinal(plainText.getBytes("UTF-8"));
        return new EncryptedData(iv, cipherText);
    }

    // 復号（EncryptedData から IV と暗号文をアンパック）
    public static String decrypt(EncryptedData data, SecretKey key) throws Exception {
        var cipher = Cipher.getInstance(ALGORITHM);
        var parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, data.iv());
        cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec);

        return new String(cipher.doFinal(data.cipherText()), "UTF-8");
    }

    // sealed interface + switch パターンマッチングで暗号化・復号を統一実行（Java 21+）
    public static String execute(CipherOperation op, SecretKey key) throws Exception {
        return switch (op) {
            case CipherOperation.Encrypt e -> {
                var encrypted = encrypt(e.plainText(), key);
                var combined = new byte[encrypted.iv().length + encrypted.cipherText().length];
                System.arraycopy(encrypted.iv(), 0, combined, 0, encrypted.iv().length);
                System.arraycopy(encrypted.cipherText(), 0, combined, encrypted.iv().length, encrypted.cipherText().length);
                yield Base64.getEncoder().encodeToString(combined);
            }
            case CipherOperation.Decrypt d -> decrypt(d.data(), key);
        };
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== AES-256-GCM 暗号化デモ（Java 21） ===");

        var key = generateKey();
        var plainText = "機密データ: パスワードは password123 です";

        // 暗号化
        var encrypted = encrypt(plainText, key);
        var combined = new byte[encrypted.iv().length + encrypted.cipherText().length];
        System.arraycopy(encrypted.iv(), 0, combined, 0, encrypted.iv().length);
        System.arraycopy(encrypted.cipherText(), 0, combined, encrypted.iv().length, encrypted.cipherText().length);
        System.out.println("暗号文(Base64): " + Base64.getEncoder().encodeToString(combined));

        // sealed interface + switch パターンマッチングで復号
        var decryptOp = new CipherOperation.Decrypt(encrypted);
        var decrypted = execute(decryptOp, key);
        System.out.println("復号結果: " + decrypted);

        // execute で暗号化
        var encryptOp = new CipherOperation.Encrypt("別の機密データ");
        var encryptedBase64 = execute(encryptOp, key);
        System.out.println("暗号化(Base64): " + encryptedBase64);

        System.out.println("\n=== 改ざん検出（GCM の認証機能） ===");
        var tampered = Arrays.copyOf(combined, combined.length);
        tampered[20] ^= 0xFF; // データを1バイト改ざん
        var tamperedIv = Arrays.copyOfRange(tampered, 0, GCM_IV_LENGTH);
        var tamperedCipher = Arrays.copyOfRange(tampered, GCM_IV_LENGTH, tampered.length);
        try {
            execute(new CipherOperation.Decrypt(new EncryptedData(tamperedIv, tamperedCipher)), key);
        } catch (Exception e) {
            System.out.println("改ざん検出: " + e.getClass().getSimpleName());
        }
    }
}
