import java.util.Map;
import java.util.Optional;

public class HalfKanaSample {

    // 半角カナ → 全角カナ の基本変換テーブル（1文字対1文字）
    private static final String HALF_KANA =
        "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
    private static final String FULL_KANA =
        "ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

    // 濁音・半濁音テーブル（Java 9+ Map.of() はイミュータブル）
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

    /**
     * 半角カナを全角カナに変換する。
     * 濁音（ｶﾞ → ガ）・半濁音（ﾊﾟ → パ）の2文字結合も処理する。
     */
    public static String toFullWidth(String input) {
        if (input == null) {
            return null;
        }
        var sb = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            char next = (i + 1 < input.length()) ? input.charAt(i + 1) : 0;

            // 濁音: 半角カナ + ﾞ の2文字 → 全角濁音1文字
            if (next == 'ﾞ' && DAKUTEN_MAP.containsKey(c)) {
                sb.append(DAKUTEN_MAP.get(c));
                i++;
                continue;
            }
            // 半濁音: 半角カナ + ﾟ の2文字 → 全角半濁音1文字
            if (next == 'ﾟ' && HANDAKUTEN_MAP.containsKey(c)) {
                sb.append(HANDAKUTEN_MAP.get(c));
                i++;
                continue;
            }
            // 基本変換
            var idx = HALF_KANA.indexOf(c);
            sb.append(idx >= 0 ? FULL_KANA.charAt(idx) : c);
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
        var sb = new StringBuilder();
        for (char c : input.toCharArray()) {
            // 濁音の逆変換
            var dakuten = DAKUTEN_MAP.entrySet().stream()
                .filter(e -> e.getValue() == c)
                .findFirst();
            if (dakuten.isPresent()) {
                sb.append(dakuten.get().getKey()).append('ﾞ');
                continue;
            }
            // 半濁音の逆変換
            var handakuten = HANDAKUTEN_MAP.entrySet().stream()
                .filter(e -> e.getValue() == c)
                .findFirst();
            if (handakuten.isPresent()) {
                sb.append(handakuten.get().getKey()).append('ﾟ');
                continue;
            }
            // 基本変換
            var idx = FULL_KANA.indexOf(c);
            sb.append(idx >= 0 ? HALF_KANA.charAt(idx) : c);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println("【半角 → 全角】");
        System.out.println(toFullWidth("ｶﾅ"));            // カナ
        System.out.println(toFullWidth("ｶﾞｷﾞｸﾞｹﾞｺﾞ"));  // ガギグゲゴ
        System.out.println(toFullWidth("ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ"));   // パピプペポ
        System.out.println(toFullWidth("ABC ｱｲｳ 123")); // ABC アイウ 123

        System.out.println("\n【全角 → 半角】");
        System.out.println(toHalfWidth("カタカナ"));      // ｶﾀｶﾅ
        System.out.println(toHalfWidth("ガギグゲゴ"));    // ｶﾞｷﾞｸﾞｹﾞｺﾞ
        System.out.println(toHalfWidth("パピプペポ"));    // ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ

        System.out.println("\n【往復変換テスト】");
        var original = "ｶﾞｷﾞｸﾞｹﾞｺﾞ";
        var full = toFullWidth(original);
        var back = toHalfWidth(full);
        System.out.println("往復一致: " + original.equals(back));
    }
}
