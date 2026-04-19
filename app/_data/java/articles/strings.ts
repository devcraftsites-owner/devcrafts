import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "null-safe-string",
    title: "Java 文字列の null 安全な扱い方と実装パターンまとめ",
    categorySlug: "strings",
    summary: "null チェック、空白判定、Optional 連携で NullPointerException を防ぐ実装例。",
    version: "Java 17",
    tags: ["null安全", "NullPointerException", "Optional", "isBlank"],
    apiNames: ["Objects.toString", "String.isBlank", "String.isEmpty", "Optional.ofNullable"],
    description: "Java で文字列の null・空文字・空白を安全に扱うための実装パターンを外部ライブラリ不要の Pure Java で Java 8/17/21 対応で整理する。",
    lead: "Java の文字列処理で最も頻繁に遭遇するトラブルが NullPointerException です。データベースから取得した値、外部 API のレスポンス、画面入力のパラメータなど、null が紛れ込む経路は多岐にわたります。加えて、空文字 \"\" とスペースだけの文字列 \"   \" を区別すべき場面も少なくありません。Objects.toString によるデフォルト値の設定、定数を左辺に置く equals の書き方、Java 11 以降の isBlank と isEmpty の使い分け、Optional を活用したチェーン処理といった実装パターンを整理した。Java 8 から Java 21 の switch 式でのヌルハンドリングまで、バージョンごとの書き方の違いも押さえている。",
    useCases: [
      "CSV 取込時に空欄・空白のみのセルを一律 null として正規化し、後続の業務ロジックで NullPointerException を防ぐ",
      "画面入力のフォームで氏名・住所などの必須項目に対し、null・空文字・全角スペースのみを同一視してバリデーションする",
      "外部 API のレスポンス JSON で、欠落フィールドや空文字を Optional でラップし、デフォルト値付きで後続処理へ渡す",
    ],
    cautions: [
      "isEmpty() は null に対して呼ぶと NullPointerException になる。null チェックを先に行うか、Objects.toString で変換してから呼ぶこと",
      "isBlank() は Java 11 以降でしか使えない。Java 8 環境では trim().isEmpty() で代用するが、全角スペースは除去されない点に注意",
      "Optional.ofNullable(str).orElse(\"default\") は str が空文字 \"\" のときに \"default\" を返さない。空文字も除外したい場合は filter を挟む必要がある",
      "\"target\".equals(variable) のように定数を左辺に置く書き方は null 安全だが、可読性とのトレードオフがある。チーム内で方針を揃えておくこと",
      "実務では trim() と isBlank() を混用して「スペースのみの入力」を見逃すケースがある。画面からの入力値はまず trim() してから isEmpty() で空判定する流れをチーム内で統一しておくと安全。",
    ],
    relatedArticleSlugs: ["padding-trim", "regex-basics"],
    versionCoverage: {
      java8: "isBlank() が使えないため、null チェック後に trim().isEmpty() で空白判定する。Optional は使えるが filter 内で isBlank を呼べない。",
      java17: "isBlank() / isEmpty() の使い分けが可能。Optional.filter(s -> !s.isBlank()) で null と空白を一括排除でき、コードが簡潔になる。",
      java21: "switch 式で case null を明示でき、null・空白・通常文字列の分岐を1つの switch で完結させられる。",
      java8Code: `// Java 8: trim().isEmpty() で空白判定
if (str == null || str.trim().isEmpty()) {
    return "デフォルト値";
}
// Optional での変換（isBlank が使えない）
String result = Optional.ofNullable(str)
        .filter(s -> !s.trim().isEmpty())
        .map(String::toUpperCase)
        .orElse("空でした");`,
      java17Code: `// Java 17: isBlank() で全角スペースも検出
if (str == null || str.isBlank()) {
    return "デフォルト値";
}
// Optional + isBlank で簡潔に
String result = Optional.ofNullable(str)
        .filter(s -> !s.isBlank())
        .map(String::toUpperCase)
        .orElse("空でした");`,
      java21Code: `// Java 21: switch 式で null を直接ハンドリング
String result = switch (str) {
    case null -> "null でした";
    case String s when s.isBlank() -> "空白でした";
    default -> str.toUpperCase();
};`,
    },
    libraryComparison: [
      { name: "標準 API（Objects / Optional）", whenToUse: "null チェックと空白判定だけで済む一般的な業務コード。依存を増やさずに対応したいとき。", tradeoff: "isBlank の Java 8 非対応や、Optional のネストが深くなる場合はコードが冗長になりやすい。" },
      { name: "Apache Commons Lang（StringUtils）", whenToUse: "isBlank / defaultString / trimToNull など、null 安全なユーティリティを大量に使う場面。", tradeoff: "commons-lang3 への依存が加わる。標準 API で書ける範囲であれば、あえて追加する必要はない。" },
      { name: "Guava（Strings）", whenToUse: "nullToEmpty / emptyToNull / isNullOrEmpty など、Google Guava を既にプロジェクトで使っている場合。", tradeoff: "Guava は JAR サイズが大きく、文字列ユーティリティだけのために導入するのは過剰。" },
    ],
    faq: [
      { question: "isEmpty() と isBlank() はどう使い分けますか。", answer: "isEmpty() は長さ 0 の文字列だけを検出します。isBlank() はスペースやタブ、全角スペースのみの文字列も true を返します。フォーム入力のバリデーションでは isBlank() が適切です。" },
      { question: "null チェックに Objects.requireNonNull を使うべきですか。", answer: "引数が null であってはならないメソッドの先頭で使うと、早期に NullPointerException を発生させられます。ただし戻り値の null 安全には Optional が向いています。" },
      { question: "Optional.of と Optional.ofNullable の違いは何ですか。", answer: "Optional.of は null を渡すと即座に NullPointerException になります。null の可能性がある値には必ず ofNullable を使います。of は null でないことが保証されている場合にのみ使います。" },
    ],
    codeTitle: "NullSafeStringHandler.java",
    codeSample: `import java.util.Objects;
import java.util.Optional;

public class NullSafeStringHandler {

    /** null・空文字・空白のいずれかならデフォルト値を返す */
    public static String blankToDefault(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return value;
    }

    /** null 安全な equals（定数を左辺に置く） */
    public static boolean safeEquals(String target, String value) {
        return target.equals(value);
    }

    /** Objects.toString でデフォルト値付きの変換 */
    public static String toStringOrDefault(Object obj, String defaultValue) {
        return Objects.toString(obj, defaultValue);
    }

    /** Optional で null と空白を排除し、変換を適用する */
    public static String transformOrDefault(String input, String defaultValue) {
        return Optional.ofNullable(input)
                .filter(s -> !s.isBlank())
                .map(String::trim)
                .orElse(defaultValue);
    }

    public static void main(String[] args) {
        // null / 空文字 / 空白のデフォルト値変換
        System.out.println(blankToDefault(null, "未入力"));     // 未入力
        System.out.println(blankToDefault("", "未入力"));       // 未入力
        System.out.println(blankToDefault("  ", "未入力"));     // 未入力
        System.out.println(blankToDefault("山田", "未入力"));   // 山田

        // null 安全な比較
        System.out.println(safeEquals("admin", null));          // false
        System.out.println(safeEquals("admin", "admin"));       // true

        // Objects.toString
        System.out.println(toStringOrDefault(null, "N/A"));     // N/A
        System.out.println(toStringOrDefault(42, "N/A"));       // 42

        // Optional を使った変換
        System.out.println(transformOrDefault("  hello  ", "空")); // hello
        System.out.println(transformOrDefault(null, "空"));        // 空
        System.out.println(transformOrDefault("   ", "空"));       // 空
    }
}`,
  },
{
    slug: "padding-trim",
    title: "Java 文字列のパディングとトリム処理の実装方法を実例で解説",
    categorySlug: "strings",
    summary: "ゼロ埋め、固定長出力、trim/strip の違いを業務コードの視点で整理する。",
    version: "Java 17",
    tags: ["パディング", "トリム", "ゼロ埋め", "固定長", "String.format"],
    apiNames: ["String.format", "String.trim", "String.strip", "String.stripLeading", "String.stripTrailing", "String.repeat"],
    description: "Java で文字列のゼロ埋め・固定長整形・前後空白除去を行う方法を外部ライブラリ不要の Pure Java で Java 8/17/21 対応で帳票出力の実例付きで解説する。",
    lead: "帳票出力や固定長ファイル連携では、数値のゼロ埋めや文字列の右揃え・左揃えが頻繁に必要になります。また、フォーム入力や CSV 取込では前後の空白を除去するトリム処理が欠かせません。Java には String.format によるパディングと trim / strip によるトリムが用意されていますが、trim が全角スペースを除去しないことを知らないまま本番障害に至るケースは珍しくありません。この記事では、業務でよく使うパディングパターン（ゼロ埋め、右揃え、固定長レコード）とトリム処理（trim / strip / stripLeading / stripTrailing）を整理し、Java 8 と Java 11 以降の動作の違い、全角スペースへの対処法も含めて解説します。",
    useCases: [
      "請求書番号を8桁ゼロ埋め（例: 42 → 00000042）して採番テーブルや帳票に出力する",
      "銀行の全銀フォーマットや固定長ファイルで、氏名を全角20文字の左揃え・金額を右揃えで出力する",
      "CSV 取込時にセルの前後に混入した半角・全角スペースを strip で除去し、DB 格納前にデータを正規化する",
    ],
    cautions: [
      "trim() は ASCII 制御文字（コード 0x20 以下）しか除去しない。全角スペース（U+3000）を含む Unicode 空白は strip()（Java 11+）を使う",
      "String.format(\"%05d\", num) は int / long にしか使えない。文字列のゼロ埋めには String.format と組み合わせるか、repeat() で自前パディングする",
      "日本語文字列を String.format(\"%10s\") でパディングすると、全角1文字が幅1としてカウントされるため、固定長ファイルのバイト数と合わなくなる",
      "stripLeading() / stripTrailing() は Java 11 以降でのみ使える。Java 8 環境では正規表現で代用する必要がある",
    ],
    relatedArticleSlugs: ["null-safe-string", "number-format"],
    versionCoverage: {
      java8: "trim() のみ使用可能で、全角スペースは replace(\"\\u3000\", \"\") で個別除去する。repeat が使えないため、ゼロ埋めは String.format か StringBuilder で行う。",
      java17: "strip() / stripLeading() / stripTrailing() で Unicode 空白を一括除去できる。repeat() で任意文字のパディングも簡潔に書ける。",
      java21: "基本的な機能は Java 17 と同じ。formatted() メソッドで String.format を置き換えられ、テキストブロックとの組み合わせも自然に書ける。",
      java8Code: `// Java 8: 全角スペース除去は replace + trim
String input = "\\u3000Java\\u3000";
String trimmed = input.replace("\\u3000", "").trim();
// ゼロ埋め: String.format
String padded = String.format("%05d", 42); // 00042
// 手動パディング: StringBuilder
StringBuilder sb = new StringBuilder("42");
while (sb.length() < 5) { sb.insert(0, '0'); }`,
      java17Code: `// Java 17: strip() で全角スペースも除去
String input = "\\u3000Java\\u3000";
String trimmed = input.strip(); // "Java"
// repeat() でゼロ埋め
String num = "42";
String padded = "0".repeat(5 - num.length()) + num; // 00042`,
      java21Code: `// Java 21: formatted() で String.format を置き換え
String record = "%-10s%10d円".formatted("りんご", 1500);
// repeat + strip の組み合わせも同様に利用可能
String padded = "0".repeat(Math.max(0, 5 - "42".length())) + "42";`,
    },
    libraryComparison: [
      { name: "標準 API（String.format / strip）", whenToUse: "ゼロ埋め・固定長パディング・空白除去の基本的な用途。外部依存なしで対応したいとき。", tradeoff: "全角文字幅の計算は自前で行う必要がある。固定長ファイルのバイト数制御には追加の実装が必要。" },
      { name: "Apache Commons Lang（StringUtils）", whenToUse: "leftPad / rightPad / center など、多様なパディングを頻繁に使う場面。", tradeoff: "依存追加のコストに見合うかは使用頻度による。String.format で事足りるなら不要。" },
    ],
    faq: [
      { question: "trim() と strip() はどちらを使うべきですか。", answer: "Java 11 以降であれば strip() を推奨します。trim() は全角スペースを除去できませんが、strip() は Unicode 基準で空白文字を判定するため、日本語データの処理で安全です。" },
      { question: "固定長ファイルで全角文字の幅をどう扱いますか。", answer: "String.format のパディングは文字数ベースのため、バイト数で揃える場合は getBytes(charset).length でバイト数を計算し、不足分をスペースで埋める自前処理が必要です。" },
      { question: "repeat() が使えない Java 8 でのパディング方法は。", answer: "String.format(\"%05d\", num) でゼロ埋めできます。文字列のパディングは StringBuilder に insert(0, '0') を繰り返すか、char[] を Arrays.fill で初期化する方法があります。" },
    ],
    codeTitle: "PaddingTrimUtil.java",
    codeSample: `public class PaddingTrimUtil {

    /** 数値を指定桁数でゼロ埋め */
    public static String zeroPad(int number, int width) {
        return String.format("%0" + width + "d", number);
    }

    /** 文字列を指定幅で右揃え（左スペース埋め） */
    public static String rightAlign(String text, int width) {
        return String.format("%" + width + "s", text);
    }

    /** 文字列を指定幅で左揃え（右スペース埋め） */
    public static String leftAlign(String text, int width) {
        return String.format("%-" + width + "s", text);
    }

    /** 固定長レコードの組み立て（帳票・バッチ向け） */
    public static String buildFixedRecord(String name, int price) {
        return String.format("%-10s%10d円", name, price);
    }

    /** Unicode 対応トリム（全角スペースも除去） */
    public static String safeTrim(String input) {
        if (input == null) {
            return null;
        }
        return input.strip(); // Java 11+
    }

    /** 先頭のみトリム */
    public static String trimLeading(String input) {
        if (input == null) {
            return null;
        }
        return input.stripLeading(); // Java 11+
    }

    public static void main(String[] args) {
        // ゼロ埋め
        System.out.println(zeroPad(42, 5));        // 00042
        System.out.println(zeroPad(42, 8));        // 00000042

        // 揃え
        System.out.println("[" + rightAlign("Java", 10) + "]");  // [      Java]
        System.out.println("[" + leftAlign("Java", 10) + "]");   // [Java      ]

        // 固定長レコード
        System.out.println("[" + buildFixedRecord("りんご", 1500) + "]");

        // トリム
        System.out.println("[" + safeTrim("\\u3000Java\\u3000") + "]"); // [Java]
        System.out.println("[" + safeTrim("  Hello  ") + "]");          // [Hello]

        // strip vs trim
        String fullWidthSpace = "\\u3000データ\\u3000";
        System.out.println("trim:  [" + fullWidthSpace.trim() + "]");   // 全角残る
        System.out.println("strip: [" + fullWidthSpace.strip() + "]");  // 全角も除去
    }
}`,
  },
{
    slug: "regex-basics",
    title: "Java 正規表現の基本と業務バリデーション実装パターン解説",
    categorySlug: "strings",
    summary: "Pattern / Matcher の使い方、メール・電話番号・郵便番号の検証パターンを整理する。",
    version: "Java 17",
    tags: ["正規表現", "Pattern", "Matcher", "バリデーション", "キャプチャグループ"],
    apiNames: ["Pattern.compile", "Matcher.matches", "Matcher.find", "Matcher.group", "Pattern.asMatchPredicate"],
    description: "Java の正規表現（Pattern / Matcher）を使った業務バリデーションと文字列抽出を外部ライブラリ不要の Pure Java で Java 8/17/21 対応で解説する。",
    lead: "メールアドレス、電話番号、郵便番号など、業務システムではフォーマットの検証が日常的に発生します。Java の正規表現は Pattern と Matcher のペアで扱いますが、Pattern.compile のコストを意識せずにメソッド内で毎回コンパイルしているコードや、matches と find の違いを把握しないまま意図しない判定をしているコードは実務でもよく見かけます。Pattern を static final で保持する基本設計から、名前付きキャプチャグループによる可読性向上、asMatchPredicate を使った Stream 連携まで、業務で即使える正規表現パターンを整理した。Java 8 の書き方から Java 21 の switch 式を活用した分岐まで、バージョンごとの書き方も示す。",
    useCases: [
      "会員登録フォームでメールアドレス・電話番号・郵便番号の形式を正規表現で即時バリデーションする",
      "帳票データや自由入力テキストから日付文字列（yyyy/mm/dd）を抽出し、名前付きキャプチャグループで年月日に分解する",
      "CSV 一括取込時に不正な形式のメールアドレスを Stream + asMatchPredicate でフィルタリングし、エラー行を特定する",
    ],
    cautions: [
      "Pattern.compile はスレッドセーフだが、Matcher はスレッドセーフではない。Pattern は static final で共有し、Matcher はメソッド内で毎回生成すること",
      "matches() は文字列全体がパターンに一致するかを判定する。部分一致を調べたい場合は find() を使う。この違いを間違えると、検証が意図通りに動かない",
      "メールアドレスの正規表現は完全な RFC 準拠にすると非常に複雑になる。業務用途では実用的な範囲に絞り、厳密な検証はサーバー側やメール送信での到達確認に委ねる",
      "日本語の電話番号パターンは市外局番の桁数が地域によって異なる（03- は2桁、045- は3桁など）。単一の正規表現で全パターンをカバーしようとすると保守が難しくなる",
      "実務では電話番号や郵便番号の仕様が変わっていてパターンが古くなっていたケースに遭遇することがある。正規表現にはコメントで意図を明記し、テストデータに桁数の境界値やハイフンあり・なしを含めておくこと。",
    ],
    relatedArticleSlugs: ["null-safe-string", "half-width-kana"],
    versionCoverage: {
      java8: "Pattern / Matcher の基本機能は使えるが、名前付きキャプチャグループは group(\"name\") で取得可能（Java 7+）。asMatchPredicate は使えない。",
      java17: "Pattern.asMatchPredicate() で Stream との連携が簡潔になる。var による型推論で Matcher の宣言も短くなる。",
      java21: "sealed interface とパターンマッチング switch を組み合わせることで、バリデーション結果を型安全に分岐できる。",
      java8Code: `// Java 8: Matcher を使った日付抽出
Pattern p = Pattern.compile("(\\\\d{4})/(\\\\d{2})/(\\\\d{2})");
Matcher m = p.matcher(text);
if (m.find()) {
    String year = m.group(1);  // 番号でアクセス
    String month = m.group(2);
}
// リストのフィルタは filter + matches
List<String> valid = emails.stream()
        .filter(e -> EMAIL_PATTERN.matcher(e).matches())
        .collect(Collectors.toList());`,
      java17Code: `// Java 17: 名前付きグループ + asMatchPredicate
Pattern p = Pattern.compile(
    "(?<year>\\\\d{4})/(?<month>\\\\d{2})/(?<day>\\\\d{2})");
var m = p.matcher(text);
if (m.find()) {
    String year = m.group("year");  // 名前でアクセス
}
// asMatchPredicate で Stream 連携
List<String> valid = emails.stream()
        .filter(EMAIL_PATTERN.asMatchPredicate())
        .toList();`,
      java21Code: `// Java 21: sealed + switch でバリデーション結果を型安全に分岐
sealed interface Result permits Result.Valid, Result.Invalid {
    record Valid(String v) implements Result {}
    record Invalid(String v, String reason) implements Result {}
}
switch (validateEmail(input)) {
    case Result.Valid v   -> process(v.v());
    case Result.Invalid i -> log(i.reason());
}`,
    },
    libraryComparison: [
      { name: "標準 API（Pattern / Matcher）", whenToUse: "基本的なフォーマット検証や文字列抽出。依存なしで対応したいとき。", tradeoff: "複雑なパターンを自前で管理する必要がある。テストケースを十分に書いて正規表現の正しさを担保する。" },
      { name: "Apache Commons Validator", whenToUse: "メールアドレスや URL の検証を既製のバリデータに任せたいとき。", tradeoff: "カスタマイズ性は低い。日本固有のフォーマット（電話番号・郵便番号）は結局自前の正規表現が必要。" },
      { name: "Hibernate Validator（Bean Validation）", whenToUse: "@Email / @Pattern アノテーションで DTO のフィールドに宣言的にバリデーションをかけたいとき。", tradeoff: "フレームワーク依存が前提。単体の文字列検証だけなら導入コストが高い。" },
    ],
    faq: [
      { question: "matches() と find() はどう使い分けますか。", answer: "matches() は文字列全体がパターンに合致するかを調べます。find() は部分一致を探します。入力値の形式チェックには matches()、テキストからの抽出には find() を使います。" },
      { question: "Pattern.compile を毎回呼んでも問題ないですか。", answer: "動作はしますが、compile はコストの高い処理です。同じパターンを繰り返し使うなら static final フィールドに保持するのが定石です。ループ内での compile は避けてください。" },
      { question: "正規表現のエスケープはどう書きますか。", answer: "Java の文字列リテラルでは \\\\ が正規表現の \\\\  に対応します。\\\\d は数字、\\\\. はリテラルのドットです。テキストブロック（Java 15+）を使うとエスケープが若干読みやすくなります。" },
    ],
    codeTitle: "RegexValidator.java",
    codeSample: `import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexValidator {

    // Pattern は static final で保持し、使い回す
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+\\\\-]+@[a-zA-Z0-9.\\\\-]+\\\\.[a-zA-Z]{2,}$");

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^0\\\\d{1,4}-\\\\d{1,4}-\\\\d{4}$");

    private static final Pattern ZIP_PATTERN =
            Pattern.compile("^\\\\d{3}-\\\\d{4}$");

    private static final Pattern DATE_PATTERN =
            Pattern.compile("(?<year>\\\\d{4})/(?<month>\\\\d{2})/(?<day>\\\\d{2})");

    /** メールアドレスの形式チェック */
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    /** 電話番号の形式チェック（ハイフン区切り） */
    public static boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }

    /** 郵便番号の形式チェック */
    public static boolean isValidZip(String zip) {
        return zip != null && ZIP_PATTERN.matcher(zip).matches();
    }

    /** テキストから最初の日付を抽出（名前付きキャプチャグループ） */
    public static String extractFirstDate(String text) {
        if (text == null) return null;
        Matcher m = DATE_PATTERN.matcher(text);
        if (m.find()) {
            return m.group("year") + "年"
                 + m.group("month") + "月"
                 + m.group("day") + "日";
        }
        return null;
    }

    /** テキストからすべての日付を抽出 */
    public static List<String> extractAllDates(String text) {
        List<String> results = new ArrayList<>();
        if (text == null) return results;
        Matcher m = DATE_PATTERN.matcher(text);
        while (m.find()) {
            results.add(m.group("year") + "/"
                      + m.group("month") + "/"
                      + m.group("day"));
        }
        return results;
    }

    /** Stream 連携: 有効なメールアドレスだけを抽出（Java 11+） */
    public static List<String> filterValidEmails(List<String> emails) {
        return emails.stream()
                .filter(EMAIL_PATTERN.asMatchPredicate())
                .toList();
    }

    public static void main(String[] args) {
        System.out.println(isValidEmail("user@example.com"));   // true
        System.out.println(isValidEmail("invalid@"));           // false
        System.out.println(isValidPhone("03-1234-5678"));       // true
        System.out.println(isValidZip("123-4567"));             // true

        String text = "納期は2024/04/01から2024/06/30までです。";
        System.out.println(extractFirstDate(text));             // 2024年04月01日
        System.out.println(extractAllDates(text));              // [2024/04/01, 2024/06/30]

        var emails = List.of("a@b.com", "invalid", "c@d.org");
        System.out.println(filterValidEmails(emails));          // [a@b.com, c@d.org]
    }
}`,
  },
{
    slug: "half-width-kana",
    title: "Java で半角カナと全角カナを相互変換する実装と濁音の処理",
    categorySlug: "strings",
    summary: "濁音・半濁音を含む半角カナと全角カナの変換テーブルと変換ロジックを整理する。",
    version: "Java 17",
    tags: ["半角カナ", "全角カナ", "文字コード", "濁音", "データ正規化"],
    apiNames: ["String.charAt", "StringBuilder", "Map.ofEntries", "Map.entry"],
    description: "Java 標準 API だけで半角カナと全角カナを相互変換する方法を、濁音・半濁音の結合処理を含めて外部ライブラリ不要で Java 8/17/21 対応で解説する。",
    lead: "日本の業務システムでは、半角カナと全角カナの混在が日常的に発生します。銀行の全銀フォーマットは半角カナを要求し、画面入力やデータベースには全角カナが格納されていることが多いため、相互変換の処理は避けて通れません。単純な1文字ずつの置換で済めばよいのですが、半角カナの濁音（ｶﾞ）は基本文字 + 濁点の2文字で表現されるのに対し、全角カナの濁音（ガ）は1文字です。この2文字結合の処理を正しく実装しないと、変換結果がおかしくなります。この記事では、変換テーブルの設計、濁音・半濁音の結合ロジック、往復変換の一致検証まで、Pure Java で完結する実装を示します。",
    useCases: [
      "全銀フォーマットのデータ作成時に、顧客名や口座名義をデータベースの全角カナから半角カナに変換する",
      "OCR で読み取った半角カナ混じりのテキストを全角カナに正規化し、名寄せや検索の精度を上げる",
      "CSV 取込時に全角・半角カナが混在するデータを統一形式に変換し、データベース格納前に正規化する",
    ],
    cautions: [
      "半角カナの濁音は「基本文字 + 濁点（ﾞ）」の2文字で構成される。1文字ずつ変換すると濁音が正しく処理されないため、必ず次の文字を先読みするロジックが必要",
      "半濁音の変換テーブルと濁音の変換テーブルは分離する。ﾊ行は濁音（バ）と半濁音（パ）の両方を持つため、先に半濁点（ﾟ）をチェックしてから濁点（ﾞ）を処理する順序にするとバグを防げる",
      "全角カナから半角カナへの逆変換では、濁音1文字を半角2文字に展開する必要があるため、文字列の長さが変わる点に注意",
      "変換テーブルに「ヴ」（ｳﾞ → ヴ）を含めるかどうかは業務要件による。全銀フォーマットでは「ヴ」は非対応のケースがある",
    ],
    relatedArticleSlugs: ["regex-basics", "padding-trim"],
    versionCoverage: {
      java8: "変換テーブルを HashMap + static 初期化ブロックで定義する。Map.of / Map.ofEntries が使えないため、コードがやや冗長になる。",
      java17: "Map.ofEntries + Map.entry で不変マップを宣言的に初期化できる。var による型推論でループ内の変数宣言も簡潔になる。",
      java21: "sealed interface とパターンマッチング switch で文字種別の分類と変換処理を分離でき、変換ロジックの可読性が向上する。",
      java8Code: `// Java 8: HashMap + static ブロックで変換テーブル初期化
private static final Map<Character, Character> DAKUTEN_MAP
        = new HashMap<>();
static {
    String[] pairs = {"ｶガ", "ｷギ", "ｸグ", "ｹゲ", "ｺゴ"};
    for (String p : pairs) {
        DAKUTEN_MAP.put(p.charAt(0), p.charAt(1));
    }
}`,
      java17Code: `// Java 17: Map.ofEntries で宣言的に初期化
private static final Map<Character, Character> DAKUTEN_MAP =
    Map.ofEntries(
        Map.entry('ｶ', 'ガ'), Map.entry('ｷ', 'ギ'),
        Map.entry('ｸ', 'グ'), Map.entry('ｹ', 'ゲ'),
        Map.entry('ｺ', 'ゴ')
        // ... 以下同様
    );`,
      java21Code: `// Java 21: sealed interface + switch で分類と変換を分離
sealed interface KanaType permits KanaType.Basic,
        KanaType.Dakuten, KanaType.Handakuten, KanaType.Other {
    record Basic(int idx)        implements KanaType {}
    record Dakuten(char voiced)  implements KanaType {}
    record Handakuten(char semi) implements KanaType {}
    record Other(char orig)      implements KanaType {}
}
switch (classify(c, next)) {
    case KanaType.Dakuten t    -> sb.append(t.voiced());
    case KanaType.Handakuten t -> sb.append(t.semi());
    case KanaType.Basic t      -> sb.append(FULL.charAt(t.idx()));
    case KanaType.Other t      -> sb.append(t.orig());
}`,
    },
    libraryComparison: [
      { name: "標準 API（String + Map）", whenToUse: "半角カナ・全角カナの変換だけで済む場合。外部依存なしで変換テーブルを管理したいとき。", tradeoff: "変換テーブルの定義が冗長になる。ただし業務要件に合わせた細かい制御がしやすい。" },
      { name: "ICU4J（Transliterator）", whenToUse: "半角・全角の変換だけでなく、ひらがな・カタカナ変換やローマ字変換も必要な場合。", tradeoff: "JAR サイズが大きく（数十MB）、カナ変換だけのために導入するのは過剰。" },
      { name: "Apache Commons Lang（StringUtils）", whenToUse: "基本的な文字列操作ユーティリティと合わせて使いたい場合。", tradeoff: "半角カナ・全角カナの変換機能は提供されていないため、変換ロジック自体は自前で実装する必要がある。" },
    ],
    faq: [
      { question: "半角カタカナ「ｦ」は全角の「ヲ」に変換すべきですか。", answer: "一般的には「ヲ」に変換します。ただし全銀フォーマットの口座名義で「ｦ」が使われることは稀で、業務要件で除外するケースもあります。" },
      { question: "往復変換（半角→全角→半角）で元に戻りますか。", answer: "変換テーブルが正しく対称に定義されていれば戻ります。テストで往復一致を確認するのが確実です。濁音・半濁音の結合と展開が正しく対応しているかが鍵になります。" },
      { question: "ひらがなからカタカナへの変換も同じ方法でできますか。", answer: "Unicode のコードポイント差分（0x60）を加算することで変換できます。ただし「ゐ」「ゑ」など対応するカタカナがないケースもあるため、業務で使う文字範囲を確認してください。" },
    ],
    codeTitle: "HalfKanaConverter.java",
    codeSample: `import java.util.Map;

public class HalfKanaConverter {

    private static final String HALF_KANA =
        "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
    private static final String FULL_KANA =
        "ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

    private static final Map<Character, Character> DAKUTEN_MAP = Map.ofEntries(
        Map.entry('ｶ', 'ガ'), Map.entry('ｷ', 'ギ'), Map.entry('ｸ', 'グ'),
        Map.entry('ｹ', 'ゲ'), Map.entry('ｺ', 'ゴ'), Map.entry('ｻ', 'ザ'),
        Map.entry('ｼ', 'ジ'), Map.entry('ｽ', 'ズ'), Map.entry('ｾ', 'ゼ'),
        Map.entry('ｿ', 'ゾ'), Map.entry('ﾀ', 'ダ'), Map.entry('ﾁ', 'ヂ'),
        Map.entry('ﾂ', 'ヅ'), Map.entry('ﾃ', 'デ'), Map.entry('ﾄ', 'ド'),
        Map.entry('ﾊ', 'バ'), Map.entry('ﾋ', 'ビ'), Map.entry('ﾌ', 'ブ'),
        Map.entry('ﾍ', 'ベ'), Map.entry('ﾎ', 'ボ'), Map.entry('ｳ', 'ヴ')
    );
    private static final Map<Character, Character> HANDAKUTEN_MAP = Map.of(
        'ﾊ', 'パ', 'ﾋ', 'ピ', 'ﾌ', 'プ', 'ﾍ', 'ペ', 'ﾎ', 'ポ'
    );

    /** 半角カナ → 全角カナ（濁音・半濁音の結合処理付き） */
    public static String toFullWidth(String input) {
        if (input == null) return null;
        var sb = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            char next = (i + 1 < input.length()) ? input.charAt(i + 1) : 0;

            if (next == 'ﾞ' && DAKUTEN_MAP.containsKey(c)) {
                sb.append(DAKUTEN_MAP.get(c));
                i++;
                continue;
            }
            if (next == 'ﾟ' && HANDAKUTEN_MAP.containsKey(c)) {
                sb.append(HANDAKUTEN_MAP.get(c));
                i++;
                continue;
            }
            int idx = HALF_KANA.indexOf(c);
            sb.append(idx >= 0 ? FULL_KANA.charAt(idx) : c);
        }
        return sb.toString();
    }

    /** 全角カナ → 半角カナ（濁音・半濁音は2文字に展開） */
    public static String toHalfWidth(String input) {
        if (input == null) return null;
        var sb = new StringBuilder();
        for (char c : input.toCharArray()) {
            var dakuten = DAKUTEN_MAP.entrySet().stream()
                .filter(e -> e.getValue() == c).findFirst();
            if (dakuten.isPresent()) {
                sb.append(dakuten.get().getKey()).append('ﾞ');
                continue;
            }
            var handakuten = HANDAKUTEN_MAP.entrySet().stream()
                .filter(e -> e.getValue() == c).findFirst();
            if (handakuten.isPresent()) {
                sb.append(handakuten.get().getKey()).append('ﾟ');
                continue;
            }
            int idx = FULL_KANA.indexOf(c);
            sb.append(idx >= 0 ? HALF_KANA.charAt(idx) : c);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(toFullWidth("ｶﾞｷﾞｸﾞｹﾞｺﾞ"));  // ガギグゲゴ
        System.out.println(toFullWidth("ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ"));   // パピプペポ
        System.out.println(toFullWidth("ABC ｱｲｳ 123")); // ABC アイウ 123

        System.out.println(toHalfWidth("ガギグゲゴ"));    // ｶﾞｷﾞｸﾞｹﾞｺﾞ
        System.out.println(toHalfWidth("パピプペポ"));    // ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ

        // 往復変換テスト
        String original = "ｶﾞｷﾞｸﾞｹﾞｺﾞ";
        String full = toFullWidth(original);
        String back = toHalfWidth(full);
        System.out.println("往復一致: " + original.equals(back)); // true
    }
}`,
  },
{
    slug: "number-format",
    title: "Java 数値フォーマットとカンマ区切り・通貨表示の実装方法",
    categorySlug: "strings",
    summary: "NumberFormat / DecimalFormat でカンマ区切り、通貨、小数桁を制御する方法を整理する。",
    version: "Java 17",
    tags: ["NumberFormat", "DecimalFormat", "カンマ区切り", "通貨", "ロケール"],
    apiNames: ["NumberFormat.getNumberInstance", "NumberFormat.getCurrencyInstance", "DecimalFormat", "BigDecimal", "Locale"],
    description: "Java の NumberFormat / DecimalFormat を使ったカンマ区切り・通貨フォーマット・パースを Java 8/17/21 対応で解説する。",
    lead: "業務システムでは、金額をカンマ区切りで表示する、通貨記号を付ける、小数点以下の桁数を揃えるといった数値フォーマットの処理が頻繁に発生します。Java の NumberFormat と DecimalFormat はこうした要件に対応できますが、ロケールによって小数点とカンマの意味が逆転すること、DecimalFormat のパターン文字列の書き方、BigDecimal との組み合わせ方など、実装時に迷うポイントが少なくありません。この記事では、カンマ区切り整数、小数桁指定、通貨フォーマット、カンマ区切り文字列のパースといった実務で必要になる処理を整理し、ロケールの違いが及ぼす影響と、フォーマット結果を逆変換する際の注意点も押さえます。",
    useCases: [
      "請求書や帳票で金額をカンマ区切り（1,234,567円）に整形して出力する",
      "CSV エクスポート時に数値を DecimalFormat のパターン指定で小数2桁に統一し、受領側のインポート仕様に合わせる",
      "画面やファイルから受け取ったカンマ区切り文字列（\"1,234,567\"）を NumberFormat.parse で数値に戻し、計算ロジックに渡す",
    ],
    cautions: [
      "NumberFormat.parse は文字列の先頭から解析し、解析できなくなった位置で止まる。\"1,234abc\" をパースすると 1234 を返してエラーにならないため、入力値の形式チェックは別途行うこと",
      "DecimalFormat のパターン \"#,##0.00\" は小数2桁に四捨五入する。BigDecimal の精度を保ちたい場合は、RoundingMode を明示的に設定するか、BigDecimal.setScale で事前に丸めておく",
      "ロケールによって小数点とカンマの役割が逆になる（ドイツでは 1.234.567,89）。国際化対応が必要な場合は Locale を明示的に指定し、デフォルトロケールに依存しない実装にする",
      "NumberFormat はスレッドセーフではない。マルチスレッド環境で共有する場合は ThreadLocal で保持するか、メソッド内で毎回生成する",
    ],
    relatedArticleSlugs: ["padding-trim", "null-safe-string"],
    versionCoverage: {
      java8: "NumberFormat / DecimalFormat の基本機能は同じだが、型推論（var）が使えないため変数宣言が冗長になる。formatted() メソッドもない。",
      java17: "var による型推論と formatted() メソッド（Java 15+）でコードが簡潔になる。機能面での変更はないが、記述量が減る。",
      java21: "Collectors.teeing を使った合計・平均の同時集計など、Stream API との組み合わせでフォーマット処理を効率化できる。record との相性もよい。",
      java8Code: `// Java 8: 型を明示して NumberFormat を使用
NumberFormat nf = NumberFormat.getNumberInstance(Locale.JAPAN);
String formatted = nf.format(1234567); // 1,234,567
// DecimalFormat も同様
DecimalFormat df = new DecimalFormat("#,##0.00");
String decimal = df.format(new BigDecimal("12345.678"));`,
      java17Code: `// Java 17: var + formatted() で簡潔に
var nf = NumberFormat.getNumberInstance(Locale.JAPAN);
String formatted = nf.format(1234567); // 1,234,567
// formatted() でテンプレート的な書き方
String report = "%s: %s円".formatted(
        "売上合計", nf.format(1234567));`,
      java21Code: `// Java 21: Collectors.teeing で合計と平均を同時集計
record Summary(long total, double average) {}
var summary = amounts.stream().collect(
    Collectors.teeing(
        Collectors.summingLong(Long::longValue),
        Collectors.averagingLong(Long::longValue),
        Summary::new));
System.out.println("合計: " + nf.format(summary.total()));`,
    },
    libraryComparison: [
      { name: "標準 API（NumberFormat / DecimalFormat）", whenToUse: "カンマ区切り、通貨表示、小数桁指定など、基本的な数値フォーマット。外部依存なしで対応したいとき。", tradeoff: "スレッドセーフでない点と、parse の挙動に注意が必要。" },
      { name: "Apache Commons Text（FormattableUtils）", whenToUse: "Formattable インターフェースを使った高度な書式制御が必要な場合。", tradeoff: "標準の NumberFormat で十分なケースがほとんど。導入メリットは限定的。" },
      { name: "ICU4J（NumberFormatter）", whenToUse: "多言語対応の数値フォーマットや、通貨名の完全なローカライズが必要な場合。", tradeoff: "JAR サイズが大きく、日本語環境の金額表示だけなら標準 API で事足りる。" },
    ],
    faq: [
      { question: "BigDecimal と DecimalFormat を組み合わせるときの注意点は。", answer: "DecimalFormat.format は内部で double に変換するため、桁数が多い場合に精度が落ちることがあります。BigDecimal.toPlainString で文字列化してから整形するか、setRoundingMode で丸め方を指定してください。" },
      { question: "NumberFormat.parse はなぜ途中で止まっても例外にならないのですか。", answer: "仕様上、parse は解析可能な先頭部分だけを変換します。厳密にチェックしたい場合は ParsePosition を渡し、解析後の位置が文字列末尾と一致するか確認します。" },
      { question: "String.format と NumberFormat の使い分けはどうしますか。", answer: "単純なゼロ埋めや桁揃えには String.format、カンマ区切りや通貨記号、ロケール依存のフォーマットには NumberFormat が適しています。両者を組み合わせることも可能です。" },
    ],
    codeTitle: "NumberFormatUtil.java",
    codeSample: `import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.Locale;

public class NumberFormatUtil {

    /** カンマ区切り整数（日本ロケール） */
    public static String formatInteger(long number) {
        return NumberFormat.getNumberInstance(Locale.JAPAN).format(number);
    }

    /** DecimalFormat パターン指定 */
    public static String formatDecimal(BigDecimal amount, String pattern) {
        return new DecimalFormat(pattern).format(amount);
    }

    /** 通貨フォーマット（¥ マーク付き） */
    public static String formatCurrency(long amount) {
        return NumberFormat.getCurrencyInstance(Locale.JAPAN).format(amount);
    }

    /** カンマ区切り文字列 → long にパース */
    public static long parseFormattedNumber(String str) throws ParseException {
        return NumberFormat.getNumberInstance(Locale.JAPAN)
                .parse(str).longValue();
    }

    /** レポート行の組み立て */
    public static String buildReportLine(String label, BigDecimal value) {
        return "%s: %s円".formatted(label, formatDecimal(value, "#,##0"));
    }

    public static void main(String[] args) throws ParseException {
        // カンマ区切り
        System.out.println(formatInteger(1234567));       // 1,234,567
        System.out.println(formatInteger(-9876543));       // -9,876,543

        // DecimalFormat
        System.out.println(formatDecimal(
            new BigDecimal("12345.678"), "#,##0.00"));     // 12,345.68

        // 通貨
        System.out.println(formatCurrency(9800));          // ¥9,800

        // パース
        System.out.println(parseFormattedNumber("1,234,567")); // 1234567

        // レポート行
        System.out.println(buildReportLine(
            "売上合計", new BigDecimal("1234567")));       // 売上合計: 1,234,567円

        // ロケール別の違い
        double d = 1234567.89;
        System.out.println("日本 : "
            + NumberFormat.getNumberInstance(Locale.JAPAN).format(d));
        System.out.println("米国 : "
            + NumberFormat.getNumberInstance(Locale.US).format(d));
        System.out.println("ドイツ: "
            + NumberFormat.getNumberInstance(Locale.GERMANY).format(d));
    }
}`,
  },
]
