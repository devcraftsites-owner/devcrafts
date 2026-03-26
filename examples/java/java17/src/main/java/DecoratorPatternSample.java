import java.io.BufferedInputStream;
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

    // デコレータの抽象基底クラス: TextProcessor を実装し、委譲先を保持する
    static abstract class TextProcessorDecorator implements TextProcessor {
        protected final TextProcessor wrapped; // 委譲先

        public TextProcessorDecorator(TextProcessor wrapped) {
            this.wrapped = wrapped;
        }
    }

    // 大文字変換デコレータ
    static class UpperCaseDecorator extends TextProcessorDecorator {
        public UpperCaseDecorator(TextProcessor wrapped) {
            super(wrapped);
        }

        @Override
        public String process(String text) {
            var result = wrapped.process(text);
            return result.toUpperCase();
        }
    }

    // 前後の空白除去デコレータ
    static class TrimDecorator extends TextProcessorDecorator {
        public TrimDecorator(TextProcessor wrapped) {
            super(wrapped);
        }

        @Override
        public String process(String text) {
            var result = wrapped.process(text);
            return result.trim();
        }
    }

    // ログ出力デコレータ: 処理前後にログを出力する
    static class LoggingDecorator extends TextProcessorDecorator {
        public LoggingDecorator(TextProcessor wrapped) {
            super(wrapped);
        }

        @Override
        public String process(String text) {
            System.out.println("[LOG] 処理開始: 入力=\"" + text + "\"");
            var result = wrapped.process(text);
            System.out.println("[LOG] 処理完了: 出力=\"" + result + "\"");
            return result;
        }
    }

    // プレフィックス付与デコレータ
    static class PrefixDecorator extends TextProcessorDecorator {
        private final String prefix;

        public PrefixDecorator(TextProcessor wrapped, String prefix) {
            super(wrapped);
            this.prefix = prefix;
        }

        @Override
        public String process(String text) {
            var result = wrapped.process(text);
            return prefix + result;
        }
    }

    // Java 17: record でテキスト処理の結果を保持する
    record ProcessResult(String original, String processed, int decoratorCount) {
        @Override
        public String toString() {
            return "ProcessResult{original=\"" + original
                    + "\", processed=\"" + processed
                    + "\", decoratorCount=" + decoratorCount + "}";
        }
    }

    public static void main(String[] args) throws IOException {
        System.out.println("=== Decorator パターン: テキスト処理（Java 17）===");

        // var でローカル変数の型宣言を省略（Java 17+）
        var plain = new PlainTextProcessor();
        System.out.println("基本: " + plain.process("  Hello, World!  "));

        System.out.println();

        var trimmed = new TrimDecorator(new PlainTextProcessor());
        System.out.println("Trim のみ: " + trimmed.process("  Hello, World!  "));

        System.out.println();

        var trimAndUpper = new UpperCaseDecorator(
                new TrimDecorator(
                        new PlainTextProcessor()));
        System.out.println("Trim + UpperCase: " + trimAndUpper.process("  Hello, World!  "));

        System.out.println();

        var full = new LoggingDecorator(
                new PrefixDecorator(
                        new UpperCaseDecorator(
                                new TrimDecorator(
                                        new PlainTextProcessor())),
                        "[INFO] "));
        var finalResult = full.process("  hello, java!  ");

        // record で処理結果を管理（Java 17+）
        var processResult = new ProcessResult(
                "  hello, java!  ",
                finalResult,
                4 // TrimDecorator, UpperCaseDecorator, PrefixDecorator, LoggingDecorator
        );
        System.out.println(processResult);

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
