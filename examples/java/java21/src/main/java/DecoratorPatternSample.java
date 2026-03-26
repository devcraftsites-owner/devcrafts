import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.io.IOException;

public class DecoratorPatternSample {

    // テキスト処理のインターフェース
    interface TextProcessor {
        String process(String text);
    }

    // 基本実装: テキストをそのまま返す
    static class PlainTextProcessor implements TextProcessor {
        @Override
        public String process(String text) {
            return text;
        }
    }

    // デコレータの抽象基底クラス
    static abstract class TextProcessorDecorator implements TextProcessor {
        protected final TextProcessor wrapped;

        public TextProcessorDecorator(TextProcessor wrapped) {
            this.wrapped = wrapped;
        }
    }

    static class UpperCaseDecorator extends TextProcessorDecorator {
        public UpperCaseDecorator(TextProcessor wrapped) { super(wrapped); }

        @Override
        public String process(String text) {
            return wrapped.process(text).toUpperCase();
        }
    }

    static class TrimDecorator extends TextProcessorDecorator {
        public TrimDecorator(TextProcessor wrapped) { super(wrapped); }

        @Override
        public String process(String text) {
            return wrapped.process(text).trim();
        }
    }

    static class LoggingDecorator extends TextProcessorDecorator {
        public LoggingDecorator(TextProcessor wrapped) { super(wrapped); }

        @Override
        public String process(String text) {
            System.out.println("[LOG] 処理開始: 入力=\"" + text + "\"");
            var result = wrapped.process(text);
            System.out.println("[LOG] 処理完了: 出力=\"" + result + "\"");
            return result;
        }
    }

    static class PrefixDecorator extends TextProcessorDecorator {
        private final String prefix;

        public PrefixDecorator(TextProcessor wrapped, String prefix) {
            super(wrapped);
            this.prefix = prefix;
        }

        @Override
        public String process(String text) {
            return prefix + wrapped.process(text);
        }
    }

    // Java 21: sealed interface でデコレーションの種類を型安全に表現する
    sealed interface DecorationSpec
            permits DecorationSpec.UpperCase, DecorationSpec.Trim,
                    DecorationSpec.Logging, DecorationSpec.Prefix {
        record UpperCase() implements DecorationSpec {}
        record Trim() implements DecorationSpec {}
        record Logging() implements DecorationSpec {}
        record Prefix(String prefix) implements DecorationSpec {} // Prefix は prefix フィールドを持つ
    }

    // switch パターンマッチングで各デコレーション仕様を処理する（Java 21+）
    static String applyDecoration(String text, DecorationSpec spec) {
        return switch (spec) {
            case DecorationSpec.UpperCase() -> text.toUpperCase();
            case DecorationSpec.Trim() -> text.trim();
            case DecorationSpec.Logging() -> {
                System.out.println("[LOG] テキスト処理: \"" + text + "\"");
                yield text;
            }
            case DecorationSpec.Prefix(var prefix) -> prefix + text;
        };
    }

    // record で処理結果を保持する（Java 17+）
    record ProcessResult(String original, String processed, int decoratorCount) {}

    public static void main(String[] args) throws IOException {
        System.out.println("=== Decorator パターン: テキスト処理（Java 21）===");

        // 従来のデコレータチェーン
        var full = new LoggingDecorator(
                new PrefixDecorator(
                        new UpperCaseDecorator(
                                new TrimDecorator(
                                        new PlainTextProcessor())),
                        "[INFO] "));
        var chainResult = full.process("  hello, java!  ");
        System.out.println("チェーン結果: " + chainResult);

        System.out.println();
        System.out.println("=== sealed interface + switch パターンマッチング（Java 21+）===");

        // DecorationSpec を使って各デコレーションを個別に適用する
        String text = "  hello, java 21!  ";

        // 各仕様を switch パターンマッチングで処理する
        var specs = new DecorationSpec[]{
            new DecorationSpec.Trim(),
            new DecorationSpec.UpperCase(),
            new DecorationSpec.Prefix("[MSG] ")
        };

        String current = text;
        for (var spec : specs) {
            String before = current;
            current = applyDecoration(current, spec);
            System.out.println(spec.getClass().getSimpleName() + ": \"" + before + "\" → \"" + current + "\"");
        }

        var result = new ProcessResult(text, current, specs.length);
        System.out.println("結果: original=\"" + result.original()
                + "\", processed=\"" + result.processed()
                + "\", decoratorCount=" + result.decoratorCount());

        System.out.println();
        System.out.println("=== Java 標準ライブラリの Decorator 例 ===");

        var data = "Hello\nDecorator\nPattern";
        var bais = new ByteArrayInputStream(data.getBytes("UTF-8"));
        var reader = new BufferedReader(new InputStreamReader(bais, "UTF-8"));
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println("読み込み: " + line);
        }
        reader.close();
    }
}
