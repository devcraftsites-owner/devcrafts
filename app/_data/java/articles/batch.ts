import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "batch-framework-design",
  title: "Java バッチ処理の全体設計とインターフェース定義の実装",
  categorySlug: "batch",
  summary: "BatchJob インターフェース、ExitCode、JobContext を定義し、Pure Java でバッチ処理の骨格を設計する。",
  version: "Java 8",
  tags: ["バッチ", "インターフェース", "設計", "ExitCode", "JobContext"],
  apiNames: ["Runnable", "System.exit", "System.currentTimeMillis", "HashMap"],
  description: "Java 標準 API だけでバッチ処理の全体構造を設計する方法を、BatchJob インターフェース・ExitCode・JobContext の定義から Java 8/17/21 対応で解説する。",
  lead: "業務システムのバッチ処理は、夜間の締め処理やデータ移行、日次集計など多くの場面で必要になります。Spring Batch のようなフレームワークを導入すれば一通りの機能は揃いますが、学習コストや設定の複雑さから、小規模なバッチやフレームワーク導入が難しい現場では Pure Java で組み立てる判断も珍しくありません。この記事では、バッチ処理を「前処理・本処理・後処理」の 3 フェーズに分離する BatchJob インターフェースを軸に、終了コードを表す ExitCode、実行時の共有データを運ぶ JobContext、そしてそれらを束ねる SimpleBatchRunner を定義します。フレームワークの内部構造を理解するうえでも、この骨格設計は有用です。",
  useCases: [
    "夜間バッチの共通実行基盤を自前で構築し、ジョブの追加・差し替えを容易にする",
    "既存の手続き型バッチをインターフェースベースにリファクタリングして保守性を高める",
    "Spring Batch を導入する前段階として、バッチの基本構造を社内で共有する",
  ],
  cautions: [
    "ExitCode を System.exit() で返す場合、JVM シャットダウンフックとの順序に注意すること。finally ブロックが実行されない場合がある",
    "JobContext に何でも入れると依存関係が不透明になる。入れるデータの型と用途を決めておくこと",
    "initialize() で例外が出た場合に terminate() を呼ぶかどうか、呼び出し側の責務を明確にしておくこと",
    "バッチの戻り値を int ではなく enum にすることで、未定義コードの混入を防ぐ",
  ],
  relatedArticleSlugs: ["batch-basic-structure", "batch-properties-config"],
  versionCoverage: {
    java8: "インターフェースの default メソッドで空実装を提供できる。enum は Java 5 から使えるため ExitCode の定義に問題はない。",
    java17: "sealed interface で BatchJob の実装クラスを制限できる。switch 式で ExitCode ごとの処理分岐を簡潔に書ける。",
    java21: "switch のパターンマッチングで JobContext 内のオブジェクトを型安全に取り出せる。record でジョブ結果を表現できる。",
    java8Code: `// Java 8: インターフェースと enum で基本構造を定義
public interface BatchJob {
    void initialize(JobContext context) throws Exception;
    ExitCode execute(JobContext context) throws Exception;
    void terminate(JobContext context);
}`,
    java17Code: `// Java 17: sealed interface で実装を制限
public sealed interface BatchJob
        permits CsvImportJob, ReportJob {
    void initialize(JobContext context) throws Exception;
    ExitCode execute(JobContext context) throws Exception;
    void terminate(JobContext context);
}`,
    java21Code: `// Java 21: record でジョブ実行結果を型安全に表現
public record JobResult(ExitCode code, String message) {}
switch (result) {
    case JobResult(ExitCode c, String m) when c == ExitCode.SUCCESS
        -> logger.info("成功: " + m);
    case JobResult r -> logger.severe("失敗: " + r.message());
}`,
  },
  libraryComparison: [
    { name: "Pure Java（自前フレームワーク）", whenToUse: "小規模バッチやフレームワーク導入が制約される現場。ジョブの種類が少ない場合。", tradeoff: "リトライ、スキップ、チャンク分割は自前で実装する必要がある。" },
    { name: "Spring Batch", whenToUse: "チャンクステップ、リトライ、ジョブフロー、実行履歴管理が必要な場合。", tradeoff: "Spring 依存が前提。小規模バッチには過剰なことが多い。" },
    { name: "JSR 352（JBatch）", whenToUse: "Jakarta EE 環境でバッチを標準仕様に沿って実装する場合。", tradeoff: "実装ランタイムに依存する。SE 環境では追加設定が必要。" },
  ],
  faq: [
    { question: "BatchJob のメソッドに戻り値を持たせるべきですか。", answer: "execute() は成否を呼び出し元に伝える必要があるため ExitCode を返す設計が実用的です。initialize() と terminate() はリソースの確保・解放が主目的で結果を返す必然性がないため void で十分です。失敗時は例外を投げて呼び出し元に処理を委ねます。" },
    { question: "JobContext は Map で実装して問題ありませんか。", answer: "小規模なら HashMap で十分です。キー名の定数化と取得時のキャストをラッパーメソッドに集約すると保守しやすくなります。" },
    { question: "前処理と後処理は本当に分ける必要がありますか。", answer: "前処理でファイル確認やDB接続確認をすることで、本処理前にエラーを検知できます。後処理はリソース解放の保証に有用です。" },
  ],
  codeTitle: "BatchJob インターフェースと SimpleBatchRunner",
  codeSample: `import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

enum ExitCode {
    SUCCESS(0), WARNING(1), ERROR(2);
    private final int code;
    ExitCode(int code) { this.code = code; }
    public int getCode() { return code; }
}

class JobContext {
    private final String jobName;
    private final Map<String, Object> attributes = new HashMap<String, Object>();
    private long startTimeMillis;

    public JobContext(String jobName) { this.jobName = jobName; }
    public String getJobName() { return jobName; }
    public void setAttribute(String key, Object value) { attributes.put(key, value); }

    @SuppressWarnings("unchecked")
    public <T> T getAttribute(String key, Class<T> type) {
        Object value = attributes.get(key);
        return (value != null && type.isInstance(value)) ? (T) value : null;
    }
    public long getStartTimeMillis() { return startTimeMillis; }
    public void setStartTimeMillis(long v) { this.startTimeMillis = v; }
}

interface BatchJob {
    void initialize(JobContext context) throws Exception;
    ExitCode execute(JobContext context) throws Exception;
    void terminate(JobContext context);
}

class SimpleBatchRunner {
    private static final Logger LOGGER = Logger.getLogger(SimpleBatchRunner.class.getName());

    public ExitCode run(BatchJob job, JobContext context) {
        ExitCode exitCode = ExitCode.ERROR;
        context.setStartTimeMillis(System.currentTimeMillis());
        LOGGER.info("[" + context.getJobName() + "] ジョブ開始");
        try {
            job.initialize(context);
            exitCode = job.execute(context);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "[" + context.getJobName() + "] エラー", e);
        } finally {
            try { job.terminate(context); } catch (Exception e) {
                LOGGER.log(Level.WARNING, "後処理エラー", e);
            }
            long elapsed = System.currentTimeMillis() - context.getStartTimeMillis();
            LOGGER.info("[" + context.getJobName() + "] 終了 (" + elapsed + "ms) コード: " + exitCode.getCode());
        }
        return exitCode;
    }
}

class SampleJob implements BatchJob {
    @Override public void initialize(JobContext ctx) { ctx.setAttribute("count", Integer.valueOf(0)); }
    @Override public ExitCode execute(JobContext ctx) { ctx.setAttribute("count", Integer.valueOf(42)); return ExitCode.SUCCESS; }
    @Override public void terminate(JobContext ctx) {
        System.out.println("処理件数: " + ctx.getAttribute("count", Integer.class));
    }
}

public class BatchFrameworkDesign {
    public static void main(String[] args) {
        ExitCode result = new SimpleBatchRunner().run(new SampleJob(), new JobContext("SampleJob"));
        System.out.println("終了コード: " + result.getCode());
    }
}`,
},
{
  slug: "batch-basic-structure",
  title: "Java バッチの前処理・本処理・後処理を CsvImportJob で実装する",
  categorySlug: "batch",
  summary: "BatchJob インターフェースを実装し、CSV 取込ジョブで前処理/本処理/後処理の分離パターンを実践する。ジョブマネージャ連携・exit コード・リラン設計・HA クラスタ制御・監視ログも解説。",
  version: "Java 8",
  tags: ["バッチ", "CSV", "前処理", "本処理", "後処理", "バリデーション", "ジョブマネージャ", "exitコード", "リラン", "監視"],
  apiNames: ["BufferedReader", "FileReader", "File", "ArrayList", "String.split", "System.exit"],
  description: "BatchJob インターフェースを CsvImportJob で実装し、前処理・本処理・後処理の3段階構造・ジョブマネージャ連携・exit コード・リラン設計・HA クラスタ制御・監視ログ出力を Java 8/17/21 対応で解説する。",
  lead: "バッチ処理の設計で最も基本的かつ重要なのは、前処理・本処理・後処理の責務を明確に分離することです。前処理で入力ファイルの存在確認や形式チェックを済ませておけば、本処理で初歩的なエラーに悩まされることはありません。後処理で処理件数やエラー件数のサマリを出力すれば、運用担当者が実行結果を即座に判断できます。\n\n近年開発されるシステムでは Spring Batch のようなフレームワークを採用するケースが増えていますが、金融・製造・物流の基幹系や、長年稼働してきたレガシー環境では JP1・Hinemos・TWS などのジョブマネージャによるスケジューリングが前提になっていることが多く、「コマンドラインで起動できる JAR を用意して終了コードで正否を返す」というシンプルな構成が今も広く使われています。この構成では、終了コード・リラン/リカバリ設計・HA クラスタでの二重起動防止・監視システムへのログ連携が、フレームワークが提供してくれない分だけ自前で考慮する必要があります。BatchJob インターフェースを CSV 取込ジョブとして実装し、入力ファイルの存在確認（前処理）、1行ずつの読込とバリデーション（本処理）、処理結果のサマリ出力と System.exit（後処理）を具体的なコードで示した。",
  useCases: [
    "取引先から受領した CSV ファイルを日次バッチで取り込み、バリデーション結果をログに出力する",
    "JP1 や cron に登録したバッチジョブが終了コードで成否を返し、ジョブマネージャのアラート通知と連動させる",
    "HA クラスタ（active-standby 構成）上で実行するバッチが、フェイルオーバー後の二重起動を防ぎつつリランを安全に行う",
  ],
  cautions: [
    "CSV のカラム区切りにカンマを使う場合、値にカンマが含まれるケースを考慮すること",
    "BufferedReader は finally で必ず閉じること。terminate() で閉じる設計にする場合、execute() が例外で中断しても漏れなく解放されることを確認する",
    "バリデーションエラーが大量に出る場合、全行をメモリに溜めるとヒープを圧迫する。エラー上限を設けること",
    "入力ファイルの文字コードが Shift_JIS の場合、InputStreamReader で明示的にエンコーディングを指定する",
    "実務では前処理・本処理・後処理の責務が曖昧なバッチが多く、本処理の冒頭で入力ファイルの存在確認をしていたり、ループ内でサマリ集計していたりする。責務の分離を最初に決めておくだけで保守コストが大きく下がる",
    "ジョブマネージャに登録するバッチは System.exit() で終了コードを明示的に返すこと。正常終了 0、警告（スキップあり）1、異常終了 2 のように体系化しておくと、ジョブネットの後続条件設定が安定する。return で抜けた場合の終了コードは 0 になるため、例外で終了したケースが見逃されやすい",
    "リラン（再実行）を安全に行うには冪等性の設計が必要。すでに取り込んだレコードを再度 INSERT するとデータが重複する。処理済みフラグをファイルや DB で管理するか、UPSERT（INSERT OR UPDATE）で対処すること。どこまで処理したかをチェックポイントファイルに残しておくと、中断後のリスタートが正確になる",
    "HA クラスタで active-standby 切替後に同じジョブが二重起動されることがある。ロックファイル（起動時に作成・終了時に削除）か DB の排他フラグで多重起動を防ぐこと。ロックファイルが異常終了後に残り続けるケースも想定し、タイムスタンプと PID を記録して古いロックを検出できる仕組みを持たせること",
    "監視システム（Zabbix・Datadog・SIEM 等）でバッチの異常を検知するには、ログに一定のキーワードパターンが必要になる。ERROR や FATAL のプレフィックスを統一し、ジョブ名・処理件数・終了コードを必ず含めること。標準出力への println だけでは監視エージェントに拾われないことがある",
    "バッチの実行時間に業務上の制限（例：夜間ウィンドウ 23:00〜05:00 の 6 時間以内）がある場合、事前にデータ件数 × 1レコードあたりの処理時間を見積もること。想定ヒープサイズは「同時保持するデータ行数 × 1行あたりのオブジェクトサイズ」で粗く計算し、-Xmx で上限を明示すること。メモリ不足は OutOfMemoryError として現れるが、実行時間超過はジョブマネージャのタイムアウト強制終了となりログが残らないこともある",
  ],
  relatedArticleSlugs: ["exception-chain", "junit5-basics"],
  versionCoverage: {
    java8: "BufferedReader + FileReader の組み合わせで1行ずつ読み込む。try-with-resources でリソース管理する。System.exit() で終了コードを返す。",
    java17: "Files.lines() で読込がシンプルになる。var でローカル変数の型宣言を省略できる。",
    java21: "record でバリデーション結果とジョブ実行サマリを型安全に保持できる。switch パターンマッチングで終了コード分岐が簡潔になる。",
    java8Code: `// Java 8: BufferedReader で1行ずつ読み込み、System.exit で終了コード返却
BufferedReader reader = new BufferedReader(
    new InputStreamReader(new FileInputStream(file), "UTF-8"));
String line;
while ((line = reader.readLine()) != null) {
    String[] columns = line.split(",", -1);
}
// ジョブマネージャに終了コードを返す（0=正常, 1=警告, 2=異常）
System.exit(exitCode);`,
    java17Code: `// Java 17: Files.lines() でストリーム処理
try (var lines = Files.lines(path, StandardCharsets.UTF_8)) {
    lines.skip(1).map(line -> line.split(",", -1))
         .filter(cols -> cols.length == expected)
         .forEach(this::processRecord);
}`,
    java21Code: `// Java 21: record でジョブ実行サマリを型安全に表現
record JobSummary(int total, int success, int skipped, int errors, long elapsedMs) {
    int exitCode() {
        return errors > 0 ? 2 : skipped > 0 ? 1 : 0;
    }
}
// switch パターンマッチングで終了コードに応じたログを分岐
var summary = new JobSummary(total, success, skipped, errors, elapsed);
String logMsg = switch (summary.exitCode()) {
    case 0 -> "SUCCESS: " + summary.success() + "件処理完了";
    case 1 -> "WARNING: スキップ" + summary.skipped() + "件";
    default -> "ERROR: エラー" + summary.errors() + "件";
};`,
  },
  libraryComparison: [
    { name: "Pure Java（BufferedReader + split）", whenToUse: "引用符なしの単純な CSV で外部依存を入れられない場合。ジョブマネージャから呼ばれる軽量バッチ。", tradeoff: "RFC 4180 準拠が必要な場合は自前実装の工数が増える。" },
    { name: "OpenCSV", whenToUse: "引用符囲み、エスケープ、Bean バインドが必要な場合。", tradeoff: "外部依存が増える。単純な CSV には過剰。" },
    { name: "Apache Commons CSV", whenToUse: "RFC 4180 準拠の厳密なパースが必要な場合。", tradeoff: "Commons 系の依存が増える。" },
  ],
  faq: [
    { question: "ヘッダー行の有無はどう判定すればよいですか。", answer: "設定値で「ヘッダーあり/なし」を指定する方法が安全です。自動判定は誤判定のリスクがあります。" },
    { question: "ジョブマネージャに登録するとき終了コードはどう設計しますか。", answer: "0=正常終了、1=警告（スキップあり・後続は実行）、2=異常終了（後続を止める）の3値が最低限必要です。ジョブマネージャのジョブネット設定と事前に合わせておくことが重要です。return で抜けると終了コードが 0 になるため、必ず System.exit() で返してください。" },
    { question: "バッチ失敗後のリランはどう設計すればよいですか。", answer: "処理済みレコードを再実行しても結果が変わらない冪等設計が基本です。DB への INSERT は UPSERT に変えるか、処理済みフラグをテーブルで管理します。中断ポイントをチェックポイントファイルに残せば、全件ではなく途中からのリスタートも可能になります。" },
    { question: "実行時間の見積もりはどう行いますか。", answer: "テスト環境で実データに近いデータ量を使った計測が最も信頼できます。概算は「件数 × 1件あたりの処理時間（ms）」で出し、業務ウィンドウの 70〜80% 以内に収まるか確認します。I/O が支配的な場合はストレージ速度の差が大きく効くため、本番相当の環境での計測を推奨します。" },
  ],
  codeTitle: "CsvImportJob の実装（ジョブマネージャ連携・リラン対応）",
  codeSample: `import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * CSV 取込バッチ — ジョブマネージャ連携版
 *
 * 終了コード:
 *   0 ... 正常終了（全件処理成功）
 *   1 ... 警告終了（スキップあり・後続ジョブは続行）
 *   2 ... 異常終了（処理中断・後続ジョブを止める）
 *
 * リラン設計:
 *   - チェックポイントファイル（.done）が存在する場合はスキップ
 *   - 多重起動防止: ロックファイル（.lock）を起動時に作成・終了時に削除
 */
public class CsvImportJob {
    private static final Logger LOGGER = Logger.getLogger(CsvImportJob.class.getName());
    private static final int EXPECTED_COLUMNS = 4;
    private static final int MAX_ERRORS = 100;

    private final File inputFile;
    private final File lockFile;
    private final File doneFile;
    private BufferedReader reader;
    private int totalCount;
    private int successCount;
    private final List<String> errors = new ArrayList<String>();

    public CsvImportJob(File inputFile) {
        this.inputFile = inputFile;
        this.lockFile  = new File(inputFile.getParent(), inputFile.getName() + ".lock");
        this.doneFile  = new File(inputFile.getParent(), inputFile.getName() + ".done");
    }

    /** 前処理: ファイル確認・多重起動防止・リラン判定 */
    public void initialize() throws Exception {
        // リラン判定: 前回正常終了していればスキップ
        if (doneFile.exists()) {
            LOGGER.info("[SKIP] 処理済みファイルを検出: " + doneFile.getName() + " — リラン対象外");
            System.exit(0);
        }
        // 多重起動防止: ロックファイルが存在すれば起動しない
        if (lockFile.exists()) {
            LOGGER.severe("[ERROR] 多重起動を検出: " + lockFile.getName() + " が存在します");
            System.exit(2);
        }
        // ロックファイル作成（PID と起動時刻を記録）
        try (FileWriter fw = new FileWriter(lockFile)) {
            fw.write("pid=" + ProcessHandle.current().pid()
                + " started=" + System.currentTimeMillis());
        }
        if (!inputFile.exists()) {
            LOGGER.severe("[ERROR] 入力ファイルが見つかりません: " + inputFile);
            lockFile.delete();
            System.exit(2);
        }
        reader = new BufferedReader(
            new InputStreamReader(new FileInputStream(inputFile), "UTF-8"));
        String header = reader.readLine();
        if (header == null) {
            LOGGER.severe("[ERROR] 入力ファイルが空: " + inputFile.getName());
            lockFile.delete();
            System.exit(2);
        }
        LOGGER.info("[START] ジョブ開始 file=" + inputFile.getName());
    }

    /** 本処理: 1行ずつ読み込んでバリデーション */
    public int execute() throws Exception {
        String line;
        int lineNum = 1;
        while ((line = reader.readLine()) != null) {
            lineNum++;
            totalCount++;
            if (line.trim().isEmpty()) continue;
            String[] cols = line.split(",", -1);
            if (cols.length != EXPECTED_COLUMNS) {
                errors.add("行" + lineNum + ": カラム数不一致(" + cols.length + ")");
                if (errors.size() >= MAX_ERRORS) {
                    LOGGER.warning("[WARN] エラー上限(" + MAX_ERRORS + "件)到達 — 中断");
                    return 2;
                }
                continue;
            }
            if (cols[0].trim().isEmpty() || cols[1].trim().isEmpty()) {
                errors.add("行" + lineNum + ": 必須項目が空");
                continue;
            }
            successCount++;
        }
        return errors.isEmpty() ? 0 : 1;
    }

    /** 後処理: サマリ出力・ロック解除・完了フラグ書き込み */
    public void terminate(int exitCode) {
        if (reader != null) { try { reader.close(); } catch (Exception e) { /* ignore */ } }

        // 監視システムが拾えるキーワードを含むサマリログ
        // ジョブ名・総件数・成功件数・エラー件数・終了コードを必ず含める
        String status = exitCode == 0 ? "SUCCESS" : exitCode == 1 ? "WARNING" : "ERROR";
        LOGGER.info(String.format("[%s] job=CsvImportJob total=%d success=%d error=%d exitCode=%d",
            status, totalCount, successCount, errors.size(), exitCode));
        for (String err : errors) { LOGGER.warning("[DETAIL] " + err); }

        // 正常/警告終了時は完了フラグを書き込み、次回リランをスキップ
        if (exitCode < 2) {
            try (FileWriter fw = new FileWriter(doneFile)) {
                fw.write("completed=" + System.currentTimeMillis()
                    + " success=" + successCount + " errors=" + errors.size());
            } catch (Exception e) {
                LOGGER.warning("[WARN] 完了フラグの書き込み失敗: " + e.getMessage());
            }
        }
        // ロックファイル削除（異常終了時も必ず削除）
        lockFile.delete();
    }

    /**
     * エントリポイント — ジョブマネージャから呼ばれる想定
     *
     * 起動例（JP1 / cron）:
     *   java -Xmx512m -cp batch.jar CsvImportJob /data/import/sales_20240501.csv
     *
     * HA クラスタ注意:
     *   active-standby 切替後は同じファイルで二重起動が起こりうる。
     *   ロックファイルと .done ファイルを共有ストレージ上に置くこと。
     */
    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("使い方: java CsvImportJob <CSVパス>");
            System.exit(2);
            return;
        }
        CsvImportJob job = new CsvImportJob(new File(args[0]));
        int exitCode = 2;
        try {
            job.initialize();
            exitCode = job.execute();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "[ERROR] 予期しない例外 job=CsvImportJob", e);
        } finally {
            job.terminate(exitCode);
        }
        // ジョブマネージャに終了コードを返す — return ではなく必ず System.exit() を使う
        System.exit(exitCode);
    }
}`,
},
{
  slug: "batch-properties-config",
  title: "Java バッチの設定ファイル読み込みを Properties で実装する方法",
  categorySlug: "batch",
  summary: "java.util.Properties でバッチ設定を外部化し、デフォルト値・必須チェック・環境切替を整理する。",
  version: "Java 8",
  tags: ["バッチ", "Properties", "設定ファイル", "外部化", "環境切替"],
  apiNames: ["Properties", "FileInputStream", "InputStream", "System.getProperty"],
  description: "java.util.Properties でバッチ処理の設定を外部化し、デフォルト値・必須パラメータ検証・環境切替を Java 8/17/21 対応で解説する。",
  lead: "バッチ処理で入力ファイルのパスや DB 接続先をソースコードに直書きしていると、環境が変わるたびにビルドし直す必要が出てきます。java.util.Properties は古い API ですが、キーと値のペアを外部ファイルに持たせる用途では今でも十分に実用的です。この記事では、Properties ファイルの読み込みを BatchConfig クラスとしてラップし、デフォルト値の設定、必須パラメータの存在チェック、環境ごとの設定ファイル切替（開発/ステージング/本番）を整理します。前回の CsvImportJob に BatchConfig を組み込み、入力ファイルパスやエンコーディングを設定ファイルから注入する実装例も示します。",
  useCases: [
    "バッチの入力ファイルパス・出力先を環境ごとに切り替え、デプロイ時のミスを減らす",
    "DB 接続情報を設定ファイルに外出しし、ソースコードから機密情報を除去する",
    "リトライ回数やタイムアウト秒数を再ビルドなしで変更可能にする",
  ],
  cautions: [
    "Properties ファイルはデフォルトで ISO 8859-1。日本語を含む場合は Reader で UTF-8 を指定する",
    "パスワードを平文で置く場合、ファイルのパーミッション管理が必須。.gitignore に追加すること",
    "getProperty() は存在しないキーに null を返す。必須パラメータは起動時にまとめて検証する",
    "System.getProperty() と Properties ファイルの優先順位を明確に決めておくこと",
    "int や boolean への変換時の NumberFormatException に防御を忘れないこと",
  ],
  relatedArticleSlugs: ["batch-framework-design", "batch-basic-structure"],
  versionCoverage: {
    java8: "Properties の load(InputStream) は ISO 8859-1 前提。UTF-8 で読む場合は InputStreamReader を挟む。",
    java17: "NIO の Files.newBufferedReader で Charset を明示的に渡せるため文字コードの扱いが簡潔になる。",
    java21: "record DbConfig(String url, String user, int maxPool) のように設定値を型安全に表現し、JobContext に入れる値の型を明確にできる。",
    java8Code: `// Java 8: InputStreamReader で UTF-8 を明示
Properties props = new Properties();
FileInputStream fis = new FileInputStream("batch.properties");
InputStreamReader isr = new InputStreamReader(fis, "UTF-8");
props.load(isr);
isr.close();`,
    java17Code: `// Java 17: Files.newBufferedReader で簡潔に
var props = new Properties();
try (var reader = Files.newBufferedReader(
        Path.of("batch.properties"), StandardCharsets.UTF_8)) {
    props.load(reader);
}`,
    java21Code: `// Java 21: record で設定値グループを型安全に保持
record DbConfig(String url, String user, String password) {}
DbConfig db = new DbConfig(
    config.getRequired("db.url"),
    config.getRequired("db.user"),
    config.getRequired("db.password"));`,
  },
  libraryComparison: [
    { name: "Pure Java（java.util.Properties）", whenToUse: "フラットな key=value で十分な場合。依存ゼロでバッチの設定を外部化したいとき。", tradeoff: "ネスト構造やリスト、型安全な読み込みには対応していない。" },
    { name: "Apache Commons Configuration", whenToUse: "複数形式（properties、XML、YAML）を統一的に扱いたい場合。", tradeoff: "Commons 系の依存が増える。単純な key=value には過剰。" },
    { name: "typesafe config (HOCON)", whenToUse: "ネスト構造、型安全な取得、include が必要な場合。", tradeoff: "HOCON 独自記法の学習コスト。Properties で済むなら不要。" },
  ],
  faq: [
    { question: "properties ファイルに日本語を書くには。", answer: "Properties.load(Reader) で UTF-8 の InputStreamReader を渡せばそのまま書けます。load(InputStream) は ISO 8859-1 前提です。" },
    { question: "環境ごとの設定ファイル切替はどう実現しますか。", answer: "起動引数で環境名を渡し、batch-{env}.properties を読み込む方式が一般的です。" },
    { question: "設定値のバリデーションはいつ行うべきですか。", answer: "バッチ起動直後の initialize() 先頭で全必須パラメータを一括検証し、不足があれば早期に異常終了させます。" },
  ],
  codeTitle: "BatchConfig クラス",
  codeSample: `import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.logging.Logger;

public class BatchConfig {
    private static final Logger LOGGER = Logger.getLogger(BatchConfig.class.getName());
    private final Properties properties;

    private BatchConfig(Properties properties) { this.properties = properties; }

    public static BatchConfig load(String filePath) throws IOException {
        Properties props = new Properties();
        FileInputStream fis = new FileInputStream(filePath);
        InputStreamReader reader = new InputStreamReader(fis, "UTF-8");
        try { props.load(reader); } finally { reader.close(); fis.close(); }
        LOGGER.info("設定ファイル読込: " + filePath + " (" + props.size() + "件)");
        return new BatchConfig(props);
    }

    public static BatchConfig loadForEnv(String baseDir, String env) throws IOException {
        String envFile = baseDir + File.separator + "batch-" + env + ".properties";
        String defaultFile = baseDir + File.separator + "batch.properties";
        return new File(envFile).exists() ? load(envFile) : load(defaultFile);
    }

    public String get(String key, String defaultValue) {
        return Optional.ofNullable(properties.getProperty(key)).orElse(defaultValue);
    }

    public String getRequired(String key) {
        String value = properties.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalStateException("必須パラメータ未設定: " + key);
        }
        return value.trim();
    }

    public int getInt(String key, int defaultValue) {
        String value = properties.getProperty(key);
        if (value == null || value.trim().isEmpty()) return defaultValue;
        try { return Integer.parseInt(value.trim()); } catch (NumberFormatException e) {
            LOGGER.warning("int変換失敗: " + key + "=" + value); return defaultValue;
        }
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        String value = properties.getProperty(key);
        return value != null ? Boolean.parseBoolean(value.trim()) : defaultValue;
    }

    public List<String> validateRequired(String... keys) {
        List<String> missing = new ArrayList<String>();
        for (String key : keys) {
            String v = properties.getProperty(key);
            if (v == null || v.trim().isEmpty()) missing.add(key);
        }
        return missing;
    }

    public static void main(String[] args) throws IOException {
        BatchConfig config = BatchConfig.load("config/batch.properties");
        System.out.println("input.file = " + config.get("input.file", "(未設定)"));
        System.out.println("input.charset = " + config.get("input.charset", "UTF-8"));
        System.out.println("batch.maxErrors = " + config.getInt("batch.maxErrors", 100));
    }
}`,
},
{
  slug: "batch-retry-backoff",
  title: "Java バッチのリトライ処理を指数バックオフで実装する方法",
  categorySlug: "batch",
  summary: "外部API・DB接続のエラーに対し、指数バックオフ付きリトライを Pure Java で実装する。",
  version: "Java 8",
  tags: ["リトライ", "指数バックオフ", "バッチ", "例外処理"],
  apiNames: ["Callable", "Thread.sleep", "Exception"],
  description: "Java バッチで外部API・DB接続エラーに対する指数バックオフ付きリトライを Callable と Thread.sleep で実装する方法を Java 8/17/21 対応で解説する。",
  lead: "バッチ処理が外部APIやデータベースに依存している場合、ネットワークの瞬断やサーバーの一時的な過負荷によるエラーは避けられません。こうした一過性のエラーに対して即座に処理を打ち切るのではなく、適切な間隔を空けてリトライすることで成功率を高められます。ただし、固定間隔でのリトライはサーバーへの負荷集中を招くため、指数バックオフ（1秒→2秒→4秒→8秒と待機時間を倍増させる方式）が実務では標準的な戦略です。この記事では、Callable インターフェースを活用した汎用的な RetryExecutor クラスを実装し、リトライ対象の例外判定、最大リトライ回数の制御、待機時間の上限設定を扱います。",
  useCases: [
    "外部REST APIからデータを取得するバッチで、タイムアウトやHTTP 503に対してリトライする",
    "DB接続プールが一時的に枯渇した場合に、一定間隔を空けて再接続を試みる",
    "ファイル転送バッチでSFTPサーバーへの接続失敗時にバックオフ付きリトライする",
  ],
  cautions: [
    "リトライ対象の例外を限定すること。NullPointerException のようなプログラムエラーをリトライしても意味がない",
    "最大リトライ回数と待機時間の上限を必ず設定する。無制限リトライはバッチの無限停滞を招く",
    "Thread.sleep は InterruptedException を発生させるため、割り込みフラグの復元を忘れないこと",
    "指数バックオフの初期値と倍率はシステム要件に合わせて調整する",
    "リトライ回数とエラー内容はログに記録し、運用監視で検知できるようにする",
  ],
  relatedArticleSlugs: ["batch-framework-design", "batch-error-handling", "batch-complete-framework"],
  versionCoverage: {
    java8: "Callable<V> と Thread.sleep で基本的なリトライは十分に実装できる。例外の型判定は instanceof の連鎖で行う。",
    java17: "var で型推論が使える程度の違い。テキストブロックでログメッセージが読みやすくなる。",
    java21: "switch パターンマッチングで例外の型ごとのリトライ判定を整理できる。Virtual Thread 上の sleep はキャリアスレッドをブロックしない。",
    java8Code: `// Java 8: instanceof の連鎖でリトライ判定
private boolean isRetryable(Exception e) {
    return e instanceof java.net.SocketTimeoutException
        || e instanceof java.sql.SQLTransientException
        || e instanceof java.io.IOException;
}`,
    java17Code: `// Java 17: 記述は同じだが var で簡潔に
var retryable = e instanceof java.net.SocketTimeoutException
    || e instanceof java.io.IOException;`,
    java21Code: `// Java 21: switch パターンマッチングで例外を分類
boolean retryable = switch (e) {
    case java.net.SocketTimeoutException s -> true;
    case java.io.IOException io -> true;
    default -> false;
};`,
  },
  libraryComparison: [
    { name: "Pure Java（Callable + Thread.sleep）", whenToUse: "外部依存を増やしたくない場合。リトライ対象が限定的な場合。", tradeoff: "サーキットブレーカーが必要になると拡張コストが上がる。" },
    { name: "Resilience4j", whenToUse: "リトライ・サーキットブレーカー・バルクヘッドを組み合わせたい場合。", tradeoff: "バッチ単体には過剰。依存と学習コストが増える。" },
    { name: "Spring Retry", whenToUse: "Spring Boot で @Retryable による宣言的リトライを使いたい場合。", tradeoff: "Spring 依存が前提。Pure Java 構成には馴染まない。" },
  ],
  faq: [
    { question: "指数バックオフの初期待機時間の目安は。", answer: "外部APIなら1秒、DB再接続なら500ミリ秒が目安です。レートリミットがある場合はAPI仕様に従います。" },
    { question: "リトライ中にバッチ全体のタイムアウトを超えた場合は。", answer: "RetryExecutor に制限時間チェックを組み込むか、外側のスケジューラでタイムアウト制御を行います。" },
    { question: "リトライとサーキットブレーカーの違いは。", answer: "リトライは失敗を再実行、サーキットブレーカーは連続失敗でリクエスト自体を遮断します。組み合わせて使うことが多いです。" },
  ],
  codeTitle: "RetryExecutor — 指数バックオフ付きリトライ",
  codeSample: `import java.util.concurrent.Callable;
import java.util.logging.Logger;

public class RetryExecutor {
    private static final Logger LOGGER = Logger.getLogger(RetryExecutor.class.getName());
    private final int maxRetries;
    private final long initialDelay;
    private final long maxDelay;

    public RetryExecutor(int maxRetries, long initialDelay, long maxDelay) {
        this.maxRetries = maxRetries;
        this.initialDelay = initialDelay;
        this.maxDelay = maxDelay;
    }

    public <T> T execute(Callable<T> task) throws Exception {
        int attempt = 0;
        long delay = initialDelay;
        while (true) {
            try {
                return task.call();
            } catch (Exception e) {
                attempt++;
                if (!isRetryable(e) || attempt >= maxRetries) {
                    LOGGER.severe("リトライ上限または対象外: " + e.getMessage());
                    throw e;
                }
                LOGGER.warning(String.format("リトライ %d/%d — %dms後 [%s]",
                    attempt, maxRetries, delay, e.getMessage()));
                try { Thread.sleep(delay); } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("割り込み発生", ie);
                }
                delay = Math.min(delay * 2, maxDelay);
            }
        }
    }

    private boolean isRetryable(Exception e) {
        return e instanceof java.io.IOException
            || e instanceof java.net.SocketTimeoutException;
    }

    public static void main(String[] args) throws Exception {
        RetryExecutor retry = new RetryExecutor(4, 1000L, 16000L);
        String result = retry.execute(new Callable<String>() {
            private int count = 0;
            @Override public String call() throws Exception {
                count++;
                if (count < 3) throw new java.io.IOException("接続失敗（試行" + count + "）");
                return "API応答: OK";
            }
        });
        System.out.println(result);
    }
}`,
},
{
  slug: "batch-logging-design",
  title: "Java バッチのログ設計を java.util.logging で実装する方法",
  categorySlug: "batch",
  summary: "FileHandler とカスタム Formatter でバッチ処理の実行記録・件数・経過時間を出力する。",
  version: "Java 8",
  tags: ["ログ", "java.util.logging", "バッチ", "FileHandler"],
  apiNames: ["Logger", "FileHandler", "SimpleFormatter", "Level"],
  description: "Java バッチのログ設計を java.util.logging の FileHandler とカスタム Formatter で実装する方法を Java 8/17/21 対応で解説する。",
  lead: "バッチ処理は対話的なフィードバックがないため、ログが唯一の動作確認手段になります。処理がどこまで進んだか、何件処理したか、どのレコードでエラーが発生したかを追跡できなければ、障害発生時の原因究明に時間がかかります。java.util.logging は Java 標準に含まれており、外部ライブラリなしでファイル出力やフォーマットのカスタマイズが可能です。この記事では、バッチ処理に特化したログ設計として、BatchLogger クラスの実装、ログレベルの使い分け基準、ファイルローテーション、処理件数や経過時間の記録パターンを整理します。",
  useCases: [
    "夜間バッチの実行結果を翌朝にログファイルで確認する",
    "CSVインポートバッチで処理件数・スキップ件数・エラー件数を記録する",
    "月次集計バッチの各ステップの経過時間を記録しボトルネックを特定する",
  ],
  cautions: [
    "FileHandler のパスは絶対パスにするか相対パスを明示すること。権限エラーで出力されないケースが多い",
    "デフォルトの SimpleFormatter は XML 形式になることがある。明示的にフォーマットを指定すること",
    "ファイルローテーションの limit と count を設定しないとログファイルが肥大化する",
    "Level.FINE 以下はデフォルトで出力されない。Handler と Logger の両方にレベルを設定する",
  ],
  relatedArticleSlugs: ["batch-framework-design", "batch-error-handling", "batch-complete-framework"],
  versionCoverage: {
    java8: "java.util.logging の全機能が利用可能。Formatter のサブクラスで format メソッドをオーバーライドする。",
    java17: "System.Logger が追加され、java.util.logging をバックエンドに使いつつファサードを切り替えられる。",
    java21: "System.Logger の利用が安定。java.util.logging 自体の API に大きな変更はない。",
    java8Code: `// Java 8: 匿名クラスでカスタム Formatter
handler.setFormatter(new SimpleFormatter() {
    @Override
    public String format(java.util.logging.LogRecord record) {
        return String.format("[%1$tF %1$tT] %2$s: %3$s%n",
            record.getMillis(), record.getLevel(), record.getMessage());
    }
});`,
    java17Code: `// Java 17: var で簡潔に
var formatter = new SimpleFormatter() {
    @Override
    public String format(java.util.logging.LogRecord record) {
        return String.format("[%1$tF %1$tT] %2$s: %3$s%n",
            record.getMillis(), record.getLevel(), record.getMessage());
    }
};`,
    java21Code: `// Java 21: System.Logger を使う場合
System.Logger sysLogger = System.getLogger("BatchJob");
sysLogger.log(System.Logger.Level.INFO, "処理開始: {0}件", totalCount);`,
  },
  libraryComparison: [
    { name: "java.util.logging（標準API）", whenToUse: "外部ライブラリなしで軽量バッチのログを出力したい場合。", tradeoff: "設定が冗長で SLF4J + Logback よりパフォーマンスが劣る。" },
    { name: "SLF4J + Logback", whenToUse: "プロジェクト全体で統一したロギングファサードが必要な場合。", tradeoff: "3JAR追加。logback.xml の学習コストがある。" },
    { name: "Log4j 2", whenToUse: "非同期ロギングが必要な高スループットバッチの場合。", tradeoff: "過去の脆弱性によりバージョン管理に注意が必要。" },
  ],
  faq: [
    { question: "ログレベルの使い分け基準は。", answer: "SEVERE は続行不能、WARNING はリトライで回復、INFO は正常経過、FINE はデバッグ情報です。" },
    { question: "ファイルローテーションの設定方法は。", answer: "FileHandler のコンストラクタで limit（バイト数上限）と count（世代数）を指定します。" },
    { question: "処理件数はどのタイミングで記録しますか。", answer: "開始時に総件数、一定件数ごとに進捗、完了時に成功・失敗・スキップ各件数と経過時間を記録します。" },
  ],
  codeTitle: "BatchLogger — バッチ向けログ出力クラス",
  codeSample: `import java.io.IOException;
import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

public class BatchLogger {
    private final Logger logger;

    public BatchLogger(String name, String logFilePath) throws IOException {
        this.logger = Logger.getLogger(name);
        this.logger.setUseParentHandlers(false);
        FileHandler fh = new FileHandler(logFilePath, 5_000_000, 3, true);
        fh.setFormatter(new SimpleFormatter() {
            @Override public String format(LogRecord r) {
                return String.format("[%1$tF %1$tT.%1$tL] [%2$-7s] %3$s%n",
                    r.getMillis(), r.getLevel(), r.getMessage());
            }
        });
        fh.setLevel(Level.ALL);
        logger.addHandler(fh);
        logger.setLevel(Level.ALL);
    }

    public void info(String msg) { logger.info(msg); }
    public void warn(String msg) { logger.warning(msg); }
    public void error(String msg, Throwable t) { logger.log(Level.SEVERE, msg, t); }

    public void logProgress(int processed, int total, long startMillis) {
        long elapsed = System.currentTimeMillis() - startMillis;
        double pct = total > 0 ? (processed * 100.0 / total) : 0;
        logger.info(String.format("進捗: %d/%d (%.1f%%) — %dms", processed, total, pct, elapsed));
    }

    public void logSummary(int success, int error, int skip, long startMillis) {
        long elapsed = System.currentTimeMillis() - startMillis;
        logger.info(String.format("完了: 成功=%d, エラー=%d, スキップ=%d, %dms",
            success, error, skip, elapsed));
    }

    public static void main(String[] args) throws IOException {
        BatchLogger log = new BatchLogger("CsvBatch", "./logs/batch.log");
        long start = System.currentTimeMillis();
        log.info("=== バッチ開始 ===");
        for (int i = 1; i <= 5000; i++) {
            if (i % 1000 == 0) log.logProgress(i, 5000, start);
        }
        log.logSummary(4999, 1, 0, start);
        log.info("=== バッチ終了 ===");
    }
}`,
},
{
  slug: "batch-error-handling",
  title: "Java バッチのエラーハンドリングを3つの戦略で実装する方法",
  categorySlug: "batch",
  summary: "異常終了・継続・スキップの3戦略を ErrorPolicy と ErrorHandler で切り替え可能に実装する。",
  version: "Java 8",
  tags: ["エラーハンドリング", "バッチ", "例外処理", "スキップ"],
  apiNames: ["Exception", "enum", "List"],
  description: "Java バッチのエラーハンドリングを異常終了・継続・スキップの3戦略で実装し、ErrorPolicy による切り替えを Java 8/17/21 対応で解説する。",
  lead: "バッチ処理でエラーが発生したとき、どう振る舞うかは業務要件によって大きく異なります。決済データの取込なら1件でもエラーがあれば全体を止めるべきですし、大量のログ集計であればエラー行をスキップして残りを処理するほうが現実的です。この記事では、エラー時の振る舞いを「異常終了（即停止）」「継続（ログ記録して次へ）」「スキップ（N件まで許容、超過で停止）」の3つの戦略として定義し、ErrorPolicy enum と ErrorHandler クラスで切り替え可能に実装します。CSV行単位の処理を例に、レコードごとのエラーハンドリングパターンを示します。",
  useCases: [
    "決済データ取込バッチで不正レコードを検出した場合に全件ロールバックして即停止する",
    "アクセスログ集計バッチで解析できない行をスキップし残りの集計を継続する",
    "顧客マスタ同期バッチでエラーが100件を超えたらデータ品質に問題ありとして停止する",
  ],
  cautions: [
    "異常終了戦略でも終了前にエラー内容とどこまで処理したかをログに記録すること",
    "スキップ上限を設定しない継続戦略はデータ全体が壊れていても走りきるリスクがある",
    "エラーハンドリングのテストでは先頭行・末尾行・連続エラー・全行エラーを網羅する",
    "スキップしたレコードの一覧を別ファイルに出力しておくと再処理に活用できる",
  ],
  relatedArticleSlugs: ["batch-framework-design", "batch-retry-backoff", "batch-complete-framework"],
  versionCoverage: {
    java8: "enum で ErrorPolicy を定義し switch 文で分岐する。匿名クラスで RecordProcessor を実装する形が標準。",
    java17: "sealed interface でエラー結果を型安全に分類できる。switch 式で分岐を式として書ける。",
    java21: "switch パターンマッチングで処理結果の型ごとに分岐できる。",
    java8Code: `// Java 8: switch 文で ErrorPolicy を分岐
switch (policy) {
    case FAIL_FAST:
        throw new RuntimeException("行" + lineNum + "で中断", e);
    case CONTINUE:
        logger.warning("行" + lineNum + "をスキップ");
        break;
    case SKIP_LIMIT:
        skipCount++;
        if (skipCount > maxSkips) throw new RuntimeException("上限超過");
        break;
}`,
    java17Code: `// Java 17: switch 式で分岐結果を返す
boolean shouldContinue = switch (policy) {
    case FAIL_FAST -> throw new RuntimeException("中断");
    case CONTINUE -> { yield true; }
    case SKIP_LIMIT -> { skipCount++; yield skipCount <= maxSkips; }
};`,
    java21Code: `// Java 21: sealed + Record で処理結果を型安全に
sealed interface ProcessResult permits Success, Skipped, Failed {}
record Success(int line) implements ProcessResult {}
record Skipped(int line, String reason) implements ProcessResult {}
record Failed(int line, Exception cause) implements ProcessResult {}`,
  },
  libraryComparison: [
    { name: "Pure Java（enum + try-catch）", whenToUse: "エラー戦略が限定的で外部依存を増やしたくない場合。", tradeoff: "チャンク単位のトランザクション管理が必要になると自前コストが大きくなる。" },
    { name: "Spring Batch", whenToUse: "skip-limit、retry-limit を宣言的に設定したい大規模バッチ。", tradeoff: "Spring 依存 + 設定の学習コスト。小規模には過剰。" },
    { name: "jBeret（Jakarta Batch）", whenToUse: "Jakarta EE 環境でバッチ仕様に準拠したい場合。", tradeoff: "Jakarta EE コンテナが前提。スタンドアロンには追加設定が必要。" },
  ],
  faq: [
    { question: "FAIL_FAST と SKIP_LIMIT はどう使い分けますか。", answer: "データの正確性が最優先なら FAIL_FAST、一部不備が許容されるなら SKIP_LIMIT です。" },
    { question: "スキップしたレコードの再処理はどう設計しますか。", answer: "スキップしたレコードをエラーCSVに書き出し、修正後に同じバッチで再投入する構成が一般的です。" },
    { question: "テストで最低限確認すべきケースは。", answer: "正常のみ・先頭行エラー・末尾行エラー・上限ちょうど・上限超過・全行エラーの6パターンです。" },
  ],
  codeTitle: "ErrorPolicy + ErrorHandler",
  codeSample: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

public class BatchErrorHandling {

    public enum ErrorPolicy { FAIL_FAST, CONTINUE, SKIP_LIMIT }

    public interface RecordProcessor { void process(String record) throws Exception; }

    public static class ErrorHandler {
        private static final Logger LOGGER = Logger.getLogger(ErrorHandler.class.getName());
        private final ErrorPolicy policy;
        private final int maxSkips;
        private int skipCount;
        private final List<String> skipped = new ArrayList<String>();

        public ErrorHandler(ErrorPolicy policy, int maxSkips) {
            this.policy = policy; this.maxSkips = maxSkips;
        }

        public void handle(int lineNum, String record, Exception e) {
            switch (policy) {
                case FAIL_FAST:
                    LOGGER.severe("行" + lineNum + "で中断: " + e.getMessage());
                    throw new RuntimeException("行" + lineNum, e);
                case CONTINUE:
                    LOGGER.warning("行" + lineNum + "スキップ: " + e.getMessage());
                    skipped.add(lineNum + ":" + record);
                    break;
                case SKIP_LIMIT:
                    skipCount++;
                    skipped.add(lineNum + ":" + record);
                    if (skipCount > maxSkips) throw new RuntimeException("スキップ上限超過", e);
                    LOGGER.warning("行" + lineNum + "スキップ(" + skipCount + "/" + maxSkips + ")");
                    break;
            }
        }
        public int getSkipCount() { return skipCount; }
        public List<String> getSkipped() { return skipped; }
    }

    public static int processRecords(List<String> records, RecordProcessor proc, ErrorHandler handler) {
        int success = 0;
        for (int i = 0; i < records.size(); i++) {
            try { proc.process(records.get(i)); success++; }
            catch (Exception e) { handler.handle(i + 1, records.get(i), e); }
        }
        return success;
    }

    public static void main(String[] args) {
        List<String> lines = Arrays.asList("1001,田中,50000", "1002,鈴木,INVALID", "1003,佐藤,30000", "1004,山田,-500", "1005,高橋,45000");
        RecordProcessor proc = new RecordProcessor() {
            @Override public void process(String record) throws Exception {
                String[] f = record.split(",");
                int amount = Integer.parseInt(f[2]);
                if (amount < 0) throw new IllegalArgumentException("金額が負数: " + amount);
                System.out.println("処理: " + f[1] + " / " + amount + "円");
            }
        };
        ErrorHandler handler = new ErrorHandler(ErrorPolicy.SKIP_LIMIT, 3);
        int ok = processRecords(lines, proc, handler);
        System.out.println("成功: " + ok + " / スキップ: " + handler.getSkipCount());
    }
}`,
},
{
  slug: "batch-complete-framework",
  title: "Java バッチフレームワーク完成版 — 全クラスを統合した実装まとめ",
  categorySlug: "batch",
  summary: "設計・設定・リトライ・ログ・エラーハンドリングを統合した完成版バッチフレームワーク。",
  version: "Java 8",
  tags: ["バッチ", "フレームワーク", "統合", "CSV", "完成版"],
  apiNames: ["Properties", "Logger", "Callable", "List"],
  description: "Java バッチ連載の全クラスを統合した完成版フレームワークを CsvImportJob として実装し、main からの実行フローを Java 8/17/21 対応で解説する。",
  lead: "この記事は Java バッチ連載の最終回です。全体設計のインターフェース、基本構造、設定ファイル読み込み、リトライ処理、ログ設計、エラーハンドリングを一つの動作するバッチジョブとして統合します。設定ファイルからパラメータを読み込み、CSV を1行ずつ処理し、エラー戦略に従ってスキップまたは停止し、外部API呼び出しにはリトライを適用し、すべての経過をログに記録します。各クラスの役割と接続点を示し、連載全体の設計がどう組み合わさるかを確認できます。実務で自前のバッチフレームワークを構築する際の出発点として活用してください。",
  useCases: [
    "社内システムの CSV 取込バッチを新規開発する際の設計テンプレートとして使う",
    "既存のバッチ処理をリファクタリングし、リトライ・ログ・エラーハンドリングを共通化する",
    "Spring Batch を導入するほどではない小〜中規模バッチの自前フレームワークとして採用する",
  ],
  cautions: [
    "この完成版はあくまで出発点。トランザクション管理やチャンク処理が必要な場合は各クラスに拡張を加えること",
    "設定ファイルのパスやログ出力先は環境依存。本番ではシステムプロパティや環境変数で外部指定する構成にすること",
    "CSV のエンコーディングは InputStreamReader で明示的に指定する",
    "System.exit で終了コードを返す場合、finally や shutdown hook の実行に注意すること",
    "各クラスは別ファイルに分割してパッケージ構成を整えること。1ファイルにまとめているのは連載の俯瞰用",
  ],
  relatedArticleSlugs: ["batch-framework-design", "batch-basic-structure", "batch-properties-config", "batch-retry-backoff", "batch-logging-design", "batch-error-handling"],
  versionCoverage: {
    java8: "すべてのクラスが Java 8 で動作する。try-with-resources、ラムダ式、Callable で十分な表現力がある。",
    java17: "var、テキストブロック、switch 式でコードが簡潔になる。",
    java21: "Virtual Thread で I/O 待ちの多いバッチの並列度を簡単に引き上げられる。Record で設定やレコードを値オブジェクト化できる。",
    java8Code: `// Java 8: 匿名クラスで RecordProcessor を実装
RecordProcessor processor = new RecordProcessor() {
    @Override public void process(String record) throws Exception {
        String[] fields = record.split(",");
        // 業務ロジック
    }
};`,
    java17Code: `// Java 17: ラムダ + var で簡潔に
RecordProcessor processor = record -> {
    var fields = record.split(",");
};`,
    java21Code: `// Java 21: Virtual Thread で並列処理
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (String record : records) {
        executor.submit(() -> processor.process(record));
    }
}`,
  },
  libraryComparison: [
    { name: "Pure Java 自前フレームワーク", whenToUse: "バッチ対象が数千〜数万件で外部依存を最小にしたい場合。", tradeoff: "チャンクコミットやジョブリスタートは自前で実装が必要。" },
    { name: "Spring Batch", whenToUse: "数十万件以上の大量データ処理、チャンクトランザクション、再実行管理が必要な場合。", tradeoff: "Spring Boot + Spring Batch の依存が大幅に増える。" },
    { name: "Quartz Scheduler + 自前バッチ", whenToUse: "ジョブのスケジューリングを Java プロセス内で完結させたい場合。", tradeoff: "Quartz はスケジューリング特化。バッチ構造は別途実装が必要。" },
  ],
  faq: [
    { question: "この完成版をそのまま本番で使えますか。", answer: "小〜中規模なら出発点として使えます。ログローテーション、終了コード管理、監視連携の追加を推奨します。" },
    { question: "Spring Batch に移行する場合、この設計は活かせますか。", answer: "RecordProcessor は ItemProcessor に、ErrorPolicy は SkipPolicy に、RetryExecutor は RetryTemplate に対応します。" },
    { question: "並列処理を追加するには。", answer: "ExecutorService でスレッドプールを作り submit する構成にします。ErrorHandler を AtomicInteger 等でスレッドセーフにします。" },
  ],
  codeTitle: "CsvImportJob — 全クラスを統合した完成版バッチ",
  codeSample: `import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.Callable;
