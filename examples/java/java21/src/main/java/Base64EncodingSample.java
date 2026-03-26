import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class Base64EncodingSample {

    // Base64 のエンコード方式を表す sealed interface（Java 17+）
    sealed interface Base64Mode {
        record Standard() implements Base64Mode {}
        record UrlSafe() implements Base64Mode {}
        record Mime() implements Base64Mode {}
    }

    // エンコード結果を保持する record
    record EncodingResult(String original, String encoded, String decoded) {
        boolean isRoundTrip() {
            return original.equals(decoded);
        }
    }

    // モードに応じたエンコード（パターンマッチング switch - Java 21+）
    public static String encode(String text, Base64Mode mode) {
        var bytes = text.getBytes(StandardCharsets.UTF_8);
        return switch (mode) {
            case Base64Mode.Standard s -> Base64.getEncoder().encodeToString(bytes);
            case Base64Mode.UrlSafe u -> Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            case Base64Mode.Mime m -> Base64.getMimeEncoder().encodeToString(bytes);
        };
    }

    // モードに応じたデコード
    public static String decode(String encoded, Base64Mode mode) {
        var bytes = switch (mode) {
            case Base64Mode.Standard s -> Base64.getDecoder().decode(encoded);
            case Base64Mode.UrlSafe u -> Base64.getUrlDecoder().decode(encoded);
            case Base64Mode.Mime m -> Base64.getMimeDecoder().decode(encoded);
        };
        return new String(bytes, StandardCharsets.UTF_8);
    }

    // 往復変換を確認する
    public static EncodingResult roundTrip(String text, Base64Mode mode) {
        var encoded = encode(text, mode);
        var decoded = decode(encoded, mode);
        return new EncodingResult(text, encoded, decoded);
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
        var text = "Hello, java-recipes! 日本語テスト";

        // 各モードで往復変換を確認
        for (var mode : new Base64Mode[]{new Base64Mode.Standard(), new Base64Mode.UrlSafe(), new Base64Mode.Mime()}) {
            var result = roundTrip(text, mode);
            var modeName = switch (mode) {
                case Base64Mode.Standard s -> "Standard";
                case Base64Mode.UrlSafe u -> "UrlSafe ";
                case Base64Mode.Mime m -> "MIME    ";
            };
            System.out.println(modeName + " | encoded=" + result.encoded().substring(0, 20) + "... | 一致=" + result.isRoundTrip());
        }

        System.out.println("\n--- URL セーフ詳細 ---");
        var urlResult = roundTrip("test/path?key=value&other=123", new Base64Mode.UrlSafe());
        System.out.println("URL セーフ: " + urlResult.encoded());
        System.out.println("デコード:   " + urlResult.decoded());

        System.out.println("\n--- バイナリ ---");
        binaryExample();
    }
}
