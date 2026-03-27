import java.util.List;
import java.util.Map;
import java.util.ArrayList;

/**
 * 全銀フォーマット文字セットのバリデーションと全角→半角カナ変換サンプル（Java 21）。
 *
 * 全銀フォーマットで許容される文字は JIS X 0201 片仮名用図形文字集合に基づく:
 *   - 半角数字: 0-9
 *   - 半角英大文字: A-Z
 *   - 半角カナ: ｦ-ﾝ（濁点ﾞ・半濁点ﾟを含む）
 *   - 半角記号: スペース, (, ), -, ., /, ｰ（長音）, ﾞ（濁点）, ﾟ（半濁点）
 *
 * Java 21 では sealed interface + record で文字分類を型安全に表現し、
 * switch 式のパターンマッチングで分岐を整理する。
 */
public class ZenginCharsetSample {

    // ========================================
    // 文字分類を型で表現（sealed interface + record）
    // ========================================

    /**
     * 全銀フォーマットにおける文字の分類を sealed interface で定義する。
     * switch パターンマッチングと組み合わせて、分類ごとの処理を漏れなく記述できる。
     */
    sealed interface CharClass permits
            CharClass.HalfKana, CharClass.HalfAlnum,
            CharClass.HalfSymbol, CharClass.Forbidden {
        /** 半角カナ（清音・濁点・半濁点を含む） */
        record HalfKana(char value) implements CharClass {}
        /** 半角英数字（A-Z, 0-9） */
        record HalfAlnum(char value) implements CharClass {}
        /** 許容される半角記号（スペース、括弧、ハイフン等） */
        record HalfSymbol(char value) implements CharClass {}
        /** 全銀フォーマットで使用できない禁則文字 */
        record Forbidden(char value, String reason) implements CharClass {}
    }

    /**
     * 文字を全銀フォーマットの分類に振り分ける。
     * Java 21 の switch 式ではなく、範囲チェックが必要なため if-else で判定し、
     * 結果を sealed type で返す。
     */
    public static CharClass classify(char c) {
        // 半角数字: 0x30-0x39
        if (c >= '0' && c <= '9') return new CharClass.HalfAlnum(c);
        // 半角英大文字: 0x41-0x5A
        if (c >= 'A' && c <= 'Z') return new CharClass.HalfAlnum(c);
        // 半角スペース
        if (c == ' ') return new CharClass.HalfSymbol(c);
        // 半角記号: ( ) - . /
        if (c == '(' || c == ')' || c == '-' || c == '.' || c == '/')
            return new CharClass.HalfSymbol(c);
        // 半角カナ: ｦ(0xFF66)-ﾝ(0xFF9D)
        if (c >= 0xFF66 && c <= 0xFF9D) return new CharClass.HalfKana(c);
        // 半角濁点(0xFF9E)・半濁点(0xFF9F)
        if (c == 0xFF9E || c == 0xFF9F) return new CharClass.HalfKana(c);
        // 半角長音(0xFF70)・中点(0xFF65)・鉤括弧(0xFF62, 0xFF63)
        if (c == 0xFF70 || c == 0xFF65 || c == 0xFF62 || c == 0xFF63)
            return new CharClass.HalfSymbol(c);

        // 禁則文字: 理由を付けて返す
        var reason = switch (c) {
            case char ch when ch >= 'a' && ch <= 'z'
                -> "半角英小文字は不可。大文字に変換してください";
            case char ch when ch >= 0x3041 && ch <= 0x3093
                -> "ひらがなは不可。カタカナに変換してください";
            case char ch when ch >= 0x4E00 && ch <= 0x9FFF
                -> "漢字は不可。カタカナ表記に変換してください";
            case char ch when ch >= 0x30A0 && ch <= 0x30FF
                -> "全角カタカナは不可。半角カナに変換してください";
            default -> "全銀フォーマットで許容されない文字です";
        };
        return new CharClass.Forbidden(c, reason);
    }

    // ========================================
    // 全角カナ → 半角カナ変換テーブル（Java 17 と同様に Map.ofEntries）
    // ========================================