import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;

public class CsvImportJob {

    // ===== BatchConfig =====
    static class BatchConfig {
        private final Properties props;
        BatchConfig(String path) throws IOException {
            this.props = new Properties();
            FileInputStream fis = new FileInputStream(path);
            try { props.load(fis); } finally { fis.close(); }
        }
        String get(String key, String def) { return props.getProperty(key, def); }
        int getInt(String key, int def) { return Integer.parseInt(props.getProperty(key, String.valueOf(def))); }
    }

    // ===== BatchLogger =====
    static class BatchJobLogger {
        private final Logger logger;
        BatchJobLogger(String name, String logFile) throws IOException {
            this.logger = Logger.getLogger(name);
            logger.setUseParentHandlers(false);
            FileHandler fh = new FileHandler(logFile, 5_000_000, 3, true);
            fh.setFormatter(new SimpleFormatter() {
                @Override public String format(LogRecord r) {
                    return String.format("[%1$tF %1$tT] [%2$-7s] %3$s%n", r.getMillis(), r.getLevel(), r.getMessage());
                }
            });
            logger.addHandler(fh);
            logger.setLevel(Level.ALL);
        }
        void info(String msg) { logger.info(msg); }
        void warn(String msg) { logger.warning(msg); }
        void error(String msg, Throwable t) { logger.log(Level.SEVERE, msg, t); }
    }

