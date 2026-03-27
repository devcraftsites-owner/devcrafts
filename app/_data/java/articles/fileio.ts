import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "yaml-parsing",
  title: "Java で YAML をパースする方法と Pure Java 簡易実装",
  categorySlug: "fileio",
  summary: "フラット形式の YAML を標準 API だけで読み書きする簡易パーサーと、SnakeYAML との使い分けを整理する。",
  version: "Java 17",
  tags: ["YAML", "設定ファイル", "パーサー", "SnakeYAML", "Pure Java"],
  apiNames: ["BufferedReader", "StringReader", "LinkedHashMap", "String.indexOf", "String.substring"],
  description: "Java 標準 API だけで YAML のフラット形式を読み書きする簡易実装と、SnakeYAML を使ったネスト構造・リスト対応の方法を Java 8/17/21 対応で解説する。",
  lead: "YAML は Docker Compose、Kubernetes、Spring Boot の application.yml など、インフラや設定ファイルの記述フォーマットとして広く使われています。しかし Java 標準 API には YAML パーサーが含まれておらず、「ちょっとした設定を読みたいだけなのに外部ライブラリが必要なのか」という疑問に突き当たります。この記事では、フラットな key: value 形式に限定した簡易 YAML パーサーを Pure Java で実装し、コメント行のスキップ、引用符の除去、Map への変換までを扱います。さらに、ネスト構造やリストが必要な場合に SnakeYAML をどう使うかも併せて紹介し、「どこまで自前で対応し、どこからライブラリに委ねるか」の判断材料を提供します。",
  useCases: [
    "社内ツールの簡易設定ファイル（host・port・DB接続先など）をフラットな YAML で管理し、起動時に読み込む",
    "CI/CD パイプラインの設定値をアプリケーション側で読み取り、環境ごとの挙動を切り替える",
    "テストデータの定義を YAML で記述し、テストコードから Map として取り出して使用する",
  ],
  cautions: [
    "Pure Java の簡易実装はフラット形式（key: value）にしか対応しない。ネスト構造やリスト、アンカー・エイリアスが必要な場合は SnakeYAML を使うこと",
    "SnakeYAML の yaml.load(untrustedInput) はデシリアライズ攻撃のリスクがある。外部入力を扱う場合は SafeConstructor を使うか、yaml.load に型パラメータを指定する",
    "YAML のインデントはスペースのみ許容される（タブは不可）。設定ファイルの編集時にエディタのタブ設定を確認すること",
    "YAML の値として yes/no/on/off を書くと Boolean として解釈される場合がある。文字列として扱いたい場合は引用符で囲む必要がある",
  ],
  relatedArticleSlugs: [],
  versionCoverage: {
    java8: "文字列操作と BufferedReader で基本的なパースは可能。文字列連結は + 演算子で行う。型推論の var は使えず、型宣言が冗長になる。",
    java17: "テキストブロックで YAML サンプル文字列をコード内に読みやすく埋め込める。var による型推論で記述量が減る。SnakeYAML との組み合わせで record にマッピングすることも可能。",
    java21: "pattern matching instanceof でパース結果の Map/List を型安全にキャストできる。SnakeYAML のネスト構造取得時にキャストの安全性が上がる。",
    java8Code: `// Java 8: 文字列連結でサンプル YAML を構築
String yaml =
    "# 設定ファイル\\n" +
    "app.name: my-app\\n" +
    "server.host: localhost\\n" +
    "server.port: 8080\\n";
Map<String, String> config = parseFlat(yaml);
// 結果: {app.name=my-app, ...}`,
    java17Code: `// Java 17: テキストブロックで YAML を見やすく記述
var yamlStr = """
    app.name: my-app
    server.host: localhost
    server.port: 8080
    """;
var config = parseFlat(yamlStr);
// var で型推論、記述が簡潔に`,
    java21Code: `// Java 21: instanceof パターンで安全にキャスト
Map<String, Object> config = yaml.load(nested);
if (config.get("server") instanceof Map<?, ?> server) {
    System.out.println("host: " + server.get("host"));
    System.out.println("port: " + server.get("port"));
}`,
  },
  libraryComparison: [
    { name: "Pure Java（自前パーサー）", whenToUse: "フラットな key: value 形式のみで十分な場合。設定項目が少なく、ライブラリ依存を増やしたくないとき。", tradeoff: "ネスト構造・リスト・アンカーなど YAML の高度な機能には対応できない。複雑な設定が増えた時点で限界が来る。" },
    { name: "SnakeYAML", whenToUse: "ネスト構造やリストを含む YAML を扱う場合。Spring Boot の application.yml をアプリ側で直接読み取りたいとき。", tradeoff: "外部依存が増える。yaml.load の安全性（デシリアライズ攻撃）に注意が必要。" },
    { name: "Jackson YAML（jackson-dataformat-yaml）", whenToUse: "JSON と YAML を同じ ObjectMapper 体系で扱いたい場合。既に Jackson を使っているプロジェクトで統一したいとき。", tradeoff: "Jackson 本体 + YAML モジュールの依存が増える。小規模な設定読み込みには過剰なケースが多い。" },
  ],
  faq: [
    { question: "Properties ファイルと YAML のどちらを選ぶべきですか。", answer: "フラットな key=value で済むなら Properties のほうが標準 API で完結します。ネスト構造やリストが必要な場合、可読性を重視する場合に YAML を選ぶのが合理的です。" },
    { question: "SnakeYAML の yaml.load は安全ですか。", answer: "信頼できない入力に対して yaml.load を使うと任意のクラスをインスタンス化される危険があります。SafeConstructor を使うか、new Yaml(new Constructor(Map.class)) で型を限定してください。" },
    { question: "YAML 1.1 と 1.2 の違いは意識すべきですか。", answer: "SnakeYAML は YAML 1.1 準拠で、yes/no/on/off を Boolean に自動変換します。文字列として扱いたい場合は引用符で囲む必要があります。YAML 1.2 対応が必要なら SnakeYAML Engine を検討してください。" },
  ],
  codeTitle: "YamlParser.java",
  codeSample: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Pure Java による簡易 YAML パーサー（フラット key: value 形式のみ対応）。
 * ネスト構造やリストが必要な場合は SnakeYAML を使用してください。
 */
public class YamlParser {

