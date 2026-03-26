import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * DP-03: Factory Method パターン（Java 8）
 *
 * Factory Method パターンは「オブジェクトの生成をサブクラスに委譲する」パターンです。
 * 親クラスは生成のインターフェースだけを定義し、
 * どのクラスを生成するかは各サブクラスが決定します。
 */
public class FactoryMethodSample {

    // ===== 生成するオブジェクトのインターフェース =====

    /**
     * レポートの共通インターフェース
     * Factory Method パターンにおける「Product（製品）」に相当します。
     */
    interface Report {
        /**
         * レポートを生成して文字列として返します。
         *
         * @param title   レポートのタイトル
         * @param content レポートの本文
         * @return 生成されたレポート文字列
         */
        String generate(String title, String content);
    }

    // ===== 各レポートの実装クラス（ConcreteProduct） =====

    /** PDF 形式のレポート */
    static class PdfReport implements Report {
        @Override
        public String generate(String title, String content) {
            return "[PDF] タイトル: " + title + " | 内容: " + content + " | 形式: Adobe PDF";
        }
    }

    /** HTML 形式のレポート */
    static class HtmlReport implements Report {
        @Override
        public String generate(String title, String content) {
            return "<html><head><title>" + title + "</title></head>"
                + "<body><p>" + content + "</p></body></html>";
        }
    }

    /** CSV 形式のレポート */
    static class CsvReport implements Report {
        @Override
        public String generate(String title, String content) {
            return "\"" + title + "\",\"" + content + "\"";
        }
    }

    // ===== ファクトリー抽象クラス（Creator） =====

    /**
     * レポートを生成するファクトリーの抽象クラス。
     * createReport() が Factory Method（生成を担う抽象メソッド）です。
     * process() はテンプレートとして共通処理を提供します。
     */
    static abstract class ReportFactory {

        /**
         * Factory Method: サブクラスが具体的な生成処理を実装します。
         * このメソッドをオーバーライドすることで、生成するクラスを切り替えます。
         *
         * @return 生成した Report オブジェクト
         */
        protected abstract Report createReport();

        /**
         * ファクトリーを使ってレポートを処理します（テンプレートメソッド）。
         * 生成から出力までの流れをここで定義します。
         *
         * @param title   タイトル
         * @param content 本文
         * @return 生成されたレポート文字列
         */
        public String process(String title, String content) {
            // サブクラスの createReport() を呼び出してオブジェクトを生成
            Report report = createReport();
            return report.generate(title, content);
        }
    }

    // ===== 具体的なファクトリー（ConcreteCreator） =====

    /** PDF レポートを生成するファクトリー */
    static class PdfReportFactory extends ReportFactory {
        @Override
        protected Report createReport() {
            return new PdfReport();
        }
    }

    /** HTML レポートを生成するファクトリー */
    static class HtmlReportFactory extends ReportFactory {
        @Override
        protected Report createReport() {
            return new HtmlReport();
        }
    }

    /** CSV レポートを生成するファクトリー */
    static class CsvReportFactory extends ReportFactory {
        @Override
        protected Report createReport() {
            return new CsvReport();
        }
    }

    // ===== Java 標準ライブラリの Factory Method 例 =====

    /**
     * Collections.emptyList() / singletonList() は Factory Method パターンの例です。
     * 呼び出し側は List 型として扱うだけでよく、内部の実装クラスを意識しません。
     */
    static void showStandardLibraryExamples() {
        // Collections.emptyList(): 空のリスト（変更不可）を返す Factory Method
        List<String> emptyList = Collections.emptyList();
        System.out.println("emptyList: " + emptyList + " (size=" + emptyList.size() + ")");

        // Collections.singletonList(): 1要素のリスト（変更不可）を返す Factory Method
        List<String> singleList = Collections.singletonList("Java");
        System.out.println("singleList: " + singleList + " (size=" + singleList.size() + ")");

        // Arrays.asList(): 配列から固定サイズのリストを返す Factory Method
        List<String> arrayList = Arrays.asList("Java 8", "Java 17", "Java 21");
        System.out.println("arrayList: " + arrayList + " (size=" + arrayList.size() + ")");
    }

    public static void main(String[] args) {
        System.out.println("=== Factory Method パターン ===");
        System.out.println();

        // 各ファクトリーでレポートを生成
        // 呼び出し側は ReportFactory 型として扱うだけでよい
        ReportFactory pdfFactory = new PdfReportFactory();
        ReportFactory htmlFactory = new HtmlReportFactory();
        ReportFactory csvFactory = new CsvReportFactory();

        String title = "月次売上レポート";
        String content = "2024年1月の売上合計は100万円でした。";

        System.out.println("[PDF ファクトリー]");
        System.out.println(pdfFactory.process(title, content));

        System.out.println();
        System.out.println("[HTML ファクトリー]");
        System.out.println(htmlFactory.process(title, content));

        System.out.println();
        System.out.println("[CSV ファクトリー]");
        System.out.println(csvFactory.process(title, content));

        System.out.println();
        System.out.println("=== Java 標準ライブラリの Factory Method 例 ===");
        showStandardLibraryExamples();
    }
}