    private static final Map<Character, String> FULLWIDTH_TO_HALFWIDTH = Map.ofEntries(
        // 清音
        Map.entry('ア', "ｱ"), Map.entry('イ', "ｲ"), Map.entry('ウ', "ｳ"),
        Map.entry('エ', "ｴ"), Map.entry('オ', "ｵ"),
        Map.entry('カ', "ｶ"), Map.entry('キ', "ｷ"), Map.entry('ク', "ｸ"),
        Map.entry('ケ', "ｹ"), Map.entry('コ', "ｺ"),
        Map.entry('サ', "ｻ"), Map.entry('シ', "ｼ"), Map.entry('ス', "ｽ"),
        Map.entry('セ', "ｾ"), Map.entry('ソ', "ｿ"),
        Map.entry('タ', "ﾀ"), Map.entry('チ', "ﾁ"), Map.entry('ツ', "ﾂ"),
        Map.entry('テ', "ﾃ"), Map.entry('ト', "ﾄ"),
        Map.entry('ナ', "ﾅ"), Map.entry('ニ', "ﾆ"), Map.entry('ヌ', "ﾇ"),
        Map.entry('ネ', "ﾈ"), Map.entry('ノ', "ﾉ"),
        Map.entry('ハ', "ﾊ"), Map.entry('ヒ', "ﾋ"), Map.entry('フ', "ﾌ"),
        Map.entry('ヘ', "ﾍ"), Map.entry('ホ', "ﾎ"),
        Map.entry('マ', "ﾏ"), Map.entry('ミ', "ﾐ"), Map.entry('ム', "ﾑ"),
        Map.entry('メ', "ﾒ"), Map.entry('モ', "ﾓ"),
        Map.entry('ヤ', "ﾔ"), Map.entry('ユ', "ﾕ"), Map.entry('ヨ', "ﾖ"),
        Map.entry('ラ', "ﾗ"), Map.entry('リ', "ﾘ"), Map.entry('ル', "ﾙ"),
        Map.entry('レ', "ﾚ"), Map.entry('ロ', "ﾛ"),
        Map.entry('ワ', "ﾜ"), Map.entry('ヲ', "ｦ"), Map.entry('ン', "ﾝ"),
        // 濁音 → 清音 + 濁点(ﾞ)
        Map.entry('ガ', "ｶﾞ"), Map.entry('ギ', "ｷﾞ"), Map.entry('グ', "ｸﾞ"),
        Map.entry('ゲ', "ｹﾞ"), Map.entry('ゴ', "ｺﾞ"),
        Map.entry('ザ', "ｻﾞ"), Map.entry('ジ', "ｼﾞ"), Map.entry('ズ', "ｽﾞ"),
        Map.entry('ゼ', "ｾﾞ"), Map.entry('ゾ', "ｿﾞ"),
        Map.entry('ダ', "ﾀﾞ"), Map.entry('ヂ', "ﾁﾞ"), Map.entry('ヅ', "ﾂﾞ"),
        Map.entry('デ', "ﾃﾞ"), Map.entry('ド', "ﾄﾞ"),
        Map.entry('バ', "ﾊﾞ"), Map.entry('ビ', "ﾋﾞ"), Map.entry('ブ', "ﾌﾞ"),
        Map.entry('ベ', "ﾍﾞ"), Map.entry('ボ', "ﾎﾞ"),
        // 半濁音 → 清音 + 半濁点(ﾟ)
        Map.entry('パ', "ﾊﾟ"), Map.entry('ピ', "ﾋﾟ"), Map.entry('プ', "ﾌﾟ"),
        Map.entry('ペ', "ﾍﾟ"), Map.entry('ポ', "ﾎﾟ"),
        // 特殊文字
        Map.entry('ー', "ｰ"), Map.entry('・', "･"),
        Map.entry('゛', "ﾞ"), Map.entry('゜', "ﾟ"),
        Map.entry('「', "｢"), Map.entry('」', "｣"),
        Map.entry('（', "("), Map.entry('）', ")"),
        Map.entry('－', "-"), Map.entry('．', "."), Map.entry('／', "/"),
        Map.entry('\u3000', " ")
    );

