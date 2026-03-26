import java.util.HashMap;
import java.util.Map;

public class FlyweightPatternSample {

    // Java 17: record で Flyweight を不変オブジェクトとして定義
    // record はフィールドが final かつ equals/hashCode/toString が自動生成される
    record CharFont(String fontFamily, int fontSize, String color) {

        // コンパクトコンストラクタ: 作成時にログ出力
        CharFont {
            System.out.println("  新しいフォントオブジェクトを作成: "
                    + fontFamily + "/" + fontSize + "pt/" + color);
        }

        // 外部状態（character: 文字、x/y: 描画位置）を受け取って描画
        void render(char character, int x, int y) {
            System.out.println("  文字'" + character + "' を位置(" + x + "," + y + ")に描画"
                    + " [" + fontFamily + " " + fontSize + "pt " + color + "]");
        }
    }

    // Flyweight Factory: フォントオブジェクトのキャッシュ・共有管理
    static class FontFactory {
        private final Map<String, CharFont> cache = new HashMap<>();

        CharFont getFont(String fontFamily, int fontSize, String color) {
            // Java 10+ の var でキー変数の型宣言を省略
            var key = fontFamily + "_" + fontSize + "_" + color;
            // computeIfAbsent: キーがなければ生成してキャッシュ
            return cache.computeIfAbsent(key, k -> new CharFont(fontFamily, fontSize, color));
        }

        int getCacheSize() {
            return cache.size();
        }
    }

    public static void main(String[] args) {
        var factory = new FontFactory();

        System.out.println("=== テキスト描画開始（Java 17）===");
        var text = "Hello";
        for (int i = 0; i < text.length(); i++) {
            // 全文字で同じフォントを共有 → 1つのオブジェクトのみ作成される
            var font = factory.getFont("Arial", 12, "black");
            font.render(text.charAt(i), i * 10, 0);
        }

        System.out.println("\n=== 別フォントのテキスト ===");
        var boldFont = factory.getFont("Arial", 16, "red");
        boldFont.render('!', 50, 0);

        // 同じフォントを再取得 → キャッシュから返す
        var sameFont = factory.getFont("Arial", 12, "black");
        System.out.println("\n同じフォント再取得（キャッシュ使用）");
        sameFont.render('W', 0, 20);

        System.out.println("\n作成されたフォントオブジェクト数: " + factory.getCacheSize());
        System.out.println("（" + (text.length() + 2) + "回の描画に対して " + factory.getCacheSize() + " 個のオブジェクトを共有）");

        // Java 17: record は equals() が自動実装されるため同一キーの比較が容易
        var font1 = factory.getFont("Arial", 12, "black");
        var font2 = factory.getFont("Arial", 12, "black");
        System.out.println("\nキャッシュから取得した同じフォントは同一インスタンス: " + (font1 == font2));
    }
}
