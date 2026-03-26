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
            // 委譲先の処理結果を大文字に変換する
            String result = wrapped.process(text);
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
            // 委譲先の処理結果の前後空白を除去する
            String result = wrapped.process(text);
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
            String result = wrapped.process(text);
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
            // 委譲先の処理結果にプレフィックスを付与する
            String result = wrapped.process(text);
            return prefix + result;
        }
    }

    public static void main(String[] args) throws IOException {
        System.out.println("=== Decorator パターン: テキスト処理 ===");

        // 基本実装だけを使う場合
        TextProcessor plain = new PlainTextProcessor();
        System.out.println("基本: " + plain.process("  Hello, World!  "));

        System.out.println();

        // デコレータを1つ追加: TrimDecorator
        TextProcessor trimmed = new TrimDecorator(new PlainTextProcessor());
        System.out.println("Trim のみ: " + trimmed.process("  Hello, World!  "));

        System.out.println();

        // デコレータをチェーン: Trim → UpperCase
        TextProcessor trimAndUpper = new UpperCaseDecorator(
                new TrimDecorator(
                        new PlainTextProcessor()));
        System.out.println("Trim + UpperCase: " + trimAndUpper.process("  Hello, World!  "));

        System.out.println();

        // デコレータをチェーン: Prefix → Trim → UpperCase（ログあり）
        TextProcessor full = new LoggingDecorator(
                new PrefixDecorator(
                        new UpperCaseDecorator(
                                new TrimDecorator(
                                        new PlainTextProcessor())),
                        "[INFO] "));
        String result = full.process("  hello, java!  ");
        System.out.println("最終結果: " + result);

        System.out.println();
        System.out.println("=== Java 標準ライブラリの Decorator 例 ===");

        // BufferedReader(InputStreamReader(...)) は Decorator パターンの実例
        // InputStreamReader: バイトストリーム → 文字ストリームへ変換
        // BufferedReader: バッファリングを追加
        String data = "Hello\nDecorator\nPattern";
        ByteArrayInputStream bais = new ByteArrayInputStream(data.getBytes("UTF-8"));
        BufferedReader reader = new BufferedReader(new InputStreamReader(bais, "UTF-8"));
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println("読み込み: " + line);
        }
        reader.close();

        // BufferedInputStream: バッファリングを追加するデコレータ
        ByteArrayInputStream rawStream = new ByteArrayInputStream(new byte[]{72, 101, 108, 108, 111});
        BufferedInputStream buffered = new BufferedInputStream(rawStream);
        System.out.println("BufferedInputStream の available(): " + buffered.available());
        buffered.close();
    }
}