    /** フラット形式の YAML 文字列を Map に変換する */
    public static Map<String, String> parseFlat(String yaml) throws IOException {
        var result = new LinkedHashMap<String, String>();
        var reader = new BufferedReader(new StringReader(yaml));
        String line;
        while ((line = reader.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith("#")) {
                continue; // 空行・コメントをスキップ
            }
            int colonIdx = line.indexOf(": ");
            if (colonIdx > 0) {
                var key = line.substring(0, colonIdx).trim();
                var value = line.substring(colonIdx + 2).trim();
                // 引用符を除去
                if ((value.startsWith("\\"") && value.endsWith("\\""))
                        || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                result.put(key, value);
            }
        }
        return result;
    }

    /** Map を YAML 文字列として出力する（フラット形式） */
    public static String dumpFlat(Map<String, String> data) {
        var sb = new StringBuilder();
        for (var entry : data.entrySet()) {
            sb.append(entry.getKey()).append(": ")
              .append(entry.getValue()).append("\\n");
        }
        return sb.toString();
    }

    public static void main(String[] args) throws IOException {
        // YAML 文字列を解析
        var yaml = """
                # アプリケーション設定
                app.name: java-recipes
                app.version: 1.0.0
                server.host: localhost
                server.port: 8080
                database.url: jdbc:postgresql://localhost/mydb
                """;

        var config = parseFlat(yaml);
        System.out.println("=== 解析結果 ===");
        config.forEach((k, v) -> System.out.println(k + " = " + v));

        // Map を YAML として出力
        var newConfig = new LinkedHashMap<String, String>();
        newConfig.put("app.name", "my-app");
        newConfig.put("server.port", "443");
        System.out.println("\\n=== YAML 出力 ===");
        System.out.println(dumpFlat(newConfig));
    }
}`,
},
{
    slug: "file-io-basics",
    title: "Java ファイル読み書きの基本と実務で使える実装パターン解説",
    categorySlug: "fileio",
    summary: "BufferedReader/Writer による UTF-8 テキスト入出力、追記、バイナリコピー、ファイル情報取得までを整理する。",
    version: "Java 17",
    tags: ["ファイルI/O", "BufferedReader", "UTF-8", "テキスト入出力", "java.io"],
    apiNames: ["BufferedReader", "BufferedWriter", "FileInputStream", "FileOutputStream", "InputStreamReader", "OutputStreamWriter", "StandardCharsets"],
    description: "Java の BufferedReader/Writer でテキストファイルを UTF-8 で安全に読み書きする方法を、追記・バイナリコピー・ファイル情報取得まで含めて解説する。",
    lead: "業務システムでは、ログの出力、バッチ処理の中間ファイル生成、他システムとの連携ファイル作成など、テキストファイルの読み書きを避けて通れません。Java の java.io パッケージには BufferedReader や BufferedWriter といった基本的なクラスが揃っていますが、文字コードの指定を忘れて文字化けを起こしたり、close 漏れでファイルが壊れたりといったトラブルが後を絶ちません。この記事では、UTF-8 を明示した安全な入出力パターンを整理し、追記モード、バイナリコピー、ファイルの存在確認やサイズ取得までを実務で再利用できる形にまとめます。",
    useCases: [
      "バッチ処理の実行ログを日付ごとのテキストファイルに出力する",
      "外部システムから受け取ったテキストファイルを1行ずつ読み込んでDB登録する",
      "帳票データを一時ファイルに書き出し、後続の帳票生成プロセスに渡す",
    ],
    cautions: [
      "FileReader/FileWriter はデフォルトでプラットフォームのエンコーディングを使うため、環境によって文字化けする。必ず InputStreamReader + StandardCharsets.UTF_8 で文字コードを明示すること。",
      "try-with-resources を使わないと、例外発生時にストリームが close されずファイルが中途半端な状態になる。",
      "FileOutputStream の append フラグ（第2引数 true）を指定し忘れると、既存ファイルの内容が上書きで消える。",
      "大容量ファイルを List に全行読み込むとメモリを圧迫する。数十万行を超える場合はストリーム処理を検討すること。",
    ],
    relatedArticleSlugs: ["nio-file-channels", "csv-read-write", "yaml-parsing"],
    versionCoverage: {
      java8: "InputStreamReader + BufferedReader の組み合わせで UTF-8 読み書きが可能。型宣言が冗長だが動作は同じ。",
      java17: "var による型推論で記述量が減る。java.io の API 自体に変更はないが、List.of() との組み合わせで簡潔に書ける。",
      java21: "java.io 系の API に大きな変更はない。NIO の Files.readString() / writeString() への移行を推奨。",
      java8Code: `// Java 8: 型宣言を省略できない
BufferedReader reader = new BufferedReader(
    new InputStreamReader(
        new FileInputStream(path), StandardCharsets.UTF_8));
String line;
while ((line = reader.readLine()) != null) {
    lines.add(line);
}`,
      java17Code: `// Java 17: var で型推論、List.of() で簡潔に
var reader = new BufferedReader(
    new InputStreamReader(
        new FileInputStream(path), StandardCharsets.UTF_8));
writeLines(path, List.of("1行目", "2行目", "3行目"));`,
      java21Code: `// Java 21: NIO の Files API を推奨
import java.nio.file.Files;
import java.nio.file.Path;
var text = Files.readString(Path.of(path));
Files.writeString(Path.of(path), content);`,
    },
    libraryComparison: [
      { name: "Pure Java（java.io）", whenToUse: "基本的なテキスト/バイナリの読み書き。外部依存を増やしたくない場合。", tradeoff: "NIO に比べてコード量が多い。パス操作やファイル属性取得が冗長になる。" },
      { name: "java.nio.file.Files", whenToUse: "Java 7 以降で新規コードを書く場合。readAllLines / writeString など1行で完結する操作が多い。", tradeoff: "小〜中規模ファイル向け。大容量ファイルは Files.lines() のストリーム処理に切り替える必要がある。" },
      { name: "Apache Commons IO", whenToUse: "FileUtils.readFileToString() などの便利メソッドが欲しい場合。", tradeoff: "外部依存が増える。標準 API で十分な場面では過剰。" },
    ],
    faq: [
      { question: "FileReader と InputStreamReader のどちらを使うべきですか。", answer: "FileReader は Java 11 以降で文字コード指定のコンストラクタが追加されましたが、Java 8 との互換性を考えると InputStreamReader + StandardCharsets.UTF_8 が無難です。" },
      { question: "NIO の Files と java.io のどちらを選ぶべきですか。", answer: "新規コードでは Files を推奨します。既存コードが java.io ベースなら無理に書き換える必要はありません。" },
      { question: "バイナリファイルのコピーにバッファサイズはどのくらいが適切ですか。", answer: "8KB（8192バイト）が一般的です。大容量ファイルなら 64KB〜1MB に増やすとスループットが向上する場合があります。" },
    ],
    codeTitle: "UTF-8 テキストファイルの読み書き",
    codeSample: `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.io.BufferedWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.io.File;
import java.io.IOException;

public class FileIoBasics {

