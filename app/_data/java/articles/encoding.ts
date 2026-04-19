import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "base64-encoding",
    title: "Java Base64 エンコード・デコードの実装方法と使い分け",
    categorySlug: "encoding",
    summary: "標準 API の Base64 クラスで文字列・バイナリ・URL セーフの3パターンを扱う実装例。",
    version: "Java 17",
    tags: ["Base64", "エンコード", "URLセーフ", "バイナリ変換"],
    apiNames: ["Base64.getEncoder", "Base64.getDecoder", "Base64.getUrlEncoder", "Base64.getUrlDecoder", "StandardCharsets.UTF_8"],
    description: "Java 標準 API の Base64 クラスで文字列・バイナリ・URL セーフエンコードを実装する方法を、外部ライブラリ不要で Java 8/17/21 対応のバージョン差分付きで解説する。",
    lead: "Base64 エンコードは、メール添付・REST API のトークン受け渡し・画像のインライン埋め込みなど、バイナリデータをテキストとして安全にやり取りする場面で頻繁に使われます。Java 8 以降は java.util.Base64 が標準で用意されており、外部ライブラリなしで3種類のエンコード方式（標準・URL セーフ・MIME）を使い分けることができます。文字列の往復変換、URL に含めても壊れない URL セーフ Base64、バイナリデータの変換といった実務で必要になるパターンを整理した。パディングの有無による挙動の違いや、文字コードの指定を忘れたときに起きる問題など、初見で引っかかりやすいポイントも取り上げる。",
    useCases: [
      "REST API の認証ヘッダーにユーザー名とパスワードを Base64 エンコードして Basic 認証トークンを組み立てる",
      "アップロードされた画像ファイルを Base64 文字列に変換し、JSON レスポンスにインラインで埋め込む",
      "URL のクエリパラメータに構造化データを渡すため、JSON 文字列を URL セーフ Base64 でエンコードする",
    ],
    cautions: [
      "getBytes() を文字コード指定なしで呼ぶと OS のデフォルトエンコーディングが使われ、環境によって結果が変わる。必ず StandardCharsets.UTF_8 を指定すること",
      "URL セーフ Base64 の withoutPadding() を使うと末尾の = が省略される。デコード側が標準デコーダーだとパディング不足でエラーになるため、エンコーダーとデコーダーの組み合わせを揃える必要がある",
      "Base64 はエンコーディングであって暗号化ではない。秘密情報を Base64 でエンコードしただけでは保護にならない。機密データには AES 等の暗号化を併用すること",
      "MIME エンコーダーは76文字ごとに改行を挿入する。HTTP ヘッダーや JSON の値に使うと改行が混入して不具合の原因になるため、用途に応じてエンコーダーを選ぶこと",
      "実務では URL セーフ Base64 と標準 Base64 を混在させて「デコードできない」という問題が起きやすい。エンコード側と受信側の仕様を一緒に決め、コードにコメントで使用するバリアントを明記しておくこと。",
    ],
    relatedArticleSlugs: ["password-hashing", "json-parsing"],
    versionCoverage: {
      java8: "java.util.Base64 が追加され、標準・URL セーフ・MIME の3方式が使える。型は明示的に宣言する必要があり、var は使えない。",
      java17: "API 自体は Java 8 と同じだが、var による型推論と record で結果をまとめて返すコードが書ける。テキストブロックとの組み合わせも自然。",
      java21: "API 自体は変わらないが、switch 式 + enum で用途別のエンコーダー選択が簡潔に書ける。Virtual Thread を使えば複数ファイルの並列エンコードも容易になる。",
      java8Code: `// Java 8: 型を明示的に宣言してエンコード
String text = "Hello, Base64!";
byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
String encoded = Base64.getEncoder().encodeToString(bytes);
byte[] decoded = Base64.getDecoder().decode(encoded);
String result = new String(decoded, StandardCharsets.UTF_8);`,
      java17Code: `// Java 17: var + record で結果をまとめる
record EncodingResult(String original, String encoded, String decoded) {}
var bytes = text.getBytes(StandardCharsets.UTF_8);
var encoded = Base64.getEncoder().encodeToString(bytes);
var decoded = new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
var result = new EncodingResult(text, encoded, decoded);`,
      java21Code: `// Java 21: enum + switch 式で用途別エンコーダーを選択
enum Base64Mode { STANDARD, URL_SAFE, MIME }
Base64.Encoder encoder = switch (mode) {
    case STANDARD -> Base64.getEncoder();
    case URL_SAFE -> Base64.getUrlEncoder().withoutPadding();
    case MIME     -> Base64.getMimeEncoder();
};
String encoded = encoder.encodeToString(bytes);
// Virtual Thread で複数ファイルを並列エンコードする場合
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    var futures = filePaths.stream()
        .map(p -> exec.submit(() -> encode(p))).toList();
}`,
    },
    libraryComparison: [
      { name: "標準 API（java.util.Base64）", whenToUse: "文字列・バイナリ・URL セーフの3パターンで十分な場合。依存ゼロで Java 8 以降どの環境でも動く。", tradeoff: "ストリーミングエンコードは wrap メソッドで可能だが、大容量データの分割処理は自前で管理する必要がある。" },
      { name: "Apache Commons Codec（Base64）", whenToUse: "Java 7 以前の環境や、isBase64 のようなバリデーションメソッドが必要なとき。", tradeoff: "Java 8 以降では標準 API で同等の機能が揃うため、新規プロジェクトでは依存追加の理由が薄い。" },
    ],
    faq: [
      { question: "Base64 エンコード後のサイズはどのくらい増えますか。", answer: "元データの約1.33倍になります。3バイトを4文字に変換するため、おおむね33%増加します。MIME エンコーダーは改行文字が追加されるぶん、さらにわずかに大きくなります。" },
      { question: "URL セーフ Base64 と標準 Base64 の違いは何ですか。", answer: "URL セーフ版は + を - に、/ を _ に置き換えます。URL やファイル名に含めても壊れない文字だけで構成されるため、クエリパラメータやパス要素に直接使えます。" },
      { question: "Base64 のデコードで不正な入力を渡すとどうなりますか。", answer: "IllegalArgumentException がスローされます。外部から受け取った文字列をデコードする場合は try-catch で囲み、不正入力時の振る舞いを明示的に定義しておくと安全です。" },
    ],
    codeTitle: "Base64EncodingExample.java",
    codeSample: `import java.util.Base64;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class Base64EncodingExample {

    /** 文字列を Base64 エンコードして返す */
    public static String encode(String text) {
        var bytes = text.getBytes(StandardCharsets.UTF_8);
        return Base64.getEncoder().encodeToString(bytes);
    }

    /** Base64 文字列をデコードして返す */
    public static String decode(String encoded) {
        var bytes = Base64.getDecoder().decode(encoded);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    /** URL セーフ Base64 エンコード（パディングなし） */
    public static String encodeUrlSafe(String text) {
        var bytes = text.getBytes(StandardCharsets.UTF_8);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** URL セーフ Base64 デコード */
    public static String decodeUrlSafe(String encoded) {
        var bytes = Base64.getUrlDecoder().decode(encoded);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    /** バイナリデータの Base64 往復変換 */
    public static boolean verifyBinaryRoundTrip(byte[] data) {
        var encoded = Base64.getEncoder().encodeToString(data);
        var decoded = Base64.getDecoder().decode(encoded);
        return Arrays.equals(data, decoded);
    }

    public static void main(String[] args) {
        // 文字列の往復変換
        var original = "Hello, java-recipes! 日本語テスト";
        var encoded = encode(original);
        var decoded = decode(encoded);
        System.out.println("元の文字列: " + original);
        System.out.println("エンコード: " + encoded);
        System.out.println("デコード:   " + decoded);
        System.out.println("一致:       " + original.equals(decoded));

        // URL セーフ Base64
        var urlSafe = encodeUrlSafe("test/path?key=value&other=123");
        System.out.println("URL セーフ: " + urlSafe);
        System.out.println("デコード:   " + decodeUrlSafe(urlSafe));

        // バイナリデータの往復確認
        var binary = new byte[]{0x00, 0x01, 0x02, (byte) 0xFF, (byte) 0xFE};
        System.out.println("バイナリ往復: " + verifyBinaryRoundTrip(binary));
    }
}`,
  },
{
    slug: "zip-gzip",
    title: "Java で ZIP・GZIP 圧縮と解凍を実装する方法と注意点",
    categorySlug: "encoding",
    summary: "java.util.zip で複数ファイルの ZIP 圧縮・GZIP 単体圧縮を安全に実装するパターン。",
    version: "Java 17",
    tags: ["ZIP", "GZIP", "圧縮", "解凍", "java.util.zip"],
    apiNames: ["ZipOutputStream", "ZipInputStream", "ZipEntry", "GZIPOutputStream", "GZIPInputStream", "ByteArrayOutputStream"],
    description: "Java 標準 API の java.util.zip で ZIP・GZIP の圧縮と解凍を実装する方法を、リソース管理やエラー処理も含めて Java 8/17/21 対応で解説する。",
    lead: "ファイルの圧縮と解凍は、帳票のまとめ送信・ログファイルのアーカイブ・API レスポンスの GZIP 圧縮など、業務システムで日常的に必要になる処理です。Java には java.util.zip パッケージが標準で用意されており、外部ライブラリなしで ZIP と GZIP の両方を扱えます。ただし、ZipEntry の closeEntry 忘れ、ストリームのクローズ順序、文字コード指定の漏れなど、動作はするが不具合の温床になるコードを書きやすい領域でもあります。この記事では、複数ファイルの ZIP 圧縮・展開と GZIP の単一データ圧縮・解凍を、try-with-resources によるリソース管理を含めた安全なパターンで整理します。圧縮率の目安やバッファサイズの選び方など、実運用で気になるポイントも補足します。",
    useCases: [
      "月次バッチで生成した複数の帳票ファイル（PDF・CSV）を1つの ZIP にまとめ、メール添付用に出力する",
      "サーバー間のログ転送で GZIP 圧縮をかけ、転送量を削減する",
      "外部システムから受信した ZIP ファイルを展開し、中のCSVを1件ずつ取り込みバッチ処理する",
    ],
    cautions: [
      "ZipOutputStream で putNextEntry した後、closeEntry を呼ばずに次の putNextEntry を呼ぶと、ZIP ファイルが壊れる可能性がある。エントリごとに必ず closeEntry すること",
      "ZipInputStream で読み込んだ際、entry.getCompressedSize() が -1 を返す場合がある。ストリーム読み込みでは圧縮サイズが事前にわからないケースがあるため、サイズに依存したバッファ確保は避けること",
      "日本語ファイル名を含む ZIP は文字コードの問題が起きやすい。Java 標準の ZipOutputStream は UTF-8 をデフォルトで使うが、Windows のエクスプローラーで文字化けする場合がある",
      "GZIP 圧縮では GZIPOutputStream.close() の前に flush() を呼ばなくても close 内で暗黙に行われるが、try-with-resources を使わない場合は明示的に close しないと圧縮データが不完全になる",
      "巨大ファイルをメモリ上で ByteArrayOutputStream に圧縮すると OutOfMemoryError の原因になる。実運用ではファイルストリームに直接書き出す設計を検討すること",
    ],
    relatedArticleSlugs: ["base64-encoding"],
    versionCoverage: {
      java8: "API は同じだが var が使えず、型を明示的に宣言する必要がある。record も使えないため、エントリ情報は配列やMap で管理する形になる。",
      java17: "var と record を使って ZIP エントリのデータを構造化できる。List.of によるエントリリストの作成も簡潔になる。String.repeat で圧縮テスト用データの生成が楽。",
      java21: "sealed interface と switch パターンマッチングで圧縮フォーマット（ZIP/GZIP）の分岐を型安全に表現できる。圧縮レベルの指定も record フィールドで持たせやすい。",
      java8Code: `// Java 8: 配列で ZIP エントリを管理
String[] names = {"file1.txt", "file2.csv"};
String[] contents = {"内容1", "内容2"};
ByteArrayOutputStream baos = new ByteArrayOutputStream();
try (ZipOutputStream zos = new ZipOutputStream(baos)) {
    for (int i = 0; i < names.length; i++) {
        zos.putNextEntry(new ZipEntry(names[i]));
        zos.write(contents[i].getBytes(StandardCharsets.UTF_8));
        zos.closeEntry();
    }
}`,
      java17Code: `// Java 17: record + List.of でエントリを構造化
record ZipEntryData(String name, String content) {}
var entries = List.of(
    new ZipEntryData("file1.txt", "内容1"),
    new ZipEntryData("file2.csv", "内容2")
);
var baos = new ByteArrayOutputStream();
try (var zos = new ZipOutputStream(baos)) {
    for (var entry : entries) {
        zos.putNextEntry(new ZipEntry(entry.name()));
        zos.write(entry.content().getBytes(StandardCharsets.UTF_8));
        zos.closeEntry();
    }
}`,
      java21Code: `// Java 21: sealed interface で圧縮方式を型安全に分岐
sealed interface CompressionFormat {
    record Zip(int level)  implements CompressionFormat {}
    record Gzip(int level) implements CompressionFormat {}
}
byte[] compressed = switch (format) {
    case CompressionFormat.Zip z  -> compressAsZip(data, z.level());
    case CompressionFormat.Gzip g -> compressAsGzip(data, g.level());
};`,
    },
    libraryComparison: [
      { name: "標準 API（java.util.zip）", whenToUse: "ZIP・GZIP の基本操作で十分な場合。依存ゼロで動き、業務バッチやログ圧縮の大半をカバーできる。", tradeoff: "パスワード付き ZIP や 7z 形式には対応していない。日本語ファイル名の互換性も注意が必要。" },
      { name: "Apache Commons Compress", whenToUse: "tar.gz、7z、bzip2 など多数のアーカイブ形式を統一的に扱いたいとき。", tradeoff: "依存が増え、標準 ZIP/GZIP だけなら過剰。業務要件がシンプルなら標準 API で十分。" },
      { name: "Zip4j", whenToUse: "パスワード付き ZIP の作成・展開が必要なとき。AES 暗号化 ZIP にも対応している。", tradeoff: "パスワード付き ZIP が不要なら導入する理由がない。ライブラリのメンテナンス状況も確認が必要。" },
    ],
    faq: [
      { question: "ZIP と GZIP の使い分けはどうすればよいですか。", answer: "複数ファイルをまとめたい場合は ZIP、単一データの圧縮転送には GZIP が適しています。HTTP レスポンスの圧縮は GZIP が標準的です。" },
      { question: "圧縮レベルを指定するにはどうしますか。", answer: "ZipOutputStream.setLevel() で Deflater.BEST_SPEED（1）から BEST_COMPRESSION（9）まで指定できます。デフォルトは DEFAULT_COMPRESSION（6相当）で、多くの場合これで十分です。" },
      { question: "メモリ上で圧縮するとどの程度のサイズまで安全ですか。", answer: "ヒープサイズに依存しますが、目安として数十MB以下であれば ByteArrayOutputStream で問題になることは少ないです。それ以上の場合はファイルストリームへの直接出力を検討してください。" },
    ],
    codeTitle: "ZipGzipExample.java",
    codeSample: `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.*;

public class ZipGzipExample {

    record ZipEntryData(String name, String content) {}

    /** 複数エントリを1つの ZIP に圧縮 */
    public static byte[] createZip(List<ZipEntryData> entries) throws IOException {
        var baos = new ByteArrayOutputStream();
        try (var zos = new ZipOutputStream(baos)) {
            for (var entry : entries) {
                zos.putNextEntry(new ZipEntry(entry.name()));
                zos.write(entry.content().getBytes(StandardCharsets.UTF_8));
                zos.closeEntry();
            }
        }
        return baos.toByteArray();
    }

    /** ZIP を展開して List<ZipEntryData> として返す */
    public static List<ZipEntryData> readZip(byte[] zipData) throws IOException {
        var result = new ArrayList<ZipEntryData>();
        try (var zis = new ZipInputStream(new ByteArrayInputStream(zipData))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                var content = new ByteArrayOutputStream();
                var buffer = new byte[1024];
                int len;
                while ((len = zis.read(buffer)) != -1) {
                    content.write(buffer, 0, len);
                }
                result.add(new ZipEntryData(entry.getName(),
                        content.toString(StandardCharsets.UTF_8)));
                zis.closeEntry();
            }
        }
        return result;
    }

    /** 文字列を GZIP 圧縮 */
    public static byte[] gzipCompress(String text) throws IOException {
        var baos = new ByteArrayOutputStream();
        try (var gos = new GZIPOutputStream(baos)) {
            gos.write(text.getBytes(StandardCharsets.UTF_8));
        }
        return baos.toByteArray();
    }

    /** GZIP 解凍 */
    public static String gzipDecompress(byte[] compressed) throws IOException {
        var baos = new ByteArrayOutputStream();
        try (var gis = new GZIPInputStream(new ByteArrayInputStream(compressed))) {
            var buffer = new byte[1024];
            int len;
            while ((len = gis.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
        }
        return baos.toString(StandardCharsets.UTF_8);
    }

    public static void main(String[] args) throws Exception {
        // ZIP 圧縮・解凍
        var entries = List.of(
                new ZipEntryData("report.csv", "id,name\\n1,田中\\n2,鈴木"),
                new ZipEntryData("memo.txt", "処理完了")
        );
        var zip = createZip(entries);
        System.out.println("ZIP サイズ: " + zip.length + " bytes");

        var extracted = readZip(zip);
        extracted.forEach(e ->
                System.out.println(e.name() + ": " + e.content()));

        // GZIP 圧縮・解凍
        var text = "GZIP 圧縮テスト".repeat(50);
        var compressed = gzipCompress(text);
        var original = text.getBytes(StandardCharsets.UTF_8).length;
        System.out.printf("GZIP: %d → %d bytes (%.0f%%削減)%n",
                original, compressed.length,
                (1.0 - (double) compressed.length / original) * 100);
        System.out.println("解凍一致: " + text.equals(gzipDecompress(compressed)));
    }
}`,
  },
{
    slug: "mojibake-troubleshooting",
    title: "文字化けの原因切り分けと対処法（Java 標準 API で）",
    categorySlug: "encoding",
    summary: "Shift_JIS・UTF-8 変換で化ける文字の具体例と、DB・ファイル・HTTP の各レイヤーでの原因切り分け手順を整理する。",
    version: "Java 17",
    tags: ["文字化け", "Shift_JIS", "UTF-8", "MS932", "文字コード", "Charset", "エンコーディング"],
    apiNames: ["Charset", "StandardCharsets", "InputStreamReader", "OutputStreamWriter", "String.getBytes", "new String(byte[], Charset)"],
    description: "Java で発生する文字化けの典型パターンと原因切り分け手順を、Charset・InputStreamReader・OutputStreamWriter など標準 API を使った対処法とともに Java 8/17/21 対応で解説する。",
    lead: "「本番環境でだけ文字化けする」「CSV を取り込んだら特定の文字だけ壊れた」――文字化けは Java の業務開発で繰り返し踏まれるトラブルの筆頭です。原因は単純に見えて、実際にはファイル・DB・HTTP レスポンス・JVM 起動オプションと複数のレイヤーが絡み合うため、切り分けに手間取ることが少なくありません。特に Shift_JIS（MS932）と UTF-8 の変換では、波ダッシュ（\u301C）やバックスラッシュ（\u00A5）など「この文字だけ化ける」パターンが存在し、単体テストでは見落としがちです。この記事では、文字化けが起きる仕組みを byte 列レベルで確認し、InputStreamReader / OutputStreamWriter での明示的な Charset 指定、Charset.defaultCharset() に頼ることの危険性、-Dfile.encoding の影響範囲を実務の観点から整理します。",
    useCases: [
      "外部システムから受信した Shift_JIS の CSV ファイルを UTF-8 の DB に取り込む際、特定文字の文字化けを防ぐ",
      "レガシーシステムとの連携で MS932 エンコーディングの固定長ファイルを読み書きする",
      "HTTP レスポンスの Content-Type に charset 指定が漏れている API からのデータ取得で文字化けを回避する",
    ],
    cautions: [
      "Charset.defaultCharset() は JVM の起動オプションや OS の設定に依存する。本番と開発環境で異なる値を返すことがあるため、コード中で直接使わず StandardCharsets.UTF_8 のように明示的に指定すること",
      "Shift_JIS と MS932（Windows-31J）は別物。Shift_JIS では波ダッシュ（\u301C）やローマ数字（\u2160 など）がマッピングされていないが、MS932 では対応している。Windowsで作られたファイルには MS932 を使うのが安全",
      "String.getBytes() を引数なしで呼ぶと defaultCharset が使われる。環境によって結果が変わるため、必ず Charset 引数を渡すこと。レビューで見つけたら即修正すべきポイント",
      "一度壊れたバイト列から元の文字を復元することは基本的にできない。文字化けの「修復」は、壊れ方のパターンから元のエンコーディングを推測して再変換する試行であり、確実ではないことを理解しておくこと",
    ],
    relatedArticleSlugs: ["charset-conversion-pitfalls", "base64-encoding"],
    versionCoverage: {
      java8: "Charset.defaultCharset() が OS ロケールに完全依存する。Windows では MS932、Linux では UTF-8 が返ることが多く、環境差異による文字化けの温床になりやすい。",
      java17: "JEP 400 の準備段階として UTF-8 がデフォルトに近づく。ただし -Dfile.encoding を明示しない場合、まだ OS 依存の挙動が残るため過信は禁物。",
      java21: "JEP 400 により UTF-8 が標準デフォルトとなり、Charset.defaultCharset() は原則 UTF-8 を返す。ただし -Dfile.encoding=COMPAT で旧挙動に戻せるため、既存システムの移行時には確認が必要。",
      java8Code: `// Java 8: Charset を明示的に指定してファイル読み込み
Charset sjis = Charset.forName("MS932");
FileInputStream fis = new FileInputStream("input.csv");
InputStreamReader reader = new InputStreamReader(fis, sjis);
BufferedReader br = new BufferedReader(reader);
String line;
while ((line = br.readLine()) != null) {
    byte[] utf8Bytes = line.getBytes(StandardCharsets.UTF_8);
    System.out.println(new String(utf8Bytes, StandardCharsets.UTF_8));
}
br.close();`,
      java17Code: `// Java 17: var + try-with-resources で簡潔に
var sjis = Charset.forName("MS932");
try (var reader = new BufferedReader(
        new InputStreamReader(new FileInputStream("input.csv"), sjis))) {
    String line;
    while ((line = reader.readLine()) != null) {
        var utf8Bytes = line.getBytes(StandardCharsets.UTF_8);
        System.out.println(new String(utf8Bytes, StandardCharsets.UTF_8));
    }
}`,
      java21Code: `// Java 21: defaultCharset() が UTF-8 前提の環境
// Charset.defaultCharset() は UTF-8 を返すが、
// レガシーファイルには依然として明示指定が必要
var sjis = Charset.forName("MS932");
try (var lines = Files.lines(Path.of("input.csv"), sjis)) {
    lines.map(line -> line.replace("\u301C", "\uFF5E")) // 波ダッシュ正規化
         .forEach(System.out::println);
}
// -Dfile.encoding=COMPAT で旧挙動に戻す場合の確認も忘れずに`,
    },
    libraryComparison: [
      { name: "標準 API（Charset / StandardCharsets）", whenToUse: "エンコーディングが既知で、明示的に Charset を指定して読み書きする場合。依存ゼロで Java 8 以降どの環境でも動く。", tradeoff: "エンコーディングの自動判定機能はない。入力データの文字コードが不明な場合は、別途判定ロジックが必要になる。" },
      { name: "ICU4J（CharsetDetector）", whenToUse: "テキストのエンコーディングが不明で、バイト列から自動判定したいとき。多言語対応の正規化や変換テーブルも充実している。", tradeoff: "JAR サイズが大きく（10MB超）、単純なエンコーディング指定だけなら過剰。判定精度も100%ではなく、短いテキストでは誤判定が起きる。" },
      { name: "juniversalchardet（Mozilla 由来）", whenToUse: "ファイルやストリームの文字コードを自動判定したい場合。ICU4J より軽量で、日本語テキストの判定精度が比較的高い。", tradeoff: "メンテナンス状況にばらつきがあり、フォークが複数存在する。自動判定はあくまで推測であり、業務データでは明示指定のほうが確実。" },
    ],
    faq: [
      { question: "文字化けの典型的なパターンにはどのようなものがありますか。", answer: "UTF-8 のテキストを Shift_JIS として読むと「譁\u30fb蟄怜喧」のような漢字の羅列になります。逆に Shift_JIS を UTF-8 で読むと「�」（U+FFFD）に置換されるか、半端なバイトで例外が発生します。" },
      { question: "MS932 と Shift_JIS の違いは何ですか。", answer: "MS932（Windows-31J）は Microsoft が Shift_JIS を拡張したもので、丸数字（\u2460 等）やローマ数字（\u2160 等）、波ダッシュ（\u301C/\uFF5E）を含みます。Windows 環境で作られたファイルは Shift_JIS ではなく MS932 で読むのが安全です。" },
      { question: "Java の内部文字エンコーディングは何ですか。", answer: "Java は内部的に UTF-16 で文字列を保持しています（Java 9 以降は Compact Strings により Latin-1 も使用）。外部との入出力時に Charset を指定して変換する設計のため、内部表現と外部表現の区別を意識することが重要です。" },
    ],
    codeTitle: "MojibakeTroubleshooting.java",
    codeSample: `import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 文字化けの原因切り分けと対処のためのユーティリティ。
 * バイト列のダンプ、エンコーディング推定、変換を行う。
 */
public class MojibakeTroubleshooting {

    /** よく使うエンコーディングの一覧 */
    private static final Charset[] CANDIDATE_CHARSETS = {
        StandardCharsets.UTF_8,
        Charset.forName("MS932"),
        Charset.forName("EUC-JP"),
        StandardCharsets.ISO_8859_1,
    };

    /**
     * バイト列を16進数でダンプし、各エンコーディングでの解釈結果を表示する。
     * 文字化けの原因を目視で切り分けるときに使う。
     */
    public static Map<String, String> dumpWithCharsets(byte[] data) {
        var result = new LinkedHashMap<String, String>();
        var hex = HexFormat.ofDelimiter(" ").formatHex(data);
        result.put("HEX", hex);
        for (var charset : CANDIDATE_CHARSETS) {
            result.put(charset.name(), new String(data, charset));
        }
        return result;
    }

    /**
     * 文字列を指定エンコーディングのバイト列に変換し、
     * さらに別のエンコーディングで文字列に戻すシミュレーション。
     * 「この組み合わせで化けるか」を確認するのに使う。
     */
    public static String simulateMojibake(String text,
            Charset writeCharset, Charset readCharset) {
        var bytes = text.getBytes(writeCharset);
        return new String(bytes, readCharset);
    }

    /**
     * InputStreamReader / OutputStreamWriter で
     * Charset を明示指定した安全な変換を行う。
     * Shift_JIS（MS932）ファイルを UTF-8 に変換する典型パターン。
     */
    public static byte[] convertEncoding(byte[] sourceData,
            Charset fromCharset, Charset toCharset) throws Exception {
        var output = new ByteArrayOutputStream();
        try (var reader = new BufferedReader(
                new InputStreamReader(
                    new ByteArrayInputStream(sourceData), fromCharset));
             var writer = new PrintWriter(
                new OutputStreamWriter(output, toCharset))) {
            String line;
            while ((line = reader.readLine()) != null) {
                writer.println(line);
            }
        }
        return output.toByteArray();
    }

    /**
     * 波ダッシュ問題のチェック。
     * Shift_JIS と MS932 でマッピングが異なる代表的な文字を検証する。
     */
    public static void checkWaveDash() {
        var waveDash = "\u301C";       // WAVE DASH（Unicode 標準）
        var fullwidthTilde = "\uFF5E"; // FULLWIDTH TILDE（Windows 系）

        System.out.println("=== 波ダッシュ問題の検証 ===");
        System.out.println("WAVE DASH (U+301C): " + waveDash);
        System.out.println("FULLWIDTH TILDE (U+FF5E): " + fullwidthTilde);

        var ms932 = Charset.forName("MS932");

        // MS932 でのバイト表現を比較
        var waveDashBytes = waveDash.getBytes(ms932);
        var tildaBytes = fullwidthTilde.getBytes(ms932);
        var hex = HexFormat.ofDelimiter(" ");
        System.out.println("WAVE DASH → MS932: " + hex.formatHex(waveDashBytes));
        System.out.println("FULLWIDTH TILDE → MS932: " + hex.formatHex(tildaBytes));
    }

    /**
     * defaultCharset() の確認。
     * 環境依存の挙動を把握するためのチェック用。
     */
    public static void showEnvironmentInfo() {
        System.out.println("=== 環境のエンコーディング情報 ===");
        System.out.println("Charset.defaultCharset(): "
            + Charset.defaultCharset());
        System.out.println("file.encoding: "
            + System.getProperty("file.encoding"));
        System.out.println("stdout.encoding: "
            + System.getProperty("stdout.encoding", "(未設定)"));
    }

    public static void main(String[] args) throws Exception {
        showEnvironmentInfo();
        System.out.println();

        // 文字化けシミュレーション
        var testText = "請求書　金額：￥1,000（税込）〜";
        System.out.println("=== 文字化けシミュレーション ===");
        System.out.println("元の文字列: " + testText);
        System.out.println("UTF-8→MS932で読む: "
            + simulateMojibake(testText,
                StandardCharsets.UTF_8, Charset.forName("MS932")));
        System.out.println("MS932→UTF-8で読む: "
            + simulateMojibake(testText,
                Charset.forName("MS932"), StandardCharsets.UTF_8));
        System.out.println();

        // バイト列ダンプ
        var sampleBytes = testText.getBytes(StandardCharsets.UTF_8);
        System.out.println("=== バイト列ダンプ（UTF-8 で書き込み） ===");
        var dump = dumpWithCharsets(sampleBytes);
        dump.forEach((charset, text) ->
            System.out.printf("  %-12s: %s%n", charset, text));
        System.out.println();

        // エンコーディング変換
        var ms932Data = testText.getBytes(Charset.forName("MS932"));
        var utf8Data = convertEncoding(ms932Data,
            Charset.forName("MS932"), StandardCharsets.UTF_8);
        System.out.println("=== MS932 → UTF-8 変換 ===");
        System.out.println("変換結果: "
            + new String(utf8Data, StandardCharsets.UTF_8));
        System.out.println();

        // 波ダッシュ問題
        checkWaveDash();
    }
}`,
  },
{
    slug: "charset-conversion-pitfalls",
    title: "Java 文字コード変換の落とし穴 — Shift_JIS・MS932・UTF-8 の違いと安全な変換",
    categorySlug: "encoding",
    summary: "Shift_JIS と MS932 のマッピング差異を整理し、CharsetEncoder/Decoder で変換不能文字を安全に検出・制御する実装パターン。",
    version: "Java 17",
    tags: ["文字コード", "Shift_JIS", "MS932", "UTF-8", "Charset", "変換", "マッピング"],
    apiNames: ["Charset", "CharsetEncoder", "CharsetDecoder", "CodingErrorAction", "StandardCharsets", "String.getBytes"],
    description: "Java で Shift_JIS・MS932・UTF-8 間の文字コード変換を安全に行う方法を、波ダッシュ問題や変換不能文字の検出、CodingErrorAction の使い分けとともに Java 8/17/21 対応で解説する。",
    lead: "業務システムでは、外部システムとのファイル連携やレガシーデータベースの読み書きで、Shift_JIS や MS932 と UTF-8 の間で文字コード変換が必要になる場面が少なくありません。Java の Charset.forName(\"Shift_JIS\") と Charset.forName(\"MS932\") は名前が似ていますが、マッピングに微妙な違いがあり、波ダッシュ（\u301C）や丸数字（\u2460\u2461\u2462）、ローマ数字（\u2160\u2161\u2162）といった文字で変換結果が食い違う原因になります。この記事では、Shift_JIS と MS932 の違いを具体的なコードポイントレベルで整理し、CharsetEncoder と CharsetDecoder を使って変換不能文字を検出・制御する安全な実装パターンを解説します。CodingErrorAction の REPLACE・IGNORE・REPORT の使い分けや、変換できなかった文字をログに残す方法など、本番運用で必要になる実践的なポイントを取り上げます。",
    useCases: [
      "取引先から受信した Shift_JIS の CSV ファイルを UTF-8 に変換して取り込む際に、変換不能文字を検出してエラー行を報告する",
      "外部システムが MS932 で送信してくる固定長電文を読み込み、社内の UTF-8 データベースに格納する際にマッピング差異を吸収する",
      "レガシーな Oracle データベース（JA16SJISTILDE）から取得した文字列を UTF-8 の Web API レスポンスとして返すとき、波ダッシュが化けないよう変換を制御する",
    ],
    cautions: [
      "Charset.forName(\"Shift_JIS\") は JIS X 0208 準拠のマッピングを使い、U+301C（波ダッシュ）を 0x8160 にマッピングする。一方 MS932 は U+FF5E（全角チルダ）を 0x8160 にマッピングするため、同じバイト列でも decode 結果が異なる",
      "CodingErrorAction.REPLACE をデフォルトで使うと、変換できなかった文字が ? や \\uFFFD に静かに置き換わり、データ欠損に気づけない。本番環境では REPORT で例外を受けてログに記録するか、少なくとも置換が発生した件数を監視すること",
      "String.getBytes(String charsetName) は変換不能文字を黙って ? に置換する。変換エラーを検出したい場合は CharsetEncoder を直接使い、onUnmappableCharacter(REPORT) を設定する必要がある",
      "Java の Shift_JIS は NEC 特殊文字（丸数字 \u2460〜\u2473 など）をマッピングしない。Windows 環境で作成されたファイルにこれらの文字が含まれる場合は MS932（= Windows-31J）を使わないと文字化けする",
    ],
    relatedArticleSlugs: ["mojibake-troubleshooting", "base64-encoding"],
    versionCoverage: {
      java8: "Charset API 自体は Java 1.4 から存在し Java 8 でも同じ。Shift_JIS のマッピングは Sun 独自実装（sun.nio.cs.SJIS）で、波ダッシュ問題は JDK-6378911 に起因する。var は使えない。",
      java17: "API の基本構造は Java 8 と同じだが、Shift_JIS/MS932 のマッピングに互換性を維持したまま内部実装が整理されている。var と record で変換結果の管理が簡潔に書ける。",
      java21: "Charset 周りの API に本質的な変更はないが、MS932 と Shift_JIS のマッピング差は依然として残る。UTF-8 がデフォルト Charset になった（JEP 400、Java 18 以降）ため、Charset 未指定時の挙動が以前と変わる点に注意が必要。",
      java8Code: `// Java 8: 型を明示して CharsetEncoder を構成
CharsetEncoder encoder = Charset.forName("MS932").newEncoder();
encoder.onUnmappableCharacter(CodingErrorAction.REPORT);
try {
    ByteBuffer result = encoder.encode(CharBuffer.wrap(input));
} catch (CharacterCodingException e) {
    System.err.println("変換不能文字を検出: " + e.getMessage());
}`,
      java17Code: `// Java 17: var + メソッドチェーンで簡潔に記述
var encoder = Charset.forName("MS932").newEncoder()
    .onUnmappableCharacter(CodingErrorAction.REPORT);
try {
    var result = encoder.encode(CharBuffer.wrap(input));
} catch (CharacterCodingException e) {
    System.err.println("変換不能文字を検出: " + e.getMessage());
}`,
      java21Code: `// Java 21: UTF-8 がデフォルト Charset（JEP 400）
// Charset.defaultCharset() は必ず UTF-8 を返す
// 従来 OS 依存だった getBytes() の結果が統一される
var defaultCs = Charset.defaultCharset(); // UTF-8 固定
var encoder = Charset.forName("MS932").newEncoder()
    .onUnmappableCharacter(CodingErrorAction.REPORT);
var result = encoder.encode(CharBuffer.wrap(input));
// MS932/Shift_JIS のマッピング差は Java 21 でも残る`,
    },
    libraryComparison: [
      { name: "標準 API（CharsetEncoder / CharsetDecoder）", whenToUse: "変換不能文字の検出と制御を細かく行いたい場合。CodingErrorAction で REPLACE・IGNORE・REPORT を選べ、依存ゼロで動く。", tradeoff: "波ダッシュ問題などマッピング差異の吸収は自前で実装する必要がある。Shift_JIS と MS932 の使い分けをコード側で判断しなければならない。" },
      { name: "ICU4J（CharsetDetector / CharsetICU）", whenToUse: "文字コードの自動判定が必要な場合や、Unicode 正規化（NFC/NFD）を含む高度な変換を行いたいとき。", tradeoff: "JAR サイズが約14MBと大きく、文字コード変換だけのために導入するには重い。自動判定の精度も100%ではないため、過信は禁物。" },
      { name: "Apache Commons Codec（CharEncoding 定数）", whenToUse: "文字コード名の定数定義として使う程度。変換ロジック自体は提供していない。", tradeoff: "Java 7 以降は StandardCharsets で定数が揃うため、文字コード変換の目的では導入する理由がほぼない。" },
    ],
    faq: [
      { question: "波ダッシュ問題とは何ですか。どう対処すればよいですか。", answer: "Unicode の U+301C（波ダッシュ）と U+FF5E（全角チルダ）が、Shift_JIS と MS932 で同じバイト 0x8160 に対応する問題です。Windows 環境のファイルなら MS932 で読み、JIS 準拠のデータなら Shift_JIS で読むのが基本的な対処法です。" },
      { question: "MS932 と Shift_JIS はどちらを使うべきですか。", answer: "Windows で作成されたファイルや、丸数字・ローマ数字を含むデータには MS932 を使います。JIS X 0208 準拠が求められる通信プロトコルや、仕様書に Shift_JIS と明記されている場合はそちらを使います。迷ったら MS932 のほうが文字化けは少なくなります。" },
      { question: "UTF-8 の BOM（Byte Order Mark）は付けるべきですか。", answer: "Java の StandardCharsets.UTF_8 は BOM なしです。Excel で開く CSV には BOM（0xEF 0xBB 0xBF）を先頭に付けると文字化けを防げます。それ以外の用途では BOM を付けないのが一般的です。" },
    ],
    codeTitle: "SafeCharsetConverter.java",
    codeSample: `import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CharsetEncoder;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * CharsetEncoder/Decoder を使った安全な文字コード変換ユーティリティ。
 * 変換不能文字を検出してログに記録する。
 */
public class SafeCharsetConverter {

    record ConversionResult(byte[] data, List<String> warnings) {
        boolean hasWarnings() { return !warnings.isEmpty(); }
    }

    /**
     * 文字列を指定した文字コードのバイト列に変換する。
     * 変換不能文字は ? に置換し、その位置と文字を warnings に記録する。
     */
    public static ConversionResult encode(String input, Charset targetCharset) {
        var warnings = new ArrayList<String>();
        var encoder = targetCharset.newEncoder();

        // REPORT モードの canEncode で変換不能文字を事前検出する
        for (int i = 0; i < input.length(); i++) {
            var ch = input.charAt(i);
            if (!encoder.canEncode(ch)) {
                warnings.add("位置 %d: '%c' (U+%04X) は %s に変換できません"
                        .formatted(i, ch, (int) ch, targetCharset.name()));
            }
        }

        // 実際の変換は REPLACE モードで安全に実行する
        var safeEncoder = targetCharset.newEncoder()
                .onMalformedInput(CodingErrorAction.REPLACE)
                .onUnmappableCharacter(CodingErrorAction.REPLACE);

        try {
            var buffer = safeEncoder.encode(CharBuffer.wrap(input));
            var result = new byte[buffer.remaining()];
            buffer.get(result);
            return new ConversionResult(result, warnings);
        } catch (CharacterCodingException e) {
            // REPLACE モードでは通常発生しないが、念のため
            throw new RuntimeException("文字コード変換に失敗しました", e);
        }
    }

    /**
     * バイト列を指定した文字コードで文字列にデコードする。
     * 不正バイトは REPORT で例外をスローする（厳格モード）。
     */
    public static String decodeStrict(byte[] data, Charset sourceCharset)
            throws CharacterCodingException {
        var decoder = sourceCharset.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT);
        var charBuffer = decoder.decode(ByteBuffer.wrap(data));
        return charBuffer.toString();
    }

    /**
     * Shift_JIS と MS932 で同じバイト列のデコード結果が異なる文字を検出する。
     */
    public static void compareShiftJisAndMs932(byte[] data) {
        var sjis = Charset.forName("Shift_JIS");
        var ms932 = Charset.forName("MS932");

        var sjisDecoder = sjis.newDecoder()
                .onMalformedInput(CodingErrorAction.REPLACE)
                .onUnmappableCharacter(CodingErrorAction.REPLACE);
        var ms932Decoder = ms932.newDecoder()
                .onMalformedInput(CodingErrorAction.REPLACE)
                .onUnmappableCharacter(CodingErrorAction.REPLACE);

        try {
            var sjisText = sjisDecoder.decode(ByteBuffer.wrap(data)).toString();
            var ms932Text = ms932Decoder.decode(ByteBuffer.wrap(data)).toString();

            if (sjisText.equals(ms932Text)) {
                System.out.println("Shift_JIS と MS932 のデコード結果は同一です");
            } else {
                System.out.println("デコード結果に差異があります:");
                for (int i = 0; i < Math.min(sjisText.length(), ms932Text.length()); i++) {
                    if (sjisText.charAt(i) != ms932Text.charAt(i)) {
                        System.out.printf("  位置 %d: Shift_JIS='%c'(U+%04X)  MS932='%c'(U+%04X)%n",
                                i, sjisText.charAt(i), (int) sjisText.charAt(i),
                                ms932Text.charAt(i), (int) ms932Text.charAt(i));
                    }
                }
            }
        } catch (CharacterCodingException e) {
            System.err.println("デコードに失敗しました: " + e.getMessage());
        }
    }

    public static void main(String[] args) throws Exception {
        // 波ダッシュを含む文字列の変換テスト
        var testText = "株式会社\u301Cテスト\u2460\u2461\u2462\u2160\u2161\u2162";
        System.out.println("元の文字列: " + testText);

        // MS932 へのエンコード（丸数字・ローマ数字は変換可能）
        System.out.println("\\n=== MS932 エンコード ===");
        var ms932Result = encode(testText, Charset.forName("MS932"));
        System.out.println("バイト数: " + ms932Result.data().length);
        if (ms932Result.hasWarnings()) {
            ms932Result.warnings().forEach(w -> System.out.println("  警告: " + w));
        } else {
            System.out.println("  変換不能文字なし");
        }

        // Shift_JIS へのエンコード（丸数字・ローマ数字は変換不能）
        System.out.println("\\n=== Shift_JIS エンコード ===");
        var sjisResult = encode(testText, Charset.forName("Shift_JIS"));
        System.out.println("バイト数: " + sjisResult.data().length);
        if (sjisResult.hasWarnings()) {
            sjisResult.warnings().forEach(w -> System.out.println("  警告: " + w));
        } else {
            System.out.println("  変換不能文字なし");
        }

        // 波ダッシュのバイト列比較
        System.out.println("\\n=== 波ダッシュ（0x8160）のデコード比較 ===");
        var waveDashBytes = new byte[]{(byte) 0x81, (byte) 0x60};
        compareShiftJisAndMs932(waveDashBytes);

        // UTF-8 BOM 付き出力の例
        System.out.println("\\n=== UTF-8 BOM 付き CSV 出力例 ===");
        var csvContent = "名前,金額\\n田中,10000\\n鈴木,20000";
        var bom = new byte[]{(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        var csvBytes = csvContent.getBytes(StandardCharsets.UTF_8);
        var withBom = new byte[bom.length + csvBytes.length];
        System.arraycopy(bom, 0, withBom, 0, bom.length);
        System.arraycopy(csvBytes, 0, withBom, bom.length, csvBytes.length);
        System.out.println("BOM なし: " + csvBytes.length + " bytes");
        System.out.println("BOM 付き: " + withBom.length + " bytes");
    }
}`,
  },
]
