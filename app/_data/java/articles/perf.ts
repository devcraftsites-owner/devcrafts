import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "performance-basics",
    title: "Java の処理時間計測と nanoTime の正しい使い方",
    categorySlug: "perf",
    summary: "System.nanoTime による計測、JIT ウォームアップ、文字列結合やコレクションの性能比較を整理する。",
    version: "Java 17",
    tags: ["nanoTime", "ベンチマーク", "JIT", "StringBuilder", "ArrayList"],
    apiNames: ["System.nanoTime", "System.currentTimeMillis", "StringBuilder", "ArrayList", "LinkedList"],
    description: "Java の System.nanoTime を使った正確な処理時間計測、JIT ウォームアップの必要性、文字列結合とコレクション操作の性能比較を Java 8/17/21 対応で整理する。",
    lead: "「処理が遅い」という報告を受けたとき、まず必要になるのが正確な計測です。しかし Java のベンチマークには落とし穴が多く、System.currentTimeMillis で測ると OS の時刻調整に影響を受けたり、JIT コンパイルの有無で結果が大きく変わったりします。この記事では、System.nanoTime を使った相対時間計測の基本、JIT コンパイルの影響を除くウォームアップの考え方、そして現場でよく比較される文字列結合（+ 演算子 vs StringBuilder）とコレクション操作（ArrayList vs LinkedList）の性能差を、動作するコードで確認します。本格的なベンチマークには JMH が適しますが、まずは標準 API だけで計測の勘所を押さえておくことが実務での判断を速くします。",
    useCases: [
      "バッチ処理の各ステップにかかる時間を計測し、ボトルネック箇所を特定する",
      "コードレビューで「StringBuilder に変えるべきか」と指摘されたとき、実際の性能差を数値で確認する",
      "API のレスポンスタイムを nanoTime で計測し、SLA の閾値を超えていないかログに記録する",
    ],
    cautions: [
      "System.currentTimeMillis は壁時計時間を返すため、NTP による時刻補正の影響を受ける。処理時間の計測には必ず System.nanoTime を使うこと",
      "JIT コンパイルが走る前と後で処理速度が大きく異なる。ウォームアップなしの1回計測では正確な結果が得られない",
      "小さな処理（数マイクロ秒以下）の計測では nanoTime 自体の呼び出しコストが相対的に大きくなる。ループで繰り返して平均を取ること",
      "文字列結合の + 演算子は Java 9 以降で invokedynamic ベースに最適化されたが、ループ内での大量結合では依然 StringBuilder が有利",
      "ベンチマーク結果は JVM バージョン、GC アルゴリズム、ハードウェアに依存する。環境を明記しないと再現性がない",
    ],
    relatedArticleSlugs: ["memory-usage", "gc-basics"],
    versionCoverage: {
      java8: "ラムダ式は使えるが Runnable の匿名クラスが冗長になりがち。計測結果の保持にはクラスを定義する必要がある。文字列結合はバイトコードレベルで StringBuilder に変換される。",
      java17: "record で計測結果（ラベル・所要時間）を不変オブジェクトとして表現できる。var による型推論でコードが簡潔に。文字列結合は invokedynamic ベース（Java 9+）。",
      java21: "sealed interface と switch パターンマッチングでベンチマーク対象を型安全に分岐できる。SequencedCollection が追加されたが、性能特性は従来のコレクションと同様。",
      java8Code: `// Java 8: 匿名クラスで Runnable を渡す
long time = measureNanoTime(new Runnable() {
    @Override
    public void run() {
        String result = "";
        for (int i = 0; i < 10000; i++) {
            result = result + i;
        }
    }
});
System.out.printf("所要時間: %,d ns%n", time);`,
      java17Code: `// Java 17: ラムダ + record で簡潔に
record MeasureResult(String label, long nanos) {
    double toMillis() { return nanos / 1_000_000.0; }
    void print() {
        System.out.printf("%s: %,d ns (%.3f ms)%n", label, nanos, toMillis());
    }
}
var r = new MeasureResult("文字列結合", measureNanoTime(() -> {
    var result = "";
    for (int i = 0; i < 10000; i++) { result = result + i; }
}));
r.print();`,
      java21Code: `// Java 21: sealed interface でベンチマーク対象を型安全に分岐
sealed interface BenchmarkTask {
    record StringConcat(int n) implements BenchmarkTask {}
    record StringBuilderConcat(int n) implements BenchmarkTask {}
}
MeasureResult result = switch (task) {
    case BenchmarkTask.StringConcat t -> measure("+ 結合", () -> { /* ... */ });
    case BenchmarkTask.StringBuilderConcat t -> measure("SB", () -> { /* ... */ });
};`,
    },
    libraryComparison: [
      { name: "標準 API（System.nanoTime）", whenToUse: "簡易的な処理時間計測やボトルネックの切り分けに。外部依存なしですぐに組み込める。", tradeoff: "JIT・GC の影響を手動で考慮する必要がある。統計的な信頼性を担保するには工夫がいる。" },
      { name: "JMH（Java Microbenchmark Harness）", whenToUse: "マイクロベンチマークの精度が求められるとき。ウォームアップ、フォーク、統計処理を自動化してくれる。", tradeoff: "Maven / Gradle への依存追加が必要。学習コストがあり、手軽さでは nanoTime に劣る。" },
      { name: "Spring Boot Actuator / Micrometer", whenToUse: "アプリケーション全体のメトリクス（レスポンスタイム、スループット）を収集したいとき。", tradeoff: "Spring Boot が前提。マイクロベンチマーク目的には不向き。" },
    ],
    faq: [
      { question: "nanoTime と currentTimeMillis はどう使い分けますか。", answer: "処理時間の計測には nanoTime を使います。nanoTime は相対時間で OS の時刻調整に影響されません。currentTimeMillis は「いつ実行されたか」を記録するときに使います。" },
      { question: "ウォームアップは何回実行すればよいですか。", answer: "一般的には 3〜5 回で JIT コンパイルが安定します。その後 5〜10 回計測して平均を取ると、ばらつきの少ない結果が得られます。処理の重さに応じて調整してください。" },
      { question: "文字列結合はいつ StringBuilder に変えるべきですか。", answer: "ループ内で文字列を繰り返し連結するケースでは StringBuilder が有利です。数回の結合なら + 演算子のほうが読みやすく、Java 9 以降の最適化もあるため差は小さくなります。" },
    ],
    codeTitle: "PerformanceMeasure.java",
    codeSample: `import java.util.ArrayList;
import java.util.LinkedList;

public class PerformanceMeasure {

    // 計測結果を record で保持（Java 17+）
    record MeasureResult(String label, long nanos) {
        double toMillis() { return nanos / 1_000_000.0; }
        void print() {
            System.out.printf("%s: %,d ns (%.3f ms)%n", label, nanos, toMillis());
        }
    }

    /** System.nanoTime で処理時間を計測 */
    static long measureNanoTime(Runnable task) {
        var start = System.nanoTime();
        task.run();
        return System.nanoTime() - start;
    }

    /** ラベル付きで計測 */
    static MeasureResult measure(String label, Runnable task) {
        return new MeasureResult(label, measureNanoTime(task));
    }

    /** ウォームアップ付き計測（JIT の影響を除く） */
    static MeasureResult measureWithWarmup(
            String label, Runnable task, int warmup, int runs) {
        for (int i = 0; i < warmup; i++) { task.run(); }
        var total = 0L;
        for (int i = 0; i < runs; i++) { total += measureNanoTime(task); }
        return new MeasureResult(label, total / runs);
    }

    public static void main(String[] args) {
        int n = 10_000;

        // 文字列結合 vs StringBuilder
        System.out.println("=== 文字列結合 vs StringBuilder ===");
        var r1 = measure("+ 結合(" + n + "回)", () -> {
            var s = "";
            for (int i = 0; i < n; i++) { s = s + i; }
        });
        var r2 = measure("StringBuilder(" + n + "回)", () -> {
            var sb = new StringBuilder();
            for (int i = 0; i < n; i++) { sb.append(i); }
            sb.toString();
        });
        r1.print();
        r2.print();
        if (r2.nanos() > 0) {
            System.out.printf("StringBuilder は約 %.1f 倍高速%n",
                (double) r1.nanos() / r2.nanos());
        }

        // ArrayList vs LinkedList
        System.out.println("\\n=== ArrayList vs LinkedList ランダムアクセス ===");
        var al = new ArrayList<Integer>();
        var ll = new LinkedList<Integer>();
        for (int i = 0; i < n; i++) { al.add(i); ll.add(i); }
        measure("ArrayList.get(中間) 1000回",
            () -> { for (int i = 0; i < 1000; i++) al.get(n / 2); }).print();
        measure("LinkedList.get(中間) 1000回",
            () -> { for (int i = 0; i < 1000; i++) ll.get(n / 2); }).print();

        // ウォームアップ付き
        System.out.println("\\n=== ウォームアップ付き計測 ===");
        measureWithWarmup("100000回ループ平均", () -> {
            var sum = 0L;
            for (int i = 0; i < 100_000; i++) { sum += i; }
        }, 5, 10).print();
    }
}`,
  },
{
    slug: "memory-usage",
    title: "Java のヒープメモリ使用量を計測する方法と GC 前後の分析",
    categorySlug: "perf",
    summary: "Runtime API でヒープ使用量を取得し、リスト生成や GC 前後の変化を計測するパターンを整理する。",
    version: "Java 17",
    tags: ["ヒープメモリ", "Runtime", "メモリ計測", "GC", "ArrayList"],
    apiNames: ["Runtime.getRuntime", "Runtime.maxMemory", "Runtime.totalMemory", "Runtime.freeMemory", "System.gc"],
    description: "Java の Runtime API を使ったヒープメモリ使用量の取得と、大量データ生成・GC 前後の変化を計測する実践的な方法を Java 8/17/21 対応で整理する。",
    lead: "「このバッチ、メモリ足りてるのか」「List に何万件入れたらどのくらい消費するのか」――業務でこうした疑問を持ったとき、まず手軽に確認できるのが Runtime API によるヒープメモリの計測です。外部ツールやプロファイラを持ち出す前に、コード数行で概算を把握できるため、開発中の見積もりや障害時の一次切り分けに重宝します。この記事では、Runtime.getRuntime() から取得できる maxMemory / totalMemory / freeMemory の意味の違い、大量データ生成前後のメモリ変化の計測、GC 実行後の回収量の確認方法を扱います。record を使ったスナップショットの管理パターンも示すので、計測ロジックを使い回しやすくなります。",
    useCases: [
      "CSV 取込バッチで 10 万行を List に溜め込んだときのヒープ消費量を概算する",
      "メモリ不足が疑われるとき、処理の前後で使用量を記録して増分を確認する",
      "GC 後にどの程度メモリが回収されたかを確認し、リークの有無をざっくり判断する",
    ],
    cautions: [
      "Runtime.totalMemory() は「JVM が現在確保しているヒープ」であり、maxMemory() とは異なる。ヒープはアプリケーションの需要に応じて totalMemory が maxMemory まで拡張される",
      "System.gc() は GC の実行を保証しない。計測コードでは便宜的に使うが、本番コードには入れないこと",
      "メモリ計測は GC のタイミングに左右される。同じコードでも実行ごとに数値が変わるため、傾向を見ることが重要",
      "Runtime API で取得できるのはヒープメモリのみ。DirectByteBuffer やネイティブメモリの消費は含まれない。NIO を使う場合は注意",
    ],
    relatedArticleSlugs: ["performance-basics", "gc-basics"],
    versionCoverage: {
      java8: "Runtime API 自体は Java 1.0 から利用可能。メモリ情報の表示はメソッドで切り出し、System.out.printf で整形する。型は明示的に宣言する。",
      java17: "record でスナップショットを不変オブジェクトとして管理できる。ファクトリメソッド（static メソッド）を record 内に定義すると、取得と保持を一箇所にまとめられる。",
      java21: "sealed interface でメモリイベント（計測前・計測後）を型安全に分類し、switch パターンマッチングで出力を分岐できる。処理の意図がコードに表れやすくなる。",
      java8Code: `// Java 8: メソッドで切り出してメモリ情報を表示
static void printMemoryInfo(String label) {
    Runtime runtime = Runtime.getRuntime();
    long used = runtime.totalMemory() - runtime.freeMemory();
    System.out.println("--- " + label + " ---");
    System.out.printf("使用中: %,d KB%n", used / 1024);
    System.out.printf("最大  : %,d KB%n", runtime.maxMemory() / 1024);
}`,
      java17Code: `// Java 17: record + ファクトリメソッドでスナップショット管理
record MemorySnapshot(long maxKb, long totalKb, long usedKb, long freeKb) {
    static MemorySnapshot capture() {
        var rt = Runtime.getRuntime();
        return new MemorySnapshot(
            rt.maxMemory() / 1024, rt.totalMemory() / 1024,
            (rt.totalMemory() - rt.freeMemory()) / 1024,
            rt.freeMemory() / 1024);
    }
}`,
      java21Code: `// Java 21: sealed interface でイベントを型安全に分岐
sealed interface MemoryEvent {
    record Before(MemorySnapshot snap) implements MemoryEvent {}
    record After(MemorySnapshot snap) implements MemoryEvent {}
}
switch (event) {
    case MemoryEvent.Before e -> { System.out.println("--- 計測前 ---"); }
    case MemoryEvent.After e  -> { System.out.println("--- 計測後 ---"); }
}`,
    },
    libraryComparison: [
      { name: "標準 API（Runtime）", whenToUse: "ヒープ使用量の概算をコード内で手軽に確認したいとき。外部依存ゼロで即座に使える。", tradeoff: "ヒープ全体の概算値しか取得できない。オブジェクト単位の消費量やネイティブメモリは計測できない。" },
      { name: "JOL（Java Object Layout）", whenToUse: "個々のオブジェクトがメモリ上でどのくらいのサイズを占めるかを正確に知りたいとき。", tradeoff: "外部依存の追加が必要。プロダクションコードに組み込むものではなく、調査用途に限定される。" },
      { name: "VisualVM / Eclipse MAT", whenToUse: "ヒープダンプを取得して、どのクラスがメモリを占有しているかを詳細に分析したいとき。", tradeoff: "事後解析が中心で、コード内でのリアルタイム計測には向かない。" },
    ],
    faq: [
      { question: "maxMemory と totalMemory の違いは何ですか。", answer: "maxMemory は JVM が使える上限（-Xmx 相当）、totalMemory は現在確保されているヒープサイズです。アプリの需要に応じて totalMemory は maxMemory まで拡張されます。" },
      { question: "メモリ計測の結果が毎回異なるのはなぜですか。", answer: "GC のタイミングや JIT コンパイルの状況で使用量が変動します。1回の計測ではなく、複数回の傾向を見ることが重要です。" },
      { question: "大量データを扱うときのメモリ見積もりはどうすればよいですか。", answer: "小規模データで計測した1件あたりのメモリ消費量を、想定件数に掛けて概算します。Runtime API での before / after 計測がそのまま見積もりの根拠になります。" },
    ],
    codeTitle: "MemoryMeasure.java",
    codeSample: `import java.util.ArrayList;

public class MemoryMeasure {

    // メモリスナップショットを record で管理（Java 17+）
    record MemorySnapshot(long maxKb, long totalKb, long usedKb, long freeKb) {
        /** 現在のヒープ状態をキャプチャ */
        static MemorySnapshot capture() {
            var rt = Runtime.getRuntime();
            var total = rt.totalMemory();
            var free = rt.freeMemory();
            return new MemorySnapshot(
                rt.maxMemory() / 1024,
                total / 1024,
                (total - free) / 1024,
                free / 1024);
        }

        void print(String label) {
            System.out.println("--- " + label + " ---");
            System.out.printf("最大ヒープ   : %,d KB%n", maxKb);
            System.out.printf("確保済み     : %,d KB%n", totalKb);
            System.out.printf("使用中       : %,d KB%n", usedKb);
            System.out.printf("空き         : %,d KB%n", freeKb);
        }
    }

    /** 大量データ生成とメモリ変化の計測 */
    static void measureLargeList() {
        MemorySnapshot.capture().print("リスト生成前");

        var list = new ArrayList<String>();
        for (int i = 0; i < 100_000; i++) {
            list.add("item-" + i);
        }
        MemorySnapshot.capture().print("リスト生成後（10万件）");

        // 参照を切って GC を要求
        list = null;
        System.gc();
        try { Thread.sleep(100); }
        catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        MemorySnapshot.capture().print("GC 後");
    }

    public static void main(String[] args) {
        System.out.println("=== ヒープメモリ計測 ===");
        measureLargeList();
    }
}`,
  },
]
