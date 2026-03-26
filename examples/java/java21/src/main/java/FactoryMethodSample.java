import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * DP-03: Factory Method パターン（Java 21）
 *
 * Java 21 では sealed interface と switch パターンマッチングを使って、
 * レポートの種類を型安全に表現し、網羅的な分岐処理を記述できます。
 */
public class FactoryMethodSample {

    // ===== 生成するオブジェクトのインターフェース =====

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

    // ===== Java 21: sealed interface でレポート仕様を表現 =====

    /**
     * レポートの仕様を表す sealed interface（Java 21+）。
     * permits で許可するサブタイプを明示することで、
     * switch 式で全パターンを網羅的に処理できます。
     */
    sealed interface ReportSpec permits ReportSpec.Pdf, ReportSpec.Html, ReportSpec.Csv {
        /** PDF レポートの仕様 */
        record Pdf(String pageSize, boolean compressed) implements ReportSpec {}
        /** HTML レポートの仕様 */
        record Html(String cssClass, boolean responsive) implements ReportSpec {}
        /** CSV レポートの仕様 */
        record Csv(char delimiter, boolean withHeader) implements ReportSpec {}
    }

    // ===== ファクトリー抽象クラス =====

    static abstract class ReportFactory {
        protected abstract Report createReport();

        public String process(String title, String content) {
            var report = createReport();
            return report.generate(title, content);
        }
    }

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

    // ===== switch パターンマッチングで仕様に応じたファクトリーを取得 =====

    /**
     * ReportSpec に応じた ReportFactory を返します。
     * sealed interface のおかげで switch が全パターンを網羅しているかコンパイル時に確認されます。
     *
     * @param spec レポートの仕様
     * @return 対応するファクトリー
     */
    static ReportFactory createFactory(ReportSpec spec) {
        return switch (spec) {
            // record deconstruction パターン: フィールドを直接取り出せる（Java 21+）
            case ReportSpec.Pdf(var pageSize, var compressed) -> {
                System.out.println("  PDF 設定: ページサイズ=" + pageSize + ", 圧縮=" + compressed);
                yield new PdfReportFactory();
            }
            case ReportSpec.Html(var cssClass, var responsive) -> {
                System.out.println("  HTML 設定: CSSクラス=" + cssClass + ", レスポンシブ=" + responsive);
                yield new HtmlReportFactory();
            }
            case ReportSpec.Csv(var delimiter, var withHeader) -> {
                System.out.println("  CSV 設定: 区切り文字=" + delimiter + ", ヘッダー=" + withHeader);
                yield new CsvReportFactory();
            }
        };
    }

    static void showStandardLibraryExamples() {
        var emptyList = Collections.emptyList();
        System.out.println("emptyList: " + emptyList + " (size=" + emptyList.size() + ")");

        var singleList = Collections.singletonList("Java");
        System.out.println("singleList: " + singleList + " (size=" + singleList.size() + ")");

        var arrayList = Arrays.asList("Java 8", "Java 17", "Java 21");
        System.out.println("arrayList: " + arrayList + " (size=" + arrayList.size() + ")");
    }

    public static void main(String[] args) {
        System.out.println("=== Factory Method パターン（Java 21）===");
        System.out.println();

        String title = "月次売上レポート";
        String content = "2024年1月の売上合計は100万円でした。";

        // sealed interface + switch パターンマッチングで型安全にファクトリーを選択
        System.out.println("=== sealed interface + switch パターンマッチング（Java 21+）===");

        var pdfSpec = new ReportSpec.Pdf("A4", true);
        System.out.println("[PDF 仕様]");
        var pdfFactory = createFactory(pdfSpec);
        System.out.println(pdfFactory.process(title, content));

        System.out.println();
        var htmlSpec = new ReportSpec.Html("report-card", true);
        System.out.println("[HTML 仕様]");
        var htmlFactory = createFactory(htmlSpec);
        System.out.println(htmlFactory.process(title, content));

        System.out.println();
        var csvSpec = new ReportSpec.Csv(',', true);
        System.out.println("[CSV 仕様]");
        var csvFactory = createFactory(csvSpec);
        System.out.println(csvFactory.process(title, content));

        System.out.println();
        System.out.println("=== Java 標準ライブラリの Factory Method 例 ===");
        showStandardLibraryExamples();
    }
}
