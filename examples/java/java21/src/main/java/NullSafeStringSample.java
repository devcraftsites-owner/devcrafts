import java.util.Objects;
import java.util.Optional;

public class NullSafeStringSample {

    public static void main(String[] args) {

        String nullStr = null;
        String emptyStr = "";
        String blankStr = "   ";

        // ① Objects.toString() でデフォルト値を指定
        String result1 = Objects.toString(nullStr, "デフォルト値");
        System.out.println("Objects.toString(null): " + result1); // デフォルト値

        // ② null安全な equals（定数を左辺に置く）
        boolean equals1 = "target".equals(nullStr);
        System.out.println("\"target\".equals(null): " + equals1); // false

        // ③ Java 11+ の isBlank() で空白文字列も検出できる
        System.out.println("emptyStr.isBlank(): " + emptyStr.isBlank());   // true
        System.out.println("blankStr.isBlank(): " + blankStr.isBlank());   // true
        System.out.println("\"hello\".isBlank(): " + "hello".isBlank());   // false

        // ④ null と空白文字の両方をチェック
        if (nullStr == null || nullStr.isBlank()) {
            System.out.println("nullStr は null または空白文字列です");
        }

        // ⑤ Optional を使ったnull安全なチェーン処理
        String result2 = Optional.ofNullable(nullStr)
                .filter(s -> !s.isBlank())
                .orElse("空またはnullでした");
        System.out.println("Optional filter isBlank: " + result2);

        // ⑥ Java 21: switch 式でnull安全な処理（null ケースを明示）
        String value = null;
        String checked = switch (value) { // Java 21: null を switch で扱える
            case null -> "null でした";
            case String s when s.isBlank() -> "空白文字列でした";
            default -> value.toUpperCase();
        };
        System.out.println("switch で null チェック: " + checked);

        // ⑦ Optional で map を使って変換
        String result3 = Optional.ofNullable("hello")
                .map(String::toUpperCase)
                .orElse("null でした");
        System.out.println("Optional map(\"hello\"): " + result3); // HELLO
    }
}