    private static final Map<Character, String> FULLWIDTH_ALNUM;
    static {
        var map = new java.util.HashMap<Character, String>();
        for (char c = 'Ａ'; c <= 'Ｚ'; c++)
            map.put(c, String.valueOf((char) ('A' + (c - 'Ａ'))));
        for (char c = '０'; c <= '９'; c++)
            map.put(c, String.valueOf((char) ('0' + (c - '０'))));
        FULLWIDTH_ALNUM = Map.copyOf(map);
    }

    // ========================================
    // 全角 → 半角変換
    // ========================================

    public static String convertToHalfWidth(String input) {
        var result = new StringBuilder(input.length() * 2);
        for (int i = 0; i < input.length(); i++) {
            var c = input.charAt(i);
            var mapped = FULLWIDTH_TO_HALFWIDTH.get(c);
            if (mapped != null) { result.append(mapped); continue; }
            var alnumMapped = FULLWIDTH_ALNUM.get(c);
            if (alnumMapped != null) { result.append(alnumMapped); continue; }
            result.append(c);
        }
        return result.toString();
    }

    // ========================================
    // バリデーション結果を record で表現
    // ========================================

    /** バリデーション結果を保持する record */
    record ValidationResult(String input, List<CharClass.Forbidden> violations) {
        boolean isValid() { return violations.isEmpty(); }

        /** switch パターンマッチングで結果を表示 */
        String summary() {
            if (isValid()) return "全銀フォーマット準拠 OK: " + input;
            var sb = new StringBuilder("禁則文字が %d 件見つかりました:\n".formatted(violations.size()));
            for (var v : violations) {
                // switch 式で Forbidden の内容をフォーマット
                sb.append("  '%c' (U+%04X) - %s\n".formatted(v.value(), (int) v.value(), v.reason()));
            }
            return sb.toString();
        }
    }

    /**
     * 文字列を全銀フォーマット基準でバリデーションする。
     * classify() で各文字を分類し、Forbidden だけを収集する。
     */
    public static ValidationResult validate(String input) {
        var violations = new ArrayList<CharClass.Forbidden>();
        for (int i = 0; i < input.length(); i++) {
            var charClass = classify(input.charAt(i));
            // Java 21: switch パターンマッチングで sealed type を網羅的に処理
            switch (charClass) {
                case CharClass.HalfKana _ -> { /* 許容: 何もしない */ }
                case CharClass.HalfAlnum _ -> { /* 許容: 何もしない */ }
                case CharClass.HalfSymbol _ -> { /* 許容: 何もしない */ }
                case CharClass.Forbidden f -> violations.add(f);
            }
        }
        return new ValidationResult(input, List.copyOf(violations));
    }

    // ========================================
    // メイン: 振込依頼人名のバリデーション例
    // ========================================

    public static void main(String[] args) {
        // 全角カナで入力された振込依頼人名
        var depositorName = "カブシキガイシャ　デブクラフト";

        System.out.println("=== 全角→半角変換 ===");
        var converted = convertToHalfWidth(depositorName);
        System.out.println("変換前: " + depositorName);
        System.out.println("変換後: " + converted);

        System.out.println("\n=== 型安全なバリデーション ===");
        var result1 = validate(converted);
        System.out.println(result1.summary());

        // 禁則文字を含む文字列
        var invalidInput = "abc株式会社ﾃﾞﾌﾞｸﾗﾌﾄ";
        var result2 = validate(invalidInput);
        System.out.println(result2.summary());

        System.out.println("=== 変換＋バリデーションの組み合わせ ===");
        var mixedInput = "カブシキガイシャ　ＡＢＣ商事";
        var halfWidth = convertToHalfWidth(mixedInput);
        System.out.println("変換後: " + halfWidth);
        var result3 = validate(halfWidth);
        System.out.println(result3.summary());
    }
}
