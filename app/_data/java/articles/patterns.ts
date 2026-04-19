import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "singleton-pattern",
    title: "Java Singleton パターンの安全な実装方法と3方式の比較",
    categorySlug: "patterns",
    summary: "Eager・Holder・Enum の3方式を比較し、スレッド安全で壊れにくい Singleton を選ぶ。",
    version: "Java 17",
    tags: ["Singleton", "GoF", "生成パターン", "スレッドセーフ", "enum"],
    apiNames: ["Runtime.getRuntime", "enum", "volatile", "synchronized"],
    description: "Singleton パターンを Java で安全に実装する方法を Eager・Holder・Enum の3方式で比較し、スレッド安全性とシリアライズ耐性を整理する。",
    lead: "アプリケーション全体でインスタンスを1つだけ保持したい場面は、設定管理やコネクションプール、ロガーなど業務コードの中にも少なくありません。Singleton パターンはその要求に応えるもっとも基本的な設計ですが、正しく実装しないとマルチスレッド環境で複数インスタンスが生まれたり、シリアライズで別オブジェクトが復元されたりといった問題が起きます。Eager Initialization・Initialization-on-demand Holder・Enum Singleton の3方式を取り上げ、スレッド安全性・遅延初期化・シリアライズ耐性を比較した。double-checked locking が必要になるケースとその落とし穴、Java 標準ライブラリでの Singleton 実例（Runtime.getRuntime）も確認し、実務で迷わない選択基準を示す。",
    useCases: [
      "アプリケーション設定を1つのインスタンスに集約し、どのクラスからも同じ値を参照できるようにする",
      "DB コネクションプールの管理クラスを Singleton にして、接続の生成・破棄を一元管理する",
      "ログ出力を統一するロガーを Singleton で提供し、出力先の切り替えを一箇所で制御する",
    ],
    cautions: [
      "Lazy Initialization を synchronized なしで書くと、マルチスレッドで2つ以上のインスタンスが生まれる。テスト環境では再現しにくいため本番で初めて発覚しやすい",
      "Double-Checked Locking では volatile 修飾子が必須。付け忘れると命令の並び替えによって初期化途中のオブジェクトが返る可能性がある",
      "Serializable を implements した Singleton は、デシリアライズ時に新しいインスタンスが生まれる。readResolve() で INSTANCE を返すか、Enum Singleton を使えば回避できる",
      "リフレクションで private コンストラクタを呼び出されると Singleton が壊れる。Enum Singleton はこの攻撃にも耐性がある",
      "実務で見かける誤実装の多くは「volatile なし双重チェック」か「static フィールドだから安全と思ってのスレッド安全性の見落とし」。Singleton を新規実装する場合は Holder パターンか Enum Singleton を選ぶのが最も安全。",
    ],
    relatedArticleSlugs: ["factory-method"],
    versionCoverage: {
      java8: "Holder パターンと Enum Singleton が基本。var が使えないため getInstance() の戻り値を明示的に型宣言する。",
      java17: "var による型推論で呼び出しコードが簡潔になる。record と組み合わせた設定値の保持も選択肢に入る。",
      java21: "Enum Singleton と record を組み合わせると、型安全で不変な設定値オブジェクトを保持する Singleton が自然に書ける。",
      java8Code: `// Java 8: 型を明示して getInstance を呼ぶ
EagerSingleton s1 = EagerSingleton.getInstance();
EagerSingleton s2 = EagerSingleton.getInstance();
System.out.println(s1 == s2); // true

// Enum Singleton
EnumSingleton.INSTANCE.increment();`,
      java17Code: `// Java 17: var で型推論
var s1 = EagerSingleton.getInstance();
var s2 = EagerSingleton.getInstance();
System.out.println(s1 == s2); // true

// Enum Singleton + record で設定値を構造化
EnumSingleton.INSTANCE.increment();`,
      java21Code: `// Java 21: Enum Singleton + record で設定値を型安全に保持
enum AppConfig {
    INSTANCE;
    record Config(String env, int timeoutSec, boolean debug) {}
    private Config config = new Config("prod", 30, false);

    public Config getConfig() { return config; }
    public void updateConfig(Config c) { this.config = c; }
}
// 呼び出し側: record のコンポーネントで設定値にアクセス
var cfg = AppConfig.INSTANCE.getConfig();
System.out.printf("env=%s timeout=%ds%n", cfg.env(), cfg.timeoutSec());`,
    },
    libraryComparison: [
      { name: "標準 API（Enum Singleton / Holder）", whenToUse: "依存なしでスレッド安全かつシリアライズ耐性のある Singleton を実装したいとき。", tradeoff: "DI コンテナを使うプロジェクトでは、フレームワーク側でスコープ管理するほうが自然な場合がある。" },
      { name: "Spring（@Component + @Scope）", whenToUse: "DI コンテナでライフサイクルを管理し、テスト時にモックへ差し替えたいとき。", tradeoff: "Spring への依存が前提になるため、ライブラリ層やユーティリティでは使いにくい。" },
      { name: "Google Guice（@Singleton）", whenToUse: "軽量な DI コンテナで Singleton スコープを宣言的に管理したいとき。", tradeoff: "Guice の導入自体が必要になる。小規模プロジェクトではオーバースペックになりやすい。" },
    ],
    faq: [
      { question: "Enum Singleton と Holder パターンのどちらを使うべきですか。", answer: "Effective Java（Item 3）でも推奨されている通り、一般に Enum Singleton が最も安全とされています。シリアライズ・リフレクション攻撃にも耐性があります。ただし継承が必要な場合は Holder パターンを選んでください。" },
      { question: "Singleton はテストしにくいと聞きますが対策はありますか。", answer: "Singleton 自体にインターフェースを切り、テスト時はモック実装に差し替える方法が一般的です。DI コンテナを使えばフレームワーク側で切り替えられます。" },
      { question: "Spring の Bean はデフォルトで Singleton ですが、自前の Singleton は不要ですか。", answer: "Spring 管理下のクラスなら @Component で十分です。ただし、DI コンテナ外で動くユーティリティやライブラリ層では、自前の Singleton が依然有用です。" },
    ],
    codeTitle: "SingletonPatternSample.java",
    codeSample: `public class SingletonPatternSample {

    // Holder パターン: 初回アクセス時に JVM が安全に初期化
    static class AppConfig {
        private final String dbUrl;
        private final int maxPool;

        private AppConfig() {
            this.dbUrl = "jdbc:mysql://localhost:3306/app";
            this.maxPool = 10;
        }

        private static class Holder {
            static final AppConfig INSTANCE = new AppConfig();
        }

        public static AppConfig getInstance() {
            return Holder.INSTANCE;
        }

        public String getDbUrl() { return dbUrl; }
        public int getMaxPool() { return maxPool; }
    }

    // Enum Singleton: 最もシンプルかつ安全
    enum Logger {
        INSTANCE;

        public void info(String msg) {
            System.out.println("[INFO] " + msg);
        }

        public void error(String msg) {
            System.out.println("[ERROR] " + msg);
        }
    }

    public static void main(String[] args) {
        // Holder パターン
        var config1 = AppConfig.getInstance();
        var config2 = AppConfig.getInstance();
        System.out.println("同一インスタンス: " + (config1 == config2));
        System.out.println("DB URL: " + config1.getDbUrl());

        // Enum Singleton
        Logger.INSTANCE.info("アプリ起動");
        Logger.INSTANCE.error("接続タイムアウト");

        // Java 標準ライブラリの Singleton 例
        var rt = Runtime.getRuntime();
        System.out.println("最大メモリ: " + rt.maxMemory() / 1024 / 1024 + " MB");
    }
}`,
  },
{
    slug: "factory-method",
    title: "Java Factory Method パターンで生成を委譲する",
    categorySlug: "patterns",
    summary: "生成処理をサブクラスに委譲し、呼び出し側を具象クラスから切り離す Factory Method の実装。",
    version: "Java 17",
    tags: ["Factory Method", "GoF", "生成パターン", "interface", "ポリモーフィズム"],
    apiNames: ["Collections.emptyList", "Collections.singletonList", "Arrays.asList", "List.of"],
    description: "Factory Method パターンを Java で実装し、生成ロジックの分離とテスト容易性を高める方法を外部ライブラリ不要で Java 8/17/21 対応で整理する。",
    lead: "オブジェクトの生成を呼び出し側に直接 new させると、具象クラスへの依存が広がり、出力形式の追加や切り替えのたびに修正箇所が増えます。Factory Method パターンは、生成処理をサブクラスやメソッドに委譲することで、呼び出し側は Product インターフェースだけを知っていれば済む構造を作ります。この記事では、帳票出力（PDF・HTML・CSV）を題材に Factory Method の基本構造を示し、Java 標準ライブラリの Collections.emptyList や List.of が同じ考え方で設計されていることも確認します。Abstract Factory や Builder との使い分け基準も整理するので、パターン選択で迷ったときの判断材料にしてください。",
    useCases: [
      "帳票の出力形式（PDF / HTML / CSV）を設定値で切り替え、出力ロジックを呼び出し側から隠蔽する",
      "通知チャネル（メール / Slack / SMS）をファクトリーで切り替え、送信処理の追加時に既存コードを変更しない",
      "テスト時にモックオブジェクトを返すファクトリーに差し替え、外部依存なしでユニットテストを実行する",
    ],
    cautions: [
      "ファクトリーのサブクラスが増えすぎると見通しが悪くなる。生成対象が少数なら static メソッドや enum ベースの簡易ファクトリーで十分な場合がある",
      "Factory Method は生成する「1種類の Product」を切り替えるパターン。関連する複数の Product をまとめて生成するなら Abstract Factory を検討する",
      "ファクトリーの戻り値型を具象クラスにすると委譲の効果が薄れる。必ず Product インターフェースで返すこと",
    ],
    relatedArticleSlugs: ["abstract-factory", "builder-pattern"],
    versionCoverage: {
      java8: "ファクトリーの戻り値やローカル変数に型を明示する必要がある。record が使えないため、メタ情報は通常クラスで保持する。",
      java17: "var による型推論と record でファクトリーの呼び出しコードが簡潔になる。record をメタ情報の保持に使える。",
      java21: "sealed interface + switch パターンマッチングで、仕様オブジェクトに応じたファクトリーの選択を網羅的かつ型安全に記述できる。",
      java8Code: `// Java 8: 型を明示してファクトリーを使う
ReportFactory factory = new PdfReportFactory();
Report report = factory.createReport();
String result = report.generate("月次", "売上100万");`,
      java17Code: `// Java 17: var + record でメタ情報を付与
var factory = new PdfReportFactory();
var report = factory.createReport();
record ReportType(String type, String title) {}
var meta = new ReportType("PDF", "月次レポート");`,
      java21Code: `// Java 21: sealed interface + switch で網羅的に選択
sealed interface ReportSpec
        permits ReportSpec.Pdf, ReportSpec.Html {
    record Pdf(String size) implements ReportSpec {}
    record Html(String css) implements ReportSpec {}
}
ReportFactory f = switch (spec) {
    case ReportSpec.Pdf p -> new PdfReportFactory();
    case ReportSpec.Html h -> new HtmlReportFactory();
};`,
    },
    libraryComparison: [
      { name: "標準 API（interface + サブクラス）", whenToUse: "生成対象の種類が限られ、切り替えロジックを自前で管理したいとき。", tradeoff: "生成対象が増えるとサブクラスも比例して増える。" },
      { name: "Spring（@Bean / @Configuration）", whenToUse: "DI コンテナで Bean 生成を宣言的に管理したいとき。", tradeoff: "Spring 依存が前提になり、ライブラリ層では使いにくい。" },
      { name: "MapStruct", whenToUse: "DTO 変換の生成コードを自動化したいとき。", tradeoff: "Factory Method の設計思想とは用途が異なる。汎用の生成パターンには向かない。" },
    ],
    faq: [
      { question: "Factory Method と Abstract Factory の違いは何ですか。", answer: "Factory Method は1種類の Product の生成をサブクラスに委譲します。Abstract Factory は関連する複数の Product をまとめて生成するファクトリーのインターフェースを定義します。" },
      { question: "static メソッドで生成するのと何が違いますか。", answer: "static ファクトリーメソッドは Simple Factory と呼ばれ、GoF の Factory Method とは別物です。サブクラスによるオーバーライドが不要なら static メソッドで十分です。" },
      { question: "Java 標準ライブラリにも Factory Method はありますか。", answer: "Collections.emptyList()、List.of()、Calendar.getInstance() などが典型例です。呼び出し側は内部の実装クラスを意識せずにオブジェクトを受け取れます。" },
    ],
    codeTitle: "FactoryMethodSample.java",
    codeSample: `import java.util.List;

public class FactoryMethodSample {

    // Product インターフェース
    interface Report {
        String generate(String title, String content);
    }

    // 具象 Product
    static class PdfReport implements Report {
        @Override
        public String generate(String title, String content) {
            return "[PDF] " + title + ": " + content;
        }
    }

    static class CsvReport implements Report {
        @Override
        public String generate(String title, String content) {
            return "\\"" + title + "\\",\\"" + content + "\\"";
        }
    }

    // Creator 抽象クラス
    static abstract class ReportFactory {
        protected abstract Report createReport();

        public String process(String title, String content) {
            var report = createReport();
            return report.generate(title, content);
        }
    }

    // 具象 Creator
    static class PdfReportFactory extends ReportFactory {
        @Override
        protected Report createReport() { return new PdfReport(); }
    }

    static class CsvReportFactory extends ReportFactory {
        @Override
        protected Report createReport() { return new CsvReport(); }
    }

    public static void main(String[] args) {
        var factories = List.of(
            new PdfReportFactory(),
            new CsvReportFactory()
        );
        for (var factory : factories) {
            System.out.println(factory.process("月次売上", "100万円"));
        }

        // 標準ライブラリの Factory Method 例
        var list = List.of("Java 8", "Java 17", "Java 21");
        System.out.println("List.of: " + list);
    }
}`,
  },
{
    slug: "abstract-factory",
    title: "Java Abstract Factory で関連オブジェクトをまとめて生成する",
    categorySlug: "patterns",
    summary: "関連する複数の Product をファクトリーインターフェースでまとめて生成し、DB 切替などに対応する。",
    version: "Java 17",
    tags: ["Abstract Factory", "GoF", "生成パターン", "interface", "DB切替"],
    apiNames: ["interface", "record"],
    description: "Abstract Factory パターンで関連オブジェクト群を一貫して生成し、環境差異や製品ファミリの切り替えを安全に行う方法を Java 8/17/21 対応で整理する。",
    lead: "Factory Method がひとつの Product の生成を切り替えるのに対し、Abstract Factory は「関連する複数の Product をまとめて」生成するインターフェースを定義します。たとえば DB 接続先を MySQL と PostgreSQL で切り替えるとき、Connection と Statement を別々のファクトリーで生成すると組み合わせの不整合が起きかねません。Abstract Factory を使えば、ファクトリーを差し替えるだけで関連するオブジェクト群が一貫して切り替わります。この記事では DB アクセス層を題材に Abstract Factory の構造を示し、Factory Method との使い分け基準、Java 17 の record を活用した簡潔な製品クラス定義、Java 21 の sealed interface による型安全な製品分岐を整理します。",
    useCases: [
      "開発環境と本番環境で DB（MySQL / PostgreSQL）を切り替え、Connection・Statement を一貫して生成する",
      "UI テーマ（ライト / ダーク）に応じたボタン・テキスト・背景のスタイルセットをまとめて生成する",
      "帳票出力で「和文セット（明朝 + 縦書き + 和暦）」と「英文セット（ゴシック + 横書き + 西暦）」を切り替える",
    ],
    cautions: [
      "新しい Product の種類を追加すると、すべての具象ファクトリーにメソッドを追加する必要がある。Product の種類が頻繁に変わる場合は設計の見直しを検討する",
      "Factory Method で十分な場面に Abstract Factory を適用すると、インターフェースとクラスの数が不要に増える。関連する Product が2つ以上あるかどうかが判断基準",
      "具象ファクトリーの選択ロジック自体を Factory Method や設定ファイルで切り替えるケースが多い。ファクトリーの生成方法も設計に含めること",
    ],
    relatedArticleSlugs: ["factory-method", "builder-pattern"],
    versionCoverage: {
      java8: "具象製品クラスを通常のクラスで定義する。フィールド、コンストラクタ、toString を手書きする必要がある。",
      java17: "record で具象製品を定義すると、コンストラクタ・getter・equals・toString が自動生成される。var との併用でクライアントコードも簡潔。",
      java21: "sealed interface で製品の型を限定し、switch パターンマッチングで製品種別ごとの処理を網羅的に記述できる。",
      java8Code: `// Java 8: 具象製品を通常のクラスで定義
static class MySqlConnection implements DbConnection {
    @Override
    public String connect() {
        return "MySQL に接続";
    }
}
// クライアント側も型を明示
DbConnection conn = factory.createConnection();`,
      java17Code: `// Java 17: record で製品を簡潔に定義
record MySqlConnection() implements DbConnection {
    @Override
    public String connect() {
        return "MySQL に接続";
    }
}
// var で型推論
var conn = factory.createConnection();`,
      java21Code: `// Java 21: sealed interface で製品を型安全に限定
sealed interface DbProduct
        permits DbProduct.Connection, DbProduct.Statement {
    record Connection(String db, String url) implements DbProduct {}
    record Statement(String db) implements DbProduct {}
}
// switch パターンマッチングで分岐
String desc = switch (product) {
    case DbProduct.Connection c -> c.connect();
    case DbProduct.Statement s -> s.executeQuery(sql);
};`,
    },
    libraryComparison: [
      { name: "標準 API（interface + record）", whenToUse: "製品ファミリの種類が固定的で、切り替えロジックを自前で管理するとき。", tradeoff: "具象ファクトリーの数が製品ファミリに比例して増える。" },
      { name: "Spring Profiles", whenToUse: "環境ごとの Bean 定義を Spring の Profile 機能で切り替えるとき。", tradeoff: "Spring 依存が前提。ライブラリ層では使えない。" },
      { name: "SPI（ServiceLoader）", whenToUse: "JAR 単位でファクトリー実装を差し替え、プラグイン構成にしたいとき。", tradeoff: "設定ファイル（META-INF/services）の管理が必要。小規模なら過剰設計になりやすい。" },
    ],
    faq: [
      { question: "Abstract Factory と Factory Method はどちらを先に学ぶべきですか。", answer: "Factory Method が基本です。1種類の Product の生成委譲を理解してから、複数 Product をまとめる Abstract Factory に進むとスムーズです。" },
      { question: "Abstract Factory の具象ファクトリーはどう切り替えますか。", answer: "設定ファイルや環境変数で具象ファクトリーのクラス名を指定し、リフレクションやマップで切り替えるのが一般的です。DI コンテナを使うプロジェクトではプロファイルで管理します。" },
      { question: "Product を1つしか持たないのに Abstract Factory を使ってもよいですか。", answer: "Product が1つなら Factory Method で十分です。Abstract Factory は関連する複数の Product を一貫して生成する必要がある場合に使います。" },
    ],
    codeTitle: "AbstractFactoryPatternSample.java",
    codeSample: `public class AbstractFactoryPatternSample {

    // 抽象製品
    interface DbConnection {
        String connect();
    }

    interface DbStatement {
        String executeQuery(String sql);
    }

    // 抽象ファクトリー
    interface DbFactory {
        DbConnection createConnection();
        DbStatement createStatement();
    }

    // 具象製品（Java 17: record で簡潔に定義）
    record MySqlConnection() implements DbConnection {
        @Override
        public String connect() {
            return "MySQL に接続（jdbc:mysql://localhost:3306/mydb）";
        }
    }

    record MySqlStatement() implements DbStatement {
        @Override
        public String executeQuery(String sql) {
            return "MySQL で実行: " + sql;
        }
    }

    record PostgreSqlConnection() implements DbConnection {
        @Override
        public String connect() {
            return "PostgreSQL に接続（jdbc:postgresql://localhost:5432/mydb）";
        }
    }

    record PostgreSqlStatement() implements DbStatement {
        @Override
        public String executeQuery(String sql) {
            return "PostgreSQL で実行: " + sql;
        }
    }

    // 具象ファクトリー
    static class MySqlFactory implements DbFactory {
        @Override
        public DbConnection createConnection() { return new MySqlConnection(); }
        @Override
        public DbStatement createStatement() { return new MySqlStatement(); }
    }

    static class PostgreSqlFactory implements DbFactory {
        @Override
        public DbConnection createConnection() { return new PostgreSqlConnection(); }
        @Override
        public DbStatement createStatement() { return new PostgreSqlStatement(); }
    }

    // クライアント: ファクトリーだけに依存
    static void runDbOperation(DbFactory factory) {
        var conn = factory.createConnection();
        var stmt = factory.createStatement();
        System.out.println(conn.connect());
        System.out.println(stmt.executeQuery("SELECT * FROM users"));
    }

    public static void main(String[] args) {
        System.out.println("=== MySQL ===");
        runDbOperation(new MySqlFactory());

        System.out.println("\\n=== PostgreSQL ===");
        runDbOperation(new PostgreSqlFactory());
    }
}`,
  },
{
    slug: "builder-pattern",
    title: "Java Builder パターンで複雑なオブジェクト生成を整理する",
    categorySlug: "patterns",
    summary: "引数が多いコンストラクタを Builder に置き換え、必須・任意の区別と不変オブジェクトの生成を両立する。",
    version: "Java 17",
    tags: ["Builder", "GoF", "生成パターン", "不変オブジェクト", "メソッドチェーン"],
    apiNames: ["StringBuilder", "HttpClient.newBuilder", "ProcessBuilder"],
    description: "Builder パターンで引数過多のコンストラクタを整理し、必須フィールドの強制と不変オブジェクト生成を両立する実装方法を Java 8/17/21 対応で示す。",
    lead: "コンストラクタの引数が5つ6つと増えていくと、呼び出し側で「何番目の引数が何なのか」が分からなくなります。順序を間違えてもコンパイルが通る型が同じ引数（String が3つ並ぶなど）は特に危険です。Builder パターンは、名前付きメソッドで段階的にフィールドを設定し、最後に build() で不変オブジェクトを生成する構造を作ります。必須フィールドは Builder のコンストラクタで強制し、任意フィールドにはデフォルト値を設定できるため、呼び出し側のコードが自己文書化されます。HTTP リクエストとメールメッセージを題材に Builder パターンの基本構造を示し、Java 標準ライブラリの StringBuilder や HttpClient.newBuilder との対応関係も確認した。",
    useCases: [
      "HTTP リクエストの URL・メソッド・ヘッダー・ボディ・タイムアウトを段階的に設定し、不変のリクエストオブジェクトを生成する",
      "メール送信で宛先（必須）・CC・BCC・件名・本文・添付ファイル（任意）を Builder で組み立てる",
      "検索条件オブジェクト（キーワード・日付範囲・ソート順・ページサイズ）を Builder で構築し、条件の組み合わせを柔軟に表現する",
    ],
    cautions: [
      "Builder のフィールドを mutable にしたまま build() 後も変更できると、生成済みオブジェクトの不変性が壊れる。build() 後の Builder 再利用を禁止するか、フィールドを final にする",
      "必須フィールドの検証は build() メソッド内で行うのが確実。Builder のコンストラクタで強制する方法もあるが、引数が増えると結局テレスコーピングコンストラクタの問題が再発する",
      "Builder パターンはフィールドが4つ以上ある場合に有効。2〜3フィールドならコンストラクタやファクトリーメソッドで十分な場合が多い",
      "Lombok の @Builder は便利だが、生成されるコードが見えにくい。チーム内で Lombok の採否が決まっていない場合は手書きの Builder から始めるほうが安全",
      "実務では引数の順序を取り違えてもコンパイルが通るコンストラクタが多く残っている。「String が3つ並んでいる」「null を渡している」といった箇所を見つけたら Builder への置き換えを検討すること。",
    ],
    relatedArticleSlugs: ["factory-method", "prototype-pattern"],
    versionCoverage: {
      java8: "Builder クラスのフィールドとメソッドを手書きする。var が使えないため、メソッドチェーンの中間変数にも型宣言が必要。",
      java17: "var でメソッドチェーンの記述が簡潔になる。生成対象を record にすれば equals・toString が自動生成される。",
      java21: "生成対象を sealed interface の record バリアントにすることで、switch パターンマッチングでの処理分岐が型安全になる。",
      java8Code: `// Java 8: 型を明示してチェーン呼び出し
HttpRequest req = new HttpRequest.Builder("https://api.example.com")
    .method("POST")
    .body("{\\"name\\":\\"田中\\"}")
    .timeout(5000)
    .build();`,
      java17Code: `// Java 17: var で簡潔に
var req = new HttpRequest.Builder("https://api.example.com")
    .method("POST")
    .body("{\\"name\\":\\"田中\\"}")
    .timeout(5000)
    .build();`,
      java21Code: `// Java 21: 標準 API の Builder 例
var client = java.net.http.HttpClient.newBuilder()
    .connectTimeout(java.time.Duration.ofSeconds(5))
    .followRedirects(
        java.net.http.HttpClient.Redirect.NORMAL)
    .build();`,
    },
    libraryComparison: [
      { name: "標準 API（手書き Builder）", whenToUse: "ビルドロジックに検証やデフォルト値の設定を含めたいとき。生成過程を完全に制御できる。", tradeoff: "フィールドが多いと Builder クラスの記述量が増える。" },
      { name: "Lombok（@Builder）", whenToUse: "ボイラープレートを排除し、アノテーション一つで Builder を自動生成したいとき。", tradeoff: "生成コードが見えないため、カスタム検証の追加がやりにくい。チームで Lombok の導入方針を合意しておく必要がある。" },
      { name: "Immutables（@Value.Immutable）", whenToUse: "不変オブジェクトの生成に特化し、Builder と同時に equals・hashCode・toString も自動生成したいとき。", tradeoff: "アノテーションプロセッサの設定が必要。ビルド環境への影響を事前に確認すること。" },
    ],
    faq: [
      { question: "Builder とコンストラクタはどう使い分けますか。", answer: "フィールドが4つ以上、または任意フィールドが多い場合は Builder が有効です。2〜3フィールドで全て必須なら通常のコンストラクタで十分です。" },
      { question: "record に Builder は必要ですか。", answer: "record はコンストラクタ引数が全フィールドなので、引数が増えると Builder の恩恵があります。record の中に static な Builder クラスを定義するパターンが実用的です。" },
      { question: "Builder パターンと Fluent Interface の違いは何ですか。", answer: "Fluent Interface はメソッドチェーンの書き方を指し、Builder はオブジェクト生成のパターンです。Builder は Fluent Interface を使うことが多いですが、概念としては別物です。" },
    ],
    codeTitle: "BuilderPatternSample.java",
    codeSample: `public class BuilderPatternSample {

    static class HttpRequest {
        private final String url;
        private final String method;
        private final String body;
        private final int timeoutMs;
        private final boolean followRedirect;

        private HttpRequest(Builder builder) {
            this.url = builder.url;
            this.method = builder.method;
            this.body = builder.body;
            this.timeoutMs = builder.timeoutMs;
            this.followRedirect = builder.followRedirect;
        }

        @Override
        public String toString() {
            return "HttpRequest{url=" + url + ", method=" + method
                + ", timeout=" + timeoutMs + "ms}";
        }

        static class Builder {
            private final String url;       // 必須
            private String method = "GET";  // 任意（デフォルト値あり）
            private String body = "";
            private int timeoutMs = 30000;
            private boolean followRedirect = true;

            public Builder(String url) {
                if (url == null || url.isEmpty()) {
                    throw new IllegalArgumentException("URL は必須");
                }
                this.url = url;
            }

            public Builder method(String m) { this.method = m; return this; }
            public Builder body(String b) { this.body = b; return this; }
            public Builder timeout(int ms) { this.timeoutMs = ms; return this; }
            public Builder followRedirect(boolean f) { this.followRedirect = f; return this; }

            public HttpRequest build() { return new HttpRequest(this); }
        }
    }

    public static void main(String[] args) {
        var req = new HttpRequest.Builder("https://api.example.com/users")
            .method("POST")
            .body("{\\"name\\":\\"田中\\"}")
            .timeout(5000)
            .followRedirect(false)
            .build();
        System.out.println(req);

        // 最小構成（必須フィールドのみ）
        var minimal = new HttpRequest.Builder("https://api.example.com/health")
            .build();
        System.out.println(minimal);

        // 標準ライブラリの Builder 例
        var sb = new StringBuilder()
            .append("Hello, ").append("Builder").append("!");
        System.out.println(sb.toString());
    }
}`,
  },
{
    slug: "prototype-pattern",
    title: "Java Prototype パターンでオブジェクトを複製する",
    categorySlug: "patterns",
    summary: "コピーコンストラクタと record の withXxx メソッドで、安全にオブジェクトを複製する方法を整理する。",
    version: "Java 17",
    tags: ["Prototype", "GoF", "生成パターン", "コピーコンストラクタ", "record"],
    apiNames: ["Cloneable", "Object.clone", "List.copyOf", "record"],
    description: "Prototype パターンを Java で実装する方法を clone の問題点から整理し、コピーコンストラクタと record の withXxx で安全に複製する。",
    lead: "既存のオブジェクトを雛形にして少しだけ値を変えた新しいオブジェクトを作りたい場面は、注文の複製、テストデータの派生作成、テンプレートからの帳票生成など業務でよく出てきます。Java には Object.clone() が用意されていますが、Cloneable インターフェースの設計上の問題（シャローコピーの罠、CloneNotSupportedException の扱い）から、Effective Java でも clone の使用は推奨されていません。この記事では、コピーコンストラクタによるディープコピーと、Java 17 の record + withXxx メソッドによる不変オブジェクトの派生生成という2つのアプローチを示します。clone を避けるべき理由を実例で確認し、実務で安全に複製を行う判断基準を整理します。",
    useCases: [
      "注文テンプレートから数量や備考だけ変えた派生注文を複数作成し、一括で登録する",
      "テストデータの基本セットをコピーし、特定のフィールドだけ変更して複数のテストケースに使い回す",
      "帳票テンプレートのレイアウト設定をコピーし、顧客ごとの宛名・金額だけ差し替えて出力する",
    ],
    cautions: [
      "Object.clone() はシャローコピーのため、List や Map などの参照型フィールドは元オブジェクトと共有される。片方を変更するともう一方にも影響が出る",
      "clone() を使う場合は Cloneable を implements する必要があるが、CloneNotSupportedException が検査例外のため try-catch が必要になる。設計上の負債になりやすい",
      "record の withXxx メソッドは慣習であり、言語仕様ではない。チーム内で命名規則を統一しておくこと",
      "防御的コピー（defensive copy）を忘れると、コピー元の List を外部から変更されたときにコピー先にも影響する。List.copyOf や new ArrayList<>(original) で切り離す",
    ],
    relatedArticleSlugs: ["builder-pattern", "singleton-pattern"],
    versionCoverage: {
      java8: "コピーコンストラクタで全フィールドを手動コピーする。List は new ArrayList<>(original) で防御的コピーを行う。",
      java17: "record + withXxx メソッドで不変のまま値を差し替えた新しいインスタンスを生成できる。List.copyOf で防御的コピーも簡潔。",
      java21: "sealed interface で注文種別を型安全に定義し、switch パターンマッチングで種別ごとのコピーロジックを分岐できる。",
      java8Code: `// Java 8: コピーコンストラクタ
Order copy = new Order(original);
copy.setQuantity(10);
copy.addNote("急便希望");
// List も手動でコピー
this.notes = new ArrayList<>(other.notes);`,
      java17Code: `// Java 17: record + withXxx で不変コピー
record Order(String customerId, String productId,
             int quantity, List<String> notes) {
    Order withQuantity(int q) {
        return new Order(customerId, productId, q, notes);
    }
}
var copy = template.withQuantity(10);`,
      java21Code: `// Java 21: sealed interface で注文種別を型安全に
sealed interface Order permits Order.Standard, Order.Urgent {
    record Standard(String id, int qty, List<String> notes)
            implements Order {}
    record Urgent(String id, int qty, String deadline)
            implements Order {}
}
String desc = switch (order) {
    case Order.Standard s -> "標準: " + s.qty();
    case Order.Urgent u -> "緊急: " + u.deadline();
};`,
    },
    libraryComparison: [
      { name: "標準 API（コピーコンストラクタ / record）", whenToUse: "複製対象のフィールド構成が明確で、防御的コピーを自前で制御したいとき。", tradeoff: "フィールドが多いとコピーコンストラクタの記述量が増える。" },
      { name: "Apache Commons Lang（SerializationUtils）", whenToUse: "Serializable なオブジェクトを丸ごとディープコピーしたいとき。", tradeoff: "シリアライズ経由のため性能は低い。Serializable でないオブジェクトには使えない。" },
      { name: "MapStruct", whenToUse: "DTO 間の変換とコピーを型安全に自動生成したいとき。", tradeoff: "アノテーションプロセッサが必要。単純な複製だけなら過剰。" },
    ],
    faq: [
      { question: "Object.clone() は本当に使うべきではないですか。", answer: "Effective Java でも非推奨とされています。Cloneable の設計上の問題（シャローコピー・検査例外）があるため、コピーコンストラクタか record の withXxx を使うのが安全です。" },
      { question: "record で withXxx を書くのが面倒な場合の代替手段はありますか。", answer: "フィールドが多い場合は Builder パターンと組み合わせ、既存オブジェクトの値で Builder を初期化してから一部だけ上書きする方法が実用的です。" },
      { question: "シャローコピーとディープコピーの判断基準は何ですか。", answer: "参照型フィールド（List, Map, 可変オブジェクト）を含む場合はディープコピーが必要です。プリミティブ型と不変オブジェクト（String, LocalDate）のみならシャローコピーで十分です。" },
    ],
    codeTitle: "PrototypePatternSample.java",
    codeSample: `import java.util.ArrayList;
import java.util.List;

public class PrototypePatternSample {

    // Java 17: record + withXxx でイミュータブルな複製
    record Order(String customerId, String productId,
                 int quantity, List<String> notes) {

        // コンパクトコンストラクタ: notes を防御的にコピー
        Order {
            notes = List.copyOf(notes);
        }

        Order withQuantity(int newQuantity) {
            return new Order(customerId, productId, newQuantity, notes);
        }

        Order withNote(String additionalNote) {
            var newNotes = new ArrayList<>(notes);
            newNotes.add(additionalNote);
            return new Order(customerId, productId, quantity, newNotes);
        }
    }

    public static void main(String[] args) {
        // 雛形注文を作成
        var template = new Order("C001", "PROD-A", 1, List.of("通常便"));
        System.out.println("雛形: " + template);

        // withXxx で値を変えた新しいインスタンスを生成
        var order1 = template.withQuantity(3).withNote("急便希望");
        var order2 = template.withQuantity(10);

        System.out.println("注文1: " + order1);
        System.out.println("注文2: " + order2);
        System.out.println("雛形（変化なし）: " + template);
    }
}`,
  },
{
    slug: "adapter-pattern",
    title: "Java Adapter パターンで既存クラスのインターフェースを変換する",
    categorySlug: "patterns",
    summary: "変更できない既存クラスを新しいインターフェースに適合させる Adapter の実装方法を整理する。",
    version: "Java 17",
    tags: ["Adapter", "GoF", "構造パターン", "レガシー連携", "interface"],
    apiNames: ["InputStreamReader", "Arrays.asList", "record"],
    description: "Java の Adapter パターンで既存クラスのインターフェースを変換し、レガシーコードと新しい設計を橋渡しする方法を Java 8/17/21 対応で整理する。",
    lead: "既存システムの改修やライブラリ統合の場面では、変更できないクラスのインターフェースが新しい設計と合わないことがよくあります。全面的に書き直す余裕はないが、新しいインターフェースで統一したい――そういったときに Adapter パターンが使えます。Adapter は既存クラス（Adaptee）を内部に持ち、Target インターフェースのメソッド呼び出しを Adaptee のメソッドに変換します。Java 標準ライブラリでも InputStreamReader（InputStream を Reader に変換）や Arrays.asList（配列を List に変換）が同じ構造です。この記事では、レガシーデータ読取クラスを新しいインターフェースに適合させる実装を示し、Adapter を適用すべき場面とブリッジパターンとの違いを整理します。",
    useCases: [
      "レガシーシステムの CSV 出力クラスを新しい DataExporter インターフェースに適合させ、他の出力形式と統一的に扱う",
      "外部ライブラリのログ出力をプロジェクト標準のロガーインターフェースに変換し、ログ出力先を一元管理する",
      "古い独自フォーマットの設定ファイル読取クラスを Properties ライクなインターフェースで扱えるようにする",
    ],
    cautions: [
      "Adapter を多用するとラッパーが何重にも重なり、デバッグ時にどの実体が呼ばれているか追いにくくなる。必要最小限に留める",
      "クラスアダプタ（継承）とオブジェクトアダプタ（委譲）の2方式がある。Java では多重継承ができないため、オブジェクトアダプタ（委譲）が一般的",
      "Adapter は既存クラスの「インターフェースの不一致」を解消するパターン。機能を追加したい場合は Decorator を検討する",
    ],
    relatedArticleSlugs: ["bridge-pattern", "decorator-pattern"],
    versionCoverage: {
      java8: "Adapter クラスとクライアントコードで型を明示する。変換結果を保持するには通常のクラスを定義する。",
      java17: "record で変換前後のデータを保持でき、var で型推論が使える。Adapter の可読性が向上する。",
      java21: "sealed interface で Adapter の変換結果を型安全に分類し、switch パターンマッチングで処理を分岐できる。",
      java8Code: `// Java 8: 型を明示して Adapter を使う
LegacyDataReader legacy = new LegacyDataReader();
Target adapter = new DataReaderAdapter(legacy);
String result = adapter.readData();`,
      java17Code: `// Java 17: var + record で変換結果を保持
var adapter = new DataReaderAdapter(new LegacyDataReader());
record AdapterResult(String source, String adapted) {}
var result = adapter.readDataWithResult();
System.out.println("変換前: " + result.source());`,
      java21Code: `// Java 21: sealed interface で変換結果を型安全に
sealed interface ConvertResult
        permits ConvertResult.Success, ConvertResult.Failure {
    record Success(String data) implements ConvertResult {}
    record Failure(String reason) implements ConvertResult {}
}
String msg = switch (result) {
    case ConvertResult.Success s -> s.data();
    case ConvertResult.Failure f -> "エラー: " + f.reason();
};`,
    },
    libraryComparison: [
      { name: "標準 API（interface + 委譲）", whenToUse: "既存クラスを薄くラップするだけで済む場合。依存なしで書ける。", tradeoff: "変換ロジックが複雑になると Adapter クラスが肥大化する。" },
      { name: "Spring（HandlerAdapter）", whenToUse: "Spring MVC で異なるハンドラー型を統一的に扱うとき。Spring の Adapter パターン適用例として参考になる。", tradeoff: "Spring フレームワーク内の話であり、汎用のアダプタとは用途が異なる。" },
    ],
    faq: [
      { question: "Adapter と Decorator の違いは何ですか。", answer: "Adapter はインターフェースを変換するのが目的で、機能は変えません。Decorator は同じインターフェースを保ちつつ、機能を追加します。" },
      { question: "クラスアダプタとオブジェクトアダプタはどちらを使うべきですか。", answer: "Java では多重継承ができないため、委譲を使うオブジェクトアダプタが一般的です。Adaptee のメソッドをオーバーライドする必要がある場合のみクラスアダプタを検討します。" },
      { question: "Java 標準ライブラリの Adapter にはどんなものがありますか。", answer: "InputStreamReader（InputStream を Reader に変換）、OutputStreamWriter、Arrays.asList（配列を List に変換）が代表例です。" },
    ],
    codeTitle: "AdapterPatternSample.java",
    codeSample: `import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.util.Arrays;

public class AdapterPatternSample {

    // Target: 新しいインターフェース
    interface Target {
        String readData();
    }

    // Adaptee: 変更できない既存クラス
    static class LegacyDataReader {
        public String fetchRawData() {
            return "ID:001,NAME:田中太郎,AGE:30";
        }
    }

    // 変換結果を保持する record（Java 17+）
    record AdapterResult(String source, String adapted) {}

    // Adapter: Target を実装し、LegacyDataReader に委譲
    static class DataReaderAdapter implements Target {
        private final LegacyDataReader legacy;

        public DataReaderAdapter(LegacyDataReader legacy) {
            this.legacy = legacy;
        }

        @Override
        public String readData() {
            var raw = legacy.fetchRawData();
            return convertFormat(raw);
        }

        public AdapterResult readDataWithResult() {
            var raw = legacy.fetchRawData();
            return new AdapterResult(raw, convertFormat(raw));
        }

        private String convertFormat(String raw) {
            var pairs = raw.split(",");
            var sb = new StringBuilder("[");
            for (int i = 0; i < pairs.length; i++) {
                sb.append(pairs[i].replace(":", "="));
                if (i < pairs.length - 1) sb.append(", ");
            }
            return sb.append("]").toString();
        }
    }

    public static void main(String[] args) throws IOException {
        // 自作 Adapter
        var adapter = new DataReaderAdapter(new LegacyDataReader());
        System.out.println("変換後: " + adapter.readData());

        var result = adapter.readDataWithResult();
        System.out.println("変換前: " + result.source());
        System.out.println("変換後: " + result.adapted());

        // 標準ライブラリの Adapter 例
        var bytes = "Hello".getBytes("UTF-8");
        var reader = new InputStreamReader(
            new ByteArrayInputStream(bytes), "UTF-8");
        System.out.println("InputStreamReader: " + (char) reader.read());

        var list = Arrays.asList("Java 8", "Java 17", "Java 21");
        System.out.println("Arrays.asList: " + list);
    }
}`,
  },
{
    slug: "bridge-pattern",
    title: "Java Bridge パターンで抽象と実装を分離する設計と実装",
    categorySlug: "patterns",
    summary: "通知の種類（緊急・定期）と送信手段（メール・SMS）を独立に拡張できる Bridge 構造の実装。",
    version: "Java 17",
    tags: ["Bridge", "GoF", "構造パターン", "抽象と実装の分離", "通知"],
    apiNames: ["interface", "abstract class", "sealed interface", "record"],
    description: "Java の Bridge パターンで抽象階層と実装階層を分離し、通知種類と送信手段を独立に拡張できる構造を外部ライブラリ不要で Java 8/17/21 対応で示す。",
    lead: "通知機能を設計するとき、「緊急通知 x メール送信」「定期レポート x SMS 送信」のようにクラスの組み合わせが掛け算で増えていく問題に直面することがあります。Bridge パターンは、「抽象（通知の種類）」と「実装（送信手段）」を独立した階層に分離し、合成で組み合わせることでクラス爆発を防ぎます。新しい通知の種類を追加しても送信手段のコードには触れず、新しい送信手段を追加しても通知ロジックは変わりません。この記事では通知システムを題材に Bridge パターンの構造を示し、Java 17 の record・sealed interface を活用した簡潔な実装と、Adapter パターンとの違いを整理します。",
    useCases: [
      "通知の種類（緊急・定期・承認依頼）と送信チャネル（メール・SMS・Slack）を独立に追加・組み合わせできるようにする",
      "帳票のフォーマット（一覧・明細・集計）と出力先（PDF・Excel・画面表示）を分離し、どちらも単独で拡張可能にする",
      "ログの種別（監査・アクセス・エラー）と出力先（ファイル・DB・外部サービス）を独立に管理する",
    ],
    cautions: [
      "Bridge パターンは抽象と実装の両方が独立に拡張される場合に有効。片方だけが変わるなら Strategy パターンで十分な場合が多い",
      "抽象クラスが実装インターフェースへの参照を持つ構造が Bridge の核心。単なるインターフェース分離と混同しないよう注意",
      "設計初期から Bridge を適用すると過剰設計になりやすい。まず Strategy で始めて、抽象側にも階層が必要になった時点で Bridge に移行するのが現実的",
    ],
    relatedArticleSlugs: ["adapter-pattern", "decorator-pattern"],
    versionCoverage: {
      java8: "実装クラスを通常のクラスで定義する。フィールド・コンストラクタ・equals/hashCode を手書きし、型をすべて明示する必要がある。",
      java17: "record で実装クラスを簡潔に定義できる。sealed interface で送信手段の種別を型安全に限定することも可能。",
      java21: "switch のパターンマッチング（JEP 441）で送信手段の種別に応じた処理を網羅性チェック付きで記述できる。",
      java8Code: `// Java 8: 通常クラスで実装を定義
static class EmailSender implements MessageSender {
    @Override
    public void send(String to, String subj, String body) {
        System.out.println("[メール] " + to + ": " + subj);
    }
}
Notification n = new UrgentNotification(new EmailSender());`,
      java17Code: `// Java 17: record で実装を簡潔に
record EmailSender(String smtpHost) implements MessageSender {
    @Override
    public void send(String to, String subj, String body) {
        System.out.println("[メール] " + smtpHost + " → " + to);
    }
}
var n = new UrgentNotification(new EmailSender("smtp.example.com"));`,
      java21Code: `// Java 21: sealed interface + switch で送信手段を分岐
sealed interface SenderType
        permits SenderType.Email, SenderType.Sms {
    record Email(String host) implements SenderType {}
    record Sms(String gateway) implements SenderType {}
}
String channel = switch (type) {
    case SenderType.Email e -> "メール via " + e.host();
    case SenderType.Sms s -> "SMS via " + s.gateway();
};`,
    },
    libraryComparison: [
      { name: "標準 API（abstract class + interface）", whenToUse: "抽象と実装の両方に拡張の余地があり、組み合わせの自由度を確保したいとき。", tradeoff: "設計の意図がコードから読み取りにくい場合がある。チーム内で設計図を共有しておくこと。" },
      { name: "JDBC ドライバー構造", whenToUse: "Java 標準の Bridge パターン適用例として理解しておくと、自前の設計判断に役立つ。", tradeoff: "JDBC は大規模な API なので、Bridge の学習目的には通知システムのような小さな題材のほうが理解しやすい。" },
    ],
    faq: [
      { question: "Bridge パターンと Strategy パターンの違いは何ですか。", answer: "Strategy は振る舞いの切り替えに焦点を当て、実装側だけが変わります。Bridge は抽象と実装の両方が独立に拡張される構造です。" },
      { question: "Bridge パターンと Adapter パターンの違いは何ですか。", answer: "Adapter は既存のインターフェースを変換するのが目的です。Bridge は設計段階から抽象と実装を分離し、将来の拡張に備えます。" },
      { question: "Bridge パターンは実務でどのくらい使いますか。", answer: "通知、帳票出力、ロギングなど、種類と手段の組み合わせが増える場面で有効です。JDBC のドライバー構造も Bridge パターンの実例です。" },
    ],
    codeTitle: "BridgePatternSample.java",
    codeSample: `public class BridgePatternSample {

    // 実装インターフェース（Implementor）
    interface MessageSender {
        void send(String to, String subject, String body);
    }

    // 具体実装（Java 17: record で簡潔に）
    record EmailSender(String smtpHost) implements MessageSender {
        @Override
        public void send(String to, String subject, String body) {
            System.out.println("[メール] SMTP: " + smtpHost);
            System.out.println("  宛先: " + to + " / 件名: " + subject);
        }
    }

    record SmsSender(String gateway) implements MessageSender {
        @Override
        public void send(String to, String subject, String body) {
            System.out.println("[SMS] GW: " + gateway);
            System.out.println("  宛先: " + to + " / 内容: " + body);
        }
    }

    // 抽象クラス（Abstraction）
    static abstract class Notification {
        protected final MessageSender sender;
        Notification(MessageSender sender) { this.sender = sender; }
        abstract void notify(String recipient, String message);
    }

    // 具体抽象
    static class UrgentNotification extends Notification {
        UrgentNotification(MessageSender sender) { super(sender); }
        @Override
        void notify(String recipient, String message) {
            sender.send(recipient, "【緊急】" + message,
                "至急確認: " + message);
        }
    }

    static class ReportNotification extends Notification {
        ReportNotification(MessageSender sender) { super(sender); }
        @Override
        void notify(String recipient, String message) {
            sender.send(recipient, "定期レポート", message);
        }
    }

    public static void main(String[] args) {
        // 緊急 x メール
        var urgentEmail = new UrgentNotification(
            new EmailSender("smtp.example.com"));
        urgentEmail.notify("admin@example.com", "サーバー障害");

        System.out.println();

        // 定期レポート x SMS
        var reportSms = new ReportNotification(
            new SmsSender("sms-gw.example.com"));
        reportSms.notify("090-1234-5678", "売上: 100万円");
    }
}`,
  },
{
    slug: "composite-pattern",
    title: "Java Composite パターンで木構造を再帰的に扱う",
    categorySlug: "patterns",
    summary: "ファイルシステムを題材に、個々の要素と複合要素を同一インターフェースで透過的に扱う Composite の実装。",
    version: "Java 17",
    tags: ["Composite", "GoF", "構造パターン", "木構造", "再帰"],
    apiNames: ["List", "ArrayList", "record"],
    description: "Java の Composite パターンでファイルとディレクトリを同一インターフェースで扱い、木構造を再帰的に処理する方法を Java 8/17/21 対応で整理する。",
    lead: "組織図、ファイルシステム、メニュー構造、帳票の明細と小計――業務システムには「部分と全体を同じように扱いたい」木構造の場面が少なくありません。Composite パターンは、Leaf（葉）と Composite（複合ノード）に共通のインターフェースを持たせ、クライアントが個別の要素か集合かを意識せずに操作できる構造を作ります。この記事ではファイルシステムを題材に、ファイル（Leaf）とディレクトリ（Composite）を同一の FileSystemNode として扱い、サイズの集計やツリー表示を再帰的に実装します。Java 17 の record をファイル情報の保持に使い、var による型推論で記述を簡潔にしたコード例を示します。",
    useCases: [
      "ファイルシステムのディレクトリとファイルを同一インターフェースで扱い、合計サイズを再帰的に計算する",
      "組織図の部署と個人を Composite で表現し、指定部署配下の全メンバー一覧を再帰的に取得する",
      "帳票の明細行と小計行を同一インターフェースで扱い、合計金額を階層的に集計する",
    ],
    cautions: [
      "Composite のインターフェースに add / remove を含めると、Leaf でも呼べてしまう。Leaf で UnsupportedOperationException を投げるか、Composite だけに追加メソッドを持たせるかはトレードオフ",
      "木構造が深くなると再帰呼び出しでスタックオーバーフローが起きる可能性がある。実務の木構造はたいてい浅いが、データ異常で循環参照が発生すると無限再帰になる",
      "Composite パターンは構造の表現に特化している。構造に対する操作を拡張したい場合は Visitor パターンとの併用を検討する",
    ],
    relatedArticleSlugs: ["decorator-pattern", "flyweight-pattern"],
    versionCoverage: {
      java8: "abstract class と通常クラスで木構造を定義する。for ループの変数に型を明示する必要がある。",
      java17: "record でファイル情報を保持し、var と拡張 for ループの組み合わせで記述量を削減できる。",
      java21: "sealed interface で Node 型を限定し、switch パターンマッチングで Leaf と Composite の処理を分岐できる。",
      java8Code: `// Java 8: 型を明示して木構造を構築
DirectoryNode root = new DirectoryNode("root");
FileNode file = new FileNode("README.txt", 512);
root.add(file);
for (FileSystemNode child : root.getChildren()) {
    child.print("");
}`,
      java17Code: `// Java 17: var + record で簡潔に
var root = new DirectoryNode("root");
root.add(new FileNode("README.txt", 512));
record FileInfo(String name, long size) {}
var info = new FileInfo("README.txt", 512);`,
      java21Code: `// Java 21: sealed interface で Node 型を限定
sealed interface Node permits Node.File, Node.Dir {
    record File(String name, long size) implements Node {}
    record Dir(String name, List<Node> children) implements Node {}
}
long size = switch (node) {
    case Node.File f -> f.size();
    case Node.Dir d -> d.children().stream()
        .mapToLong(n -> getSize(n)).sum();
};`,
    },
    libraryComparison: [
      { name: "標準 API（abstract class + List）", whenToUse: "木構造の深さや要素数が限られ、自前で構造を管理するとき。", tradeoff: "木構造の操作（検索・フィルタ・変換）を追加するたびにメソッドが増える。" },
      { name: "DOM API（org.w3c.dom）", whenToUse: "XML の木構造を操作する場合。Composite パターンの適用例として参考になる。", tradeoff: "汎用の木構造には冗長。XML 以外の用途では使いにくい。" },
    ],
    faq: [
      { question: "Composite パターンはどんなデータ構造に使えますか。", answer: "ファイルシステム、組織図、メニュー階層、帳票の明細・小計など、部分と全体を同じ操作で扱いたい木構造に適しています。" },
      { question: "Leaf に add メソッドがあるのは変ではないですか。", answer: "透過性を重視する設計では Leaf にも add を定義し、UnsupportedOperationException を投げます。安全性を重視するなら Composite だけに add を持たせます。" },
      { question: "Composite と再帰の組み合わせで性能は問題になりませんか。", answer: "実務の木構造は通常数十〜数百レベルなので問題ありません。数万レベルの深さが必要な場合はスタック溢れに注意し、反復処理への変換を検討してください。" },
    ],
    codeTitle: "CompositePatternSample.java",
    codeSample: `import java.util.ArrayList;
import java.util.List;

public class CompositePatternSample {

    // Component: 共通インターフェース
    static abstract class FileSystemNode {
        protected final String name;
        public FileSystemNode(String name) { this.name = name; }
        public abstract long getSize();
        public abstract void print(String indent);
    }

    // Leaf: ファイル
    static class FileNode extends FileSystemNode {
        private final long size;
        public FileNode(String name, long size) {
            super(name);
            this.size = size;
        }
        @Override
        public long getSize() { return size; }
        @Override
        public void print(String indent) {
            System.out.println(indent + "- " + name + " (" + size + " B)");
        }
    }

    // Composite: ディレクトリ
    static class DirectoryNode extends FileSystemNode {
        private final List<FileSystemNode> children = new ArrayList<>();
        public DirectoryNode(String name) { super(name); }

        public void add(FileSystemNode node) { children.add(node); }

        @Override
        public long getSize() {
            long total = 0;
            for (var child : children) { total += child.getSize(); }
            return total;
        }

        @Override
        public void print(String indent) {
            System.out.println(indent + "+ " + name + "/ (" + getSize() + " B)");
            for (var child : children) { child.print(indent + "  "); }
        }
    }

    public static void main(String[] args) {
        var root = new DirectoryNode("project");
        root.add(new FileNode("README.md", 512));

        var src = new DirectoryNode("src");
        src.add(new FileNode("Main.java", 2048));
        src.add(new FileNode("Utils.java", 1024));
        root.add(src);

        var lib = new DirectoryNode("lib");
        lib.add(new FileNode("commons.jar", 4096));
        root.add(lib);

        root.print("");
        System.out.println("合計: " + root.getSize() + " bytes");
    }
}`,
  },
{
    slug: "decorator-pattern",
    title: "Java Decorator パターンで機能を動的に追加する",
    categorySlug: "patterns",
    summary: "テキスト処理を題材に、既存オブジェクトに変更を加えず機能を重ねる Decorator の実装方法を整理する。",
    version: "Java 17",
    tags: ["Decorator", "GoF", "構造パターン", "ラッパー", "I/Oストリーム"],
    apiNames: ["BufferedReader", "InputStreamReader", "BufferedInputStream"],
    description: "Java の Decorator パターンで既存クラスを変更せず機能を動的に追加する方法を、テキスト処理と標準 I/O ストリームの例で Java 8/17/21 対応で示す。",
    lead: "テキストの大文字変換、前後空白の除去、ログ出力、プレフィックスの付与――こうした処理を個別の条件で組み合わせたい場合、if 文の分岐やサブクラスの組み合わせ爆発に悩まされがちです。Decorator パターンは、同じインターフェースを実装するラッパーを重ねることで、元のオブジェクトを変更せず機能を動的に追加します。Java 標準ライブラリの I/O ストリーム（BufferedReader が InputStreamReader を包み、さらに InputStream を包む）は Decorator パターンの代表例です。この記事ではテキスト処理パイプラインを題材に Decorator の基本構造を示し、Proxy パターンとの違い、Java の I/O ストリームが同じ構造であることを確認します。",
    useCases: [
      "テキスト処理パイプラインで、Trim・大文字変換・ログ出力・プレフィックス付与を実行時に任意の順序で組み合わせる",
      "API レスポンスに対して、キャッシュ・認証チェック・ログ記録を段階的に追加し、各デコレータを独立にテストする",
      "ファイル読み書きで BufferedReader / InputStreamReader / FileInputStream のような多段のラッパーを構成する",
    ],
    cautions: [
      "デコレータを重ねすぎるとスタックトレースが深くなり、デバッグ時にどの層で問題が起きているか追いにくい",
      "Decorator と Proxy は構造が似ているが目的が異なる。Decorator は機能追加、Proxy はアクセス制御・遅延初期化が主目的",
      "デコレータの適用順序が結果に影響する場合がある。Trim してから大文字にするのと、大文字にしてから Trim するのでは結果が異なるケースがある",
      "各デコレータが同じインターフェースを忠実に守ることが前提。インターフェースの契約を破るデコレータは連鎖の中で予期しない動作を引き起こす",
    ],
    relatedArticleSlugs: ["proxy-pattern", "adapter-pattern"],
    versionCoverage: {
      java8: "デコレータのクラス定義やチェーン構築に型を明示する。record が使えないため、処理結果の保持は通常クラスで行う。",
      java17: "var でデコレータチェーンの変数宣言が簡潔になる。record で処理結果のメタ情報を保持できる。",
      java21: "sealed interface で処理結果の型を限定し、switch パターンマッチングで成功・失敗を分岐できる。",
      java8Code: `// Java 8: 型を明示してデコレータチェーン
TextProcessor processor = new UpperCaseDecorator(
    new TrimDecorator(
        new PlainTextProcessor()));
String result = processor.process("  hello  ");`,
      java17Code: `// Java 17: var + record で処理結果を管理
var processor = new UpperCaseDecorator(
    new TrimDecorator(new PlainTextProcessor()));
var result = processor.process("  hello  ");
record ProcessResult(String original, String processed) {}
var pr = new ProcessResult("  hello  ", result);`,
      java21Code: `// Java 21: sealed interface で処理結果を型安全に
sealed interface Result permits Result.Ok, Result.Err {
    record Ok(String value) implements Result {}
    record Err(String reason) implements Result {}
}
String msg = switch (result) {
    case Result.Ok ok -> "成功: " + ok.value();
    case Result.Err err -> "失敗: " + err.reason();
};`,
    },
    libraryComparison: [
      { name: "標準 API（interface + 委譲）", whenToUse: "処理の組み合わせパターンが実行時に決まる場合。I/O ストリームと同じ設計思想で構築できる。", tradeoff: "デコレータの数が増えるとクラス数も増える。" },
      { name: "Java I/O ストリーム", whenToUse: "ファイル読み書きでバッファリング・文字コード変換・圧縮などを組み合わせるとき。Decorator パターンの実例として最も身近。", tradeoff: "I/O に特化しており、汎用のデコレータ設計のテンプレートとしてはやや複雑。" },
    ],
    faq: [
      { question: "Decorator と継承のどちらを使うべきですか。", answer: "機能の組み合わせが実行時に変わる場合は Decorator が適しています。組み合わせが固定なら継承でも構いませんが、クラス爆発に注意してください。" },
      { question: "Decorator パターンと Proxy パターンの見分け方は。", answer: "Decorator は機能の追加（ログ・キャッシュ・変換）が目的で、Proxy はアクセス制御・遅延初期化が目的です。構造は似ていますが、設計意図が異なります。" },
      { question: "Java の I/O ストリームが Decorator パターンだと知ると何が変わりますか。", answer: "InputStream → InputStreamReader → BufferedReader の多段ラッパーが設計パターンだと分かれば、新しい I/O クラスを見ても構造を理解しやすくなります。" },
    ],
    codeTitle: "DecoratorPatternSample.java",
    codeSample: `import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.io.IOException;

public class DecoratorPatternSample {

    // Component インターフェース
    interface TextProcessor {
        String process(String text);
    }

    // 基本実装
    static class PlainTextProcessor implements TextProcessor {
        @Override
        public String process(String text) { return text; }
    }

    // Decorator 基底クラス
    static abstract class TextDecorator implements TextProcessor {
        protected final TextProcessor wrapped;
        public TextDecorator(TextProcessor wrapped) {
            this.wrapped = wrapped;
        }
    }

    // 具体 Decorator: 大文字変換
    static class UpperCaseDecorator extends TextDecorator {
        public UpperCaseDecorator(TextProcessor w) { super(w); }
        @Override
        public String process(String text) {
            return wrapped.process(text).toUpperCase();
        }
    }

    // 具体 Decorator: Trim
    static class TrimDecorator extends TextDecorator {
        public TrimDecorator(TextProcessor w) { super(w); }
        @Override
        public String process(String text) {
            return wrapped.process(text).trim();
        }
    }

    // 具体 Decorator: ログ出力
    static class LoggingDecorator extends TextDecorator {
        public LoggingDecorator(TextProcessor w) { super(w); }
        @Override
        public String process(String text) {
            System.out.println("[LOG] 入力: \\"" + text + "\\"");
            var result = wrapped.process(text);
            System.out.println("[LOG] 出力: \\"" + result + "\\"");
            return result;
        }
    }

    public static void main(String[] args) throws IOException {
        // デコレータを重ねて処理パイプラインを構築
        var processor = new LoggingDecorator(
            new UpperCaseDecorator(
                new TrimDecorator(new PlainTextProcessor())));
        System.out.println("結果: " + processor.process("  hello, java!  "));

        // 標準ライブラリの Decorator 例
        var data = "Hello\\nDecorator";
        var reader = new BufferedReader(new InputStreamReader(
            new ByteArrayInputStream(data.getBytes("UTF-8"))));
        String line;
        while ((line = reader.readLine()) != null) {
            System.out.println("読み込み: " + line);
        }
    }
}`,
  },
{
    slug: "facade-pattern",
    title: "Java Facade パターンで複雑なサブシステムを簡潔に使う",
    categorySlug: "patterns",
    summary: "SMTP・テンプレート・監査ログの3つのサブシステムを Facade で統合し、呼び出し側に簡潔なインターフェースを提供する。",
    version: "Java 17",
    tags: ["Facade", "GoF", "構造パターン", "サブシステム統合", "メール送信"],
    apiNames: ["HashMap", "Map", "record"],
    description: "Java の Facade パターンで複数のサブシステムを1つの窓口に統合し、呼び出し側のコードを簡潔にする方法を外部ライブラリ不要で Java 8/17/21 対応で整理する。",
    lead: "メールを送信する処理ひとつとっても、SMTP クライアントの接続・認証、テンプレートエンジンでの本文生成、監査ログの記録と、複数のサブシステムが関わります。呼び出し側がこれらを直接操作すると、手順の漏れや順序の間違いが起きやすく、同じ処理を複数箇所で書くことになります。Facade パターンは、複雑なサブシステム群の操作をひとつの窓口クラスにまとめ、呼び出し側には「ウェルカムメールを送る」のような高水準のメソッドだけを公開します。この記事ではメール送信システムを題材に Facade の構造を示し、Java 17 の record で設定値をまとめる方法と、Facade を適用すべき場面の判断基準を整理します。",
    useCases: [
      "メール送信で SMTP 接続・テンプレート適用・監査ログ記録を1メソッドにまとめ、呼び出し側は宛先と名前だけ指定する",
      "帳票出力でデータ取得・フォーマット変換・PDF 生成・ファイル保存を Facade に隠蔽し、バッチからはワンコールで呼ぶ",
      "ユーザー登録処理で DB 保存・メール送信・監査ログ・キャッシュ更新を Facade に集約し、Controller を薄く保つ",
    ],
    cautions: [
      "Facade にロジックを詰め込みすぎると God Class になる。Facade はサブシステムへの委譲に徹し、ビジネスロジック自体はサブシステムに持たせる",
      "Facade はサブシステムへのアクセスを「隠す」のではなく「簡単にする」もの。必要に応じてサブシステムを直接使うことも許容する設計が望ましい",
      "Facade が増えすぎると、どの Facade がどのサブシステムを管理しているかが不明確になる。1つの Facade が扱うサブシステムは3〜5つ程度に留める",
    ],
    relatedArticleSlugs: ["adapter-pattern", "composite-pattern"],
    versionCoverage: {
      java8: "設定値を通常クラスやコンストラクタ引数で受け渡す。Map の初期化は HashMap を new して put を繰り返す必要がある。",
      java17: "record で設定値を不変オブジェクトとしてまとめて管理でき、var（JEP 286）でサブシステムの呼び出しコードが簡潔になる。",
      java21: "record パターンマッチングで設定値のフィールドを直接取り出して使えるため、Facade 内のコードがさらに簡潔になる。",
      java8Code: `// Java 8: 設定を個別の引数で渡す
SmtpClient smtp = new SmtpClient();
smtp.connect(host);
smtp.authenticate(user, password);
String template = engine.loadTemplate("welcome");
Map<String, String> vars = new HashMap<>();
vars.put("userName", name);`,
      java17Code: `// Java 17: record で設定をまとめて管理
record EmailConfig(String host, String user, String pass) {}
var config = new EmailConfig("smtp.example.com", "user", "pw");
var facade = new EmailFacade(config);
facade.sendWelcomeEmail("to@example.com", "山田");`,
      java21Code: `// Java 21: record パターンで設定値を分解
void init(EmailConfig config) {
    if (config instanceof EmailConfig(
            var host, var user, var pass)) {
        smtp.connect(host);
        smtp.authenticate(user, pass);
    }
}`,
    },
    libraryComparison: [
      { name: "標準 API（クラス + record）", whenToUse: "サブシステムの数が限られ、統合ロジックを自前で管理するとき。", tradeoff: "サブシステムが増えると Facade のメソッド数も増える傾向がある。" },
      { name: "Spring（@Service）", whenToUse: "DI コンテナでサブシステムの依存を注入し、Service 層を Facade として使うとき。", tradeoff: "Spring の流儀に従う形になるが、設計の意図は同じ。" },
    ],
    faq: [
      { question: "Facade パターンと Service 層は同じですか。", answer: "考え方は近いです。Service 層がサブシステムの操作をまとめて高水準のメソッドを提供するなら、それは Facade パターンの適用と見なせます。" },
      { question: "Facade を経由せずサブシステムを直接使ってもよいですか。", answer: "構いません。Facade はアクセスの簡略化が目的であり、サブシステムの直接利用を禁止するものではありません。" },
      { question: "Facade が肥大化してきた場合はどうすればよいですか。", answer: "責務ごとに Facade を分割してください。メール送信、帳票出力、ユーザー管理など、業務ドメインに沿った単位で分けるのが自然です。" },
    ],
    codeTitle: "FacadePatternSample.java",
    codeSample: `import java.util.HashMap;
import java.util.Map;

public class FacadePatternSample {

    // 設定値を record でまとめる（Java 17+）
    record EmailConfig(String host, String user, String password) {}

    // サブシステム1: SMTP
    static class SmtpClient {
        void connect(String host) { System.out.println("[SMTP] 接続: " + host); }
        void authenticate(String user, String pass) {
            System.out.println("[SMTP] 認証: " + user);
        }
        void send(String to, String subject, String body) {
            System.out.println("[SMTP] 送信: " + to + " / " + subject);
        }
        void disconnect() { System.out.println("[SMTP] 切断"); }
    }

    // サブシステム2: テンプレートエンジン
    static class TemplateEngine {
        String render(String template, Map<String, String> vars) {
            var result = template;
            for (var e : vars.entrySet()) {
                result = result.replace("{{" + e.getKey() + "}}", e.getValue());
            }
            return result;
        }
    }

    // サブシステム3: 監査ログ
    static class AuditLogger {
        void logSend(String to, String subject) {
            System.out.println("[AUDIT] " + to + " / " + subject);
        }
    }

    // Facade: サブシステムを統合
    static class EmailFacade {
        private final SmtpClient smtp = new SmtpClient();
        private final TemplateEngine engine = new TemplateEngine();
        private final AuditLogger audit = new AuditLogger();
        private final EmailConfig config;

        EmailFacade(EmailConfig config) { this.config = config; }

        void sendWelcomeEmail(String to, String userName) {
            smtp.connect(config.host());
            smtp.authenticate(config.user(), config.password());
            var vars = new HashMap<String, String>();
            vars.put("userName", userName);
            var body = engine.render(
                "こんにちは、{{userName}} さん！", vars);
            var subject = "ご登録ありがとうございます";
            smtp.send(to, subject, body);
            smtp.disconnect();
            audit.logSend(to, subject);
        }
    }

    public static void main(String[] args) {
        var config = new EmailConfig("smtp.example.com", "user", "pw");
        var facade = new EmailFacade(config);
        facade.sendWelcomeEmail("yamada@example.com", "山田");
    }
}`,
  },
{
    slug: "flyweight-pattern",
    title: "Java Flyweight パターンでオブジェクト共有によりメモリを節約する",
    categorySlug: "patterns",
    summary: "同一属性のオブジェクトをキャッシュで共有し、大量生成時のメモリ消費を抑える Flyweight の実装。",
    version: "Java 17",
    tags: ["Flyweight", "GoF", "構造パターン", "メモリ最適化", "キャッシュ"],
    apiNames: ["HashMap", "Map.computeIfAbsent", "record", "Integer.valueOf"],
    description: "Java の Flyweight パターンで同一属性のオブジェクトをキャッシュ共有し、大量オブジェクト生成時のメモリ消費を削減する方法を Java 8/17/21 対応で示す。",
    lead: "テキストエディタで1文字ごとにフォント情報を持つオブジェクトを生成すると、数万文字のドキュメントで膨大なメモリを消費します。しかし実際に使われるフォントの組み合わせは数種類程度で、大半のオブジェクトは同じ属性を持っています。Flyweight パターンは、共有可能な「内部状態（intrinsic state）」をキャッシュで使い回し、オブジェクトごとに異なる「外部状態（extrinsic state）」はメソッド引数で渡す構造を作ります。Java 標準ライブラリでも Integer.valueOf がキャッシュ（-128〜127）を使って同じ考え方を適用しています。この記事ではフォント描画を題材に Flyweight の構造を示し、Java 17 の record で Flyweight を不変オブジェクトとして定義する方法を確認します。",
    useCases: [
      "テキストエディタでフォント情報（書体・サイズ・色）を共有し、数万文字の描画でもメモリ消費を一定に抑える",
      "地図アプリケーションでアイコン画像（種別・サイズ）を共有し、数千のピンを表示してもメモリを節約する",
      "ゲームの粒子エフェクトでテクスチャや色の組み合わせを共有し、大量のパーティクル生成を効率化する",
    ],
    cautions: [
      "Flyweight は内部状態が不変であることが前提。可変な状態を共有すると、一箇所の変更が全参照に波及する",
      "キャッシュの Map がクリアされない場合、メモリリークの原因になる。長時間稼働するアプリでは WeakHashMap やサイズ制限付きキャッシュを検討する",
      "外部状態をメソッド引数で渡す設計は、呼び出し側の責任が増える。外部状態の管理が複雑になる場合は Flyweight の適用を見直す",
      "Integer.valueOf の -128〜127 のキャッシュは Flyweight の典型例。== で比較すると範囲外の値で予期しない結果になるため、equals を使うこと",
    ],
    relatedArticleSlugs: ["composite-pattern", "proxy-pattern"],
    versionCoverage: {
      java8: "Flyweight を通常クラスで定義し、toString・equals・hashCode を手書きする。キャッシュの取得には containsKey + put を使う。",
      java17: "record で Flyweight を定義すると equals・hashCode・toString が自動生成され、不変性も保証される。computeIfAbsent でキャッシュ取得も簡潔。",
      java21: "基本構造は Java 17 と同じだが、switch パターンマッチングで Flyweight の型による分岐が書ける。",
      java8Code: `// Java 8: 通常クラスで Flyweight を定義
static class CharFont {
    private final String family;
    private final int size;
    CharFont(String family, int size) {
        this.family = family; this.size = size;
    }
}
// キャッシュ取得
if (!cache.containsKey(key)) {
    cache.put(key, new CharFont(family, size));
}
return cache.get(key);`,
      java17Code: `// Java 17: record で不変 Flyweight を定義
record CharFont(String family, int size, String color) {
    void render(char c, int x, int y) {
        System.out.println(c + " at (" + x + "," + y + ")");
    }
}
// computeIfAbsent でキャッシュ取得
return cache.computeIfAbsent(key,
    k -> new CharFont(family, size, color));`,
      java21Code: `// Java 21: record + switch（型安全な Flyweight 管理）
sealed interface FontStyle
        permits FontStyle.Normal, FontStyle.Bold {
    record Normal(String family) implements FontStyle {}
    record Bold(String family) implements FontStyle {}
}
String desc = switch (style) {
    case FontStyle.Normal n -> n.family();
    case FontStyle.Bold b -> b.family() + " Bold";
};`,
    },
    libraryComparison: [
      { name: "標準 API（HashMap + record）", whenToUse: "共有対象の属性が少なく、キャッシュを自前で管理できるとき。", tradeoff: "キャッシュのサイズ管理やクリア戦略は自前で実装する必要がある。" },
      { name: "Guava Cache（CacheBuilder）", whenToUse: "サイズ上限・有効期限・自動削除などキャッシュの高度な管理が必要なとき。", tradeoff: "Guava 全体を依存に追加する必要がある。単純な Flyweight には過剰。" },
      { name: "Caffeine", whenToUse: "高性能キャッシュが必要で、Guava Cache よりも高いスループットを求めるとき。", tradeoff: "単純なオブジェクト共有だけなら HashMap + computeIfAbsent で十分。" },
    ],
    faq: [
      { question: "Flyweight パターンはどのくらいメモリを節約できますか。", answer: "共有できるオブジェクトの割合に依存します。フォント描画の例では、数万文字でも実際のフォントオブジェクトは数個で済むため、99%以上のメモリ削減が見込めます。" },
      { question: "Integer.valueOf のキャッシュは Flyweight パターンですか。", answer: "はい。-128〜127 の Integer オブジェクトをキャッシュで共有する設計は Flyweight の典型例です。この範囲外では新しいオブジェクトが生成されます。" },
      { question: "String のインターンプールも Flyweight ですか。", answer: "同じ考え方です。String.intern() はプール内の同一文字列を共有し、メモリ消費を抑えます。ただし大量の文字列をインターンするとプール自体が膨らむため注意が必要です。" },
    ],
    codeTitle: "FlyweightPatternSample.java",
    codeSample: `import java.util.HashMap;
import java.util.Map;

public class FlyweightPatternSample {

    // Flyweight: record で不変オブジェクトとして定義（Java 17+）
    record CharFont(String fontFamily, int fontSize, String color) {
        void render(char character, int x, int y) {
            System.out.println("  '" + character + "' at (" + x + "," + y
                + ") [" + fontFamily + " " + fontSize + "pt " + color + "]");
        }
    }

    // Flyweight Factory: キャッシュで共有管理
    static class FontFactory {
        private final Map<String, CharFont> cache = new HashMap<>();

        CharFont getFont(String family, int size, String color) {
            var key = family + "_" + size + "_" + color;
            return cache.computeIfAbsent(key,
                k -> new CharFont(family, size, color));
        }

        int getCacheSize() { return cache.size(); }
    }

    public static void main(String[] args) {
        var factory = new FontFactory();

        // 同じフォントを共有して描画
        var text = "Hello";
        for (int i = 0; i < text.length(); i++) {
            var font = factory.getFont("Arial", 12, "black");
            font.render(text.charAt(i), i * 10, 0);
        }

        // 別フォントを取得
        var bold = factory.getFont("Arial", 16, "red");
        bold.render('!', 50, 0);

        System.out.println("\\nオブジェクト数: " + factory.getCacheSize());
        System.out.println("描画回数: " + (text.length() + 1));

        // record の equals で同一性を確認
        var f1 = factory.getFont("Arial", 12, "black");
        var f2 = factory.getFont("Arial", 12, "black");
        System.out.println("同一インスタンス: " + (f1 == f2)); // true
    }
}`,
  },
{
    slug: "proxy-pattern",
    title: "Java Proxy パターンで遅延初期化とアクセス制御を実装する",
    categorySlug: "patterns",
    summary: "仮想プロキシによる遅延ロードとアクセス制御プロキシで、実オブジェクトへのアクセスを安全に制御する。",
    version: "Java 17",
    tags: ["Proxy", "GoF", "構造パターン", "遅延初期化", "アクセス制御"],
    apiNames: ["java.lang.reflect.Proxy", "InvocationHandler", "record"],
    description: "Java の Proxy パターンで遅延初期化とアクセス制御を実装し、実オブジェクトへのアクセスを安全に制御する方法を Java 8/17/21 対応で整理する。",
    lead: "画像の遅延ロード、API 呼び出しのキャッシュ、権限に基づくアクセス制御――これらは「実オブジェクトの手前に代理を置く」ことで実現できます。Proxy パターンは、Subject インターフェースを共有する代理オブジェクト（Proxy）が実オブジェクト（RealSubject）へのアクセスを仲介し、追加の制御を行う構造です。用途に応じて、仮想プロキシ（遅延初期化）、保護プロキシ（アクセス制御）、リモートプロキシ（ネットワーク越しの呼び出し）に分類されます。この記事では画像ローダーを題材に、仮想プロキシとアクセス制御プロキシの2つを実装し、Decorator パターンとの違い、Java 標準の java.lang.reflect.Proxy との関連を整理します。",
    useCases: [
      "画像ビューアで表示されるまでロードを遅延し、スクロールして見える範囲に入ったときだけ実体を生成する",
      "ユーザーのロール（ADMIN / USER / GUEST）に応じてリソースへのアクセスを制御し、権限がなければ操作を拒否する",
      "外部 API の呼び出し結果をキャッシュするプロキシを挟み、一定時間内の再呼び出しではキャッシュを返す",
    ],
    cautions: [
      "Proxy と Decorator は構造が似ているが、Proxy はアクセス制御や遅延初期化が目的、Decorator は機能追加が目的。設計意図を明確にしないと混同しやすい",
      "仮想プロキシの遅延初期化はスレッドセーフでない場合がある。マルチスレッド環境では synchronized や volatile を使った二重チェックが必要",
      "アクセス制御プロキシで SecurityException を投げる場合、呼び出し側での例外処理を忘れないこと",
      "java.lang.reflect.Proxy は動的プロキシを生成する標準 API だが、インターフェースにしか適用できない。クラスの動的プロキシには CGLIB などが必要",
    ],
    relatedArticleSlugs: ["decorator-pattern", "flyweight-pattern"],
    versionCoverage: {
      java8: "Proxy クラスを通常のクラスで定義し、型を明示する。アクセス制御の結果は文字列やブール値で返すことが多い。",
      java17: "record でアクセス制御の結果を型安全に表現できる。var で Proxy の呼び出しコードが簡潔になる。",
      java21: "sealed interface + switch でアクセス制御の結果を網羅的に処理できる。record パターンマッチングとの相性もよい。",
      java8Code: `// Java 8: 型を明示して Proxy を使う
ImageLoader proxy = new LazyImageProxy("/images/photo.jpg");
proxy.display(); // ここで初めてロード

// アクセス制御
ImageLoader secured = new AccessControlProxy(proxy, "ADMIN");
secured.display();`,
      java17Code: `// Java 17: var + record でアクセス結果を管理
var proxy = new LazyImageProxy("/images/photo.jpg");
proxy.display();

record ProxyResult(boolean allowed, String message) {
    static ProxyResult ok(String msg) {
        return new ProxyResult(true, msg);
    }
}
var result = ProxyResult.ok("ロール=ADMIN");`,
      java21Code: `// Java 21: sealed interface でアクセス結果を型安全に
sealed interface AccessResult
        permits AccessResult.Allowed, AccessResult.Denied {
    record Allowed(String role) implements AccessResult {}
    record Denied(String reason) implements AccessResult {}
}
switch (result) {
    case AccessResult.Allowed a -> delegate.display();
    case AccessResult.Denied d ->
        System.out.println("拒否: " + d.reason());
}`,
    },
    libraryComparison: [
      { name: "標準 API（interface + 委譲）", whenToUse: "遅延初期化やアクセス制御の対象が限られ、静的にプロキシクラスを定義できるとき。", tradeoff: "対象クラスごとにプロキシクラスを書く必要がある。" },
      { name: "java.lang.reflect.Proxy", whenToUse: "インターフェースの動的プロキシを実行時に生成したいとき。AOP 的な横断関心事の実装に使える。", tradeoff: "インターフェースにしか適用できない。パフォーマンスも静的プロキシに劣る。" },
      { name: "CGLIB / ByteBuddy", whenToUse: "クラスベースの動的プロキシが必要なとき。Spring AOP の内部でも使われている。", tradeoff: "バイトコード生成を伴うため、デバッグやトレースが複雑になる。" },
    ],
    faq: [
      { question: "Proxy パターンと Decorator パターンはどう違いますか。", answer: "Proxy はアクセス制御・遅延初期化など「実オブジェクトへのアクセスを仲介する」のが目的です。Decorator は「機能を追加する」のが目的で、構造は似ていますが設計意図が異なります。" },
      { question: "仮想プロキシの遅延初期化はスレッドセーフですか。", answer: "単純な null チェックだけではスレッドセーフではありません。マルチスレッド環境では synchronized ブロックか volatile + double-checked locking を使ってください。" },
      { question: "java.lang.reflect.Proxy はどのような場面で使いますか。", answer: "AOP 的な横断関心事（ログ・トランザクション・認証）を動的に適用したいときに使います。Spring AOP の内部でも同じ仕組みが使われています。" },
    ],
    codeTitle: "ProxyPatternSample.java",
    codeSample: `public class ProxyPatternSample {

    // アクセス結果を record で表現（Java 17+）
    record ProxyResult(boolean allowed, String message) {
        static ProxyResult ok(String msg) {
            return new ProxyResult(true, msg);
        }
        static ProxyResult denied(String reason) {
            return new ProxyResult(false, "拒否: " + reason);
        }
    }

    // Subject インターフェース
    interface ImageLoader {
        void display();
    }

    // RealSubject
    static class RealImageLoader implements ImageLoader {
        private final String path;
        public RealImageLoader(String path) {
            this.path = path;
            System.out.println("[Real] ロード: " + path);
        }
        @Override
        public void display() {
            System.out.println("[Real] 表示: " + path);
        }
    }

    // 仮想プロキシ: 遅延初期化
    static class LazyImageProxy implements ImageLoader {
        private final String path;
        private RealImageLoader real;

        public LazyImageProxy(String path) {
            this.path = path;
            System.out.println("[Proxy] 作成: " + path);
        }

        @Override
        public void display() {
            if (real == null) {
                real = new RealImageLoader(path);
            }
            real.display();
        }
    }

    // アクセス制御プロキシ
    static class AccessControlProxy implements ImageLoader {
        private final ImageLoader delegate;
        private final String userRole;

        public AccessControlProxy(ImageLoader delegate, String role) {
            this.delegate = delegate;
            this.userRole = role;
        }

        @Override
        public void display() {
            var result = checkAccess();
            if (!result.allowed()) {
                throw new SecurityException(result.message());
            }
            System.out.println("[AccessProxy] 許可: " + result.message());
            delegate.display();
        }

        private ProxyResult checkAccess() {
            if ("ADMIN".equals(userRole) || "USER".equals(userRole)) {
                return ProxyResult.ok("ロール=" + userRole);
            }
            return ProxyResult.denied("権限なし: " + userRole);
        }
    }

    public static void main(String[] args) {
        // 仮想プロキシ
        var img = new LazyImageProxy("/images/photo.jpg");
        System.out.println("-- まだロードされていない --");
        img.display(); // ここでロード
        img.display(); // キャッシュ済み

        System.out.println();

        // アクセス制御プロキシ
        var secured = new AccessControlProxy(
            new LazyImageProxy("/images/secret.jpg"), "ADMIN");
        secured.display();

        try {
            var guest = new AccessControlProxy(
                new LazyImageProxy("/images/secret.jpg"), "GUEST");
            guest.display();
        } catch (SecurityException e) {
            System.out.println("例外: " + e.getMessage());
        }
    }
}`,
  },
{
  slug: "chain-of-responsibility",
  title: "Java Chain of Responsibility 実装と適用判断",
  categorySlug: "patterns",
  summary: "ログフィルタリングを題材に、処理の連鎖を柔軟に組み替えられる Chain of Responsibility パターンを解説する。",
  version: "Java 17",
  tags: ["Chain of Responsibility", "デザインパターン", "ログ", "振る舞いパターン"],
  apiNames: ["abstract class", "enum", "record", "LocalDateTime"],
  description: "Java の Chain of Responsibility パターンをログフィルタリングで実装し、Java 8/17/21 の違いと実務での適用判断を外部ライブラリ不要で解説する。",
  lead: "リクエストやイベントを複数のハンドラーに順番に渡し、処理できるハンドラーが対応する。この構造は、ログレベルに応じた出力先の切り替えや、承認ワークフローの段階的なエスカレーションなど、業務システムでも頻繁に現れます。Chain of Responsibility パターンは、処理の連鎖を動的に組み替えられる点が特徴ですが、チェーンが長くなるとデバッグが難しくなる側面もあります。この記事では、ログフィルタリングを題材にパターンの構造を実装し、閾値による振り分けやチェーンの組み立て方を整理します。record によるログデータの不変化、sealed interface による型安全なイベント表現まで、バージョンごとの書き方の違いも確認します。",
  useCases: [
    "ログレベル（DEBUG / INFO / WARN / ERROR）に応じてコンソール・ファイル・メール通知の出力先を振り分ける",
    "経費申請の金額に応じて担当者 → 課長 → 部長 → 役員と承認権限をエスカレーションする",
    "入力バリデーションを形式チェック → 桁数チェック → 業務ルールチェックの順に連鎖させ、途中で失敗したら後続をスキップする",
  ],
  cautions: [
    "チェーンの末端までどのハンドラーも処理しなかった場合の挙動を明示しておくこと。デフォルトハンドラーを末尾に置くか、例外を投げるかは設計時に決める",
    "setNext の戻り値を次のハンドラーにすると consoleHandler.setNext(fileHandler).setNext(emailHandler) のようにチェーンで組めるが、先頭ハンドラーの参照を見失いやすいので変数に保持しておく",
    "ハンドラーの順序を間違えると意図しないフィルタリングになる。閾値が高い順に並べるか低い順に並べるかは、処理を通すか止めるかの設計と合わせて検討する",
    "チェーンが循環すると無限ループになる。setNext で自分自身や既にチェーンにいるハンドラーを設定しないようガードを入れることも検討する",
  ],
  relatedArticleSlugs: ["template-method", "observer-pattern"],
  versionCoverage: {
    java8: "ログデータは String で受け渡し、ハンドラーの型宣言にジェネリクスのダイヤモンド省略が使えない場面がある。",
    java17: "record でログデータ（LogRecord）を不変オブジェクトとして定義でき、var でチェーン構築が簡潔になる。",
    java21: "sealed interface + switch パターンマッチングでイベント種別を型安全に分岐し、網羅性チェックが効く。",
    java8Code: `// Java 8: handle は String でメッセージを受け渡す
public final void handle(LogLevel level, String message) {
    if (level.getLevel() >= threshold.getLevel()) {
        writeLog(message);
    }
    if (next != null) {
        next.handle(level, message);
    }
}`,
    java17Code: `// Java 17: record でログデータを不変オブジェクト化
record LogRecord(LogLevel level, String message,
                 LocalDateTime timestamp) {}

public final void handle(LogRecord record) {
    if (record.level().getLevel() >= threshold.getLevel()) {
        writeLog(record);
    }
    if (next != null) { next.handle(record); }
}`,
    java21Code: `// Java 21: sealed interface + switch パターンマッチング
sealed interface LogEvent permits LogEvent.Debug,
    LogEvent.Info, LogEvent.Warn, LogEvent.Error {
    record Debug(String message) implements LogEvent {}
    record Info(String message) implements LogEvent {}
    record Warn(String message) implements LogEvent {}
    record Error(String message, Throwable cause)
            implements LogEvent {}
}
static int getSeverity(LogEvent event) {
    return switch (event) {
        case LogEvent.Debug d  -> 1;
        case LogEvent.Info i   -> 2;
        case LogEvent.Warn w   -> 3;
        case LogEvent.Error e  -> 4;
        // sealed なので漏れるとコンパイルエラー
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（abstract class チェーン）", whenToUse: "ハンドラーの数が少なく、処理の流れが直線的な場面。依存なしで完結する。", tradeoff: "チェーンの動的な組み替えが必要になると管理コードが増える。" },
    { name: "Spring HandlerInterceptor", whenToUse: "Web アプリケーションのリクエスト処理パイプラインで、認証・ログ・権限チェックを連鎖させる場合。", tradeoff: "Spring 依存になるため、バッチやライブラリ単体では使えない。" },
    { name: "Jakarta Servlet Filter", whenToUse: "Servlet ベースの Web アプリで、リクエスト/レスポンスのフィルタリングを行う場合。", tradeoff: "Servlet コンテナ前提のため、非 Web のユースケースには適用できない。" },
  ],
  faq: [
    { question: "Chain of Responsibility と Decorator はどう違いますか。", answer: "Chain はリクエストを処理できるハンドラーが担当する構造で、途中で止まることがあります。Decorator は常に元の処理を呼び出したうえで機能を追加する構造で、チェーン全体が必ず実行されます。" },
    { question: "チェーンの途中でリクエストを止めたい場合はどう実装しますか。", answer: "handle メソッド内で next.handle() を呼ばなければ後続に渡りません。boolean の戻り値で処理済みかを返す設計も有効です。" },
    { question: "java.util.logging の Handler もこのパターンですか。", answer: "Logger に複数の Handler を登録する仕組みは広義の Chain of Responsibility です。ただし標準 API は連鎖ではなくリスト走査で全 Handler に通知する設計です。" },
  ],
  codeTitle: "ChainOfResponsibilityDemo.java",
  codeSample: `import java.time.LocalDateTime;

public class ChainOfResponsibilityDemo {

    enum LogLevel {
        DEBUG(1), INFO(2), WARN(3), ERROR(4);
        private final int level;
        LogLevel(int level) { this.level = level; }
        public int getLevel() { return level; }
    }

    record LogRecord(LogLevel level, String message,
                     LocalDateTime timestamp) {
        public String format() {
            return "[" + timestamp + "][" + level + "] " + message;
        }
    }

    static abstract class LogHandler {
        private final LogLevel threshold;
        private LogHandler next;

        public LogHandler(LogLevel threshold) {
            this.threshold = threshold;
        }

        public LogHandler setNext(LogHandler next) {
            this.next = next;
            return next;
        }

        public final void handle(LogRecord record) {
            if (record.level().getLevel() >= threshold.getLevel()) {
                writeLog(record);
            }
            if (next != null) {
                next.handle(record);
            }
        }

        protected abstract void writeLog(LogRecord record);
    }

    static class ConsoleHandler extends LogHandler {
        public ConsoleHandler() { super(LogLevel.WARN); }
        @Override
        protected void writeLog(LogRecord record) {
            System.out.println("[CONSOLE] " + record.format());
        }
    }

    static class FileHandler extends LogHandler {
        public FileHandler() { super(LogLevel.ERROR); }
        @Override
        protected void writeLog(LogRecord record) {
            System.out.println("[FILE] " + record.format());
        }
    }

    static class EmailHandler extends LogHandler {
        public EmailHandler() { super(LogLevel.ERROR); }
        @Override
        protected void writeLog(LogRecord record) {
            System.out.println("[EMAIL] " + record.format());
        }
    }

    public static void main(String[] args) {
        var console = new ConsoleHandler();
        console.setNext(new FileHandler())
               .setNext(new EmailHandler());

        var now = LocalDateTime.now();
        console.handle(new LogRecord(LogLevel.DEBUG, "接続確立", now));
        console.handle(new LogRecord(LogLevel.WARN, "ディスク80%超過", now));
        console.handle(new LogRecord(LogLevel.ERROR, "DB接続失敗", now));
    }
}`,
},
{
  slug: "command-pattern",
  title: "Java Command パターンで Undo/Redo を実装する",
  categorySlug: "patterns",
  summary: "テキストエディタを題材に、操作のオブジェクト化と Undo/Redo 履歴管理を Command パターンで実装する。",
  version: "Java 17",
  tags: ["Command", "デザインパターン", "Undo", "Redo", "振る舞いパターン"],
  apiNames: ["Deque", "ArrayDeque", "record", "interface"],
  description: "Java の Command パターンをテキストエディタの Undo/Redo で実装し、Java 8/17/21 の違いと設計上の注意点を外部ライブラリ不要で解説する。",
  lead: "操作そのものをオブジェクトとして表現し、実行・取り消し・やり直しを統一的に扱う。Command パターンは、テキストエディタの Undo/Redo やマクロ記録、トランザクションの補償処理など、操作の履歴管理が必要な場面で広く使われます。操作をオブジェクト化することで、実行と取り消しのロジックを1つのクラスに閉じ込められ、履歴のスタック管理も自然に書けます。この記事では、テキストエディタの挿入・削除操作を Command として実装し、Deque による Undo/Redo スタックの管理方法を整理します。Java 17 の record で操作結果を簡潔に返す方法、Java 21 の sealed interface でコマンドの種類を型安全に限定する方法も確認します。",
  useCases: [
    "テキストエディタの挿入・削除操作を Command オブジェクトとして記録し、Ctrl+Z / Ctrl+Y で Undo/Redo する",
    "業務システムの一括更新処理をコマンド列として構築し、途中でエラーが起きたら逆順に補償トランザクションを実行する",
    "ユーザーの操作ログをコマンドオブジェクトとして保存し、操作の再生やマクロ実行に利用する",
  ],
  cautions: [
    "DeleteCommand の undo で元のテキストを復元するためには、execute 時に削除した文字列を保持しておく必要がある。保存し忘れると undo で復元できない",
    "Redo スタックは新しいコマンドを実行したらクリアするのが一般的。クリアしないと Undo → 新操作 → Redo で不整合が起きる",
    "コマンドオブジェクトが Receiver（エディタ等）への参照を保持するため、履歴が長くなるとメモリを圧迫する。履歴件数の上限を設けることを検討する",
    "マルチスレッド環境でコマンド履歴を共有する場合は同期が必要。ConcurrentLinkedDeque や synchronized ブロックでの保護を検討する",
  ],
  relatedArticleSlugs: ["memento-pattern", "strategy-pattern"],
  versionCoverage: {
    java8: "コマンド結果は個別の getter メソッドで返すか、専用クラスを書く必要がある。Deque のジェネリクスも冗長。",
    java17: "record で CommandResult を定義でき、コマンド実行結果を簡潔に表現できる。var による型推論で履歴操作も読みやすい。",
    java21: "sealed interface でコマンドの種類（Insert / Delete / Clear）を型安全に限定し、switch パターンマッチングで分岐できる。",
    java8Code: `// Java 8: コマンド結果をフィールドで個別に返す
public void execute(Command command) {
    command.execute();
    history.push(command);
    redoStack.clear();
}
public int getHistorySize() {
    return history.size();
}`,
    java17Code: `// Java 17: record で実行結果をまとめて返す
record CommandResult(boolean success,
    String currentText, int historySize) {}

public CommandResult execute(Command cmd, TextEditor ed) {
    cmd.execute();
    history.push(cmd);
    redoStack.clear();
    return new CommandResult(true, ed.getText(),
                             history.size());
}`,
    java21Code: `// Java 21: sealed interface でコマンド種別を型安全に
sealed interface EditCommand
    permits EditCommand.Insert, EditCommand.Delete {
    record Insert(int pos, String str)
            implements EditCommand {}
    record Delete(int pos, int len, String deleted)
            implements EditCommand {}
}
// switch パターンマッチングで undo コマンドを生成
static EditCommand applyCommand(TextEditor ed,
                                 EditCommand cmd) {
    return switch (cmd) {
        case EditCommand.Insert(int p, String s) -> {
            ed.insertText(p, s);
            yield new EditCommand.Delete(p, s.length(), s);
        }
        case EditCommand.Delete(int p, int l, String d) -> {
            String text = ed.getText().substring(p, p + l);
            ed.deleteText(p, l);
            yield new EditCommand.Insert(p, text);
        }
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（interface + Deque）", whenToUse: "Undo/Redo の履歴管理を自前で制御したい場面。外部依存なしで完結する。", tradeoff: "マクロ記録やバッチ実行など高度な機能が必要になると自前のコードが増える。" },
    { name: "javax.swing.undo.UndoManager", whenToUse: "Swing アプリケーションで UndoableEdit を使ったテキスト編集の Undo/Redo を行う場合。", tradeoff: "Swing 前提のため、Web やバッチ処理では利用できない。" },
  ],
  faq: [
    { question: "Command パターンと Strategy パターンの違いは何ですか。", answer: "Command は操作のオブジェクト化で、実行と取り消しをセットにします。Strategy はアルゴリズムの差し替えが目的で、取り消しの概念は含みません。" },
    { question: "Undo の上限を設けるにはどうすればよいですか。", answer: "Deque のサイズが上限を超えたら removeLast() で古い履歴を破棄します。LinkedList ベースの Deque なら O(1) で末尾を除去できます。" },
    { question: "マクロ記録はどう実現しますか。", answer: "コマンドのリストを保持する MacroCommand を作り、execute で全コマンドを順に実行します。GoF の Composite と組み合わせた形です。" },
  ],
  codeTitle: "CommandPatternDemo.java",
  codeSample: `import java.util.ArrayDeque;
import java.util.Deque;

public class CommandPatternDemo {

    static class TextEditor {
        private StringBuilder text = new StringBuilder();
        public void insertText(int pos, String str) {
            text.insert(pos, str);
        }
        public void deleteText(int pos, int len) {
            text.delete(pos, pos + len);
        }
        public String getText() { return text.toString(); }
    }

    interface Command {
        void execute();
        void undo();
    }

    static class InsertCommand implements Command {
        private final TextEditor editor;
        private final int pos;
        private final String str;
        public InsertCommand(TextEditor editor, int pos, String str) {
            this.editor = editor; this.pos = pos; this.str = str;
        }
        @Override public void execute() { editor.insertText(pos, str); }
        @Override public void undo() { editor.deleteText(pos, str.length()); }
    }

    static class DeleteCommand implements Command {
        private final TextEditor editor;
        private final int pos;
        private final int len;
        private String deletedText;
        public DeleteCommand(TextEditor editor, int pos, int len) {
            this.editor = editor; this.pos = pos; this.len = len;
        }
        @Override public void execute() {
            deletedText = editor.getText().substring(pos, pos + len);
            editor.deleteText(pos, len);
        }
        @Override public void undo() { editor.insertText(pos, deletedText); }
    }

    record CommandResult(boolean success, String text, int historySize) {}

    static class CommandHistory {
        private final Deque<Command> history = new ArrayDeque<>();
        private final Deque<Command> redoStack = new ArrayDeque<>();

        public CommandResult execute(Command cmd, TextEditor ed) {
            cmd.execute();
            history.push(cmd);
            redoStack.clear();
            return new CommandResult(true, ed.getText(), history.size());
        }
        public CommandResult undo(TextEditor ed) {
            if (history.isEmpty()) return new CommandResult(false, ed.getText(), 0);
            var cmd = history.pop();
            cmd.undo();
            redoStack.push(cmd);
            return new CommandResult(true, ed.getText(), history.size());
        }
        public CommandResult redo(TextEditor ed) {
            if (redoStack.isEmpty()) return new CommandResult(false, ed.getText(), history.size());
            var cmd = redoStack.pop();
            cmd.execute();
            history.push(cmd);
            return new CommandResult(true, ed.getText(), history.size());
        }
    }

    public static void main(String[] args) {
        var editor = new TextEditor();
        var history = new CommandHistory();

        var r1 = history.execute(new InsertCommand(editor, 0, "Hello"), editor);
        System.out.println("挿入後: " + r1.text());

        var r2 = history.execute(new InsertCommand(editor, 5, ", Java"), editor);
        System.out.println("挿入後: " + r2.text());

        var u1 = history.undo(editor);
        System.out.println("Undo後: " + u1.text());

        var rd = history.redo(editor);
        System.out.println("Redo後: " + rd.text());
    }
}`,
},
{
  slug: "interpreter-pattern",
  title: "Java Interpreter パターンで式評価を実装する",
  categorySlug: "patterns",
  summary: "四則演算の式ツリーを題材に、文法規則をクラスで表現する Interpreter パターンを解説する。",
  version: "Java 17",
  tags: ["Interpreter", "デザインパターン", "式評価", "振る舞いパターン", "sealed interface"],
  apiNames: ["sealed interface", "record", "instanceof"],
  description: "Java の Interpreter パターンを四則演算の式ツリーで実装し、sealed interface と record による型安全な構文木の表現を Java 8/17/21 対応で解説する。",
  lead: "業務ルールや計算式をコードに直接埋め込むのではなく、文法規則として構造化する。Interpreter パターンは、四則演算や論理式の評価、設定ファイルの簡易パーサーなど、小さな言語を扱う場面で有効です。構文木の各ノードが自身の評価ロジックを持ち、再帰的に式全体を計算する仕組みは、コンパイラの教科書的な構成でもあります。ただし文法が複雑になると Expression クラスが膨れるため、適用範囲は限られます。この記事では、四則演算の式ツリーを題材に、終端式・非終端式の構造をクラスとして実装します。Java 17 の sealed interface + record で式の種類を型安全に限定し、Java 21 の switch パターンマッチングで評価ロジックを外出しにする手法も確認します。",
  useCases: [
    "帳票テンプレートに埋め込まれた計算式（例: 「単価 * 数量 - 値引額」）を式ツリーに変換して動的に評価する",
    "ワークフローの条件分岐ルール（例: 「金額 > 10000 AND 部門 = 営業」）を論理式として解釈し、承認要否を判定する",
    "設定ファイル中の簡易DSL（独自記法）をパースし、処理パラメータとして評価する",
  ],
  cautions: [
    "Interpreter パターンは文法規則が10種類を超えると管理しにくくなる。複雑な文法にはパーサージェネレーターやスクリプトエンジンを検討する",
    "式ツリーの深さに上限を設けないと、再帰呼び出しで StackOverflowError が発生する可能性がある",
    "ゼロ除算や型不一致など、評価時の例外処理を各 Expression で確実に行うこと。特に DivideExpression は right.interpret() == 0 のガードが必須",
    "sealed interface の permits リストに新しい式を追加すると、switch 文の網羅チェックでコンパイルエラーになる。これは安全性の面ではメリットだが、拡張頻度が高い場合は設計を見直す",
  ],
  relatedArticleSlugs: ["visitor-pattern", "composite-pattern"],
  versionCoverage: {
    java8: "Expression は通常の interface で定義し、各式は個別のクラスで実装する。toFormula では instanceof + キャストでフィールドにアクセスする。",
    java17: "sealed interface + record で式の種類を限定でき、instanceof パターンマッチングでキャスト不要になる。",
    java21: "switch パターンマッチングで record デコンストラクションが使え、interpret や toFormula を式クラスの外に切り出せる。",
    java8Code: `// Java 8: 個別クラス + instanceof キャスト
interface Expression {
    int interpret();
}
static class NumberExpression implements Expression {
    private final int value;
    NumberExpression(int value) { this.value = value; }
    @Override public int interpret() { return value; }
}
// toFormula は instanceof + キャストで分岐
if (expr instanceof NumberExpression) {
    NumberExpression num = (NumberExpression) expr;
    return String.valueOf(num.interpret());
}`,
    java17Code: `// Java 17: sealed interface + record で型安全に
sealed interface Expression
    permits NumberExpression, AddExpression,
            SubtractExpression, MultiplyExpression,
            DivideExpression {
    int interpret();
}
record NumberExpression(int value) implements Expression {
    @Override public int interpret() { return value; }
}
// instanceof パターンマッチングでキャスト不要
if (expr instanceof NumberExpression num) {
    return String.valueOf(num.value());
}`,
    java21Code: `// Java 21: switch + record デコンストラクション
// interpret を式クラスの外で定義できる
static int interpret(Expression expr) {
    return switch (expr) {
        case NumberExpression(var v) -> v;
        case AddExpression(var l, var r)
            -> interpret(l) + interpret(r);
        case DivideExpression(var l, var r) -> {
            int d = interpret(r);
            if (d == 0) throw new ArithmeticException();
            yield interpret(l) / d;
        }
        // sealed なので漏れるとコンパイルエラー
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（sealed interface + record）", whenToUse: "四則演算や簡易条件式など、文法規則が少ない場面。外部依存なしで完結する。", tradeoff: "文法が複雑になると Expression クラスが爆発的に増える。" },
    { name: "ANTLR", whenToUse: "BNF で定義できる本格的な文法のパーサーを生成したい場合。SQL サブセットやDSL の解析に向く。", tradeoff: "学習コストが高く、ビルド手順も増える。簡易な式評価には過剰。" },
    { name: "javax.script（Nashorn / GraalJS）", whenToUse: "JavaScript の式評価をそのまま流用したい場合。", tradeoff: "Nashorn は Java 15 で削除済み。GraalJS は別途依存が必要。" },
  ],
  faq: [
    { question: "Interpreter パターンと Visitor パターンはどう使い分けますか。", answer: "Interpreter は各ノードが自身の評価ロジックを持ちます。Visitor は評価ロジックをノードの外に分離し、複数の走査処理を追加しやすくします。式の種類が固定で処理を増やしたい場合は Visitor が有利です。" },
    { question: "式の評価結果を int 以外にするにはどうすればよいですか。", answer: "interpret の戻り値をジェネリクスや Object にする方法もありますが、型安全性が落ちます。sealed interface で Expression<T> とするか、結果を Value record でラップする方が安全です。" },
    { question: "業務で Interpreter パターンを使う場面は多いですか。", answer: "直接使う機会は多くありませんが、計算式や条件式の動的評価、テンプレートエンジンの内部構造など、知っておくと設計の引き出しが広がります。" },
  ],
  codeTitle: "InterpreterPatternDemo.java",
  codeSample: `public class InterpreterPatternDemo {

    sealed interface Expression
            permits NumberExpression, AddExpression,
                    SubtractExpression, MultiplyExpression,
                    DivideExpression {
        int interpret();
    }

    record NumberExpression(int value) implements Expression {
        @Override public int interpret() { return value; }
    }

    record AddExpression(Expression left, Expression right)
            implements Expression {
        @Override public int interpret() {
            return left.interpret() + right.interpret();
        }
    }

    record SubtractExpression(Expression left, Expression right)
            implements Expression {
        @Override public int interpret() {
            return left.interpret() - right.interpret();
        }
    }

    record MultiplyExpression(Expression left, Expression right)
            implements Expression {
        @Override public int interpret() {
            return left.interpret() * right.interpret();
        }
    }

    record DivideExpression(Expression left, Expression right)
            implements Expression {
        @Override public int interpret() {
            int divisor = right.interpret();
            if (divisor == 0) {
                throw new ArithmeticException("ゼロ除算");
            }
            return left.interpret() / divisor;
        }
    }

    static String toFormula(Expression expr) {
        if (expr instanceof NumberExpression num) {
            return String.valueOf(num.value());
        } else if (expr instanceof AddExpression add) {
            return "(" + toFormula(add.left()) + " + "
                       + toFormula(add.right()) + ")";
        } else if (expr instanceof SubtractExpression sub) {
            return "(" + toFormula(sub.left()) + " - "
                       + toFormula(sub.right()) + ")";
        } else if (expr instanceof MultiplyExpression mul) {
            return "(" + toFormula(mul.left()) + " * "
                       + toFormula(mul.right()) + ")";
        } else if (expr instanceof DivideExpression div) {
            return "(" + toFormula(div.left()) + " / "
                       + toFormula(div.right()) + ")";
        }
        return "?";
    }

    public static void main(String[] args) {
        // (3 + 5) * 2 - 4 = 12
        var expr = new SubtractExpression(
            new MultiplyExpression(
                new AddExpression(
                    new NumberExpression(3), new NumberExpression(5)),
                new NumberExpression(2)),
            new NumberExpression(4));

        System.out.println("式: " + toFormula(expr));
        System.out.println("結果: " + expr.interpret());

        // 式の再利用: base = 5 + 3 を2倍
        var base = new AddExpression(
            new NumberExpression(5), new NumberExpression(3));
        var doubled = new MultiplyExpression(base,
                                             new NumberExpression(2));
        System.out.println("base = " + toFormula(base)
                         + " = " + base.interpret());
        System.out.println("doubled = " + toFormula(doubled)
                         + " = " + doubled.interpret());
    }
}`,
},
{
  slug: "iterator-pattern",
  title: "Java Iterator パターンとカスタムコレクション実装",
  categorySlug: "patterns",
  summary: "Iterable/Iterator の実装とページング走査を題材に、内部構造を隠蔽して要素を走査する Iterator パターンを解説する。",
  version: "Java 17",
  tags: ["Iterator", "デザインパターン", "Iterable", "ページング", "振る舞いパターン"],
  apiNames: ["Iterator", "Iterable", "NoSuchElementException", "record"],
  description: "Java の Iterator パターンをカスタムコレクションとページング走査で実装し、Java 8/17/21 の違いと落とし穴を外部ライブラリ不要で解説する。",
  lead: "コレクションの内部構造を公開せずに、要素を1つずつ取り出せるようにする。Java の拡張 for 文（for-each）は Iterable インターフェースの iterator() メソッドを呼び出しており、Iterator パターンそのものです。標準の ArrayList や HashMap を使う限り意識する必要は薄いですが、独自のデータ構造を for-each で走査したい場合や、ページング付きのイテレーションが必要な場合には、Iterator を自作する場面が出てきます。この記事では、カスタムコレクションに Iterable を実装して for-each 対応にする方法と、record を使ったページ情報の表現、Java 21 の sealed interface で走査戦略を型安全に定義する方法を整理します。",
  useCases: [
    "自作のツリー構造やグラフ構造を for-each ループで走査できるよう、Iterable インターフェースを実装する",
    "検索結果を1ページずつ取得するページングイテレータを実装し、大量データの一括取得を避ける",
    "データベースの ResultSet をラップし、ビジネスオブジェクトの Iterator として返す共通ユーティリティを作る",
  ],
  cautions: [
    "hasNext() を呼ばずに next() を呼ぶと NoSuchElementException が発生する。ドキュメントやコードレビューで必ず hasNext() チェックを徹底する",
    "Iterator は1回限りの走査が基本。複数回走査したい場合は Iterable.iterator() で新しいインスタンスを生成する設計にすること",
    "走査中にコレクションを変更すると ConcurrentModificationException が起きる。削除が必要な場合は Iterator.remove() を使う",
    "PagedDataStore のように走査単位を変えたイテレータを提供する場合、元データが変更されたときの一貫性をどう保証するか設計で決めておく",
  ],
  relatedArticleSlugs: ["composite-pattern", "visitor-pattern"],
  versionCoverage: {
    java8: "ジェネリクスのダイヤモンド演算子は new ArrayList<T>() の形で書く。ページ情報は個別フィールドか専用クラスで返す。",
    java17: "record で Page<T> を定義でき、ページ番号・要素リスト・次ページ有無を簡潔に表現できる。var で型推論も可。",
    java21: "sealed interface で IterationStrategy（Sequential / Paged / Filtered）を定義し、switch で走査方法を型安全に切り替えられる。",
    java8Code: `// Java 8: ページ情報は個別に管理
Iterator<T> pageIterator(int page) {
    int start = page * pageSize;
    int end = Math.min(start + pageSize, size());
    List<T> pageItems = new ArrayList<T>();
    Iterator<T> all = iterator();
    int idx = 0;
    while (all.hasNext()) {
        T item = all.next();
        if (idx >= start && idx < end) {
            pageItems.add(item);
        }
        idx++;
    }
    return new DataStoreIterator<T>(pageItems);
}`,
    java17Code: `// Java 17: record でページ情報をまとめて返す
record Page<T>(int pageNumber, List<T> items,
               boolean hasNext) {}

public Page<T> getPage(int pageNumber) {
    int start = pageNumber * pageSize;
    int end = Math.min(start + pageSize, size());
    // ... 要素を収集
    return new Page<>(pageNumber, pageItems,
                      end < size());
}`,
    java21Code: `// Java 21: sealed interface で走査戦略を型安全に
sealed interface IterationStrategy
    permits IterationStrategy.Sequential,
           IterationStrategy.Paged,
           IterationStrategy.Filtered {
    record Sequential() implements IterationStrategy {}
    record Paged(int pageSize)
            implements IterationStrategy {}
    record Filtered(Predicate<Object> predicate)
            implements IterationStrategy {}
}
// switch で戦略に応じたイテレータを生成
static Iterator<String> createIterator(
        List<String> data, IterationStrategy strategy) {
    return switch (strategy) {
        case IterationStrategy.Sequential() ->
            data.iterator();
        case IterationStrategy.Paged(int ps) ->
            data.subList(0, Math.min(ps, data.size()))
                .iterator();
        case IterationStrategy.Filtered(var pred) ->
            data.stream().filter(pred::test).iterator();
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（Iterable / Iterator）", whenToUse: "for-each 対応とカスタム走査の実装。外部依存なしで完結する。", tradeoff: "フィルタリングや変換を組み合わせると Stream API の方が宣言的に書ける。" },
    { name: "Stream API", whenToUse: "filter / map / collect の組み合わせで宣言的にデータ処理したい場合。", tradeoff: "一度しか消費できない点は Iterator と同じ。再利用が必要なら Supplier<Stream> でラップする。" },
    { name: "Guava（AbstractIterator）", whenToUse: "computeNext() を実装するだけでカスタムイテレータを簡潔に作りたい場合。", tradeoff: "Guava への依存が増える。Java 標準だけで十分な場面が多い。" },
  ],
  faq: [
    { question: "for-each ループと Iterator の直接操作はどう使い分けますか。", answer: "通常は for-each で十分です。走査中に要素を削除したい場合や、hasNext() の結果で処理を分岐したい場合に限り Iterator を直接使います。" },
    { question: "Spliterator とは何ですか。", answer: "Java 8 で追加された並列走査用のインターフェースです。Stream の内部で使われており、通常の業務コードで直接実装する機会は少ないです。" },
    { question: "remove() を実装しない場合はどうすればよいですか。", answer: "Java 8 以降では Iterator.remove() にデフォルト実装（UnsupportedOperationException をスロー）があるため、実装しなくてもコンパイルは通ります。" },
  ],
  codeTitle: "IteratorPatternDemo.java",
  codeSample: `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

public class IteratorPatternDemo {

    static class DataStore<T> implements Iterable<T> {
        private final List<T> items = new ArrayList<>();
        public void add(T item) { items.add(item); }
        public int size() { return items.size(); }

        @Override
        public Iterator<T> iterator() {
            return new DataStoreIterator<>(items);
        }
    }

    static class DataStoreIterator<T> implements Iterator<T> {
        private final List<T> items;
        private int currentIndex = 0;
        public DataStoreIterator(List<T> items) {
            this.items = items;
        }
        @Override public boolean hasNext() {
            return currentIndex < items.size();
        }
        @Override public T next() {
            if (!hasNext()) {
                throw new NoSuchElementException(
                    "index=" + currentIndex);
            }
            return items.get(currentIndex++);
        }
    }

    record Page<T>(int pageNumber, List<T> items,
                   boolean hasNext) {}

    static class PagedDataStore<T> extends DataStore<T> {
        private final int pageSize;
        public PagedDataStore(int pageSize) {
            this.pageSize = pageSize;
        }
        public Page<T> getPage(int pageNumber) {
            int start = pageNumber * pageSize;
            int end = Math.min(start + pageSize, size());
            var pageItems = new ArrayList<T>();
            var all = iterator();
            int idx = 0;
            while (all.hasNext()) {
                T item = all.next();
                if (idx >= start && idx < end) {
                    pageItems.add(item);
                }
                idx++;
            }
            return new Page<>(pageNumber, pageItems,
                              end < size());
        }
    }

    public static void main(String[] args) {
        var store = new DataStore<String>();
        store.add("Apple");
        store.add("Banana");
        store.add("Cherry");

        for (var item : store) {
            System.out.println(item);
        }

        var paged = new PagedDataStore<String>(2);
        paged.add("A"); paged.add("B"); paged.add("C");
        paged.add("D"); paged.add("E");

        int pageNum = 0;
        Page<String> page;
        do {
            page = paged.getPage(pageNum);
            System.out.println("ページ" + page.pageNumber()
                + ": " + page.items());
            pageNum++;
        } while (page.hasNext());
    }
}`,
},
{
  slug: "mediator-pattern",
  title: "Java Mediator パターンでオブジェクト間通信を整理する",
  categorySlug: "patterns",
  summary: "チャットルームを題材に、オブジェクト間の通信を仲介者に集約する Mediator パターンを解説する。",
  version: "Java 17",
  tags: ["Mediator", "デザインパターン", "疎結合", "振る舞いパターン"],
  apiNames: ["interface", "record", "List.copyOf", "abstract class"],
  description: "Java の Mediator パターンをチャットルームで実装し、オブジェクト間の多対多通信を一元管理する設計と Java 8/17/21 の違いを外部ライブラリ不要で解説する。",
  lead: "複数のオブジェクトが互いに直接参照し合うと、依存関係が網目状に複雑化します。Mediator パターンは、オブジェクト間の通信をすべて仲介者（Mediator）に集約し、各オブジェクト（Colleague）は Mediator だけを知っていればよい設計にします。チャットルーム、フォーム入力の連動制御、イベントバスなどが典型的な適用場面です。この記事では、チャットルームを題材に、一般ユーザーと管理者ユーザーのメッセージ配信を Mediator で仲介する実装を示します。record によるメッセージの不変化、List.copyOf による防御的コピー、Java 21 の sealed interface でユーザーロールを型安全に表現する方法も確認します。",
  useCases: [
    "チャットルームで送信者以外の全参加者にメッセージを配信する仲介オブジェクトを実装する",
    "画面フォームのコンポーネント連動（例: 都道府県セレクトが変わったら市区町村セレクトの選択肢を更新）を Mediator に集約する",
    "マイクロサービス間のイベント通知をイベントバス（Mediator）経由に統一し、サービス同士の直接依存を排除する",
  ],
  cautions: [
    "Mediator 自体が肥大化しやすい。ロジックが増えてきたら Mediator を分割するか、イベント駆動アーキテクチャを検討する",
    "Colleague が Mediator 以外の Colleague を直接呼び出すと、パターンの意味がなくなる。コードレビューで直接参照がないか確認する",
    "getUsers() で内部リストをそのまま返すと外部から変更される恐れがある。List.copyOf で防御的コピーを返すこと",
    "Mediator と Observer は似ているが、Observer は1対多の通知が基本。Mediator は多対多の双方向通信の整理が目的。使い分けを意識する",
  ],
  relatedArticleSlugs: ["observer-pattern", "facade-pattern"],
  versionCoverage: {
    java8: "メッセージは String で受け渡し、Colleague の型宣言にジェネリクスの冗長さが残る。防御的コピーは Collections.unmodifiableList で行う。",
    java17: "record でメッセージを不変オブジェクト化し、List.copyOf で簡潔に防御的コピーを返せる。var も利用可。",
    java21: "sealed interface でユーザーロール（General / Admin / Guest）を型安全に限定し、switch パターンマッチングで権限制御を分岐できる。",
    java8Code: `// Java 8: メッセージは文字列で受け渡し
public void sendMessage(String message, ChatUser sender) {
    for (ChatUser user : users) {
        if (user != sender) {
            user.receive(message, sender.name);
        }
    }
}`,
    java17Code: `// Java 17: record で不変なメッセージオブジェクト
record Message(String content, String senderName) {}

public void sendMessage(Message message, ChatUser sender) {
    for (var user : users) {
        if (user != sender) {
            user.receive(message);
        }
    }
}
public List<ChatUser> getUsers() {
    return List.copyOf(users); // 防御的コピー
}`,
    java21Code: `// Java 21: sealed interface でロールを型安全に
sealed interface UserRole
    permits UserRole.General, UserRole.Admin,
            UserRole.Guest {
    record General(String name) implements UserRole {}
    record Admin(String name)   implements UserRole {}
    record Guest(String name)   implements UserRole {}
}
// switch でロールに応じた表示
String roleLabel = switch (user.role) {
    case UserRole.General g -> "一般ユーザー";
    case UserRole.Admin a   -> "管理者";
    case UserRole.Guest g   -> "ゲスト";
};`,
  },
  libraryComparison: [
    { name: "標準 API（interface + List）", whenToUse: "参加者が少なくメッセージ配信が単純な場面。外部依存なしで完結する。", tradeoff: "非同期配信やメッセージフィルタリングが必要になると自前コードが増える。" },
    { name: "Guava EventBus", whenToUse: "イベント駆動でコンポーネント間の通信を疎結合にしたい場合。アノテーションベースで購読できる。", tradeoff: "Guava への依存が増える。非推奨との見方もあり、新規では CDI Event 等を検討。" },
    { name: "Spring ApplicationEvent", whenToUse: "Spring アプリケーション内のコンポーネント間イベント通知。DI コンテナと統合されている。", tradeoff: "Spring 依存になるため、ライブラリ単体やバッチでは使いにくい。" },
  ],
  faq: [
    { question: "Mediator パターンと Observer パターンの違いは何ですか。", answer: "Observer は1つの Subject が複数の Observer に一方向に通知します。Mediator は複数の Colleague 間の双方向通信を仲介し、通信ロジックを Mediator に集約します。" },
    { question: "Mediator が肥大化したらどうすればよいですか。", answer: "メッセージの種類やユーザーロールごとに Mediator を分割するか、各処理をハンドラークラスに委譲して Mediator 自体は振り分けだけに絞ります。" },
    { question: "GUI フレームワークでも Mediator は使われていますか。", answer: "はい。Swing の JDialog がコンポーネント間の連動を仲介するのは Mediator の一種です。現代の MVVM や Redux も広義には Mediator の役割を担っています。" },
  ],
  codeTitle: "MediatorPatternDemo.java",
  codeSample: `import java.util.ArrayList;
import java.util.List;

public class MediatorPatternDemo {

    record Message(String content, String senderName) {
        @Override public String toString() {
            return "[" + senderName + "]: " + content;
        }
    }

    interface ChatMediator {
        void sendMessage(Message message, ChatUser sender);
        void addUser(ChatUser user);
        List<ChatUser> getUsers();
    }

    static abstract class ChatUser {
        protected final ChatMediator mediator;
        protected final String name;
        ChatUser(ChatMediator mediator, String name) {
            this.mediator = mediator; this.name = name;
        }
        abstract void send(String content);
        abstract void receive(Message message);
    }

    static class ChatRoom implements ChatMediator {
        private final List<ChatUser> users = new ArrayList<>();
        @Override public void addUser(ChatUser user) {
            users.add(user);
            System.out.println(user.name + " が参加");
        }
        @Override
        public void sendMessage(Message msg, ChatUser sender) {
            for (var user : users) {
                if (user != sender) user.receive(msg);
            }
        }
        @Override public List<ChatUser> getUsers() {
            return List.copyOf(users);
        }
    }

    static class GeneralUser extends ChatUser {
        GeneralUser(ChatMediator m, String name) {
            super(m, name);
        }
        @Override public void send(String content) {
            var msg = new Message(content, name);
            System.out.println("[送信] " + msg);
            mediator.sendMessage(msg, this);
        }
        @Override public void receive(Message msg) {
            System.out.println("[受信] " + name + " <- " + msg);
        }
    }

    static class AdminUser extends ChatUser {
        AdminUser(ChatMediator m, String name) {
            super(m, name);
        }
        @Override public void send(String content) {
            var msg = new Message("[管理者通知] " + content, name);
            System.out.println("[管理者送信] " + msg);
            mediator.sendMessage(msg, this);
        }
        @Override public void receive(Message msg) {
            System.out.println("[管理者受信] " + name
                             + " <- " + msg);
        }
    }

    public static void main(String[] args) {
        var room = new ChatRoom();
        var alice = new GeneralUser(room, "Alice");
        var bob = new GeneralUser(room, "Bob");
        var admin = new AdminUser(room, "Admin");

        room.addUser(alice);
        room.addUser(bob);
        room.addUser(admin);

        alice.send("こんにちは！");
        admin.send("メンテナンスのお知らせです");
    }
}`,
},
{
  slug: "memento-pattern",
  title: "Java Memento パターンで状態の保存と復元を実装する",
  categorySlug: "patterns",
  summary: "テキストエディタの Undo を題材に、オブジェクトの状態をスナップショットとして保存・復元する Memento パターンを解説する。",
  version: "Java 17",
  tags: ["Memento", "デザインパターン", "スナップショット", "Undo", "振る舞いパターン"],
  apiNames: ["record", "Deque", "ArrayDeque"],
  description: "Java の Memento パターンをテキストエディタの状態保存・復元で実装し、record との相性と Java 8/17/21 の違いを外部ライブラリ不要で解説する。",
  lead: "オブジェクトの内部状態をカプセル化を崩さずに保存し、後から復元できるようにする。Memento パターンは、テキストエディタの Undo、ゲームのセーブデータ、設定のロールバックなど、「元に戻す」操作が必要な場面で使われます。Command パターンが操作をオブジェクト化するのに対し、Memento は状態そのものをスナップショットとして保存する点が異なります。この記事では、テキストエディタの内容とカーソル位置を Memento に保存し、Deque で履歴管理して Undo を実現する実装を示します。Java 17 の record は不変で equals/hashCode が自動生成されるため、Memento の実装に最適です。Java 21 では sealed interface で編集状態のバリエーションを型安全に表現できます。",
  useCases: [
    "テキストエディタの内容とカーソル位置をスナップショットとして保存し、Undo で任意の時点に戻す",
    "設定画面の変更を適用前にスナップショットとして保存し、キャンセル時に元の設定に復元する",
    "ゲームの進行状態をセーブポイントとして保存し、ゲームオーバー時にセーブポイントから再開する",
  ],
  cautions: [
    "スナップショットを大量に保持するとメモリを圧迫する。履歴件数の上限を設けるか、古いスナップショットを定期的に破棄する設計にする",
    "Memento の中身を Caretaker が直接読み書きしないこと。Caretaker はスナップショットの保管と受け渡しだけを担い、内容には触れない",
    "Memento にミュータブルなオブジェクト（List や Map）を含める場合は、保存時にディープコピーを取ること。参照のままだと復元しても元の状態に戻らない",
    "record で Memento を定義すると toString() で内部状態が露出する。セキュリティ上の懸念がある場合は toString() をオーバーライドするか、通常のクラスで定義する",
  ],
  relatedArticleSlugs: ["command-pattern", "state-pattern"],
  versionCoverage: {
    java8: "Memento は通常のクラスで定義し、getter を手動で用意する。equals/hashCode も必要に応じて手動実装する。",
    java17: "record で Memento を定義すると、不変性・equals/hashCode・toString が自動で得られる。Memento 実装に最適。",
    java21: "sealed interface で EditorState（Editing / Saved / ReadOnly）を定義し、switch パターンマッチングで状態に応じた表示を切り替えられる。",
    java8Code: `// Java 8: Memento は通常のクラスで定義
static class EditorMemento {
    private final String content;
    private final int cursorPos;
    EditorMemento(String content, int cursorPos) {
        this.content = content;
        this.cursorPos = cursorPos;
    }
    String getContent() { return content; }
    int getCursorPos() { return cursorPos; }
}`,
    java17Code: `// Java 17: record で Memento を簡潔に定義
// 不変性・equals・hashCode・toString が自動生成
record EditorMemento(String content, int cursorPos) {}

// 利用側: record のアクセサで復元
void restore(EditorMemento memento) {
    this.content = memento.content();
    this.cursorPos = memento.cursorPos();
}`,
    java21Code: `// Java 21: sealed interface で編集状態を型安全に
sealed interface EditorState
    permits EditorState.Editing,
            EditorState.Saved,
            EditorState.ReadOnly {
    record Editing(String content, int cursorPos)
            implements EditorState {}
    record Saved(String content, int cursorPos,
                 String savedAt)
            implements EditorState {}
    record ReadOnly(String content)
            implements EditorState {}
}
// switch で状態に応じた表示
String label = switch (currentState) {
    case EditorState.Editing(var c, var p) ->
        "編集中 (カーソル: " + p + ")";
    case EditorState.Saved(var c, var p, var at) ->
        "保存済み (" + at + ")";
    case EditorState.ReadOnly(var c) ->
        "読み取り専用";
};`,
  },
  libraryComparison: [
    { name: "標準 API（record + Deque）", whenToUse: "スナップショットの保存と復元を自前で管理する場面。外部依存なしで完結する。", tradeoff: "差分保存やシリアライズが必要になると自前コードが増える。" },
    { name: "javax.swing.undo.UndoableEdit", whenToUse: "Swing テキストコンポーネントの Undo/Redo。Command + Memento の組み合わせで実装されている。", tradeoff: "Swing 前提のため、Web やバッチ処理では利用できない。" },
    { name: "Serializable によるバイト列保存", whenToUse: "オブジェクト全体をバイト列として保存し、ファイルや DB に永続化する場合。", tradeoff: "シリアライズのオーバーヘッドが大きく、頻繁な Undo 操作には向かない。バージョン互換の問題もある。" },
  ],
  faq: [
    { question: "Memento パターンと Command パターンの Undo はどう違いますか。", answer: "Command は操作の逆操作で Undo します。Memento は操作前の状態を丸ごと保存して復元します。Memento の方がシンプルですが、状態が大きいとメモリコストが高くなります。" },
    { question: "record の Memento で equals が自動生成されるメリットは何ですか。", answer: "同じ内容のスナップショットかどうかをフィールド値で比較でき、重複保存の検知やテストでの比較が容易になります。" },
    { question: "差分だけ保存する方法はありますか。", answer: "操作前後の差分をコマンドオブジェクトとして保存する方法が一般的です。これは Command パターンの Undo と同等の設計になります。" },
  ],
  codeTitle: "MementoPatternDemo.java",
  codeSample: `import java.util.ArrayDeque;
import java.util.Deque;

public class MementoPatternDemo {

    record EditorMemento(String content, int cursorPos) {}

    static class TextEditor {
        private String content = "";
        private int cursorPos = 0;

        void type(String text) {
            content = content.substring(0, cursorPos)
                    + text + content.substring(cursorPos);
            cursorPos += text.length();
        }

        EditorMemento save() {
            return new EditorMemento(content, cursorPos);
        }

        void restore(EditorMemento memento) {
            this.content = memento.content();
            this.cursorPos = memento.cursorPos();
        }

        void display() {
            System.out.println("内容: \"" + content
                + "\" (カーソル: " + cursorPos + ")");
        }
    }

    static class EditorHistory {
        private final Deque<EditorMemento> undoStack
                = new ArrayDeque<>();

        void save(EditorMemento memento) {
            undoStack.push(memento);
        }

        EditorMemento undo() {
            if (undoStack.isEmpty()) return null;
            undoStack.pop();
            if (!undoStack.isEmpty()) {
                return undoStack.peek();
            }
            return new EditorMemento("", 0);
        }

        boolean canUndo() {
            return !undoStack.isEmpty();
        }
    }

    public static void main(String[] args) {
        var editor = new TextEditor();
        var history = new EditorHistory();

        history.save(editor.save());
        editor.type("Hello");
        editor.display();

        history.save(editor.save());
        editor.type(" World");
        editor.display();

        history.save(editor.save());
        editor.type("!!!");
        editor.display();

        System.out.println("--- Undo ---");
        if (history.canUndo()) {
            var prev = history.undo();
            if (prev != null) editor.restore(prev);
        }
        editor.display();

        if (history.canUndo()) {
            var prev = history.undo();
            if (prev != null) editor.restore(prev);
        }
        editor.display();
    }
}`,
},
{
  slug: "observer-pattern",
  title: "Java Observer パターンでイベント通知を実装する",
  categorySlug: "patterns",
  summary: "イベント通知システムを題材に、状態変化を複数のリスナーに通知する Observer パターンを解説する。",
  version: "Java 17",
  tags: ["Observer", "デザインパターン", "イベント", "リスナー", "振る舞いパターン"],
  apiNames: ["interface", "record", "List", "ArrayList"],
  description: "Java の Observer パターンをイベント通知システムで実装し、Publisher/Listener の疎結合設計と Java 8/17/21 の違いを外部ライブラリ不要で解説する。",
  lead: "あるオブジェクトの状態が変化したとき、それに依存する複数のオブジェクトに自動的に通知する。Observer パターンは、GUI のイベントリスナー、メッセージキューのサブスクライバー、ドメインイベントの伝播など、1対多の通知が必要な場面で広く使われます。java.util.Observer は Java 9 で非推奨となりましたが、パターンの考え方は java.beans.PropertyChangeListener や各種フレームワークのイベント機構に引き継がれています。この記事では、イベント通知システムを題材に Publisher と Listener の構造を実装し、record によるイベントデータの定義、Java 21 の sealed interface でイベント種別を型安全に分類する方法を確認します。",
  useCases: [
    "ユーザー登録イベントを複数のリスナー（ログ記録・ウェルカムメール送信・監査ログ）に同時通知する",
    "在庫数の変更を画面表示コンポーネントとアラート通知コンポーネントに自動的に反映する",
    "設定ファイルの変更を検知し、関連する全モジュールにリロードイベントを通知する",
  ],
  cautions: [
    "リスナーの登録を解除しないとメモリリークの原因になる。特に匿名クラスやラムダ式で登録した場合、解除用の参照を保持しておくこと",
    "通知の順序はリスト登録順に依存するが、順序に依存するロジックを書くとリスナー追加時に予期しない挙動が起きる。通知順序に依存しない設計にする",
    "リスナー内で例外が発生すると後続のリスナーに通知が届かない。try-catch で個別に保護するか、例外を収集して最後にまとめるかは設計で決める",
    "java.util.Observer / Observable は Java 9 以降で非推奨。新規コードでは自前の interface か java.beans.PropertyChangeListener を使う",
  ],
  relatedArticleSlugs: ["mediator-pattern", "chain-of-responsibility"],
  versionCoverage: {
    java8: "イベントデータは String や Object で受け渡し、型安全性は低い。java.util.Observer は使えるが推奨されない。",
    java17: "record でイベントデータ（Event）を不変オブジェクトとして定義でき、アクセサメソッドで型安全にフィールド値を取得できる。",
    java21: "sealed interface でイベント種別（UserRegistered / OrderPlaced / PaymentFailed）を型安全に限定し、switch で網羅チェックが効く。",
    java8Code: `// Java 8: イベントは文字列ベースで型安全性が低い
interface EventListener {
    void onEvent(String eventType, Object data);
}
public void publish(String eventType, Object data) {
    for (EventListener listener : listeners) {
        listener.onEvent(eventType, data);
    }
}`,
    java17Code: `// Java 17: record でイベントデータを型安全に
record Event(String type, Object data) {}

interface EventListener {
    void onEvent(Event event);
}
public void publish(Event event) {
    for (var listener : listeners) {
        listener.onEvent(event);
    }
}`,
    java21Code: `// Java 21: sealed interface でイベント種別を型安全に
sealed interface AppEvent
    permits AppEvent.UserRegistered,
            AppEvent.OrderPlaced {
    record UserRegistered(String userId, String name)
            implements AppEvent {}
    record OrderPlaced(String orderId, int amount)
            implements AppEvent {}
}
// switch パターンマッチングで型安全に分岐
String msg = switch (event) {
    case AppEvent.UserRegistered(var id, var name) ->
        "ユーザー登録: " + name;
    case AppEvent.OrderPlaced(var id, var amount) ->
        "注文確定: " + amount + "円";
};`,
  },
  libraryComparison: [
    { name: "標準 API（自前 interface + List）", whenToUse: "リスナーの数が少なく、同期通知で十分な場面。外部依存なしで完結する。", tradeoff: "非同期通知やイベントフィルタリングが必要になると自前コードが増える。" },
    { name: "java.beans.PropertyChangeListener", whenToUse: "JavaBeans の仕様に準拠したプロパティ変更通知を行う場合。標準 API で利用可能。", tradeoff: "プロパティ名が文字列ベースのため、タイプミスに弱い。" },
    { name: "Spring ApplicationEvent", whenToUse: "Spring アプリケーション内でコンポーネント間のイベント駆動設計を行う場合。", tradeoff: "Spring 依存になるため、ライブラリ単体では使えない。" },
  ],
  faq: [
    { question: "java.util.Observer はなぜ非推奨になったのですか。", answer: "Observable がクラスで interface ではないため多重継承できず、通知メソッドの引数が Object で型安全性が低かったためです。PropertyChangeListener の利用が推奨されています。" },
    { question: "非同期で通知したい場合はどうしますか。", answer: "ExecutorService にリスナーの呼び出しを submit する方法が一般的です。ただし、通知順序の保証や例外処理の設計が必要になります。" },
    { question: "Observer と Pub/Sub の違いは何ですか。", answer: "Observer は Publisher が直接リスナーを保持します。Pub/Sub はメッセージブローカーが仲介し、Publisher と Subscriber が互いを知りません。疎結合の度合いが異なります。" },
  ],
  codeTitle: "ObserverPatternDemo.java",
  codeSample: `import java.util.ArrayList;
import java.util.List;

public class ObserverPatternDemo {

    record Event(String type, Object data) {}

    interface EventListener {
        void onEvent(Event event);
    }

    static class EventPublisher {
        private final List<EventListener> listeners
                = new ArrayList<>();

        public void subscribe(EventListener listener) {
            listeners.add(listener);
        }
        public void unsubscribe(EventListener listener) {
            listeners.remove(listener);
        }
        public void publish(Event event) {
            System.out.println("[Publisher] " + event);
            for (var listener : listeners) {
                listener.onEvent(event);
            }
        }
    }

    static class LogListener implements EventListener {
        @Override public void onEvent(Event event) {
            System.out.println("[Log] " + event.type()
                             + ": " + event.data());
        }
    }

    static class EmailListener implements EventListener {
        @Override public void onEvent(Event event) {
            if ("USER_REGISTERED".equals(event.type())) {
                System.out.println("[Email] ウェルカムメール: "
                                 + event.data());
            }
        }
    }

    static class AuditListener implements EventListener {
        private int count = 0;
        @Override public void onEvent(Event event) {
            count++;
            System.out.println("[Audit] #" + count
                             + ": " + event);
        }
        public int getCount() { return count; }
    }

    public static void main(String[] args) {
        var publisher = new EventPublisher();
        var log = new LogListener();
        var email = new EmailListener();
        var audit = new AuditListener();

        publisher.subscribe(log);
        publisher.subscribe(email);
        publisher.subscribe(audit);

        publisher.publish(new Event("USER_REGISTERED",
                                    "user_001, 山田太郎"));
        publisher.publish(new Event("ORDER_PLACED",
                                    "ord_100, 5000円"));

        publisher.unsubscribe(email);
        publisher.publish(new Event("USER_REGISTERED",
                                    "user_002, 鈴木花子"));

        System.out.println("監査イベント数: "
                         + audit.getCount());
    }
}`,
},
{
  slug: "state-pattern",
  title: "Java State パターンで状態遷移を安全に実装する設計手法",
  categorySlug: "patterns",
  summary: "自動販売機を題材に、状態ごとに振る舞いを切り替える State パターンを解説する。",
  version: "Java 17",
  tags: ["State", "デザインパターン", "状態遷移", "振る舞いパターン"],
  apiNames: ["interface", "record", "sealed interface"],
  description: "Java の State パターンを自動販売機で実装し、状態ごとの振る舞い分離と遷移制御の設計方法を Java 8/17/21 対応で外部ライブラリ不要で解説する。",
  lead: "オブジェクトの振る舞いを、内部状態に応じて動的に切り替える。State パターンは、状態遷移を if-else や switch の巨大な分岐で管理する代わりに、各状態を独立したクラスとして切り出し、操作を状態オブジェクトに委譲する設計です。自動販売機、注文ステータス管理、ワークフローの承認フローなど、状態遷移が明確に定義される場面で有効です。状態の追加や変更が既存コードに影響しにくくなる一方、状態数が多いとクラスも増えます。この記事では、自動販売機（待機 → コイン投入済み → 払い出し中）を題材に State パターンを実装し、record による遷移ログの記録、sealed interface による状態の型安全な表現まで確認します。",
  useCases: [
    "注文ステータス（受付 → 承認 → 出荷 → 完了）の遷移ごとに許可される操作を状態クラスで制御する",
    "自動販売機のコイン投入・商品選択・払い出しの状態遷移を安全に管理する",
    "ドキュメントの承認ワークフロー（下書き → レビュー中 → 承認済み → 公開）で状態ごとに編集可否を切り替える",
  ],
  cautions: [
    "State パターンと Strategy パターンは構造が似ているが、State は状態遷移を内部で管理し、Strategy は外部から差し替える点が異なる",
    "状態遷移のルール（どの状態からどの状態に遷移できるか）を図示しておくこと。コードだけでは遷移の全体像が把握しにくい",
    "状態オブジェクトを毎回 new するとオブジェクト生成コストがかかる。状態がステートレスなら Singleton で共有してもよい",
    "不正な操作（例: コイン未投入で商品選択）の処理を各状態クラスで明示的に定義すること。暗黙に無視すると不具合の原因になる",
  ],
  relatedArticleSlugs: ["strategy-pattern", "memento-pattern"],
  versionCoverage: {
    java8: "状態は interface + 個別クラスで実装する。遷移ログは System.out.println で直接出力するのが一般的。",
    java17: "record で StateTransition（from / to / action）を定義し、遷移ログを構造化データとして扱える。var も利用可。",
    java21: "sealed interface で状態を record として定義し、switch パターンマッチングで状態遷移を関数的に記述できる。",
    java8Code: `// Java 8: 状態クラスで直接遷移を実行
static class IdleState implements VendingMachineState {
    @Override
    public void insertCoin(VendingMachine machine) {
        System.out.println("[IDLE] コインを受け取りました");
        machine.setState(new CoinInsertedState());
    }
}`,
    java17Code: `// Java 17: record で遷移ログを構造化
record StateTransition(String from, String to,
                       String action) {}

public void insertCoin(VendingMachine machine) {
    System.out.println("[IDLE] コインを受け取りました");
    var transition = new StateTransition(
        "IDLE", "COIN_INSERTED", "insertCoin");
    System.out.println(transition);
    machine.setState(new CoinInsertedState());
}`,
    java21Code: `// Java 21: sealed interface で状態を record に
sealed interface MachineState
    permits MachineState.Idle,
            MachineState.CoinInserted,
            MachineState.Dispensing {
    record Idle() implements MachineState {}
    record CoinInserted(int coinAmount)
            implements MachineState {}
    record Dispensing(String product)
            implements MachineState {}
}
// switch パターンマッチングで状態遷移を関数的に
static MachineState transition(
        MachineState current, String action) {
    return switch (current) {
        case MachineState.Idle()
            when action.equals("insertCoin") ->
                new MachineState.CoinInserted(100);
        case MachineState.Idle() -> current;
        // sealed なので全状態を網羅チェック
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（interface + クラス）", whenToUse: "状態数が少なく遷移ルールが明確な場面。外部依存なしで完結する。", tradeoff: "状態数が増えるとクラス数も比例して増える。" },
    { name: "Spring StateMachine", whenToUse: "状態遷移の定義・イベント駆動・永続化を統一的に扱いたい大規模なワークフロー。", tradeoff: "Spring 依存で学習コストが高い。小規模な状態遷移には過剰。" },
    { name: "enum + switch による簡易実装", whenToUse: "状態数が3〜5程度で遷移ロジックが単純な場合。enum のメソッドに遷移ロジックを書ける。", tradeoff: "状態ごとのデータ保持が難しく、ロジックが増えると enum メソッドが肥大化する。" },
  ],
  faq: [
    { question: "State パターンと Strategy パターンの違いは何ですか。", answer: "構造は似ていますが、State は状態遷移を内部で自動的に行います。Strategy は利用者が外部からアルゴリズムを差し替えます。状態が自律的に切り替わるかどうかが違いです。" },
    { question: "状態オブジェクトは毎回 new すべきですか。", answer: "状態がステートレス（フィールドを持たない）なら Singleton で共有できます。状態がデータを保持する場合は毎回生成する必要があります。" },
    { question: "enum で State パターンを実装できますか。", answer: "抽象メソッドを持つ enum で簡易的に実装可能です。ただし状態ごとのデータ保持が難しく、遷移ロジックが複雑になると管理しにくくなります。" },
  ],
  codeTitle: "StatePatternDemo.java",
  codeSample: `public class StatePatternDemo {

    interface VendingMachineState {
        void insertCoin(VendingMachine machine);
        void selectProduct(VendingMachine machine, String product);
        void dispense(VendingMachine machine);
    }

    record StateTransition(String from, String to,
                           String action) {}

    static class IdleState implements VendingMachineState {
        @Override
        public void insertCoin(VendingMachine machine) {
            System.out.println("[IDLE] コインを受け取りました");
            machine.setState(new CoinInsertedState());
        }
        @Override
        public void selectProduct(VendingMachine m, String p) {
            System.out.println("[IDLE] コインを投入してください");
        }
        @Override
        public void dispense(VendingMachine m) {
            System.out.println("[IDLE] コインを投入してください");
        }
    }

    static class CoinInsertedState implements VendingMachineState {
        @Override
        public void insertCoin(VendingMachine m) {
            System.out.println("[COIN] 既にコイン投入済みです");
        }
        @Override
        public void selectProduct(VendingMachine m, String p) {
            System.out.println("[COIN] " + p + " を選択");
            m.setProduct(p);
            m.setState(new DispensingState());
        }
        @Override
        public void dispense(VendingMachine m) {
            System.out.println("[COIN] 商品を選択してください");
        }
    }

    static class DispensingState implements VendingMachineState {
        @Override
        public void insertCoin(VendingMachine m) {
            System.out.println("[DISP] 払い出し中です");
        }
        @Override
        public void selectProduct(VendingMachine m, String p) {
            System.out.println("[DISP] 払い出し中です");
        }
        @Override
        public void dispense(VendingMachine m) {
            System.out.println("[DISP] " + m.getProduct()
                             + " を払い出しました");
            m.setProduct(null);
            m.setState(new IdleState());
        }
    }

    static class VendingMachine {
        private VendingMachineState state = new IdleState();
        private String product;
        void setState(VendingMachineState s) { state = s; }
        void setProduct(String p) { product = p; }
        String getProduct() { return product; }
        void insertCoin() { state.insertCoin(this); }
        void selectProduct(String p) {
            state.selectProduct(this, p);
        }
        void dispense() { state.dispense(this); }
    }

    public static void main(String[] args) {
        var machine = new VendingMachine();
        machine.insertCoin();
        machine.selectProduct("コーヒー");
        machine.dispense();

        // 異常操作
        machine.selectProduct("お茶"); // コイン未投入
    }
}`,
},
{
  slug: "strategy-pattern",
  title: "Java Strategy パターンでアルゴリズムを切り替える",
  categorySlug: "patterns",
  summary: "ソートアルゴリズムの差し替えを題材に、実行時にアルゴリズムを切り替える Strategy パターンを解説する。",
  version: "Java 17",
  tags: ["Strategy", "デザインパターン", "Comparator", "ラムダ式", "振る舞いパターン"],
  apiNames: ["interface", "Comparator", "record", "Arrays.copyOf", "Arrays.sort"],
  description: "Java の Strategy パターンをソートアルゴリズムの切り替えで実装し、Comparator との関係と Java 8/17/21 の違いを外部ライブラリ不要で解説する。",
  lead: "アルゴリズムをオブジェクトとして切り出し、実行時に差し替えられるようにする。Strategy パターンは Java の Comparator インターフェースそのものであり、最も身近なデザインパターンの1つです。ソートアルゴリズムの切り替え、料金計算ロジックの顧客別カスタマイズ、出力形式の動的変更など、同じ処理を異なるやり方で行いたい場面に適用できます。Java 8 以降はラムダ式やメソッド参照で Strategy を簡潔に定義でき、匿名クラスを書く必要がほぼなくなりました。この記事では、ソートアルゴリズムの差し替えを題材に Context と Strategy の構造を実装し、Comparator を使った実践例、record との組み合わせ、Java 21 の sealed interface でソート仕様を型安全に定義する方法を確認します。",
  useCases: [
    "ソートアルゴリズム（バブル / 選択 / マージ）を実行時に切り替え、データ量に応じた戦略で処理する",
    "顧客種別（一般 / プレミアム / 法人）に応じた料金計算ロジックを Strategy として差し替える",
    "帳票の出力形式（CSV / Excel / PDF）を Strategy で抽象化し、設定に応じた出力を行う",
  ],
  cautions: [
    "Strategy インターフェースのメソッドが1つだけなら関数型インターフェース（@FunctionalInterface）にすることでラムダ式で簡潔に記述できる",
    "Strategy の切り替えが頻繁に発生する場合、Context の setStrategy を外部から呼ぶ設計だとスレッドセーフティの考慮が必要になる",
    "Strategy パターンと State パターンは構造が似ている。Strategy は外部からの明示的な切り替え、State は内部状態に応じた自動切り替えが基本",
    "ラムダ式で Strategy を定義すると簡潔だが、複雑なロジックはクラスとして分離した方がテストしやすい",
  ],
  relatedArticleSlugs: ["state-pattern", "template-method"],
  versionCoverage: {
    java8: "ラムダ式で Strategy を簡潔に定義できるようになった。Comparator もラムダ式で記述可能。ただし var は使えない。",
    java17: "var による型推論と record でデータクラスを簡潔に定義でき、Strategy との組み合わせが書きやすくなった。",
    java21: "sealed interface でソート仕様（SortSpec）を型安全に定義し、switch パターンマッチングで仕様に応じた Strategy を選択できる。",
    java8Code: `// Java 8: 匿名クラスまたはラムダ式で Strategy を定義
List<Employee> byAge = new ArrayList<>(employees);
byAge.sort(new Comparator<Employee>() {
    @Override
    public int compare(Employee a, Employee b) {
        return Integer.compare(a.getAge(), b.getAge());
    }
});
// ラムダ式で簡潔に
byAge.sort((a, b) -> Integer.compare(
    a.getAge(), b.getAge()));`,
    java17Code: `// Java 17: record + Comparator メソッド参照
record Person(String name, int age) {}
var persons = new ArrayList<Person>();
// ...
var byAge = new ArrayList<>(persons);
byAge.sort(Comparator.comparingInt(Person::age));`,
    java21Code: `// Java 21: sealed interface で仕様を型安全に
sealed interface SortSpec
    permits SortSpec.ByBubble, SortSpec.ByMerge {
    record ByBubble(boolean ascending)
            implements SortSpec {}
    record ByMerge(boolean ascending, boolean stable)
            implements SortSpec {}
}
static SortStrategy createStrategy(SortSpec spec) {
    return switch (spec) {
        case SortSpec.ByBubble(var asc) ->
            new BubbleSortStrategy();
        case SortSpec.ByMerge(var asc, var stable) ->
            new MergeSortStrategy();
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（interface + ラムダ式）", whenToUse: "アルゴリズムの種類が少なく、ラムダ式で簡潔に定義できる場面。外部依存なしで完結する。", tradeoff: "アルゴリズムの組み合わせや設定が複雑になると管理コードが増える。" },
    { name: "Comparator チェーン", whenToUse: "ソートの多軸条件を thenComparing で連結する場合。標準 API で宣言的に書ける。", tradeoff: "ソート以外の戦略切り替えには適用できない。" },
    { name: "Function / BiFunction", whenToUse: "汎用的な関数型インターフェースで戦略を受け渡す場合。専用の Strategy interface を定義するほどでもない場面。", tradeoff: "引数・戻り値の意味が型から読み取りにくく、専用 interface の方がドキュメント性が高い。" },
  ],
  faq: [
    { question: "Strategy パターンと Template Method パターンの違いは何ですか。", answer: "Strategy はアルゴリズム全体をオブジェクトとして差し替えます。Template Method は処理の骨格を親クラスに固定し、ステップの一部をサブクラスでカスタマイズします。委譲か継承かの違いです。" },
    { question: "ラムダ式で定義した Strategy をテストするにはどうすればよいですか。", answer: "ラムダ式を static メソッドや定数フィールドに抽出し、そのメソッド/フィールドに対してテストを書きます。匿名のラムダ式を直接テストするのは困難です。" },
    { question: "Strategy の選択をどこで行うべきですか。", answer: "Factory メソッドや設定ファイルから Strategy を選択するのが一般的です。Context 内にハードコードすると切り替えが困難になります。" },
  ],
  codeTitle: "StrategyPatternDemo.java",
  codeSample: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;

public class StrategyPatternDemo {

    interface SortStrategy {
        int[] sort(int[] data);
    }

    static class BubbleSortStrategy implements SortStrategy {
        @Override public int[] sort(int[] data) {
            var result = Arrays.copyOf(data, data.length);
            int n = result.length;
            for (int i = 0; i < n - 1; i++) {
                for (int j = 0; j < n - i - 1; j++) {
                    if (result[j] > result[j + 1]) {
                        int tmp = result[j];
                        result[j] = result[j + 1];
                        result[j + 1] = tmp;
                    }
                }
            }
            return result;
        }
    }

    static class DataProcessor {
        private SortStrategy strategy;
        public DataProcessor(SortStrategy s) { strategy = s; }
        public void setStrategy(SortStrategy s) { strategy = s; }
        public int[] process(int[] data) {
            return strategy.sort(data);
        }
    }

    record Person(String name, int age) {}

    public static void main(String[] args) {
        var data = new int[]{5, 2, 8, 1, 9, 3};

        var processor = new DataProcessor(
                new BubbleSortStrategy());
        System.out.println("バブルソート: "
            + Arrays.toString(processor.process(data)));

        // ラムダ式で Strategy を直接定義
        processor.setStrategy(d -> {
            var sorted = Arrays.copyOf(d, d.length);
            Arrays.sort(sorted);
            return sorted;
        });
        System.out.println("Arrays.sort: "
            + Arrays.toString(processor.process(data)));

        // Comparator は Strategy パターンそのもの
        var persons = new ArrayList<Person>();
        persons.add(new Person("田中", 35));
        persons.add(new Person("佐藤", 28));
        persons.add(new Person("鈴木", 42));

        var byAge = new ArrayList<>(persons);
        byAge.sort(Comparator.comparingInt(Person::age));
        System.out.println("年齢順: " + byAge);

        var byName = new ArrayList<>(persons);
        byName.sort((a, b) -> a.name().compareTo(b.name()));
        System.out.println("名前順: " + byName);
    }
}`,
},
{
  slug: "template-method",
  title: "Java Template Method パターンでバッチ処理を整理する",
  categorySlug: "patterns",
  summary: "データ移行バッチを題材に、処理の骨格を親クラスに定義し、ステップをサブクラスでカスタマイズする Template Method パターンを解説する。",
  version: "Java 17",
  tags: ["Template Method", "デザインパターン", "バッチ処理", "振る舞いパターン", "フックメソッド"],
  apiNames: ["abstract class", "record", "final"],
  description: "Java の Template Method パターンをバッチ処理で実装し、フックメソッドの設計と Java 8/17/21 の違いを外部ライブラリ不要で解説する。",
  lead: "処理の全体的な流れを親クラスで固定し、個々のステップだけをサブクラスでカスタマイズする。Template Method パターンは、バッチ処理、データ移行、ETL パイプラインなど、手順は共通だが各ステップの中身が異なる場面で威力を発揮します。テンプレートメソッドを final にすることで、処理の順序を強制しつつ、abstract メソッドで必須のカスタマイズポイントを定義し、フックメソッドでオプションの拡張ポイントを提供します。この記事では、データ移行バッチ（読み込み → 処理 → 書き込み → 後処理）を題材に実装し、record でバッチ結果を返す方法、Java 21 の sealed interface で各ステップを型安全に定義する方法を確認します。",
  useCases: [
    "データ移行バッチの共通フロー（接続 → データ読込 → 変換 → 書込 → 後処理）を親クラスに定義し、移行元ごとにサブクラスでステップを実装する",
    "帳票出力処理のヘッダー → 明細 → フッターの共通フローを固定し、帳票種別ごとに出力内容をカスタマイズする",
    "テストの共通セットアップ → テスト実行 → 検証 → クリーンアップのフローを基底クラスに定義し、テストケースごとに内容を変える",
  ],
  cautions: [
    "テンプレートメソッドは final にして、サブクラスが処理の順序を変えられないようにすること。final がないと意図しないオーバーライドで処理フローが壊れる",
    "フックメソッドのデフォルト実装が空の場合は、サブクラスがオーバーライドしなくても動く設計にすること。必須のカスタマイズポイントは abstract にする",
    "サブクラスが増えすぎると継承階層が深くなる。Strategy パターンとの併用（処理ステップを Strategy で差し替え）も検討する",
    "テンプレートメソッド内で例外が発生した場合のクリーンアップ処理を確実に行うこと。try-finally か try-with-resources を検討する",
  ],
  relatedArticleSlugs: ["strategy-pattern", "chain-of-responsibility"],
  versionCoverage: {
    java8: "テンプレートメソッドは void で結果を返さないか、戻り値を個別にフィールドから取得する設計が一般的。",
    java17: "record で BatchResult を定義し、テンプレートメソッドから処理結果をまとめて返せる。var で変数宣言も簡潔に。",
    java21: "sealed interface で各ステップ（Read / Process / Write / Cleanup）を record として定義し、switch でステップログを型安全に出力できる。",
    java8Code: `// Java 8: テンプレートメソッドは void で結果を返さない
public final void execute() {
    System.out.println("=== " + batchName + " 開始 ===");
    readData();
    processData();
    writeData();
    cleanup();
    System.out.println("=== " + batchName + " 終了 ===");
}`,
    java17Code: `// Java 17: record で処理結果をまとめて返す
record BatchResult(String batchName, int recordCount,
                   boolean success) {}

public final BatchResult execute() {
    readData();
    processData();
    writeData();
    cleanup();
    var result = new BatchResult(
        batchName, getRecordCount(), true);
    return result;
}`,
    java21Code: `// Java 21: sealed interface でステップを型安全に
sealed interface BatchStep
    permits BatchStep.Read, BatchStep.Process,
            BatchStep.Write, BatchStep.Cleanup {
    record Read(String desc) implements BatchStep {}
    record Process() implements BatchStep {}
    record Write(String desc) implements BatchStep {}
    record Cleanup() implements BatchStep {}
}
static void logStep(BatchStep step) {
    switch (step) {
        case BatchStep.Read(var d) ->
            System.out.println("[読込] " + d);
        case BatchStep.Process() ->
            System.out.println("[処理] 実行");
        case BatchStep.Write(var d) ->
            System.out.println("[書込] " + d);
        case BatchStep.Cleanup() ->
            System.out.println("[後処理] 実行");
    }
}`,
  },
  libraryComparison: [
    { name: "標準 API（abstract class + final メソッド）", whenToUse: "処理の骨格が明確で、ステップのカスタマイズポイントが限られている場面。外部依存なしで完結する。", tradeoff: "継承ベースのため、Javaの単一継承制約を消費する。Strategy パターンとの併用も検討する。" },
    { name: "Strategy パターンとの組み合わせ", whenToUse: "処理ステップを継承ではなく委譲で差し替えたい場合。テスト容易性が高い。", tradeoff: "Strategy を注入する仕組みが必要になり、設計がやや複雑になる。" },
    { name: "Spring Batch（Step / Tasklet）", whenToUse: "大規模なバッチ処理でジョブ定義・リスタート・チャンク処理を統一的に扱う場合。", tradeoff: "Spring 依存で学習コストが高い。小規模バッチには過剰。" },
  ],
  faq: [
    { question: "Template Method と Strategy はどう使い分けますか。", answer: "Template Method は処理の骨格を固定して部分だけカスタマイズします。Strategy はアルゴリズム全体を差し替えます。骨格が共通なら Template Method、全く異なる処理なら Strategy が適しています。" },
    { question: "フックメソッドとは何ですか。", answer: "デフォルト実装を持つメソッドで、サブクラスが必要に応じてオーバーライドします。abstract メソッドと異なり、オーバーライドは任意です。" },
    { question: "テンプレートメソッドを final にしない場合のリスクは何ですか。", answer: "サブクラスが処理の順序を変更できてしまいます。readData の前に writeData が呼ばれるなど、意図しない動作の原因になります。" },
  ],
  codeTitle: "TemplateMethodDemo.java",
  codeSample: `public class TemplateMethodDemo {

    record BatchResult(String batchName, int recordCount,
                       boolean success) {}

    static abstract class DataMigrationBatch {
        private final String batchName;
        public DataMigrationBatch(String name) {
            this.batchName = name;
        }

        public final BatchResult execute() {
            System.out.println("=== " + batchName + " 開始 ===");
            readData();
            processData();
            writeData();
            cleanup();
            System.out.println("=== " + batchName + " 終了 ===");
            return new BatchResult(batchName,
                                   getRecordCount(), true);
        }

        protected abstract void readData();
        protected abstract void processData();
        protected abstract void writeData();
        protected int getRecordCount() { return 0; }
        protected void cleanup() {
            System.out.println("[後処理] デフォルト");
        }
    }

    static class UserMigrationBatch extends DataMigrationBatch {
        public UserMigrationBatch() { super("ユーザー移行"); }
        @Override protected void readData() {
            System.out.println("[読込] 旧DBから1000件");
        }
        @Override protected void processData() {
            System.out.println("[処理] メール正規化");
        }
        @Override protected void writeData() {
            System.out.println("[書込] 新DBに1000件");
        }
        @Override protected int getRecordCount() {
            return 1000;
        }
    }

    static class OrderMigrationBatch extends DataMigrationBatch {
        public OrderMigrationBatch() { super("注文移行"); }
        @Override protected void readData() {
            System.out.println("[読込] CSVから5000件");
        }
        @Override protected void processData() {
            System.out.println("[処理] 金額再計算");
        }
        @Override protected void writeData() {
            System.out.println("[書込] 新DBに5000件");
        }
        @Override protected int getRecordCount() {
            return 5000;
        }
        @Override protected void cleanup() {
            System.out.println("[後処理] CSVアーカイブ");
        }
    }

    public static void main(String[] args) {
        var userResult = new UserMigrationBatch().execute();
        System.out.println("結果: " + userResult);

        System.out.println();

        var orderResult = new OrderMigrationBatch().execute();
        System.out.println("結果: " + orderResult);
    }
}`,
},
{
  slug: "visitor-pattern",
  title: "Java Visitor パターンで構造と処理を分離する設計と実装",
  categorySlug: "patterns",
  summary: "ファイルシステム走査を題材に、データ構造に手を加えずに新しい処理を追加できる Visitor パターンを解説する。",
  version: "Java 17",
  tags: ["Visitor", "デザインパターン", "ダブルディスパッチ", "振る舞いパターン", "sealed interface"],
  apiNames: ["interface", "sealed interface", "record", "instanceof"],
  description: "Java の Visitor パターンをファイルシステム走査で実装し、構造と処理の分離と sealed interface 活用を Java 8/17/21 の違いとともに外部ライブラリ不要で解説する。",
  lead: "データ構造を変更せずに、新しい処理（操作）を追加できるようにする。Visitor パターンは、ファイルシステムの走査、構文木の解析、ドキュメント変換など、構造が安定していて処理のバリエーションが増える場面で有効です。各要素が accept メソッドで Visitor を受け入れ、Visitor の visit メソッドが具体的な処理を行うダブルディスパッチの仕組みにより、要素の型に応じた処理を実行します。この記事では、ファイルシステム（ファイルとディレクトリ）を題材に、一覧表示・サイズ計算・拡張子カウントの3つの Visitor を実装します。sealed interface と record による要素の型安全な定義、Java 21 の switch パターンマッチングで Visitor を使わず直接型分岐する手法も確認します。",
  useCases: [
    "ファイルシステムのツリー構造を走査して、一覧表示・合計サイズ計算・特定拡張子のカウントをそれぞれ Visitor として追加する",
    "構文木（AST）の各ノードに対してコード生成・型チェック・最適化の処理を Visitor として追加する",
    "商品カタログのツリー構造に対して、価格集計・在庫チェック・レポート生成を Visitor で分離する",
  ],
  cautions: [
    "要素の種類が頻繁に追加される場合、Visitor インターフェースにメソッドを追加する必要があり、既存の全 Visitor 実装クラスに影響する。要素が安定していることが前提",
    "ダブルディスパッチの仕組み（element.accept(visitor) → visitor.visit(element)）は初見で理解しにくい。チーム内でパターンの共通認識を持っておくこと",
    "Visitor 内で状態を持つ場合（例: depth カウント）、同じ Visitor インスタンスで複数回走査すると状態が蓄積する。走査ごとに新しいインスタンスを作るか、リセットメソッドを用意する",
    "Java 21 の switch パターンマッチングで sealed interface の型分岐ができるため、小規模なケースでは Visitor を使わず switch で済ませる選択肢もある",
  ],
  relatedArticleSlugs: ["composite-pattern", "interpreter-pattern"],
  versionCoverage: {
    java8: "要素は通常の interface + クラスで定義する。instanceof キャストが必要で、型安全性は低い。インデント生成も手動ループ。",
    java17: "sealed interface で要素を型安全に限定し、record で不変な要素（FileNode）を簡潔に定義できる。instanceof パターンマッチングでキャスト不要に。",
    java21: "switch パターンマッチングで sealed interface の型分岐が可能。小規模なら Visitor を使わず switch で直接処理を書く選択肢もある。",
    java8Code: `// Java 8: interface + 個別クラス + instanceof キャスト
interface FileSystemNode {
    String getName();
    void accept(FileSystemVisitor visitor);
}
static class FileNode implements FileSystemNode {
    private final String name;
    private final long sizeBytes;
    // コンストラクタ + getter を手動定義
}
// インデント生成もループで
private String indent() {
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < depth; i++) sb.append("  ");
    return sb.toString();
}`,
    java17Code: `// Java 17: sealed interface + record で型安全に
sealed interface FileSystemNode
    permits FileNode, DirectoryNode {
    String getName();
    void accept(FileSystemVisitor visitor);
}
record FileNode(String name, long sizeBytes)
        implements FileSystemNode {
    @Override public void accept(FileSystemVisitor v) {
        v.visitFile(this);
    }
}
// instanceof パターンマッチングでキャスト不要
if (node instanceof FileNode f) {
    System.out.println(f.name() + ": " + f.sizeBytes());
}`,
    java21Code: `// Java 21: switch で Visitor を使わず直接型分岐
static String describeNode(FileSystemNode node) {
    return switch (node) {
        case FileNode f ->
            "ファイル: " + f.name()
            + " (" + f.sizeBytes() + " bytes)";
        case DirectoryNode d ->
            "ディレクトリ: " + d.getName()
            + " (" + d.getChildren().size() + " 件)";
    };
}
// sealed interface により全ケース網羅が保証される`,
  },
  libraryComparison: [
    { name: "標準 API（interface + ダブルディスパッチ）", whenToUse: "データ構造が安定しており、処理のバリエーションが増える場面。外部依存なしで完結する。", tradeoff: "要素の種類が増えると全 Visitor に影響する。Java 21 では switch で代替できる場面もある。" },
    { name: "Java 21 switch パターンマッチング", whenToUse: "要素の種類が少なく、処理が数行で済む場合。Visitor のダブルディスパッチを避けて簡潔に書ける。", tradeoff: "要素が sealed でない場合は使えない。走査ロジックは別途必要。" },
    { name: "ASM / javassist", whenToUse: "Java バイトコードの走査・変換で Visitor パターンが使われている。ClassVisitor / MethodVisitor が代表例。", tradeoff: "バイトコード操作に特化しており、汎用的なデータ構造走査には使えない。" },
  ],
  faq: [
    { question: "Visitor パターンと instanceof 分岐の違いは何ですか。", answer: "Visitor は accept/visit のダブルディスパッチで型に応じた処理を実行します。instanceof 分岐は呼び出し側で型を判定します。要素が sealed interface なら Java 21 の switch で網羅チェック付きの分岐も可能です。" },
    { question: "Visitor パターンが不向きな場面はどこですか。", answer: "要素の種類が頻繁に追加される場面です。新しい要素を追加するたびに全 Visitor にメソッドを追加する必要があり、変更コストが高くなります。" },
    { question: "Composite パターンと組み合わせることが多いのはなぜですか。", answer: "Composite はツリー構造を表現し、Visitor はそのツリーを走査して処理を追加します。ファイルシステムやDOMツリーのように、再帰構造の走査と処理の分離に自然に組み合わさります。" },
  ],
  codeTitle: "VisitorPatternDemo.java",
  codeSample: `import java.util.ArrayList;
import java.util.List;

public class VisitorPatternDemo {

    interface FileSystemVisitor {
        void visitFile(FileNode file);
        void visitDirectory(DirectoryNode dir);
    }

    sealed interface FileSystemNode
            permits FileNode, DirectoryNode {
        String getName();
        void accept(FileSystemVisitor visitor);
    }

    record FileNode(String name, long sizeBytes)
            implements FileSystemNode {
        @Override public String getName() { return name; }
        @Override public void accept(FileSystemVisitor v) {
            v.visitFile(this);
        }
    }

    static final class DirectoryNode implements FileSystemNode {
        private final String name;
        private final List<FileSystemNode> children
                = new ArrayList<>();
        DirectoryNode(String name) { this.name = name; }
        @Override public String getName() { return name; }
        void add(FileSystemNode node) { children.add(node); }
        List<FileSystemNode> getChildren() { return children; }
        @Override public void accept(FileSystemVisitor v) {
            v.visitDirectory(this);
            for (var child : children) child.accept(v);
        }
    }

    static class SizeCalculatorVisitor
            implements FileSystemVisitor {
        private long totalSize = 0;
        @Override public void visitFile(FileNode file) {
            totalSize += file.sizeBytes();
        }
        @Override
        public void visitDirectory(DirectoryNode dir) {}
        long getTotalSize() { return totalSize; }
    }

    static class FileCountVisitor
            implements FileSystemVisitor {
        private final String extension;
        private int count = 0;
        FileCountVisitor(String ext) {
            extension = ext.toLowerCase();
        }
        @Override public void visitFile(FileNode file) {
            if (file.name().toLowerCase()
                    .endsWith(extension)) count++;
        }
        @Override
        public void visitDirectory(DirectoryNode dir) {}
        int getCount() { return count; }
    }

    public static void main(String[] args) {
        var root = new DirectoryNode("project");
        var src = new DirectoryNode("src");
        src.add(new FileNode("Main.java", 2048));
        src.add(new FileNode("Utils.java", 1024));
        root.add(src);
        root.add(new FileNode("pom.xml", 384));

        var sizeCalc = new SizeCalculatorVisitor();
        root.accept(sizeCalc);
        System.out.println("合計: "
            + sizeCalc.getTotalSize() + " bytes");

        var javaCount = new FileCountVisitor(".java");
        root.accept(javaCount);
        System.out.println(".java ファイル: "
            + javaCount.getCount() + " 件");
    }
}`,
},
]
