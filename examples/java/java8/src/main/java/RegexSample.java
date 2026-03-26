import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexSample {

    // ① Pattern.compile() はコストが高いため static final で使い回す
    //    メソッド内で毎回 compile すると呼び出しのたびにオブジェクトが生成されてしまう
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$");

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^0\\d{1,4}-\\d{1,4}-\\d{4}$");

    private static final Pattern ZIP_PATTERN =
            Pattern.compile("^\\d{3}-\\d{4}$");

    // ② キャプチャグループ（()）で部分抽出
    private static final Pattern DATE_PATTERN =
            Pattern.compile("(\\d{4})/(\\d{2})/(\\d{2})");

    // ③ 全角カタカナチェック（ァ-ヶ の Unicode範囲）
    private static final Pattern ZENKAKU_KANA_PATTERN =
            Pattern.compile("[\\u30A1-\\u30F6]+");

    // メールアドレス検証（matches() = 文字列全体がパターンにマッチするか）
    public static boolean isValidEmail(String email) {
        if (email == null) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    // 電話番号検証（ハイフン区切り形式: 03-1234-5678 / 090-1234-5678 など）
    public static boolean isValidPhone(String phone) {
        if (phone == null) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }

    // 郵便番号検証（123-4567 形式）
    public static boolean isValidZip(String zip) {
        if (zip == null) {
            return false;
        }
        return ZIP_PATTERN.matcher(zip).matches();
    }

    // ④ find() vs matches() の違い
    //    find()    : 文字列の一部にパターンが含まれるか
    //    matches() : 文字列全体がパターンにマッチするか
    public static boolean containsDate(String text) {
        if (text == null) {
            return false;
        }
        return DATE_PATTERN.matcher(text).find();
    }

    // テキストから最初の日付を抽出してキャプチャグループで分解
    public static String extractFirstDate(String text) {
        if (text == null) {
            return null;
        }
        Matcher m = DATE_PATTERN.matcher(text);
        if (m.find()) {
            // group(0) = マッチ全体、group(1) = 年、group(2) = 月、group(3) = 日
            return m.group(1) + "年" + m.group(2) + "月" + m.group(3) + "日";
        }
        return null;
    }

    // テキスト内のすべての日付を抽出
    public static List<String> extractAllDates(String text) {
        List<String> results = new ArrayList<>();
        if (text == null) {
            return results;
        }
        Matcher m = DATE_PATTERN.matcher(text);
        while (m.find()) {
            results.add(m.group(1) + "/" + m.group(2) + "/" + m.group(3));
        }
        return results;
    }

    // 全角カタカナのみかどうかチェック
    public static boolean isZenkakuKana(String str) {
        if (str == null || str.isEmpty()) {
            return false;
        }
        return ZENKAKU_KANA_PATTERN.matcher(str).matches();
    }

    public static void main(String[] args) {
        // メールアドレス検証
        System.out.println("--- メールアドレス ---");
        System.out.println(isValidEmail("user@example.com"));    // true
        System.out.println(isValidEmail("user.name+tag@sub.example.co.jp")); // true
        System.out.println(isValidEmail("invalid@"));            // false
        System.out.println(isValidEmail("no-at-sign"));          // false

        // 電話番号検証
        System.out.println("\n--- 電話番号 ---");
        System.out.println(isValidPhone("03-1234-5678"));        // true
        System.out.println(isValidPhone("090-1234-5678"));       // true
        System.out.println(isValidPhone("0120-123-456"));        // true
        System.out.println(isValidPhone("03-12345-6789"));       // false（桁数超過）

        // 郵便番号検証
        System.out.println("\n--- 郵便番号 ---");
        System.out.println(isValidZip("123-4567"));              // true
        System.out.println(isValidZip("1234567"));               // false（ハイフンなし）

        // find() vs matches()
        System.out.println("\n--- 日付抽出 ---");
        String text = "納期は2024/04/01から2024/06/30までです。";
        System.out.println(containsDate(text));                  // true
        System.out.println(extractFirstDate(text));              // 2024年04月月01日
        System.out.println(extractAllDates(text));               // [2024/04/01, 2024/06/30]

        // matches() は文字列全体がパターンに一致する必要がある
        System.out.println("\n--- find vs matches ---");
        String dateOnly = "2024/04/01";
        Pattern p = Pattern.compile("\\d{4}/\\d{2}/\\d{2}");
        System.out.println(p.matcher(dateOnly).matches()); // true（全体一致）
        System.out.println(p.matcher(text).matches());     // false（前後に文字あり）
        System.out.println(p.matcher(text).find());        // true（部分一致）

        // 全角カタカナ
        System.out.println("\n--- 全角カタカナ ---");
        System.out.println(isZenkakuKana("ヤマダタロウ")); // true
        System.out.println(isZenkakuKana("山田太郎"));    // false
        System.out.println(isZenkakuKana("ﾔﾏﾀﾞ"));      // false（半角カナ）
    }
}