    // ===== RetryExecutor =====
    static class RetryExecutor {
        private final int max; private final long initDelay; private final long maxDelay; private final BatchJobLogger log;
        RetryExecutor(int max, long initDelay, long maxDelay, BatchJobLogger log) {
            this.max = max; this.initDelay = initDelay; this.maxDelay = maxDelay; this.log = log;
        }
        <T> T execute(Callable<T> task) throws Exception {
            int attempt = 0; long delay = initDelay;
            while (true) {
                try { return task.call(); } catch (Exception e) {
                    attempt++;
                    if (attempt >= max) throw e;
                    log.warn(String.format("リトライ %d/%d — %dms後", attempt, max, delay));
                    Thread.sleep(delay);
                    delay = Math.min(delay * 2, maxDelay);
                }
            }
        }
    }

    // ===== ErrorHandler =====
    enum ErrorPolicy { FAIL_FAST, CONTINUE, SKIP_LIMIT }
    static class ErrorHandler {
        private final ErrorPolicy policy; private final int maxSkips; private int skipCount;
        private final List<String> skipped = new ArrayList<String>();
        ErrorHandler(ErrorPolicy p, int max) { this.policy = p; this.maxSkips = max; }
        void handle(int line, String rec, Exception e, BatchJobLogger log) {
            switch (policy) {
                case FAIL_FAST: throw new RuntimeException("行" + line + "で中断", e);
                case CONTINUE: log.warn("行" + line + "スキップ"); skipped.add(line + ":" + rec); break;
                case SKIP_LIMIT: skipCount++; skipped.add(line + ":" + rec);
                    if (skipCount > maxSkips) throw new RuntimeException("スキップ上限超過", e);
                    log.warn("行" + line + "スキップ(" + skipCount + "/" + maxSkips + ")"); break;
            }
        }
        int getSkipCount() { return skipCount; }
    }

