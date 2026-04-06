import type { BlogArticle } from "./types"

export const article: BlogArticle = {
  slug: "csv-export-oom-string-concat-in-debug-log",
  title: "CSV出力で1000件超えたらOOM ― 原因はlog.debugの文字列結合",
  description:
    "バッチのCSV出力が1000件を超えるとOutOfMemoryErrorで落ちる。1行ずつ追記しているのになぜ？原因はlog.debugに仕込んだString連結だった。",
  publishedAt: "2026-06-01",
  tags: ["OutOfMemoryError", "ログ", "String連結", "バッチ", "JDBC", "トラブルシューティング"],
  relatedArticleSlugs: ["out-of-memory", "logging-basics", "memory-usage", "gc-basics"],
  relatedToolSlugs: [],

  symptom: `DBからレコードを1件ずつ取得して、CSVに成形して1行ずつファイルに追記するバッチ処理があったんですよね。数百件のときは問題なく動いていたのに、1000件を超えたあたりで OutOfMemoryError が出てバッチがそのまま落ちた。CSV出力は1行ずつ書いているから、レコード数が増えてもメモリは一定のはず。なのにOOMって、正直「え、なんで？」という感じでした。`,

  environment: "JDK 1.1.8 / 素の JDBC / バッチ処理",

  wrongApproach: `まずデバッグログを確認してみたんだけど、これがよく分からない。log.debug で処理レコードを1行ずつ出力しているはずなのに、ログファイルには何も出ていない（本番環境のログレベルが INFO 以上だったので debug は出力されない設定だった）。ログに何も残っていないから、どこでメモリが膨らんでいるのか見当がつかなかった。CSV書き出し処理自体は1行ずつ追記しているし、JDBC の ResultSet も1件ずつ next() で回しているし、どこにもメモリを大量に使う要素が見当たらない。`,

  rootCause: `原因は log.debug に渡していた文字列の組み立て方だった。処理の中で「ここまで処理したレコードの内容」をデバッグ用に記録していたんだけど、そのコードが String + String の連結で全レコード分を積み上げていた。ループのたびに前の文字列に新しい行を足していくので、1000件超えると数MBの巨大な String オブジェクトができあがる。しかも log.debug なのでログレベルが INFO 以上のときは実際にはログに出力されない。でも Java の仕様上、ログメソッドに渡す引数の評価（= 文字列の結合）はログレベルに関係なく実行される。つまり「ログには何も出ていないのに、メモリだけは食い続けている」という状態だった。ログに痕跡が残らないから原因の特定が遅れました。`,

  solution: `各処理の前後で Runtime.getRuntime().totalMemory() と freeMemory() を出力して、どの処理でメモリ使用率が急に上がるかを特定した。CSV書き出し処理のループ内で急激にメモリが増えていることが分かり、ループ内のコードを1行ずつ確認したところ、log.debug に渡す文字列の連結が原因だと判明。String を積み上げるのをやめて、1レコードごとに独立した文字列で log.debug を呼ぶように修正した。`,

  solutionCode: `// 修正前: ループのたびに文字列が膨らむ
String debugLog = "";
while (rs.next()) {
    String line = buildCsvLine(rs);
    writer.write(line);
    debugLog += line + "\\n";  // ← これが原因。全件分の文字列がメモリに残る
}
log.debug(debugLog);

// 修正後: 1レコードごとにログ出力（文字列を溜めない）
while (rs.next()) {
    String line = buildCsvLine(rs);
    writer.write(line);
    if (log.isDebugEnabled()) {
        log.debug("processed: " + line);
    }
}

// ヒープ使用量の確認に使ったコード
Runtime rt = Runtime.getRuntime();
long used = rt.totalMemory() - rt.freeMemory();
System.out.println("Heap used: " + (used / 1024 / 1024) + "MB");`,

  prevention: `log.debug でも引数の文字列は必ず評価されるので、重い文字列結合を渡すときは log.isDebugEnabled() でガードするのが鉄則。あと、ループ内で String を += で連結するのはそもそも危険。StringBuilder を使うか、そもそも溜めずに1件ずつ処理するのが安全です。OOM の原因がログ周りだと、ログファイルに痕跡が残らないので発見が遅れがち。メモリの増減を見るなら Runtime.getRuntime() でヒープ使用量を出すのが手っ取り早いです。`,

  searchKeywords: [
    "Java OutOfMemoryError CSV",
    "Java OOM バッチ",
    "Java String 連結 メモリ",
    "Java log.debug メモリ",
    "Java ログ isDebugEnabled",
    "Java ヒープ使用量 確認",
    "Java バッチ メモリリーク",
  ],

  faq: [
    {
      question: "log.debug はログに出ないのになぜメモリを食うの？",
      answer:
        "ログレベルで出力は抑制されますが、引数に渡す文字列の生成（String連結など）はメソッド呼び出し前に評価されます。isDebugEnabled() でガードしないと無駄にメモリを消費します。",
    },
    {
      question: "String の += がダメなら何を使えばいい？",
      answer:
        "StringBuilder を使うか、そもそもループ内で文字列を溜めない設計にするのがベストです。ただし今回のケースでは溜めること自体が不要だったので、1件ずつ log.debug に渡す形に変えました。",
    },
    {
      question: "OOM の原因箇所を特定するにはどうすればいい？",
      answer:
        "Runtime.getRuntime() の totalMemory() と freeMemory() の差分を各処理の前後で出力するのが手軽です。急にメモリ使用量が跳ね上がる箇所を特定できます。",
    },
  ],
}
