import type { BlogArticle } from "./types"

export const article: BlogArticle = {
  slug: "struts1-static-method-bottleneck-concurrent",
  title: "Struts1で20人アクセスした瞬間に重くなる原因と対処",
  description:
    "10人なら普通なのに20人で激重に。Struts1のAction内で呼んでいたstaticメソッドがファイルI/OとDB接続を抱えていて、同時アクセスで詰まっていた話。",
  publishedAt: "2026-04-01",
  tags: ["Struts1", "static", "パフォーマンス", "同時アクセス", "ボトルネック", "トラブルシューティング"],
  relatedArticleSlugs: ["synchronized-basics", "singleton-pattern", "thread-basics", "performance-basics"],
  relatedToolSlugs: [],

  symptom: `Struts 1 のWebアプリで、10人くらいのアクセスだと普通に動いているのに、20人ほどが同時にアクセスした途端、急にレスポンスが重くなる現象が起きたんですよね。エラーが出るわけではなく、じわじわ遅くなる感じ。ユーザーからは「画面が固まった」「ボタン押しても反応しない」みたいな問い合わせが来て、でもしばらく待つと返ってくる。サーバーのCPUやメモリは余裕があるのに、なぜかリクエストの処理だけが遅い。`,

  environment: "Struts 1 / Apache Tomcat",

  wrongApproach: `まずログをひたすら追いかけた。アプリケーションログにエラーは出ていないし、レスポンスタイムを見ても特定の処理が際立って遅いわけではない。全体的にじんわり遅くなっている。次に再現テストをやってみた。開発環境で10スレッドだと問題なし、20スレッドに増やすとレスポンスタイムが一気に跳ね上がる。再現はできたけど「どこが詰まっているのか」がなかなか分からなかった。DBのスロークエリログにも引っかからないし、Tomcat のスレッドプールもまだ枯渇していない。`,

  rootCause: `原因は Action 内から呼び出していた static メソッドだった。このメソッドの中でファイル I/O と DB 接続を使っていて、これらのリソースが排他的だった。static メソッド自体は synchronized ではなかったけど、内部で使っているリソース（ファイルハンドルやDB コネクション）が実質的にボトルネックになっていた。10人程度なら順番待ちがそこまで長くならないので問題が見えない。でも20人が同時に同じ static メソッドを叩くと、リソースの取り合いで待ちが発生して、リクエスト全体が詰まり始める。しかも「ちょっと重い」程度の処理だったので、単体テストでは全然気にならないレベル。同時アクセスが増えて初めて顕在化するタイプのボトルネックだった。`,

  solution: `static メソッドを使うのをやめて、リクエストごとにオブジェクトを生成してインスタンスメソッドとして呼び出すように変更した。これでファイル I/O や DB 接続がリクエストごとに独立して確保されるようになり、他のリクエストと排他的にリソースを奪い合うことがなくなった。`,

  solutionCode: `// 修正前: static メソッド経由で共有リソースにアクセス
public class SomeAction extends Action {
    public ActionForward execute(...) {
        // 全リクエストが同じ static メソッドを通る
        // 内部のファイルI/O・DB接続がボトルネックに
        String result = HeavyUtil.processData(param);
        ...
    }
}

public class HeavyUtil {
    private static Connection conn = ...;  // 共有DB接続
    private static File lockFile = ...;    // 共有ファイル

    public static String processData(String param) {
        // ファイル読み書き + DB問い合わせ
        // 同時に呼ばれるとリソースの取り合いで詰まる
    }
}

// 修正後: リクエストごとにインスタンスを生成
public class SomeAction extends Action {
    public ActionForward execute(...) {
        // リクエストごとに独立したインスタンス
        DataProcessor processor = new DataProcessor();
        String result = processor.processData(param);
        ...
    }
}

public class DataProcessor {
    public String processData(String param) {
        // 各インスタンスが自分のDB接続・ファイルハンドルを使う
        try (Connection conn = dataSource.getConnection()) {
            ...
        }
    }
}`,

  prevention: `static メソッドの中でファイル I/O や DB 接続などの排他リソースを使っていると、同時アクセス時にボトルネックになる。少人数だと問題が見えないのが厄介なので、負荷テストで同時接続数を段階的に増やして確認するのが大事です。static にしていいのはステートレスで軽い処理だけ。リソースを使う処理はインスタンスメソッドにして、リクエストごとにオブジェクトを生成するのが安全です。`,

  searchKeywords: [
    "Struts 同時アクセス 遅い",
    "Java static メソッド パフォーマンス",
    "Java static ボトルネック",
    "Java 同時アクセス 重い",
    "Tomcat 同時接続 レスポンス 遅い",
    "Java Webアプリ 負荷 急に重くなる",
    "Struts1 パフォーマンス問題",
  ],

  faq: [
    {
      question: "static メソッドを使うと必ず遅くなるの？",
      answer:
        "いいえ。static メソッド自体は問題ありません。中で排他的なリソース（DB接続、ファイル、ロック）を使っている場合に、同時アクセスで詰まる可能性があります。",
    },
    {
      question: "少人数で問題なかったのになぜ急に重くなる？",
      answer:
        "排他リソースの待ち時間は同時アクセス数に比例して増えます。10人なら待ち時間が許容範囲でも、20人になると待ち行列が一気に伸びて体感できるレベルの遅延になります。",
    },
    {
      question: "この問題をテストで事前に検出するにはどうすればいい？",
      answer:
        "JMeter や Gatling などで同時接続数を段階的に増やす負荷テストを行います。レスポンスタイムが特定の同時接続数を超えたあたりで急に悪化するなら、ボトルネックが存在している証拠です。",
    },
  ],
}