    /** テキストファイルを UTF-8 で1行ずつ読み込む */
    public static List<String> readLines(String filePath) throws IOException {
        var lines = new ArrayList<String>();
        try (var reader = new BufferedReader(
                new InputStreamReader(
                        new FileInputStream(filePath), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                lines.add(line);
            }
        }
        return lines;
    }

    /** テキストファイルに UTF-8 で書き込む */
    public static void writeLines(String filePath, List<String> lines) throws IOException {
        try (var writer = new BufferedWriter(
                new OutputStreamWriter(
                        new FileOutputStream(filePath), StandardCharsets.UTF_8))) {
            for (var line : lines) {
                writer.write(line);
                writer.newLine();
            }
        }
    }

    /** 追記モードで1行追加 */
    public static void appendLine(String filePath, String line) throws IOException {
        try (var writer = new BufferedWriter(
                new OutputStreamWriter(
                        new FileOutputStream(filePath, true), StandardCharsets.UTF_8))) {
            writer.write(line);
            writer.newLine();
        }
    }

    public static void main(String[] args) throws IOException {
        var path = System.getProperty("java.io.tmpdir") + "/sample.txt";

        writeLines(path, List.of("1行目: Hello", "2行目: ファイルI/O", "3行目: UTF-8"));
        System.out.println("書き込み完了: " + path);

        var lines = readLines(path);
        lines.forEach(l -> System.out.println("  " + l));

        appendLine(path, "4行目: 追記");
        System.out.println("追記後: " + readLines(path).size() + "行");

        new File(path).delete();
    }
}`,
  },
{
    slug: "csv-read-write",
    title: "Java で CSV ファイルを読み書きする実装パターンと注意点",
    categorySlug: "fileio",
    summary: "ダブルクォート対応の簡易パーサーと Files.lines() によるストリーム処理で、CSV の読み書きを安全に行う。",
    version: "Java 17",
    tags: ["CSV", "ファイルI/O", "パーサー", "ストリーム処理", "データ取込"],
    apiNames: ["Files.readAllLines", "Files.write", "Files.lines", "StandardCharsets", "Path"],
    description: "Java 標準 API で CSV ファイルの読み書きとダブルクォート対応のパースを実装する方法を、ストリーム処理を含めて Java 8/17/21 対応で解説する。",
    lead: "CSV はシステム間のデータ連携、マスタ一括登録、帳票用データの受け渡しなど、業務システムでもっとも頻繁に扱うファイル形式のひとつです。一見単純なフォーマットですが、フィールド内にカンマを含む場合のダブルクォート対応、ヘッダー行の扱い、大容量ファイルのメモリ効率など、実務では意外と考慮点が多くなります。この記事では、標準 API だけで CSV の読み書きと簡易パースを実装し、大容量ファイルにも対応できる Files.lines() によるストリーム処理まで整理します。",
    useCases: [
      "経理部門が用意した商品マスタの CSV を読み込み、DB に一括登録する",
      "月次売上データを CSV で出力し、他システムや Excel との連携に使う",
      "取込処理でカンマ入りの住所フィールドを含む CSV を安全にパースする",
    ],
    cautions: [
      "標準 API には CSV パーサーが含まれないため、ダブルクォート内の改行を扱うには自前の実装が必要。複雑な CSV は Apache Commons CSV の利用を検討すること。",
      "Files.readAllLines() は全行をメモリに読み込むため、数十万行を超える CSV には Files.lines() のストリーム処理を使うこと。",
      "CSV の改行コードが CRLF・LF 混在していると、行末に \\r が残ってパースが壊れることがある。trim() での除去を忘れないこと。",
      "BOM（Byte Order Mark）付き UTF-8 ファイルを読むと先頭フィールドに \\uFEFF が混入する。必要に応じて除去処理を入れること。",
    ],
    relatedArticleSlugs: ["file-io-basics", "fixed-length-records", "yaml-parsing"],
    versionCoverage: {
      java8: "BufferedReader + FileInputStream で1行ずつ読み込む。Stream API は使えるが、Files.lines() のパス指定には Paths.get() が必要。",
      java17: "Files.readAllLines() / Files.write() で簡潔に読み書き可能。var とメソッド参照の組み合わせで記述量が減る。",
      java21: "API の変化はないが、Files.readString() で小ファイルの一括取得ができる。Virtual Threads との組み合わせで並列取込も可能。",
      java8Code: `// Java 8: BufferedReader で CSV を読み込み
try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(new FileInputStream(path),
            StandardCharsets.UTF_8))) {
    String line;
    while ((line = reader.readLine()) != null) {
        String[] fields = parseCsvLine(line);

    }
}`,
      java17Code: `// Java 17: Files.readAllLines() で一括読み込み
var lines = Files.readAllLines(path, StandardCharsets.UTF_8);
lines.stream().skip(1).forEach(line -> {
    var fields = parseCsvLine(line);

});`,
      java21Code: `// Java 21: ストリーム処理は同じだが大容量向け
try (var stream = Files.lines(path, StandardCharsets.UTF_8)) {
    stream.skip(1) // ヘッダーをスキップ
        .map(CsvParser::parseCsvLine)
        .forEach(fields -> { /* ... */ });
}`,
    },
    libraryComparison: [
      { name: "Pure Java（自前パーサー）", whenToUse: "フィールド内改行がない単純な CSV で、外部依存を増やしたくない場合。", tradeoff: "ダブルクォート内の改行やエスケープを完全に扱うには実装が複雑になる。" },
      { name: "Apache Commons CSV", whenToUse: "RFC 4180 準拠のパースが必要な場合。フィールド内改行、エスケープ、ヘッダー自動マッピングが必要なとき。", tradeoff: "外部依存が増える。小規模な CSV 処理には過剰なケースもある。" },
      { name: "OpenCSV", whenToUse: "Bean マッピング（CSV 行を POJO にバインド）が欲しい場合。", tradeoff: "ライブラリの更新頻度がやや低い。依存サイズも小さくない。" },
    ],
    faq: [
      { question: "ヘッダー行をフィールド名として使いたい場合はどうしますか。", answer: "1行目を parseCsvLine() で分割してフィールド名配列を作り、2行目以降のインデックスと対応づけるのが標準的な方法です。" },
      { question: "数十万行の CSV を処理するにはどうすべきですか。", answer: "Files.lines() で Stream を取得し、1行ずつ処理すればメモリ消費を抑えられます。try-with-resources で確実に close してください。" },
      { question: "TSV（タブ区切り）にも同じパーサーは使えますか。", answer: "区切り文字をカンマからタブに変えるだけで対応できます。ダブルクォートのルールも CSV と同様に適用されます。" },
    ],
    codeTitle: "CSV の読み書きとダブルクォート対応パーサー",
    codeSample: `import java.io.IOException;

public class CsvReadWrite {

    /** CSV ファイルを読み込む */
    public static List<String> readCsv(Path path) throws IOException {
        return Files.readAllLines(path, StandardCharsets.UTF_8);
    }

    /** CSV ファイルに書き込む */
    public static void writeCsv(Path path, List<String> lines) throws IOException {
        Files.write(path, lines, StandardCharsets.UTF_8);
    }

