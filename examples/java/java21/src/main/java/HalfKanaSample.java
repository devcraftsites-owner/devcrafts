import java.util.Map;

public class HalfKanaSample {

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

    // ① 変換種別を sealed interface で表現（Java 17+）
    sealed interface KanaType permits KanaType.Basic, KanaType.Dakuten, KanaType.Handakuten, KanaType.Other {
        record Basic(int index)       implements KanaType {}
        record Dakuten(char voiced)   implements KanaType {}
        record Handakuten(char semi)  implements KanaType {}
        record Other(char original)   implements KanaType {}
    }

    // ② 文字の種別を判定（次の文字も見て濁音・半濁音を検出）
    private static KanaType classify(char c, char next) {
        if (next == 'ﾞ' && DAKUTEN_MAP.containsKey(c)) {
            return new KanaType.Dakuten(DAKUTEN_MAP.get(c));
        }
        if (next == 'ﾟ' && HANDAKUTEN_MAP.containsKey(c)) {
            return new KanaType.Handakuten(HANDAKUTEN_MAP.get(c));
        }
        var idx = HALF_KANA.indexOf(c);
        if (idx >= 0) {
            return new KanaType.Basic(idx);
        }
        return new KanaType.Other(c);
    }

    /**
     * 半角カナを全角カナに変換する。
     */
    public static String toFullWidth(String input) {
        if (input == null) {
            return null;
        }
        var sb = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            char next = (i + 1 < input.length()) ? input.charAt(i + 1) : 0;

            // ③ pattern matching switch で変換処理を分岐（Java 21+）
            switch (classify(c, next)) {
                case KanaType.Dakuten    t -> { sb.append(t.voiced()); i++; }
                case KanaType.Handakuten t -> { sb.append(t.semi());   i++; }
                case KanaType.Basic      t -> sb.append(FULL_KANA.charAt(t.index()));
                case KanaType.Other      t -> sb.append(t.original());
            }
        }
        return sb.toString();
    }

    /**
     * 全角カナを半角カナに変換する。
     */
    public static String toHalfWidth(String input) {
        if (input == null) {
            return null;
        }
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
