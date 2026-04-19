import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "logging-basics",
    title: "Java 標準ロガー java.util.logging の実装入門",
    categorySlug: "logging",
    summary: "java.util.logging のレベル設計・ハンドラー設定・例外ログの正しい書き方を整理する。",
    version: "Java 17",
    tags: ["ログ", "java.util.logging", "Logger", "ログレベル", "ハンドラー"],
    apiNames: ["Logger", "Level", "ConsoleHandler", "SimpleFormatter", "Logger.log"],
    description: "java.util.logging を使ったログ出力の基本設計を、レベルの使い分け・例外ログ・遅延評価まで含めて外部ライブラリ不要で Java 8/17/21 対応で解説する。",
    lead: "ログは障害調査の生命線です。運用中に問題が起きたとき、適切なログが残っていなければ原因の特定に何時間もかかることがあります。Java には java.util.logging（JUL）が標準で組み込まれており、外部ライブラリなしでログ出力の基盤を作れます。ただし、JUL はデフォルト設定のまま使うと INFO 未満のログが出力されない、ルートロガーとの二重出力が発生する、例外のスタックトレースが切れるなど、意図しない挙動に悩まされることが少なくありません。この記事では、ロガーの取得とハンドラーの設定、ログレベル（SEVERE〜FINEST）の使い分けの基準、例外をスタックトレースごと記録する正しい方法、そしてデバッグログの遅延評価によるパフォーマンス配慮までを一通り整理します。業務システムで最低限押さえておくべきログ設計の出発点として使ってください。",
    useCases: [
      "業務バッチの開始・終了・処理件数を INFO レベルで記録し、夜間バッチの正常完了を運用チームが確認できるようにする",
      "例外発生時に SEVERE レベルでスタックトレースごとログに残し、障害調査で原因箇所を特定する",
      "パフォーマンスチューニング時に FINE レベルでSQL実行時間を記録し、通常運用時はログに出さない切り替えを行う",
    ],
    cautions: [
      "Logger.getLogger(\"\") でルートロガーを取得してハンドラーを追加すると、全ロガーに影響する。クラス専用のロガーに addHandler し、setUseParentHandlers(false) で親への伝播を止めるのが安全",
      "logger.info(\"値: \" + expensiveComputation()) のように書くと、INFO が無効でも文字列結合と関数呼び出しが実行される。isLoggable() で事前チェックするか、ラムダ版の log メソッドを使うこと",
      "e.printStackTrace() はログフレームワークを経由せず標準エラーに直接出力するため、ログレベル制御もファイル出力もできない。必ず logger.log(Level.SEVERE, message, e) を使うこと",
      "ConsoleHandler のデフォルトレベルは INFO のため、ロガーを ALL に設定しても FINE 以下は出力されない。ハンドラー側のレベルも合わせて設定する必要がある",
      "ロガー名にはクラスの完全修飾名を使うのが慣例。パッケージ階層に沿ったロガーツリーが構成され、レベルの一括変更やフィルタリングがしやすくなる",
    ],
    relatedArticleSlugs: ["exception-chain"],
    versionCoverage: {
      java8: "API 自体は同じだが、ラムダベースの遅延ログ（logger.fine(() -> ...))は Java 8 から利用可能。var は使えず型宣言が冗長になる。",
      java17: "var でハンドラーやロガーの宣言が簡潔になる。record でログエントリを構造化すると、まとめてログ出力するパターンが書きやすくなる。",
      java21: "sealed interface と switch パターンマッチングで、業務ログ・デバッグログ・監査ログといったカスタムレベルの分岐を型安全に記述できる。System.Logger との統合も視野に入る。",
      java8Code: `// Java 8: 型を明示的に宣言してロガー設定
Logger logger = Logger.getLogger(MyClass.class.getName());
ConsoleHandler handler = new ConsoleHandler();
handler.setLevel(Level.ALL);
logger.addHandler(handler);
logger.setUseParentHandlers(false);
// 遅延評価（Java 8 ラムダ）
logger.fine(() -> "詳細: " + expensiveCall());`,
      java17Code: `// Java 17: var + record でログエントリを構造化
var logger = Logger.getLogger(MyClass.class.getName());
record LogEntry(Level level, String message) {}
var entries = List.of(
    new LogEntry(Level.INFO, "処理開始"),
    new LogEntry(Level.INFO, "処理完了")
);
entries.forEach(e -> logger.log(e.level(), e.message()));`,
      java21Code: `// Java 21: sealed interface でログ種別を型安全に表現
sealed interface LogKind {
    record App()   implements LogKind {}
    record Debug() implements LogKind {}
    record Audit() implements LogKind {}
}
var julLevel = switch (kind) {
    case LogKind.App a   -> Level.INFO;
    case LogKind.Debug d -> Level.FINE;
    case LogKind.Audit a -> Level.SEVERE;
};`,
    },
    libraryComparison: [
      { name: "標準 API（java.util.logging）", whenToUse: "外部依存なしでログ出力を実装したいとき。小規模プロジェクトやプロトタイプで十分に機能する。", tradeoff: "設定が XML ベースで直感的でなく、SLF4J や Logback に比べて柔軟性が劣る。大規模プロジェクトでは物足りなくなることがある。" },
      { name: "SLF4J + Logback", whenToUse: "ファサードパターンでログ実装を切り替え可能にしたいとき。MDC やマーカーなど高度な機能も使える。", tradeoff: "依存が増えるが、業務システムではデファクトスタンダード。JUL からの移行パスも用意されている。" },
      { name: "Log4j2", whenToUse: "非同期ログや構造化ログ（JSON 出力）が必要なとき。高スループットのアプリケーションに適している。", tradeoff: "設定の複雑さと過去の脆弱性（Log4Shell）のイメージがある。最新バージョンでは修正済みだが、セキュリティレビューでの説明コストが発生する場合がある。" },
    ],
    faq: [
      { question: "java.util.logging と SLF4J のどちらを使うべきですか。", answer: "チームやプロジェクトで既に SLF4J + Logback が導入されているならそちらに合わせます。依存なしで始めたい場合や小規模なツールでは JUL で十分です。" },
      { question: "ログレベルの FINE と FINER と FINEST はどう使い分けますか。", answer: "FINE はデバッグ情報、FINER はメソッドの入口・出口、FINEST は変数値のトレースという使い分けが一般的です。ただし実務では FINE と INFO の2段階で運用するケースが大半です。" },
      { question: "ログにスタックトレースを含めるにはどうしますか。", answer: "logger.log(Level.SEVERE, \"エラー内容\", exception) のように、第3引数に Throwable を渡します。これでスタックトレース全体がログに記録されます。" },
    ],
    codeTitle: "LoggingBasicsExample.java",
    codeSample: `import java.util.List;
import java.util.logging.*;

public class LoggingBasicsExample {

    private static final Logger logger =
            Logger.getLogger(LoggingBasicsExample.class.getName());

    record LogEntry(Level level, String message) {}

    /** コンソールハンドラーを設定 */
    public static void setupLogger() {
        // ルートロガーのデフォルトハンドラーを除去
        var rootLogger = Logger.getLogger("");
        for (var handler : rootLogger.getHandlers()) {
            rootLogger.removeHandler(handler);
        }

        var consoleHandler = new ConsoleHandler();
        consoleHandler.setLevel(Level.ALL);
        consoleHandler.setFormatter(new SimpleFormatter());

        logger.addHandler(consoleHandler);
        logger.setLevel(Level.ALL);
        logger.setUseParentHandlers(false);
    }

    /** 各ログレベルの出力例 */
    public static void demonstrateLevels() {
        var entries = List.of(
                new LogEntry(Level.SEVERE, "システム障害・即時対応が必要"),
                new LogEntry(Level.WARNING, "想定外だが処理は継続可能"),
                new LogEntry(Level.INFO, "正常な業務ログ"),
                new LogEntry(Level.FINE, "デバッグ情報")
        );
        entries.forEach(e -> logger.log(e.level(), e.message()));
    }

    /** 例外をスタックトレースごとログに記録 */
    public static void logWithException() {
        try {
            int result = 10 / 0;
            System.out.println(result);
        } catch (ArithmeticException e) {
            // e.printStackTrace() は使わない
            logger.log(Level.SEVERE, "計算処理でエラー発生", e);
        }
    }

    /** デバッグログの遅延評価 */
    public static void lazyLogging() {
        // isLoggable で事前チェックし、不要な文字列結合を回避
        if (logger.isLoggable(Level.FINE)) {
            logger.fine("タイムスタンプ: " + System.currentTimeMillis());
        }
    }

    public static void main(String[] args) {
        setupLogger();
        logger.info("アプリケーション起動");
        demonstrateLevels();
        logWithException();
        lazyLogging();
        logger.info("アプリケーション終了");
    }
}`,
  },
{
    slug: "exception-chain",
    title: "Java 例外チェーンの設計と原因追跡の実装パターンを実例で解説",
    categorySlug: "logging",
    summary: "カスタム例外のラップ・getCause による原因追跡・正しいログ記録の実装パターン。",
    version: "Java 17",
    tags: ["例外", "例外チェーン", "getCause", "カスタム例外", "障害調査"],
    apiNames: ["Throwable.getCause", "Exception", "Logger.log"],
    description: "Java の例外チェーンを使ったレイヤー間の例外ラップと原因追跡の実装パターンを、ログ設計も含めて外部ライブラリ不要で Java 8/17/21 対応で解説する。",
    lead: "業務システムでは、DB 層で発生した SQLException をサービス層で ServiceException にラップし、さらにコントローラー層で適切なエラーレスポンスに変換する、というレイヤードな例外設計が一般的です。このとき、原因例外（cause）を保持しないままラップすると、障害調査で根本原因にたどり着けなくなります。Java の例外チェーン機構は、Throwable のコンストラクタに cause を渡すことで、例外の因果関係をスタックトレースに残す仕組みです。カスタム例外の定義方法、cause の正しい渡し方、getCause() でチェーンを辿って原因を特定するコード、例外をログに記録する際の注意点を整理した。e.printStackTrace() を使ってはいけない理由や、例外を握りつぶすアンチパターンについても取り上げる。",
    useCases: [
      "DB アクセス層で発生した SQLException を DataAccessException にラップし、サービス層に業務レベルのエラーとして伝播する",
      "障害発生時にログから例外チェーンを辿り、ServiceException → DataAccessException → SQLException という因果関係を追跡する",
      "外部 API 呼び出しで IOException が発生した際、リトライ対象かどうかを cause の型で判定する",
    ],
    cautions: [
      "例外をラップするときは必ず cause を渡すこと。new ServiceException(\"エラー\") のように cause なしで投げると、原因例外のスタックトレースが完全に失われる",
      "catch ブロックで例外を握りつぶす（catch して何もしない）と、障害の兆候が見えなくなる。最低限 logger.log(Level.WARNING, ..., e) で記録すること",
      "e.printStackTrace() はログフレームワークを経由しないため、出力先やフォーマットの制御ができない。運用環境では必ず Logger 経由で記録する",
      "getCause() のチェーンが循環することは通常ないが、不正な実装で自分自身を cause にセットすると無限ループになる。ライブラリ内部の例外を再ラップする場合は cause の中身を確認すること",
      "例外クラスを細分化しすぎると catch ブロックが増えて可読性が下がる。レイヤーごとに1〜2種類の例外に集約するのが実務的なバランス",
      "障害調査で「ログに例外が出ていない」というケースの多くは、catch してメッセージだけ記録し cause を渡していないことが原因。例外をラップするコードには必ずレビューで cause の有無を確認する習慣をつけること。",
    ],
    relatedArticleSlugs: ["logging-basics"],
    versionCoverage: {
      java8: "例外チェーンの仕組み自体は Java 1.4 からあり、Java 8 でも同じように使える。原因追跡のユーティリティは while ループで getCause() を辿る形になる。",
      java17: "record で ExceptionInfo（型名・メッセージ）を定義し、チェーンの情報をリストとして構造化できる。var で変数宣言が簡潔になる。",
      java21: "switch 式のパターンマッチングで例外の型に応じた処理を簡潔に分岐できる。record でチェーン情報を構造化して収集するコードが自然に書ける。",
      java8Code: `// Java 8: while ループで例外チェーンを辿る
Throwable current = exception;
int depth = 0;
while (current != null) {
    StringBuilder indent = new StringBuilder("  ");
    for (int i = 0; i < depth; i++) indent.append("  ");
    System.out.println(indent
        + current.getClass().getSimpleName()
        + ": " + current.getMessage());
    current = current.getCause();
    depth++;
}`,
      java17Code: `// Java 17: record で例外情報を構造化
record ExceptionInfo(String type, String message) {}
var chain = new ArrayList<ExceptionInfo>();
var current = exception;
while (current != null) {
    chain.add(new ExceptionInfo(
        current.getClass().getSimpleName(),
        current.getMessage()));
    current = current.getCause();
}`,
      java21Code: `// Java 21: switch パターンマッチングで例外の型に応じて処理を分岐
// (Java 21 から switch で型を直接テストできる)
String handler = switch (rootCause) {
    case SQLException e  -> "DB: " + e.getSQLState();
    case IOException e   -> "IO: " + e.getMessage();
    case RuntimeException e -> "Runtime: " + e.getMessage();
    default -> "Unknown: " + rootCause.getClass().getSimpleName();
};
logger.log(Level.SEVERE, handler, rootCause);`,
    },
    libraryComparison: [
      { name: "標準 API（Throwable チェーン）", whenToUse: "例外の因果関係を保持してレイヤー間で伝播するだけなら標準の仕組みで十分。追加の依存なしで動作する。", tradeoff: "例外チェーンの解析やフォーマット変換は自前で実装する必要がある。" },
      { name: "Apache Commons Lang（ExceptionUtils）", whenToUse: "getRootCause()・getStackTrace() など、例外チェーンの操作ユーティリティが欲しいとき。", tradeoff: "自前で getCause() を辿る10行程度のコードで代替できる場合が多く、導入の判断は規模次第。" },
      { name: "SLF4J + Logback", whenToUse: "例外ログの出力先やフォーマットを柔軟に制御したいとき。MDC によるリクエスト単位のトレースも可能。", tradeoff: "例外チェーンの仕組み自体は標準 API のもの。ログフレームワークが提供するのはログ出力の品質向上。" },
    ],
    faq: [
      { question: "例外をラップするときに元のメッセージは含めるべきですか。", answer: "ラップ側のメッセージは業務的な文脈（何をしようとして失敗したか）を書き、元の例外は cause として渡します。cause のメッセージはスタックトレースに自動的に含まれるため、重複させる必要はありません。" },
      { question: "getCause() で根本原因まで辿るにはどうしますか。", answer: "while (current.getCause() != null) { current = current.getCause(); } のように、getCause() が null を返すまで辿ります。最後に残った例外が根本原因（root cause）です。" },
      { question: "カスタム例外は checked と unchecked のどちらにすべきですか。", answer: "呼び出し側に回復処理を期待する場合は checked（Exception 継承）、プログラムバグや回復不能なエラーは unchecked（RuntimeException 継承）が一般的な基準です。業務システムでは checked を使うケースが多いです。" },
    ],
    codeTitle: "ExceptionChainExample.java",
    codeSample: `import java.util.*;
import java.util.logging.*;

public class ExceptionChainExample {

    private static final Logger logger =
            Logger.getLogger(ExceptionChainExample.class.getName());

    record ExceptionInfo(String type, String message) {}

    /** カスタム例外: データアクセス層 */
    static class DataAccessException extends Exception {
        public DataAccessException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /** カスタム例外: サービス層 */
    static class ServiceException extends Exception {
        public ServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /** DB アクセス層: 低レベル例外を DataAccessException にラップ */
    public static String findUser(int id) throws DataAccessException {
        try {
            if (id <= 0) {
                throw new IllegalArgumentException(
                        "ID は1以上を指定: " + id);
            }
            if (id > 100) {
                throw new RuntimeException("DB 接続タイムアウト");
            }
            return "User-" + id;
        } catch (Exception e) {
            throw new DataAccessException(
                    "ユーザー取得失敗: id=" + id, e);
        }
    }

    /** サービス層: DataAccessException を ServiceException にラップ */
    public static String getUserDisplayName(int id)
            throws ServiceException {
        try {
            return findUser(id).toUpperCase();
        } catch (DataAccessException e) {
            throw new ServiceException(
                    "ユーザー表示名の取得に失敗", e);
        }
    }

    /** 例外チェーンを辿って情報リストを構築 */
    public static List<ExceptionInfo> buildChain(Throwable e) {
        var chain = new ArrayList<ExceptionInfo>();
        var current = e;
        while (current != null) {
            chain.add(new ExceptionInfo(
                    current.getClass().getSimpleName(),
                    current.getMessage()));
            current = current.getCause();
        }
        return chain;
    }

    /** 例外チェーンをインデント付きで表示 */
    public static void printChain(Throwable e) {
        var chain = buildChain(e);
        for (int i = 0; i < chain.size(); i++) {
            var info = chain.get(i);
            System.out.println("  " + "  ".repeat(i)
                    + info.type() + ": " + info.message());
        }
    }

    public static void main(String[] args) {
        // 正常系
        try {
            System.out.println(getUserDisplayName(1));
        } catch (ServiceException e) {
            logger.log(Level.SEVERE, "サービスエラー", e);
        }

        // DB タイムアウト → 例外チェーン表示
        try {
            getUserDisplayName(200);
        } catch (ServiceException e) {
            System.out.println("例外チェーン:");
            printChain(e);
            logger.log(Level.SEVERE, "ユーザー取得エラー", e);
        }

        // 引数エラー → 例外チェーン表示
        try {
            getUserDisplayName(-1);
        } catch (ServiceException e) {
            System.out.println("例外チェーン:");
            printChain(e);
        }
    }
}`,
  },
]