    /** ダブルクォート対応の簡易 CSV パーサー */
    public static String[] parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(sb.toString());
                sb = new StringBuilder();
            } else {
                sb.append(c);
            }
        }
        fields.add(sb.toString());
        return fields.toArray(String[]::new);
    }

    public static void main(String[] args) throws IOException {
        var csvLines = List.of(
            "name,price,category",
            "apple,100,fruit",
            "\\"milk, low-fat\\",200,dairy"
        );

        var tempFile = Files.createTempFile("sample", ".csv");
        tempFile.toFile().deleteOnExit();
        writeCsv(tempFile, new ArrayList<>(csvLines));

        readCsv(tempFile).stream().skip(1).forEach(line -> {
            var fields = parseCsvLine(line);
            System.out.println("name=" + fields[0] + ", price=" + fields[1]);
        });

        try (var stream = Files.lines(tempFile, StandardCharsets.UTF_8)) {
            stream.skip(1)
                .map(line -> parseCsvLine(line)[0])
                .forEach(System.out::println);
        }
    }
}`,
  },
{
    slug: "properties-config",
    title: "Java Properties ファイルで設定を安全に読み書きする",
    categorySlug: "fileio",
    summary: "クラスパスとファイルパスからの読み込み、UTF-8 対応、デフォルト値付き取得を整理する。",
    version: "Java 17",
    tags: ["Properties", "設定ファイル", "UTF-8", "クラスパス", "デフォルト値"],
    apiNames: ["Properties", "InputStreamReader", "Files.newBufferedReader", "StandardCharsets", "getResourceAsStream"],
    description: "Java 標準の Properties クラスで設定ファイルを UTF-8 対応で読み書きし、デフォルト値付きの安全な取得パターンを Java 8/17/21 対応で解説する。",
    lead: "Properties ファイルは、DB 接続先、タイムアウト値、機能フラグなど、アプリケーションの設定を外出しする標準的な手段です。Java 標準の Properties クラスで読み書きできますが、文字コードの扱いに落とし穴があります。Properties.load(InputStream) は ISO-8859-1 でしか読めないため、日本語を含む設定ファイルでは InputStreamReader で UTF-8 を明示する必要があります。この記事では、クラスパスからの読み込み、ファイルパスからの読み込み、デフォルト値付きの安全な取得、数値変換を整理し、実務でそのまま使えるユーティリティメソッドを提供します。",
    useCases: [
      "アプリケーションの DB 接続先やタイムアウト値を application.properties に外出しして環境ごとに切り替える",
      "バッチ処理の実行パラメータ（対象日、リトライ回数など）を設定ファイルで管理する",
      "テスト環境と本番環境で異なるフラグ値をプロパティファイルで制御する",
    ],
    cautions: [
      "Properties.load(InputStream) は ISO-8859-1 で読み込むため、日本語値が文字化けする。必ず InputStreamReader + UTF-8 でラップすること。",
      "getProperty() は存在しないキーで null を返す。NullPointerException を避けるため、デフォルト値付きの getProperty(key, default) を使うこと。",
      "数値プロパティを Integer.parseInt() で変換する際、値が空文字や不正文字列の場合に NumberFormatException が発生する。try-catch でデフォルト値に戻す処理を入れること。",
    ],
    relatedArticleSlugs: ["yaml-parsing", "file-io-basics", "json-parsing"],
    versionCoverage: {
      java8: "InputStreamReader + UTF-8 でラップする方式が必須。Files.newBufferedReader() は使えるが Path の生成に Paths.get() が必要。",
      java17: "var で記述が簡潔になる。Files.newBufferedReader() のデフォルトが UTF-8 のため文字コード指定を省略できる（Java 11+）。",
      java21: "Properties の API に変更はない。record と組み合わせて設定値を型安全に保持するパターンが書きやすくなる。",
      java8Code: `// Java 8: 型宣言が必要、Paths.get() を使用
Properties props = new Properties();
try (InputStreamReader reader = new InputStreamReader(
        new FileInputStream(filePath), StandardCharsets.UTF_8)) {
    props.load(reader);
}
String value = props.getProperty("db.url");`,
      java17Code: `// Java 17: var + Files.newBufferedReader()
var props = new Properties();
try (var reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
    props.load(reader);
}
var value = props.getProperty("db.url", "jdbc:h2:mem:");`,
      java21Code: `// Java 21: record で設定値を型安全に保持
record AppConfig(String dbUrl, int timeout) {}
var props = new Properties();
try (var reader = Files.newBufferedReader(path)) {
    props.load(reader);
}
var config = new AppConfig(
    props.getProperty("db.url", ""),
    Integer.parseInt(props.getProperty("timeout", "30")));`,
    },
    libraryComparison: [
      { name: "Pure Java（Properties）", whenToUse: "フラットな key=value 形式で十分な場合。標準 API のみで完結したいとき。", tradeoff: "ネスト構造やリストは表現できない。プロファイル切替などの高度な機能はない。" },
      { name: "YAML（SnakeYAML）", whenToUse: "ネスト構造やリストを含む設定が必要な場合。Spring Boot の application.yml を直接扱いたいとき。", tradeoff: "外部ライブラリの依存が増える。フラットな設定なら Properties で十分。" },
      { name: "Typesafe Config（HOCON）", whenToUse: "環境変数の参照、include、型付きの値取得が欲しい場合。", tradeoff: "ライブラリ依存が増える。学習コストもある。" },
    ],
    faq: [
      { question: "Properties ファイルに日本語を書いてもよいですか。", answer: "InputStreamReader で UTF-8 を明示すれば問題ありません。native2ascii は Java 9 以降では不要です。" },
      { question: "プロパティの順序は保持されますか。", answer: "Properties は内部的に Hashtable を継承しているため順序は保証されません。順序が必要なら LinkedHashMap に詰め替えてください。" },
      { question: "環境変数とプロパティファイルを併用するにはどうしますか。", answer: "System.getenv() で環境変数を取得し、存在しなければプロパティファイルの値にフォールバックするパターンが一般的です。" },
    ],
    codeTitle: "Properties ファイルの読み込みと安全な値取得",
    codeSample: `import java.io.FileNotFoundException;

public class PropertiesConfig {

    /** クラスパスからプロパティファイルを読み込む */
    public static Properties loadFromClasspath(String resourceName) throws IOException {
        InputStream is = PropertiesConfig.class.getClassLoader()
                .getResourceAsStream(resourceName);
        if (is == null) {
            throw new FileNotFoundException("リソースが見つかりません: " + resourceName);
        }
        var props = new Properties();
        try (var reader = new java.io.InputStreamReader(is, StandardCharsets.UTF_8)) {
            props.load(reader);
        }
        return props;
    }

    /** ファイルパスからプロパティファイルを読み込む */
    public static Properties loadFromFile(Path path) throws IOException {
        var props = new Properties();
        try (var reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            props.load(reader);
        }
        return props;
    }

    /** デフォルト値付きで安全に取得 */
    public static String get(Properties props, String key, String defaultValue) {
        return props.getProperty(key, defaultValue);
    }