    // ===== メイン処理 =====
    public static void main(String[] args) {
        if (args.length < 1) { System.err.println("使い方: java CsvImportJob <config.properties>"); System.exit(1); }
        try {
            BatchConfig config = new BatchConfig(args[0]);
            BatchJobLogger log = new BatchJobLogger("CsvImportJob", config.get("log.path", "logs/batch.log"));
            RetryExecutor retry = new RetryExecutor(config.getInt("retry.max", 3), config.getInt("retry.delay.ms", 1000), 16000L, log);
            ErrorHandler errHandler = new ErrorHandler(ErrorPolicy.valueOf(config.get("error.policy", "SKIP_LIMIT")), config.getInt("error.max.skips", 50));

            log.info("=== CsvImportJob 開始 ===");
            long start = System.currentTimeMillis();
            int success = 0; int lineNum = 0;
            BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(config.get("csv.path", "data/input.csv")), "UTF-8"));
            try {
                String line;
                while ((line = reader.readLine()) != null) {
                    lineNum++;
                    if (lineNum == 1) continue;
                    final String record = line;
                    try {
                        retry.execute(new Callable<Void>() {
                            @Override public Void call() throws Exception { processRecord(record); return null; }
                        });
                        success++;
                    } catch (Exception e) { errHandler.handle(lineNum, record, e, log); }
                }
            } finally { reader.close(); }

