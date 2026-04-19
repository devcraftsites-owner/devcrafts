import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "gc-basics",
    title: "Java GC の基本と世代別ガベージコレクションの仕組み解説",
    categorySlug: "gc",
    summary: "Young / Old 世代の仕組み、Minor GC と Full GC の違い、Runtime でのメモリ観察方法を整理する。",
    version: "Java 17",
    tags: ["GC", "Young Generation", "Old Generation", "Minor GC", "Full GC"],
    apiNames: ["Runtime.getRuntime", "System.gc", "java.lang.ref.Cleaner"],
    description: "Java GC の世代別回収の仕組みと Runtime API によるメモリ状態の取得方法を、外部ライブラリ不要の動作確認コード付きで Java 8/17/21 対応で整理する。",
    lead: "ガベージコレクション（GC）は Java が自動で行ってくれるメモリ管理ですが、その動作原理を把握していないと、本番環境での停止時間増大やメモリ不足に対処できません。とくに業務バッチや API サーバーでは「なぜ急に遅くなったのか」「GC ログのどこを見ればいいのか」という問い合わせが現場で繰り返し発生します。この記事では、Young Generation と Old Generation の世代構造、Minor GC と Full GC の違い、Runtime API を使ったメモリ状態の取得方法を扱います。finalize() が非推奨になった経緯と Cleaner への移行についても触れるので、レガシーコードの保守にも役立ちます。",
    useCases: [
      "夜間バッチで処理時間が徐々に伸びている原因を GC ログから切り分ける",
      "API サーバーのレスポンスタイムが不安定なとき、Full GC の発生頻度を確認する",
      "レガシーコードの finalize() を Cleaner または try-with-resources に移行する",
    ],
    cautions: [
      "System.gc() は GC の実行を保証しない。あくまで JVM への要求であり、本番コードに入れるべきではない",
      "finalize() は Java 9 で非推奨、Java 18 で削除対象になった。リソース解放には try-with-resources か Cleaner を使う",
      "Young Generation のサイズが小さすぎると Minor GC が頻発し、オブジェクトが早期に Old Generation へ昇格して Full GC を招く",
      "GC ログの出力形式は Java 8 以前（-XX:+PrintGCDetails）と Java 9 以降（-Xlog:gc*）で異なる。バージョンに応じたオプションを確認すること",
    ],
    relatedArticleSlugs: ["gc-efficiency", "jvm-options", "performance-basics"],
    versionCoverage: {
      java8: "デフォルト GC は Parallel GC。メモリ状態の取得は Runtime API で行い、GC ログは -XX:+PrintGCDetails で出力する。finalize() がまだ一般的に使われている。",
      java17: "デフォルト GC は G1GC（Java 9 から）。GC ログは -Xlog:gc* に統一。record でメモリ状態を不変オブジェクトとして扱え、Cleaner が finalize() の代替として定着。",
      java21: "ZGC が本番対応として安定。sealed interface と switch パターンマッチングで GC イベントの種類を型安全に分岐できる。Virtual Thread のスタックが軽量で GC 負荷が低い。",
      java8Code: `// Java 8: 手続き的にメモリ情報を取得・表示
Runtime runtime = Runtime.getRuntime();
long used = runtime.totalMemory() - runtime.freeMemory();
System.out.println("使用中: " + (used / (1024 * 1024)) + " MB");
System.out.println("最大:   " + (runtime.maxMemory() / (1024 * 1024)) + " MB");
// finalize() がまだ有効（非推奨前）
// GC ログ: -XX:+PrintGCDetails -XX:+PrintGCDateStamps`,
      java17Code: `// Java 17: record でメモリ状態を不変オブジェクトとして管理
record MemoryStatus(String label, long usedMb, long freeMb, long totalMb, long maxMb) {
    void print() {
        System.out.println("--- " + label + " ---");
        System.out.println("  使用中: " + usedMb + " MB");
    }
}
var runtime = Runtime.getRuntime();
var status = new MemoryStatus("現在",
    (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024),
    runtime.freeMemory() / (1024 * 1024),
    runtime.totalMemory() / (1024 * 1024),
    runtime.maxMemory() / (1024 * 1024));`,
      java21Code: `// Java 21: sealed interface + switch で GC イベントを型安全に分岐
sealed interface GcEvent {
    record MinorGc(long durationMs) implements GcEvent {}
    record FullGc(long durationMs) implements GcEvent {}
}
String msg = switch (event) {
    case GcEvent.MinorGc e -> "Minor GC: " + e.durationMs() + " ms";
    case GcEvent.FullGc e  -> "Full GC: " + e.durationMs() + " ms";
};`,
    },
    libraryComparison: [
      { name: "標準 API（Runtime / ManagementFactory）", whenToUse: "ヒープ使用量や GC 回数を簡易的に確認したいとき。外部依存なしで即座に導入できる。", tradeoff: "ヒープダンプ解析や詳細なオブジェクトプロファイリングには向かない。" },
      { name: "VisualVM / JConsole", whenToUse: "GUI でリアルタイムにヒープ・GC・スレッドの状況を監視したいとき。JDK に同梱されている。", tradeoff: "本番環境への JMX 接続にはネットワーク設定が必要。リモート接続にはセキュリティ上の配慮が要る。" },
      { name: "Eclipse MAT", whenToUse: "OutOfMemoryError 発生時のヒープダンプを解析し、リーク箇所を特定したいとき。", tradeoff: "事後解析ツールのため、リアルタイム監視には使えない。ダンプファイルが大きいとツール側のメモリも消費する。" },
    ],
    faq: [
      { question: "System.gc() を呼べば確実にメモリは解放されますか。", answer: "いいえ。System.gc() は JVM に GC を要求するだけで、実行は保証されません。タイミングも JVM 実装に依存するため、本番コードに入れると逆に性能を落とすことがあります。" },
      { question: "Minor GC と Full GC はどう見分けますか。", answer: "GC ログで確認します。Minor GC は Young Generation のみ対象で数ミリ秒、Full GC は Old Generation を含む全領域対象で数百ミリ秒以上かかることが多いです。-Xlog:gc* で出力を有効にしてください。" },
      { question: "finalize() の代わりに何を使えばよいですか。", answer: "ファイルやソケットなど外部リソースには try-with-resources（AutoCloseable）を使います。ネイティブメモリの解放など特殊な用途では java.lang.ref.Cleaner が代替になります。" },
    ],
    codeTitle: "GcBasicDemo.java",
    codeSample: `import java.lang.ref.Cleaner;

public class GcBasicDemo {

    // メモリ状態を record で表現（Java 17+）
    record MemoryStatus(String label, long usedMb, long freeMb,
                        long totalMb, long maxMb) {
        void print() {
            System.out.println("--- " + label + " ---");
            System.out.println("  使用中: " + usedMb + " MB");
            System.out.println("  空き:   " + freeMb + " MB");
            System.out.println("  合計:   " + totalMb + " MB");
            System.out.println("  最大:   " + maxMb + " MB");
        }
    }

    /** Runtime からメモリ状態を取得 */
    static MemoryStatus captureMemory(String label) {
        var rt = Runtime.getRuntime();
        var total = rt.totalMemory();
        var free = rt.freeMemory();
        return new MemoryStatus(label,
            (total - free) / (1024 * 1024),
            free / (1024 * 1024),
            total / (1024 * 1024),
            rt.maxMemory() / (1024 * 1024));
    }

    public static void main(String[] args) throws InterruptedException {
        captureMemory("初期状態").print();

        // 短命オブジェクトを大量生成（Young Generation に配置される）
        System.out.println("\\n短命オブジェクトを大量生成...");
        for (int i = 0; i < 10_000; i++) {
            var temp = new String("一時データ " + i);
        }

        captureMemory("短命オブジェクト生成後").print();

        // GC 要求（動作確認用。本番コードでは使わない）
        System.gc();
        Thread.sleep(100);

        captureMemory("GC 後").print();

        // GC 世代構造の説明
        var explain = """
            === GC 世代構造 ===
            Young Generation : 新しいオブジェクト置き場。Minor GC で頻繁に回収。
            Old Generation   : 長生きしたオブジェクト。Full GC でまとめて回収。
            Minor GC : Young のみ対象（短時間・低コスト）
            Full GC  : Old を含む全 GC（長時間・アプリ一時停止）
            """;
        System.out.println(explain);

        // Cleaner の使用例（finalize() の代替）
        var cleaner = Cleaner.create();
        var resource = new Object();
        cleaner.register(resource, () ->
            System.out.println("Cleaner: リソースが GC されました"));
    }
}`,
  },
{
    slug: "gc-efficiency",
    title: "Java Full GC の危険性と回避策 — Stop-The-World・GC チューニング・実装設計",
    categorySlug: "gc",
    summary: "Stop-The-World が業務システムに与える影響と、G1GC/ZGC チューニング・Humongous 対策・ThreadLocal リーク・メモリリーク回避パターンを整理する。",
    version: "Java 17",
    tags: ["Full GC", "Stop-The-World", "G1GC", "ZGC", "メモリリーク", "WeakReference", "SoftReference", "キャッシュ", "ヒープチューニング", "ThreadLocal", "Humongous"],
    apiNames: ["WeakHashMap", "WeakReference", "SoftReference", "Runtime.getRuntime", "ManagementFactory.getGarbageCollectorMXBeans"],
    description: "Full GC の Stop-The-World が業務システムに与える影響と、G1GC/ZGC チューニング・メモリリーク対策・ThreadLocal 解放・Humongous オブジェクト対策を Java 8/17/21 対応で解説する。",
    lead: "Full GC が発生するとアプリケーション全体が一時停止します。この「Stop-The-World（STW）」とは、JVM がすべてのアプリケーションスレッドを強制的に止め、ヒープ全体を対象にメモリ回収を行う状態です。Parallel GC では数秒から十数秒に達することがあり、G1GC でも Old Generation が逼迫した場合は数秒のSTWが発生します。ZGC は 1 ミリ秒未満の停止を目標に設計されていますが、適切な設定なしには Full GC が発生します。\n\n業務システムへの影響は深刻です。REST API のタイムアウトが 5 秒に設定されたサービスで 8 秒の Full GC が起きれば、その間に受け付けたリクエストはすべてタイムアウトエラーで失敗します。夜間バッチが繰り返し Full GC を起こすと処理ウィンドウを超過し、翌朝の業務開始までにデータ更新が間に合わない事態になります。さらに、GC 中に積み上がったリクエストが完了後に一斉処理されると CPU とメモリが急騰して次の Full GC を誘発し、カスケード障害に発展することもあります。\n\nFull GC の主な引き金は 3 つです。① Old Generation が満杯になる（不要オブジェクトへの参照を保持し続けるメモリリーク、または長命オブジェクトの大量生成）。② Metaspace が枯渇する（ClassLoader リークや動的クラス生成の多用）。③ System.gc() が呼ばれる（RMI のデフォルト 1 時間ごとの定期呼び出しやライブラリ内部からの呼び出し）。\n\n対策は「JVM オプションによる制御」と「実装レベルの設計」の 2 軸になる。WeakReference・WeakHashMap を使った GC フレンドリーなキャッシュ設計、短命オブジェクト設計、ThreadLocal のリーク対策、G1GC の Humongous オブジェクト問題への対処など、コードレベルで実践できる手法を整理した。あわせて G1GC の MaxGCPauseMillis 設定・ZGC への移行判断・System.gc() 無効化・Metaspace 上限設定など JVM チューニングのポイントも取り上げる。",
    useCases: [
      "API サーバーで GC ログを分析し、Full GC の頻度・STW 時間・Old Generation 使用率からメモリリークの有無を特定する",
      "マスタデータのインメモリキャッシュを WeakHashMap で構築し、メモリ不足時に自動で解放されるようにする",
      "大量 CSV の行単位処理でオブジェクトをメソッドスコープに閉じ込め、Old Generation への昇格を防いで Full GC を回避する",
    ],
    cautions: [
      "WeakHashMap のキーは WeakReference で保持されるため、キーへの強参照がなくなると GC 時にエントリが消える。リテラル文字列をキーにすると String Pool に強参照が残り、期待どおりに回収されない",
      "SoftReference は「メモリ不足時」に回収されるが、そのタイミングは JVM 依存。キャッシュのヒット率を保証するものではない",
      "WeakReference / SoftReference を使うと get() が null を返す可能性があるため、呼び出し側で必ず null チェックが必要になる",
      "コレクションを null 代入するだけでは、中の要素への参照が他に残っていれば GC されない。参照グラフ全体を意識すること",
      "static な HashMap や ArrayList に追加だけ行って削除しないコードは、エントリが Old Generation に積み上がり続けて Full GC を繰り返す典型的なメモリリークになる。上限件数を設けるか SoftReference でラップすること。特に static final なキャッシュフィールドは「増えるのに減らない」実装になりやすいので注意",
      "スレッドプール（Servlet コンテナの worker スレッドなど）で ThreadLocal.set() した値を remove() しないままスレッドが返却されると、そのスレッドが次のリクエストに再利用されたとき前の値が残留し続ける。スレッドがスレッドプールに属している限り ThreadLocal の値は GC されないため、大きなオブジェクトを set していた場合は実質的なメモリリークになる。try-finally で必ず remove() すること",
      "G1GC では Region サイズ（ヒープに応じて 1〜32MB に自動設定、または -XX:G1HeapRegionSize で指定）の 50% を超えるオブジェクトは「Humongous オブジェクト」として Young Generation を経由せず Old Generation へ直接配置される。大きな byte[] や List を頻繁に生成するとこれが大量に Old Gen に溜まり Full GC を誘発する。対策は -XX:G1HeapRegionSize=16m でリージョンを大きくするか、大きなデータをストリーミング処理でバッファを使い回す設計にすること",
      "System.gc() の明示呼び出しは Full GC のトリガーになる。自前コードだけでなく、RMI（Remote Method Invocation）はデフォルトで 1 時間ごとに System.gc() を呼び出す仕様になっており、RMI を使うアプリケーションで定期的な Full GC が観測されることがある。-XX:+DisableExplicitGC で完全に無効化できるが、DirectByteBuffer のクリーニングなど System.gc() に依存している部分がある場合は影響を先に確認すること",
      "Metaspace が枯渇すると Full GC が発生してメタデータを回収しようとする。ClassLoader がリークしているとクラス情報が蓄積し続け、Metaspace の枯渇が繰り返される。-XX:MaxMetaspaceSize=256m のように上限を設定しておくことで、Metaspace が無制限に拡大して物理メモリを圧迫する事態を防げる。hot-reload が可能なアプリケーションサーバーでの再デプロイ時は特に注意が必要",
      "G1GC の -XX:MaxGCPauseMillis は「目標」であり「保証」ではない。G1GC は目標に近づくよう Young 世代サイズを動的に調整するが、Old Generation が逼迫している場合は目標を超えた Full GC が発生する。低レイテンシが最優先なら ZGC（-XX:+UseZGC）への切り替えを検討すること。ZGC は 1ms 未満の停止を目指すが、スループットは G1GC より若干低下する場合がある",
    ],
    relatedArticleSlugs: ["gc-basics", "jvm-options", "performance-basics"],
    versionCoverage: {
      java8: "WeakHashMap や WeakReference は Java 1.2 から利用可能。var が使えないため型を明示する必要がある。デフォルト GC は Parallel GC で Stop-The-World が長くなりやすく、Full GC 対策が特に重要だった時代。",
      java17: "var による型推論で WeakReference 周りのコードが簡潔になる。record で計測結果を不変オブジェクトとして扱える。G1GC がデフォルトになり MaxGCPauseMillis による停止時間の制御が現実的になった。",
      java21: "Generational ZGC（-XX:+UseZGC -XX:+ZGenerational）が標準搭載。1ms 未満の停止を維持しつつ世代別 GC で短命オブジェクトを効率的に回収できる。Virtual Thread はスタックが軽量なので大量スレッド起動時の GC 負荷も低い。",
      java8Code: `// Java 8: WeakHashMap + 明示的な型宣言
WeakHashMap<String, byte[]> cache = new WeakHashMap<>();
byte[] data = new byte[10 * 1024 * 1024];
cache.put(new Object(), data); // Object キー（リテラル文字列NG）
data = null;
System.gc();
// cache.size() は 0 になる可能性がある

// ThreadLocal リーク対策（Java 8 でも同じパターン）
static final ThreadLocal<String> CTX = new ThreadLocal<>();
try {
    CTX.set(value);
    // 処理
} finally {
    CTX.remove(); // try-finally で確実に remove
}`,
      java17Code: `// Java 17: var + record でヒープ状態を構造化
record HeapSnapshot(long usedMb, long maxMb, double pct) {}
var mem = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
var snap = new HeapSnapshot(
    mem.getUsed() >> 20, mem.getMax() >> 20,
    (double) mem.getUsed() / mem.getMax() * 100);
if (snap.pct() > 80) System.err.println("警告: ヒープ使用率" + snap.pct() + "%");

// SoftReference キャッシュ（メモリ逼迫時に自動解放）
var softRef = new SoftReference<>(new byte[1024 * 1024]);
byte[] cached = softRef.get(); // OOM 直前に null になる可能性`,
      java21Code: `// Java 21: Generational ZGC でほぼ STW なし
// 起動: -XX:+UseZGC -XX:+ZGenerational
// 世代別 GC で短命オブジェクトの回収が効率化される

record HeapSnapshot(long usedMb, long maxMb, double pct, long gcCount) {
    String level() { return pct > 90 ? "CRITICAL" : pct > 80 ? "WARNING" : "OK"; }
}
var mem = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
long gcCount = ManagementFactory.getGarbageCollectorMXBeans()
    .stream().mapToLong(gc -> gc.getCollectionCount()).sum();
var snap = new HeapSnapshot(
    mem.getUsed() >> 20, mem.getMax() >> 20,
    (double) mem.getUsed() / mem.getMax() * 100, gcCount);
if (!"OK".equals(snap.level())) {
    System.err.printf("[%s] ヒープ %.1f%% GC回数=%d%n",
        snap.level(), snap.pct(), snap.gcCount());
}`,
    },
    libraryComparison: [
      { name: "標準 API（WeakHashMap / SoftReference）", whenToUse: "少量のキャッシュや参照管理で十分なとき。外部依存なしで GC フレンドリーな設計が可能。", tradeoff: "キャッシュの最大サイズ制御や TTL（有効期限）は自前で実装する必要がある。" },
      { name: "Caffeine", whenToUse: "LRU / TTL / サイズ制限付きの本格的なキャッシュが必要なとき。高負荷環境でのスループットに優れ、WeakReference のラッパーも内蔵する。", tradeoff: "外部依存が増える。少量データのキャッシュにはオーバースペック。" },
      { name: "Guava Cache", whenToUse: "CacheBuilder の宣言的な API で TTL・サイズ上限・統計情報付きのキャッシュを手軽に構築したいとき。", tradeoff: "Caffeine に比べて性能面で劣る。Guava 全体の依存を持ち込むことになる。" },
    ],
    faq: [
      { question: "WeakReference と SoftReference はどう使い分けますか。", answer: "キャッシュには SoftReference が適しています。OOM 直前まで保持されるためヒット率が保たれます。WeakReference は次の GC で即回収されるため、オブジェクトの生死追跡やキャノニカルマッピングに向いています。" },
      { question: "WeakHashMap のキーにリテラル文字列を使っても大丈夫ですか。", answer: "推奨しません。リテラル文字列は String Pool に強参照が残るため GC で回収されず、WeakHashMap の利点が失われます。別の型のオブジェクトをキーにするか、new String() でインターンされないインスタンスを生成してください。" },
      { question: "Full GC が頻発しているかどうかはどう調べますか。", answer: "GC ログ（-Xlog:gc*）を有効にし、Full GC の出現頻度と停止時間を確認します。VisualVM や GCViewer でログをグラフ化すると傾向がつかみやすくなります。Full GC 直後に Old Generation の使用率がほとんど減っていない場合はメモリリークを疑ってください。" },
      { question: "G1GC の -XX:MaxGCPauseMillis を小さく設定すれば Full GC は防げますか。", answer: "防げるとは限りません。MaxGCPauseMillis は G1GC が目標とする停止時間であり保証ではありません。Old Generation が逼迫するとこの目標を超えた Full GC が発生します。停止時間より先にメモリリークや Humongous オブジェクトの問題を解消することが先決です。" },
      { question: "Humongous オブジェクトとは何ですか。どう対処しますか。", answer: "G1GC の Region サイズの 50% を超えるオブジェクトです。例えば Region が 4MB なら 2MB 超の byte[] が該当します。Young GC で回収されず Old Generation 直行となるため、頻繁に生成されると Full GC を誘発します。-XX:G1HeapRegionSize を大きく設定するか、大きなデータはストリーミング処理でバッファを使い回すことが対策です。" },
      { question: "ThreadLocal のリーク原因を特定するにはどうすればよいですか。", answer: "-XX:+HeapDumpOnOutOfMemoryError でヒープダンプを取得し、Eclipse MAT で Thread オブジェクトから参照されている ThreadLocalMap のエントリを追跡します。GC ログに Full GC が頻発している一方でヒープ使用量が減っていない場合は ThreadLocal リークを疑ってください。コードレビューでは ThreadLocal.set() があれば同じコンテキスト内に remove() があるかを確認します。" },
    ],
    codeTitle: "FullGcPreventionPatterns.java",
    codeSample: `import java.lang.management.*;
import java.lang.ref.*;
import java.util.*;

/**
 * Full GC 回避パターン集
 *
 * === 起動 JVM オプション テンプレート ===
 *
 * [GC アルゴリズム選択]
 *   -XX:+UseG1GC                          Java 9+ デフォルト（バランス重視）
 *   -XX:+UseZGC                           低レイテンシ向け（Java 15+、STW < 1ms）
 *   -XX:+UseZGC -XX:+ZGenerational        Generational ZGC（Java 21+、効率↑）
 *
 * [G1GC チューニング — Full GC 抑制]
 *   -XX:MaxGCPauseMillis=200              目標停止時間（保証ではない）
 *   -XX:G1HeapRegionSize=16m             Humongous 閾値を 8MB に引き上げ
 *   -XX:G1NewSizePercent=30              Young 世代最小割合（デフォルト 5%）
 *   -XX:InitiatingHeapOccupancyPercent=35 Mixed GC 開始閾値を下げて Old Gen 詰まりを防ぐ
 *
 * [System.gc() 無効化]
 *   -XX:+DisableExplicitGC               System.gc() / RMI 定期 GC を無効化
 *
 * [Metaspace 上限]
 *   -XX:MaxMetaspaceSize=256m            ClassLoader リーク時の保護
 *
 * [GC ログ・障害対応]
 *   -Xlog:gc*:file=gc.log:time,uptime,level,tags
 *   -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heap.hprof
 */
public class FullGcPreventionPatterns {

    // ================================================================
    // Part 1: ヒープ監視 — ManagementFactory で Full GC の予兆を捕捉
    // ================================================================
    record HeapSnapshot(long usedMb, long maxMb, double usagePct,
                        long gcCount, long gcTimeMs) {
        String level() {
            if (usagePct > 90) return "CRITICAL";
            if (usagePct > 80) return "WARNING";
            return "OK";
        }
    }

    static HeapSnapshot captureHeap() {
        var mem = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
        long gcCount = 0, gcTimeMs = 0;
        for (var gc : ManagementFactory.getGarbageCollectorMXBeans()) {
            gcCount  += gc.getCollectionCount();
            gcTimeMs += gc.getCollectionTime();
        }
        return new HeapSnapshot(
            mem.getUsed() >> 20, mem.getMax() >> 20,
            (double) mem.getUsed() / mem.getMax() * 100,
            gcCount, gcTimeMs);
    }

    // ================================================================
    // Part 2: 静的コレクションのメモリリーク対策
    //         上限なし static キャッシュは Full GC の最多原因の一つ
    // ================================================================

    // BAD: 上限なし static HashMap → Old Gen に蓄積し続けて Full GC を誘発
    // private static final Map<String, byte[]> CACHE = new HashMap<>();

    // GOOD: SoftReference + LRU でメモリ逼迫時に自動解放
    static class BoundedSoftCache {
        private final Map<String, SoftReference<byte[]>> inner;

        BoundedSoftCache(final int maxSize) {
            this.inner = new LinkedHashMap<String, SoftReference<byte[]>>(
                    16, 0.75f, true) {
                @Override protected boolean removeEldestEntry(
                        Map.Entry<String, SoftReference<byte[]>> eldest) {
                    return size() > maxSize;
                }
            };
        }

        public synchronized void put(String key, byte[] value) {
            inner.put(key, new SoftReference<>(value));
        }

        public synchronized byte[] get(String key) {
            SoftReference<byte[]> ref = inner.get(key);
            if (ref == null) return null;
            byte[] value = ref.get(); // OOM 直前に GC されると null
            if (value == null) inner.remove(key); // ゴーストエントリを除去
            return value;
        }
    }

    // ================================================================
    // Part 3: ThreadLocal リーク対策
    //         Servlet / スレッドプール環境では remove() 漏れが
    //         実質的なメモリリークになる
    // ================================================================
    static final ThreadLocal<String> REQUEST_ID = new ThreadLocal<>();

    // BAD: スレッドが再利用されるたびに前のリクエストの値が残留
    // void badProcess(String id) { REQUEST_ID.set(id); /* ... */ }

    // GOOD: try-finally で必ず remove()
    static void processWithContext(String requestId, Runnable task) {
        REQUEST_ID.set(requestId);
        try {
            task.run();
        } finally {
            REQUEST_ID.remove(); // スレッドプール返却前に必ずクリア
        }
    }

    // ================================================================
    // Part 4: Humongous オブジェクト対策（G1GC）
    //         ストリーミング処理でバッファを使い回し、
    //         大きな byte[] の頻繁な生成を避ける
    // ================================================================
    static void streamCopy(java.io.InputStream in, java.io.OutputStream out)
            throws java.io.IOException {
        byte[] buf = new byte[64 * 1024]; // 64KB バッファを使い回す
        int len;
        while ((len = in.read(buf)) != -1) {
            out.write(buf, 0, len);
        }
        // BAD 例: while (...) { byte[] chunk = new byte[1MB]; ... }
        // 1MB の new が繰り返されると G1GC の Humongous 領域が消費される
    }

    // ================================================================
    // Part 5: WeakHashMap — キーが GC されたらエントリも自動消滅
    // ================================================================
    static class WeakKeyCache {
        private final WeakHashMap<Object, String> inner = new WeakHashMap<>();
        public void put(Object key, String value) { inner.put(key, value); }
        public String get(Object key) { return inner.get(key); }
        public int size() { return inner.size(); }
    }

    // ================================================================
    // Part 6: 短命オブジェクト設計
    //         スコープを狭く保ち Young GC で完結させる
    // ================================================================
    static long processData(int count) {
        long sum = 0;
        for (int i = 0; i < count; i++) {
            String temp = "item-" + i; // メソッド内で完結 → Young GC で回収
            sum += temp.length();
        }
        return sum; // temp への参照はここで消滅 → Old Gen への昇格なし
    }

    public static void main(String[] args) throws InterruptedException {
        // ヒープ監視
        System.out.println("=== ヒープ状態確認 ===");
        var snap = captureHeap();
        System.out.printf("[%s] %.1f%% (%d/%d MB) | GC回数=%d 累計=%dms%n",
            snap.level(), snap.usagePct(), snap.usedMb(), snap.maxMb(),
            snap.gcCount(), snap.gcTimeMs());
        if (!"OK".equals(snap.level())) {
            System.err.println("→ Full GC の予兆。-XX:+HeapDumpOnOutOfMemoryError でダンプ取得を推奨");
        }

        // ThreadLocal 正常パターン
        System.out.println("\\n=== ThreadLocal リーク対策 ===");
        processWithContext("req-001",
            () -> System.out.println("処理中 requestId=" + REQUEST_ID.get()));
        System.out.println("remove後: " + REQUEST_ID.get()); // null

        // WeakHashMap の挙動
        System.out.println("\\n=== WeakHashMap キャッシュ ===");
        var weakCache = new WeakKeyCache();
        byte[] key = new byte[1024];
        weakCache.put(key, "関連データ");
        System.out.println("GC前 size=" + weakCache.size()); // 1
        key = null; // 強参照を解放
        System.gc(); Thread.sleep(100);
        System.out.println("GC後 size=" + weakCache.size()); // 0 の可能性

        // SoftReference キャッシュ
        System.out.println("\\n=== SoftReference キャッシュ ===");
        var softCache = new BoundedSoftCache(100);
        softCache.put("img-001", new byte[10 * 1024]);
        byte[] hit = softCache.get("img-001");
        System.out.println("ヒット: " + (hit != null ? hit.length + " bytes" : "GC 済み"));

        // 短命オブジェクト処理
        System.out.println("\\n=== 短命オブジェクト設計 ===");
        long result = processData(100_000);
        System.out.println("結果: " + result);
        var after = captureHeap();
        System.out.printf("処理後ヒープ: [%s] %.1f%%%n", after.level(), after.usagePct());
    }
}`,
  },
{
    slug: "jvm-options",
    title: "Java JVM オプションの基本と GC チューニングの実践方法",
    categorySlug: "gc",
    summary: "-Xms / -Xmx / GC アルゴリズム選択 / GC ログ出力など、実務で使う JVM オプションを整理する。",
    version: "Java 17",
    tags: ["JVM", "Xmx", "Xms", "G1GC", "ZGC", "GCログ", "HeapDump"],
    apiNames: ["Runtime.getRuntime", "ManagementFactory.getMemoryMXBean", "ManagementFactory.getGarbageCollectorMXBeans"],
    description: "業務で頻出する JVM オプション（ヒープ設定・GC 選択・ログ出力・ヒープダンプ）を ManagementFactory API での確認方法と合わせて整理する。",
    lead: "JVM オプションは Java アプリケーションの性能とメモリ管理を左右する重要な設定ですが、種類が多く、どこから手をつけてよいか迷いがちです。開発環境では気にならなくても、本番環境でヒープが足りなくなったり GC の停止時間が問題になったりして初めて調べることも多いでしょう。ヒープサイズ（-Xms / -Xmx）、GC アルゴリズムの選択（G1GC / ZGC）、GC ログの出力設定、OOM 時のヒープダンプ取得といった実務で最も使用頻度の高い JVM オプションに絞って整理した。ManagementFactory API を使って実行中の JVM から設定値を取得・確認する方法も合わせて示す。",
    useCases: [
      "本番デプロイ前に -Xmx / -Xms を適切に設定し、ヒープ不足による OOM を予防する",
      "GC ログ（-Xlog:gc*）を有効にして、性能劣化時に Full GC の発生状況を事後分析する",
      "OOM 発生時にヒープダンプを自動取得し、Eclipse MAT でリーク箇所を特定する",
    ],
    cautions: [
      "-Xmx を物理メモリの上限近くまで設定すると、OS やほかのプロセスのメモリが不足してスワップが発生し、かえって性能が悪化する",
      "-Xms と -Xmx を同じ値にするとヒープの拡張・縮小が起きないため GC の負荷が安定するが、メモリを常時専有するのでコンテナ環境では注意が必要",
      "Java 8 の -XX:+PrintGCDetails は Java 9 以降で廃止され、-Xlog:gc* に置き換わった。バージョンを跨ぐ運用ではオプションの互換性を確認すること",
      "ZGC は低レイテンシに優れるが、スループット重視の大量バッチ処理では G1GC のほうが適する場合がある。ワークロードに応じた選択が必要",
      "実務では -Xmx が設定されていないまま本番稼働し、ヒープをデフォルト（物理メモリの1/4）のまま使っていたケースがある。アプリの起動スクリプトには必ず -Xmx を明示し、サービスのメモリ要件から逆算して設定すること。",
    ],
    relatedArticleSlugs: ["gc-basics", "gc-efficiency", "jvm-options-version-diff", "performance-basics"],
    versionCoverage: {
      java8: "デフォルト GC は Parallel GC。GC ログは -XX:+PrintGCDetails で出力。ManagementFactory は利用可能だが、import にパッケージ名を完全修飾で書くケースが多い。",
      java17: "デフォルト GC は G1GC。GC ログは -Xlog:gc* に統一。var と import 文の整理で ManagementFactory 周りのコードが読みやすくなる。ZGC が本番利用可能。",
      java21: "Generational ZGC（-XX:+UseZGC -XX:+ZGenerational）が標準搭載。record で ManagementFactory のヒープ情報を構造化して取得できる。",
      java8Code: `// Java 8: 完全修飾名での ManagementFactory 利用
Runtime runtime = Runtime.getRuntime();
System.out.println("最大ヒープ: " + (runtime.maxMemory() / (1024 * 1024)) + " MB");
java.lang.management.MemoryMXBean memBean =
    java.lang.management.ManagementFactory.getMemoryMXBean();
java.lang.management.MemoryUsage heapUsage = memBean.getHeapMemoryUsage();
// GC ログ: -XX:+PrintGCDetails -XX:+PrintGCDateStamps
// デフォルト GC: Parallel GC`,
      java17Code: `// Java 17: import + var で簡潔に
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryUsage;
var runtime = Runtime.getRuntime();
var memBean = ManagementFactory.getMemoryMXBean();
MemoryUsage heapUsage = memBean.getHeapMemoryUsage();
System.out.println("使用中: " + (heapUsage.getUsed() / (1024 * 1024)) + " MB");
// GC ログ: -Xlog:gc*
// デフォルト GC: G1GC`,
      java21Code: `// Java 21: record でヒープ情報を構造化 + Generational ZGC
// 起動: -XX:+UseZGC -XX:+ZGenerational
record HeapMetrics(long usedMB, long maxMB, double usagePct) {}
var heap = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
var metrics = new HeapMetrics(
    heap.getUsed() >> 20,
    heap.getMax() >> 20,
    (double) heap.getUsed() / heap.getMax() * 100);
System.out.printf("ヒープ使用率: %.1f%% (%d/%d MB)%n",
    metrics.usagePct(), metrics.usedMB(), metrics.maxMB());`,
    },
    libraryComparison: [
      { name: "標準 API（Runtime / ManagementFactory）", whenToUse: "実行中の JVM からヒープ使用量や GC 回数を確認したいとき。外部依存なしですぐに使える。", tradeoff: "履歴の蓄積やアラート通知には対応していない。モニタリングツールとの併用が前提になる。" },
      { name: "Prometheus + JMX Exporter", whenToUse: "JVM メトリクスを時系列で収集し、Grafana でダッシュボード化したいとき。", tradeoff: "Prometheus / Grafana のインフラ構築が必要。小規模プロジェクトではオーバースペック。" },
      { name: "Spring Boot Actuator", whenToUse: "Spring Boot アプリケーションでメトリクスエンドポイントを手軽に公開したいとき。", tradeoff: "Spring Boot が前提。Pure Java プロジェクトでは使えない。" },
    ],
    faq: [
      { question: "-Xms と -Xmx は同じ値にすべきですか。", answer: "ヒープの拡張・縮小による GC 負荷を避けたい場合は同じ値が有効です。ただし、コンテナ環境ではメモリ上限との兼ね合いを考慮し、余裕を持たせた設定が安全です。" },
      { question: "G1GC と ZGC はどう選びますか。", answer: "レスポンスタイムの安定性が求められる API サーバーには ZGC（Java 15+）が適しています。スループット重視のバッチ処理では G1GC のほうが総処理時間が短くなる場合があります。" },
      { question: "本番で GC ログを有効にしても性能に影響はありませんか。", answer: "GC ログの出力は非常に軽量で、本番環境でも常時有効にしておくのが一般的です。問題発生時に遡って分析できるため、有効にしない理由は基本的にありません。" },
    ],
    codeTitle: "JvmOptionsDemo.java",
    codeSample: `import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryUsage;

public class JvmOptionsDemo {

    public static void main(String[] args) {
        var runtime = Runtime.getRuntime();

        // ヒープメモリ情報
        System.out.println("=== JVM メモリ情報 ===");
        System.out.println("最大ヒープ (-Xmx)  : "
            + (runtime.maxMemory() / (1024 * 1024)) + " MB");
        System.out.println("現在のヒープ       : "
            + (runtime.totalMemory() / (1024 * 1024)) + " MB");
        System.out.println("空きヒープ         : "
            + (runtime.freeMemory() / (1024 * 1024)) + " MB");
        System.out.println("CPU コア数         : "
            + runtime.availableProcessors());

        // ManagementFactory で詳細情報を取得
        var memBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heap = memBean.getHeapMemoryUsage();
        MemoryUsage nonHeap = memBean.getNonHeapMemoryUsage();

        System.out.println("\\n=== ヒープメモリ詳細 ===");
        System.out.println("使用中      : " + (heap.getUsed() / (1024 * 1024)) + " MB");
        System.out.println("コミット済み: " + (heap.getCommitted() / (1024 * 1024)) + " MB");
        System.out.println("最大        : " + (heap.getMax() / (1024 * 1024)) + " MB");

        System.out.println("\\n=== 非ヒープメモリ ===");
        System.out.println("使用中: " + (nonHeap.getUsed() / (1024 * 1024)) + " MB");

        // GC 情報
        System.out.println("\\n=== GC 情報 ===");
        for (GarbageCollectorMXBean gc
                : ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("GC 名    : " + gc.getName());
            System.out.println("  回数   : " + gc.getCollectionCount());
            System.out.println("  累計時間: " + gc.getCollectionTime() + " ms");
        }

        // よく使う JVM オプション一覧
        var options = """
            === よく使う JVM オプション ===
            -Xms256m                        : 初期ヒープサイズ
            -Xmx1g                          : 最大ヒープサイズ
            -XX:+UseG1GC                    : G1GC（Java 9+ デフォルト）
            -XX:+UseZGC                     : ZGC（Java 15+ 低レイテンシ）
            -Xlog:gc*                       : GC ログ出力（Java 9+）
            -XX:+HeapDumpOnOutOfMemoryError : OOM 時ヒープダンプ
            -XX:HeapDumpPath=/tmp/heap.hprof: ダンプ出力先
            """;
        System.out.println(options);
    }
}`,
  },
  {
    slug: "jvm-options-version-diff",
    title: "Java 8→17→21 JVM オプション移行ガイド：廃止・変更・新設オプション徹底比較",
    categorySlug: "gc",
    summary: "Java バージョンアップで変わった JVM オプションを「廃止・変更・新設」に分類し、8→17→21 の移行手順を実コード付きで整理する。",
    version: "Java 21",
    tags: ["JVM", "移行", "GCログ", "ZGC", "Metaspace", "UseContainerSupport", "Xlog", "廃止オプション"],
    apiNames: ["System.getProperty", "ManagementFactory.getRuntimeMXBean", "ManagementFactory.getGarbageCollectorMXBeans"],
    description: "Java 8→17→21 での JVM オプションの廃止・変更・新設を整理し、GCログ形式変更・デフォルトGC変遷・コンテナ対応・Metaspace 移行を実行可能コードと合わせて解説する。",
    lead: "Java 8 で書かれた起動スクリプトをそのまま Java 17 や 21 で動かすと、認識されないオプションの警告が出たり、GC ログが出力されなくなったりすることがあります。特に `-XX:+PrintGCDetails`、`-XX:MaxPermSize` のような Java 8 時代の定番オプションは、Java 9 以降で廃止・無効化されています。バージョンアップ後に「GC ログが空だ」「起動時に Unrecognized VM option と出る」と気づいて初めて調べるケースも多いでしょう。「廃止された」「デフォルトが変わった」「新しく使えるようになった」の 3 軸でバージョン間の差異を整理した。GC ログ形式の Unified JVM Logging への移行、デフォルト GC の Parallel→G1GC→Generational ZGC への変遷、コンテナ環境での `-XX:+UseContainerSupport` の扱い、PermGen 廃止と Metaspace 設定の現在地を、実行して確認できるコード付きでまとめている。起動スクリプトの棚卸しや Java アップグレード作業のチェックリストとして使ってほしい。",
    useCases: [
      "Java 8 の起動スクリプトを Java 17/21 へ移行する際に、廃止オプションを洗い出して警告やエラーを解消する",
      "Kubernetes や Docker 上のコンテナアプリで -XX:+UseContainerSupport が有効かどうかを確認し、ヒープサイズを適切に設定する",
      "GC ログが出力されていない原因を調査し、-XX:+PrintGCDetails から -Xlog:gc* への書き換え手順を確認する",
    ],
    cautions: [
      "-XX:MaxPermSize は Java 8 で PermGen が廃止されて以降、JVM に無視されるか起動失敗の原因になる。Java 17 以降では完全削除されたため、起動スクリプトから必ず取り除くこと",
      "-XX:+PrintGCDetails / -XX:+PrintGCDateStamps は Java 9 で廃止。代替は -Xlog:gc*:file=gc.log:time,uptime,level,tags で、同等以上の情報が得られる",
      "-XX:+UseContainerSupport は Java 10 からデフォルト有効で cgroup のメモリ上限を認識するが、-Xmx を明示指定するとコンテナ自動計算は無効になる。両方書いた場合は -Xmx が優先される",
      "ZGC は Java 15 で本番対応、Java 21 で Generational ZGC に進化した。Java 8/11 環境への ZGC 設定のバックポートはできないため、移行後のバージョン確認が必須",
      "Java バージョンアップ後に「GC ログが空」「Unrecognized VM option 警告」が出る原因の多くは古いオプションの残留。移行前に現行の起動スクリプトを全オプション列挙し、本記事の変更一覧と突き合わせて棚卸しすること。",
    ],
    relatedArticleSlugs: ["jvm-options", "gc-basics", "gc-efficiency"],
    versionCoverage: {
      java8: "デフォルト GC は Parallel GC（-XX:+UseParallelGC）。GC ログは -XX:+PrintGCDetails -XX:+PrintGCDateStamps で出力。PermGen は既に Metaspace に移行済みだが、誤って -XX:MaxPermSize を指定しているスクリプトが多い。コンテナのメモリ上限を JVM が認識しない（UseContainerSupport 未搭載）。",
      java17: "デフォルト GC は G1GC（Java 9 から変更）。GC ログは Unified JVM Logging（-Xlog:gc*）に統一。-XX:MaxPermSize は完全削除。-XX:+UseContainerSupport は Java 10 からデフォルト有効。ZGC（-XX:+UseZGC）が実験的フラグなしで使用可能に。",
      java21: "Generational ZGC（-XX:+UseZGC -XX:+ZGenerational）が標準搭載。G1GC も継続サポート。Virtual Thread のスタックはヒープ外で管理されるため、大量スレッド起動時の GC 負荷が従来より低い。コンテナ自動検出の精度がさらに向上。",
      java8Code: `// Java 8 当時の起動オプション（移行時に削除・置換が必要なもの）
// -XX:+UseParallelGC          ← Java 9 以降はデフォルトが G1GC に変更
// -XX:+PrintGCDetails         ← Java 9 で廃止。-Xlog:gc* に書き換えること
// -XX:+PrintGCDateStamps      ← 同上
// -XX:PermSize=128m           ← Java 8 で既に Metaspace に移行済み。無効
// -XX:MaxPermSize=256m        ← Java 17 以降では起動失敗の原因になる

Runtime runtime = Runtime.getRuntime();
System.out.println("Java version: " + System.getProperty("java.version"));
System.out.println("最大ヒープ: " + (runtime.maxMemory() / (1024 * 1024)) + " MB");
// コンテナ上では UseContainerSupport がないためホストの物理メモリ全量を参照する`,
      java17Code: `// Java 17 推奨の起動オプション
// -XX:+UseG1GC                           ← デフォルトだが意図を明示する場合に
// -Xlog:gc*:file=gc.log:time,uptime,level,tags  ← PrintGCDetails の代替
// -XX:+HeapDumpOnOutOfMemoryError
// -XX:HeapDumpPath=/tmp/heap.hprof
// ※ -XX:MaxPermSize, -XX:+PrintGCDetails は削除すること

var runtime = Runtime.getRuntime();
System.out.println("Java version: " + System.getProperty("java.version"));
// UseContainerSupport（Java 10+ デフォルト有効）により
// docker run --memory=2g などの cgroup 制限を JVM が正しく認識する
System.out.println("最大ヒープ: " + (runtime.maxMemory() / (1024 * 1024)) + " MB");`,
      java21Code: `// Java 21 / Generational ZGC を使う場合の起動オプション
// -XX:+UseZGC -XX:+ZGenerational        ← 低レイテンシ要件向け
// -Xlog:gc*:file=gc.log:time,uptime,level,tags
// -XX:MaxRAMPercentage=75.0             ← コンテナ環境（デフォルト 25%）

var version = Runtime.version();
System.out.println("Java: " + version.feature() + "." + version.interim());

// Virtual Thread は Platform Thread より GC 負荷が低い
try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() ->
        System.out.println("Virtual Thread 実行中（スタックはヒープ外管理）")
    );
}`,
    },
    libraryComparison: [
      {
        name: "標準 JVM フラグ（-Xlog / -XX）",
        whenToUse: "GC ログの出力形式変更や GC アルゴリズム選択など、JVM レベルの動作を制御したいとき。Java 9 以降は -Xlog:gc* が統一的な窓口になる。",
        tradeoff: "フラグの多くはバージョン間で互換性がない。Java 8 と Java 17 で同一スクリプトを使いまわすと、廃止フラグの警告や起動失敗が起きる。",
      },
      {
        name: "GCViewer / GCEasy",
        whenToUse: "GC ログファイル（-Xlog:gc* で出力）を視覚的に分析し、停止時間のピークや GC 頻度の傾向を素早く把握したいとき。",
        tradeoff: "GCViewer はローカルツールで最新 GC フォーマットへの追従が遅れることがある。GCEasy はクラウド型のため、本番ログのアップロード前にセキュリティポリシーの確認が必要。",
      },
      {
        name: "JVM Flight Recorder（JFR）",
        whenToUse: "Java 11 以降で GC だけでなく CPU・スレッド・I/O も含めた詳細プロファイルをオーバーヘッド最小で取得したいとき。本番環境での常時有効化も実績がある。",
        tradeoff: "Oracle JDK 8 の商用機能として存在したが、OpenJDK 8 では使えない。Java 11 以降の OpenJDK で本格的に利用可能になった。",
      },
    ],
    faq: [
      {
        question: "-XX:+PrintGCDetails を Java 17 で使うとどうなりますか。",
        answer: "Java 9 以降では認識されないオプションとして警告（Unrecognized VM option）が出力されます。場合によっては起動失敗の原因にもなります。代わりに -Xlog:gc*:file=gc.log:time,uptime,level,tags を使ってください。",
      },
      {
        question: "コンテナ上で -Xmx を指定しないと JVM はどのようにヒープ上限を決めますか。",
        answer: "Java 10 以降では -XX:+UseContainerSupport がデフォルト有効で、cgroup のメモリ上限（docker run --memory など）を認識します。デフォルトでは上限の 25% 相当が -Xmx の基準になります（-XX:MaxRAMPercentage=25.0）。Java 8 では UseContainerSupport がないため、ホストの物理メモリ全量を参照してしまいます。",
      },
      {
        question: "Generational ZGC と Java 21 以前の ZGC の違いは何ですか。",
        answer: "Java 21 以前の ZGC は世代別 GC を持たず全オブジェクトを同一世代として扱うシングルジェネレーション型でした。Java 21 の Generational ZGC では Young/Old 世代が導入され、短命オブジェクトをより効率的に回収できるため、同じ低レイテンシを維持しつつヒープ効率が改善しています。",
      },
    ],
    codeTitle: "JvmOptionsMigrationDemo.java",
    codeSample: `import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.util.List;

/**
 * JVM オプション移行ガイド — 実行バージョン確認と設定検証デモ
 *
 * 実行方法（Java 17 / 21）:
 *   java -Xms256m -Xmx512m \\
 *        -Xlog:gc*:file=gc.log:time,uptime,level,tags \\
 *        -XX:+HeapDumpOnOutOfMemoryError \\
 *        JvmOptionsMigrationDemo
 *
 * Java 8 で使っていた廃止オプション（使用禁止）:
 *   -XX:+PrintGCDetails     -> 代替: -Xlog:gc*
 *   -XX:+PrintGCDateStamps  -> 代替: -Xlog:gc*:...:time
 *   -XX:MaxPermSize=256m    -> PermGen 廃止済み。削除すること
 */
public class JvmOptionsMigrationDemo {

    /** 実行中の Java バージョンを取得して大まかに分類する */
    static int detectMajorVersion() {
        String version = System.getProperty("java.version");
        // "1.8.0_xxx" 形式（Java 8）と "17.0.x" 形式を両対応
        if (version.startsWith("1.")) {
            return Integer.parseInt(version.split("\\\\.")[1]);
        }
        return Integer.parseInt(version.split("\\\\.")[0]);
    }

    /** JVM に渡された起動フラグを取得し、廃止フラグが含まれていれば警告する */
    static void checkDeprecatedFlags(List<String> flags) {
        var deprecated = List.of(
            "-XX:+PrintGCDetails",
            "-XX:+PrintGCDateStamps",
            "-XX:MaxPermSize",
            "-XX:PermSize",
            "-XX:+UseConcMarkSweepGC"  // Java 14 で削除
        );
        System.out.println("\\n=== 廃止オプションチェック ===");
        boolean found = false;
        for (String flag : flags) {
            for (String dep : deprecated) {
                if (flag.contains(dep)) {
                    System.out.println("[警告] 廃止オプション検出: " + flag);
                    found = true;
                }
            }
        }
        if (!found) {
            System.out.println("廃止オプションなし — OK");
        }
    }

    /** ヒープ設定とコンテナ対応状況を表示する */
    static void printHeapInfo() {
        var runtime = Runtime.getRuntime();
        long maxMb   = runtime.maxMemory()   / (1024 * 1024);
        long totalMb = runtime.totalMemory() / (1024 * 1024);
        long usedMb  = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);

        System.out.println("\\n=== ヒープ情報 ===");
        System.out.println("最大ヒープ (-Xmx)   : " + maxMb   + " MB");
        System.out.println("現在のヒープ        : " + totalMb + " MB");
        System.out.println("使用中              : " + usedMb  + " MB");
        System.out.println("CPU コア数          : " + runtime.availableProcessors());
        // Java 10+ で UseContainerSupport がデフォルト有効になり、
        // コンテナの cgroup 上限（docker run --memory など）を JVM が認識するようになった。
        // -Xmx を明示しない場合は MaxRAMPercentage（デフォルト 25%）が上限の基準になる。
        System.out.println("(コンテナ実行時は cgroup 上限を反映: UseContainerSupport Java 10+)");
    }

    /** GC アルゴリズムとバージョン別の変遷を表示する */
    static void printGcInfo() {
        System.out.println("\\n=== GC 情報 ===");
        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("GC 名     : " + gc.getName());
            System.out.println("  回数    : " + gc.getCollectionCount());
            System.out.println("  累計時間: " + gc.getCollectionTime() + " ms");
        }
    }

    /** バージョン別の推奨 GC オプションを表示する */
    static void printVersionGuidance(int major) {
        // switch 式（Java 14+）でバージョン別ガイダンスを返す
        var guidance = switch (major) {
            case 8  -> """
                [Java 8] デフォルト GC: Parallel GC
                  推奨: -XX:+UseG1GC（明示指定で G1GC に切替可）
                  GC ログ: -XX:+PrintGCDetails -XX:+PrintGCDateStamps（Java 8 のみ有効）
                  注意: UseContainerSupport 未対応。コンテナではヒープを明示指定すること""";
            case 17 -> """
                [Java 17] デフォルト GC: G1GC
                  推奨: -Xlog:gc*:file=gc.log:time,uptime,level,tags
                  ZGC: -XX:+UseZGC（低レイテンシ要件向け）
                  廃止: -XX:+PrintGCDetails, -XX:MaxPermSize は削除すること""";
            default -> """
                [Java 21] デフォルト GC: G1GC / Generational ZGC
                  推奨 ZGC: -XX:+UseZGC -XX:+ZGenerational
                  GC ログ: -Xlog:gc*:file=gc.log:time,uptime,level,tags
                  コンテナ: -XX:MaxRAMPercentage=75.0 を検討（デフォルト 25%）""";
        };
        System.out.println("\\n=== バージョン別ガイダンス ===");
        System.out.println(guidance);
    }

    public static void main(String[] args) {
        System.out.println("=== JVM オプション移行チェッカー ===");
        System.out.println("Java version : " + System.getProperty("java.version"));
        System.out.println("JVM vendor   : " + System.getProperty("java.vendor"));

        int major = detectMajorVersion();
        System.out.println("メジャーバージョン: " + major);

        // 起動フラグに廃止オプションが含まれていないか確認
        RuntimeMXBean runtimeMxBean = ManagementFactory.getRuntimeMXBean();
        checkDeprecatedFlags(runtimeMxBean.getInputArguments());

        printHeapInfo();
        printGcInfo();
        printVersionGuidance(major);

        System.out.println("\\n=== 移行チェックリスト ===");
        System.out.println("""
            [ ] -XX:MaxPermSize / -XX:PermSize を削除した
            [ ] -XX:+PrintGCDetails を -Xlog:gc* に書き換えた
            [ ] -XX:+UseConcMarkSweepGC (CMS) を削除 / G1GC に変更した
            [ ] コンテナ環境で -XX:MaxRAMPercentage を設定した
            [ ] GC アルゴリズムをワークロードに合わせて選定した""");
    }
}`,
  },
]
