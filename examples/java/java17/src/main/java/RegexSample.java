import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexSample {

    // ① static final で Pattern を使い回す（Java 17: var は使えないため省略なし）
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$");

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^0\\d{1,4}-\\d{1,4}-\\d{4}$");

    private static final Pattern ZIP_PATTERN =
            Pattern.compile("^\\d{3}-\\d{4}$");

    // ② 名前付きキャプチャグループ（Java 7+）: (?<グループ名>パターン)
    //    Java 17 から多用するパターン：group("year") のように名前で取得できるため可読性が上がる
    private static final Pattern DATE_NAMED_PATTERN =
            Pattern.compile("(?<year>\\d{4})/(?<month>\\d{2})/(?<day>\\d{2})");

    private static final Pattern ZENKAKU_KANA_PATTERN =
            Pattern.compile("[\\u30A1-\\u30F6]+");

    public static boolean isValidEmail(String email) {
        if (email == null) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidPhone(String phone) {
        if (phone == null) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }

    public static boolean isValidZip(String zip) {
        if (zip == null) {
            return false;
        }
        return ZIP_PATTERN.matcher(zip).matches();
    }

    // ③ 名前付きキャプチャグループで日付を抽出（Java 17: var を活用）
    public static String extractFirstDate(String text) {
        if (text == null) {
            return null;
        }
        var m = DATE_NAMED_PATTERN.matcher(text);
        if (m.find()) {
            // 名前付きグループで取得：可読性が番号指定より高い
            return m.group("year") + "年" + m.group("month") + "月" + m.group("day") + "日";
        }
        return null;
    }

    public static List<String> extractAllDates(String text) {
        var results = new ArrayList<String>();
        if (text == null) {
            return results;
        }
        var m = DATE_NAMED_PATTERN.matcher(text);
        while (m.find()) {
            results.add(m.group("year") + "/" + m.group("month") + "/" + m.group("day"));
        }
        return results;
    }

    public static boolean isZenkakuKana(String str) {
        if (str == null || str.isEmpty()) {
            return false;
        }
        return ZENKAKU_KANA_PATTERN.matcher(str).matches();
    }

    // ④ Java 11+: String.matches() の代替として Pattern.asMatchPredicate() も使える
    //    Stream API と組み合わせるときに便利
    public static List<String> filterValidEmails(List<String> emails) {
        var predicate = EMAIL_PATTERN.asMatchPredicate();
        return emails.stream()
                .filter(predicate)
                .toList(); // Java 16+
    }

    public static void main(String[] args) {
        System.out.println("--- メールアドレス ---");
        System.out.println(isValidEmail("user@example.com"));    // true
        System.out.println(isValidEmail("invalid@"));            // false

        System.out.println("\n--- 電話番号 ---");
        System.out.println(isValidPhone("03-1234-5678"));        // true
        System.out.println(isValidPhone("0120-123-456"));        // true

        System.out.println("\n--- 名前付きキャプチャグループ ---");
        var text = "納期は2024/04/01から2024/06/30までです。";
        System.out.println(extractFirstDate(text));              // 2024年04月01日
        System.out.println(extractAllDates(text));               // [2024/04/01, 2024/06/30]

        System.out.println("\n--- asMatchPredicate（Stream 連携） ---");
        var emails = List.of("a@b.com", "invalid", "c@d.org", "bad@");
        System.out.println(filterValidEmails(emails));           // [a@b.com, c@d.org]
    }
}
