import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "stream-filter-map",
    title: "Java Stream.filter と map を業務コードで組み合わせる",
    categorySlug: "collections",
    summary: "DTO 変換や一覧絞り込みを読みやすく実装するパターン。",
    version: "Java 17",
    tags: ["Stream", "filter", "map"],
    apiNames: ["Stream.filter", "Stream.map"],
    description: "Java の Stream API で filter と map を組み合わせ、業務コードの一覧絞り込みと DTO 変換を実装する方法を Java 8/17/21 対応で解説する。",
    lead: "業務システムでは、データベースから取得した一覧を条件で絞り込み、画面表示用の DTO に変換する処理が頻繁に発生します。for ループとif文で書くと行数が膨らみ、可読性が下がります。Stream API の filter と map を使えば、データの流れを宣言的に記述でき、意図が伝わりやすいコードになります。この記事では、実務でよく使うパターンを中心に、filter と map の組み合わせ方を整理します。",
    useCases: [
      "社員一覧から特定部署のメンバーだけを抽出して画面用 DTO に変換する",
      "受注データから未出荷の注文だけを絞り込んで出荷指示リストを作る",
      "商品マスタから在庫ゼロの商品を除外して価格リストを出力する",
    ],
    cautions: [
      "Stream は1回しか消費できない。再利用したい場合は Supplier<Stream> を使う。",
      "副作用のある処理（DB更新など）を map 内で行わない。forEach を使う。",
      "null が混在するリストでは filter(Objects::nonNull) を先頭に入れると安全。",
    ],
    relatedArticleSlugs: ["collection-basics", "sort-grouping", "functional-interface"],
    versionCoverage: {
      java8: "Stream API は Java 8 から使用可能。リスト生成は Arrays.asList、終端操作は collect(Collectors.toList()) が必須。",
      java17: "List.of で不変リスト初期化、toList() で collect 不要に。record とメソッド参照で記述が簡潔になる。",
      java21: "基本は Java 17 と同じ。switch 式と Stream を組み合わせた分類パターンが自然に書ける。",
      java8Code: `// Java 8: Arrays.asList + collect(Collectors.toList())
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
List<String> upper = names.stream()
    .filter(s -> s.length() > 3)
    .map(s -> s.toUpperCase())
    .collect(Collectors.toList());`,
      java17Code: `// Java 17: List.of + メソッド参照 + toList()
var names = List.of("Alice", "Bob", "Charlie");
var upper = names.stream()
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .toList();`,
      java21Code: `// Java 21: switch 式と Stream で分類しながら変換
var products = List.of(
    new Product("apple", 100, "fruit"),
    new Product("milk",  200, "dairy"));
products.stream().forEach(p -> {
    String label = switch (p.category()) {
        case "fruit" -> "果物";
        case "dairy" -> "乳製品";
        default -> "その他";
    };
    System.out.println(p.name() + ": " + label);
});`,
    },
    libraryComparison: [
      { name: "Eclipse Collections", whenToUse: "大量データのコレクション処理でパフォーマンスを優先する場合。", tradeoff: "標準 API で十分な場合が多い。" },
      { name: "Guava（FluentIterable / ImmutableList）", whenToUse: "Java 8 未満の環境で関数型スタイルのフィルタ・変換を書きたい場合や、不変コレクションを安全に扱いたいとき。", tradeoff: "Java 8 以降は Stream API が標準で同等の機能を提供するため、新規プロジェクトでの導入理由は薄い。既存コードで Guava に依存している場合の保守用途が主になる。" },
    ],
    faq: [
      { question: "filter と map の順番はどちらが先ですか？", answer: "先に filter で絞り込んでから map で変換する方が、変換処理の回数が減り効率的です。" },
      { question: "Stream で例外が発生した場合はどうなりますか？", answer: "チェック例外は Stream 内で直接 throw できないため、try-catch で包むか RuntimeException に変換します。" },
      { question: "並列 Stream はいつ使うべきですか？", answer: "要素数が数万件以上で、各要素の処理が重い場合に効果があります。少量データでは逆にオーバーヘッドが生じます。" },
    ],
    codeTitle: "filter と map で一覧を変換する",
    codeSample: `import java.util.List;

public class StreamFilterMap {

    record Employee(String name, String dept, int age) {}
    record EmployeeDto(String name, int age) {}

    public static void main(String[] args) {
        var employees = List.of(
            new Employee("田中", "開発", 28),
            new Employee("鈴木", "営業", 35),
            new Employee("佐藤", "開発", 42),
            new Employee("高橋", "人事", 31)
        );

        var devMembers = employees.stream()
            .filter(e -> "開発".equals(e.dept()))
            .map(e -> new EmployeeDto(e.name(), e.age()))
            .toList();

        devMembers.forEach(System.out::println);
    }
}`,
  },
{
  slug: "collection-basics",
  title: "Java コレクションの選び方と基本操作の実務的な使い分け解説",
  categorySlug: "collections",
  summary: "List・Map・Set の使い分けと、不変コレクションの作り方を整理する。",
  version: "Java 17",
  tags: ["List", "Map", "Set", "不変コレクション", "ArrayList", "HashMap"],
  apiNames: ["List.of", "Map.of", "Set.of", "List.copyOf", "Collections.unmodifiableList", "ArrayList", "HashMap", "TreeMap"],
  description: "ArrayList・HashMap・HashSet の基本操作と List.of / Map.of による不変コレクションの使い分けを Java 8/17/21 対応で解説する。",
  lead: "業務コードでは List、Map、Set のどれかを選んでデータを保持する場面が日常的に発生します。ArrayList と LinkedList のどちらを使うか、HashMap と TreeMap の違いは何か、初期化に List.of を使って良いのかなど、基本でありながら実務で判断を迫られるポイントは意外と多くあります。この記事では、各コレクションの特性と選定基準を整理したうえで、不変コレクション（List.of / Map.of）と Collections.unmodifiableList の違い、Java 21 で追加された SequencedCollection の意味合いまでを、動くコードとともに解説します。外部ライブラリなしで扱える範囲に絞り、現場でそのまま使える初期化パターンとよくある落とし穴を押さえます。",
  useCases: [
    "マスタデータの一覧を List.of で不変リストとして保持し、画面表示やバリデーションの参照元にする",
    "商品コードと商品名の対応表を Map.of で定義し、CSV 取込時の名称変換に使う",
    "重複チェックが必要な入力値（メールアドレス等）を HashSet に投入し、重複検知と排除を同時に行う",
  ],
  cautions: [
    "List.of() や Map.of() が返す不変コレクションに add/put を呼ぶと UnsupportedOperationException になる。変更が必要な場合は new ArrayList<>(List.of(...)) でラップする",
    "Collections.unmodifiableList は元のリストへの参照を保持するため、元リストが変更されると不変リスト側にも影響する。完全に独立したコピーが必要なら List.copyOf を使う",
    "Map.of は最大10エントリーまでしか受け付けない。11件以上は Map.ofEntries + Map.entry で初期化する",
    "HashMap のキーに可変オブジェクトを使うと、状態変更後に get で見つからなくなる。キーには String や Integer など不変型を使うのが原則",
    "TreeMap はキーの自然順序（Comparable）で並ぶが、null キーを入れると NullPointerException になる。null キーが必要な場面は HashMap を使う",
  ],
  relatedArticleSlugs: ["stream-filter-map", "sort-grouping"],
  versionCoverage: {
    java8: "リストの初期化は Arrays.asList か new ArrayList。不変化は Collections.unmodifiableList で行うが、元リストの変更が透過する点に注意。",
    java17: "List.of / Map.of / Set.of で簡潔に不変コレクションを生成できる。List.copyOf で安全なコピーも可能。var で型推論も利用可。",
    java21: "SequencedCollection が追加され、getFirst() / getLast() / addFirst() で先頭・末尾への操作が統一的に書ける。",
    java8Code: `// Java 8: Arrays.asList + unmodifiableList で不変化
List<String> base = new ArrayList<>(
        Arrays.asList("Java", "Python", "Go"));
List<String> immutable =
        Collections.unmodifiableList(base);
// ただし base.add("Kotlin") すると immutable にも反映される`,
    java17Code: `// Java 17: List.of で完全な不変リストを簡潔に生成
List<String> immutable = List.of("Java", "Python", "Go");
// immutable.add("Kotlin") → UnsupportedOperationException
// 変更可能にしたい場合は ArrayList でラップ
var mutable = new ArrayList<>(immutable);`,
    java21Code: `// Java 21: SequencedCollection で先頭・末尾を統一操作
SequencedCollection<String> seq =
        new ArrayList<>(List.of("X", "Y", "Z"));
String first = seq.getFirst(); // "X"
String last  = seq.getLast();  // "Z"
seq.addFirst("W"); // 先頭に追加`,
  },
  libraryComparison: [
    { name: "標準 API（java.util）", whenToUse: "List / Map / Set の基本操作と不変コレクションの生成で事足りる場面。依存なしで済む。", tradeoff: "Multimap や BiMap のような特殊構造が必要な場合は自前実装が冗長になる。" },
    { name: "Guava（ImmutableList / ImmutableMap）", whenToUse: "Java 8 環境で不変コレクションを安全に扱いたいとき。Multimap や BiMap が必要な場合。", tradeoff: "Java 9 以降は List.of / Map.of で大半がカバーできるため、新規プロジェクトでは導入理由が薄い。" },
    { name: "Eclipse Collections", whenToUse: "プリミティブ特化コレクション（IntList 等）でメモリ効率を追求する大量データ処理。", tradeoff: "API 体系が独自で学習コストが高い。標準 API との混在はかえってコードの統一感を損なう。" },
  ],
  faq: [
    { question: "ArrayList と LinkedList はどう使い分ければよいですか。", answer: "ほとんどの業務コードでは ArrayList で十分です。LinkedList はランダムアクセスが O(n) で遅く、メモリ消費も大きいため、先頭への頻繁な挿入・削除が必要な場面以外では選ぶ理由が薄いです。" },
    { question: "List.of と Collections.unmodifiableList のどちらを使うべきですか。", answer: "新しいコードでは List.of を推奨します。unmodifiableList は元リストの変更が透過するため、完全な不変性が保証されません。既存コードとの互換で元リストを持つ場合は List.copyOf を検討してください。" },
    { question: "Map.of で11件以上のエントリーを初期化するにはどうすればよいですか。", answer: "Map.ofEntries(Map.entry(\"key1\", val1), Map.entry(\"key2\", val2), ...) を使います。可変長引数で件数の上限がなく、不変マップを返します。" },
  ],
  codeTitle: "CollectionBasics.java",
  codeSample: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class CollectionBasics {

    public static void main(String[] args) {

        // List.of() で不変リストを簡潔に作成（Java 9+）
        List<String> languages = List.of("Java", "Python", "Go");
        System.out.println("不変リスト: " + languages);

        // 変更可能にするには ArrayList でラップ
        var mutableList = new ArrayList<>(languages);
        mutableList.add("Kotlin");
        System.out.println("変更可能リスト: " + mutableList);

        // Map.of() で不変マップを簡潔に作成（最大10エントリー）
        Map<String, Integer> priceMap = Map.of(
                "apple", 100, "banana", 150, "cherry", 200);
        System.out.println("apple の価格: " + priceMap.get("apple"));

        // HashMap で変更可能なマップを作成
        var mutableMap = new HashMap<>(priceMap);
        mutableMap.put("grape", 250);

        // getOrDefault でキー不在時のデフォルト値を指定
        int price = mutableMap.getOrDefault("melon", 0);
        System.out.println("melon の価格（デフォルト0）: " + price);

        // TreeMap でキー昇順に自動ソート
        var sortedMap = new TreeMap<>(mutableMap);
        System.out.println("TreeMap（昇順）: " + sortedMap);

        Set<String> tags = new HashSet<>();
        tags.add("Java");
        tags.add("Stream");
        tags.add("Java"); // 重複は無視される
        System.out.println("Set size: " + tags.size()); // 2

        // Set.of() で不変セット
        Set<String> immutableTags = Set.of("A", "B", "C");
        System.out.println("不変セット: " + immutableTags);

        Map<String, Integer> largeMap = Map.ofEntries(
                Map.entry("a", 1), Map.entry("b", 2),
                Map.entry("c", 3), Map.entry("d", 4),
                Map.entry("e", 5), Map.entry("f", 6),
                Map.entry("g", 7), Map.entry("h", 8),
                Map.entry("i", 9), Map.entry("j", 10),
                Map.entry("k", 11));
        System.out.println("Map.ofEntries size: " + largeMap.size());
    }
}`,
},
{
  slug: "sort-grouping",
  title: "Java Stream でソートとグルーピングを業務データに使う",
  categorySlug: "collections",
  summary: "Comparator による複合ソートと Collectors.groupingBy による集計パターン。",
  version: "Java 17",
  tags: ["Stream", "Comparator", "groupingBy", "ソート", "集計"],
  apiNames: ["Comparator.comparing", "Comparator.thenComparing", "Collectors.groupingBy", "Collectors.counting", "Collectors.summingInt", "Collectors.partitioningBy", "Collectors.joining", "Collectors.teeing"],
  description: "Java Stream の Comparator による複合キーソートと groupingBy / partitioningBy を使った集計処理を業務データで Java 8/17/21 対応で実装する方法を解説する。",
  lead: "一覧データを部署順・金額順でソートする、部署別に人数や合計を集計する、一定の閾値で2グループに分割する。こうした処理は業務システムで頻繁に登場しますが、Comparator の合成や Collectors の組み合わせに慣れるまでは記述が冗長になりがちです。この記事では、Comparator.comparing と thenComparingInt による複合キーソート、groupingBy + counting / summingInt による部門別集計、partitioningBy による二分割、joining による文字列結合、さらに Java 12 で追加された Collectors.teeing による同時集計まで、業務で実際に書く形のコードで解説します。record とメソッド参照を活用して、読みやすさと型安全性を両立させるパターンも示します。",
  useCases: [
    "社員一覧を部署昇順 → 給与降順でソートし、管理帳票や画面表示に使う",
    "売上データを商品カテゴリ別に groupingBy で集計し、カテゴリごとの件数・合計金額・平均単価を一覧化する",
    "受注データを金額閾値（例: 100万円以上/未満）で partitioningBy して、承認フローの振り分けに使う",
  ],
  cautions: [
    "Comparator.comparing のラムダでフィールドの型が曖昧な場合、明示的な型パラメータが必要になる。(Employee e) -> e.department のように引数に型を書くか、メソッド参照 Employee::department を使う",
    "groupingBy のキーに null が含まれると NullPointerException になる。事前に filter(e -> e.department() != null) で除外するか、デフォルト値に置換する",
    "Collectors.toList() が返すリストは可変だが、Stream.toList()（Java 16+）は不変リスト。ソート結果を後から変更する必要があるなら collect(Collectors.toList()) を使う",
    "thenComparing で int フィールドを比較する場合は thenComparingInt を使う。thenComparing(e -> e.salary) だとオートボクシングが発生し、大量データでパフォーマンスに影響する",
    "Collectors.teeing は Java 12 以降で利用可能。Java 8 環境では2回の collect に分けるか、カスタム Collector を書く必要がある",
  ],
  relatedArticleSlugs: ["stream-filter-map", "collection-basics"],
  versionCoverage: {
    java8: "record が使えないためデータクラスは通常のクラスで定義する。collect(Collectors.toList()) が必須。teeing は使えない。",
    java17: "record + メソッド参照で groupingBy のキー指定が簡潔に。Stream.toList() でイミュータブルな結果を取得。teeing も利用可能。",
    java21: "基本は Java 17 と同じ。record を集計結果の格納に使い、SequencedCollection と組み合わせることで先頭・末尾の取得が統一的に書ける。",
    java8Code: `// Java 8: 通常クラス + ラムダで複合ソート
List<Employee> sorted = employees.stream()
    .sorted(Comparator.comparing(
            (Employee e) -> e.department)
        .thenComparingInt(e -> e.salary))
    .collect(Collectors.toList());`,
    java17Code: `// Java 17: record + メソッド参照で簡潔に
record Employee(String name, String department,
                int salary) {}
var sorted = employees.stream()
    .sorted(Comparator.comparing(Employee::department)
        .thenComparingInt(Employee::salary))
    .toList();`,
    java21Code: `// Java 21: teeing + record で複数集計を1パスで実行
record DeptSummary(long count, int total,
                   double average) {}
var summary = employees.stream()
    .collect(Collectors.teeing(
        Collectors.counting(),
        Collectors.summingInt(Employee::salary),
        (c, t) -> new DeptSummary(c, t, (double) t / c)
    ));`,
  },
  libraryComparison: [
    { name: "標準 Stream API（Comparator + Collectors）", whenToUse: "ソート・集計・分割の基本パターンで事足りる場面。依存なしで記述量も十分に少ない。", tradeoff: "複数の集計軸を同時に処理する場合、teeing のネストが深くなりやすい。" },
    { name: "DB / SQL 側での集計（GROUP BY + ORDER BY）", whenToUse: "大量データの集計を DB に任せた方がパフォーマンス上有利なとき。", tradeoff: "Java 側のビジネスロジックが SQL に漏れ出し、テストの DB 依存が増える。集計後の加工は結局 Java で行うことが多い。" },
    { name: "Eclipse Collections", whenToUse: "groupByEach や Bag など、標準 API にない集計構造が必要な大規模データ処理。", tradeoff: "学習コストが高く、標準 API で書けるレベルの処理には過剰。チーム内での認知負荷も考慮が必要。" },
  ],
  faq: [
    { question: "Comparator.comparing と Comparator.naturalOrder の違いは何ですか。", answer: "comparing はフィールドを抽出するキー関数を受け取って比較します。naturalOrder は Comparable を実装した要素そのものの自然順序で並べます。DTO のフィールド単位でソートするなら comparing を使います。" },
    { question: "groupingBy の結果を特定のキー順で取り出すにはどうすればよいですか。", answer: "groupingBy の第2引数に TreeMap::new を渡すと、キーの自然順序でソートされた Map が返ります。Collectors.groupingBy(Employee::department, TreeMap::new, Collectors.toList()) の形です。" },
    { question: "partitioningBy と groupingBy の使い分けの基準は何ですか。", answer: "2グループへの二分割なら partitioningBy が適しています。戻り値の Map<Boolean, List<T>> で true/false の両グループが必ず返るため、該当なしの場合も空リストが保証されます。3つ以上の分類には groupingBy を使います。" },
  ],
  codeTitle: "SortAndGrouping.java",
  codeSample: `import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SortAndGrouping {

    record Employee(String name, String department, int salary) {
        @Override
        public String toString() {
            return name + "(" + department + ", " + salary + "円)";
        }
    }

    public static void main(String[] args) {
        var employees = List.of(
            new Employee("田中", "営業", 350000),
            new Employee("鈴木", "開発", 420000),
            new Employee("佐藤", "営業", 380000),
            new Employee("山田", "開発", 450000),
            new Employee("伊藤", "人事", 320000),
            new Employee("加藤", "開発", 390000)
        );

        // ① 複合キーソート（部署昇順 → 給与昇順）
        var sorted = employees.stream()
                .sorted(Comparator.comparing(Employee::department)
                        .thenComparingInt(Employee::salary))
                .toList();
        System.out.println("部署→給与順:");
        sorted.forEach(e -> System.out.println("  " + e));

        // ② 部署別人数（groupingBy + counting）
        Map<String, Long> countByDept = employees.stream()
                .collect(Collectors.groupingBy(
                        Employee::department, Collectors.counting()));
        System.out.println("\\n部署別人数: " + countByDept);

        // ③ 部署別給与合計（groupingBy + summingInt）
        Map<String, Integer> totalByDept = employees.stream()
                .collect(Collectors.groupingBy(
                        Employee::department,
                        Collectors.summingInt(Employee::salary)));
        System.out.println("部署別給与合計: " + totalByDept);

        // ④ 部署別平均給与（groupingBy + averagingInt）
        Map<String, Double> avgByDept = employees.stream()
                .collect(Collectors.groupingBy(
                        Employee::department,
                        Collectors.averagingInt(Employee::salary)));
        System.out.println("部署別平均給与: " + avgByDept);

        // ⑤ 金額閾値で二分割（partitioningBy）
        Map<Boolean, List<Employee>> partition = employees.stream()
                .collect(Collectors.partitioningBy(
                        e -> e.salary() >= 400000));
        System.out.println("\\n40万円以上: " + partition.get(true));
        System.out.println("40万円未満: " + partition.get(false));

        // ⑥ 名前を区切り文字で結合（joining）
        String nameList = employees.stream()
                .map(Employee::name)
                .collect(Collectors.joining("、"));
        System.out.println("\\n社員一覧: " + nameList);

        // ⑦ 複数集計を1パスで実行（teeing, Java 12+）
        record DeptSummary(long count, int total, double average) {}
        Map<String, DeptSummary> summaryByDept = employees.stream()
                .collect(Collectors.groupingBy(
                        Employee::department,
                        Collectors.teeing(
                                Collectors.counting(),
                                Collectors.summingInt(Employee::salary),
                                (count, total) -> new DeptSummary(
                                        count, total,
                                        (double) total / count)
                        )));
        summaryByDept.forEach((dept, s) ->
                System.out.printf("%s: %d人, 合計%d円, 平均%.0f円%n",
                        dept, s.count(), s.total(), s.average()));
    }
}`,
},
]
