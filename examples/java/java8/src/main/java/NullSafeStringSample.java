import java.util.Objects;
import java.util.Optional;

public class NullSafeStringSample {

    public static void main(String[] args) {

        String nullStr = null;
        String emptyStr = "";
        String blankStr = "   ";

        // ① Objects.toString() でデフォルト値を指定（null の場合だけデフォルト値を返す）
        String result1 = Objects.toString(nullStr, "デフォルト値");
        System.out.println("Objects.toString(null): " + result1); // デフォルト値

        String result2 = Objects.toString("Hello", "デフォルト値");
        System.out.println("Objects.toString(\"Hello\"): " + result2); // Hello

        // ② null安全な equals（定数を左辺に置く）
        boolean equals1 = "target".equals(nullStr); // NullPointerException にならない
        System.out.println("\"target\".equals(null): " + equals1); // false

        // nullStr.equals("target") は NullPointerException が発生するため使ってはいけない

        // ③ null と空文字の両方をチェック（Java 8 の isEmpty）
        if (nullStr == null || nullStr.isEmpty()) {
            System.out.println("nullStr は null または空文字です");
        }

        // ④ 空文字チェック（isEmpty）と空白文字チェックの違い
        System.out.println("emptyStr.isEmpty(): " + emptyStr.isEmpty()); // true
        // blankStr.isEmpty() は false になる（空白文字は含まれているため）
        System.out.println("blankStr.isEmpty(): " + blankStr.isEmpty()); // false

        // ⑤ Optional を使ったnull安全なチェーン処理
        String result3 = Optional.ofNullable(nullStr)
                .orElse("オプショナルのデフォルト");
        System.out.println("Optional.orElse: " + result3); // オプショナルのデフォルト

        // ⑥ Optional で map を使って変換（null の場合は変換をスキップ）
        String result4 = Optional.ofNullable(nullStr)
                .map(s -> s.toUpperCase())
                .orElse("null でした");
        System.out.println("Optional map(null): " + result4); // null でした

        String result5 = Optional.ofNullable("hello")
                .map(s -> s.toUpperCase())
                .orElse("null でした");
        System.out.println("Optional map(\"hello\"): " + result5); // HELLO
    }
}
