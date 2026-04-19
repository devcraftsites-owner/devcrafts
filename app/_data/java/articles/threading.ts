import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "thread-basics",
  title: "Java スレッドの作り方と基本操作まとめ — 仮想スレッド対応",
  categorySlug: "threading",
  summary: "Thread 継承・Runnable 実装・ラムダ式の3パターンと start/join/interrupt の基本を整理する。",
  version: "Java 17",
  tags: ["Thread", "Runnable", "start", "join", "interrupt"],
  apiNames: ["Thread", "Runnable", "Thread.start", "Thread.join", "Thread.interrupt", "Thread.currentThread"],
  description: "Java のスレッド作成パターン3種と start/join/interrupt の使い方を Java 8/17/21 対応で解説する。仮想スレッドにも触れる。",
  lead: "Java でマルチスレッド処理を書く場面は、バッチの並列実行や非同期ログ出力など、業務システムでも少なくありません。Thread クラスを継承する方法、Runnable を実装する方法、ラムダ式で書く方法の3パターンがあり、どれを選ぶかで保守性やテストしやすさが変わります。スレッドの生成から start/join による制御、interrupt による安全な中断まで実務で必要な基本操作を整理した。Java 21 の仮想スレッド（Virtual Threads）との違いも取り上げるので、今後のコード選択の判断材料にしてほしい。",
  useCases: [
    "バッチ処理で複数ファイルの取り込みを並列化し、全スレッドの完了を join で待ち合わせる",
    "ログ出力や通知送信を別スレッドに委譲し、メイン処理のレスポンスタイムを短縮する",
    "タイムアウト付きの外部API呼び出しを別スレッドで実行し、interrupt で中断可能にする",
  ],
  cautions: [
    "start() ではなく run() を直接呼ぶとメインスレッドで同期実行される。新規スレッドは生成されないため、並行処理にならない",
    "InterruptedException を catch したら Thread.currentThread().interrupt() で割り込みフラグを再セットするのが原則。握りつぶすとキャンセル伝播が途切れる",
    "Thread を継承するとそのクラスは他のクラスを継承できなくなる。Runnable 実装やラムダ式のほうが拡張性が高い",
    "スレッド名を設定しておかないと、ログやスレッドダンプでの特定が困難になる。new Thread(task, \"worker-1\") のように明示する",
    "join() にタイムアウトを設定しないと、相手スレッドが終了しない限りメインスレッドが永久にブロックされる",
    "実務では run() を直接呼ぶ誤りや、スレッド名を設定しないためスレッドダンプで特定できないケースが多い。命名と start/join の基本を最初に押さえておくと、後のデバッグが楽になる。",
  ],
  relatedArticleSlugs: ["synchronized-basics", "executor-service"],
  versionCoverage: {
    java8: "Runnable の匿名クラスかラムダ式で記述。Thread の基本 API は Java 1.0 から変わらず使える。",
    java17: "var による型推論と record で Runnable を実装するパターンが加わり、コードが簡潔になる。",
    java21: "Thread.ofVirtual() で仮想スレッドを生成できる。OS スレッドを消費しないため大量生成が可能。",
    java8Code: `// Java 8: Runnable の匿名クラスで記述
Thread t = new Thread(new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello from " +
            Thread.currentThread().getName());
    }
}, "worker-1");
t.start();
t.join();`,
    java17Code: `// Java 17: ラムダ式 + var で簡潔に
var t = new Thread(() -> {
    System.out.println("Hello from " +
        Thread.currentThread().getName());
}, "worker-1");
t.start();
t.join();`,
    java21Code: `// Java 21: 仮想スレッドで起動
var vt = Thread.ofVirtual()
    .name("virtual-1")
    .start(() -> {
        System.out.println("仮想スレッド: " +
            Thread.currentThread().isVirtual());
    });
vt.join();`,
  },
  libraryComparison: [
    { name: "標準 API（Thread / Runnable）", whenToUse: "スレッドの基本制御を直接扱い、動作を細かく把握したいとき。学習用途や小規模な並列処理に向く。", tradeoff: "スレッドプール管理やタスク結果の取得は自前で書く必要がある。大量タスクの管理は ExecutorService に委ねるほうが安全。" },
    { name: "ExecutorService", whenToUse: "スレッドの生成・破棄をフレームワークに任せ、タスクの投入と結果取得に集中したいとき。", tradeoff: "Thread を直接使うより抽象度が高い分、スレッドの細かい制御（優先度・デーモン設定等）はやりにくい。" },
    { name: "Spring @Async", whenToUse: "Spring 環境でメソッド単位の非同期化をアノテーションだけで実現したいとき。", tradeoff: "フレームワーク依存が生まれる。スレッドプールの設定を意識しないと、デフォルトのプールサイズで詰まる場合がある。" },
  ],
  faq: [
    { question: "Thread 継承と Runnable 実装のどちらを使うべきですか。", answer: "Runnable 実装（またはラムダ式）を推奨します。Java は単一継承のため、Thread を継承すると他のクラスを継承できなくなります。テストも Runnable のほうが書きやすいです。" },
    { question: "仮想スレッドは従来のスレッドを完全に置き換えますか。", answer: "I/O バウンドな処理には適していますが、CPU バウンドな処理では従来のプラットフォームスレッドが有利です。用途に応じて使い分ける必要があります。" },
    { question: "スレッドの run() と start() の違いは何ですか。", answer: "start() は新しいスレッドを作成してその中で run() を呼びます。run() を直接呼ぶと呼び出し元のスレッドで同期実行されるため、並行処理になりません。" },
  ],
  codeTitle: "ThreadBasicDemo.java",
  codeSample: `public class ThreadBasicDemo {

    // Runnable をラムダ式で記述（推奨パターン）
    public static void main(String[] args) throws InterruptedException {

        // パターン1: ラムダ式で Runnable を直接書く
        var t1 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("[" + Thread.currentThread().getName() + "] count: " + i);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt(); // フラグを再セット
                    System.out.println(Thread.currentThread().getName() + ": 中断");
                    return;
                }
            }
        }, "worker-1");

        var t2 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("[" + Thread.currentThread().getName() + "] count: " + i);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
        }, "worker-2");

        t1.start(); // 新スレッドで実行開始
        t2.start();

        t1.join();  // t1 の完了を待つ
        t2.join();  // t2 の完了を待つ

        System.out.println("全スレッド完了");

        // スレッド情報の確認
        var current = Thread.currentThread();
        System.out.println("メインスレッド名: " + current.getName());
        System.out.println("デーモン: " + current.isDaemon());
        System.out.println("優先度: " + current.getPriority());
    }
}`,
},
{
  slug: "synchronized-basics",
  title: "Java synchronized でスレッドセーフを実現する方法",
  categorySlug: "threading",
  summary: "synchronized メソッドとブロックの使い分け、専用ロックオブジェクトの設計を整理する。",
  version: "Java 17",
  tags: ["synchronized", "スレッドセーフ", "排他制御", "ロック"],
  apiNames: ["synchronized", "Object.wait", "Object.notify"],
  description: "Java の synchronized メソッドとブロックの違いをスレッドセーフなカウンターで実演し、排他制御の使い分けを Java 8/17/21 対応で解説する。",
  lead: "マルチスレッド環境で共有データを操作すると、読み書きのタイミングが重なって結果が壊れるという問題に直面します。Java の synchronized キーワードは、この排他制御を言語レベルで実現する最も基本的な仕組みです。ただし、メソッド全体にかけるのかブロック単位にするのか、ロック対象を this にするのか専用オブジェクトにするのかで、性能と安全性が変わります。この記事では、スレッドアンセーフなカウンターで競合を実際に発生させたうえで、synchronized メソッドと synchronized ブロックの2つの書き方を比較します。実務でロック粒度の判断に迷ったときの指針を示します。",
  useCases: [
    "在庫数の加減算を複数スレッドから同時に行うバッチで、カウントのズレを防止する",
    "共有キャッシュへの読み書きを排他制御し、不整合なデータの読み出しを防ぐ",
    "ログファイルへの書き込みを synchronized ブロックで保護し、行の混在を防止する",
  ],
  cautions: [
    "synchronized メソッドは this をロック対象にするため、同じインスタンスの他の synchronized メソッドもブロックされる。粒度を細かくしたい場合は専用ロックオブジェクトを使う",
    "count++ は読み取り・加算・書き戻しの3ステップで実行される非アトミック操作。volatile を付けただけでは競合を防げない",
    "ロック対象に this を使うと、外部からそのインスタンスで synchronized を取られるリスクがある。private final Object lock = new Object() で専用ロックにするのが安全",
    "synchronized 内で長時間の I/O 操作を行うとスループットが大幅に低下する。ロック範囲は最小限にとどめる",
  ],
  relatedArticleSlugs: ["reentrant-lock", "volatile-keyword"],
  versionCoverage: {
    java8: "synchronized の仕組み自体は Java 1.0 から不変。instanceof のキャストが冗長になりがち。",
    java17: "パターンマッチング instanceof（Java 16+）でキャスト不要。var で型推論を活用できる。",
    java21: "synchronized の基本は同じ。switch パターンマッチングで結果の分岐を簡潔に書ける。",
    java8Code: `// Java 8: instanceof + 明示的キャスト
if (counter instanceof UnsafeCounter) {
    ((UnsafeCounter) counter).increment();
} else if (counter instanceof SafeCounter) {
    ((SafeCounter) counter).increment();
}`,
    java17Code: `// Java 17: パターンマッチング instanceof
if (counter instanceof UnsafeCounter c) {
    c.increment();
} else if (counter instanceof SafeCounter c) {
    c.increment();
}`,
    java21Code: `// Java 21: sealed interface + switch で結果を型安全に処理
sealed interface CountResult permits Match, Mismatch {}
record Match(int value) implements CountResult {}
record Mismatch(int expected, int actual)
    implements CountResult {}`,
  },
  libraryComparison: [
    { name: "synchronized", whenToUse: "ロック範囲が明確で、タイムアウトや条件待ちが不要なシンプルな排他制御。", tradeoff: "ロック取得の試行やタイムアウトが設定できない。ReentrantLock より機能は限定的だが、書き間違いが少ない。" },
    { name: "ReentrantLock", whenToUse: "tryLock でタイムアウト付きロック取得や、Condition による条件待ちが必要なとき。", tradeoff: "lock/unlock の対を自分で管理する必要があり、finally での unlock を忘れるとデッドロックに直結する。" },
    { name: "AtomicInteger", whenToUse: "単純なカウンタやフラグなど、単一変数のアトミック操作で済む場合。", tradeoff: "複数変数にまたがる一貫性保証はできない。複合操作にはロックが必要。" },
  ],
  faq: [
    { question: "synchronized メソッドとブロックのどちらを使うべきですか。", answer: "ロック範囲を最小限にできる synchronized ブロックが基本です。メソッド全体をロックする必要がない場面で synchronized メソッドを使うと、不要なブロッキングが発生します。" },
    { question: "static メソッドに synchronized を付けるとどうなりますか。", answer: "ロック対象がインスタンスではなくクラスオブジェクト（Class<?>）になります。全インスタンスで共有されるため影響範囲が広く、意図しない待ちが発生しやすいです。" },
    { question: "synchronized の中で例外が発生した場合、ロックは解放されますか。", answer: "はい、synchronized ブロックを抜ける際にロックは自動的に解放されます。ReentrantLock と異なり、finally での明示的な unlock は不要です。" },
  ],
  codeTitle: "SynchronizedDemo.java",
  codeSample: `public class SynchronizedDemo {

    // synchronized ブロック + 専用ロックオブジェクト（推奨）
    static class SafeCounter {
        private int count = 0;
        private final Object lock = new Object();

        public void increment() {
            synchronized (lock) {
                count++;
            }
        }

        public int getCount() {
            synchronized (lock) {
                return count;
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        var counter = new SafeCounter();
        var threadCount = 10;
        var incrementsPerThread = 1000;

        var threads = new Thread[threadCount];
        for (var i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                for (var j = 0; j < incrementsPerThread; j++) {
                    counter.increment();
                }
            });
            threads[i].start();
        }
        for (var t : threads) {
            t.join();
        }

        var expected = threadCount * incrementsPerThread;
        var actual = counter.getCount();
        System.out.printf("期待値=%d, 実際=%d, 一致=%b%n",
            expected, actual, expected == actual);
    }
}`,
},
{
  slug: "volatile-keyword",
  title: "Java volatile の可視性とアトミック操作の限界を実例で解説",
  categorySlug: "threading",
  summary: "volatile が保証するメモリ可視性と、インクリメントには使えない理由を実演する。",
  version: "Java 17",
  tags: ["volatile", "メモリ可視性", "AtomicBoolean", "AtomicInteger"],
  apiNames: ["volatile", "AtomicBoolean", "AtomicInteger", "AtomicInteger.incrementAndGet"],
  description: "volatile のメモリ可視性保証と count++ が非アトミックになる理由を AtomicInteger との比較で解説。Java 8/17/21 対応。",
  lead: "マルチスレッドでフラグを共有して「停止指示」を伝えたい場面は、バッチやポーリング処理で頻繁に出てきます。volatile を付ければ他のスレッドから変更が見えるようになりますが、「volatile さえ付ければスレッドセーフ」という理解は危険です。volatile が保証するのはメモリ可視性だけで、count++ のような複合操作のアトミック性は保証されません。この記事では、volatile フラグによるスレッド停止制御と、volatile カウンターで実際に競合が発生する様子を示し、AtomicInteger / AtomicBoolean との使い分けを明確にします。",
  useCases: [
    "バッチ処理のワーカースレッドに volatile boolean フラグで安全な停止指示を伝える",
    "設定リロードの完了フラグを volatile で共有し、他スレッドが最新の設定を参照できるようにする",
    "ステータス監視スレッドが volatile 変数を通じて進捗状態を確認する",
  ],
  cautions: [
    "volatile int count に対する count++ は読み取り・加算・書き戻しの3ステップ。volatile はステップ間の割り込みを防がないため競合する",
    "volatile はメモリ可視性だけを保証し、アトミック性は保証しない。複合操作には synchronized か Atomic 系クラスを使う",
    "volatile の効果を過信して synchronized を省略すると、テスト環境では通るが本番の高負荷時にだけ発覚するバグになりやすい",
    "JIT コンパイラが volatile なしのフィールドをレジスタにキャッシュすると、他スレッドの変更がいつまでも見えなくなる場合がある",
  ],
  relatedArticleSlugs: ["synchronized-basics", "atomic-counter"],
  versionCoverage: {
    java8: "volatile と Atomic 系クラスの使い方は同じ。匿名クラスで Runnable を書くためコードが冗長になる。",
    java17: "ラムダ式と var（JEP 286）で Thread 生成を簡潔に記述可能。record でフラグ状態を不変の値として扱うパターンも使える。",
    java21: "sealed interface + switch パターンマッチングで可視性テストの結果を型安全に分岐できる。",
    java8Code: `// Java 8: 匿名クラスで Runnable を記述
Thread worker = new Thread(new Runnable() {
    @Override
    public void run() {
        while (flag.isRunning()) {
            // 処理
        }
    }
}, "worker");`,
    java17Code: `// Java 17: ラムダ式 + var で簡潔に
var worker = new Thread(() -> {
    while (flag.isRunning()) {
        // 処理
    }
}, "worker");`,
    java21Code: `// Java 21: sealed interface で結果を型安全に表現
sealed interface Demo permits Demo.Vol, Demo.Atm {}
record Vol(int count, int expected) implements Demo {}
record Atm(int count, int expected) implements Demo {}`,
  },
  libraryComparison: [
    { name: "volatile", whenToUse: "フラグの読み書きなど、単一変数への単純な代入・参照でメモリ可視性だけ必要なとき。", tradeoff: "複合操作（インクリメント等）のアトミック性は保証されない。フラグ用途以外では使いどころが限定的。" },
    { name: "AtomicInteger / AtomicBoolean", whenToUse: "カウンターやフラグの更新をロックなしでアトミックに行いたいとき。", tradeoff: "複数変数にまたがる一貫性保証はできない。2つ以上の変数を同時に更新する場合は synchronized や Lock が必要。" },
    { name: "synchronized", whenToUse: "複数の変数にまたがる一貫性保証や、条件判定と更新を一括で行いたいとき。", tradeoff: "ロック競合による性能低下が起きやすい。単一変数のフラグ制御には過剰な場合がある。" },
  ],
  faq: [
    { question: "volatile を付ければ synchronized は不要ですか。", answer: "単純なフラグの読み書きなら volatile で足りますが、count++ のような複合操作には synchronized か AtomicInteger が必要です。volatile はアトミック性を保証しません。" },
    { question: "AtomicBoolean と volatile boolean の違いは何ですか。", answer: "どちらもメモリ可視性を保証しますが、AtomicBoolean は compareAndSet などのアトミック操作メソッドを持ちます。単純な set/get だけなら volatile boolean で十分です。" },
    { question: "volatile がないと本当に値の変更が見えないのですか。", answer: "JIT コンパイラがフィールドをレジスタにキャッシュするため、volatile なしだと変更が見えないケースは実際に起こります。ただし発生条件がJVM実装依存のため、テストで再現しにくいのが厄介です。" },
  ],
  codeTitle: "VolatileDemo.java",
  codeSample: `import java.util.concurrent.atomic.AtomicInteger;

public class VolatileDemo {

    // volatile フラグによるスレッド停止制御
    static class StopFlag {
        private volatile boolean running = true;

        public void stop() { running = false; }
        public boolean isRunning() { return running; }
    }

    // volatile カウンターの競合を示す
    static class VolatileCounter {
        private volatile int count = 0;
        public void increment() { count++; } // 非アトミック
        public int getCount() { return count; }
    }

    // AtomicInteger で安全にカウント
    static class SafeCounter {
        private final AtomicInteger count = new AtomicInteger(0);
        public void increment() { count.incrementAndGet(); }
        public int getCount() { return count.get(); }
    }

    public static void main(String[] args) throws InterruptedException {

        var flag = new StopFlag();
        var worker = new Thread(() -> {
            int loops = 0;
            while (flag.isRunning()) {
                loops++;
                try { Thread.sleep(10); }
                catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return;
                }
            }
            System.out.println("ループ終了: " + loops + " 回");
        }, "worker");

        worker.start();
        Thread.sleep(100);
        flag.stop(); // volatile なので即座に伝わる
        worker.join();

        var volCounter = new VolatileCounter();
        var safeCounter = new SafeCounter();
        var threads = new Thread[5];
        for (var i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (var j = 0; j < 1000; j++) {
                    volCounter.increment();
                    safeCounter.increment();
                }
            });
            threads[i].start();
        }
        for (var t : threads) { t.join(); }

        System.out.printf("volatile:  期待=5000, 実際=%d%n", volCounter.getCount());
        System.out.printf("atomic:    期待=5000, 実際=%d%n", safeCounter.getCount());
    }
}`,
},
{
  slug: "reentrant-lock",
  title: "Java ReentrantLock と ReadWriteLock の使い方",
  categorySlug: "threading",
  summary: "tryLock によるタイムアウト制御と ReadWriteLock による読み書き分離を整理する。",
  version: "Java 17",
  tags: ["ReentrantLock", "ReadWriteLock", "tryLock", "Lock"],
  apiNames: ["ReentrantLock", "ReentrantReadWriteLock", "Lock.lock", "Lock.tryLock", "Lock.unlock"],
  description: "ReentrantLock の tryLock でタイムアウト付きロック取得、ReadWriteLock で読み書き分離を行う方法を解説。Java 8/17/21 対応。",
  lead: "synchronized はシンプルで扱いやすい排他制御ですが、ロック取得にタイムアウトを設けたい、読み取りは並行で許可したいといった要件には対応できません。java.util.concurrent.locks パッケージの ReentrantLock と ReadWriteLock は、こうした場面で synchronized の代わりに使える柔軟なロック機構です。この記事では、ReentrantLock の基本的な lock/unlock パターンから tryLock によるタイムアウト付きロック取得、ReadWriteLock による読み取り並行・書き込み排他の実装まで、実務で使いどころの多いパターンを整理します。finally での unlock を忘れたときの影響もあわせて確認します。",
  useCases: [
    "キャッシュの読み取りは複数スレッドで並行に許可し、更新時だけ排他ロックをかけて整合性を保つ",
    "外部システム連携で tryLock を使い、一定時間内にロックが取れなければリトライやエラーハンドリングに回す",
    "バッチの進捗テーブル更新で ReentrantLock を使い、同一レコードへの同時書き込みを防止する",
  ],
  cautions: [
    "lock() を呼んだら必ず finally ブロックで unlock() する。例外発生時に unlock が漏れるとデッドロックの原因になる",
    "tryLock() の戻り値を確認せずにクリティカルセクションに入るとロックなしで共有データを操作してしまう",
    "ReadWriteLock の readLock 内で writeLock を取ろうとするとデッドロックになる。ロックのアップグレードは標準 API ではサポートされていない",
    "ReentrantLock は synchronized と異なり、ロックの解放を開発者が管理する責任を負う。コードレビューで unlock 漏れを重点的にチェックすべき",
  ],
  relatedArticleSlugs: ["synchronized-basics", "condition-lock"],
  versionCoverage: {
    java8: "ReentrantLock, ReadWriteLock ともに Java 5 から利用可能。匿名クラスでの記述が冗長になる。",
    java17: "var と record を組み合わせ、ロック結果を LockResult(boolean acquired, int value) のように型安全に扱える。",
    java21: "sealed interface + switch パターンマッチングでロック操作の種別を型安全に分岐できる。",
    java8Code: `// Java 8: tryLock の結果を boolean で管理
boolean gotLock = lock.tryLock(
    100, TimeUnit.MILLISECONDS);
if (gotLock) {
    try {
        count++;
    } finally {
        lock.unlock();
    }
}`,
    java17Code: `// Java 17: record でロック結果を値として返す
record LockResult(boolean acquired, int value) {}
// tryLock 成功時
return new LockResult(true, count);
// 失敗時
return new LockResult(false, count);`,
    java21Code: `// Java 21: sealed + switch でロック操作を分岐
sealed interface LockOp permits Inc, TryInc {}
record Inc() implements LockOp {}
record TryInc(long timeoutMs) implements LockOp {}
return switch (op) {
    case Inc() -> { counter.increment(); yield r; }
    case TryInc(var ms) -> counter.tryIncrement(ms);
};`,
  },
  libraryComparison: [
    { name: "ReentrantLock", whenToUse: "タイムアウト付きロック取得、公平性の設定、Condition による条件待ちが必要なとき。", tradeoff: "lock/unlock の対を自分で管理する必要がある。synchronized より書くべきコードが増え、unlock 忘れのリスクがある。" },
    { name: "synchronized", whenToUse: "ブロックを抜ければ自動解放される簡易なロックで十分なとき。コードの簡潔さを優先する場面。", tradeoff: "タイムアウトや条件待ちの機能がない。ロック粒度の細かい制御もやりにくい。" },
    { name: "StampedLock", whenToUse: "読み取りが圧倒的に多く、楽観的読み取り（optimistic read）で性能を最大化したいとき。", tradeoff: "API が複雑で誤用のリスクが高い。再入可能（reentrant）ではないため、再帰呼び出しがあるとデッドロックする。" },
  ],
  faq: [
    { question: "synchronized と ReentrantLock のどちらを先に検討すべきですか。", answer: "まず synchronized で十分かを検討します。タイムアウトや Condition が必要な場合のみ ReentrantLock に切り替えるのが、コードの簡潔さを保つ方針です。" },
    { question: "ReadWriteLock は読み取りが多い場面で常に有利ですか。", answer: "読み取りが大半を占める場面では有利ですが、書き込みが頻繁だと writeLock の取得待ちが増え、ReentrantLock と大差なくなります。読み書き比率で判断してください。" },
    { question: "ReentrantLock のコンストラクタで fair=true を指定すべきですか。", answer: "公平性ありにすると待機時間の長いスレッドが優先されますが、スループットは低下します。スレッド飢餓が問題になる場合のみ true にしてください。" },
  ],
  codeTitle: "ReentrantLockDemo.java",
  codeSample: `import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReentrantLockDemo {

    // ReentrantLock によるスレッドセーフカウンター
    static class SafeCounter {
        private int count = 0;
        private final Lock lock = new ReentrantLock();

        public void increment() {
            lock.lock();
            try {
                count++;
            } finally {
                lock.unlock(); // 必ず finally で解放
            }
        }

        public boolean tryIncrement(long timeoutMs) throws InterruptedException {
            if (lock.tryLock(timeoutMs, TimeUnit.MILLISECONDS)) {
                try {
                    count++;
                    return true;
                } finally {
                    lock.unlock();
                }
            }
            return false;
        }

        public int getCount() { return count; }
    }

    // ReadWriteLock によるキャッシュ
    static class CachedData {
        private String data = "初期データ";
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock();

        public String read() {
            rwLock.readLock().lock();
            try {
                return data;
            } finally {
                rwLock.readLock().unlock();
            }
        }

        public void write(String newData) {
            rwLock.writeLock().lock();
            try {
                data = newData;
            } finally {
                rwLock.writeLock().unlock();
            }
        }
    }

    public static void main(String[] args) throws Exception {
        var counter = new SafeCounter();
        var threads = new Thread[5];
        for (var i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (var j = 0; j < 1000; j++) counter.increment();
            });
            threads[i].start();
        }
        for (var t : threads) t.join();
        System.out.println("結果: " + counter.getCount() + " (期待: 5000)");

        // ReadWriteLock: 読み取りは並行、書き込みは排他
        var cache = new CachedData();
        var r1 = new Thread(() ->
            System.out.println("[reader-1] " + cache.read()), "reader-1");
        var r2 = new Thread(() ->
            System.out.println("[reader-2] " + cache.read()), "reader-2");
        r1.start(); r2.start();
        r1.join(); r2.join();

        var w1 = new Thread(() -> cache.write("更新データ"), "writer-1");
        w1.start(); w1.join();
        System.out.println("[main] " + cache.read());
    }
}`,
},
{
  slug: "condition-lock",
  title: "Java Condition でプロデューサー・コンシューマーを実装する",
  categorySlug: "threading",
  summary: "ReentrantLock と Condition で容量制限付きキューのスレッド間通信を実現する。",
  version: "Java 17",
  tags: ["Condition", "ReentrantLock", "await", "signal", "プロデューサー・コンシューマー"],
  apiNames: ["Condition", "Condition.await", "Condition.signalAll", "ReentrantLock", "Condition.awaitNanos"],
  description: "ReentrantLock の Condition で容量制限付きキューを実装し、プロデューサー・コンシューマーのスレッド間通信を解説。Java 8/17/21 対応。",
  lead: "あるスレッドがデータを生産し、別のスレッドがそれを消費するというプロデューサー・コンシューマーのパターンは、非同期処理やメッセージキューの基盤となる構造です。Object.wait/notify でも実装できますが、ReentrantLock と Condition を使えば「キューが満杯でない」「キューが空でない」という2つの条件を分離でき、無駄な通知を減らせます。この記事では、容量制限付きキューを Condition で実装し、満杯時のブロッキングと空時のブロッキングを個別に制御する方法を示します。タイムアウト付きの取得も扱います。",
  useCases: [
    "バッチ処理で読み込みスレッドと書き込みスレッドを分離し、メモリ使用量を制御しながらパイプライン処理を行う",
    "ログ収集で非同期にログをキューに投入し、別スレッドで一括書き込みするバッファリング機構を実装する",
    "受注データの取込で、CSVパース（Producer）とDB登録（Consumer）を容量制限付きキューで接続する",
  ],
  cautions: [
    "await() を if ではなく while ループで囲むのが鉄則。偽の起床（spurious wakeup）が発生する可能性があるため、条件の再確認が必要",
    "signalAll() の代わりに signal() を使うと、通知対象が1スレッドに限定される。複数コンシューマーがいる場合は signalAll() が安全",
    "lock() と unlock() の対応が崩れると Condition.await() から復帰できなくなる。必ず try-finally で unlock する",
    "awaitNanos のタイムアウト計算は戻り値を使って残り時間を管理する。Thread.sleep のように単純に待つのとは異なる",
  ],
  relatedArticleSlugs: ["reentrant-lock", "executor-service"],
  versionCoverage: {
    java8: "Condition は Java 5 から利用可能。匿名クラスで Producer/Consumer スレッドを記述するため冗長。",
    java17: "ラムダ式 + var で簡潔に記述可能。record でキューアイテムを不変データとして表現できる。",
    java21: "Virtual Thread で Producer/Consumer を起動できる。OS スレッドの制約なく大量のパイプラインを構成可能。",
    java8Code: `// Java 8: 匿名クラスで Producer を記述
Thread producer = new Thread(new Runnable() {
    @Override
    public void run() {
        try {
            for (int i = 1; i <= 5; i++) {
                queue.put(i);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
});`,
    java17Code: `// Java 17: ラムダ式 + var で簡潔に
var producer = new Thread(() -> {
    try {
        for (var i = 1; i <= 5; i++) {
            queue.put(i);
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});`,
    java21Code: `// Java 21: 仮想スレッドで Producer/Consumer を起動
var producer = Thread.ofVirtual().start(() -> {
    try {
        for (var i = 1; i <= 5; i++) {
            queue.put(i);
        }
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
});`,
  },
  libraryComparison: [
    { name: "Condition（ReentrantLock）", whenToUse: "条件ごとに待機キューを分離し、不要な起床を避けたいとき。容量制限付きキューの自作に向く。", tradeoff: "BlockingQueue を自作することになるため、バグのリスクが高い。プロダクション用途では標準の BlockingQueue を優先すべき。" },
    { name: "BlockingQueue（ArrayBlockingQueue 等）", whenToUse: "プロデューサー・コンシューマーを標準 API だけで安全に実装したいとき。Condition の管理が不要。", tradeoff: "内部実装は Condition と同じ仕組みだが、API として隠蔽されている。仕組みを理解する学習用途には Condition 実装が有効。" },
    { name: "Disruptor（LMAX）", whenToUse: "超低レイテンシが求められる金融系やリアルタイムデータ処理。", tradeoff: "ロックフリー設計で高性能だが、API が独特で学習コストが高い。一般的な業務システムではオーバーキル。" },
  ],
  faq: [
    { question: "Object.wait/notify と Condition.await/signal の違いは何ですか。", answer: "Condition は1つの Lock に対して複数の待機キューを持てます。Object.wait/notify では1つのモニターに1つの待機キューしかないため、条件ごとの通知分離ができません。" },
    { question: "await() を while ではなく if で囲むとどうなりますか。", answer: "偽の起床（spurious wakeup）で条件を満たさないまま処理が進む可能性があります。仕様上 spurious wakeup は起こりうるとされているため、while で条件を再確認するのが正しい書き方です。" },
    { question: "BlockingQueue があるのに Condition を学ぶ必要はありますか。", answer: "BlockingQueue の内部は Condition で実装されています。仕組みを理解しておくと、カスタムキューの設計やデバッグで役立ちます。" },
  ],
  codeTitle: "ConditionQueueDemo.java",
  codeSample: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class ConditionQueueDemo {

    // Condition を使った容量制限付きキュー
    static class BoundedQueue<T> {
        private final Deque<T> queue = new ArrayDeque<>();
        private final int capacity;
        private final ReentrantLock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition();
        private final Condition notEmpty = lock.newCondition();

        BoundedQueue(int capacity) {
            this.capacity = capacity;
        }

        void put(T item) throws InterruptedException {
            lock.lock();
            try {
                while (queue.size() == capacity) {
                    notFull.await(); // 空きが出るまで待機
                }
                queue.addLast(item);
                System.out.println("[Producer] 追加: " + item
                    + " (サイズ: " + queue.size() + ")");
                notEmpty.signalAll(); // Consumer に通知
            } finally {
                lock.unlock();
            }
        }

        T take() throws InterruptedException {
            lock.lock();
            try {
                while (queue.isEmpty()) {
                    notEmpty.await(); // データが入るまで待機
                }
                var item = queue.removeFirst();
                System.out.println("[Consumer] 取得: " + item
                    + " (サイズ: " + queue.size() + ")");
                notFull.signalAll(); // Producer に通知
                return item;
            } finally {
                lock.unlock();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        var queue = new BoundedQueue<Integer>(3);

        var producer = new Thread(() -> {
            try {
                for (var i = 1; i <= 5; i++) {
                    queue.put(i);
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        var consumer = new Thread(() -> {
            try {
                for (var i = 0; i < 5; i++) {
                    queue.take();
                    Thread.sleep(200);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
        System.out.println("完了");
    }
}`,
},
{
  slug: "deadlock-detection",
  title: "Java デッドロックの原因と検出・回避の実装パターンを解説",
  categorySlug: "threading",
  summary: "デッドロックの4条件と、ロック順序統一・tryLock・ThreadMXBean による検出を整理する。",
  version: "Java 17",
  tags: ["デッドロック", "tryLock", "ThreadMXBean", "ロック順序"],
  apiNames: ["ThreadMXBean", "ManagementFactory.getThreadMXBean", "ThreadMXBean.findDeadlockedThreads", "ReentrantLock.tryLock"],
  description: "Java のデッドロックの発生条件と、ロック取得順序の統一・tryLock・ThreadMXBean による検出を実装例で解説する。Java 8/17/21 対応。",
  lead: "マルチスレッドプログラミングで最も厄介な問題のひとつがデッドロックです。2つ以上のスレッドが互いのロック解放を待ち続け、処理が永久に停止します。発生すると自然に回復することはなく、アプリケーションの再起動が必要になります。デッドロックは4つの条件が同時に成立したときに起こり、そのうち1つを崩せば防止できます。この記事では、デッドロックの発生条件を確認したうえで、ロック取得順序の統一による予防、tryLock によるタイムアウト付き回避、ThreadMXBean によるランタイム検出の3つのアプローチを、動くコードとともに整理します。",
  useCases: [
    "複数テーブルの排他更新を行うバッチで、テーブルのロック取得順序を統一してデッドロックを防止する",
    "外部システム連携で tryLock を使い、一定時間内にロック取得できなければタイムアウトエラーとして扱う",
    "本番環境の監視バッチで ThreadMXBean を定期実行し、デッドロックの発生を早期に検知してアラートを出す",
  ],
  cautions: [
    "デッドロックはテスト環境では再現しにくい。タイミング依存のため、本番の高負荷時にのみ発生するケースが多い",
    "synchronized のネストが深くなるとロック取得順序の管理が困難になる。ネストは2段以下に抑える設計を心がける",
    "tryLock のタイムアウト値を短くしすぎると、正常な負荷時にもロック取得失敗が頻発する。業務の許容待ち時間に基づいて設定する",
    "ThreadMXBean.findDeadlockedThreads() は ReentrantLock のデッドロックも検出できるが、カスタムロック機構のデッドロックは検出できない",
  ],
  relatedArticleSlugs: ["reentrant-lock", "synchronized-basics"],
  versionCoverage: {
    java8: "ThreadMXBean と ReentrantLock.tryLock ともに Java 5 以降で利用可能。コード記述が冗長になる程度で機能差はない。",
    java17: "var（JEP 286）によるローカル変数の型推論で tryLock や TimeUnit の記述が簡潔になる。record でロック状態を表現することも可能。",
    java21: "sealed interface でデッドロックの4条件を型として表現し、switch パターンマッチングで分岐できる。",
    java8Code: `// Java 8: tryLock の結果を boolean で管理
boolean gotA = lockA.tryLock(
    100, java.util.concurrent.TimeUnit.MILLISECONDS);
if (!gotA) return false;
try {
    boolean gotB = lockB.tryLock(
        100, java.util.concurrent.TimeUnit.MILLISECONDS);
    // ...`,
    java17Code: `// Java 17: var で型推論を活用
var gotA = lockA.tryLock(100, TimeUnit.MILLISECONDS);
if (!gotA) return false;
try {
    var gotB = lockB.tryLock(100, TimeUnit.MILLISECONDS);
    if (!gotB) return false;
    // ...`,
    java21Code: `// Java 21: sealed interface でデッドロック条件を型化
sealed interface Cond permits ME, HW, NP, CW {}
record ME(String desc) implements Cond {} // 相互排除
record CW(String desc) implements Cond {} // 循環待機
switch (cond) {
    case CW(var d) -> System.out.println(d);
    // ...
};`,
  },
  libraryComparison: [
    { name: "ロック順序統一（設計パターン）", whenToUse: "デッドロックを根本から防止したいとき。設計段階でロック取得順を決めておく。", tradeoff: "コードベースが大きくなると順序の管理が難しい。ドキュメント化とコードレビューでの徹底が必要。" },
    { name: "tryLock（ReentrantLock）", whenToUse: "ロック取得に時間制限を設け、デッドロック状態でもタイムアウトで脱出したいとき。", tradeoff: "デッドロック自体を防止するのではなく、発生時のリカバリー手段。タイムアウト後のリトライ戦略を別途設計する必要がある。" },
    { name: "ThreadMXBean", whenToUse: "本番環境でデッドロックの発生を監視・検出したいとき。運用監視ツールとの連携に向く。", tradeoff: "デッドロックの検出はできるが、自動的な解消はできない。検出後のアクション（アラート・再起動等）は別途実装が必要。" },
  ],
  faq: [
    { question: "デッドロックが発生したらスレッドダンプを取るべきですか。", answer: "はい。jstack やスレッドダンプでどのスレッドがどのロックを保持・待機しているかを確認できます。ThreadMXBean.findDeadlockedThreads() でもプログラム内から検出可能です。" },
    { question: "synchronized だけでデッドロックは起きますか。", answer: "はい。synchronized でも複数のロックを異なる順序で取得するとデッドロックが発生します。tryLock による回避策を使いたい場合は ReentrantLock に変更する必要があります。" },
    { question: "デッドロックの4条件のうち、最も崩しやすいのはどれですか。", answer: "循環待機の防止（ロック取得順序の統一）が最も実用的です。設計段階で順序を決めておけば、コードの変更だけで防止できます。" },
  ],
  codeTitle: "DeadlockDetectionDemo.java",
  codeSample: `import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class DeadlockDetectionDemo {

    // デッドロックのパターン（ロック逆順取得）
    static class DeadlockRisk {
        private final Object lockA = new Object();
        private final Object lockB = new Object();

        // A -> B の順
        public void task1() {
            synchronized (lockA) {
                System.out.println("Task1: lockA 取得");
                synchronized (lockB) {
                    System.out.println("Task1: lockB 取得");
                }
            }
        }

        // 修正版: 順序を A -> B に統一
        public void task2Fixed() {
            synchronized (lockA) {
                System.out.println("Task2: lockA 取得");
                synchronized (lockB) {
                    System.out.println("Task2: lockB 取得");
                }
            }
        }
    }

    // tryLock によるタイムアウト付きデッドロック回避
    static class TimeoutLockDemo {
        private final Lock lockA = new ReentrantLock();
        private final Lock lockB = new ReentrantLock();

        public boolean tryBothLocks() throws InterruptedException {
            var gotA = lockA.tryLock(100, TimeUnit.MILLISECONDS);
            if (!gotA) return false;
            try {
                var gotB = lockB.tryLock(100, TimeUnit.MILLISECONDS);
                if (!gotB) return false;
                try {
                    System.out.println("両ロック取得成功");
                    return true;
                } finally {
                    lockB.unlock();
                }
            } finally {
                lockA.unlock();
            }
        }
    }

    // ThreadMXBean でデッドロック検出
    static void checkDeadlock() {
        var bean = ManagementFactory.getThreadMXBean();
        var ids = bean.findDeadlockedThreads();
        if (ids == null) {
            System.out.println("デッドロックなし");
        } else {
            System.out.println("デッドロック検出: " + ids.length + " スレッド");
        }
    }

    public static void main(String[] args) throws Exception {
        checkDeadlock();

        var demo = new TimeoutLockDemo();
        var success = demo.tryBothLocks();
        System.out.println("tryLock 結果: " + success);
    }
}`,
},
{
  slug: "executor-service",
  title: "Java ExecutorService でスレッドプールを管理する方法",
  categorySlug: "threading",
  summary: "FixedThreadPool・CachedThreadPool の使い分けと Future のタイムアウト制御を整理する。",
  version: "Java 17",
  tags: ["ExecutorService", "Future", "スレッドプール", "Callable", "shutdown"],
  apiNames: ["ExecutorService", "Executors.newFixedThreadPool", "Executors.newCachedThreadPool", "Future.get", "ExecutorService.shutdown"],
  description: "Java の ExecutorService によるスレッドプール管理と Future のタイムアウト付き取得を解説する。Java 21 の仮想スレッドプールにも対応。",
  lead: "Thread を直接 new してタスクごとに生成・破棄すると、スレッド生成のオーバーヘッドが無視できなくなり、同時実行数の制御も困難です。ExecutorService はスレッドプールを管理し、タスクの投入と結果の取得を分離する仕組みを提供します。固定サイズのプール、キャッシュプール、シングルスレッドプールなど用途別のファクトリが用意されており、タスクの結果は Future を通じてタイムアウト付きで取得できます。各プールの特性と使い分け、shutdown の正しいタイミング、Future.get のタイムアウト制御まで、業務で頻出するパターンに絞って整理した。",
  useCases: [
    "帳票生成バッチでスレッドプールサイズを固定し、DB コネクション数の上限を超えないよう並列度を制御する",
    "外部 API への並列呼び出しを ExecutorService に投入し、Future.get でタイムアウト付きで結果を集約する",
    "定期実行バッチを ScheduledExecutorService で管理し、cron の代わりにアプリ内でスケジュールを制御する",
  ],
  cautions: [
    "shutdown() を呼ばないとスレッドプールが生き残り、アプリケーションが終了しない。try-finally で必ず shutdown する",
    "newCachedThreadPool はタスク数に応じてスレッドを無制限に作成するため、大量タスクを投入すると OutOfMemoryError の原因になる",
    "Future.get() にタイムアウトを設定しないと、タスクが完了しない限りメインスレッドが永久にブロックされる",
    "ExecutorService を static フィールドに持つ場合、アプリ終了時の shutdown 呼び出しを忘れやすい。ShutdownHook の登録を検討する",
    "submit() の戻り値（Future）を握りつぶすと、タスク内の例外が検知されない。少なくとも Future.get() で例外の有無を確認する",
    "実務では shutdown() の呼び忘れでアプリが終了しない問題や、newCachedThreadPool に大量タスクを投入して OOM を起こすケースがある。プール種別の選択とシャットダウン処理は実装チェックリストに入れておくこと。",
  ],
  relatedArticleSlugs: ["thread-basics", "thread-local"],
  versionCoverage: {
    java8: "ExecutorService は Java 5 から利用可能。Callable を匿名クラスで書く必要があり、コードが冗長になる。",
    java17: "ラムダ式 + var + record で簡潔に記述可能。record でタスク情報を保持する設計パターンが使える。",
    java21: "Executors.newVirtualThreadPerTaskExecutor() でタスクごとに仮想スレッドを割り当てるプールが利用可能。",
    java8Code: `// Java 8: Callable を匿名クラスで記述
Future<String> future = executor.submit(
    new Callable<String>() {
        @Override
        public String call() throws Exception {
            Thread.sleep(100);
            return "完了: " + Thread.currentThread().getName();
        }
    });`,
    java17Code: `// Java 17: ラムダ式 + record で簡潔に
record Task(String name, long sleepMs) {}
var task = new Task("タスク-1", 100);
var future = executor.submit(() -> {
    Thread.sleep(task.sleepMs());
    return "完了: " + task.name();
});`,
    java21Code: `// Java 21: 仮想スレッドプール
var executor = Executors
    .newVirtualThreadPerTaskExecutor();
try {
    var future = executor.submit(() -> {
        return "仮想スレッド: "
            + Thread.currentThread().isVirtual();
    });
    System.out.println(future.get());
} finally {
    executor.shutdown();
}`,
  },
  libraryComparison: [
    { name: "ExecutorService（標準 API）", whenToUse: "スレッドプール管理と Future によるタスク結果取得を標準 API だけで完結させたいとき。", tradeoff: "CompletableFuture と比べて非同期チェーンの記述力が弱い。複数タスクの合成が冗長になる。" },
    { name: "CompletableFuture", whenToUse: "非同期タスクのチェーン（thenApply, thenCombine 等）で複雑な非同期フローを構築したいとき。", tradeoff: "チェーンが深くなるとデバッグが困難になる。例外ハンドリングの見落としにも注意が必要。" },
    { name: "Spring TaskExecutor", whenToUse: "Spring 環境で DI 経由のスレッドプール管理を行いたいとき。設定の外部化が容易。", tradeoff: "フレームワーク依存。Spring 以外の環境では使えず、内部的には ExecutorService のラッパー。" },
  ],
  faq: [
    { question: "FixedThreadPool と CachedThreadPool はどう使い分けますか。", answer: "並列度の上限を制御したいときは FixedThreadPool、短時間のタスクが散発的に発生する場面では CachedThreadPool が向いています。CachedThreadPool は上限なしにスレッドを作るため、タスク量が読めない場合は避けてください。" },
    { question: "shutdown() と shutdownNow() の違いは何ですか。", answer: "shutdown() は新規タスクの受付を停止し、投入済みタスクの完了を待ちます。shutdownNow() は実行中タスクへの interrupt を試み、未実行タスクのリストを返します。通常は shutdown + awaitTermination を使います。" },
    { question: "Java 21 の仮想スレッドプールは既存コードをそのまま置き換えられますか。", answer: "API は互換性がありますが、synchronized ブロック内でのブロッキングが仮想スレッドのキャリアスレッドをピン留めする問題があります。性能テストで確認してから移行してください。" },
  ],
  codeTitle: "ExecutorServiceDemo.java",
  codeSample: `import java.util.ArrayList;
import java.util.concurrent.*;

public class ExecutorServiceDemo {

    public static void main(String[] args) throws Exception {
        System.out.println("=== 固定スレッドプール ===");
        var executor = Executors.newFixedThreadPool(3);

        try {
            var futures = new ArrayList<Future<String>>();
            for (var i = 1; i <= 5; i++) {
                var taskName = "タスク-" + i;
                var future = executor.submit(() -> {
                    Thread.sleep(100);
                    return "完了: " + taskName + " by "
                        + Thread.currentThread().getName();
                });
                futures.add(future);
            }

            for (var future : futures) {
                System.out.println(future.get());
            }
        } finally {
            executor.shutdown();
            executor.awaitTermination(5, TimeUnit.SECONDS);
        }

        System.out.println("\\n=== タイムアウト付き Future.get() ===");
        var timeoutExecutor = Executors.newSingleThreadExecutor();
        try {
            var future = timeoutExecutor.submit(() -> {
                Thread.sleep(500);
                return "重い処理の結果";
            });
            try {
                var result = future.get(200, TimeUnit.MILLISECONDS);
                System.out.println(result);
            } catch (TimeoutException e) {
                System.out.println("タイムアウト → キャンセル");
                future.cancel(true);
            }
        } finally {
            timeoutExecutor.shutdown();
        }
    }
}`,
},
{
  slug: "thread-local",
  title: "Java ThreadLocal の使い方とメモリリーク防止策",
  categorySlug: "threading",
  summary: "ThreadLocal でスレッド固有データを保持する方法と remove() によるメモリリーク防止を整理する。",
  version: "Java 17",
  tags: ["ThreadLocal", "メモリリーク", "SimpleDateFormat", "スレッド固有"],
  apiNames: ["ThreadLocal", "ThreadLocal.withInitial", "ThreadLocal.set", "ThreadLocal.get", "ThreadLocal.remove"],
  description: "ThreadLocal によるスレッド固有データの保持と remove() によるメモリリーク防止、SimpleDateFormat の安全な使い方を解説。Java 8/17/21 対応。",
  lead: "Web アプリケーションでリクエストごとのユーザーIDを保持したり、スレッドアンセーフな SimpleDateFormat をスレッドごとに安全に使いたい場面で、ThreadLocal は定番の解決策です。ただし、スレッドプール環境で remove() を呼び忘れると、前のリクエストのデータが次のリクエストに漏洩したり、大きなオブジェクトが GC されずメモリリークを引き起こしたりします。この記事では、ThreadLocal の基本的な使い方と withInitial による初期化、remove() を忘れた場合の影響、そして Java 21 の仮想スレッドとの組み合わせ時の注意点までを整理します。",
  useCases: [
    "Web フレームワークのフィルターでリクエスト開始時にユーザーIDを ThreadLocal に設定し、サービス層で参照する",
    "スレッドアンセーフな SimpleDateFormat を ThreadLocal で包み、スレッドごとに独立したインスタンスを保持する",
    "トランザクションIDやトレースIDを ThreadLocal に保持し、ログ出力時に自動的に付与する",
  ],
  cautions: [
    "スレッドプール環境では ThreadLocal.remove() を必ず呼ぶ。スレッドが再利用されるため、前のタスクのデータが残留する",
    "remove() を忘れるとメモリリークの原因になる。特に ClassLoader を跨ぐ場合はリークの影響が深刻になりやすい",
    "InheritableThreadLocal は親スレッドの値を子スレッドに引き継ぐが、スレッドプールでは親子関係が曖昧になるため意図通りに動かないケースがある",
    "Java 21 の仮想スレッドは大量に生成できるため、ThreadLocal に大きなオブジェクトを持つとメモリ消費が爆発する。ScopedValue の利用を検討する",
  ],
  relatedArticleSlugs: ["executor-service", "atomic-counter"],
  versionCoverage: {
    java8: "ThreadLocal は Java 1.2 から利用可能。withInitial は Java 8 で追加。匿名クラスで initialValue をオーバーライドする書き方が主流。",
    java17: "withInitial + ラムダ式で簡潔に初期化可能。record と組み合わせてコンテキスト情報をまとめられる。",
    java21: "仮想スレッドとの組み合わせではメモリ消費に注意。ScopedValue（Preview）が ThreadLocal の代替として設計されている。",
    java8Code: `// Java 8: 匿名クラスで initialValue を定義
private static final ThreadLocal<SimpleDateFormat>
    holder = new ThreadLocal<SimpleDateFormat>() {
        @Override
        protected SimpleDateFormat initialValue() {
            return new SimpleDateFormat("yyyy-MM-dd");
        }
    };`,
    java17Code: `// Java 17: withInitial + ラムダ式で簡潔に
private static final ThreadLocal<SimpleDateFormat>
    holder = ThreadLocal.withInitial(
        () -> new SimpleDateFormat("yyyy-MM-dd"));`,
    java21Code: `// Java 21: ScopedValue（Preview）は remove 不要
// static final ScopedValue<Integer> USER_ID
//     = ScopedValue.newInstance();
// ScopedValue.where(USER_ID, 42).run(() -> {
//     System.out.println(USER_ID.get()); // 42
// }); // ブロックを抜けると自動解放`,
  },
  libraryComparison: [
    { name: "ThreadLocal（標準 API）", whenToUse: "スレッド固有のデータを保持し、メソッドの引数で受け渡さずにアクセスしたいとき。", tradeoff: "remove() を忘れるとメモリリークや情報漏洩のリスクがある。スレッドプール環境では特に注意。" },
    { name: "ScopedValue（Java 21 Preview）", whenToUse: "仮想スレッド環境で ThreadLocal の代わりにスコープ付きの値を安全に共有したいとき。", tradeoff: "Java 21 時点ではまだ Preview API。正式化は Java 23 以降の見込み。既存コードとの互換性はない。" },
    { name: "MDC（SLF4J）", whenToUse: "ログにリクエストIDやトレースIDを自動付与したいとき。内部的に ThreadLocal を使用。", tradeoff: "ロギングフレームワーク依存。MDC.clear() を忘れるとスレッドプールでの情報漏洩リスクは ThreadLocal と同じ。" },
  ],
  faq: [
    { question: "ThreadLocal の remove() はいつ呼ぶべきですか。", answer: "try-finally でタスクの最後に必ず呼びます。Web アプリではリクエスト処理の完了時にフィルターで remove() するのが定石です。" },
    { question: "SimpleDateFormat の代わりに DateTimeFormatter を使えばThreadLocal は不要ですか。", answer: "はい。DateTimeFormatter はスレッドセーフなので ThreadLocal で包む必要がありません。新規コードでは DateTimeFormatter の利用を推奨します。" },
    { question: "InheritableThreadLocal は使うべきですか。", answer: "親スレッドの値を子に自動継承しますが、スレッドプールでは親子関係が曖昧で意図通りに動かないことがあります。明示的に値を渡す設計のほうが安全です。" },
  ],
  codeTitle: "ThreadLocalDemo.java",
  codeSample: `import java.text.SimpleDateFormat;
import java.util.Date;

public class ThreadLocalDemo {

    // withInitial でスレッドごとに独立した SimpleDateFormat を保持
    private static final ThreadLocal<SimpleDateFormat> dateFormat =
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));

    // リクエストコンテキストの模擬
    private static final ThreadLocal<Integer> userId = new ThreadLocal<>();

    public static void setUserId(int id) { userId.set(id); }
    public static Integer getUserId() { return userId.get(); }
    public static void clearUserId() { userId.remove(); }

    public static String formatDate(Date date) {
        return dateFormat.get().format(date);
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== ThreadLocal でスレッド固有データを保持 ===");

        Runnable task = () -> {
            var threadId = (int) (Thread.currentThread().getId() % 1000);
            setUserId(threadId);
            try {
                Thread.sleep(50);
                System.out.println(Thread.currentThread().getName()
                    + " -> userId=" + getUserId());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                clearUserId(); // 必ず remove()
            }
        };

        var t1 = new Thread(task, "thread-A");
        var t2 = new Thread(task, "thread-B");
        var t3 = new Thread(task, "thread-C");
        t1.start(); t2.start(); t3.start();
        t1.join(); t2.join(); t3.join();

        System.out.println("\\n=== SimpleDateFormat の ThreadLocal 解決策 ===");
        Runnable formatTask = () -> {
            var result = formatDate(new Date());
            System.out.println(Thread.currentThread().getName()
                + " -> " + result);
        };
        var f1 = new Thread(formatTask, "format-1");
        var f2 = new Thread(formatTask, "format-2");
        f1.start(); f2.start();
        f1.join(); f2.join();
    }
}`,
},
]
