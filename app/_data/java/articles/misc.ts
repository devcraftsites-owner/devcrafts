import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "external-process",
  title: "Java から外部コマンドを安全に実行する方法と出力の取得手順",
  categorySlug: "misc",
  summary: "ProcessBuilder で外部プロセスを起動し、出力取得・タイムアウト・エラー処理を整理する。",
  version: "Java 17",
  tags: ["ProcessBuilder", "外部コマンド", "プロセス実行", "タイムアウト"],
  apiNames: ["ProcessBuilder", "Process", "BufferedReader", "InputStreamReader", "TimeUnit"],
  description: "Java の ProcessBuilder を使った外部コマンド実行のパターンと、出力取得・タイムアウト・エラー処理の実装を Java 8/17/21 対応で解説する。",
  lead: "業務システムでは、帳票生成ツールの呼び出し、シェルスクリプト経由のデータ連携、外部コマンドによるファイル変換など、Java から OS のコマンドを実行する場面が少なからず存在します。Runtime.getRuntime() は古くから使われてきましたが、出力の取得やエラーハンドリングに難があり、ProcessBuilder に移行するのが現在の標準です。この記事では、ProcessBuilder の基本的な使い方から、標準出力の取得、標準エラーとのマージ、タイムアウト付き実行、終了コードによる成功・失敗判定までを整理します。Java 17 では record で実行結果を型安全に表現し、Java 21 では sealed interface と switch パターンマッチングで成功・失敗の分岐をさらに明確に書けます。",
  useCases: [
    "帳票 PDF 生成ツール（wkhtmltopdf 等）を Java から呼び出し、生成結果のパスと終了コードを取得する",
    "夜間バッチでシェルスクリプトを起動し、外部システムとのファイル連携処理を行い、終了コードで後続処理を分岐する",
    "開発ツールや CI スクリプトから git コマンドや DB マイグレーションコマンドを実行し、結果をログに出力する",
  ],
  cautions: [
    "Process の標準出力を読まずに waitFor() を呼ぶと、バッファが一杯になってプロセスがハングする。必ず出力を読み取ってから waitFor() を呼ぶこと",
    "redirectErrorStream(true) を使わない場合、標準出力と標準エラーを別スレッドで読む必要がある。片方だけ読むともう片方のバッファ詰まりでデッドロックする",
    "タイムアウトなしの waitFor() は永久に待ち続ける可能性がある。Java 9 以降では waitFor(long, TimeUnit) でタイムアウトを設定し、超過時は destroyForcibly() で強制終了すること",
    "command 配列の先頭にシェル（bash, cmd）を指定しないと、パイプやリダイレクトは使えない。OS 間の移植性にも注意が必要",
    "外部コマンドの引数にユーザー入力を含める場合、コマンドインジェクションのリスクがある。引数は文字列連結ではなく配列で個別に渡すこと",
  ],
  relatedArticleSlugs: [],
  versionCoverage: {
    java8: "ProcessBuilder と BufferedReader の基本パターン。try-with-resources で入力ストリームを閉じる。タイムアウトは Process.waitFor(long, TimeUnit) で Java 9 以降に対応。",
    java17: "record で ProcessResult(exitCode, output) を定義し、実行結果を構造化して返せる。var と try-with-resources で記述量が減る。",
    java21: "sealed interface で Success / Failure を型安全に分岐できる。switch パターンマッチングで結果処理が簡潔になる。",
    java8Code: `// Java 8: ProcessBuilder + while ループで出力を読み取り
ProcessBuilder pb = new ProcessBuilder(command);
pb.redirectErrorStream(true);
Process process = pb.start();
try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(process.getInputStream()))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println("[出力] " + line);
    }
}
int exitCode = process.waitFor();`,
    java17Code: `// Java 17: record で実行結果を構造化
record ProcessResult(int exitCode, String output) {
    boolean isSuccess() { return exitCode == 0; }
}
var pb = new ProcessBuilder(command);
pb.redirectErrorStream(true);
var process = pb.start();
String output;
try (var reader = new BufferedReader(
        new InputStreamReader(process.getInputStream()))) {
    output = reader.lines()
        .collect(Collectors.joining("\\n"));
}
return new ProcessResult(process.waitFor(), output);`,
    java21Code: `// Java 21: sealed interface で成功/失敗を型安全に表現
sealed interface ExecResult permits
    ExecResult.Success, ExecResult.Failure {
  record Success(ProcessResult result)
      implements ExecResult {}
  record Failure(int exitCode, String error)
      implements ExecResult {}
}
switch (result) {
    case ExecResult.Success s ->
        System.out.println("出力: " + s.result().output());
    case ExecResult.Failure f ->
        System.out.println("エラー: " + f.error());
}`,
  },
  libraryComparison: [
    { name: "標準 API（ProcessBuilder）", whenToUse: "外部プロセス実行の標準手段。依存ゼロで、出力取得・エラーマージ・タイムアウトまで対応できる。", tradeoff: "出力の非同期読み取りやパイプ処理は自前で実装する必要がある。複雑なシェル操作には向かない。" },
    { name: "Apache Commons Exec", whenToUse: "非同期実行やウォッチドッグ（タイムアウト監視）を簡潔に書きたいとき。", tradeoff: "依存追加が必要。単純なコマンド実行なら ProcessBuilder で十分なため、過剰になりやすい。" },
    { name: "ProcessHandle（Java 9+）", whenToUse: "起動したプロセスの PID 取得や子プロセスの監視が必要なとき。ProcessBuilder と組み合わせて使う。", tradeoff: "プロセス実行自体は ProcessBuilder が必要。監視・管理の補助 API という位置づけ。" },
  ],
  faq: [
    { question: "Runtime.getRuntime().exec() と ProcessBuilder はどちらを使うべきですか。", answer: "ProcessBuilder を使います。Runtime の exec は内部で ProcessBuilder を呼んでいるだけで、リダイレクトやディレクトリ指定などの柔軟性がありません。" },
    { question: "外部コマンドの出力が文字化けする場合はどうしますか。", answer: "InputStreamReader の第2引数に文字コードを指定します。Windows では Shift_JIS、Linux では UTF-8 が一般的です。Charset.forName で明示すると安全です。" },
    { question: "複数のコマンドをパイプでつなぐにはどうしますか。", answer: "ProcessBuilder 単体ではパイプは使えません。Java 9 以降の ProcessBuilder.startPipeline() を使うか、シェル経由で実行します。" },
  ],
  codeTitle: "ExternalProcessDemo.java",
  codeSample: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

