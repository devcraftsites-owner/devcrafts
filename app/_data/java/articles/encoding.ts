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
    lead: "Base64 エンコードは、メール添付・REST API のトークン受け渡し・画像のインライン埋め込みなど、バイナリデータをテキストとして安全にやり取りする場面で頻繁に使われます。Java 8 以降は java.util.Base64 が標準で用意されており、外部ライブラリなしで3種類のエンコード方式（標準・URL セーフ・MIME）を使い分けることができます。この記事では、文字列の往復変換、URL に含めても壊れない URL セーフ Base64、バイナリデータの変換といった実務で必要になるパターンを整理します。パディングの有無による挙動の違いや、文字コードの指定を忘れたときに起きる問題など、初見で引っかかりやすいポイントも取り上げます。",
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
    ],
    relatedArticleSlugs: ["zip-gzip", "aes-encryption"],
    versionCoverage: {
      java8: "java.util.Base64 が追加され、標準・URL セーフ・MIME の3方式が使える。型は明示的に宣言する必要があり、var は使えない。",
      java17: "API 自体は Java 8 と同じだが、var による型推論と record で結果をまとめて返すコードが書ける。テキストブロックとの組み合わせも自然。",
      java21: "sealed interface と switch パターンマッチングで、エンコード方式の分岐を型安全に表現できる。API の本質的な変更はない。",
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
      java21Code: `// Java 21: sealed interface + switch でモード分岐
sealed interface Base64Mode {
    record Standard() implements Base64Mode {}
    record UrlSafe()  implements Base64Mode {}
}
String encoded = switch (mode) {
    case Base64Mode.Standard s -> Base64.getEncoder().encodeToString(bytes);
    case Base64Mode.UrlSafe u  -> Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
};`,
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
]
