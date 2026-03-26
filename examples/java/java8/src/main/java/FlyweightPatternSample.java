import java.util.HashMap;
import java.util.Map;

public class FlyweightPatternSample {

    // Flyweight: 共有オブジェクト（内部状態のみ保持）
    static class CharFont {
        private final String fontFamily; // 内部状態（共有）
        private final int fontSize;      // 内部状態（共有）
        private final String color;      // 内部状態（共有）

        CharFont(String fontFamily, int fontSize, String color) {
            this.fontFamily = fontFamily;
            this.fontSize = fontSize;
            this.color = color;
            System.out.println("  新しいフォントオブジェクトを作成: " + this);
        }

        // 外部状態（character: 文字、x/y: 描画位置）を受け取って描画
        void render(char character, int x, int y) {
            System.out.println("  文字'" + character + "' を位置(" + x + "," + y + ")に描画"
                    + " [" + fontFamily + " " + fontSize + "pt " + color + "]");
        }

        @Override
        public String toString() {
            return fontFamily + "/" + fontSize + "pt/" + color;
        }
    }

    // Flyweight Factory: フォントオブジェクトのキャッシュ・共有管理
    static class FontFactory {
        private final Map<String, CharFont> cache = new HashMap<>();

        CharFont getFont(String fontFamily, int fontSize, String color) {
            String key = fontFamily + "_" + fontSize + "_" + color;
            if (!cache.containsKey(key)) {
                cache.put(key, new CharFont(fontFamily, fontSize, color));
            }
            return cache.get(key);
        }

        int getCacheSize() {
            return cache.size();
        }
    }

    public static void main(String[] args) {
        FontFactory factory = new FontFactory();

        // テキスト「Hello」を描画（各文字の位置は外部状態）
        System.out.println("=== テキスト描画開始 ===");
        String text = "Hello";
        for (int i = 0; i < text.length(); i++) {
            // 全文字で同じフォントを共有 → 1つのオブジェクトのみ作成される
            CharFont font = factory.getFont("Arial", 12, "black");
            font.render(text.charAt(i), i * 10, 0);
        }

        System.out.println("\n=== 別フォントのテキスト ===");
        CharFont boldFont = factory.getFont("Arial", 16, "red");
        boldFont.render('!', 50, 0);

        // 同じフォントを再取得 → キャッシュから返す
        CharFont sameFont = factory.getFont("Arial", 12, "black");
        System.out.println("\n同じフォント再取得（キャッシュ使用）");
        sameFont.render('W', 0, 20);

        System.out.println("\n作成されたフォントオブジェクト数: " + factory.getCacheSize());
        System.out.println("（" + (text.length() + 2) + "回の描画に対して " + factory.getCacheSize() + " 個のオブジェクトを共有）");
    }
}