    /** 数値として取得（変換失敗時はデフォルト値） */
    public static int getInt(Properties props, String key, int defaultValue) {
        var value = props.getProperty(key);
        if (value == null) return defaultValue;
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public static void main(String[] args) {
        var props = new Properties();
        props.setProperty("db.url", "jdbc:postgresql://localhost:5432/mydb");
        props.setProperty("app.name", "業務アプリ");
        props.setProperty("timeout.seconds", "30");

        System.out.println(get(props, "db.url", ""));
        System.out.println(get(props, "max.retry", "3"));
        System.out.println(getInt(props, "timeout.seconds", 60));
    }
}`,
  },
{
    slug: "nio-file-channels",
    title: "Java NIO の Files クラスでファイル操作を簡潔に書く",
    categorySlug: "fileio",
    summary: "Files.readString / writeString、コピー・移動・属性取得、ディレクトリ列挙までを NIO で整理する。",
    version: "Java 17",
    tags: ["NIO", "Files", "Path", "ファイル操作", "java.nio.file"],
    apiNames: ["Files", "Path", "StandardCopyOption", "BasicFileAttributes", "Files.readString", "Files.writeString"],
    description: "Java NIO の Files クラスで、テキスト読み書き・ファイルコピー・移動・属性取得・ディレクトリ操作を簡潔に実装する方法を Java 8/17/21 対応で解説する。",
    lead: "Java 7 で導入された java.nio.file パッケージは、従来の java.io.File に比べてファイル操作を簡潔かつ安全に書けるようになりました。Java 11 では Files.readString() / writeString() が追加され、テキストファイルの読み書きが1行で完結します。しかし実務では「どのメソッドを使えばいいのか」「java.io と混在するプロジェクトでどう使い分けるのか」という迷いが生じることも多いです。この記事では、Files クラスの主要メソッドをユースケース別に整理し、コピー・移動・属性取得・ディレクトリ操作までを実務で使える形にまとめます。",
    useCases: [
      "バッチ処理でファイルを所定のディレクトリにコピー・移動し、処理済みフォルダへ振り分ける",
      "設定ファイルやテンプレートを Files.readString() で一括読み込みし、変数を置換して出力する",
      "指定ディレクトリ内のファイルを一覧取得し、拡張子やサイズで絞り込んでバッチ対象を決定する",
    ],
    cautions: [
      "Files.readString() / readAllLines() は全内容をメモリに読み込むため、大容量ファイルには不向き。数MB を超える場合は Files.lines() でストリーム処理すること。",
      "Files.list() / Files.find() は Stream を返すが、内部でディレクトリハンドルを保持している。必ず try-with-resources で close すること。",
      "Files.move() はファイルシステムをまたぐ場合にコピー+削除にフォールバックする。処理中に電源断が起きるとファイルを失う可能性がある。",
      "Path.of() は Java 11 以降。Java 8 では Paths.get() を使う。",
    ],
    relatedArticleSlugs: ["file-io-basics", "csv-read-write", "yaml-parsing"],
    versionCoverage: {
      java8: "Files.readAllLines() / write() / copy() / move() は使用可能。Path の生成には Paths.get() を使う。readString() / writeString() は未提供。",
      java17: "Files.readString() / writeString()（Java 11+）で1行読み書きが可能。Path.of()（Java 11+）でパス生成も簡潔になる。",
      java21: "Files.mismatch()（Java 12+）でファイル比較が1行で可能。Files.find() と組み合わせた再帰検索が実務で活きる。",
      java8Code: `// Java 8: Paths.get() + readAllLines()
Path file = Paths.get("sample.txt");
List<String> lines = Files.readAllLines(file, StandardCharsets.UTF_8);

String text = String.join("\\n", lines);`,
      java17Code: `// Java 17: Path.of() + readString() で簡潔に
var file = Path.of("sample.txt");
var text = Files.readString(file); // UTF-8 がデフォルト
Files.writeString(file, "新しい内容");`,
      java21Code: `// Java 21: Files.mismatch() でファイル比較
var file1 = Path.of("a.txt");
var file2 = Path.of("b.txt");
long pos = Files.mismatch(file1, file2); // -1 なら一致
System.out.println(pos == -1 ? "一致" : "差異あり: " + pos);`,
    },
    libraryComparison: [
      { name: "java.nio.file.Files", whenToUse: "Java 7 以降の標準 API。ファイル操作全般をカバーし、外部依存なしで使える。", tradeoff: "大容量ファイルの一括読み込みはメモリに注意。ストリーム処理への切り替え判断が必要。" },
      { name: "java.io.File", whenToUse: "レガシーコードとの互換性が必要な場合。", tradeoff: "エラー情報が乏しく（boolean 返却）、例外ベースの NIO のほうが原因特定しやすい。" },
      { name: "Apache Commons IO", whenToUse: "FileUtils.copyDirectory() など、ディレクトリ単位のコピーや再帰削除が必要な場合。", tradeoff: "外部依存が増える。Files.walk() + Files.copy() の組み合わせで代替可能な場面も多い。" },
    ],
    faq: [
      { question: "java.io.File と java.nio.file.Path のどちらを使うべきですか。", answer: "新規コードでは Path を推奨します。File.toPath() で変換できるため、既存コードとの共存も容易です。" },
      { question: "Files.readString() のデフォルト文字コードは何ですか。", answer: "UTF-8 です。別の文字コードを使う場合は第2引数で Charset を指定してください。Shift_JIS のファイルを読む場合は Charset.forName(\"Shift_JIS\") を渡します。" },
      { question: "ディレクトリを中身ごと削除するにはどうしますか。", answer: "Files.walk() で深い順にソートし、Files.delete() で1つずつ削除するのが標準的な方法です。Files.delete() は空でないディレクトリには使えません。" },
    ],
    codeTitle: "NIO Files によるファイル操作",
    codeSample: `import java.io.IOException;

public class NioFileOperations {

