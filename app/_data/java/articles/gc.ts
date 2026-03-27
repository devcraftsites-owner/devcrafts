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
    title: "Java で Full GC を防ぐメモリ設計の実践と対策パターン",
    categorySlug: "gc",
    summary: "WeakReference、短命オブジェクト設計、キャッシュ戦略で Full GC を抑制する方法を整理する。",
    version: "Java 17",
    tags: ["Full GC", "WeakReference", "SoftReference", "メモリリーク", "キャッシュ"],
    apiNames: ["WeakHashMap", "WeakReference", "SoftReference", "Runtime.getRuntime"],
    description: "Full GC を避けるための WeakReference 活用・短命オブジェクト設計・キャッシュ戦略を Java 標準 API で Java 8/17/21 対応で実装する方法を解説する。",
    lead: "Full GC が発生するとアプリケーション全体が一時停止し、API のレスポンスタイムが跳ね上がったりバッチの処理時間が大幅に伸びたりします。原因の多くは、不要になったオブジェクトへの参照を保持し続ける設計にあります。キャッシュに強参照で溜め込む、コレクションをクリアせずにフィールドに持ち続ける、といったパターンは業務コードで繰り返し見かけます。この記事では、WeakReference と WeakHashMap を使った GC フレンドリーなキャッシュ、短命オブジェクト設計によるメモリ圧迫の回避、そして参照の種類（Strong / Weak / Soft / Phantom）ごとの GC 挙動の違いを整理します。どの場面でどの参照型を選ぶべきかの判断基準も示します。",
    useCases: [
      "マスタデータのインメモリキャッシュを WeakHashMap で構築し、メモリ不足時に自動で解放されるようにする",
      "大量 CSV の行単位処理でオブジェクトをメソッドスコープに閉じ込め、Old Generation への昇格を防ぐ",
      "画像サムネイルのキャッシュに SoftReference を使い、メモリが足りている間はキャッシュを保持しつつ、不足時には GC に回収させる",
    ],
    cautions: [
      "WeakHashMap のキーは WeakReference で保持されるため、キーへの強参照がなくなると GC 時にエントリが消える。リテラル文字列をキーにすると String Pool に強参照が残り、期待どおりに回収されない",
      "SoftReference は「メモリ不足時」に回収されるが、そのタイミングは JVM 依存。キャッシュのヒット率を保証するものではない",
      "WeakReference / SoftReference を使うと get() が null を返す可能性があるため、呼び出し側で必ず null チェックが必要になる",
      "コレクションを null 代入するだけでは、中の要素への参照が他に残っていれば GC されない。参照グラフ全体を意識すること",
    ],
    relatedArticleSlugs: ["gc-basics", "jvm-options", "performance-basics"],
    versionCoverage: {
      java8: "WeakHashMap や WeakReference は Java 1.2 から利用可能。var が使えないため型を明示する必要がある。Stream も限定的で、計測コードは手続き的になりがち。",
      java17: "var による型推論で WeakReference 周りのコードが簡潔になる。record で計測結果を不変オブジェクトとして扱える。テキストブロックでベストプラクティスをドキュメント化しやすい。",
      java21: "sealed interface でキャッシュ戦略を型安全にモデリングできる。Virtual Thread はスタックが軽量（数 KB）なので、大量スレッド生成時の GC 負荷が Platform Thread より大幅に低い。",
      java8Code: `// Java 8: WeakHashMap + 明示的な型宣言
WeakHashMap<String, byte[]> cache = new WeakHashMap<>();
byte[] data = new byte[10 * 1024 * 1024];
cache.put("key", data);
data = null;
System.gc();
// cache.get("key") は null になる可能性がある

// 短命オブジェクト: 型を明示
long sum = 0;
for (int i = 0; i < count; i++) {
    String temp = "item-" + i;
    sum += temp.length();
}`,
      java17Code: `// Java 17: var + record で簡潔に
var cache = new WeakHashMap<String, byte[]>();
var data = new byte[10 * 1024 * 1024];
cache.put("key", data);
data = null;
System.gc();
// record でキャッシュ状態を表現
record CacheStatus(int size, long memoryKb) {}

// 短命オブジェクト: var で簡潔に
var sum = 0L;
for (int i = 0; i < count; i++) {
    var temp = "item-" + i;
    sum += temp.length();
}`,
      java21Code: `// Java 21: sealed interface でキャッシュ戦略を型安全に分類
sealed interface CacheStrategy {
    record StrongRef(int maxSize) implements CacheStrategy {}
    record WeakRef() implements CacheStrategy {}
    record SoftRef() implements CacheStrategy {}
}
String desc = switch (strategy) {
    case CacheStrategy.StrongRef s -> "強参照（最大" + s.maxSize() + "件）";
    case CacheStrategy.WeakRef w   -> "WeakReference（GC 時に解放）";
    case CacheStrategy.SoftRef s   -> "SoftReference（メモリ不足時に解放）";
};`,
    },
    libraryComparison: [
      { name: "標準 API（WeakHashMap / SoftReference）", whenToUse: "少量のキャッシュや参照管理で十分なとき。外部依存なしで GC フレンドリーな設計が可能。", tradeoff: "キャッシュの最大サイズ制御や TTL（有効期限）は自前で実装する必要がある。" },
      { name: "Caffeine", whenToUse: "LRU / TTL / サイズ制限付きの本格的なキャッシュが必要なとき。高負荷環境でのスループットに優れる。", tradeoff: "外部依存が増える。少量データのキャッシュにはオーバースペック。" },
      { name: "Guava Cache", whenToUse: "Caffeine ほどの性能は不要だが、CacheBuilder の宣言的な API で手軽にキャッシュを構築したいとき。", tradeoff: "Caffeine に比べて性能面で劣る。Guava 全体の依存を持ち込むことになる。" },
    ],
    faq: [
      { question: "WeakReference と SoftReference はどう使い分けますか。", answer: "キャッシュには SoftReference が適しています。メモリ不足時のみ回収されるため、ヒット率が保たれます。WeakReference は次の GC で即回収されるため、一時的な参照の追跡に向いています。" },
      { question: "WeakHashMap のキーにリテラル文字列を使っても大丈夫ですか。", answer: "推奨しません。リテラル文字列は String Pool に強参照が残るため、GC で回収されず WeakHashMap の利点が失われます。new String() でインスタンスを作るか、別の型をキーにしてください。" },
      { question: "Full GC が頻発しているかどうかはどう調べますか。", answer: "GC ログ（-Xlog:gc*）を有効にし、Full GC の出現頻度と停止時間を確認します。VisualVM や GCViewer でログをグラフ化すると傾向がつかみやすくなります。" },
    ],
    codeTitle: "GcEfficientCache.java",
    codeSample: `import java.util.WeakHashMap;

public class GcEfficientCache {

    /** WeakHashMap を使った GC フレンドリーなキャッシュ */
    static class SmartCache {
        private final WeakHashMap<String, byte[]> cache = new WeakHashMap<>();

        void put(String key, byte[] data) {
            cache.put(key, data);
        }

        byte[] get(String key) {
            return cache.get(key); // GC 後は null になる可能性あり
        }

        int size() {
            return cache.size();
        }
    }

    /** 短命オブジェクト設計: メソッドスコープで参照を閉じる */
    static long processData(int count) {
        var sum = 0L;
        for (int i = 0; i < count; i++) {
            var temp = "item-" + i; // ループ内で完結 → すぐ GC 対象
            sum += temp.length();
        }
        return sum;
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== WeakHashMap の動作確認 ===");

        var cache = new SmartCache();
        byte[] data = new byte[10 * 1024 * 1024]; // 10MB
        cache.put("large-data", data);
        System.out.println("キャッシュサイズ（GC 前）: " + cache.size());

        // 強参照を切ると GC でエントリが回収される
        data = null;
        System.gc();
        Thread.sleep(100);
        System.out.println("キャッシュサイズ（GC 後）: " + cache.size());

        // 短命オブジェクト設計の効果を確認
        System.out.println("\\n=== 短命オブジェクト設計 ===");
        var rt = Runtime.getRuntime();
        var before = rt.totalMemory() - rt.freeMemory();
        var result = processData(100_000);
        System.gc();
        Thread.sleep(100);
        var after = rt.totalMemory() - rt.freeMemory();
        System.out.println("処理結果: " + result);
        System.out.println("メモリ差: " + ((after - before) / 1024) + " KB");

        var bestPractices = """
            === Full GC を防ぐベストプラクティス ===
            1. オブジェクトのスコープを小さく保つ
            2. 大きなコレクションは適宜クリア・null 代入
            3. キャッシュには WeakReference / SoftReference を活用
            4. -Xmx を適切に設定（大きすぎると GC 時間増大）
            5. G1GC / ZGC を使う（Java 9+ / Java 15+）
            """;
        System.out.println(bestPractices);
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
    lead: "JVM オプションは Java アプリケーションの性能とメモリ管理を左右する重要な設定ですが、種類が多く、どこから手をつけてよいか迷いがちです。開発環境では気にならなくても、本番環境でヒープが足りなくなったり GC の停止時間が問題になったりして初めて調べることも多いでしょう。この記事では、ヒープサイズ（-Xms / -Xmx）、GC アルゴリズムの選択（G1GC / ZGC）、GC ログの出力設定、OOM 時のヒープダンプ取得といった、実務で最も使用頻度の高い JVM オプションに絞って整理します。ManagementFactory API を使って実行中の JVM から設定値を取得・確認する方法も合わせて示します。",
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
    ],
    relatedArticleSlugs: ["gc-basics", "gc-efficiency", "performance-basics"],
    versionCoverage: {
      java8: "デフォルト GC は Parallel GC。GC ログは -XX:+PrintGCDetails で出力。ManagementFactory は利用可能だが、import にパッケージ名を完全修飾で書くケースが多い。",
      java17: "デフォルト GC は G1GC。GC ログは -Xlog:gc* に統一。var と import 文の整理で ManagementFactory 周りのコードが読みやすくなる。ZGC が本番利用可能。",
      java21: "ZGC が Generational ZGC として世代別回収に対応し、さらに低レイテンシに。sealed interface で JVM オプションの分類を型安全に表現できる。",
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
      java21Code: `// Java 21: sealed interface で JVM オプションをカテゴリ別に分類
sealed interface JvmOption {
    record HeapOption(String flag, String desc) implements JvmOption {}
    record GcOption(String flag, String desc) implements JvmOption {}
    record DiagOption(String flag, String desc) implements JvmOption {}
}
String category = switch (option) {
    case JvmOption.HeapOption o -> "[ヒープ]";
    case JvmOption.GcOption o   -> "[GC]";
    case JvmOption.DiagOption o -> "[診断]";
};`,
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
]
