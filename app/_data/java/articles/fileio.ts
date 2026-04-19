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
    lead: "CSV はシステム間のデータ連携、マスタ一括登録、帳票用データの受け渡しなど、業務システムでもっとも頻繁に扱うファイル形式のひとつです。一見単純なフォーマットですが、フィールド内にカンマを含む場合のダブルクォート対応、ヘッダー行の扱い、大容量ファイルのメモリ効率など、実務では意外と考慮点が多くなります。標準 API だけで CSV の読み書きと簡易パースを実装し、大容量ファイルにも対応できる Files.lines() によるストリーム処理まで整理した。",
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
      "実務でよく見かけるのが、Excel から出力した CSV の先頭に BOM が付いていてパース結果がおかしくなるケース。取込元が Excel の場合は BOM 除去処理を最初から入れておくと後の調査コストが下がる。",
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
    lead: "REST API との連携、設定ファイルの読み書き、ログ出力のフォーマットなど、JSON を扱う場面は業務システムでも増え続けています。Java 標準 API には JSON パーサーが含まれていないため、多くのプロジェクトでは Jackson を使うことになります。ObjectMapper の基本的な使い方は簡単ですが、record との組み合わせ、ネスト構造の安全なアクセス、未知フィールドへの対処など、実務で迷いやすいポイントが散在しています。Jackson の ObjectMapper を軸に、シリアライズ・デシリアライズの基本パターンからツリー操作、配列やリストの変換まで整理した。",
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
      "実務では外部 API の仕様変更でフィールドが増減したときに UnrecognizedPropertyException が発生して障害になるケースがある。外部 API のレスポンスを受けるクラスには @JsonIgnoreProperties(ignoreUnknown = true) を最初から付けておくのが安全。",
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
    relatedArticleSlugs: ["csv-read-write", "file-io-basics", "zengin-format"],
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
{
    slug: "zengin-format",
    title: "Java で全銀フォーマットの振込データを生成する実装",
    categorySlug: "fileio",
    summary: "全銀協が定めた120バイト固定長の振込フォーマットを、ヘッダ・データ・トレーラ・エンドの4レコード構成で生成する。",
    version: "Java 17",
    tags: ["全銀", "振込", "固定長", "バッチ", "金融", "全銀フォーマット", "JIS X 0201"],
    apiNames: ["String.format", "StringBuilder", "Charset.forName", "String.getBytes", "Files.write", "Path"],
    description: "全銀フォーマット（総合振込）の120バイト固定長レコードを Java 標準 API で生成する方法を、ヘッダ・データ・トレーラ・エンドの4種別構成で Java 8/17/21 対応で解説する。",
    lead: "固定長フォーマットとは、各フィールドが仕様書で決められたバイト数を占め、短い場合はスペースやゼロで埋めるデータ交換形式です。CSV のようにデリミタで区切る可変長形式と異なり、バイト位置だけでフィールドを特定できるため、汎用機・ホストコンピュータとのデータ連携で長く使われてきました。全銀フォーマットもこの固定長形式を採用しており、すべてのレコードが120バイト固定長である点が最大の特徴です。フォーマットはヘッダ（レコード区分1）、データ（区分2）、トレーラ（区分8）、エンド（区分9）の4種別で構成され、文字コードは JIS X 0201（半角カナ・英数字）、エンコーディングには Shift_JIS を使用します。数値フィールドは右詰めゼロ埋め、文字フィールドは左詰めスペース埋めという規則があり、1バイトでもずれると銀行側で受付エラーになります。ただし、全銀協の標準仕様はあくまで共通の骨格です。使用可能な文字セットの細部、データレコードの振込区分・EDI情報フィールドの値、レコード間の改行コードの有無など、実装上の重要な挙動は銀行ごとに異なります。特に新規コード対応以降は銀行が個別に要求する内容が増えており、実装前に必ず対象銀行のフォーマット仕様書を入手することが前提です。全銀仕様書に基づいたレコード生成処理を Pure Java で実装し、フィールドごとのバイト長・パディング規則・よくある実装ミスを整理した。トレーラの合計件数・合計金額によるデータ整合性チェックの仕組みも含め、実務でそのまま使える形に仕上げている。",
    useCases: [
      "月次の総合振込データを基幹システムから生成し、銀行のファームバンキングへ送信する",
      "給与振込バッチで従業員の口座情報と支給額を全銀フォーマットに変換する",
      "取引先への支払データを経理システムから全銀形式でエクスポートする",
      "口座振替の請求データを全銀フォーマットで作成し、収納代行サービスへ連携する",
      "テスト環境で全銀データのダミーファイルを生成し、受入テストに使用する",
    ],
    cautions: [
      "全レコードは120バイト固定長でなければならない。半角カナ（JIS X 0201）はShift_JISで1バイトだが、全角文字が混入すると2バイトになりレコード長がずれる。生成後に getBytes(\"Shift_JIS\").length で必ず120バイトを検証すること。",
      "受取人名や銀行名は半角カナで記述する。濁点（ﾞ）・半濁点（ﾟ）は独立した1バイト文字としてカウントされるため、「ﾊﾞ」は2バイト（ﾊ+ﾞ）になる。文字数とバイト数を混同しないこと。",
      "使用可能な文字セットは銀行によって異なる。全銀協標準では半角カナ・英大文字・数字・一部の半角記号（スペース、括弧、ハイフン、スラッシュ等）を認めているが、特定記号の可否や法人略称記号（ｶ)、ﾕ)等）の扱いは銀行の個別仕様で制限・拡張される場合がある。対象銀行のフォーマット仕様書で許容文字を必ず確認すること。",
      "データレコードの振込区分フィールドやEDI情報（振込付帯情報）は、銀行・ファームバンキングサービスによって独自の設定値や追加フィールドを要求するケースがある。特に新規コード（データ91桁目）以降の予備領域は、一部の銀行が独自情報の格納に使用している。標準仕様書だけを参照して実装すると受付エラーになる場合があるため、必ず対象銀行のフォーマット仕様書を入手して確認すること。",
      "トレーラの合計件数・合計金額がデータレコードの実値と一致しないと、銀行側で受付エラーになる。生成処理で必ず集計値を検証するステップを入れること。",
      "振込指定日（MMDD）が銀行の営業日でない場合、翌営業日扱いになるか受付拒否になるかは銀行の運用による。事前に営業日カレンダーとの突き合わせが必要。",
      "レコード間の改行コードの扱いは銀行によって3パターンある。①CRLF（\\r\\n）を含めて受け付ける、②LFのみを受け付ける、③改行コードなし（120バイト×レコード数の純粋な固定長連結）を要求する。仕様書に記載がない場合は必ず銀行に確認すること。改行コードの不一致は受付エラーの典型的な原因のひとつ。",
    ],
    relatedArticleSlugs: ["fixed-length-records", "csv-read-write", "zengin-charset"],
    versionCoverage: {
      java8: "データクラスは手動でフィールド・コンストラクタを定義する必要がある。String.format() でパディングし、StringBuilder でレコードを組み立てる。var が使えないため型宣言が冗長になる。",
      java17: "record で振込データを簡潔に定義できる。var による型推論と String.formatted() で記述量が大幅に減る。テキストブロックはバイナリフォーマットでは使わないが、テスト用の期待値記述には有用。",
      java21: "sealed interface + record でレコード種別（ヘッダ・データ・トレーラ・エンド）を型安全に表現できる。switch パターンマッチングで種別ごとのフォーマット処理を分岐し、新しいレコード種別を追加した際にコンパイルエラーで実装漏れを検出できる。",
      java8Code: `// Java 8: データクラスを手動で定義し、String.format でパディング
static class TransferData {
    final String bankCode;      // 振込先銀行番号（4桁）
    final String accountHolder; // 受取人名（30桁・半角カナ）
    final long amount;          // 振込金額（10桁）
    // ... コンストラクタ省略
}
// 数値: 右詰めゼロ埋め / 文字: 左詰めスペース埋め
String line = "2"
    + String.format("%04d", Long.parseLong(data.bankCode))
    + String.format("%-30s", data.accountHolder)
    + String.format("%010d", data.amount);`,
      java17Code: `// Java 17: record + var + formatted() で簡潔に記述
record TransferData(
    String bankCode,       // 振込先銀行番号（4桁）
    String accountHolder,  // 受取人名（30桁・半角カナ）
    long amount            // 振込金額（10桁）
) {}
var line = "2"
    + "%04d".formatted(Long.parseLong(data.bankCode()))
    + "%-30s".formatted(data.accountHolder())
    + "%010d".formatted(data.amount());`,
      java21Code: `// Java 21: sealed interface で4種別を型安全に定義し switch で分岐
sealed interface ZenginRecord {
    record Header(String clientCode, String clientName) implements ZenginRecord {}
    record Data(String bankCode, long amount)           implements ZenginRecord {}
    record Trailer(int count, long total)               implements ZenginRecord {}
    record End()                                        implements ZenginRecord {}
}
// 網羅性チェック付き: 種別追加時にコンパイルエラーで漏れを検出
String line = switch (record) {
    case Header h   -> "1" + spacePad(h.clientCode(), 10) + "...";
    case Data d     -> "2" + zeroPad(Long.parseLong(d.bankCode()), 4) + "...";
    case Trailer t  -> "8" + zeroPad(t.count(), 6) + zeroPad(t.total(), 12) + "...";
    case End e      -> "9" + spacePad("", 119);
};`,
    },
    libraryComparison: [
      { name: "Pure Java（StringBuilder + String.format）", whenToUse: "全銀フォーマットのようにフィールド定義が仕様書で厳密に決まっている場合。レコード種別が4種と少なく、外部依存を増やしたくないとき。", tradeoff: "フィールド位置・桁数を手動で管理するため、仕様変更時に修正箇所が分散しやすい。テストコードでバイト長を検証する運用が必須になる。" },
      { name: "Fixedformat4j", whenToUse: "アノテーションベースでフィールド定義と Java オブジェクトのマッピングを自動化したい場合。複数の固定長フォーマットを扱うプロジェクトで統一したいとき。", tradeoff: "全銀フォーマット固有のルール（半角カナ、レコード区分による構造切替）はカスタムコンバータの実装が必要。ライブラリのメンテナンス状況も要確認。" },
      { name: "自前のフィールド定義テーブル（Map/List で桁数・パディングを管理）", whenToUse: "全銀以外にも EDI やメインフレーム連携の固定長フォーマットが複数ある場合。フィールド定義を外部ファイル化して仕様変更に柔軟に対応したいとき。", tradeoff: "フレームワーク的な実装が必要で初期構築コストが上がる。小規模なら Pure Java の直書きで十分なことが多い。" },
    ],
    faq: [
      { question: "全銀フォーマットのレコード長が120バイトにならない場合、どこを確認すべきですか。", answer: "半角カナの濁点・半濁点が独立1バイトとしてカウントされているか、全角文字が混入していないかを確認します。生成後に getBytes(\"Shift_JIS\").length で各レコードのバイト長を検証するテストを入れるのが確実です。" },
      { question: "レコード間にCRLFを入れるべきですか。", answer: "銀行によって異なります。CRLFを含めて受け付ける銀行、LFのみの銀行、改行コードなし（純粋な固定長連結）を要求する銀行があります。仕様書に記載がなければ銀行担当者に確認してください。誤った改行コードは受付エラーの原因になります。" },
      { question: "データレコードの予備領域（91桁以降）は何も入れなくてよいですか。", answer: "標準仕様ではスペース埋めですが、一部の銀行はEDI情報（振込付帯情報）や独自の振込区分を予備領域に格納するよう要求します。新規コード対応後は銀行ごとの個別要件が増えているため、必ず対象銀行のフォーマット仕様書を確認してください。" },
      { question: "テスト環境で全銀データの受入テストをするにはどうすればよいですか。", answer: "ダミーの銀行コード・口座番号で全銀ファイルを生成し、銀行が提供するフォーマットチェックツールやファームバンキングのテスト機能で検証します。本番の口座番号は絶対に使わないでください。" },
      { question: "総合振込以外（給与振込・口座振替）の全銀フォーマットも同じ構造ですか。", answer: "基本のヘッダ・データ・トレーラ・エンドの4構成は共通ですが、種別コード（ヘッダ2-3桁目）やデータレコードのフィールド配置が異なります。種別ごとに全銀仕様書を確認してフィールド定義を切り替えてください。" },
    ],
    codeTitle: "全銀フォーマット（総合振込）のレコード生成",
    codeSample: `import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

/**
 * 全銀フォーマット（総合振込）のレコード生成サンプル。
 *
 * ■ 固定長フォーマットとは
 *   各フィールドが仕様書で決められたバイト数を占め、短い場合はスペース/ゼロで埋める
 *   データ形式。バイト位置でフィールドを特定するため、区切り文字がない。
 *
 * ■ レコード構成（全種別120バイト固定長）
 *   ヘッダ  （レコード区分: 1）— ファイル先頭に1件。委託者情報・仕向銀行を格納。
 *   データ  （レコード区分: 2）— 振込1件につき1レコード。振込先・金額を格納。
 *   トレーラ（レコード区分: 8）— 合計件数・合計金額。銀行側が整合性チェックに使用。
 *   エンド  （レコード区分: 9）— ファイル終端を示す。1+119スペースのみ。
 *
 * ■ パディング規則
 *   数値フィールド → 右詰め・前ゼロ埋め（例: 金額 1500000 → "0001500000"）
 *   文字フィールド → 左詰め・後ろスペース埋め（例: 銀行名 "ﾐｽﾞﾎ" → "ﾐｽﾞﾎ          "）
 *
 * ■ 文字コード
 *   JIS X 0201（半角カナ・英数字・一部記号）、Shift_JIS エンコーディング
 *   ※ 使用可能文字の細部（記号の可否等）は銀行によって異なる
 *
 * ■ 改行コードについて
 *   CRLF を含めて受け付ける銀行、LF のみ、改行なし（純粋な固定長連結）がある。
 *   対象銀行のフォーマット仕様書で必ず確認すること。
 *
 * ⚠ 実装前に対象銀行のフォーマット仕様書を入手すること。
 *   特にデータレコードの予備領域（91桁以降）は銀行独自の利用がある場合がある。
 */
public class ZenginFormatGenerator {

    /** Shift_JIS エンコーディング（全銀フォーマットの標準文字コード） */
    private static final Charset SHIFT_JIS = Charset.forName("Shift_JIS");

    // ── 振込データを record で定義 ──────────────────────────
    record TransferData(
        String bankCode,       // 振込先銀行番号（4桁・数値）
        String bankName,       // 振込先銀行名（15桁・半角カナ）
        String branchCode,     // 振込先支店番号（3桁・数値）
        String branchName,     // 振込先支店名（15桁・半角カナ）
        String accountType,    // 預金種目（1桁: 1=普通, 2=当座, 4=貯蓄）
        String accountNumber,  // 口座番号（7桁・数値）
        String accountHolder,  // 受取人名（30桁・半角カナ）
        long amount            // 振込金額（10桁・数値）
    ) {}

    // ── 右詰めゼロ埋め（数値フィールド用） ──────────────────
    // 全銀仕様: 数値フィールドは右詰め・前ゼロ埋め
    // 例: zeroPad(1500000, 10) → "0001500000"
    static String zeroPad(long value, int length) {
        return ("%" + "0" + length + "d").formatted(value);
    }

    // ── 左詰めスペース埋め（文字フィールド用） ──────────────
    // 全銀仕様: 文字フィールドは左詰め・後ろスペース埋め
    // 例: spacePad("ﾐｽﾞﾎ", 15) → "ﾐｽﾞﾎ          "（15桁）
    static String spacePad(String value, int length) {
        return ("%-" + length + "s").formatted(value);
    }

    // ── ヘッダレコード（レコード区分: 1）120バイト ─────────
    // 全銀仕様書「ヘッダ・レコード」に対応
    // ファイル先頭に必ず1件。委託者情報と仕向銀行情報を格納する
    static String buildHeader(String clientCode, String clientName,
                               String transferDate, String bankCode,
                               String bankName, String branchCode,
                               String branchName) {
        var sb = new StringBuilder();
        // [1]     レコード区分 — 1=ヘッダを示す固定値
        sb.append("1");
        // [2-3]   種別コード — 21=総合振込（給与振込は11、口座振替は91）
        sb.append("21");
        // [4]     コード区分 — 0=JIS（半角カナ）、1=EBCDIC
        sb.append("0");
        // [5-14]  委託者コード — 銀行から付番される10桁の識別番号
        sb.append(spacePad(clientCode, 10));
        // [15-54] 委託者名 — 40桁・半角カナ・左詰めスペース埋め
        sb.append(spacePad(clientName, 40));
        // [55-58] 振込指定日 — MMDD形式の4桁（例: 0401=4月1日）
        sb.append(transferDate);
        // [59-62] 仕向銀行番号 — 4桁・ゼロ埋め（例: 0001=みずほ銀行）
        sb.append(zeroPad(Long.parseLong(bankCode), 4));
        // [63-77] 仕向銀行名 — 15桁・半角カナ・スペース埋め
        sb.append(spacePad(bankName, 15));
        // [78-80] 仕向支店番号 — 3桁・ゼロ埋め
        sb.append(zeroPad(Long.parseLong(branchCode), 3));
        // [81-95] 仕向支店名 — 15桁・半角カナ・スペース埋め
        sb.append(spacePad(branchName, 15));
        // [96-120] 予備 — 25桁・スペース埋め（将来の拡張用）
        sb.append(spacePad("", 25));
        return sb.toString();
    }

    // ── データレコード（レコード区分: 2）120バイト ─────────
    // 振込1件につき1レコード。振込先の銀行・口座・金額を格納する
    static String buildDataRecord(TransferData data) {
        var sb = new StringBuilder();
        // [1]     レコード区分 — 2=データを示す固定値
        sb.append("2");
        // [2-5]   振込先銀行番号 — 金融機関コード4桁・ゼロ埋め
        sb.append(zeroPad(Long.parseLong(data.bankCode()), 4));
        // [6-20]  振込先銀行名 — 15桁・半角カナ・スペース埋め
        sb.append(spacePad(data.bankName(), 15));
        // [21-23] 振込先支店番号 — 支店コード3桁・ゼロ埋め
        sb.append(zeroPad(Long.parseLong(data.branchCode()), 3));
        // [24-38] 振込先支店名 — 15桁・半角カナ・スペース埋め
        sb.append(spacePad(data.branchName(), 15));
        // [39-42] 手形交換所番号 — 振込の場合は0000固定
        sb.append("0000");
        // [43]    預金種目 — 1=普通預金, 2=当座預金, 4=貯蓄預金
        sb.append(data.accountType());
        // [44-50] 口座番号 — 7桁・ゼロ埋め
        sb.append(zeroPad(Long.parseLong(data.accountNumber()), 7));
        // [51-80] 受取人名 — 30桁・半角カナ・スペース埋め
        //         法人は「ｶ)」「ﾕ)」等の略称記号を先頭に付ける
        sb.append(spacePad(data.accountHolder(), 30));
        // [81-90] 振込金額 — 10桁・ゼロ埋め（最大9,999,999,999円）
        sb.append(zeroPad(data.amount(), 10));
        // [91]    新規コード — 0=その他, 1=第1回振込, 2=変更
        //         ※ 銀行によっては独自の振込区分コードを要求する場合がある
        sb.append("0");
        // [92-120] 予備 — 29桁（標準はスペース埋め）
        //   ⚠ 銀行によってはここにEDI情報（振込付帯情報）や独自フィールドを設定する。
        //   特に新規コード対応以降、この領域の使い方は銀行ごとに異なる。
        //   対象銀行のフォーマット仕様書を必ず確認すること。
        sb.append(spacePad("", 29));
        return sb.toString();
    }

    // ── トレーラレコード（レコード区分: 8）120バイト ────────
    // データレコードの合計件数と合計金額を格納する
    // 銀行側はこの値とデータレコードの実値を突き合わせて整合性を検証する
    static String buildTrailer(int totalCount, long totalAmount) {
        var sb = new StringBuilder();
        // [1]     レコード区分 — 8=トレーラを示す固定値
        sb.append("8");
        // [2-7]   合計件数 — データレコードの件数（6桁・ゼロ埋め）
        sb.append(zeroPad(totalCount, 6));
        // [8-19]  合計金額 — 全データレコードの振込金額合計（12桁・ゼロ埋め）
        sb.append(zeroPad(totalAmount, 12));
        // [20-120] 予備 — 101桁・スペース埋め
        sb.append(spacePad("", 101));
        return sb.toString();
    }

    // ── エンドレコード（レコード区分: 9）120バイト ──────────
    // ファイルの終端を示す。レコード区分以外はすべてスペース埋め
    static String buildEnd() {
        var sb = new StringBuilder();
        // [1]     レコード区分 — 9=エンドを示す固定値
        sb.append("9");
        // [2-120] 予備 — 119桁・スペース埋め
        sb.append(spacePad("", 119));
        return sb.toString();
    }

    // ── バイト長検証 ─────────────────────────────────────────
    // 全レコードが120バイトであることを Shift_JIS ベースで検証する
    static void validateByteLength(String record, String label) {
        var byteLen = record.getBytes(SHIFT_JIS).length;
        if (byteLen != 120) {
            throw new IllegalStateException(
                "%s のバイト長が不正です: expected=120, actual=%d".formatted(label, byteLen));
        }
    }

    public static void main(String[] args) {
        // 振込データを準備（2件の総合振込）
        var transfers = List.of(
            new TransferData(
                "0001", "ﾐｽﾞﾎ", "001", "ﾎﾝﾃﾝ",
                "1", "1234567", "ｶ)ﾔﾏﾀﾞｼﾖｳﾃﾝ", 1500000L
            ),
            new TransferData(
                "0009", "ﾐﾂﾋﾞｼUFJ", "002", "ﾏﾙﾉｳﾁ",
                "1", "7654321", "ｻﾄｳﾀﾛｳ", 280000L
            )
        );

        // ── ファイル全体を組み立て ────────────────────────
        var lines = new ArrayList<String>();

        // (1) ヘッダレコード — ファイル先頭に1件
        var header = buildHeader(
            "1234567890", "ｶ)ｻﾝﾌﾟﾙｷｷﾞﾖｳ",
            "0401", "0001", "ﾐｽﾞﾎ", "001", "ﾎﾝﾃﾝ"
        );
        validateByteLength(header, "ヘッダ");
        lines.add(header);

        // (2) データレコード — 振込1件につき1行
        var totalAmount = 0L;
        for (var td : transfers) {
            var dataLine = buildDataRecord(td);
            validateByteLength(dataLine, "データ");
            lines.add(dataLine);
            totalAmount += td.amount();
        }

        // (3) トレーラレコード — 件数・金額の合計で整合性を担保
        var trailer = buildTrailer(transfers.size(), totalAmount);
        validateByteLength(trailer, "トレーラ");
        lines.add(trailer);

        // (4) エンドレコード — ファイル終端
        var end = buildEnd();
        validateByteLength(end, "エンド");
        lines.add(end);

        // 結果を出力（各行120バイト）
        for (var line : lines) {
            System.out.println("(%3d bytes) %s".formatted(
                line.getBytes(SHIFT_JIS).length, line));
        }
    }
}`,
  },
{
    slug: "zengin-edi-zedi",
    title: "Java で ZEDI（全銀EDI）XML 電文を生成・パースする実装",
    categorySlug: "fileio",
    summary: "ISO 20022 ベースの ZEDI XML 電文を DOM / StAX で生成・パースし、振込付帯情報を扱う方法を整理する。",
    version: "Java 17",
    tags: ["ZEDI", "全銀EDI", "XML", "振込付帯情報", "金融", "ISO 20022", "DOM", "StAX"],
    apiNames: ["DocumentBuilderFactory", "XMLStreamReader", "XMLInputFactory", "Transformer", "Element", "Document", "NodeList", "InputSource"],
    description: "Java 標準 API の DOM・StAX で ZEDI（全銀EDIシステム）の XML 電文を生成・パースする方法を、名前空間・XXE 対策・バージョン差分を含めて解説する。",
    lead: "ZEDI（全銀EDIシステム）は、2018年に稼働を開始した XML ベースの金融EDI基盤です。従来の全銀フォーマットでは振込データに付帯できる情報が限られていましたが、ZEDI では ISO 20022 に準拠した XML メッセージフォーマットを採用し、請求書番号・支払通知番号・明細情報といった商取引に関わる付帯情報を振込データとあわせて送受信できるようになりました。企業間の売掛金消込や入金照合の自動化を推進するための仕組みであり、全国銀行協会が技術仕様書を公開しています。ZEDI の XML 電文を Java 標準 API（DOM / StAX）で生成・パースする方法を整理した。名前空間の扱い、XXE 対策、文字コードの指定、スキーマ検証の要否といった実装上の注意点を押さえつつ、振込付帯情報の読み書きを業務で使える形にまとめている。ISO 20022 の pain.001（振込指図）メッセージ構造に沿って、RmtInf（付帯情報）ブロックの組み立てとパースに焦点を当てる。",
    useCases: [
      "振込データに請求書番号を付帯し、受取側で売掛金の自動消込に利用する",
      "取引先から受信した ZEDI 電文をパースし、支払通知番号をもとに入金と請求の自動照合を行う",
      "月次の一括振込バッチで、複数の振込取引にそれぞれ異なる付帯情報（明細番号・契約番号）を付与して送信する",
      "経理システムから出力した振込データを ZEDI XML 形式に変換し、インターネットバンキング経由で銀行に送信する",
      "受信した ZEDI 電文の付帯情報を DB に取り込み、未消込の売掛金一覧と突合するバッチ処理を実装する",
    ],
    cautions: [
      "ZEDI の XML は名前空間付きである。DocumentBuilderFactory.setNamespaceAware(true) を設定しないと getElementsByTagNameNS() で要素を取得できない。名前空間なしの getElementsByTagName() では正しくヒットしない場合がある。",
      "外部から受信した XML をパースする際は、XXE（XML External Entity）攻撃を防ぐために DTD 処理と外部エンティティの読み込みを無効化すること。DocumentBuilderFactory では disallow-doctype-decl と external-general-entities の両方を設定する。",
      "Transformer でXML文字列を出力する際、OutputKeys.ENCODING を指定しないとプラットフォーム依存のエンコーディングが使われる可能性がある。ZEDI 電文は UTF-8 が標準であるため、明示的に UTF-8 を設定すること。",
      "ISO 20022 のメッセージには多数の任意要素がある。パース時に getElementsByTagNameNS() の結果が空（getLength() == 0）になるケースを必ずハンドリングし、NullPointerException を防ぐこと。",
      "ZEDI の技術仕様書で定められた要素名（CstmrCdtTrfInitn、RmtInf、RfrdDocInf など）は ISO 20022 の略語に基づいている。仕様書のフィールド定義と XML 要素名の対応を事前に確認してから実装に入ること。",
    ],
    relatedArticleSlugs: ["xml-processing", "zengin-format", "zengin-charset"],
    versionCoverage: {
      java8: "DOM / StAX ともに使用可能だが、var が使えず型宣言が冗長になる。パース結果の保持に Map や独自クラスが必要で、record のような簡潔な定義はできない。",
      java17: "var で DOM 操作のローカル変数を簡潔に記述でき、record でパース結果を不変かつ型安全に保持できる。テキストブロックでサンプル XML の埋め込みも可読性が高い。",
      java21: "sealed interface で XML イベント（StartElement / Characters / EndElement）を型安全にモデル化し、switch 式のパターンマッチングでイベント種別ごとの分岐を網羅的に記述できる。when ガードとの併用で条件付き分岐も簡潔に書ける。",
      java8Code: `// Java 8: 型宣言が冗長、パース結果は Map で保持
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
factory.setNamespaceAware(true);
DocumentBuilder builder = factory.newDocumentBuilder();
Document doc = builder.parse(new InputSource(new StringReader(xml)));

// Map にパース結果を格納（record が使えないため）
Map<String, String> record = new HashMap<>();
NodeList amtNodes = txElem.getElementsByTagNameNS(NS, "InstdAmt");
if (amtNodes.getLength() > 0) {
    record.put("amount", amtNodes.item(0).getTextContent());
}`,
      java17Code: `// Java 17: var + record でパース結果を型安全に保持
record ZediRemittanceInfo(String invoiceNumber, long amount,
    String currency, String payeeName, String additionalInfo) {}

var factory = DocumentBuilderFactory.newInstance();
factory.setNamespaceAware(true);
var doc = factory.newDocumentBuilder()
    .parse(new InputSource(new StringReader(xml)));

// record コンストラクタで不変オブジェクトに格納
results.add(new ZediRemittanceInfo(invoiceNumber,
    Long.parseLong(amount), currency, payeeName, additionalInfo));`,
      java21Code: `// Java 21: sealed interface + パターンマッチングで XML イベントを分岐
sealed interface ZediXmlEvent {
    record StartElement(String name, String attr) implements ZediXmlEvent {}
    record Characters(String text) implements ZediXmlEvent {}
    record EndElement(String name) implements ZediXmlEvent {}
}

for (var event : events) {
    switch (event) {
        case StartElement(var name, var attr) -> currentTag = name;
        case Characters(var text) when inTxInf -> parseField(currentTag, text);
        case Characters _ -> { /* 対象外テキストをスキップ */ }
        case EndElement(var name) when "CdtTrfTxInf".equals(name) -> commitRecord();
        case EndElement _ -> { /* 他の終了タグは無視 */ }
    }
}`,
    },
    libraryComparison: [
      { name: "Java 標準 API（DOM）", whenToUse: "電文1件ずつの生成やパースで、XML全体をツリーとして操作したい場合。要素の追加・削除・属性設定が自在にでき、ZEDI 電文の組み立てに向いている。", tradeoff: "XML 全体をメモリに展開するため、数千件の電文を一括処理する場合はメモリ消費に注意が必要。数十MB を超える XML には不向き。" },
      { name: "Java 標準 API（StAX）", whenToUse: "大量の ZEDI 電文を順次パースするバッチ処理。カーソル方式で1要素ずつ読み進めるため、メモリ効率がよい。", tradeoff: "前方向にしか進めないため、パース結果を組み立てるロジックが DOM より複雑になる。XML の生成には XMLStreamWriter を使うが、名前空間の管理が手間になる。" },
      { name: "JAXB（jakarta.xml.bind）", whenToUse: "ISO 20022 の XSD スキーマから Java クラスを自動生成し、オブジェクトと XML の双方向マッピングを行いたい場合。大規模な ZEDI 対応システムに向く。", tradeoff: "Java 11 以降は JDK に含まれず外部依存が必要。XSD からのコード生成の初期構築コストが高く、小規模な連携には過剰。" },
    ],
    faq: [
      { question: "ZEDI と従来の全銀フォーマットの違いは何ですか。", answer: "全銀フォーマットは固定長テキスト形式で付帯情報の自由度が低いのに対し、ZEDI は ISO 20022 準拠の XML 形式を採用しており、請求書番号・支払通知番号・明細情報などの商取引データを構造化して送受信できます。" },
      { question: "ZEDI の XML スキーマ（XSD）はどこで入手できますか。", answer: "全国銀行協会の ZEDI 関連資料ページおよび全銀EDIシステム技術仕様書に、ISO 20022 ベースのメッセージ定義が公開されています。pain.001（振込指図）や camt.054（入出金明細）などのスキーマを参照してください。" },
      { question: "DOM と StAX のどちらで ZEDI 電文を処理すべきですか。", answer: "電文の生成や要素の自在な操作が必要なら DOM、大量電文の順次パースや省メモリ処理が求められるバッチなら StAX が適しています。生成は DOM、パースは StAX という使い分けも実務では一般的です。" },
    ],
    codeTitle: "ZEDI XML 電文の生成とパース（DOM API）",
    codeSample: `import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

/**
 * ZEDI（全銀EDIシステム）XML 電文の生成・パース。
 * ISO 20022 の pain.001（顧客振込指図）メッセージ構造に基づき、
 * 振込付帯情報（RmtInf）の読み書きを行う。
 *
 * DOM API を使用する理由:
 * - 要素の追加・属性設定が直感的で、電文の組み立てに適している
 * - 名前空間付き要素の生成が createElementNS() で簡潔に書ける
 * - 1電文ずつの処理であればメモリ消費も問題にならない
 */
public class ZenginEdiSample {

    // ISO 20022 pain.001 の名前空間 URI
    // ZEDI 技術仕様書で定められた名前空間を正確に使用すること
    private static final String ZEDI_NS =
        "urn:iso:std:iso:20022:tech:xsd:pain.001.001.03";

    /**
     * パース結果を保持する record。
     * 不変オブジェクトとして振込付帯情報を安全に受け渡せる。
     */
    record ZediRemittanceInfo(
        String invoiceNumber,    // 請求書番号（RfrdDocInf/Nb に対応）
        long amount,             // 振込金額（InstdAmt のテキスト値）
        String currency,         // 通貨コード（InstdAmt の Ccy 属性）
        String payeeName,        // 受取人名（Cdtr/Nm に対応）
        String additionalInfo    // 追加付帯情報（AddtlRmtInf に対応）
    ) {}

    /**
     * ZEDI XML 電文を DOM API で生成する。
     *
     * ISO 20022 の構造:
     * Document
     *   └ CstmrCdtTrfInitn（顧客振込指図）
     *       ├ GrpHdr（グループヘッダー: メッセージID等）
     *       └ PmtInf（支払情報）
     *           ├ Dbtr（支払人情報）
     *           └ CdtTrfTxInf（個別振込取引）
     *               ├ Amt/InstdAmt（振込金額 + 通貨コード）
     *               ├ Cdtr（受取人情報）
     *               └ RmtInf/Strd（構造化付帯情報）
     *                   ├ RfrdDocInf/Nb（請求書番号）
     *                   └ AddtlRmtInf（追加付帯情報）
     */
    public static String buildZediMessage(
            String invoiceNumber,
            long paymentAmount,
            String payerName,
            String payeeName,
            String paymentNoticeId) throws Exception {

        // DOM ファクトリの設定
        // setNamespaceAware(true) は ZEDI XML の生成・パースで必須
        var factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        var doc = factory.newDocumentBuilder().newDocument();

        // ルート要素: Document（ISO 20022 メッセージのエンベロープ）
        // createElementNS で名前空間付き要素を作成する
        var root = doc.createElementNS(ZEDI_NS, "Document");
        doc.appendChild(root);

        // CstmrCdtTrfInitn: Customer Credit Transfer Initiation
        // 顧客からの振込指図メッセージ全体を包含する要素
        var initiation = doc.createElementNS(ZEDI_NS, "CstmrCdtTrfInitn");
        root.appendChild(initiation);

        // GrpHdr: Group Header — 電文の識別情報
        var grpHdr = doc.createElementNS(ZEDI_NS, "GrpHdr");
        initiation.appendChild(grpHdr);
        // MsgId: メッセージを一意に識別するID
        // 実務ではシステム固有の採番ルールに従う
        appendTextElement(doc, grpHdr, "MsgId",
            "MSG-" + System.currentTimeMillis());

        // PmtInf: Payment Information — 支払情報のブロック
        var pmtInf = doc.createElementNS(ZEDI_NS, "PmtInf");
        initiation.appendChild(pmtInf);

        // Dbtr: Debtor（支払人）
        var dbtr = doc.createElementNS(ZEDI_NS, "Dbtr");
        pmtInf.appendChild(dbtr);
        // Nm: 支払人の名称
        appendTextElement(doc, dbtr, "Nm", payerName);

        // CdtTrfTxInf: Credit Transfer Transaction Information
        // 個別の振込取引に対応する要素（1電文に複数可）
        var txInf = doc.createElementNS(ZEDI_NS, "CdtTrfTxInf");
        pmtInf.appendChild(txInf);

        // Amt: Amount ブロック
        var amt = doc.createElementNS(ZEDI_NS, "Amt");
        txInf.appendChild(amt);
        // InstdAmt: Instructed Amount（指定金額）
        // Ccy 属性で通貨コードを指定する（日本円 = JPY）
        var instdAmt = doc.createElementNS(ZEDI_NS, "InstdAmt");
        instdAmt.setAttribute("Ccy", "JPY");
        instdAmt.setTextContent(String.valueOf(paymentAmount));
        amt.appendChild(instdAmt);

        // Cdtr: Creditor（受取人）
        var cdtr = doc.createElementNS(ZEDI_NS, "Cdtr");
        txInf.appendChild(cdtr);
        appendTextElement(doc, cdtr, "Nm", payeeName);

        // RmtInf: Remittance Information — 付帯情報
        // ZEDI の核心部分。請求書番号や支払通知番号をここに格納する
        var rmtInf = doc.createElementNS(ZEDI_NS, "RmtInf");
        txInf.appendChild(rmtInf);

        // Strd: Structured — 構造化された付帯情報
        var strd = doc.createElementNS(ZEDI_NS, "Strd");
        rmtInf.appendChild(strd);

        // RfrdDocInf: Referred Document Information — 参照ドキュメント
        // 請求書番号などの文書識別情報を格納する
        var rfrdDocInf = doc.createElementNS(ZEDI_NS, "RfrdDocInf");
        strd.appendChild(rfrdDocInf);
        // Nb: Number — 請求書番号
        appendTextElement(doc, rfrdDocInf, "Nb", invoiceNumber);

        // AddtlRmtInf: Additional Remittance Information
        // 支払通知番号など、構造化しきれない追加情報を格納する
        appendTextElement(doc, strd, "AddtlRmtInf",
            "PaymentNotice:" + paymentNoticeId);

        // XML 文字列への変換
        // Transformer で DOM ツリーを文字列にシリアライズする
        var transformer = TransformerFactory.newInstance().newTransformer();
        // インデント付き出力（デバッグ・ログ用途で可読性を確保）
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        // エンコーディングを UTF-8 に明示（ZEDI の標準エンコーディング）
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

        var writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        return writer.toString();
    }

    /**
     * 名前空間付きのテキスト要素を生成し、親要素に追加するヘルパー。
     * ZEDI 電文では全要素が同一名前空間に属するため、
     * createElementNS を共通化して記述量を減らす。
     */
    private static void appendTextElement(
            Document doc, Element parent, String localName, String text) {
        var elem = doc.createElementNS(ZEDI_NS, localName);
        elem.setTextContent(text);
        parent.appendChild(elem);
    }

    /**
     * ZEDI XML 電文をパースし、付帯情報を record のリストとして返す。
     *
     * パースでも DOM を使用する。1電文ずつの処理であればメモリ消費は問題にならず、
     * getElementsByTagNameNS() で名前空間付き要素を直接取得できるため実装が簡潔。
     * 大量電文の一括処理には StAX（XMLStreamReader）への切り替えを検討すること。
     */
    public static List<ZediRemittanceInfo> parseZediMessage(String xml)
            throws Exception {

        var factory = DocumentBuilderFactory.newInstance();
        // 名前空間対応を有効化（ZEDI では必須）
        factory.setNamespaceAware(true);
        // XXE 対策: 外部 DTD の読み込みを禁止
        factory.setFeature(
            "http://apache.org/xml/features/disallow-doctype-decl", true);
        // XXE 対策: 外部エンティティ参照を無効化
        factory.setFeature(
            "http://xml.org/sax/features/external-general-entities", false);

        var doc = factory.newDocumentBuilder()
                .parse(new InputSource(new StringReader(xml)));
        doc.getDocumentElement().normalize();

        var results = new ArrayList<ZediRemittanceInfo>();

        // CdtTrfTxInf（個別振込取引）を名前空間付きで全件取得
        var txNodes = doc.getElementsByTagNameNS(ZEDI_NS, "CdtTrfTxInf");

        for (int i = 0; i < txNodes.getLength(); i++) {
            var txElem = (Element) txNodes.item(i);

            // 振込金額: InstdAmt 要素のテキストと Ccy 属性
            var amountText = getTextNS(txElem, "InstdAmt");
            var currency = getAttributeNS(txElem, "InstdAmt", "Ccy");

            // 受取人名: Cdtr/Nm（ネストした要素の取得）
            var payeeName = getNestedTextNS(txElem, "Cdtr", "Nm");

            // 請求書番号: RfrdDocInf/Nb
            var invoiceNumber = getTextNS(txElem, "Nb");

            // 追加付帯情報: AddtlRmtInf
            var additionalInfo = getTextNS(txElem, "AddtlRmtInf");

            // record に格納して返す
            results.add(new ZediRemittanceInfo(
                invoiceNumber,
                amountText.isEmpty() ? 0L : Long.parseLong(amountText),
                currency,
                payeeName,
                additionalInfo
            ));
        }
        return results;
    }

    /** 名前空間付き要素のテキストを取得する（見つからなければ空文字） */
    private static String getTextNS(Element parent, String localName) {
        var nodes = parent.getElementsByTagNameNS(ZEDI_NS, localName);
        return nodes.getLength() > 0
            ? nodes.item(0).getTextContent() : "";
    }

    /** 名前空間付き要素の属性値を取得する */
    private static String getAttributeNS(
            Element parent, String localName, String attrName) {
        var nodes = parent.getElementsByTagNameNS(ZEDI_NS, localName);
        return nodes.getLength() > 0
            ? ((Element) nodes.item(0)).getAttribute(attrName) : "";
    }

    /** ネストされた名前空間付き要素のテキストを取得する */
    private static String getNestedTextNS(
            Element parent, String outerName, String innerName) {
        var outerNodes = parent.getElementsByTagNameNS(ZEDI_NS, outerName);
        if (outerNodes.getLength() > 0) {
            var outerElem = (Element) outerNodes.item(0);
            var innerNodes =
                outerElem.getElementsByTagNameNS(ZEDI_NS, innerName);
            return innerNodes.getLength() > 0
                ? innerNodes.item(0).getTextContent() : "";
        }
        return "";
    }

    public static void main(String[] args) throws Exception {
        // ZEDI 電文を生成する
        var xml = buildZediMessage(
            "INV-2025-001234",      // 請求書番号
            1500000L,               // 支払金額（150万円）
            "株式会社サンプル商事",    // 支払人名
            "株式会社テスト工業",      // 受取人名
            "PN-2025-00567"         // 支払通知番号
        );
        System.out.println("=== 生成した ZEDI XML 電文 ===");
        System.out.println(xml);

        // 生成した XML をパースして付帯情報を取り出す
        var remittanceList = parseZediMessage(xml);
        System.out.println("=== パース結果 ===");
        for (var info : remittanceList) {
            System.out.println("請求書番号: " + info.invoiceNumber());
            System.out.println("支払金額: " + info.amount() + " "
                + info.currency());
            System.out.println("受取人: " + info.payeeName());
            System.out.println("追加情報: " + info.additionalInfo());
        }
    }
}`,
  },
{
    slug: "zengin-charset",
    title: "Java で全銀フォーマットの文字セットをバリデーション・変換する方法",
    categorySlug: "fileio",
    summary: "全銀フォーマットで許容される JIS X 0201 文字セットの判定、全角→半角カナ変換、禁則文字検出を Pure Java で実装する。",
    version: "Java 17",
    tags: ["全銀", "文字セット", "JIS X 0201", "半角カナ", "バリデーション", "文字変換", "振込", "金融システム"],
    apiNames: ["String", "StringBuilder", "Map.ofEntries", "Map.entry", "Map.copyOf", "Character"],
    description: "全銀フォーマットの文字セット（JIS X 0201 片仮名・半角英数字・記号）のバリデーションと全角→半角カナ変換を Java 標準 API だけで実装する方法を Java 8/17/21 対応で解説する。",
    lead: "銀行間の振込データを扱う全銀フォーマットでは、使用できる文字が JIS X 0201 片仮名用図形文字集合に基づく厳格な範囲に制限されています。許容されるのは半角カナ（ｱ-ﾝ、濁点ﾞ、半濁点ﾟ）、半角英大文字（A-Z）、半角数字（0-9）、および一部の半角記号（スペース、括弧、ハイフン、ピリオド、スラッシュなど）のみです。この制限を満たさない文字を含む振込データを送信すると、銀行システムが受け付けずに振込が失敗します。実務では、画面入力やCSV取込で全角カナや全角英数字が混入するケースが日常的に発生するため、全角→半角の変換処理と禁則文字の検出を事前に行う必要があります。全銀フォーマットの許容文字判定、全角カナから半角カナへの変換テーブル（濁音・半濁音の2文字分解を含む）、禁則文字の検出とレポートを Pure Java で実装した。全国銀行協会の仕様書に基づく文字セット定義と、Shift_JIS（JIS X 0208）との対応関係も整理している。",
    useCases: [
      "振込依頼人名（カナ）のバリデーション: 画面入力された全角カナを半角カナに変換し、全銀許容文字のみで構成されているか検証する",
      "受取人名の全角→半角変換: 取引先マスタに登録された全角カタカナの受取人名を、全銀フォーマット送信用の半角カナに一括変換する",
      "総合振込ファイル生成時の文字チェック: CSV や DB から取得した振込データに禁則文字（漢字・ひらがな・英小文字など）が含まれていないかを送信前に検出し、エラー行を一覧で返す",
      "給与振込の依頼人名・受取人名の正規化: 給与システムから出力されたデータの全角スペースや全角記号を半角に統一し、全銀フォーマットに準拠させる",
      "口座振替データの事前検証: 収納企業から受け取った口座振替依頼データに対し、フォーマット送信前に文字セットの整合性チェックを行う",
    ],
    cautions: [
      "濁音・半濁音の分解に注意: 全角の「ガ」は半角では「ｶﾞ」（清音＋濁点）の2文字になる。変換後の文字列長が変わるため、固定長フィールドへの格納時にバイト数を再計算すること。",
      "長音記号（ー）の変換: 全角長音「ー」(U+30FC) は半角長音「ｰ」(U+FF70) に変換する。ハイフン「-」(U+002D) や全角ダッシュ「\u2014」(U+2014) とは別の文字なので混同しないこと。",
      "スペースの全角・半角: 全角スペース（U+3000）は半角スペース（U+0020）に変換する必要がある。変換漏れがあると全銀システムで文字化けやリジェクトの原因になる。",
      "英小文字は全銀フォーマットで不可: 半角英字は大文字（A-Z）のみ許容される。入力値に小文字が含まれる場合は toUpperCase() で変換するか、エラーとして返すかを業務要件に応じて決める。",
      "Shift_JIS と JIS X 0201 の関係: Shift_JIS の半角カナ領域（0xA1-0xDF）は JIS X 0201 の片仮名集合に対応するが、Java の内部エンコーディングは UTF-16 であるため、Unicode のコードポイント（0xFF65-0xFF9F）で判定する。Shift_JIS のバイト値と直接比較しないこと。",
    ],
    relatedArticleSlugs: ["zengin-format", "zengin-edi-zedi", "fixed-length-records"],
    versionCoverage: {
      java8: "HashMap + static イニシャライザで変換テーブルを構築する。拡張 for ループで1文字ずつ処理し、String.format でエラー情報を整形する。Map は Collections.unmodifiableMap で保護する。",
      java17: "Map.ofEntries() でイミュータブルな変換テーブルを宣言的に構築できる。var による型推論で記述量が減り、record で Violation 情報を保持できる。formatted() メソッドで文字列整形も簡潔になる。",
      java21: "sealed interface + record で文字分類（HalfKana / HalfAlnum / HalfSymbol / Forbidden）を型安全に定義し、switch パターンマッチングで分岐を網羅的に記述できる。Forbidden に理由文字列を持たせることで、禁則文字の種別に応じたエラーメッセージを型レベルで保証する。",
      java8Code: `// Java 8: HashMap + static ブロックで変換テーブルを構築
private static final Map<Character, String> TABLE;
static {
    TABLE = new HashMap<Character, String>();
    TABLE.put('ア', "ｱ");
    TABLE.put('ガ', "ｶﾞ");  // 濁音は清音+濁点の2文字
    TABLE.put('パ', "ﾊﾟ");  // 半濁音は清音+半濁点の2文字
    // ... 以下同様
}
// 1文字ずつ拡張 for ループで変換
for (int i = 0; i < input.length(); i++) {
    char c = input.charAt(i);
    String mapped = TABLE.get(c);
    result.append(mapped != null ? mapped : c);
}`,
      java17Code: `// Java 17: Map.ofEntries() でイミュータブルに宣言
private static final Map<Character, String> TABLE = Map.ofEntries(
    Map.entry('ア', "ｱ"),
    Map.entry('ガ', "ｶﾞ"),  // 濁音は清音+濁点の2文字
    Map.entry('パ', "ﾊﾟ"),  // 半濁音は清音+半濁点の2文字
    // ... 以下同様
);
// record で禁則文字情報を保持
record Violation(int position, char character, String codePoint) {}
// var + formatted() で簡潔に
var msg = "位置 %d: '%c' (U+%04X)".formatted(pos, c, (int) c);`,
      java21Code: `// Java 21: sealed interface で文字分類を型安全に定義
sealed interface CharClass permits HalfKana, HalfAlnum, HalfSymbol, Forbidden {
    record HalfKana(char value) implements CharClass {}
    record Forbidden(char value, String reason) implements CharClass {}
}
// switch パターンマッチングで分類ごとに処理
switch (classify(c)) {
    case CharClass.HalfKana _   -> { /* 許容 */ }
    case CharClass.HalfAlnum _  -> { /* 許容 */ }
    case CharClass.HalfSymbol _ -> { /* 許容 */ }
    case CharClass.Forbidden f  -> violations.add(f);
}`,
    },
    libraryComparison: [
      {
        name: "Pure Java（Map ベースの変換テーブル）",
        whenToUse: "全銀フォーマットの文字セット判定と全角→半角カナ変換のみが必要な場合。変換対象が JIS X 0201 の片仮名・英数字・記号に限定されるため、外部ライブラリなしで完結する。",
        tradeoff: "変換テーブルを自前で定義・保守する必要がある。全銀仕様の許容文字が約70種類と限定的なため、テーブルの規模は小さく保守負荷は低い。Unicode 正規化（NFC/NFD）には対応しないため、合成文字が入力される環境では事前に正規化を行う必要がある。",
      },
      {
        name: "ICU4J（com.ibm.icu.text.Transliterator）",
        whenToUse: "全角・半角変換だけでなく、ひらがな→カタカナ変換、ラテン文字→カタカナ変換など、多言語間のトランスリテレーションが必要な場合。",
        tradeoff: "ICU4J は約14MB の依存を追加する。Transliterator の「Fullwidth-Halfwidth」ルールで全角→半角変換は一行で書けるが、全銀フォーマット固有の許容文字判定は結局自前で実装する必要がある。全角→半角変換だけが目的なら過剰な依存になる。",
      },
      {
        name: "Apache Commons Lang（StringUtils / CharUtils）",
        whenToUse: "文字列操作ユーティリティを既にプロジェクトで利用しており、半角・全角判定の補助として使いたい場合。",
        tradeoff: "Commons Lang には全角→半角カナ変換の機能はない。isAscii() や isNumeric() で基本的な文字種判定は可能だが、半角カナ（JIS X 0201）の判定は含まれないため、全銀バリデーションの核心部分は自前実装が必要。依存を追加する意味が薄い。",
      },
    ],
    faq: [
      {
        question: "全角カタカナの「ヴ」（U+30F4）は全銀フォーマットで使えますか？",
        answer: "全銀フォーマットの標準仕様では「ヴ」は許容文字に含まれていません。銀行によっては「ｳﾞ」（ウ＋濁点）への変換を許容するケースもありますが、仕様書を確認したうえで「ｳﾞ」に変換するか、エラーとして返すかを判断してください。",
      },
      {
        question: "半角カナのバイト数は Shift_JIS と UTF-8 で異なりますか？",
        answer: "Shift_JIS では半角カナは1バイト（0xA1-0xDF）ですが、UTF-8 では3バイト（0xEFBDA5-0xEFBE9F）になります。全銀フォーマットの固定長フィールドは通常 Shift_JIS 前提のバイト数で定義されるため、UTF-8 で処理する場合はバイト数計算に注意が必要です。",
      },
      {
        question: "全銀フォーマットの文字セットと JIS X 0201 の半角カナ集合は完全に一致しますか？",
        answer: "ほぼ一致しますが、全銀フォーマットでは一部の制御文字や JIS X 0201 のラテン文字集合のうち英小文字が除外されます。また、銀行ごとに微妙な差異がある場合があるため、実装時は利用する銀行の仕様書で許容文字を最終確認してください。",
      },
    ],
    codeTitle: "ZenginCharsetValidator.java",
    codeSample: `import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 全銀フォーマット文字セットのバリデーションと全角→半角カナ変換。
 * JIS X 0201 片仮名用図形文字集合に基づく許容文字の判定、
 * 全角カナ→半角カナの変換（濁音・半濁音の2文字分解を含む）、
 * 禁則文字の検出とレポートを Pure Java で実装する。
 */
public class ZenginCharsetValidator {

    // ========================================
    // 全角カナ → 半角カナ変換テーブル
    // ========================================

    /**
     * 全角カナ → 半角カナの変換マップ。
     * Map.ofEntries() でイミュータブルに宣言する（Java 9+）。
     * 濁音は「清音 + 濁点(ﾞ)」、半濁音は「清音 + 半濁点(ﾟ)」の2文字に分解する。
     * これは全銀フォーマットが JIS X 0201 の1バイト文字で濁音を表現するための仕様。
     */
    private static final Map<Character, String> KANA_TABLE = Map.ofEntries(
        // --- 清音: 全角1文字 → 半角1文字 ---
        Map.entry('ア', "ｱ"), Map.entry('イ', "ｲ"), Map.entry('ウ', "ｳ"),
        Map.entry('エ', "ｴ"), Map.entry('オ', "ｵ"),
        Map.entry('カ', "ｶ"), Map.entry('キ', "ｷ"), Map.entry('ク', "ｸ"),
        Map.entry('ケ', "ｹ"), Map.entry('コ', "ｺ"),
        Map.entry('サ', "ｻ"), Map.entry('シ', "ｼ"), Map.entry('ス', "ｽ"),
        Map.entry('セ', "ｾ"), Map.entry('ソ', "ｿ"),
        Map.entry('タ', "ﾀ"), Map.entry('チ', "ﾁ"), Map.entry('ツ', "ﾂ"),
        Map.entry('テ', "ﾃ"), Map.entry('ト', "ﾄ"),
        Map.entry('ナ', "ﾅ"), Map.entry('ニ', "ﾆ"), Map.entry('ヌ', "ﾇ"),
        Map.entry('ネ', "ﾈ"), Map.entry('ノ', "ﾉ"),
        Map.entry('ハ', "ﾊ"), Map.entry('ヒ', "ﾋ"), Map.entry('フ', "ﾌ"),
        Map.entry('ヘ', "ﾍ"), Map.entry('ホ', "ﾎ"),
        Map.entry('マ', "ﾏ"), Map.entry('ミ', "ﾐ"), Map.entry('ム', "ﾑ"),
        Map.entry('メ', "ﾒ"), Map.entry('モ', "ﾓ"),
        Map.entry('ヤ', "ﾔ"), Map.entry('ユ', "ﾕ"), Map.entry('ヨ', "ﾖ"),
        Map.entry('ラ', "ﾗ"), Map.entry('リ', "ﾘ"), Map.entry('ル', "ﾙ"),
        Map.entry('レ', "ﾚ"), Map.entry('ロ', "ﾛ"),
        Map.entry('ワ', "ﾜ"), Map.entry('ヲ', "ｦ"), Map.entry('ン', "ﾝ"),
        // --- 濁音: 清音 + 濁点(ﾞ) の2文字に分解 ---
        // 例: ガ → ｶ(U+FF76) + ﾞ(U+FF9E)
        Map.entry('ガ', "ｶﾞ"), Map.entry('ギ', "ｷﾞ"), Map.entry('グ', "ｸﾞ"),
        Map.entry('ゲ', "ｹﾞ"), Map.entry('ゴ', "ｺﾞ"),
        Map.entry('ザ', "ｻﾞ"), Map.entry('ジ', "ｼﾞ"), Map.entry('ズ', "ｽﾞ"),
        Map.entry('ゼ', "ｾﾞ"), Map.entry('ゾ', "ｿﾞ"),
        Map.entry('ダ', "ﾀﾞ"), Map.entry('ヂ', "ﾁﾞ"), Map.entry('ヅ', "ﾂﾞ"),
        Map.entry('デ', "ﾃﾞ"), Map.entry('ド', "ﾄﾞ"),
        Map.entry('バ', "ﾊﾞ"), Map.entry('ビ', "ﾋﾞ"), Map.entry('ブ', "ﾌﾞ"),
        Map.entry('ベ', "ﾍﾞ"), Map.entry('ボ', "ﾎﾞ"),
        // --- 半濁音: 清音 + 半濁点(ﾟ) の2文字に分解 ---
        // 例: パ → ﾊ(U+FF8A) + ﾟ(U+FF9F)
        Map.entry('パ', "ﾊﾟ"), Map.entry('ピ', "ﾋﾟ"), Map.entry('プ', "ﾌﾟ"),
        Map.entry('ペ', "ﾍﾟ"), Map.entry('ポ', "ﾎﾟ"),
        // --- 特殊文字 ---
        Map.entry('ー', "ｰ"),   // 全角長音(U+30FC) → 半角長音(U+FF70)
        Map.entry('・', "･"),    // 全角中点(U+30FB) → 半角中点(U+FF65)
        Map.entry('゛', "ﾞ"),   // 全角濁点(U+309B) → 半角濁点(U+FF9E)
        Map.entry('゜', "ﾟ"),   // 全角半濁点(U+309C) → 半角半濁点(U+FF9F)
        Map.entry('「', "｢"),    // 全角鉤括弧(U+300C) → 半角(U+FF62)
        Map.entry('」', "｣"),    // 全角鉤括弧(U+300D) → 半角(U+FF63)
        // --- 全角記号 → 半角記号 ---
        Map.entry('（', "("), Map.entry('）', ")"),
        Map.entry('－', "-"), Map.entry('．', "."), Map.entry('／', "/"),
        Map.entry('\\u3000', " ") // 全角スペース(U+3000) → 半角スペース(U+0020)
    );

    /**
     * 全角英数字 → 半角英数字の変換マップ。
     * Ａ-Ｚ → A-Z、０-９ → 0-9 のコードポイント差分で変換。
     */
    private static final Map<Character, String> ALNUM_TABLE;
    static {
        var map = new java.util.HashMap<Character, String>();
        // 全角英大文字(U+FF21-U+FF3A) → 半角英大文字(U+0041-U+005A)
        for (char c = '\\uff21'; c <= '\\uff3a'; c++) {
            map.put(c, String.valueOf((char) ('A' + (c - '\\uff21'))));
        }
        // 全角数字(U+FF10-U+FF19) → 半角数字(U+0030-U+0039)
        for (char c = '\\uff10'; c <= '\\uff19'; c++) {
            map.put(c, String.valueOf((char) ('0' + (c - '\\uff10'))));
        }
        ALNUM_TABLE = Map.copyOf(map); // イミュータブルコピーで保護
    }

    // ========================================
    // 全銀許容文字の判定
    // ========================================

    /**
     * 全銀フォーマットで許容される文字かどうかを判定する。
     * JIS X 0201 片仮名用図形文字集合 + 半角英大文字 + 半角数字 + 一部記号が対象。
     *
     * @param c 判定対象の文字
     * @return 全銀フォーマットで許容される場合 true
     */
    public static boolean isZenginAllowed(char c) {
        // 半角数字: 0-9 (U+0030-U+0039)
        if (c >= '0' && c <= '9') return true;
        // 半角英大文字: A-Z (U+0041-U+005A) ※小文字は不可
        if (c >= 'A' && c <= 'Z') return true;
        // 半角スペース (U+0020)
        if (c == ' ') return true;
        // 半角記号: ( ) - . / — 全銀仕様で明示的に許容
        if (c == '(' || c == ')' || c == '-' || c == '.' || c == '/') return true;
        // 半角カナ: ｦ(U+FF66)-ﾝ(U+FF9D)
        if (c >= 0xFF66 && c <= 0xFF9D) return true;
        // 半角濁点(U+FF9E)・半濁点(U+FF9F)
        if (c == 0xFF9E || c == 0xFF9F) return true;
        // 半角長音(U+FF70)
        if (c == 0xFF70) return true;
        // 半角中点(U+FF65) — 全銀仕様で許容される記号
        if (c == 0xFF65) return true;
        // 半角鉤括弧: ｢(U+FF62) ｣(U+FF63)
        if (c == 0xFF62 || c == 0xFF63) return true;
        // 上記以外は禁則文字
        return false;
    }

    // ========================================
    // 全角 → 半角変換
    // ========================================

    /**
     * 全角文字を全銀フォーマット用の半角文字に変換する。
     * - 全角カナ → 半角カナ（濁音・半濁音は2文字に分解）
     * - 全角英数字 → 半角英数字
     * - 全角記号 → 半角記号
     * - 変換テーブルにない文字はそのまま残す（後続のバリデーションで検出）
     *
     * @param input 変換対象の文字列
     * @return 半角に変換された文字列
     */
    public static String convertToHalfWidth(String input) {
        // 濁音分解で文字列が伸びる可能性があるため、余裕を持ったバッファを確保
        var result = new StringBuilder(input.length() * 2);
        for (int i = 0; i < input.length(); i++) {
            var c = input.charAt(i);
            // カナ・記号の変換テーブルを先に検索
            var kanaMapped = KANA_TABLE.get(c);
            if (kanaMapped != null) {
                result.append(kanaMapped);
                continue;
            }
            // 全角英数字の変換テーブルを検索
            var alnumMapped = ALNUM_TABLE.get(c);
            if (alnumMapped != null) {
                result.append(alnumMapped);
                continue;
            }
            // どちらにも該当しない → そのまま残す
            result.append(c);
        }
        return result.toString();
    }

    // ========================================
    // 禁則文字の検出
    // ========================================

    /** 禁則文字の情報を保持する record */
    record Violation(int position, char character) {
        @Override
        public String toString() {
            return "位置 %d: '%c' (U+%04X)".formatted(position, character, (int) character);
        }
    }

    /**
     * 文字列内の全銀禁則文字を検出し、位置と文字の一覧を返す。
     * 振込データの送信前バリデーションに使用する。
     *
     * @param input 検査対象の文字列（半角変換済みを想定）
     * @return 禁則文字の一覧（なければ空リスト）
     */
    public static List<Violation> findForbiddenChars(String input) {
        var violations = new ArrayList<Violation>();
        for (int i = 0; i < input.length(); i++) {
            var c = input.charAt(i);
            if (!isZenginAllowed(c)) {
                violations.add(new Violation(i, c));
            }
        }
        return violations;
    }

    // ========================================
    // メイン: 振込依頼人名のバリデーション例
    // ========================================

    public static void main(String[] args) {
        // --- 1. 全角カナ → 半角カナ変換 ---
        // 画面入力で全角カナが混入するケースを想定
        var depositorName = "カブシキガイシャ\\u3000デブクラフト";  // 全角スペース含む
        System.out.println("=== 全角→半角変換 ===");
        var converted = convertToHalfWidth(depositorName);
        System.out.println("変換前: " + depositorName);
        System.out.println("変換後: " + converted);
        // 出力: ｶﾌﾞｼｷｶﾞｲｼｬ ﾃﾞﾌﾞｸﾗﾌﾄ
        // 注意: 「ガ」→「ｶﾞ」で2文字に展開される

        // --- 2. 禁則文字チェック ---
        // 英小文字や漢字が混入した場合の検出
        System.out.println("\\n=== 禁則文字チェック ===");
        var invalidInput = "abc株式会社ﾃﾞﾌﾞｸﾗﾌﾄ";
        var violations = findForbiddenChars(invalidInput);
        if (violations.isEmpty()) {
            System.out.println("禁則文字なし");
        } else {
            System.out.println("禁則文字が見つかりました:");
            violations.forEach(v -> System.out.println("  " + v));
        }

        // --- 3. 変換＋バリデーションの組み合わせ ---
        // 実務では「まず変換してからバリデーション」の順で処理する
        System.out.println("\\n=== 変換→バリデーションの実務パターン ===");
        var mixedInput = "カブシキガイシャ\\u3000ＡＢＣ商事";
        var halfWidth = convertToHalfWidth(mixedInput);
        System.out.println("変換後: " + halfWidth);
        var afterCheck = findForbiddenChars(halfWidth);
        if (afterCheck.isEmpty()) {
            System.out.println("全銀フォーマット準拠 OK");
        } else {
            // 変換しても残る禁則文字（漢字など変換テーブルにない文字）
            System.out.println("変換後も残る禁則文字:");
            afterCheck.forEach(v -> System.out.println("  " + v));
        }
    }
}`,
  },
]
