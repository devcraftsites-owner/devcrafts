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

    // バイト配列形式の暗号文（IV+暗号文結合）から復号（互換用）
    public static String decryptBytes(byte[] encryptedData, SecretKey key) throws Exception {
        var iv = Arrays.copyOfRange(encryptedData, 0, GCM_IV_LENGTH);
        var cipherText = Arrays.copyOfRange(encryptedData, GCM_IV_LENGTH, encryptedData.length);
        return decrypt(new EncryptedData(iv, cipherText), key);
    }

    // EncryptedData を IV+暗号文結合のバイト配列に変換
    public static byte[] toBytes(EncryptedData data) {
        var result = new byte[data.iv().length + data.cipherText().length];
        System.arraycopy(data.iv(), 0, result, 0, data.iv().length);
        System.arraycopy(data.cipherText(), 0, result, data.iv().length, data.cipherText().length);
        return result;
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== AES-256-GCM 暗号化デモ（Java 17） ===");

        var key = generateKey();
        var plainText = "機密データ: パスワードは password123 です";

        // record で暗号化結果をまとめる
        var encrypted = encrypt(plainText, key);
        var encryptedBytes = toBytes(encrypted);
        System.out.println("暗号文(Base64): " + Base64.getEncoder().encodeToString(encryptedBytes));

        var decrypted = decrypt(encrypted, key);
        System.out.println("復号結果: " + decrypted);

        System.out.println("\n=== 改ざん検出（GCM の認証機能） ===");
        var tampered = Arrays.copyOf(encryptedBytes, encryptedBytes.length);
        tampered[20] ^= 0xFF; // データを1バイト改ざん
        try {
            decryptBytes(tampered, key);
        } catch (Exception e) {
            System.out.println("改ざん検出: " + e.getClass().getSimpleName());
        }
    }
}
