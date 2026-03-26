import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexSample {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$");

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^0\\d{1,4}-\\d{1,4}-\\d{4}$");

    private static final Pattern ZIP_PATTERN =
            Pattern.compile("^\\d{3}-\\d{4}$");

    // 名前付きキャプチャグループ（Java 7+）
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

    public static String extractFirstDate(String text) {
        if (text == null) {
            return null;
        }
        var m = DATE_NAMED_PATTERN.matcher(text);
        if (m.find()) {
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

    public static List<String> filterValidEmails(List<String> emails) {
        var predicate = EMAIL_PATTERN.asMatchPredicate();
        return emails.stream()
                .filter(predicate)
                .toList();
    }

    // Java 21: パターンマッチング switch でバリデーション結果を分類
    sealed interface ValidationResult permits ValidationResult.Valid, ValidationResult.Invalid {
        record Valid(String value) implements ValidationResult {}
        record Invalid(String value, String reason) implements ValidationResult {}
    }

    public static ValidationResult validateEmail(String email) {
        if (email == null || email.isBlank()) {
            return new ValidationResult.Invalid(email, "null または空文字です");
        }
        if (EMAIL_PATTERN.matcher(email).matches()) {
            return new ValidationResult.Valid(email);
        }
        return new ValidationResult.Invalid(email, "メールアドレスの形式が正しくありません");
    }

    public static void main(String[] args) {
        System.out.println("--- バリデーション ---");
        System.out.println(isValidEmail("user@example.com"));    // true
        System.out.println(isValidPhone("090-1234-5678"));       // true
        System.out.println(isValidZip("123-4567"));              // true

        System.out.println("\n--- 名前付きキャプチャグループ ---");
        var text = "納期は2024/04/01から2024/06/30までです。";
        System.out.println(extractFirstDate(text));              // 2024年04月01日
        System.out.println(extractAllDates(text));               // [2024/04/01, 2024/06/30]

        System.out.println("\n--- sealed + pattern matching switch ---");
        var emails = List.of("a@b.com", "invalid", null);
        for (var email : emails) {
            var result = validateEmail(email);
            switch (result) {
                case ValidationResult.Valid v ->
                        System.out.println("OK: " + v.value());
                case ValidationResult.Invalid i ->
                        System.out.println("NG: " + i.value() + " - " + i.reason());
            }
        }
    }
}
