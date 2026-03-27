import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

/**
 * 全銀フォーマット文字セットのバリデーションと全角→半角カナ変換サンプル（Java 8）。
 *
 * 全銀フォーマットで許容される文字は JIS X 0201 片仮名用図形文字集合に基づく:
 *   - 半角数字: 0-9
 *   - 半角英大文字: A-Z
 *   - 半角カナ: ｦ-ﾝ（濁点ﾞ・半濁点ﾟを含む）
 *   - 半角記号: スペース, (, ), -, ., /, ｰ（長音）, ﾞ（濁点）, ﾟ（半濁点）
 *
 * Java 8 では HashMap で変換テーブルを構築し、拡張 for ループで1文字ずつ処理する。
 */
public class ZenginCharsetSample {

    // ========================================
    // 全角カナ → 半角カナ変換テーブル（HashMap で構築）
    // ========================================

    /** 全角カナ → 半角カナの変換マップ（濁音・半濁音は2文字に分解） */
    private static final Map<Character, String> FULLWIDTH_TO_HALFWIDTH;

    static {
        // Java 8 では static イニシャライザで HashMap を構築する
        FULLWIDTH_TO_HALFWIDTH = new HashMap<Character, String>();

        // 清音: 1文字→1文字の単純変換
        FULLWIDTH_TO_HALFWIDTH.put('ア', "ｱ");
        FULLWIDTH_TO_HALFWIDTH.put('イ', "ｲ");
        FULLWIDTH_TO_HALFWIDTH.put('ウ', "ｳ");
        FULLWIDTH_TO_HALFWIDTH.put('エ', "ｴ");
        FULLWIDTH_TO_HALFWIDTH.put('オ', "ｵ");
        FULLWIDTH_TO_HALFWIDTH.put('カ', "ｶ");
        FULLWIDTH_TO_HALFWIDTH.put('キ', "ｷ");
        FULLWIDTH_TO_HALFWIDTH.put('ク', "ｸ");
        FULLWIDTH_TO_HALFWIDTH.put('ケ', "ｹ");
        FULLWIDTH_TO_HALFWIDTH.put('コ', "ｺ");
        FULLWIDTH_TO_HALFWIDTH.put('サ', "ｻ");
        FULLWIDTH_TO_HALFWIDTH.put('シ', "ｼ");
        FULLWIDTH_TO_HALFWIDTH.put('ス', "ｽ");
        FULLWIDTH_TO_HALFWIDTH.put('セ', "ｾ");
        FULLWIDTH_TO_HALFWIDTH.put('ソ', "ｿ");
        FULLWIDTH_TO_HALFWIDTH.put('タ', "ﾀ");
        FULLWIDTH_TO_HALFWIDTH.put('チ', "ﾁ");
        FULLWIDTH_TO_HALFWIDTH.put('ツ', "ﾂ");
        FULLWIDTH_TO_HALFWIDTH.put('テ', "ﾃ");
        FULLWIDTH_TO_HALFWIDTH.put('ト', "ﾄ");
        FULLWIDTH_TO_HALFWIDTH.put('ナ', "ﾅ");
        FULLWIDTH_TO_HALFWIDTH.put('ニ', "ﾆ");
        FULLWIDTH_TO_HALFWIDTH.put('ヌ', "ﾇ");
        FULLWIDTH_TO_HALFWIDTH.put('ネ', "ﾈ");
        FULLWIDTH_TO_HALFWIDTH.put('ノ', "ﾉ");
        FULLWIDTH_TO_HALFWIDTH.put('ハ', "ﾊ");
        FULLWIDTH_TO_HALFWIDTH.put('ヒ', "ﾋ");
        FULLWIDTH_TO_HALFWIDTH.put('フ', "ﾌ");
        FULLWIDTH_TO_HALFWIDTH.put('ヘ', "ﾍ");
        FULLWIDTH_TO_HALFWIDTH.put('ホ', "ﾎ");
        FULLWIDTH_TO_HALFWIDTH.put('マ', "ﾏ");
        FULLWIDTH_TO_HALFWIDTH.put('ミ', "ﾐ");
        FULLWIDTH_TO_HALFWIDTH.put('ム', "ﾑ");
        FULLWIDTH_TO_HALFWIDTH.put('メ', "ﾒ");
        FULLWIDTH_TO_HALFWIDTH.put('モ', "ﾓ");
        FULLWIDTH_TO_HALFWIDTH.put('ヤ', "ﾔ");
        FULLWIDTH_TO_HALFWIDTH.put('ユ', "ﾕ");
        FULLWIDTH_TO_HALFWIDTH.put('ヨ', "ﾖ");
        FULLWIDTH_TO_HALFWIDTH.put('ラ', "ﾗ");
        FULLWIDTH_TO_HALFWIDTH.put('リ', "ﾘ");
        FULLWIDTH_TO_HALFWIDTH.put('ル', "ﾙ");
        FULLWIDTH_TO_HALFWIDTH.put('レ', "ﾚ");
        FULLWIDTH_TO_HALFWIDTH.put('ロ', "ﾛ");
        FULLWIDTH_TO_HALFWIDTH.put('ワ', "ﾜ");
        FULLWIDTH_TO_HALFWIDTH.put('ヲ', "ｦ");
        FULLWIDTH_TO_HALFWIDTH.put('ン', "ﾝ");

        // 濁音: 1文字→2文字に分解（清音 + 濁点ﾞ）
        // 全銀フォーマットでは濁音を「清音＋濁点」の2バイトで表現する
        FULLWIDTH_TO_HALFWIDTH.put('ガ', "ｶﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ギ', "ｷﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('グ', "ｸﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ゲ', "ｹﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ゴ', "ｺﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ザ', "ｻﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ジ', "ｼﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ズ', "ｽﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ゼ', "ｾﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ゾ', "ｿﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ダ', "ﾀﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ヂ', "ﾁﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ヅ', "ﾂﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('デ', "ﾃﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ド', "ﾄﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('バ', "ﾊﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ビ', "ﾋﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ブ', "ﾌﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ベ', "ﾍﾞ");
        FULLWIDTH_TO_HALFWIDTH.put('ボ', "ﾎﾞ");

        // 半濁音: 1文字→2文字に分解（清音 + 半濁点ﾟ）
        FULLWIDTH_TO_HALFWIDTH.put('パ', "ﾊﾟ");
        FULLWIDTH_TO_HALFWIDTH.put('ピ', "ﾋﾟ");
        FULLWIDTH_TO_HALFWIDTH.put('プ', "ﾌﾟ");
        FULLWIDTH_TO_HALFWIDTH.put('ペ', "ﾍﾟ");
        FULLWIDTH_TO_HALFWIDTH.put('ポ', "ﾎﾟ");

        // 特殊文字の変換
        FULLWIDTH_TO_HALFWIDTH.put('ー', "ｰ");   // 全角長音 → 半角長音
        FULLWIDTH_TO_HALFWIDTH.put('・', "･");     // 全角中点 → 半角中点（全銀仕様で許容）
        FULLWIDTH_TO_HALFWIDTH.put('゛', "ﾞ");   // 全角濁点 → 半角濁点
        FULLWIDTH_TO_HALFWIDTH.put('゜', "ﾟ");   // 全角半濁点 → 半角半濁点
        FULLWIDTH_TO_HALFWIDTH.put('「', "｢");     // 全角鉤括弧 → 半角
        FULLWIDTH_TO_HALFWIDTH.put('」', "｣");     // 全角鉤括弧 → 半角

        // 全角英数字 → 半角英数字
        for (char c = 'Ａ'; c <= 'Ｚ'; c++) {
            FULLWIDTH_TO_HALFWIDTH.put(c, String.valueOf((char) ('A' + (c - 'Ａ'))));
        }
        for (char c = '０'; c <= '９'; c++) {
            FULLWIDTH_TO_HALFWIDTH.put(c, String.valueOf((char) ('0' + (c - '０'))));
        }

        // 全角記号 → 半角記号
        FULLWIDTH_TO_HALFWIDTH.put('（', "(");
        FULLWIDTH_TO_HALFWIDTH.put('）', ")");
        FULLWIDTH_TO_HALFWIDTH.put('－', "-");
        FULLWIDTH_TO_HALFWIDTH.put('．', ".");
        FULLWIDTH_TO_HALFWIDTH.put('／', "/");
        FULLWIDTH_TO_HALFWIDTH.put('\u3000', " "); // 全角スペース → 半角スペース
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
        // 半角英大文字: 0x41-0x5A
        if (c >= 'A' && c <= 'Z') return true;
        // 半角スペース
        if (c == ' ') return true;
        // 半角記号: ( ) - . /
        if (c == '(' || c == ')' || c == '-' || c == '.' || c == '/') return true;
        // 半角カナ: ｦ(0xFF66)-ﾝ(0xFF9D)
        if (c >= 0xFF66 && c <= 0xFF9D) return true;
        // 半角濁点(0xFF9E)・半濁点(0xFF9F)
        if (c == 0xFF9E || c == 0xFF9F) return true;
        // 半角長音(0xFF70)
        if (c == 0xFF70) return true;
        // 半角中点(0xFF65) — 全銀仕様で許容
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
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            String mapped = FULLWIDTH_TO_HALFWIDTH.get(c);
            if (mapped != null) {
                // 変換テーブルに該当あり → 半角文字（濁音は2文字に展開される）
                result.append(mapped);
            } else {
                // 変換テーブルに該当なし → そのまま（後続のバリデーションで検出する）
                result.append(c);
            }
        }
        return result.toString();
    }

    // ========================================
    // 禁則文字の検出
    // ========================================

    /**
     * 文字列内の全銀禁則文字を検出し、位置と文字の一覧を返す。
     * 振込データ送信前のバリデーションに使用する。
     */
    public static List<String> findForbiddenChars(String input) {
        List<String> violations = new ArrayList<String>();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (!isZenginAllowed(c)) {
                // 禁則文字の位置（0始まり）とコードポイントを記録
                violations.add(String.format(
                    "位置 %d: '%c' (U+%04X)", i, c, (int) c));
            }
        }
        return violations;
    }

    // ========================================
    // メイン: 振込依頼人名のバリデーション例
    // ========================================

    public static void main(String[] args) {
        // 全角カナで入力された振込依頼人名
        String depositorName = "カブシキガイシャ　デブクラフト";

        System.out.println("=== 全角→半角変換 ===");
        String converted = convertToHalfWidth(depositorName);
        System.out.println("変換前: " + depositorName);
        System.out.println("変換後: " + converted);
        // 出力: ｶﾌﾞｼｷｶﾞｲｼｬ ﾃﾞﾌﾞｸﾗﾌﾄ

        System.out.println("\n=== 禁則文字チェック ===");
        // 禁則文字を含む文字列（小文字の英字、漢字）
        String invalidInput = "abc株式会社ﾃﾞﾌﾞｸﾗﾌﾄ";
        List<String> violations = findForbiddenChars(invalidInput);
        if (violations.isEmpty()) {
            System.out.println("禁則文字なし");
        } else {
            System.out.println("禁則文字が見つかりました:");
            for (String v : violations) {
                System.out.println("  " + v);
            }
        }

        System.out.println("\n=== 変換＋バリデーションの組み合わせ ===");
        String mixedInput = "カブシキガイシャ　ＡＢＣ商事";
        String halfWidth = convertToHalfWidth(mixedInput);
        System.out.println("変換後: " + halfWidth);
        List<String> afterCheck = findForbiddenChars(halfWidth);
        if (afterCheck.isEmpty()) {
            System.out.println("全銀フォーマット準拠 OK");
        } else {
            System.out.println("変換後も残る禁則文字:");
            for (String v : afterCheck) {
                System.out.println("  " + v);
            }
        }
    }
}
