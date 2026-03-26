import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class Base64EncodingSample {

    // 文字列を Base64 エンコード
    public static String encode(String text) {
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        return Base64.getEncoder().encodeToString(bytes);
    }

    // Base64 をデコード
    public static String decode(String encoded) {
        byte[] bytes = Base64.getDecoder().decode(encoded);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    // URL セーフ Base64 エンコード（+→- /→_ パディングなし）
    public static String encodeUrlSafe(String text) {
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // URL セーフ Base64 デコード
    public static String decodeUrlSafe(String encoded) {
        byte[] bytes = Base64.getUrlDecoder().decode(encoded);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    // バイナリデータのエンコード・デコード例
    public static void binaryExample() {
        byte[] binaryData = {0x00, 0x01, 0x02, (byte) 0xFF, (byte) 0xFE};
        String encoded = Base64.getEncoder().encodeToString(binaryData);
        System.out.println("バイナリ→Base64: " + encoded);

        byte[] decoded = Base64.getDecoder().decode(encoded);
        System.out.println("一致確認: " + Arrays.equals(binaryData, decoded));
    }

    public static void main(String[] args) {
        String original = "Hello, java-recipes! 日本語テスト";
        String encoded = encode(original);
        String decoded = decode(encoded);

        System.out.println("元の文字列: " + original);
        System.out.println("エンコード: " + encoded);
        System.out.println("デコード:   " + decoded);
        System.out.println("一致:       " + original.equals(decoded));

        System.out.println("\n--- URL セーフ ---");
        String urlSafe = encodeUrlSafe("test/path?key=value&other=123");
        System.out.println("URL セーフ: " + urlSafe);
        System.out.println("デコード:   " + decodeUrlSafe(urlSafe));

        System.out.println("\n--- バイナリ ---");
        binaryExample();
    }
}