    public static void main(String[] args) throws IOException {

        var file = Path.of("sample_nio.txt");
        var content = "1行目: NIO サンプル\\n2行目: Files API\\n3行目: UTF-8 デフォルト";
        Files.writeString(file, content);

        var text = Files.readString(file);
        System.out.println("読み込み:\\n" + text);

        var dir = Path.of("work/output");
        Files.createDirectories(dir);

        var copy = dir.resolve("sample_copy.txt");
        Files.copy(file, copy, StandardCopyOption.REPLACE_EXISTING);

        var moved = dir.resolve("sample_moved.txt");
        Files.move(copy, moved, StandardCopyOption.REPLACE_EXISTING);

        System.out.println("サイズ: " + Files.size(moved) + " bytes");
        var attrs = Files.readAttributes(moved, BasicFileAttributes.class);
        System.out.println("更新日時: " + attrs.lastModifiedTime());

        try (var stream = Files.list(dir)) {
            stream.forEach(p -> System.out.println("  " + p.getFileName()));
        }

        Files.delete(moved);
        Files.delete(dir);
        Files.delete(Path.of("work"));
        Files.delete(file);
    }
}`,
  },
{
    slug: "json-parsing",
    title: "Java で JSON を読み書きする方法と Jackson の基本",
    categorySlug: "fileio",
    summary: "Jackson の ObjectMapper による JSON のシリアライズ・デシリアライズを、record 対応やツリー操作を含めて整理する。",
    version: "Java 17",
    tags: ["JSON", "Jackson", "ObjectMapper", "シリアライズ", "デシリアライズ"],
    apiNames: ["ObjectMapper", "JsonNode", "JsonProperty", "ObjectMapper.readValue", "ObjectMapper.writeValueAsString"],
    description: "Jackson の ObjectMapper を使った JSON のシリアライズ・デシリアライズを、record 対応やネスト構造のツリー操作を含めて Java 8/17/21 対応で解説する。",
    lead: "REST API との連携、設定ファイルの読み書き、ログ出力のフォーマットなど、JSON を扱う場面は業務システムでも増え続けています。Java 標準 API には JSON パーサーが含まれていないため、多くのプロジェクトでは Jackson を使うことになります。ObjectMapper の基本的な使い方は簡単ですが、record との組み合わせ、ネスト構造の安全なアクセス、未知フィールドへの対処など、実務で迷いやすいポイントが散在しています。この記事では、Jackson の ObjectMapper を軸に、シリアライズ・デシリアライズの基本パターンからツリー操作、配列やリストの変換までを整理します。",
    useCases: [
      "外部 API のレスポンス JSON を Java オブジェクトにマッピングして業務ロジックで使う",
      "DB から取得したデータを JSON 形式に変換してフロントエンドに返す",
      "設定ファイルやテストデータを JSON 形式で管理し、起動時やテスト時に読み込む",
    ],
    cautions: [
      "ObjectMapper はスレッドセーフだがインスタンス生成コストが高い。static final で1つだけ作成し、メソッドごとに new しないこと。",
      "デシリアライズ対象クラスにはデフォルトコンストラクタが必要（POJO の場合）。record の場合は @JsonProperty でフィールド名を明示する。",
      "未知のフィールドがあると UnrecognizedPropertyException が発生する。@JsonIgnoreProperties(ignoreUnknown = true) で回避可能。API レスポンスを受ける場合は設定推奨。",
      "JsonNode.get() は存在しないキーで null を返すため NPE のリスクがある。path() を使えば MissingNode が返り安全。",
    ],
    relatedArticleSlugs: ["xml-processing", "yaml-parsing", "properties-config"],
    versionCoverage: {
      java8: "POJO（getter/setter + デフォルトコンストラクタ）でマッピングする。JSON 文字列は + 演算子で連結するため可読性が下がる。",
      java17: "record（Java 16+）で不変なデータクラスとしてマッピングできる。テキストブロックで JSON リテラルを読みやすく記述できる。",
      java21: "sealed interface + パターンマッチングで、API レスポンスの成功/エラーを型安全に分岐できる。@JsonIgnoreProperties で未知フィールド対策がさらに重要になる。",
      java8Code: `// Java 8: POJO + getter/setter が必須
static class Person {
    private String name;
    private int age;
    public Person() {}
    public Person(String name, int age) {
        this.name = name; this.age = age;
    }
    public String getName() { return name; }
    public void setName(String n) { this.name = n; }

}`,
      java17Code: `// Java 17: record で簡潔にマッピング
record Person(
    @JsonProperty("name") String name,
    @JsonProperty("age") int age
) {}
var person = MAPPER.readValue(json, Person.class);

var input = """
    {"name":"山田","age":30}
    """;`,
      java21Code: `// Java 21: sealed interface で型安全な分岐
sealed interface ApiResponse permits Success, Error {}
record Success(int code, String body) implements ApiResponse {}
record Error(int code, String msg) implements ApiResponse {}
String result = switch (response) {
    case Success s -> "OK: " + s.body();
    case Error e -> "NG: " + e.msg();
};`,
    },
    libraryComparison: [
      { name: "Jackson", whenToUse: "Java の JSON ライブラリのデファクト。Spring Boot にもバンドルされており、多くのプロジェクトで標準的に使われる。", tradeoff: "依存サイズがやや大きい。設定項目が多く、初回学習コストがある。" },
      { name: "Gson", whenToUse: "軽量な JSON ライブラリが欲しい場合。アノテーションなしでも動作する。", tradeoff: "record サポートは追加設定が必要。大規模プロジェクトでは Jackson のほうが機能が豊富。" },
      { name: "JSON-P / JSON-B（Jakarta EE）", whenToUse: "Jakarta EE 環境で標準仕様に準拠したい場合。", tradeoff: "スタンドアロンで使うには依存の追加が必要。Jackson ほどのエコシステムはない。" },
    ],
    faq: [
      { question: "ObjectMapper を毎回 new してはいけないのですか。", answer: "インスタンス生成コストが高いため、static final で1つだけ作成してください。ObjectMapper はスレッドセーフです。" },
      { question: "record クラスで Jackson を使うにはどうしますか。", answer: "Jackson 2.12 以降で record をサポートしています。@JsonProperty でフィールド名を明示するのが確実です。" },
      { question: "ネスト構造の JSON で特定の値だけ取りたい場合は。", answer: "ObjectMapper.readTree() で JsonNode を取得し、path(\"key\").path(\"nested\").asText() のようにチェーンで辿れます。" },
    ],
    codeTitle: "Jackson による JSON シリアライズ・デシリアライズ",
    codeSample: `import com.fasterxml.jackson.annotation.JsonProperty;

public class JsonParsing {

