import java.util.List;
import java.util.Map;
import java.util.ArrayList;

/**
 * 全銀フォーマット文字セットのバリデーションと全角→半角カナ変換サンプル（Java 17）。
 *
 * 全銀フォーマットで許容される文字は JIS X 0201 片仮名用図形文字集合に基づく:
 *   - 半角数字: 0-9
 *   - 半角英大文字: A-Z
 *   - 半角カナ: ｦ-ﾝ（濁点ﾞ・半濁点ﾟを含む）
 *   - 半角記号: スペース, (, ), -, ., /, ｰ（長音）, ﾞ（濁点）, ﾟ（半濁点）
 *
 * Java 17 では Map.of() でイミュータブルな変換テーブルを構築し、
 * var による型推論と Stream でバリデーションを簡潔に記述する。
 */
public class ZenginCharsetSample {

    // ========================================
    // 全角カナ → 半角カナ変換テーブル（Map.of / Map.ofEntries でイミュータブルに構築）
    // ========================================

    /**
     * 全角カナ → 半角カナの変換マップ。
     * Map.of() は最大10エントリまでなので、Map.ofEntries() を使う。
     * 濁音・半濁音は「清音 + 濁点/半濁点」の2文字に分解する。
     */
    private static final Map<Character, String> FULLWIDTH_TO_HALFWIDTH = Map.ofEntries(
        // --- 清音 ---
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

        // --- 濁音: 清音 + 濁点(ﾞ) の2文字に分解 ---
        Map.entry('ガ', "ｶﾞ"), Map.entry('ギ', "ｷﾞ"), Map.entry('グ', "ｸﾞ"),
        Map.entry('ゲ', "ｹﾞ"), Map.entry('ゴ', "ｺﾞ"),
        Map.entry('ザ', "ｻﾞ"), Map.entry('ジ', "ｼﾞ"), Map.entry('ズ', "ｽﾞ"),
        Map.entry('ゼ', "ｾﾞ"), Map.entry('ゾ', "ｿﾞ"),
        Map.entry('ダ', "ﾀﾞ"), Map.entry('ヂ', "ﾁﾞ"), Map.entry('ヅ', "ﾂﾞ"),
        Map.entry('デ', "ﾃﾞ"), Map.entry('ド', "ﾄﾞ"),
        Map.entry('バ', "ﾊﾞ"), Map.entry('ビ', "ﾋﾞ"), Map.entry('ブ', "ﾌﾞ"),
        Map.entry('ベ', "ﾍﾞ"), Map.entry('ボ', "ﾎﾞ"),

        // --- 半濁音: 清音 + 半濁点(ﾟ) の2文字に分解 ---
        Map.entry('パ', "ﾊﾟ"), Map.entry('ピ', "ﾋﾟ"), Map.entry('プ', "ﾌﾟ"),
        Map.entry('ペ', "ﾍﾟ"), Map.entry('ポ', "ﾎﾟ"),

        // --- 特殊文字 ---
        Map.entry('ー', "ｰ"),   // 全角長音 → 半角長音(0xFF70)
        Map.entry('・', "･"),    // 全角中点 → 半角中点(0xFF65)
        Map.entry('゛', "ﾞ"),   // 全角濁点 → 半角濁点
        Map.entry('゜', "ﾟ"),   // 全角半濁点 → 半角半濁点
        Map.entry('「', "｢"),    // 全角鉤括弧開き → 半角
        Map.entry('」', "｣"),    // 全角鉤括弧閉じ → 半角

        // --- 全角記号 → 半角記号 ---
        Map.entry('（', "("), Map.entry('）', ")"),
        Map.entry('－', "-"), Map.entry('．', "."), Map.entry('／', "/"),
        Map.entry('\u3000', " ") // 全角スペース → 半角スペース
    );

    /**
     * 全角英数字 → 半角英数字の変換マップ。
     * Map.ofEntries のエントリ数上限を避けるため別マップにする。
     */
    private static final Map<Character, String> FULLWIDTH_ALNUM;
    static {
        // Java 17 でも大量の Map.entry を並べるよりループのほうが見通しがよい
        var map = new java.util.HashMap<Character, String>();
        for (char c = 'Ａ'; c <= 'Ｚ'; c++) {
            map.put(c, String.valueOf((char) ('A' + (c - 'Ａ'))));
        }
        for (char c = '０'; c <= '９'; c++) {
            map.put(c, String.valueOf((char) ('0' + (c - '０'))));
        }
        FULLWIDTH_ALNUM = Map.copyOf(map); // イミュータブルコピー
    }

