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
        boolean equals1 = "target".equals(nullStr); // NullPointerException にならない
        System.out.println("\"target\".equals(null): " + equals1); // false

        // ③ Java 11+ の isBlank() で空白文字列も検出できる
        System.out.println("emptyStr.isBlank(): " + emptyStr.isBlank());   // true
        System.out.println("blankStr.isBlank(): " + blankStr.isBlank());   // true（Java 11+）
        System.out.println("\"hello\".isBlank(): " + "hello".isBlank());   // false

        // isEmpty() との違い: isBlank() はスペースや全角スペース等も空とみなす
        System.out.println("blankStr.isEmpty(): " + blankStr.isEmpty());   // false（空白文字が含まれるため）

        // ④ null と空白文字の両方をチェック（Java 11+ 推奨）
        if (nullStr == null || nullStr.isBlank()) {
            System.out.println("nullStr は null または空白文字列です");
        }

        // ⑤ Optional を使ったnull安全なチェーン処理
        String result2 = Optional.ofNullable(nullStr)
                .filter(s -> !s.isBlank()) // Java 11+: 空白文字列もフィルタ
                .orElse("空またはnullでした");
        System.out.println("Optional filter isBlank: " + result2);

        // ⑥ Optional で map を使って変換
        String result3 = Optional.ofNullable("hello")
                .map(String::toUpperCase)
                .orElse("null でした");
        System.out.println("Optional map(\"hello\"): " + result3); // HELLO
    }
}
