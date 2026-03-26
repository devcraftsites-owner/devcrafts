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

    // AES-256 鍵を生成
    public static SecretKey generateKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256, new SecureRandom()); // 256ビット鍵
        return keyGen.generateKey();
    }

    // 暗号化（IV をランダム生成して暗号文の先頭に付与）
    public static byte[] encrypt(String plainText, SecretKey key) throws Exception {
        byte[] iv = new byte[GCM_IV_LENGTH];
        new SecureRandom().nextBytes(iv); // ❗ 毎回必ず異なる IV を使う

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, parameterSpec);

        byte[] cipherText = cipher.doFinal(plainText.getBytes("UTF-8"));

        // IV + 暗号文を結合して返す（IV は復号時に必要）
        byte[] result = new byte[iv.length + cipherText.length];
        System.arraycopy(iv, 0, result, 0, iv.length);
        System.arraycopy(cipherText, 0, result, iv.length, cipherText.length);
        return result;
    }

    // 復号（先頭12バイトをIVとして取り出す）
    public static String decrypt(byte[] encryptedData, SecretKey key) throws Exception {
        byte[] iv = Arrays.copyOfRange(encryptedData, 0, GCM_IV_LENGTH);
        byte[] cipherText = Arrays.copyOfRange(encryptedData, GCM_IV_LENGTH, encryptedData.length);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
        cipher.init(Cipher.DECRYPT_MODE, key, parameterSpec);

        return new String(cipher.doFinal(cipherText), "UTF-8");
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== AES-256-GCM 暗号化デモ ===");

        SecretKey key = generateKey();
        String plainText = "機密データ: パスワードは password123 です";

        byte[] encrypted = encrypt(plainText, key);
        System.out.println("暗号文(Base64): " + Base64.getEncoder().encodeToString(encrypted));

        String decrypted = decrypt(encrypted, key);
        System.out.println("復号結果: " + decrypted);

        System.out.println("\n=== 改ざん検出（GCM の認証機能） ===");
        byte[] tampered = Arrays.copyOf(encrypted, encrypted.length);
        tampered[20] ^= 0xFF; // データを1バイト改ざん
        try {
            decrypt(tampered, key);
        } catch (Exception e) {
            System.out.println("改ざん検出: " + e.getClass().getSimpleName());
        }
    }
}
