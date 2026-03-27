import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "functional-interface",
  title: "Java 関数型インターフェースの定義とラムダ式の実装方法解説",
  categorySlug: "functional",
  summary: "@FunctionalInterface の定義方法と、ラムダ式・メソッド参照による実装パターンを整理する。",
  version: "Java 17",
  tags: ["@FunctionalInterface", "ラムダ式", "メソッド参照", "Strategy パターン", "Comparator"],
  apiNames: ["@FunctionalInterface", "Comparator", "Predicate", "Comparator.comparing"],
  description: "@FunctionalInterface の定義とラムダ式による実装を、匿名クラスとの比較や Strategy パターンの置き換えまで Java 8/17/21 対応で解説する。",
  lead: "Java 8 で導入されたラムダ式と関数型インターフェースは、冗長な匿名クラスを置き換えるだけの構文糖に見えることがあります。しかし実務では、バリデーションルールの合成、価格計算ストラテジーの差し替え、ソート条件の動的組み立てなど、ロジックの部品化と組み合わせに直結する場面で力を発揮します。この記事では、@FunctionalInterface アノテーションの意味と自作インターフェースの定義方法を押さえたうえで、匿名クラスからラムダ式への移行、default メソッドによる合成、Comparator.comparing を使ったソート、メソッド参照の使い分けまでを一通り扱います。Java 17 では record との組み合わせでデータ型が簡潔になり、Java 21 では sealed interface と switch パターンマッチングで Strategy パターンを型安全に表現する選択肢も加わります。外部ライブラリなしで完結するコードを示しながら、現場で迷いやすい判断ポイントを整理します。",
  useCases: [
    "入力バリデーションルールを Validator<T> として定義し、and() で複数条件を合成して CSV 取込時に適用する",
    "価格計算の割引ロジック（定額値引き・率引き・会員割引）を関数型インターフェースで差し替え可能にする",
    "一覧画面のソート条件を Comparator.comparing + thenComparing で動的に組み立て、ユーザーの選択に応じて切り替える",
  ],
  cautions: [
    "@FunctionalInterface を付けなくてもラムダ式は使えるが、アノテーションを付けておくと抽象メソッドの追加時にコンパイルエラーで検出できる",
    "ラムダ式内で外部の変数を参照する場合、その変数は実質的に final でなければならない。ループ変数を直接キャプチャしようとするとコンパイルエラーになる",
    "Comparator.comparing のメソッド参照で null を含むフィールドを渡すと NullPointerException になる。Comparator.nullsFirst / nullsLast で明示的に順序を指定すること",
    "匿名クラスとラムダ式では this の参照先が異なる。ラムダ式の this は外側のクラスを指すため、自身のインスタンスを参照したい場合は匿名クラスを使う必要がある",
  ],
  relatedArticleSlugs: ["function-interface", "function-composition", "stream-filter-map"],
  versionCoverage: {
    java8: "匿名クラスの代替としてラムダ式が使える。Comparator のソートは Collections.sort に匿名クラスかラムダを渡す形が基本。",
    java17: "record でデータ型を簡潔に定義し、Comparator.comparing(Product::price) のようにメソッド参照と組み合わせて可読性が上がる。var による型推論も活用できる。",
    java21: "sealed interface + switch パターンマッチングで、Strategy パターンをラムダではなく型として表現できる。分岐の網羅性をコンパイラが検証する。",
    java8Code: `// Java 8: 匿名クラスで Comparator を渡す
Collections.sort(products, new Comparator<Product>() {
    @Override
    public int compare(Product a, Product b) {
        return Integer.compare(a.price, b.price);
    }
});
// ラムダ式に置き換え
products.sort((a, b) -> Integer.compare(a.price, b.price));`,
    java17Code: `// Java 17: record + Comparator.comparing + toList()
record Product(String name, int price) {}
var sorted = products.stream()
    .sorted(Comparator.comparing(Product::price))
    .toList();`,
    java21Code: `// Java 21: sealed interface で割引戦略を型安全に表現
sealed interface DiscountStrategy
    permits None, Percentage, Fixed {
    record None() implements DiscountStrategy {}
    record Percentage(double rate) implements DiscountStrategy {}
    record Fixed(int amount) implements DiscountStrategy {}
}
int result = switch (strategy) {
    case None n -> price;
    case Percentage p -> (int)(price * (1.0 - p.rate()));
    case Fixed f -> Math.max(0, price - f.amount());
};`,
  },
  libraryComparison: [
    { name: "標準 API（@FunctionalInterface + ラムダ式）", whenToUse: "自作のバリデーションや計算ロジックを部品化し、default メソッドで合成したいとき。依存ゼロで十分な表現力がある。", tradeoff: "複雑な合成パイプラインを組むと、型推論のエラーメッセージが読みにくくなることがある。" },
    { name: "Vavr (旧 Javaslang)", whenToUse: "Function0〜Function8 やカリー化、パターンマッチなど関数型プログラミングの語彙をフルに使いたいとき。", tradeoff: "学習コストが高く、チーム全体に浸透させるのが難しい。標準 API だけで足りる場面で導入すると過剰設計になりやすい。" },
    { name: "Google Guava（Function / Predicate）", whenToUse: "Java 8 以前のプロジェクトで関数型のインターフェースを使いたいとき。", tradeoff: "Java 8 以降は標準 API の java.util.function と役割が重複するため、新規プロジェクトでは標準 API を優先すべき。" },
  ],
  faq: [
    { question: "@FunctionalInterface を付けないとラムダ式は使えませんか。", answer: "付けなくても抽象メソッドが1つなら使えます。ただしアノテーションを付けると、メソッド追加時にコンパイルエラーで気付けるため、自作インターフェースには付けておくのが安全です。" },
    { question: "ラムダ式とメソッド参照はどう使い分けますか。", answer: "単一メソッドの委譲なら String::trim のようにメソッド参照の方が読みやすくなります。引数の加工や複数処理を含む場合はラムダ式を使います。" },
    { question: "匿名クラスをすべてラムダ式に置き換えて問題ありませんか。", answer: "this の参照先が変わる点と、複数の抽象メソッドを持つインターフェースには使えない点に注意してください。それ以外は基本的にラムダ式へ置き換えて問題ありません。" },
  ],
  codeTitle: "FunctionalInterfaceDemo.java",
  codeSample: `import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;

public class FunctionalInterfaceDemo {

    // 自作の関数型インターフェース
    @FunctionalInterface
    interface Validator<T> {
        boolean validate(T value);

        // default メソッドで合成を表現
        default Validator<T> and(Validator<T> other) {
            return value -> this.validate(value) && other.validate(value);
        }
    }

    // Strategy パターンをラムダで差し替え
    @FunctionalInterface
    interface PriceCalculator {
        int calculate(int basePrice);
    }

    record Product(String name, int price) {}

    public static void main(String[] args) {

        Validator<String> notEmpty = v -> v != null && !v.isEmpty();
        Validator<String> notTooLong = v -> v.length() <= 20;
        var combined = notEmpty.and(notTooLong);

        System.out.println("空文字: " + combined.validate(""));       // false
        System.out.println("OK: " + combined.validate("田中太郎"));    // true

        PriceCalculator tenPercent = price -> (int) (price * 0.9);
        PriceCalculator halfPrice = price -> price / 2;

        int base = 10000;
        System.out.println("10%引き: " + tenPercent.calculate(base)); // 9000
        System.out.println("半額: " + halfPrice.calculate(base));     // 5000

        var products = List.of(
            new Product("A", 3000),
            new Product("B", 1000),
            new Product("C", 2000)
        );
        var byPrice = Comparator.comparing(Product::price);
        var sorted = products.stream()
            .sorted(byPrice)
            .toList();
        System.out.println("価格昇順: " + sorted);

        Predicate<Product> isExpensive = p -> p.price() >= 2000;
        products.stream()
            .filter(isExpensive)
            .forEach(p -> System.out.println("2000円以上: " + p.name()));

        var names = List.of("田中", "山田", "鈴木");
        names.forEach(System.out::println);
    }
}`,
},
{
  slug: "function-interface",
  title: "Java Function・Consumer・Predicate の使い分け",
  categorySlug: "functional",
  summary: "java.util.function の主要インターフェース（Function, Consumer, Supplier, Predicate, BiFunction）の役割と実務での使い分けを整理する。",
  version: "Java 17",
  tags: ["Function", "Consumer", "Supplier", "Predicate", "BiFunction", "UnaryOperator"],
  apiNames: ["Function", "Consumer", "Supplier", "Predicate", "BiFunction", "UnaryOperator", "BinaryOperator"],
  description: "java.util.function の主要インターフェース Function・Consumer・Predicate・Supplier の使い分けを実務コード例で解説する。",
  lead: "java.util.function パッケージには Function、Consumer、Supplier、Predicate をはじめとする汎用の関数型インターフェースが揃っています。Stream API を使い始めると自然に触れることになりますが、「Function と UnaryOperator の違いは何か」「Consumer をどこで使うのか」「BiFunction はいつ出番があるのか」といった疑問が実務では頻繁に出てきます。この記事では、各インターフェースの入力・出力の型パターンを整理したうえで、商品データの変換・フィルタリング・割引計算・ログ出力といった業務に近い場面での使い方を示します。Java 17 では record と組み合わせることでデータ変換パイプラインが読みやすくなり、Java 21 では sealed interface による型安全な操作定義という選択肢も加わります。各インターフェースの関係を把握しておくと、Stream の中間操作や終端操作に渡すラムダ式の設計が格段にしやすくなります。",
  useCases: [
    "データベースから取得した Entity を画面表示用の DTO へ変換する Function<Entity, Dto> を定義し、Stream.map に渡す",
    "バッチ処理の各ステップで処理結果をログ出力する Consumer<StepResult> を定義し、forEach や peek で適用する",
    "商品検索の絞り込み条件を Predicate<Product> として組み立て、and/or/negate で動的にフィルタを構成する",
  ],
  cautions: [
    "Function<T, T> と UnaryOperator<T> は機能的に同じだが、UnaryOperator を使うと入出力が同じ型であることを型名で明示できる",
    "Consumer は副作用を持つ処理に使うため、Stream の中間操作 peek に渡す場合はデバッグ用途に限定すべき。本番コードで peek に業務ロジックを入れると処理順序の保証が難しくなる",
    "Supplier の遅延評価は get() を呼ぶまで実行されないため、重い初期化処理を Supplier に包むとパフォーマンス改善に使えるが、スレッドセーフではない点に注意",
    "BiFunction<T, U, R> の型パラメータが3つになるため、複雑なラムダ式ではローカル変数に型付きで分離した方が可読性が上がる",
  ],
  relatedArticleSlugs: ["functional-interface", "function-composition", "stream-filter-map"],
  versionCoverage: {
    java8: "Function, Consumer, Supplier, Predicate はすべて利用可能。リスト初期化は Arrays.asList、ラムダ変数には明示的な型宣言が必要。",
    java17: "var でラムダ変数の型推論が可能（キャスト構文が必要）。record と組み合わせることで、データの定義と変換パイプラインをコンパクトに書ける。",
    java21: "sealed interface で操作の種類を型として定義し、switch パターンマッチングで処理を振り分ける設計が可能。Function の代替として型安全な分岐を実現できる。",
    java8Code: `// Java 8: 明示的な型宣言でインターフェースを使う
Function<String, Integer> strLength = s -> s.length();
Consumer<String> printer = s -> System.out.println("[LOG] " + s);
Predicate<Integer> isPositive = n -> n > 0;
Predicate<Integer> isEven = n -> n % 2 == 0;
Predicate<Integer> isPositiveAndEven = isPositive.and(isEven);

List<String> items = Arrays.asList("A", "B", "C");
items.forEach(printer);`,
    java17Code: `// Java 17: record + Function でデータ変換パイプライン
record Product(String name, int price) {}
var products = List.of(
    new Product("ノートPC", 80000),
    new Product("マウス", 3000)
);
Function<Product, String> toLabel =
    p -> "[" + p.name() + "] \\u00a5" + p.price();
products.stream().map(toLabel).forEach(System.out::println);`,
    java21Code: `// Java 21: sealed interface で操作を型として定義
sealed interface Operation
    permits Operation.Upper, Operation.Trim, Operation.Length {
    record Upper() implements Operation {}
    record Trim() implements Operation {}
    record Length() implements Operation {}
}
String result = switch (op) {
    case Operation.Upper u -> s.toUpperCase();
    case Operation.Trim t -> s.trim();
    case Operation.Length l -> String.valueOf(s.length());
};`,
  },
  libraryComparison: [
    { name: "標準 API（java.util.function）", whenToUse: "Function / Consumer / Predicate / Supplier で業務ロジックを部品化するとき。Stream API との親和性が高く、依存ゼロで使える。", tradeoff: "3引数以上の関数型インターフェースは標準にないため、自作するか BiFunction で部分適用する必要がある。" },
    { name: "Vavr（Function0〜Function8）", whenToUse: "3引数以上の関数やカリー化、部分適用を多用する関数型スタイルのコードを書きたいとき。", tradeoff: "チーム全体への浸透コストが高く、標準 API と混在するとコードの一貫性が損なわれやすい。" },
    { name: "Apache Commons Lang（Failable 系）", whenToUse: "チェック例外を投げるラムダを Stream 内で扱いたいとき。", tradeoff: "標準 API では try-catch でラップする必要があるチェック例外を簡潔に書ける反面、依存追加の判断が必要。" },
  ],
  faq: [
    { question: "Function と UnaryOperator はどう使い分けますか。", answer: "入出力が同じ型なら UnaryOperator を使うと意図が明確になります。型が異なる変換には Function を使います。機能的な違いはありません。" },
    { question: "Consumer を Stream の peek に渡しても大丈夫ですか。", answer: "デバッグ目的なら問題ありませんが、業務ロジックを peek に入れると遅延評価で実行されない可能性があります。副作用を伴う処理は forEach で行うのが安全です。" },
    { question: "Supplier はどんな場面で使いますか。", answer: "重い初期化処理の遅延評価、デフォルト値の生成（Optional.orElseGet）、ファクトリの抽象化などで使います。get() を呼ぶまで処理が実行されない点がポイントです。" },
  ],
  codeTitle: "FunctionInterfaceDemo.java",
  codeSample: `import java.util.List;
import java.util.function.*;

public class FunctionInterfaceDemo {

    record Product(String name, int price) {}

    public static void main(String[] args) {

        Function<String, Integer> strLength = String::length;
        Function<Integer, String> intToStr = n -> "文字数: " + n;
        var combined = strLength.andThen(intToStr);
        System.out.println(combined.apply("Java")); // 文字数: 4

        var products = List.of(
            new Product("ノートPC", 80000),
            new Product("マウス", 3000),
            new Product("キーボード", 12000)
        );
        Consumer<Product> printProduct = p ->
            System.out.println(p.name() + ": " + p.price() + "円");
        products.forEach(printProduct);

        Supplier<List<String>> defaults = () -> List.of("未設定");
        System.out.println(defaults.get()); // [未設定]

        Predicate<Product> isExpensive = p -> p.price() >= 10000;
        Predicate<Product> isCheap = isExpensive.negate();

        System.out.println("高額商品:");
        products.stream()
            .filter(isExpensive)
            .map(Product::name)
            .forEach(name -> System.out.println("  " + name));

        System.out.println("低価格商品:");
        products.stream()
            .filter(isCheap)
            .map(Product::name)
            .forEach(name -> System.out.println("  " + name));

        BiFunction<Product, Double, Integer> discounted =
            (p, rate) -> (int) (p.price() * (1.0 - rate));
        for (var product : products) {
            System.out.println(product.name()
                + " 10%引き: " + discounted.apply(product, 0.1) + "円");
        }

        UnaryOperator<String> toUpper = String::toUpperCase;
        System.out.println(toUpper.apply("hello")); // HELLO
    }
}`,
},
{
  slug: "function-composition",
  title: "Java 関数合成 andThen・compose の実装パターン",
  categorySlug: "functional",
  summary: "Function.andThen / compose、Predicate.and / or / negate、Consumer.andThen による関数合成パターンを実務例で解説する。",
  version: "Java 17",
  tags: ["andThen", "compose", "Predicate合成", "パイプライン", "バリデーション"],
  apiNames: ["Function.andThen", "Function.compose", "Predicate.and", "Predicate.or", "Predicate.negate", "Consumer.andThen"],
  description: "Function.andThen / compose と Predicate.and / or / negate を使った関数合成パターンを、バリデーションパイプラインの例で解説する。",
  lead: "関数合成は、小さな処理を組み合わせて複雑なロジックを組み立てる手法です。Java の標準 API には Function.andThen / compose、Predicate.and / or / negate、Consumer.andThen といった合成メソッドが用意されており、外部ライブラリなしで実務レベルのパイプラインを構築できます。この記事では、文字列の正規化（トリム→小文字変換→長さ取得）を andThen で段階的に組み立てる例を起点に、compose との実行順序の違い、Predicate の論理結合によるフィルタ条件の動的構築、Consumer の連結によるログ・監査の多段処理、そしてこれらを組み合わせたバリデーションパイプラインの実装までを扱います。関数合成を使いこなすと、条件分岐のネストが減り、処理の追加・除去が部品の差し替えで済むようになります。一方で、合成の段数が増えるとデバッグが難しくなる面もあるため、適切な粒度の見極め方も含めて整理します。",
  useCases: [
    "メールアドレスの入力正規化（trim → toLowerCase）と妥当性検証（空でない → @ を含む → ドメイン形式）をパイプラインとして定義する",
    "CSV 取込時の各カラムに対して、複数の Predicate を and で連結した検証ルールを動的に構成し、エラー行を一括検出する",
    "処理完了時のログ出力と監査記録を Consumer.andThen で連結し、通知先の追加・変更を既存コードに影響なく行う",
  ],
  cautions: [
    "andThen は f → g の順、compose は g → f の順で実行される。チーム内で混在すると可読性が落ちるため、どちらかに統一するルールを設けるとよい（andThen を推奨する現場が多い）",
    "Predicate.and は短絡評価されるため、左辺が false なら右辺は評価されない。null チェックを左辺に置くことで NPE を防げるが、順序の意図をコメントで明示するのが望ましい",
    "関数合成の段数が 4〜5 段を超えると、例外発生時にどの段で落ちたかスタックトレースから追いにくくなる。長いパイプラインは中間結果をローカル変数に取り出してデバッグしやすくする",
    "Consumer.andThen で連結した処理は、前段が例外を投げると後段は実行されない。ログと監査の両方を確実に実行したい場合は try-finally か個別呼び出しにする",
  ],
  relatedArticleSlugs: ["functional-interface", "function-interface", "stream-filter-map"],
  versionCoverage: {
    java8: "Function.andThen / compose、Predicate.and / or / negate はすべて利用可能。変数宣言には明示的な型が必要で、合成チェーンが長くなると記述量が増える。",
    java17: "var で中間変数の型推論が効き、合成チェーンの記述がコンパクトになる。List.of と組み合わせてテストデータも簡潔に用意できる。",
    java21: "基本的な合成 API は Java 17 と同等。sealed interface と switch パターンマッチングを使えば、合成のステップ自体を型として列挙し、実行順序をデータとして管理する設計も可能。",
    java8Code: `// Java 8: 明示的な型宣言で合成チェーン
Function<String, String> trim = String::trim;
Function<String, String> toUpper = String::toUpperCase;
Function<String, Integer> length = String::length;

Function<String, Integer> pipeline =
    trim.andThen(toUpper).andThen(length);
System.out.println(pipeline.apply("  hello  ")); // 5

Predicate<Integer> isPositive = n -> n > 0;
Predicate<Integer> isEven = n -> n % 2 == 0;
Predicate<Integer> isPositiveEven = isPositive.and(isEven);`,
    java17Code: `// Java 17: var + List.of で簡潔に
var trim = (Function<String, String>) String::trim;
var toUpper = (Function<String, String>) String::toUpperCase;

var pipeline = trim.andThen(toUpper);
System.out.println(pipeline.apply("  hello  ")); // HELLO

var normalize = trim.andThen(String::toLowerCase);
var isValid = ((Predicate<String>) s -> !s.isEmpty())
    .and(s -> s.contains("@"));

List.of(" Test@Ex.COM ", "invalid", "user@test.com")
    .forEach(s -> System.out.println(
        normalize.apply(s) + " → " + isValid.test(normalize.apply(s))));`,
    java21Code: `// Java 21: sealed interface で合成ステップを型として列挙
sealed interface Step permits Step.Trim, Step.Upper, Step.Lower {
    record Trim() implements Step {}
    record Upper() implements Step {}
    record Lower() implements Step {}
}
Function<String, String> toFn(Step step) {
    return switch (step) {
        case Step.Trim t -> String::trim;
        case Step.Upper u -> String::toUpperCase;
        case Step.Lower l -> String::toLowerCase;
    };
}
// ステップのリストから合成関数を動的に構築
var steps = List.of(new Step.Trim(), new Step.Lower());
var fn = steps.stream()
    .map(this::toFn)
    .reduce(Function.identity(), Function::andThen);`,
  },
  libraryComparison: [
    { name: "標準 API（Function / Predicate の合成メソッド）", whenToUse: "andThen / compose / and / or / negate で実務上十分なパイプラインを構築できる。Stream API との親和性が高い。", tradeoff: "合成チェーンが長くなるとデバッグが難しく、エラー箇所の特定に工夫が必要になる。" },
    { name: "Vavr（Function の合成 + パターンマッチ）", whenToUse: "カリー化、部分適用、リフティングなど高度な関数合成を多用する場合。", tradeoff: "標準 API と API が重複するため、チーム内で使い分けルールが必要。学習コストも高い。" },
    { name: "Spring Expression Language (SpEL)", whenToUse: "条件式を設定ファイルや DB から動的に読み込んで評価したいとき。", tradeoff: "実行時評価のためコンパイル時の型安全性がなく、パフォーマンスも関数合成より劣る。用途が異なる。" },
  ],
  faq: [
    { question: "andThen と compose はどちらを使うべきですか。", answer: "andThen の方が左から右へ読めるため直感的です。チーム内で統一するなら andThen を推奨します。compose は数学的な関数合成（f of g）に慣れている場合に使うことがあります。" },
    { question: "Predicate の合成順序でパフォーマンスは変わりますか。", answer: "短絡評価されるため、false になりやすい条件や軽い条件を左辺に置くと不要な評価を減らせます。実測で差が出るのは大量データのフィルタリング時です。" },
    { question: "合成した関数のデバッグはどうすればよいですか。", answer: "中間結果をローカル変数に取り出すか、peek（Stream の場合）でログ出力を挟むのが実用的です。合成段数が増えすぎたら、名前付きメソッドに分割することを検討してください。" },
  ],
  codeTitle: "FunctionCompositionDemo.java",
  codeSample: `import java.util.List;
import java.util.function.*;

public class FunctionCompositionDemo {

    public static void main(String[] args) {

        var trim = (Function<String, String>) String::trim;
        var toUpper = (Function<String, String>) String::toUpperCase;
        var length = (Function<String, Integer>) String::length;

        var trimThenUpper = trim.andThen(toUpper);
        System.out.println(trimThenUpper.apply("  hello  ")); // HELLO

        // 3段合成: trim → toUpper → length
        var pipeline = trim.andThen(toUpper).andThen(length);
        System.out.println(pipeline.apply("  hello  ")); // 5

        // toUpper.compose(trim) = toUpper(trim(x))
        var upperThenTrim = toUpper.compose(trim);
        System.out.println(upperThenTrim.apply("  world  ")); // WORLD

        var isPositive = (Predicate<Integer>) n -> n > 0;
        var isEven = (Predicate<Integer>) n -> n % 2 == 0;

        var isPositiveEven = isPositive.and(isEven);
        var isPositiveOrEven = isPositive.or(isEven);
        var isNotPositive = isPositive.negate();

        var numbers = List.of(-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6);

        System.out.print("正の偶数: ");
        numbers.stream().filter(isPositiveEven)
            .forEach(n -> System.out.print(n + " "));
        System.out.println(); // 2 4 6

        System.out.print("正でない: ");
        numbers.stream().filter(isNotPositive)
            .forEach(n -> System.out.print(n + " "));
        System.out.println(); // -4 -3 -2 -1 0

        var log = (Consumer<String>) s -> System.out.print("[LOG] " + s);
        var audit = (Consumer<String>) s -> System.out.print(" [AUDIT] " + s);
        var logAndAudit = log.andThen(audit);
        logAndAudit.accept("処理完了");
        System.out.println();

        var normalize = trim.andThen(String::toLowerCase);
        var notEmpty = (Predicate<String>) s -> !s.isEmpty();
        var isEmail = (Predicate<String>) s -> s.contains("@");
        var isValidEmail = notEmpty.and(isEmail);

        var inputs = List.of(
            " Test@Example.COM ", "invalid", "  ", "user@test.com");
        for (var input : inputs) {
            var normalized = normalize.apply(input);
            var valid = isValidEmail.test(normalized);
            System.out.println(
                input.trim() + " → " + normalized + " → valid=" + valid);
        }
    }
}`,
},
]
