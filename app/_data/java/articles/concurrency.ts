import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "atomic-counter",
  title: "Java AtomicLong で安全な採番を実装する方法と使い分け",
  categorySlug: "concurrency",
  summary: "AtomicLong と LongAdder の使い分け、注文番号の連番生成をスレッドセーフに実装する。",
  version: "Java 17",
  tags: ["AtomicLong", "LongAdder", "CAS", "採番", "スレッドセーフ"],
  apiNames: ["AtomicLong", "LongAdder", "AtomicLong.incrementAndGet", "AtomicLong.compareAndSet", "LongAdder.increment", "LongAdder.sum"],
  description: "AtomicLong と LongAdder を使ったスレッドセーフな採番の実装方法を Java 8/17/21 対応で解説する。CAS の仕組みと使い分けの判断基準も整理する。",
  lead: "業務システムでは注文番号やリクエストIDなど、複数スレッドから同時にアクセスされるカウンターが必要になる場面があります。単純な long++ は「読み取り・加算・書き込み」の3ステップで構成されており、複数スレッドが同時に実行すると番号の重複や欠番が発生します。synchronized で囲む方法もありますが、Java には CAS（Compare-And-Swap）命令を利用した AtomicLong や、高並行環境向けの LongAdder といった専用クラスが用意されています。この記事では、それぞれの仕組みと特性を整理したうえで、注文番号生成やアクセスカウンターといった実務パターンに応じた選び方を示します。外部ライブラリなしで動く完結したコードを通じて、競合状態を起こさない採番の設計を押さえます。",
  useCases: [
    "注文番号やリクエストIDなど、JVM 内で一意な連番をマルチスレッド環境から安全に払い出す",
    "API ゲートウェイのアクセスカウンターを LongAdder で集計し、定期的に合計値をログ出力する",
    "バッチ処理の進捗カウンターを AtomicLong で管理し、複数ワーカースレッドから処理済み件数を加算する",
  ],
  cautions: [
    "AtomicLong は単一 JVM 内でのみ有効。複数サーバーで共通の採番が必要な場合は DB 採番やRedis INCR 等の外部手段が必要になる",
    "LongAdder の sum() は呼び出し時点の近似値を返す。他スレッドが加算中だと厳密な瞬間値にはならないため、連番の一意性が必要な用途には AtomicLong を使うこと",
    "AtomicLong.compareAndSet を使ったリトライループは、競合が多い環境ではスピンが増えて CPU を消費する。高頻度なカウントには LongAdder を検討する",
    "JVM 再起動でカウンターはリセットされる。永続化が必要なら初期値を DB やファイルから読み込む設計にする",
    "AtomicLong のインスタンスを複数スレッドが共有するには、フィールドを static final にするかコンストラクタ注入で渡す。ローカル変数に作っても意味がない",
  ],
  relatedArticleSlugs: ["db-atomic-counter", "thread-basics", "synchronized-basics"],
  versionCoverage: {
    java8: "AtomicLong と LongAdder の両方が利用可能。ExecutorService と CountDownLatch で並行テストを組む基本形は Java 8 から変わらない。",
    java17: "var による型推論、record での結果保持、switch 式による使い分け判定など、コードの簡潔さが向上する。AtomicLong のAPI自体に変更はない。",
    java21: "Virtual Threads（仮想スレッド）で大量の軽量スレッドを生成でき、並行テストのスレッド数を桁違いに増やせる。sealed interface でカウンター戦略を型安全に表現可能。",
    java8Code: `// Java 8: ExecutorService + CountDownLatch で並行テスト
ExecutorService pool = Executors.newFixedThreadPool(100);
CountDownLatch latch = new CountDownLatch(100);
AtomicLong counter = new AtomicLong(0);
for (int i = 0; i < 100; i++) {
    pool.submit(() -> {
        counter.incrementAndGet();
        latch.countDown();
    });
}
latch.await();
pool.shutdown();`,
    java17Code: `// Java 17: var + record で簡潔に
var counter = new AtomicLong(0);
var pool = Executors.newFixedThreadPool(100);
record CounterResult(long value, String type) {}
// switch 式で用途に応じた推奨を返す
String rec = switch (useCase) {
    case ORDER_NUMBER -> "AtomicLong";
    case ACCESS_COUNT -> "LongAdder";
};`,
    java21Code: `// Java 21: Virtual Threads で 1000 スレッドも軽量に
var counter = new AtomicLong(0);
try (var pool = Executors
        .newVirtualThreadPerTaskExecutor()) {
    for (var i = 0; i < 1000; i++) {
        pool.submit(counter::incrementAndGet);
    }
} // try-with-resources で自動 shutdown`,
  },
  libraryComparison: [
    { name: "標準 API（AtomicLong / LongAdder）", whenToUse: "単一 JVM 内の採番やカウント。依存なしで十分な性能が得られる。", tradeoff: "複数 JVM 間での一意性は保証されない。永続化も自前で行う必要がある。" },
    { name: "Redis INCR", whenToUse: "複数サーバー間で共通の連番を払い出す必要がある場合。", tradeoff: "Redis への接続が必要。ネットワーク遅延が加算されるため、JVM 内で完結する場合には過剰。" },
    { name: "DB シーケンス（SEQUENCE / 採番テーブル）", whenToUse: "永続化と複数 JVM 対応を同時に満たす必要がある場合。", tradeoff: "DB アクセスのオーバーヘッドがあるため、高頻度の採番にはバッチ取得の工夫が必要。" },
  ],
  faq: [
    { question: "AtomicLong と LongAdder はどう使い分けるべきですか。", answer: "連番の一意性が必要なら AtomicLong、多スレッドからの高頻度な加算で最終合計が正確であれば良い場面では LongAdder を選んでください。LongAdder は内部でセルを分散させるため競合が少なくなります。" },
    { question: "AtomicLong.get() は他スレッドの更新を即座に反映しますか。", answer: "はい。AtomicLong は volatile と CAS を使っているため、get() は最新の値を返します。ただし get() の直後に別スレッドが更新する可能性はあるため、get してから set する操作はアトミックではありません。" },
    { question: "compareAndSet のリトライループはどの程度のスレッド数まで実用的ですか。", answer: "数十スレッド程度なら問題になりません。数百以上で常時競合するような環境ではスピン回数が増えるため、LongAdder や synchronized ブロックへの切り替えを検討してください。" },
  ],
  codeTitle: "AtomicCounterDemo.java",
  codeSample: `import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;

public class AtomicCounterDemo {

    /** 注文番号を AtomicLong で安全に生成するシングルトン */
    static class OrderNumberGenerator {
        private static final AtomicLong sequence = new AtomicLong(10000);

        public static String next() {
            return "ORD-" + sequence.incrementAndGet();
        }

        public static long current() {
            return sequence.get();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        int threads = 100;
        int incrementsPerThread = 1000;
        long expected = (long) threads * incrementsPerThread;

        var counter = new AtomicLong(0);
        var pool = Executors.newFixedThreadPool(threads);
        var latch = new CountDownLatch(threads);

        for (var i = 0; i < threads; i++) {
            pool.submit(() -> {
                for (var j = 0; j < incrementsPerThread; j++) {
                    counter.incrementAndGet();
                }
                latch.countDown();
            });
        }
        latch.await();
        pool.shutdown();

        System.out.println("期待値: " + expected);
        System.out.println("AtomicLong 結果: " + counter.get()
            + (counter.get() == expected ? " -> 正確" : " -> 欠損あり"));

        var adder = new LongAdder();
        var pool2 = Executors.newFixedThreadPool(threads);
        var latch2 = new CountDownLatch(threads);

        for (var i = 0; i < threads; i++) {
            pool2.submit(() -> {
                for (var j = 0; j < incrementsPerThread; j++) {
                    adder.increment();
                }
                latch2.countDown();
            });
        }
        latch2.await();
        pool2.shutdown();

        System.out.println("LongAdder 結果: " + adder.sum()
            + (adder.sum() == expected ? " -> 正確" : " -> 欠損あり"));

        System.out.println("\\n--- 注文番号生成 ---");
        for (var i = 0; i < 5; i++) {
            System.out.println(OrderNumberGenerator.next());
        }
    }
}`,
},
{
  slug: "db-atomic-counter",
  title: "Java DB採番テーブルで複数サーバー対応の連番生成を実装する",
  categorySlug: "concurrency",
  summary: "採番テーブルと SELECT FOR UPDATE による複数 JVM 間で安全な連番生成を JDBC で実装する。",
  version: "Java 17",
  tags: ["採番テーブル", "JDBC", "SELECT FOR UPDATE", "トランザクション", "行ロック"],
  apiNames: ["Connection", "PreparedStatement", "ResultSet", "Connection.setAutoCommit", "Connection.commit", "Connection.rollback"],
  description: "DB 採番テーブルと SELECT FOR UPDATE を使い、複数サーバーから安全に連番を払い出す JDBC 実装を Java 8/17/21 対応で解説する。",
  lead: "AtomicLong は単一 JVM 内で完結する採番には最適ですが、複数サーバー（マルチ JVM）から同じ連番体系で採番する場合は使えません。このような場面では DB の採番テーブルに現在値を保持し、UPDATE 文の行ロックで排他制御を行う方式が広く採用されています。この記事では、UPDATE で直接インクリメントする方式と、SELECT FOR UPDATE で行をロックしてから更新する方式の2つを JDBC で実装します。それぞれのトランザクション制御の違い、デッドロックのリスク、コミットのタイミングといった現場で実際に判断が必要になるポイントを整理します。H2 インメモリ DB で動作確認できる完結したコードを示すため、手元ですぐに試せます。",
  useCases: [
    "複数の AP サーバーから共通の注文番号体系で採番し、番号の重複を DB の行ロックで防ぐ",
    "バッチサーバーと Web サーバーが同じ請求番号を使う構成で、採番テーブルを共有して一意性を担保する",
    "用途別（注文・請求・出荷）に採番行を分けて管理し、それぞれ独立した連番を払い出す",
  ],
  cautions: [
    "autoCommit が true のままだと UPDATE 直後にロックが解放され、SELECT で取得する値が他トランザクションの値になる可能性がある。必ず autoCommit=false で使うこと",
    "SELECT FOR UPDATE 方式は、同じテーブルの複数行を異なる順序でロックするとデッドロックのリスクがある。採番テーブルでは1行ずつ操作するのが原則",
    "採番テーブルへのアクセスは短時間で commit して行ロックを開放すること。長いトランザクションに含めると後続のリクエストが待たされる",
    "H2 のインメモリ DB はテスト用。本番では MySQL / PostgreSQL 等のドライバを CLASSPATH に追加し、接続文字列を変更する",
    "DB シーケンス（PostgreSQL の SEQUENCE、MySQL の AUTO_INCREMENT）が使える場合は採番テーブルより簡潔。テーブル方式は DB 非依存や用途別管理が必要な場合に選ぶ",
  ],
  relatedArticleSlugs: ["atomic-counter", "thread-basics", "synchronized-basics"],
  versionCoverage: {
    java8: "JDBC の基本操作は Java 8 から変わらない。try-with-resources で Connection と PreparedStatement を管理する。SQL 文字列は + 連結で組み立てる。",
    java17: "var で変数宣言を簡潔にし、テキストブロック（\"\"\"）で複数行 SQL を読みやすく書ける。トランザクションヘルパーを FunctionalInterface で汎用化できる。",
    java21: "sealed interface で採番結果（成功/失敗）を型安全に表現し、パターンマッチングで処理を分岐できる。例外を戻り値で表現する設計が自然に書ける。",
    java8Code: `// Java 8: 文字列連結で SQL を組み立て
String selectForUpdate =
    "SELECT current_val FROM seq_table "
    + "WHERE seq_name = ? FOR UPDATE";
try (PreparedStatement sel =
        conn.prepareStatement(selectForUpdate)) {
    sel.setString(1, seqName);
    try (ResultSet rs = sel.executeQuery()) {
        // ...
    }
}`,
    java17Code: `// Java 17: テキストブロックで SQL を読みやすく
var selectForUpdate = """
    SELECT current_val FROM seq_table
    WHERE seq_name = ? FOR UPDATE
    """;
try (var sel = conn.prepareStatement(selectForUpdate)) {
    sel.setString(1, seqName);
    try (var rs = sel.executeQuery()) {
        // ...
    }
}`,
    java21Code: `// Java 21: sealed interface で採番結果を型安全に
sealed interface SeqResult {
    record Success(String name, long val)
        implements SeqResult {}
    record Failure(String name, String reason)
        implements SeqResult {}
}
// パターンマッチングで処理
switch (result) {
    case Success(var n, var v) -> "ORD-" + v;
    case Failure(var n, var r) -> "ERROR: " + r;
}`,
  },
  libraryComparison: [
    { name: "標準 API（JDBC 採番テーブル）", whenToUse: "DB 非依存で用途別の採番行を管理したいとき。JDBC だけで完結し、追加依存がない。", tradeoff: "行ロックの管理と commit タイミングを自前で制御する必要がある。高頻度採番ではボトルネックになりやすい。" },
    { name: "DB ネイティブシーケンス（SEQUENCE / AUTO_INCREMENT）", whenToUse: "単一 DB 製品に依存してよい場合。シーケンスの管理を DB エンジンに任せられる。", tradeoff: "DB 製品間で構文が異なるため移植性が下がる。用途別の柔軟な管理には向かない場合がある。" },
    { name: "MyBatis / JPA", whenToUse: "O/R マッパーを導入済みで、採番も含めて統一的に管理したいとき。", tradeoff: "採番だけのために導入するのは過剰。既存の JDBC コードベースに後付けすると混在が複雑になる。" },
  ],
  faq: [
    { question: "UPDATE 方式と SELECT FOR UPDATE 方式はどちらを選ぶべきですか。", answer: "UPDATE 方式のほうが単純で安全です。SELECT FOR UPDATE は更新前の値を読み取る必要がある場合に使いますが、デッドロックのリスクが増えるため、採番だけなら UPDATE + SELECT の2文で済ませるのが無難です。" },
    { question: "採番テーブルが高負荷でボトルネックになった場合はどうしますか。", answer: "一度に複数番号を取得するバッチ採番（例: 100番分をまとめて UPDATE）が有効です。アプリ側でプールしておき、使い切ったら次のバッチを取得する方式で DB アクセス頻度を減らせます。" },
    { question: "JVM 再起動時に AtomicLong の初期値を DB から復元するにはどうすればよいですか。", answer: "起動時に採番テーブルの current_val を SELECT し、その値で AtomicLong を初期化します。DB 採番と JVM 内採番を併用する場合はバッチ取得方式にして、DB 側を正とするのが安全です。" },
  ],
  codeTitle: "DbAtomicCounterDemo.java",
  codeSample: `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DbAtomicCounterDemo {

    /** UPDATE 方式: 行を直接インクリメントして新しい値を取得 */
    public static long nextVal(Connection conn, String seqName)
            throws SQLException {
        var updateSql = "UPDATE seq_table SET current_val = current_val + 1 "
                      + "WHERE seq_name = ?";
        var selectSql = "SELECT current_val FROM seq_table WHERE seq_name = ?";

        try (var upd = conn.prepareStatement(updateSql);
             var sel = conn.prepareStatement(selectSql)) {

            upd.setString(1, seqName);
            if (upd.executeUpdate() == 0) {
                throw new SQLException("採番行が見つかりません: " + seqName);
            }
            sel.setString(1, seqName);
            try (var rs = sel.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("current_val");
                }
                throw new SQLException("採番値の取得に失敗: " + seqName);
            }
        }
    }

    /** SELECT FOR UPDATE 方式: 行ロック後に読み取り・更新 */
    public static long nextValWithLock(Connection conn, String seqName)
            throws SQLException {
        var selectForUpdate = """
                SELECT current_val FROM seq_table
                WHERE seq_name = ? FOR UPDATE
                """;
        var updateSql = """
                UPDATE seq_table SET current_val = ?
                WHERE seq_name = ?
                """;

        try (var sel = conn.prepareStatement(selectForUpdate);
             var upd = conn.prepareStatement(updateSql)) {

            sel.setString(1, seqName);
            long current;
            try (var rs = sel.executeQuery()) {
                if (!rs.next()) {
                    throw new SQLException("採番行が見つかりません: " + seqName);
                }
                current = rs.getLong("current_val");
            }
            var next = current + 1;
            upd.setLong(1, next);
            upd.setString(2, seqName);
            upd.executeUpdate();
            return next;
        }
    }

    /** トランザクションヘルパー */
    @FunctionalInterface
    interface TxWork<T> {
        T execute(Connection conn) throws SQLException;
    }

    public static <T> T runInTransaction(Connection conn, TxWork<T> work)
            throws SQLException {
        conn.setAutoCommit(false);
        try {
            T result = work.execute(conn);
            conn.commit();
            return result;
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        }
    }

    public static void main(String[] args) throws Exception {
        var url = "jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1";

        try (var conn = DriverManager.getConnection(url, "sa", "")) {
            // テーブル準備
            try (var st = conn.createStatement()) {
                st.execute("""
                    CREATE TABLE IF NOT EXISTS seq_table (
                      seq_name    VARCHAR(64) PRIMARY KEY,
                      current_val BIGINT NOT NULL DEFAULT 0
                    )
                    """);
            }
            conn.setAutoCommit(false);
            try (var ps = conn.prepareStatement(
                    "INSERT INTO seq_table (seq_name, current_val) VALUES (?, ?)")) {
                ps.setString(1, "ORDER_SEQ");
                ps.setLong(2, 10000);
                ps.executeUpdate();
            }
            conn.commit();

            // 採番テーブル方式で5回採番
            System.out.println("=== UPDATE 方式 ===");
            for (var i = 0; i < 5; i++) {
                var val = runInTransaction(conn,
                    c -> nextVal(c, "ORDER_SEQ"));
                System.out.println("注文番号: ORD-" + val);
            }
        }
    }
}`,
},
{
  slug: "out-of-memory",
  title: "Java OutOfMemoryError の原因パターンと対策まとめ",
  categorySlug: "concurrency",
  summary: "ヒープ枯渇・メモリリーク・StackOverflow の再現パターンと、JVM フラグによる調査方法を整理する。",
  version: "Java 17",
  tags: ["OutOfMemoryError", "StackOverflowError", "ヒープ", "メモリリーク", "JVM", "GC"],
  apiNames: ["WeakHashMap", "ArrayList", "HashMap", "Runtime.getRuntime", "Runtime.maxMemory", "Runtime.freeMemory"],
  description: "OutOfMemoryError と StackOverflowError の発生パターンを再現コードで示し、JVM フラグによる調査手法と回避策を Java 8/17/21 対応で解説する。",
  lead: "OutOfMemoryError はアプリケーションの安定稼働を脅かす深刻な問題ですが、発生してから慌てて対処するケースが多いのが実情です。原因は大きく分けて、ヒープの枯渇（大量オブジェクトの蓄積）、メモリリーク（static フィールドへの無限追加）、スタックオーバーフロー（終了条件のない再帰）の3パターンに分類できます。この記事では、それぞれのパターンを最小限のコードで再現し、発生メカニズムを確認したうえで、WeakHashMap による自動解放や再帰のループ変換といった具体的な回避策を示します。また、OOM 発生時にヒープダンプを自動取得する JVM フラグの設定方法も扱います。現場で OOM に遭遇したときに、原因の切り分けと初動対応を迷わず進められることを目指します。",
  useCases: [
    "本番環境で OOM が発生した際に、ヒープダンプを自動取得して Eclipse MAT で原因を特定する",
    "static Map にキャッシュデータを追加し続けるコードを WeakHashMap や容量上限付き LRU に置き換えてリークを防ぐ",
    "再帰処理で StackOverflowError が出た箇所をループに書き換えて安定動作させる",
  ],
  cautions: [
    "OutOfMemoryError は Error のサブクラスであり、通常の業務コードで catch してはいけない。catch しても JVM の状態が不安定なため、安全な後処理は保証されない",
    "StackOverflowError も Error であり、catch して握りつぶすと原因の特定が困難になる。デモ以外では catch しないこと",
    "WeakHashMap はキーへの強参照がなくなったときに GC がエントリを回収する。文字列リテラルをキーにすると定数プールに保持されて GC されないため効果がない",
    "-Xmx を大きくすれば OOM を回避できるとは限らない。メモリリークが原因の場合は GC 頻度が増えて応答性能が悪化し、最終的にはやはり OOM に至る",
    "ヒープダンプファイル（.hprof）はヒープサイズと同程度の容量になる。ディスク容量が不足するとダンプが不完全になるため、HeapDumpPath の指定先に十分な空きを確保すること",
  ],
  relatedArticleSlugs: ["atomic-counter", "db-atomic-counter", "thread-basics"],
  versionCoverage: {
    java8: "WeakHashMap や Runtime.getRuntime() による基本的なメモリ監視は Java 8 から利用可能。OOM 関連の JVM フラグも同様に使える。",
    java17: "record でセッションデータ等の値オブジェクトを定義すると、メモリリークのデモがより実務的になる。var で変数宣言が簡潔になる。",
    java21: "sealed interface でメモリ問題の種別（ヒープ枯渇・リーク・スタックオーバーフロー）を型安全に分類し、パターンマッチングで説明を返す設計が可能。",
    java8Code: `// Java 8: static Map への無限追加でメモリリーク
private static final Map<String, byte[]> CACHE
    = new HashMap<>();
public static void addToCache(String key, byte[] data) {
    CACHE.put(key, data); // 溜まり続けると OOM
}
// 対策: WeakHashMap に変更
private static final WeakHashMap<String, byte[]>
    WEAK_CACHE = new WeakHashMap<>();`,
    java17Code: `// Java 17: record でリーク対象を型安全に表現
record SessionData(String userId, byte[] payload) {}
private static final Map<String, SessionData> SESSIONS
    = new HashMap<>();
public static void register(String id, byte[] data) {
    SESSIONS.put(id, new SessionData(id, data));
    // 削除漏れがあると OOM の原因になる
}`,
    java21Code: `// Java 21: sealed interface で問題種別を分類
sealed interface MemoryIssue {
    record HeapExhaustion(String cause) implements MemoryIssue {}
    record MemoryLeak(String source)    implements MemoryIssue {}
    record StackOverflow(int depth)     implements MemoryIssue {}
}
String desc = switch (issue) {
    case HeapExhaustion(var c) -> "ヒープ: " + c;
    case MemoryLeak(var s) -> "リーク: " + s;
    case StackOverflow(var d) -> "再帰深さ: " + d;
};`,
  },
  libraryComparison: [
    { name: "標準 API（WeakHashMap / Runtime）", whenToUse: "メモリリークの回避や使用量の簡易モニタリング。追加依存なしで基本的な対策ができる。", tradeoff: "WeakHashMap はキーの参照管理が必要。本格的なキャッシュには容量制限やTTLの仕組みが不足する。" },
    { name: "Caffeine", whenToUse: "容量上限・TTL・統計情報付きの高性能キャッシュが必要なとき。", tradeoff: "依存追加が必要。小規模なキャッシュには過剰な場合がある。" },
    { name: "Eclipse MAT / VisualVM", whenToUse: "ヒープダンプを解析して OOM の原因オブジェクトを特定するとき。", tradeoff: "ライブラリではなく解析ツール。コードに組み込むものではないが、OOM 調査には不可欠。" },
  ],
  faq: [
    { question: "OutOfMemoryError が出たらまず何をすべきですか。", answer: "まず -XX:+HeapDumpOnOutOfMemoryError が設定されているか確認し、ヒープダンプを取得します。取得できたら Eclipse MAT で支配ツリー（Dominator Tree）を確認し、大量にメモリを占有しているオブジェクトを特定してください。" },
    { question: "-Xmx を増やすだけでは解決しないのですか。", answer: "メモリリークが原因の場合、ヒープを増やしても発生が遅れるだけで根本解決にはなりません。リークの原因（static Map への無限追加、クローズ漏れ等）を特定して修正することが必要です。" },
    { question: "再帰を使いたいが StackOverflowError が心配です。どう対策すべきですか。", answer: "再帰の深さが入力サイズに比例する場合はループに書き換えるのが安全です。Java は末尾再帰最適化（TCO）を行わないため、再帰が深くなる処理は原則としてループで実装してください。" },
  ],
  codeTitle: "OutOfMemoryDemo.java",
  codeSample: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.WeakHashMap;

public class OutOfMemoryDemo {

    /**
     * 実行すると OutOfMemoryError: Java heap space が発生。
     * 再現: java -Xmx64m OutOfMemoryDemo
     */
    public static void heapExhaustion() {
        var list = new ArrayList<byte[]>();
        while (true) {
            list.add(new byte[1024 * 1024]); // 1MB ずつ追加
        }
    }

    private static final Map<String, byte[]> CACHE = new HashMap<>();

    /** static Map に追加し続けると GC が解放できず OOM になる */
    public static void addToCache(String key, byte[] data) {
        CACHE.put(key, data);
    }

    private static final WeakHashMap<Object, byte[]> WEAK_CACHE
            = new WeakHashMap<>();

    /** キーへの強参照がなくなれば GC がエントリを削除する */
    public static void cacheWeakly(Object key, byte[] data) {
        WEAK_CACHE.put(key, data);
    }

    /** 終了条件なしの再帰 -> StackOverflowError */
    public static int infiniteRecursion(int n) {
        return infiniteRecursion(n + 1);
    }

    /** 再帰をループに書き換えた安全な実装 */
    public static long sumUpTo(long n) {
        long result = 0;
        for (long i = 1; i <= n; i++) {
            result += i;
        }
        return result;
    }

    public static List<String> recommendedFlags() {
        return List.of(
            "-Xmx256m",
            "-XX:+HeapDumpOnOutOfMemoryError",
            "-XX:HeapDumpPath=/tmp/dump.hprof"
        );
    }

    public static void main(String[] args) {
        // メモリ使用状況の表示
        var rt = Runtime.getRuntime();
        System.out.println("最大ヒープ: " + rt.maxMemory() / 1024 / 1024 + " MB");
        System.out.println("空きヒープ: " + rt.freeMemory() / 1024 / 1024 + " MB");

        // 推奨 JVM フラグ
        System.out.println("\\n=== 推奨 JVM フラグ ===");
        recommendedFlags().forEach(System.out::println);

        // StackOverflowError の安全なデモ
        System.out.println("\\n=== StackOverflowError を安全に捕捉 ===");
        try {
            infiniteRecursion(0);
        } catch (StackOverflowError e) {
            System.out.println("StackOverflowError を捕捉しました");
        }

        // ループ実装（安全）
        System.out.println("sumUpTo(100) = " + sumUpTo(100));
    }
}`,
},
]