    // ========================================
    // 全銀許容文字の判定
    // ========================================

    /**
     * 全銀フォーマットで許容される文字かどうかを判定する。
     * JIS X 0201 片仮名用図形文字集合 + 半角英数字 + 一部記号が対象。
     */
    public static boolean isZenginAllowed(char c) {
        // 半角数字: 0x30-0x39
        if (c >= '0' && c <= '9') return true;
        // 半角英大文字: 0x41-0x5A（小文字は不可）
        if (c >= 'A' && c <= 'Z') return true;
        // 半角スペース(0x20)
        if (c == ' ') return true;
        // 半角記号: ( ) - . /
        if (c == '(' || c == ')' || c == '-' || c == '.' || c == '/') return true;
        // 半角カナ: ｦ(0xFF66)-ﾝ(0xFF9D)
        if (c >= 0xFF66 && c <= 0xFF9D) return true;
        // 半角濁点(0xFF9E)・半濁点(0xFF9F)
        if (c == 0xFF9E || c == 0xFF9F) return true;
        // 半角長音(0xFF70)
        if (c == 0xFF70) return true;
        // 半角中点(0xFF65)
        if (c == 0xFF65) return true;
        // 半角鉤括弧(0xFF62, 0xFF63)
        if (c == 0xFF62 || c == 0xFF63) return true;
        return false;
    }

    // ========================================
    // 全角 → 半角変換
    // ========================================

    /**
     * 全角文字を半角に変換する。変換テーブルにない文字はそのまま残す。
     * 濁音・半濁音は清音＋濁点/半濁点の2文字に分解される。
     */
    public static String convertToHalfWidth(String input) {
        var result = new StringBuilder(input.length() * 2);
        for (int i = 0; i < input.length(); i++) {
            var c = input.charAt(i);
            // カナ・記号の変換テーブルを先に検索
            var mapped = FULLWIDTH_TO_HALFWIDTH.get(c);
            if (mapped != null) {
                result.append(mapped);
                continue;
            }
            // 全角英数字の変換テーブルを検索
            var alnumMapped = FULLWIDTH_ALNUM.get(c);
            if (alnumMapped != null) {
                result.append(alnumMapped);
                continue;
            }
            // どちらにも該当しない → そのまま（後続バリデーションで検出）
            result.append(c);
        }
        return result.toString();
    }

    // ========================================
    // 禁則文字の検出
    // ========================================

    /** 禁則文字の情報を保持する record */
    record Violation(int position, char character, String codePoint) {
        @Override
        public String toString() {
            return "位置 %d: '%c' (U+%04X)".formatted(position, character, (int) character);
        }
    }

    /**
     * 文字列内の全銀禁則文字を検出し、位置と文字の一覧を返す。
     * 振込データ送信前のバリデーションに使用する。
     */
    public static List<Violation> findForbiddenChars(String input) {
        var violations = new ArrayList<Violation>();
        for (int i = 0; i < input.length(); i++) {
            var c = input.charAt(i);
            if (!isZenginAllowed(c)) {
                violations.add(new Violation(i, c,
                    "U+%04X".formatted((int) c)));
            }
        }
        return violations;
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
        // 出力: ｶﾌﾞｼｷｶﾞｲｼｬ ﾃﾞﾌﾞｸﾗﾌﾄ

        System.out.println("\n=== 禁則文字チェック ===");
        // 禁則文字を含む文字列（小文字、漢字）
        var invalidInput = "abc株式会社ﾃﾞﾌﾞｸﾗﾌﾄ";
        var violations = findForbiddenChars(invalidInput);
        if (violations.isEmpty()) {
            System.out.println("禁則文字なし");
        } else {
            System.out.println("禁則文字が見つかりました:");
            violations.forEach(v -> System.out.println("  " + v));
        }

        System.out.println("\n=== 変換＋バリデーションの組み合わせ ===");
        var mixedInput = "カブシキガイシャ　ＡＢＣ商事";
        var halfWidth = convertToHalfWidth(mixedInput);
        System.out.println("変換後: " + halfWidth);
        var afterCheck = findForbiddenChars(halfWidth);
        if (afterCheck.isEmpty()) {
            System.out.println("全銀フォーマット準拠 OK");
        } else {
            System.out.println("変換後も残る禁則文字:");
            afterCheck.forEach(v -> System.out.println("  " + v));
        }
    }
}