    record Person(
        @JsonProperty("name") String name,
        @JsonProperty("age") int age
    ) {}

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static void main(String[] args) throws Exception {

        var person = new Person("山田太郎", 30);
        var json = MAPPER.writeValueAsString(person);
        System.out.println("JSON: " + json);

        var input = """
                {"name":"鈴木花子","age":25}
                """;
        var parsed = MAPPER.readValue(input, Person.class);
        System.out.println("オブジェクト: " + parsed);

        var nested = """
                {"id":1,"address":{"city":"Tokyo","zip":"100-0001"}}
                """;
        JsonNode root = MAPPER.readTree(nested);
        System.out.println("city: " + root.path("address").path("city").asText());

        var arrayJson = """
                [{"name":"田中","age":20},{"name":"佐藤","age":35}]
                """;
        var people = List.of(MAPPER.readValue(arrayJson, Person[].class));
        people.forEach(p -> System.out.println("  " + p));
    }
}`,
  },
{
    slug: "xml-processing",
    title: "Java 標準 API で XML を読み書きする方法と3方式の使い分け",
    categorySlug: "fileio",
    summary: "DOM・SAX・StAX の3方式でパースし、DOM で XML を生成する。用途に応じた選び方を整理する。",
    version: "Java 17",
    tags: ["XML", "DOM", "SAX", "StAX", "パーサー"],
    apiNames: ["DocumentBuilderFactory", "SAXParserFactory", "XMLInputFactory", "Transformer", "Element"],
    description: "Java 標準 API の DOM・SAX・StAX で XML を読み込み、DOM で XML を生成する方法を、用途別の使い分けとともに Java 8/17/21 対応で解説する。",
    lead: "業務システムでは、外部システムとのデータ連携、設定ファイル、SOAP メッセージなど、XML を扱う場面がいまだに少なくありません。Java 標準 API には DOM、SAX、StAX の3つのパーサーが用意されていますが、「どれを使えばいいのか」「それぞれの利点と制約は何か」を整理できている人は多くありません。DOM はツリー全体をメモリに保持するため小〜中規模ファイルに向き、SAX はイベント駆動で大容量ファイルに対応でき、StAX はカーソル方式で SAX より直感的に書けます。この記事では、3方式のパースと DOM による XML 生成を実装しながら、用途に応じた選択基準を整理します。",
    useCases: [
      "取引先から送られてくる注文データの XML を読み込み、DB に登録する",
      "帳票出力用のデータを XML 形式で生成し、XSLT で変換してからPDF出力する",
      "SOAP ベースの外部 API と連携するために、リクエスト・レスポンスの XML を処理する",
    ],
    cautions: [
      "DOM は XML 全体をメモリに展開するため、数十MB を超えるファイルでは OutOfMemoryError のリスクがある。大容量なら SAX か StAX を使うこと。",
      "外部から受け取る XML に対して DTD 処理を有効にしたままパースすると、XXE（XML External Entity）攻撃のリスクがある。外部入力のパースでは DTD を無効化すること。",
      "SAX の characters() メソッドは1つのテキストノードでも複数回に分割して呼ばれることがある。StringBuilder に append して endElement() で確定させること。",
      "Transformer の出力エンコーディングは指定しないとプラットフォーム依存になる場合がある。OutputKeys.ENCODING に UTF-8 を設定するのが安全。",
    ],
    relatedArticleSlugs: ["json-parsing", "csv-read-write", "yaml-parsing"],
    versionCoverage: {
      java8: "DOM / SAX / StAX すべて使用可能。Map でデータを保持するため型安全性は低い。switch 文は従来の fall-through 方式。",
      java17: "record でパース結果を型安全に保持できる。var で変数宣言が簡潔になる。switch 式（アロー構文）で SAX の endElement 処理が書きやすい。",
      java21: "sealed interface + パターンマッチングで SAX イベントを型安全にモデル化できる。switch 式のレコードパターンで分岐が明確になる。",
      java8Code: `// Java 8: Map で結果を保持、switch は fall-through
List<Map<String, String>> employees = new ArrayList<>();

String text = currentText.toString().trim();
if ("name".equals(qName)) currentEmp.put("name", text);
else if ("department".equals(qName)) currentEmp.put("department", text);`,
      java17Code: `// Java 17: record + switch 式（アロー構文）
record Employee(String id, String name, String dept, int salary) {}

switch (qName) {
    case "name"       -> name = text;
    case "department" -> department = text;
    case "salary"     -> salary = text;
}`,
      java21Code: `// Java 21: sealed interface で SAX イベントをモデル化
sealed interface XmlEvent {
    record Start(String tag, String id) implements XmlEvent {}
    record Text(String content)         implements XmlEvent {}
    record End(String tag)              implements XmlEvent {}
}

for (var event : events) {
    switch (event) {
        case XmlEvent.Start(var tag, var id) -> { /* ... */ }
        case XmlEvent.Text(var content) -> { /* ... */ }
        case XmlEvent.End(var tag) -> { /* ... */ }
    }
}`,
    },
    libraryComparison: [
      { name: "Java 標準 API（DOM / SAX / StAX）", whenToUse: "外部依存を増やしたくない場合。XML の読み書きで標準 API だけで完結させたいとき。", tradeoff: "コード量が多くなりがち。XPath クエリは別途 javax.xml.xpath が必要。" },
      { name: "JAXB", whenToUse: "XML とJava オブジェクトの双方向マッピングが必要な場合。", tradeoff: "Java 11 以降は JDK から分離され、外部依存として追加が必要。アノテーションの学習コストがある。" },
      { name: "Jackson XML（jackson-dataformat-xml）", whenToUse: "JSON と XML を同じ ObjectMapper 体系で扱いたい場合。", tradeoff: "Jackson 本体 + XML モジュールの依存が必要。複雑な XML 構造には向かない場合もある。" },
    ],
    faq: [
      { question: "DOM・SAX・StAX のどれを選べばよいですか。", answer: "数MB 以下で要素の追加・削除もしたいなら DOM、大容量で読み取り専用なら SAX、大容量で直感的に書きたいなら StAX が適しています。" },
      { question: "XXE 攻撃を防ぐにはどうしますか。", answer: "DocumentBuilderFactory や SAXParserFactory で FEATURE_EXTERNAL_ENTITIES を false に設定し、DTD 処理を無効化してください。" },
      { question: "名前空間付き XML のパースは標準 API で対応できますか。", answer: "DocumentBuilderFactory.setNamespaceAware(true) を設定し、getElementsByTagNameNS() を使えば名前空間付き要素を正しく取得できます。" },
    ],
    codeTitle: "DOM・SAX・StAX による XML 読み書き",
    codeSample: `import javax.xml.parsers.DocumentBuilderFactory;

public class XmlProcessing {

    record Employee(String id, String name, String department, int salary) {}

    /** DOM で XML をパース */
    public static List<Employee> parseWithDom(String xml) throws Exception {
        var factory = DocumentBuilderFactory.newInstance();
        var doc = factory.newDocumentBuilder()
                .parse(new InputSource(new StringReader(xml)));
        doc.getDocumentElement().normalize();

        var employees = new ArrayList<Employee>();
        var list = doc.getElementsByTagName("employee");
        for (int i = 0; i < list.getLength(); i++) {
            var elem = (Element) list.item(i);
            employees.add(new Employee(
                elem.getAttribute("id"),
                elem.getElementsByTagName("name").item(0).getTextContent(),
                elem.getElementsByTagName("department").item(0).getTextContent(),
                Integer.parseInt(elem.getElementsByTagName("salary").item(0).getTextContent())
            ));
        }
        return employees;
    }

    /** DOM で XML を生成 */
    public static String buildWithDom(List<Employee> employees) throws Exception {
        var doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().newDocument();
        var root = doc.createElement("employees");
        doc.appendChild(root);

        for (var emp : employees) {
            var e = doc.createElement("employee");
            e.setAttribute("id", emp.id());
            root.appendChild(e);
            appendText(doc, e, "name", emp.name());
            appendText(doc, e, "department", emp.department());
            appendText(doc, e, "salary", String.valueOf(emp.salary()));
        }

        var transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        var sw = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(sw));
        return sw.toString();
    }

    private static void appendText(Document doc, Element parent, String tag, String text) {
        var elem = doc.createElement(tag);
        elem.setTextContent(text);
        parent.appendChild(elem);
    }