            long elapsed = System.currentTimeMillis() - start;
            log.info(String.format("完了: 成功=%d, スキップ=%d, %dms", success, errHandler.getSkipCount(), elapsed));
            log.info("=== CsvImportJob 終了 ===");
        } catch (Exception e) { System.err.println("異常終了: " + e.getMessage()); System.exit(2); }
    }

    private static void processRecord(String csvLine) throws Exception {
        String[] f = csvLine.split(",");
        if (f.length < 3) throw new IllegalArgumentException("フィールド数不足");
        int amount = Integer.parseInt(f[2].trim());
        if (amount < 0) throw new IllegalArgumentException("金額が負数: " + amount);
        System.out.println("処理: " + f[0].trim() + " / " + f[1].trim() + " / " + amount + "円");
    }
}`,
},
{
  slug: "batch-dispatcher",
  title: "Java バッチを1つの JAR にまとめるディスパッチャーの実装",
  categorySlug: "batch",
  summary: "Properties ファイルとリフレクションで実行ジョブを切り替える BatchDispatcher を実装し、1 JAR 複数ジョブの運用を実現する。",
  version: "Java 8",
  tags: ["バッチ", "ディスパッチャー", "リフレクション", "Properties", "JAR", "運用"],
  apiNames: ["Class.forName", "Properties", "System.exit", "Constructor.newInstance", "Logger"],
  description: "1つの JAR で複数バッチジョブを切り替え実行する BatchDispatcher を Properties ファイルとリフレクションで実装し、Java 8/17/21 対応で運用方法を解説する。",
  lead: "バッチジョブが増えるたびに JAR を分けていると、ビルド成果物の管理やデプロイ手順が煩雑になります。ジョブごとに main クラスを用意して起動スクリプトを書き分ける運用は、10 本を超えたあたりから保守コストが無視できなくなります。この記事では、1 つの JAR ファイルに全ジョブをまとめ、起動引数で渡す Properties ファイルの中身だけで実行対象を切り替える BatchDispatcher を実装します。Properties の `job.class` キーに書かれた完全修飾クラス名を `Class.forName` で読み込み、リフレクションで BatchJob のインスタンスを生成し、SimpleBatchRunner に渡して実行します。新しいジョブを追加するときは BatchJob 実装クラスを書いて Properties ファイルを追加するだけで済み、Dispatcher 本体も Runner も触る必要がありません。JP1 や cron から呼ぶ場合も、引数の Properties ファイルパスを差し替えるだけです。",
  useCases: [
    "10 本以上のバッチジョブを 1 つの JAR にまとめ、JP1 のジョブネットから Properties ファイル指定で起動する",
    "開発環境で複数ジョブの動作確認を 1 つの成果物で行い、ビルド・配布の手間を減らす",
    "ジョブ追加時に既存コードを一切変更せず、新規クラスと Properties ファイルの追加だけでリリースする",
  ],
  cautions: [
    "Class.forName はクラスパス上にクラスが存在しなければ ClassNotFoundException を投げる。fat JAR のビルド時に依存クラスが含まれているか確認すること",
    "リフレクションで生成するクラスには引数なしの public コンストラクタが必要。private や引数付きだと InstantiationException になる",
    "Properties の job.class に任意のクラス名を書けるため、BatchJob を実装していないクラスが指定される可能性がある。instanceof チェックを必ず入れること",
    "本番環境では Properties ファイルのパスに絶対パスを使うか、実行ディレクトリを固定する運用ルールを設けること",
    "Java 17 以降のモジュールシステムでは、対象クラスのパッケージが opens されている必要がある",
  ],
  relatedArticleSlugs: ["batch-framework-design", "batch-complete-framework", "batch-properties-config", "batch-basic-structure"],
  versionCoverage: {
    java8: "Class.forName + getDeclaredConstructor().newInstance() で十分に動作する。型チェックは instanceof で行い、キャストして利用する。",
    java17: "ServiceLoader を使えばリフレクションなしでジョブを発見できる。モジュール境界を超える場合は module-info.java に opens が必要。",
    java21: "ServiceLoader + record で設定を型安全に扱える。switch パターンマッチングでジョブ種別ごとの初期化分岐を簡潔に書ける。",
    java8Code: `// Java 8: リフレクションでジョブ生成
