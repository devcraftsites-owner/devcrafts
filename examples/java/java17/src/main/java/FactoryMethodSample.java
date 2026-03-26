import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * DP-03: Factory Method パターン（Java 17）
 *
 * Java 17 では var（型推論）と record が使用できます。
 * record を使うことで、値オブジェクトを簡潔に定義できます。
 */
public class FactoryMethodSample {

    // ===== 生成するオブジェクトのインターフェース =====

    /**
     * レポートの共通インターフェース（Java 8 版と同じ）
     */
    interface Report {
        String generate(String title, String content);
    }

    // ===== 各レポートの実装クラス =====

    static class PdfReport implements Report {
        @Override
        public String generate(String title, String content) {
            return "[PDF] タイトル: " + title + " | 内容: " + content + " | 形式: Adobe PDF";
        }
    }

    static class HtmlReport implements Report {
        @Override
        public String generate(String title, String content) {
            return "<html><head><title>" + title + "</title></head>"
                + "<body><p>" + content + "</p></body></html>";
        }
    }

    static class CsvReport implements Report {
        @Override
        public String generate(String title, String content) {
            return "\"" + title + "\",\"" + content + "\"";
        }
    }

    // ===== Java 17: record でレポートタイプを表現 =====

    /**
     * レポートタイプを表す record（Java 17+）。
     * record は不変データクラスで、コンストラクタ・getterを自動生成します。
     */
    record ReportType(String type, String title) {}

    // ===== ファクトリー抽象クラス =====

    static abstract class ReportFactory {

        protected abstract Report createReport();

        public String process(String title, String content) {
            var report = createReport(); // var で型推論（Java 17+）
            return report.generate(title, content);
        }
    }

    // ===== 具体的なファクトリー =====

    static class PdfReportFactory extends ReportFactory {
        @Override
        protected Report createReport() {
            return new PdfReport();
        }
    }

    static class HtmlReportFactory extends ReportFactory {
        @Override
        protected Report createReport() {
            return new HtmlReport();
        }
    }

    static class CsvReportFactory extends ReportFactory {
        @Override
        protected Report createReport() {
            return new CsvReport();
        }
    }

    // ===== Java 標準ライブラリの Factory Method 例 =====

    static void showStandardLibraryExamples() {
        // var でローカル変数の型推論（Java 17+）
        var emptyList = Collections.emptyList();
        System.out.println("emptyList: " + emptyList + " (size=" + emptyList.size() + ")");

        var singleList = Collections.singletonList("Java");
        System.out.println("singleList: " + singleList + " (size=" + singleList.size() + ")");

        var arrayList = Arrays.asList("Java 8", "Java 17", "Java 21");
        System.out.println("arrayList: " + arrayList + " (size=" + arrayList.size() + ")");
    }

    public static void main(String[] args) {
        System.out.println("=== Factory Method パターン（Java 17）===");
        System.out.println();

        // var でローカル変数の型推論
        var pdfFactory = new PdfReportFactory();
        var htmlFactory = new HtmlReportFactory();
        var csvFactory = new CsvReportFactory();

        // record でレポートタイプを定義
        var reportType = new ReportType("PDF", "月次売上レポート");
        System.out.println("レポートタイプ: " + reportType.type() + " / タイトル: " + reportType.title());
        System.out.println();

        String content = "2024年1月の売上合計は100万円でした。";

        System.out.println("[PDF ファクトリー]");
        System.out.println(pdfFactory.process(reportType.title(), content));

        System.out.println();
        System.out.println("[HTML ファクトリー]");
        System.out.println(htmlFactory.process(reportType.title(), content));

        System.out.println();
        System.out.println("[CSV ファクトリー]");
        System.out.println(csvFactory.process(reportType.title(), content));

        System.out.println();
        System.out.println("=== Java 標準ライブラリの Factory Method 例 ===");
        showStandardLibraryExamples();
    }
}
