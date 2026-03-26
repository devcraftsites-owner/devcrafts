import java.util.HashMap;
import java.util.Map;

public class HalfKanaSample {

    // 半角カナ → 全角カナ の基本変換テーブル（1文字対1文字の変換）
    private static final String HALF_KANA =
        "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
    private static final String FULL_KANA =
        "ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

    // 濁音変換テーブル（半角カナ + ﾞ → 全角濁音1文字）
    private static final Map<Character, Character> DAKUTEN_MAP = new HashMap<>();

    // 半濁音変換テーブル（半角カナ + ﾟ → 全角半濁音1文字）
    private static final Map<Character, Character> HANDAKUTEN_MAP = new HashMap<>();

    static {
        String[] dakutenPairs = {
            "ｶガ", "ｷギ", "ｸグ", "ｹゲ", "ｺゴ",
            "ｻザ", "ｼジ", "ｽズ", "ｾゼ", "ｿゾ",
            "ﾀダ", "ﾁヂ", "ﾂヅ", "ﾃデ", "ﾄド",
            "ﾊバ", "ﾋビ", "ﾌブ", "ﾍベ", "ﾎボ",
            "ｳヴ"
        };
        for (String pair : dakutenPairs) {
            DAKUTEN_MAP.put(pair.charAt(0), pair.charAt(1));
        }
        String[] handakutenPairs = {
            "ﾊパ", "ﾋピ", "ﾌプ", "ﾍペ", "ﾎポ"
        };
        for (String pair : handakutenPairs) {
            HANDAKUTEN_MAP.put(pair.charAt(0), pair.charAt(1));
        }
    }

    /**
     * 半角カナを全角カナに変換する。
     * 濁音（ｶﾞ → ガ）・半濁音（ﾊﾟ → パ）の2文字結合も処理する。
     * 変換対象外の文字（英数字・ひらがな・漢字など）はそのまま返す。
     */
    public static String toFullWidth(String input) {
        if (input == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            char next = (i + 1 < input.length()) ? input.charAt(i + 1) : 0;

            // 濁音: 半角カナ + ﾞ の2文字 → 全角濁音1文字
            if (next == 'ﾞ' && DAKUTEN_MAP.containsKey(c)) {
                sb.append(DAKUTEN_MAP.get(c));
                i++; // ﾞ をスキップ
                continue;
            }
            // 半濁音: 半角カナ + ﾟ の2文字 → 全角半濁音1文字
            if (next == 'ﾟ' && HANDAKUTEN_MAP.containsKey(c)) {
                sb.append(HANDAKUTEN_MAP.get(c));
                i++; // ﾟ をスキップ
                continue;
            }
            // 基本変換: 半角カナ1文字 → 全角カナ1文字
            int idx = HALF_KANA.indexOf(c);
            if (idx >= 0) {
                sb.append(FULL_KANA.charAt(idx));
            } else {
                sb.append(c); // 変換対象外はそのまま
            }
        }
        return sb.toString();
    }

    /**
     * 全角カナを半角カナに変換する。
     * 濁音（ガ → ｶﾞ）・半濁音（パ → ﾊﾟ）は2文字に展開する。
     */
    public static String toHalfWidth(String input) {
        if (input == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            boolean converted = false;

            // 濁音の逆変換（全角濁音 → 半角カナ + ﾞ）
            for (Map.Entry<Character, Character> entry : DAKUTEN_MAP.entrySet()) {
                if (entry.getValue() == c) {
                    sb.append(entry.getKey()).append('ﾞ');
                    converted = true;
                    break;
                }
            }
            if (converted) {
                continue;
            }
            // 半濁音の逆変換（全角半濁音 → 半角カナ + ﾟ）
            for (Map.Entry<Character, Character> entry : HANDAKUTEN_MAP.entrySet()) {
                if (entry.getValue() == c) {
                    sb.append(entry.getKey()).append('ﾟ');
                    converted = true;
                    break;
                }
            }
            if (converted) {
                continue;
            }
            // 基本変換（全角カナ → 半角カナ）
            int idx = FULL_KANA.indexOf(c);
            if (idx >= 0) {
                sb.append(HALF_KANA.charAt(idx));
            } else {
                sb.append(c); // 変換対象外はそのまま
            }
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        // 半角 → 全角
        System.out.println("【半角 → 全角】");
        System.out.println(toFullWidth("ｶﾅ"));            // カナ
        System.out.println(toFullWidth("ｶﾞｷﾞｸﾞｹﾞｺﾞ"));  // ガギグゲゴ（濁音）
        System.out.println(toFullWidth("ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ"));   // パピプペポ（半濁音）
        System.out.println(toFullWidth("ABC ｱｲｳ 123")); // ABC アイウ 123（英数字はそのまま）

        // 全角 → 半角
        System.out.println("\n【全角 → 半角】");
        System.out.println(toHalfWidth("カタカナ"));      // ｶﾀｶﾅ
        System.out.println(toHalfWidth("ガギグゲゴ"));    // ｶﾞｷﾞｸﾞｹﾞｺﾞ（濁音展開）
        System.out.println(toHalfWidth("パピプペポ"));    // ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ（半濁音展開）
        System.out.println(toHalfWidth("ABC アイウ 123")); // ABC ｱｲｳ 123

        // 往復変換テスト
        System.out.println("\n【往復変換テスト】");
        String original = "ｶﾞｷﾞｸﾞｹﾞｺﾞ";
        String full = toFullWidth(original);
        String back = toHalfWidth(full);
        System.out.println("元: " + original + " → 全角: " + full + " → 戻し: " + back);
        System.out.println("往復一致: " + original.equals(back));
    }
}