String className = config.getProperty("job.class");
Class<?> clazz = Class.forName(className);
Object instance = clazz.getDeclaredConstructor().newInstance();
if (!(instance instanceof BatchJob)) {
    throw new IllegalArgumentException(
        className + " は BatchJob を実装していません");
}
BatchJob job = (BatchJob) instance;`,
    java17Code: `// Java 17: ServiceLoader でリフレクション不要
ServiceLoader<BatchJob> loader = ServiceLoader.load(BatchJob.class);
var job = loader.stream()
    .filter(p -> p.type().getName().equals(className))
    .findFirst()
    .orElseThrow(() -> new IllegalArgumentException("未登録: " + className))
    .get();`,
    java21Code: `// Java 21: record で設定を型安全に + パターンマッチング
record DispatchConfig(String jobClass, String jobName, Properties extra) {}
var dc = new DispatchConfig(
    props.getProperty("job.class"),
    props.getProperty("job.name", "unknown"), props);
switch (dc) {
    case DispatchConfig(var cls, _, _) when cls == null
        -> throw new IllegalArgumentException("job.class 未設定");
    case DispatchConfig d -> runJob(d);
}`,
  },
  libraryComparison: [
    { name: "Pure Java（BatchDispatcher）", whenToUse: "ジョブ数が数十本程度で、起動方法を統一したい場合。Properties + リフレクションで十分。", tradeoff: "ジョブ間の依存解決や起動順序の制御は自前で実装する必要がある。" },
    { name: "Spring Batch + CommandLineRunner", whenToUse: "Spring Boot ベースでジョブ選択・パラメータ管理・実行履歴を一元管理したい場合。", tradeoff: "Spring Boot の起動オーバーヘッドと依存が増える。" },
    { name: "picocli + 自前ディスパッチ", whenToUse: "コマンドライン引数の解析を型安全に行い、サブコマンドでジョブを切り替えたい場合。", tradeoff: "picocli 依存が追加。ジョブ追加時に main クラスの修正が必要。" },
  ],
  faq: [
    { question: "fat JAR にまとめる方法は何が適切ですか。", answer: "maven-shade-plugin や gradle の shadowJar が定番です。Main-Class に BatchDispatcher を指定すれば java -jar で起動できます。" },
    { question: "リフレクションを使わずにジョブを切り替える方法はありますか。", answer: "Map にジョブ名とインスタンスを登録する方法が最も単純です。ただしジョブ追加のたびに Map の修正が必要になります。" },
    { question: "Properties ファイルではなく引数でクラス名を直接渡す設計はどうですか。", answer: "可能ですが、ジョブ固有のパラメータも引数で管理することになり煩雑です。Properties にまとめる方が運用しやすいです。" },
  ],
  codeTitle: "BatchDispatcher — 1 JAR 複数ジョブのディスパッチャー",
  codeSample: `import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

