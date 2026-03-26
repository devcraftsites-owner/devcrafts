import java.util.*;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.regex.*;

public class ValidationSample {

    // バリデーションルールを表す sealed interface（Java 17+）
    // 各 record がルールの種類を表す
    sealed interface ValidationRule {
        record Required(String fieldName) implements ValidationRule {}
        record MaxLength(String fieldName, int max) implements ValidationRule {}
        record Regex(String fieldName, Pattern pattern, String errorMessage) implements ValidationRule {}
        record Range(String fieldName, int min, int max) implements ValidationRule {}
    }

    // バリデーション結果を保持する record
    record ValidationResult(boolean valid, List<String> errors) {
        static ValidationResult of(List<String> errors) {
            return new ValidationResult(errors.isEmpty(), List.copyOf(errors));
        }
    }

    // 1つのルールに対してバリデーションを実行し、エラーメッセージを返す（Java 21 パターンマッチング switch）
    public static Optional<String> validate(String value, ValidationRule rule) {
        return switch (rule) {
            case ValidationRule.Required r -> {
                // null または空白のみなら必須エラー
                if (value == null || value.isBlank()) {
                    yield Optional.of(r.fieldName() + "は必須です");
                }
                yield Optional.empty();
            }
            case ValidationRule.MaxLength m -> {
                // 文字数が最大を超えたらエラー
                if (value != null && value.length() > m.max()) {
                    yield Optional.of(m.fieldName() + "は" + m.max() + "文字以内で入力してください");
                }
                yield Optional.empty();
            }
            case ValidationRule.Regex rx -> {
                // 値がある場合だけ正規表現チェック
                if (value != null && !value.isBlank() && !rx.pattern().matcher(value).matches()) {
                    yield Optional.of(rx.errorMessage());
                }
                yield Optional.empty();
            }
            case ValidationRule.Range rng -> {
                // 数値に変換して範囲チェック
                if (value == null || value.isBlank()) {
                    yield Optional.empty(); // Required ルールで別途チェック
                }
                try {
                    int num = Integer.parseInt(value);
                    if (num < rng.min() || num > rng.max()) {
                        yield Optional.of(rng.fieldName() + "は" + rng.min() + "〜" + rng.max() + "の範囲で入力してください");
                    }
                } catch (NumberFormatException e) {
                    yield Optional.of(rng.fieldName() + "は数値で入力してください");
                }
                yield Optional.empty();
            }
        };
    }

    // ルールリストを適用して全エラーを集約する
    public static ValidationResult applyRules(String value, List<ValidationRule> rules) {
        var errors = new ArrayList<String>();
        for (var rule : rules) {
            validate(value, rule).ifPresent(errors::add);
        }
        return ValidationResult.of(errors);
    }

    // メールアドレス用パターン
    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$");

    // 日付バリデーション: ISO形式（yyyy-MM-dd）
    public static boolean isValidDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return false;
        }
        try {
            LocalDate.parse(dateStr);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    // 複数フィールドをまとめてバリデーション
    public static ValidationResult validateUserInput(String name, String email, String ageStr, String birthDate) {
        var errors = new ArrayList<String>();

        // 名前のルールをリストで定義して適用
        var nameRules = List.of(
            new ValidationRule.Required("名前"),
            new ValidationRule.MaxLength("名前", 50)
        );
        for (var rule : nameRules) {
            validate(name, rule).ifPresent(errors::add);
        }

        // メールのルール
        var emailRules = List.of(
            new ValidationRule.Required("メールアドレス"),
            new ValidationRule.Regex("メールアドレス", EMAIL_PATTERN, "メールアドレスの形式が正しくありません")
        );
        for (var rule : emailRules) {
            validate(email, rule).ifPresent(errors::add);
        }

        // 年齢のルール
        var ageRules = List.of(
            new ValidationRule.Required("年齢"),
            new ValidationRule.Range("年齢", 0, 150)
        );
        for (var rule : ageRules) {
            validate(ageStr, rule).ifPresent(errors::add);
        }

        // 生年月日チェック
        if (!isValidDate(birthDate)) {
            errors.add("生年月日は yyyy-MM-dd 形式で入力してください（例: 1990-01-15）");
        }

        return ValidationResult.of(errors);
    }

    public static void main(String[] args) {
        System.out.println("=== ValidationRule による単体チェック ===");

        // 必須チェック
        var requiredRule = new ValidationRule.Required("名前");
        System.out.println(validate("", requiredRule));      // Optional[名前は必須です]
        System.out.println(validate("山田", requiredRule));   // Optional.empty

        // 最大文字数チェック
        var maxLenRule = new ValidationRule.MaxLength("名前", 5);
        System.out.println(validate("山田太郎テスト一二三", maxLenRule)); // エラー

        // 範囲チェック
        var rangeRule = new ValidationRule.Range("年齢", 0, 150);
        System.out.println(validate("200", rangeRule)); // Optional[年齢は0〜150の範囲...]
        System.out.println(validate("30", rangeRule));  // Optional.empty

        System.out.println("\n=== 複合バリデーション ===");
        var result = validateUserInput("", "invalid-email", "abc", "2024-13-01");
        if (result.valid()) {
            System.out.println("バリデーション OK");
        } else {
            System.out.println("エラー " + result.errors().size() + " 件:");
            for (var error : result.errors()) {
                System.out.println("  - " + error);
            }
        }

        System.out.println("\n=== 正常系 ===");
        var ok = validateUserInput("山田太郎", "yamada@example.com", "30", "1994-05-20");
        System.out.println("valid: " + ok.valid()); // true
    }
}