public class ExternalProcessDemo {

    /** プロセスの実行結果を保持する record */
    record ProcessResult(int exitCode, String output) {
        public boolean isSuccess() {
            return exitCode == 0;
        }
    }

    /** 外部コマンドを実行し、結果を ProcessResult で返す */
    public static ProcessResult run(String... command)
            throws IOException, InterruptedException {
        var pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);

        var process = pb.start();
        String output;
        try (var reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            output = reader.lines().collect(Collectors.joining("\\n"));
        }

        int exitCode = process.waitFor();
        return new ProcessResult(exitCode, output);
    }

    public static void main(String[] args) throws Exception {
        // Java バージョン確認
        System.out.println("=== Java バージョン確認 ===");
        var result = run("java", "-version");
        System.out.println("終了コード: " + result.exitCode());
        System.out.println("出力:\\n" + result.output());

        if (result.isSuccess()) {
            System.out.println("コマンド成功");
        } else {
            System.out.println("コマンド失敗");
        }

        // OS に応じた echo コマンド
        System.out.println("\\n=== echo コマンド ===");
        var os = System.getProperty("os.name").toLowerCase();
        ProcessResult echoResult;
        if (os.contains("win")) {
            echoResult = run("cmd", "/c", "echo", "Hello from Java");
        } else {
            echoResult = run("echo", "Hello from Java");
        }
        System.out.println("出力: " + echoResult.output());
    }
}`,
},
]