interface BatchJob {
    void initialize(JobContext context) throws Exception;
    ExitCode execute(JobContext context) throws Exception;
    void terminate(JobContext context);
}

enum ExitCode {
    SUCCESS(0), WARNING(1), ERROR(2);
    private final int code;
    ExitCode(int code) { this.code = code; }
    public int getCode() { return code; }
}

class JobContext {
    private final String jobName;
    private final Properties properties;
    private final Map<String, Object> attributes = new HashMap<String, Object>();
    private long startTimeMillis;

    public JobContext(String jobName, Properties properties) {
        this.jobName = jobName;
        this.properties = properties;
    }
    public String getJobName() { return jobName; }
    public String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
    public void setAttribute(String key, Object value) { attributes.put(key, value); }
    @SuppressWarnings("unchecked")
    public <T> T getAttribute(String key, Class<T> type) {
        Object v = attributes.get(key);
        return (v != null && type.isInstance(v)) ? (T) v : null;
    }
    public long getStartTimeMillis() { return startTimeMillis; }
    public void setStartTimeMillis(long v) { this.startTimeMillis = v; }
}

class SimpleBatchRunner {
    private static final Logger LOGGER = Logger.getLogger(SimpleBatchRunner.class.getName());

    public ExitCode run(BatchJob job, JobContext context) {
        ExitCode exitCode = ExitCode.ERROR;
        context.setStartTimeMillis(System.currentTimeMillis());
        LOGGER.info("[" + context.getJobName() + "] ジョブ開始");
        try {
            job.initialize(context);
            exitCode = job.execute(context);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "[" + context.getJobName() + "] エラー", e);
        } finally {
            try { job.terminate(context); } catch (Exception e) {
                LOGGER.log(Level.WARNING, "後処理エラー", e);
            }
            long elapsed = System.currentTimeMillis() - context.getStartTimeMillis();
            LOGGER.info("[" + context.getJobName() + "] 終了 ("
                + elapsed + "ms) コード: " + exitCode.getCode());
        }
        return exitCode;
    }
}

