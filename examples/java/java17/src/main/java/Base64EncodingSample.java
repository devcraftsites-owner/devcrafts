import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class Base64EncodingSample {

    // エンコード結果を保持する record（Java 16+）
    record EncodingResult(String original, String encoded, String decoded) {
        boolean isRoundTrip() {
            return original.equals(decoded);
        }
    }

    // 文字列を Base64 エンコードして結果を record で返す
    public static EncodingResult encodeAndDecode(String text) {
        var bytes = text.getBytes(StandardCharsets.UTF_8);
        var encoded = Base64.getEncoder().encodeToString(bytes);
        var decodedBytes = Base64.getDecoder().decode(encoded);
        var decoded = new String(decodedBytes, StandardCharsets.UTF_8);
        return new EncodingResult(text, encoded, decoded);
    }

    // URL セーフ Base64 エンコード（+→- /→_ パディングなし）
    public static String encodeUrlSafe(String text) {
        var bytes = text.getBytes(StandardCharsets.UTF_8);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // URL セーフ Base64 デコード
    public static String decodeUrlSafe(String encoded) {
        var bytes = Base64.getUrlDecoder().decode(encoded);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    // バイナリデータのエンコード・デコード例
    public static void binaryExample() {
        var binaryData = new byte[]{0x00, 0x01, 0x02, (byte) 0xFF, (byte) 0xFE};
        var encoded = Base64.getEncoder().encodeToString(binaryData);
        System.out.println("バイナリ→Base64: " + encoded);

        var decoded = Base64.getDecoder().decode(encoded);
        System.out.println("一致確認: " + Arrays.equals(binaryData, decoded));
    }

    public static void main(String[] args) {
        // record を使って結果をまとめて表示
        var result = encodeAndDecode("Hello, java-recipes! 日本語テスト");
        System.out.println("元の文字列: " + result.original());
        System.out.println("エンコード: " + result.encoded());
        System.out.println("デコード:   " + result.decoded());
        System.out.println("往復一致:   " + result.isRoundTrip());

        System.out.println("\n--- URL セーフ ---");
        var urlSafe = encodeUrlSafe("test/path?key=value&other=123");
        System.out.println("URL セーフ: " + urlSafe);
        System.out.println("デコード:   " + decodeUrlSafe(urlSafe));

        System.out.println("\n--- バイナリ ---");
        binaryExample();

        // テキストブロックを使った出力（Java 15+）
        var summary = """
                === Base64 エンコーディング結果 ===
                元の文字列: %s
                エンコード: %s
                往復一致:   %s
                """.formatted(result.original(), result.encoded(), result.isRoundTrip());
        System.out.println(summary);
    }
}
