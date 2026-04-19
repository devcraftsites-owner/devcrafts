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
{
  slug: "completable-future-patterns",
  title: "Java CompletableFuture の実践パターン — 合成・例外処理・タイムアウト",
  categorySlug: "concurrency",
  summary: "thenApply/thenCompose/thenCombine の使い分け、例外処理パターン、allOf/anyOf による複数タスク合成、orTimeout の実践例を整理する。",
  version: "Java 17",
  tags: ["CompletableFuture", "非同期", "並行処理", "タイムアウト", "例外処理"],
  apiNames: ["CompletableFuture", "CompletableFuture.supplyAsync", "thenApply", "thenCompose", "thenCombine", "exceptionally", "handle", "allOf", "orTimeout"],
  description: "CompletableFuture の合成・例外処理・タイムアウトパターンを実務コードで解説する。thenApply/thenCompose/thenCombine の使い分けと orTimeout を Java 8/17/21 対応で整理。",
  lead: "業務システムでは、外部 API への問い合わせや DB 検索など、複数の非同期処理を組み合わせて結果を返す場面が頻繁にあります。CompletableFuture は Java 8 で導入された非同期プログラミングの基盤ですが、合成メソッドの使い分けや例外処理の設計を誤ると、処理の抜け落ちや無限待ちといった厄介な問題を生みます。この記事では、thenApply・thenCompose・thenCombine の違いを整理したうえで、exceptionally・handle・whenComplete による例外処理パターン、allOf・anyOf を使った複数タスクの合成、そして Java 9 以降の orTimeout・completeOnTimeout によるタイムアウト制御を、実務で使える完結したコードで示します。外部ライブラリなしで、非同期処理の合成から障害対応までを一通り押さえることを目指します。",
  useCases: [
    "複数の外部 API（在庫サービス・価格サービス・配送サービス）を並行呼び出しし、結果を合成して注文画面に返す",
    "夜間バッチで数千件のデータを非同期に処理し、全件完了を allOf で待ち合わせてから集計レポートを生成する",
    "UI バックエンドで重い検索処理をバックグラウンドに委譲し、タイムアウト付きで応答を返す",
  ],
  cautions: [
    "thenApply と thenCompose を混同すると CompletableFuture<CompletableFuture<T>> のようにネストする。値を返すなら thenApply、CompletableFuture を返すなら thenCompose を使う",
    "exceptionally で例外を握りつぶすとデフォルト値が後続に流れる。意図しないデフォルト値の伝播がないか、後続のステージで必ず確認する",
    "allOf は CompletableFuture<Void> を返すため、個々の結果は各 future の join() で取得する必要がある。戻り値の型に注意",
    "orTimeout / completeOnTimeout は Java 9 以降でのみ利用可能。Java 8 環境ではスケジューラを使った自前のタイムアウト処理が必要になる",
  ],
  relatedArticleSlugs: ["virtual-threads", "atomic-counter"],
  versionCoverage: {
    java8: "CompletableFuture の基本 API（supplyAsync, thenApply, thenCompose, thenCombine, exceptionally, handle, allOf, anyOf）はすべて利用可能。ただし orTimeout / completeOnTimeout は未提供。",
    java17: "orTimeout / completeOnTimeout（Java 9 追加）が利用可能。var による型推論でチェーン記述が簡潔になる。テキストブロックでログメッセージの整形も容易。",
    java21: "仮想スレッドとの組み合わせで、ブロッキング呼び出しを含む CompletableFuture タスクを大量に並行実行できる。StructuredTaskScope との使い分けが新たな設計判断になる。",
    java8Code: `// Java 8: タイムアウトは自前で実装する必要がある
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> callExternalApi());
// タイムアウト用のスケジューラを別途用意
ScheduledExecutorService scheduler =
    Executors.newScheduledThreadPool(1);
scheduler.schedule(
    () -> future.completeExceptionally(
        new TimeoutException("タイムアウト")),
    3, TimeUnit.SECONDS);`,
    java17Code: `// Java 17: orTimeout で簡潔にタイムアウト設定
var result = CompletableFuture
    .supplyAsync(() -> callExternalApi())
    .orTimeout(3, TimeUnit.SECONDS)
    .exceptionally(ex -> "デフォルト値");
// completeOnTimeout で例外ではなくデフォルト値を返す
var safe = CompletableFuture
    .supplyAsync(() -> callExternalApi())
    .completeOnTimeout("fallback", 3, TimeUnit.SECONDS);`,
    java21Code: `// Java 21: 仮想スレッドのプールで大量タスクを並行実行
var executor = Executors
    .newVirtualThreadPerTaskExecutor();
var futures = taskList.stream()
    .map(task -> CompletableFuture
        .supplyAsync(() -> process(task), executor)
        .orTimeout(5, TimeUnit.SECONDS))
    .toList();
CompletableFuture.allOf(
    futures.toArray(CompletableFuture[]::new)).join();`,
  },
  libraryComparison: [
    { name: "標準 API（CompletableFuture）", whenToUse: "非同期処理の合成が数段階で収まる業務ロジック。依存なしで十分な表現力がある。", tradeoff: "バックプレッシャー制御やリアクティブストリームの概念がないため、データの流量制御が必要な場面には向かない。" },
    { name: "RxJava", whenToUse: "イベント駆動でデータストリームを扱う場面。backpressure やリトライポリシーを宣言的に記述できる。", tradeoff: "学習コストが高く、Observable / Single / Maybe など型が多い。チーム全員が理解していないとデバッグが困難になる。" },
    { name: "Project Reactor（Mono / Flux）", whenToUse: "Spring WebFlux と組み合わせたリアクティブ Web アプリケーション。", tradeoff: "Spring エコシステムへの依存が前提。非リアクティブなコードベースに部分導入すると、ブロッキングとの境界管理が複雑になる。" },
  ],
  faq: [
    { question: "thenApply と thenCompose はどう使い分けるべきですか。", answer: "変換関数が通常の値を返すなら thenApply、CompletableFuture を返すなら thenCompose を使います。thenApply に CompletableFuture を返す関数を渡すと二重にネストするため注意してください。" },
    { question: "exceptionally と handle はどちらを使うべきですか。", answer: "例外時のみフォールバック値を返すなら exceptionally で十分です。正常時と例外時の両方で後処理が必要な場合は handle を使います。handle は正常値と例外の両方を引数に受け取ります。" },
    { question: "allOf で1つの future が失敗したら他の future はキャンセルされますか。", answer: "されません。allOf は全 future の完了を待つだけで、1つが例外で完了しても他はそのまま実行されます。失敗時に他をキャンセルしたい場合は、例外ハンドラ内で明示的に cancel() を呼ぶ必要があります。" },
  ],
  codeTitle: "CompletableFuturePatternsDemo.java",
  codeSample: `import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class CompletableFuturePatternsDemo {

    /** 外部 API 呼び出しを模擬（遅延あり） */
    static String fetchInventory(String productId) {
        sleep(500);
        return "在庫あり: " + productId;
    }

    static int fetchPrice(String productId) {
        sleep(300);
        return 2980;
    }

    static String fetchShipping(String productId) {
        sleep(400);
        return "翌日配送可";
    }

    /** タイムアウトするAPI呼び出しを模擬 */
    static String fetchSlowApi() {
        sleep(5000);
        return "遅延レスポンス";
    }

    static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public static void main(String[] args) {
        var productId = "PROD-001";

        // --- 1. thenApply: 値の変換 ---
        System.out.println("=== thenApply: 値の変換 ===");
        var upperResult = CompletableFuture
                .supplyAsync(() -> fetchInventory(productId))
                .thenApply(String::toUpperCase)
                .join();
        System.out.println(upperResult);

        // --- 2. thenCompose: 非同期処理のチェーン ---
        System.out.println("\\n=== thenCompose: 非同期チェーン ===");
        var composedResult = CompletableFuture
                .supplyAsync(() -> fetchInventory(productId))
                .thenCompose(inventory -> CompletableFuture
                        .supplyAsync(() -> inventory + " / 価格: "
                                + fetchPrice(productId) + "円"))
                .join();
        System.out.println(composedResult);

        // --- 3. thenCombine: 2つの結果を合成 ---
        System.out.println("\\n=== thenCombine: 2つの結果合成 ===");
        var inventoryFuture = CompletableFuture
                .supplyAsync(() -> fetchInventory(productId));
        var priceFuture = CompletableFuture
                .supplyAsync(() -> fetchPrice(productId));

        var combined = inventoryFuture
                .thenCombine(priceFuture,
                        (inv, price) -> inv + " / 価格: " + price + "円")
                .join();
        System.out.println(combined);

        // --- 4. allOf: 複数タスクの待ち合わせ ---
        System.out.println("\\n=== allOf: 3つのAPIを並行呼び出し ===");
        var f1 = CompletableFuture.supplyAsync(
                () -> fetchInventory(productId));
        var f2 = CompletableFuture.supplyAsync(
                () -> String.valueOf(fetchPrice(productId)));
        var f3 = CompletableFuture.supplyAsync(
                () -> fetchShipping(productId));

        CompletableFuture.allOf(f1, f2, f3).join();
        System.out.println("在庫: " + f1.join());
        System.out.println("価格: " + f2.join() + "円");
        System.out.println("配送: " + f3.join());

        // --- 5. exceptionally: 例外時のフォールバック ---
        System.out.println("\\n=== exceptionally: 例外フォールバック ===");
        var safeResult = CompletableFuture
                .supplyAsync(() -> {
                    throw new RuntimeException("API接続エラー");
                })
                .exceptionally(ex -> "デフォルト値（" + ex.getMessage() + "）")
                .join();
        System.out.println(safeResult);

        // --- 6. handle: 正常/例外の両方を処理 ---
        System.out.println("\\n=== handle: 正常/例外の統一処理 ===");
        var handled = CompletableFuture
                .supplyAsync(() -> fetchInventory(productId))
                .handle((result, ex) -> {
                    if (ex != null) {
                        return "エラー: " + ex.getMessage();
                    }
                    return "成功: " + result;
                })
                .join();
        System.out.println(handled);

        // --- 7. orTimeout: タイムアウト制御（Java 9+） ---
        System.out.println("\\n=== orTimeout: タイムアウト ===");
        try {
            var timeoutResult = CompletableFuture
                    .supplyAsync(() -> fetchSlowApi())
                    .orTimeout(1, TimeUnit.SECONDS)
                    .join();
            System.out.println(timeoutResult);
        } catch (Exception e) {
            System.out.println("タイムアウト発生: "
                    + e.getCause().getClass().getSimpleName());
        }

        // --- 8. completeOnTimeout: タイムアウト時にデフォルト値 ---
        System.out.println("\\n=== completeOnTimeout: デフォルト値 ===");
        var fallback = CompletableFuture
                .supplyAsync(() -> fetchSlowApi())
                .completeOnTimeout("タイムアウト時のデフォルト値",
                        1, TimeUnit.SECONDS)
                .join();
        System.out.println(fallback);
    }
}`,
},
{
  slug: "virtual-threads",
  title: "Java 21 仮想スレッドの実践活用 — 従来スレッドとの違いと移行指針",
  categorySlug: "concurrency",
  summary: "Virtual Threads の基本的な使い方、プラットフォームスレッドとの違い、pinning 問題と移行時の注意点を整理する。",
  version: "Java 21",
  tags: ["仮想スレッド", "Virtual Threads", "Java 21", "Loom", "並行処理", "スレッド"],
  apiNames: ["Thread.ofVirtual", "Executors.newVirtualThreadPerTaskExecutor", "Thread.startVirtualThread", "Thread.isVirtual"],
  description: "Java 21 の仮想スレッド（Virtual Threads）の使い方を実務コードで解説する。従来のプラットフォームスレッドとの違い、pinning 問題、移行指針を整理。",
  lead: "Java 21 で正式導入された仮想スレッド（Virtual Threads）は、従来のプラットフォームスレッドとは異なり、OS スレッドに1対1で紐づかない軽量なスレッドです。これにより、スレッドプールのサイズを気にすることなく、I/O 待ちの多い処理を大量に並行実行できるようになりました。従来は数百スレッドが実用上の限界でしたが、仮想スレッドでは数万〜数十万の並行タスクを低コストで起動できます。ただし、CPU 集約的な処理には向かない点や、synchronized ブロック内でのブロッキングによる pinning 問題など、導入時に理解しておくべき注意点もあります。Thread.ofVirtual() や Executors.newVirtualThreadPerTaskExecutor() の基本的な使い方から、既存コードの移行方針、pinning の回避策まで、外部ライブラリなしの完結したコードで示した。",
  useCases: [
    "Web サーバーで1リクエスト1仮想スレッドのモデルを採用し、数千の同時接続を少ない OS リソースで処理する",
    "夜間バッチで数千件の外部 API 呼び出しを仮想スレッドで並行実行し、全体の処理時間を短縮する",
    "大量のファイルを並列に読み込み、内容を集計する ETL 処理で、スレッドプールのサイズ調整から解放される",
  ],
  cautions: [
    "仮想スレッドは I/O 待ちの多い処理に最適化されている。CPU 集約的な計算（暗号処理、画像変換など）にはプラットフォームスレッドのプールを使うほうが効率的",
    "synchronized ブロック内でブロッキング I/O を行うと、仮想スレッドがキャリアスレッド（OS スレッド）に固定される pinning が発生する。ReentrantLock への置き換えで回避できる",
    "仮想スレッドでは ThreadLocal の使用に注意が必要。大量の仮想スレッドが ThreadLocal を持つとメモリ消費が増大するため、ScopedValue（プレビュー）への移行を検討する",
    "仮想スレッドのデバッグでは、従来のスレッドダンプに加えて jcmd の新しいスレッドダンプ形式（JSON）を使うと構造化された情報が得られる。-Djdk.virtualThreadScheduler.parallelism でキャリアスレッド数も調整可能",
    "既存コードへの導入では synchronized を多用しているクラスが pinning の温床になりやすい。移行前に jdk.tracePinnedThreads オプションで固定箇所を洗い出しておくと、想定外の性能劣化を防げる。",
  ],
  relatedArticleSlugs: ["completable-future-patterns", "atomic-counter"],
  versionCoverage: {
    java8: "仮想スレッドは利用不可。ExecutorService と固定サイズのスレッドプールで並行処理を行う。スレッド数はコア数や I/O 比率から手動で見積もる必要がある。",
    java17: "仮想スレッドは利用不可（Java 19 でプレビュー導入）。スレッドプールベースの設計が基本。Java 17 で追加された API はないが、var や record でコードは簡潔になる。",
    java21: "仮想スレッドが正式 API として利用可能。Thread.ofVirtual() と Executors.newVirtualThreadPerTaskExecutor() が主な入口。StructuredTaskScope はまだプレビューのため、本番利用は CompletableFuture との併用が現実的。",
    java8Code: `// Java 8: 固定サイズスレッドプールで並行処理
ExecutorService pool = Executors.newFixedThreadPool(200);
List<Future<String>> futures = new ArrayList<>();
for (int i = 0; i < 1000; i++) {
    final int taskId = i;
    futures.add(pool.submit(
        () -> callApi("task-" + taskId)));
}
for (Future<String> f : futures) {
    System.out.println(f.get());
}
pool.shutdown();`,
    java17Code: `// Java 17: var で簡潔に、ただしスレッドプール型は同じ
var pool = Executors.newFixedThreadPool(200);
var futures = new ArrayList<Future<String>>();
for (var i = 0; i < 1000; i++) {
    var taskId = i;
    futures.add(pool.submit(
        () -> callApi("task-" + taskId)));
}
for (var f : futures) {
    System.out.println(f.get());
}
pool.shutdown();`,
    java21Code: `// Java 21: 仮想スレッドでプールサイズの制約から解放
try (var executor = Executors
        .newVirtualThreadPerTaskExecutor()) {
    var futures = new ArrayList<Future<String>>();
    for (var i = 0; i < 1000; i++) {
        var taskId = i;
        futures.add(executor.submit(
            () -> callApi("task-" + taskId)));
    }
    for (var f : futures) {
        System.out.println(f.get());
    }
} // try-with-resources で自動 shutdown`,
  },
  libraryComparison: [
    { name: "標準 API（Virtual Threads）", whenToUse: "I/O バウンドな大量並行処理。既存のスレッドベースのコードをほぼそのまま移行できる。", tradeoff: "Java 21 以降が必須。CPU バウンドな処理には効果が薄く、プラットフォームスレッドとの使い分けが必要。" },
    { name: "Kotlin Coroutines", whenToUse: "Kotlin プロジェクトでの軽量並行処理。suspend 関数による構造化された非同期コードが書ける。", tradeoff: "Kotlin の言語機能に依存するため、Java プロジェクトには導入できない。コルーチンスコープの管理を誤るとリークする。" },
    { name: "CompletableFuture（標準 API）", whenToUse: "Java 8 以降で非同期処理の合成が必要な場面。仮想スレッドが使えない環境での代替手段として有効。", tradeoff: "コールバックチェーンが深くなると可読性が下がる。仮想スレッドが使える環境では、同期的なコードのほうが読みやすい場合が多い。" },
  ],
  faq: [
    { question: "既存の ExecutorService を仮想スレッドに移行するにはどうすればよいですか。", answer: "Executors.newFixedThreadPool(n) を Executors.newVirtualThreadPerTaskExecutor() に置き換えるだけで基本的な移行は完了します。ただし synchronized 内のブロッキングがないか事前に確認してください。" },
    { question: "仮想スレッドとスレッドプールの違いは何ですか。", answer: "スレッドプールはスレッドを再利用してコストを抑える仕組みですが、仮想スレッドは生成コストが極めて低いためプーリングが不要です。1タスク1仮想スレッドの使い捨てモデルが推奨されます。" },
    { question: "pinning を検出するにはどうすればよいですか。", answer: "-Djdk.tracePinnedThreads=short を JVM オプションに追加すると、pinning 発生時にスタックトレースが出力されます。synchronized を ReentrantLock に置き換えることで回避できます。" },
  ],
  codeTitle: "VirtualThreadsDemo.java",
  codeSample: `import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.locks.ReentrantLock;

public class VirtualThreadsDemo {

    /** 外部 API 呼び出しを模擬（I/O バウンド） */
    static String callApi(String endpoint) {
        try {
            Thread.sleep(100); // ネットワーク遅延を模擬
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Response from " + endpoint
                + " [" + Thread.currentThread() + "]";
    }

    /** --- 1. 基本: Thread.ofVirtual() で仮想スレッドを生成 --- */
    static void basicVirtualThread() throws InterruptedException {
        var thread = Thread.ofVirtual()
                .name("my-virtual-thread")
                .start(() -> {
                    System.out.println("仮想スレッド: "
                            + Thread.currentThread());
                    System.out.println("isVirtual: "
                            + Thread.currentThread().isVirtual());
                });
        thread.join();
    }

    /** --- 2. Thread.startVirtualThread() で簡易起動 --- */
    static void quickStart() throws InterruptedException {
        var thread = Thread.startVirtualThread(() ->
                System.out.println("簡易起動: "
                        + Thread.currentThread().isVirtual()));
        thread.join();
    }

    /** --- 3. ExecutorService で大量タスクを並行実行 --- */
    static void massiveConcurrency() throws Exception {
        var taskCount = 1000;
        var start = Instant.now();

        try (var executor = Executors
                .newVirtualThreadPerTaskExecutor()) {
            var futures = new ArrayList<Future<String>>();
            for (var i = 0; i < taskCount; i++) {
                var endpoint = "/api/resource/" + i;
                futures.add(executor.submit(
                        () -> callApi(endpoint)));
            }

            var successCount = 0;
            for (var future : futures) {
                future.get();
                successCount++;
            }
            var elapsed = Duration.between(start, Instant.now());
            System.out.println(successCount + " タスク完了: "
                    + elapsed.toMillis() + " ms");
        }
    }

    /** --- 4. pinning 回避: synchronized → ReentrantLock --- */
    static class SafeCounter {
        private final ReentrantLock lock = new ReentrantLock();
        private int count = 0;

        /** ReentrantLock なら仮想スレッドが pinning されない */
        void increment() {
            lock.lock();
            try {
                count++;
            } finally {
                lock.unlock();
            }
        }

        int getCount() {
            lock.lock();
            try {
                return count;
            } finally {
                lock.unlock();
            }
        }
    }

    /** --- 5. プラットフォームスレッドとの性能比較 --- */
    static long benchmark(ExecutorService executor, int tasks)
            throws Exception {
        var start = Instant.now();
        var futures = new ArrayList<Future<String>>();
        for (var i = 0; i < tasks; i++) {
            var endpoint = "/api/bench/" + i;
            futures.add(executor.submit(
                    () -> callApi(endpoint)));
        }
        for (var f : futures) {
            f.get();
        }
        return Duration.between(start, Instant.now()).toMillis();
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== 1. 基本的な仮想スレッド ===");
        basicVirtualThread();

        System.out.println("\\n=== 2. 簡易起動 ===");
        quickStart();

        System.out.println("\\n=== 3. 1000タスク並行実行 ===");
        massiveConcurrency();

        System.out.println("\\n=== 4. pinning 回避カウンター ===");
        var counter = new SafeCounter();
        try (var executor = Executors
                .newVirtualThreadPerTaskExecutor()) {
            var futures = new ArrayList<Future<?>>();
            for (var i = 0; i < 10000; i++) {
                futures.add(executor.submit(counter::increment));
            }
            for (var f : futures) {
                f.get();
            }
        }
        System.out.println("カウンター結果: " + counter.getCount()
                + " (期待値: 10000)");

        System.out.println("\\n=== 5. 性能比較 ===");
        var tasks = 500;

        try (var platformPool = Executors
                .newFixedThreadPool(50)) {
            var platformMs = benchmark(platformPool, tasks);
            System.out.println("プラットフォームスレッド (50本): "
                    + platformMs + " ms");
        }

        try (var virtualPool = Executors
                .newVirtualThreadPerTaskExecutor()) {
            var virtualMs = benchmark(virtualPool, tasks);
            System.out.println("仮想スレッド: "
                    + virtualMs + " ms");
        }
    }
}`,
},
]