// ===== サンプルジョブ 1: CSV取込 =====
class CsvImportJob implements BatchJob {
    @Override
    public void initialize(JobContext ctx) throws Exception {
        String inputFile = ctx.getProperty("input.file", "");
        if (inputFile.isEmpty()) {
            throw new IllegalArgumentException("input.file が設定されていません");
        }
        ctx.setAttribute("inputFile", inputFile);
    }

    @Override
    public ExitCode execute(JobContext ctx) throws Exception {
        String inputFile = ctx.getAttribute("inputFile", String.class);
        int count = 0;
        java.io.BufferedReader reader = new java.io.BufferedReader(
            new java.io.FileReader(inputFile));
        try {
            while (reader.readLine() != null) { count++; }
        } finally { reader.close(); }
        ctx.setAttribute("processedCount", Integer.valueOf(count));
        return ExitCode.SUCCESS;
    }

    @Override
    public void terminate(JobContext ctx) {
        Integer count = ctx.getAttribute("processedCount", Integer.class);
        System.out.println("CSV取込完了: " + (count != null ? count : 0) + " 件");
    }
}

// ===== サンプルジョブ 2: レポート出力 =====
class ReportExportJob implements BatchJob {
    @Override
    public void initialize(JobContext ctx) throws Exception {
        ctx.setAttribute("outputDir", ctx.getProperty("output.dir", "."));
    }

    @Override
    public ExitCode execute(JobContext ctx) throws Exception {
        String outputDir = ctx.getAttribute("outputDir", String.class);
        String path = outputDir + "/report_" + System.currentTimeMillis() + ".txt";
        java.io.FileWriter writer = new java.io.FileWriter(path);
        try {
            writer.write("日次売上レポート\\n");
            writer.write("生成日時: " + new java.util.Date() + "\\n");
        } finally { writer.close(); }
        ctx.setAttribute("reportPath", path);
        return ExitCode.SUCCESS;
    }

    @Override
    public void terminate(JobContext ctx) {
        String path = ctx.getAttribute("reportPath", String.class);
        System.out.println("レポート出力完了: " + (path != null ? path : "未生成"));
    }
}

// ===== ディスパッチャー本体 =====
public class BatchDispatcher {
    private static final Logger LOGGER = Logger.getLogger(BatchDispatcher.class.getName());

    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("使い方: java -jar batch.jar <properties-file-path>");
            System.err.println("例: java -jar batch.jar config/csv-import.properties");
            System.exit(ExitCode.ERROR.getCode());
            return;
        }

        // 1. Properties ファイル読み込み
        String propsPath = args[0];
        Properties props = new Properties();
        FileInputStream fis = null;
        try {
            fis = new FileInputStream(propsPath);
            props.load(fis);
        } catch (IOException e) {
            System.err.println("設定ファイル読込失敗: " + propsPath);
            e.printStackTrace();
            System.exit(ExitCode.ERROR.getCode());
            return;
        } finally {
            if (fis != null) { try { fis.close(); } catch (IOException ignored) {} }
        }

        // 2. ジョブクラス名と表示名を取得
        String jobClassName = props.getProperty("job.class");
        String jobName = props.getProperty("job.name", "unknown");

        if (jobClassName == null || jobClassName.trim().isEmpty()) {
            System.err.println("job.class が未定義: " + propsPath);
            System.exit(ExitCode.ERROR.getCode());
            return;
        }

        LOGGER.info("ディスパッチ: job.class=" + jobClassName + ", job.name=" + jobName);

        // 3. リフレクションで BatchJob インスタンスを生成
        BatchJob job;
        try {
            Class<?> clazz = Class.forName(jobClassName.trim());
            Object instance = clazz.getDeclaredConstructor().newInstance();
            if (!(instance instanceof BatchJob)) {
                System.err.println(jobClassName + " は BatchJob を実装していません");
                System.exit(ExitCode.ERROR.getCode());
                return;
            }
            job = (BatchJob) instance;
        } catch (ClassNotFoundException e) {
            System.err.println("クラスが見つかりません: " + jobClassName);
            System.exit(ExitCode.ERROR.getCode());
            return;
        } catch (NoSuchMethodException e) {
            System.err.println("引数なしコンストラクタがありません: " + jobClassName);
            System.exit(ExitCode.ERROR.getCode());
            return;
        } catch (Exception e) {
            System.err.println("インスタンス化失敗: " + jobClassName);
            e.printStackTrace();
            System.exit(ExitCode.ERROR.getCode());
            return;
        }

        // 4. ジョブ実行
        JobContext context = new JobContext(jobName, props);
        SimpleBatchRunner runner = new SimpleBatchRunner();
        ExitCode exitCode = runner.run(job, context);

        LOGGER.info("ディスパッチ完了: " + jobName + " -> " + exitCode.name());
        System.exit(exitCode.getCode());
    }
}

/*
 * === Properties ファイル例 ===
 *
 * --- config/csv-import.properties ---
 * job.class=CsvImportJob
 * job.name=日次CSV取込
 * input.file=/data/import/daily_sales.csv
 *
 * --- config/report-export.properties ---
 * job.class=ReportExportJob
 * job.name=日次レポート出力
 * output.dir=/data/reports
 *
 * === 起動例 ===
 * java -jar batch.jar config/csv-import.properties
 * java -jar batch.jar config/report-export.properties
 *
 * === cron 設定例 ===
 * 0 2 * * * cd /opt/batch && java -jar batch.jar config/csv-import.properties
 * 0 6 * * * cd /opt/batch && java -jar batch.jar config/report-export.properties
 */`,
},
]
