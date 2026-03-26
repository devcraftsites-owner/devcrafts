import java.util.HashMap;
import java.util.Map;

public class FlyweightPatternSample {

    // Java 21: sealed interface で内部状態のバリアントを型安全に表現
    sealed interface FontStyle permits FontStyle.Normal, FontStyle.Bold, FontStyle.Italic {
        record Normal(String fontFamily, int fontSize, String color) implements FontStyle {}
        record Bold(String fontFamily, int fontSize, String color) implements FontStyle {}
        record Italic(String fontFamily, int fontSize, String color) implements FontStyle {}
    }

    // Flyweight: 共有オブジェクト（内部状態のみ保持）
    record CharFont(FontStyle style) {

        // 外部状態（character: 文字、x/y: 描画位置）を受け取って描画
        // Java 21: switch パターンマッチングで FontStyle のバリアントを処理
        void render(char character, int x, int y) {
            String styleDesc = switch (style) {
                case FontStyle.Normal(var family, var size, var color) ->
                        family + " " + size + "pt " + color + " (通常)";
                case FontStyle.Bold(var family, var size, var color) ->
                        family + " " + size + "pt " + color + " (太字)";
                case FontStyle.Italic(var family, var size, var color) ->
                        family + " " + size + "pt " + color + " (斜体)";
            };
            System.out.println("  文字'" + character + "' を位置(" + x + "," + y + ")に描画 [" + styleDesc + "]");
        }
    }

    // Flyweight Factory: フォントオブジェクトのキャッシュ・共有管理
    static class FontFactory {
        private final Map<FontStyle, CharFont> cache = new HashMap<>();

        CharFont getFont(FontStyle style) {
            return cache.computeIfAbsent(style, s -> {
                System.out.println("  新しいフォントオブジェクトを作成: " + s);
                return new CharFont(s);
            });
        }

        int getCacheSize() {
            return cache.size();
        }
    }

    public static void main(String[] args) {
        var factory = new FontFactory();

        System.out.println("=== テキスト描画開始（Java 21）===");
        var text = "Hello";
        var normalStyle = new FontStyle.Normal("Arial", 12, "black");

        for (int i = 0; i < text.length(); i++) {
            // 全文字で同じスタイルを共有 → 1つのオブジェクトのみ作成される
            var font = factory.getFont(normalStyle);
            font.render(text.charAt(i), i * 10, 0);
        }

        System.out.println("\n=== 別スタイルのテキスト ===");
        var boldStyle = new FontStyle.Bold("Arial", 16, "red");
        factory.getFont(boldStyle).render('!', 50, 0);

        var italicStyle = new FontStyle.Italic("Georgia", 14, "blue");
        factory.getFont(italicStyle).render('?', 60, 0);

        // 同じスタイルを再取得 → キャッシュから返す（record の equals() が機能）
        var sameStyle = new FontStyle.Normal("Arial", 12, "black");
        var sameFont = factory.getFont(sameStyle);
        System.out.println("\n同じスタイル再取得（キャッシュ使用）");
        sameFont.render('W', 0, 20);

        System.out.println("\n作成されたフォントオブジェクト数: " + factory.getCacheSize());
        System.out.println("（" + (text.length() + 3) + "回の描画に対して " + factory.getCacheSize() + " 個のオブジェクトを共有）");

        // sealed interface + switch で FontStyle の種類を判定
        System.out.println("\n=== スタイル種別の判定 ===");
        for (var style : new FontStyle[]{normalStyle, boldStyle, italicStyle}) {
            String typeName = switch (style) {
                case FontStyle.Normal n -> "通常スタイル: " + n.fontFamily();
                case FontStyle.Bold b -> "太字スタイル: " + b.fontFamily();
                case FontStyle.Italic it -> "斜体スタイル: " + it.fontFamily();
            };
            System.out.println("  " + typeName);
        }
    }
}
