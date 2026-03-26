import java.util.*;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.regex.*;

public class ValidationSample {

    // 数値バリデーション: 文字列が整数かチェック
    public static boolean isInteger(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        try {
            Integer.parseInt(value);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    // 数値バリデーション: 範囲チェック付き
    public static List<String> validateAge(String value) {
        List<String> errors = new ArrayList<>();
        if (value == null || value.isEmpty()) {
            errors.add("年齢は必須です");
            return errors;
        }
        try {
            int age = Integer.parseInt(value);
            if (age < 0) {
                errors.add("年齢は0以上を入力してください");
            }
            if (age > 150) {
                errors.add("年齢は150以下を入力してください");
            }
        } catch (NumberFormatException e) {
            errors.add("年齢は数値で入力してください");
        }
        return errors;
    }

    // 文字列バリデーション: メールアドレス形式チェック
    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$");

    public static boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    // 文字列バリデーション: 電話番号（日本）
    private static final Pattern PHONE_PATTERN =
        Pattern.compile("^(0[0-9]{1,4}-[0-9]{1,4}-[0-9]{4}|0[0-9]{9,10})$");

    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }

    // 日付バリデーション: ISO形式（yyyy-MM-dd）
    public static boolean isValidDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return false;
        }
        try {
            LocalDate.parse(dateStr); // DateTimeParseException が発生しなければ有効
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    // 複数バリデーションをまとめて実行してエラーを集約する
    public static List<String> validateUserInput(String name, String email, String ageStr, String birthDate) {
        List<String> errors = new ArrayList<>();

        // 名前チェック
        if (name == null || name.trim().isEmpty()) {
            errors.add("名前は必須です");
        } else if (name.length() > 50) {
            errors.add("名前は50文字以内で入力してください");
        }

        // メールチェック
        if (!isValidEmail(email)) {
            errors.add("メールアドレスの形式が正しくありません");
        }

        // 年齢チェック（複数エラーを集約）
        errors.addAll(validateAge(ageStr));

        // 生年月日チェック
        if (!isValidDate(birthDate)) {
            errors.add("生年月日は yyyy-MM-dd 形式で入力してください（例: 1990-01-15）");
        }

        return errors;
    }

    public static void main(String[] args) {
        System.out.println("=== 数値バリデーション ===");
        System.out.println(isInteger("123"));    // true
        System.out.println(isInteger("12.3"));   // false（小数は false）
        System.out.println(isInteger("abc"));    // false
        System.out.println(isInteger(""));       // false

        System.out.println("\n=== メールバリデーション ===");
        System.out.println(isValidEmail("user@example.com")); // true
        System.out.println(isValidEmail("user@example"));     // false
        System.out.println(isValidEmail("invalid"));          // false

        System.out.println("\n=== 日付バリデーション ===");
        System.out.println(isValidDate("2024-03-15")); // true
        System.out.println(isValidDate("2024-13-01")); // false (13月)
        System.out.println(isValidDate("2024/03/15")); // false (形式違い)

        System.out.println("\n=== 複合バリデーション ===");
        List<String> errors = validateUserInput("", "invalid-email", "abc", "2024-13-01");
        if (errors.isEmpty()) {
            System.out.println("バリデーション OK");
        } else {
            System.out.println("エラー " + errors.size() + " 件:");
            for (String error : errors) {
                System.out.println("  - " + error);
            }
        }
    }
}