    public static void main(String[] args) throws Exception {
        var xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <employees>
                  <employee id="1">
                    <name>Yamada Taro</name>
                    <department>Development</department>
                    <salary>450000</salary>
                  </employee>
                </employees>
                """;

        parseWithDom(xml).forEach(System.out::println);
        System.out.println(buildWithDom(List.of(
            new Employee("2", "Suzuki Hanako", "Sales", 380000))));
    }
}`,
  },
{
    slug: "fixed-length-records",
    title: "Java で固定長ファイルを読み書きする実装と record 活用",
    categorySlug: "fileio",
    summary: "substring によるフィールド切り出しと String.format によるフォーマットで、固定長レコードの読み書きを整理する。",
    version: "Java 17",
    tags: ["固定長", "レコード", "フォーマット", "substring", "String.format"],
    apiNames: ["String.substring", "String.format", "BufferedReader", "StringBuilder", "Integer.parseInt"],
    description: "Java で固定長ファイルを substring で読み込み、String.format でフォーマットして書き込む方法を、record 型の活用を含めて解説する。",
    lead: "銀行の全銀フォーマット、EDI の固定長電文、メインフレーム連携のデータ交換など、固定長ファイルは旧来のシステム連携でいまだに現役です。フィールドの開始位置と長さが仕様書で決められており、カンマやタブのような区切り文字は使いません。Java では substring() でフィールドを切り出し、String.format() でゼロ埋めやスペース埋めのフォーマットを行うのが基本ですが、バイト数と文字数の違いや、トリム処理の漏れなど、実装時に踏みやすい落とし穴があります。この記事では、固定長レコードの読み書きを record 型で型安全に実装し、実務でそのまま使えるパターンを整理します。",
    useCases: [
      "銀行の全銀フォーマット（振込データ）を Java で生成し、ファイル転送する",
      "メインフレームから送られてくる固定長レコードを読み込み、DB に取り込む",
      "EDI の電文を固定長フォーマットに変換して取引先に送信する",
    ],
    cautions: [
      "日本語などのマルチバイト文字を含む場合は、文字数ではなくバイト数でフィールド位置を管理する必要がある。getBytes(charset).length でバイト長を確認すること。",
      "substring() で切り出した値は必ず trim() すること。スペース埋めのフィールドをそのまま parseInt() すると NumberFormatException が発生する。",
      "固定長ファイルでは改行コードの扱いが仕様によって異なる（CRLF / LF / 改行なし）。仕様書に従って改行コードを設定すること。",
      "右詰めゼロ埋めのフォーマット（%08d）で負の値を渡すと、マイナス記号分だけ桁あふれする。入力値の妥当性を事前にチェックすること。",
    ],
    relatedArticleSlugs: ["csv-read-write", "file-io-basics", "nio-file-channels"],
    versionCoverage: {
      java8: "substring() + String.format() で読み書き可能。データクラスは手動でコンストラクタ・toString() を定義する必要がある。",
      java17: "record（Java 16+）で不変なレコードクラスを簡潔に定義できる。var で型推論も使え、コード量が大幅に減る。",
      java21: "sealed interface でフィールド定義をモデル化し、パターンマッチングでフォーマット処理を分岐できる。",
      java8Code: `// Java 8: データクラスを手動定義
static class EmployeeRecord {
    final int id;
    final String name;

    EmployeeRecord(int id, String name, ...) {
        this.id = id; this.name = name; ...
    }
}
String formatted = String.format("%4d", rec.id)
    + String.format("%-20s", rec.name);`,
      java17Code: `// Java 17: record で簡潔に定義
record EmployeeRecord(int id, String name,
    String department, int salary, String joinDate) {}

String formatted = "%4d".formatted(rec.id())
    + "%-20s".formatted(rec.name());`,
      java21Code: `// Java 21: sealed interface + パターンマッチング
sealed interface FieldDef {
    record TextLeft(int start, int end) implements FieldDef {}
    record NumberRight(int start, int end) implements FieldDef {}
}
String value = switch (def) {
    case TextLeft(var s, var e) -> "%-" + (e-s) + "s".formatted(val);
    case NumberRight(var s, var e) -> "%0" + (e-s) + "d".formatted(val);
};`,
    },
    libraryComparison: [
      { name: "Pure Java（substring + String.format）", whenToUse: "フィールド数が少なく、仕様が固定されている場合。外部依存を増やしたくないとき。", tradeoff: "フィールド数が増えるとコードが冗長になる。仕様変更時の修正箇所が分散しやすい。" },
      { name: "Fixedformat4j", whenToUse: "アノテーションベースで固定長レコードをマッピングしたい場合。", tradeoff: "メンテナンス状況を確認する必要がある。依存ライブラリの追加が必要。" },
      { name: "自前のフィールド定義テーブル", whenToUse: "フィールド定義を外部ファイル化して仕様変更に柔軟に対応したい場合。", tradeoff: "フレームワーク的な実装が必要になり、初期構築コストが上がる。" },
    ],
    faq: [
      { question: "文字数とバイト数のどちらで位置を管理すべきですか。", answer: "仕様書に従いますが、全銀フォーマットなど多くの業務仕様はバイト数ベースです。Shift_JIS では全角1文字=2バイトで計算します。" },
      { question: "フィールドが仕様の桁数を超えた場合はどうしますか。", answer: "書き込み前にバリデーションを行い、桁あふれする場合はエラーとして処理するのが安全です。無言で切り捨てると障害の原因になります。" },
      { question: "record と通常のクラスのどちらで定義すべきですか。", answer: "Java 16 以降なら record を推奨します。不変性が保証され、equals/hashCode/toString が自動生成されるため、データ保持に適しています。" },
    ],
    codeTitle: "固定長レコードの読み書き",
    codeSample: `import java.io.BufferedReader;

/**
 * 固定長ファイルの読込・書込。
 * レコード形式（1行48文字）:
 *   [0-3]   社員番号  4桁  右詰め・スペース埋め
 *   [4-23]  氏名     20桁  左詰め・スペース埋め
 *   [24-31] 部署      8桁  左詰め・スペース埋め
 *   [32-39] 給与      8桁  右詰め・ゼロ埋め
 *   [40-47] 入社日    8桁  yyyyMMdd
 */
public class FixedLengthRecords {

    record EmployeeRecord(int id, String name, String department,
                          int salary, String joinDate) {}

    /** レコードを固定長1行にフォーマット */
    public static String format(EmployeeRecord rec) {
        return "%4d".formatted(rec.id())
             + "%-20s".formatted(rec.name())
             + "%-8s".formatted(rec.department())
             + "%08d".formatted(rec.salary())
             + rec.joinDate();
    }

    /** 固定長1行をレコードにパース */
    public static EmployeeRecord parse(String line) {
        var id         = Integer.parseInt(line.substring(0,  4).trim());
        var name       = line.substring(4,  24).trim();
        var department = line.substring(24, 32).trim();
        var salary     = Integer.parseInt(line.substring(32, 40).trim());
        var joinDate   = line.substring(40, 48).trim();
        return new EmployeeRecord(id, name, department, salary, joinDate);
    }

    public static void main(String[] args) throws IOException {
        var records = List.of(
            new EmployeeRecord(1, "Yamada Taro", "DEV", 450000, "20200401"),
            new EmployeeRecord(2, "Suzuki Hanako", "SALES", 380000, "20210601"),
            new EmployeeRecord(1234, "Tanaka Jiro", "HR", 320000, "20220401")
        );

        var sb = new StringBuilder();
        for (var rec : records) {
            sb.append(format(rec)).append(System.lineSeparator());
        }
        var fileContent = sb.toString();
        System.out.println("=== 固定長フォーマット ===");
        System.out.print(fileContent);

        System.out.println("\\n=== パース結果 ===");
        try (var br = new BufferedReader(new StringReader(fileContent))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (!line.isBlank()) {
                    System.out.println(parse(line));
                }
            }
        }
    }
}`,
  },
]
