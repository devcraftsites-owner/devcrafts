import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "interface-vs-abstract",
  title: "Java interface と abstract class の使い分け方法",
  categorySlug: "oop",
  summary: "interface と abstract class の役割の違いを DAO パターンなど実務例で整理する。",
  version: "Java 17",
  tags: ["interface", "abstract class", "default メソッド", "DAO", "多重実装"],
  apiNames: ["interface", "abstract", "default", "record"],
  description: "Java の interface と abstract class を業務コードでどう使い分けるか、DAO パターンやテスト差し替えの実例とともに Java 8/17/21 対応で解説する。",
  lead: "interface と abstract class はどちらも「抽象化」の手段ですが、設計レビューで「なぜ interface ではなく abstract class にしたのか」と問われたとき、明確に答えられるでしょうか。Java 8 で default メソッドが追加されて以降、interface でも実装を持てるようになり、両者の境界はさらに曖昧になりました。この記事では、interface は「契約と能力の宣言」、abstract class は「共通の状態と振る舞いの共有」という原則に立ち返り、DAO パターンでの差し替え容易性、テスト用スタブの挿入、複数インターフェースの同時実装といった実務で直面する場面を通じて、使い分けの判断基準を整理します。Java 17 の record との組み合わせや、Java 21 の sealed interface による型安全な戻り値設計にも触れます。",
  useCases: [
    "データアクセス層を interface で抽象化し、本番用 MySQL 実装とテスト用 InMemory 実装を差し替え可能にする",
    "帳票出力の共通処理（ヘッダー・フッター生成）を abstract class にまとめ、個別帳票でボディ部分だけをオーバーライドする",
    "CSV エクスポートと PDF エクスポートの両方に対応するクラスに Exportable interface を複数実装させ、出力先を柔軟に切り替える",
  ],
  cautions: [
    "interface の default メソッドに業務ロジックを詰め込みすぎると、実装クラス側でオーバーライドされていることに気づきにくくなる。default はフォールバック用途に留めるのが安全",
    "abstract class は単一継承のため、後から別の abstract class を追加できない。将来の拡張を考えると、共通状態が不要なら interface を優先するほうが柔軟性が残る",
    "Java 8 以降の interface は static メソッドも持てるが、継承されない点に注意。ユーティリティ的なメソッドを interface に置く場合は、呼び出し側で インターフェース名.メソッド名() と書く必要がある",
    "DAO インターフェースの戻り値を String や Map にすると型安全性が失われる。Java 17 なら record、Java 21 なら sealed interface と組み合わせて戻り値を明示するとコードレビューでの見通しが良くなる",
  ],
  relatedArticleSlugs: ["solid-principles", "business-rule-validation", "strategy-pattern"],
  versionCoverage: {
    java8: "interface に default / static メソッドが追加され、実装を持てるようになった。ただし DAO の戻り値は通常のクラスで定義する必要がある。",
    java17: "record で DAO の戻り値を簡潔に定義できる。var による型推論と組み合わせると、匿名クラスでの interface 実装も見通しが良くなる。",
    java21: "sealed interface で戻り値の型を限定でき、switch パターンマッチングで Found / NotFound を網羅的に処理できる。",
    java8Code: `// Java 8: DAO の戻り値は通常クラスで定義
interface UserDao {
    String findById(int id);
    void save(String user);
}
// 実装クラスを個別に定義
class MySqlUserDao implements UserDao {
    @Override
    public String findById(int id) {
        return "MySQL: User-" + id;
    }
    @Override
    public void save(String user) { /* ... */ }
}`,
    java17Code: `// Java 17: record で戻り値を簡潔に定義
record UserResult(int id, String name, String source) {}
interface UserDao {
    UserResult findById(int id);
    void save(String user);
}
// 匿名クラスでも var + record で簡潔に
var dao = new UserDao() {
    public UserResult findById(int id) {
        return new UserResult(id, "User-" + id, "MySQL");
    }
    public void save(String user) { /* ... */ }
};`,
    java21Code: `// Java 21: sealed interface で戻り値を型安全に
sealed interface DaoResult
    permits DaoResult.Found, DaoResult.NotFound {
    record Found(UserResult user) implements DaoResult {}
    record NotFound(int id) implements DaoResult {}
}
// switch パターンマッチングで網羅的に処理
switch (result) {
    case DaoResult.Found f -> handle(f.user());
    case DaoResult.NotFound nf -> handleNotFound(nf.id());
}`,
  },
  libraryComparison: [
    { name: "標準 API（interface + abstract class）", whenToUse: "プロジェクト固有の抽象化レイヤーを自前で組み立てるとき。依存なしでテスト差し替えやモック挿入が可能。", tradeoff: "設計判断はチームに委ねられるため、interface と abstract class の使い分けルールを合意しておく必要がある。" },
    { name: "Spring Framework（DI コンテナ）", whenToUse: "interface の実装切り替えを設定ファイルやアノテーションで管理したいとき。大規模プロジェクトでの依存解決に向く。", tradeoff: "フレームワークへの依存が生まれる。小規模なユーティリティや Pure Java の学習目的には過剰になりやすい。" },
    { name: "Lombok（@Value / @Builder）", whenToUse: "ボイラープレートの削減が主目的のとき。getter / equals / hashCode を自動生成してくれる。", tradeoff: "IDE やビルドツールとの相性問題が起きることがある。Java 17 以降は record で代替できる場面が増えている。" },
  ],
  faq: [
    { question: "default メソッドが衝突した場合はどうなりますか。", answer: "2つの interface が同じシグネチャの default メソッドを持つ場合、実装クラスで明示的にオーバーライドしないとコンパイルエラーになります。InterfaceA.super.method() の形で特定の実装を呼び出せます。" },
    { question: "abstract class にコンストラクタは必要ですか。", answer: "共通フィールドを初期化する場合は必要です。サブクラスから super() で呼び出す設計が基本です。状態を持たないなら interface のほうが適切な場合が多いです。" },
    { question: "テスト用のモック実装は interface と abstract class のどちらが作りやすいですか。", answer: "interface のほうがモック作成は容易です。Mockito などのフレームワークも interface ベースが基本で、abstract class のモックには追加設定が必要になることがあります。" },
  ],
  codeTitle: "InterfaceVsAbstractDemo.java",
  codeSample: `import java.util.List;

public class InterfaceVsAbstractDemo {

    interface Printable {
        void print();
    }

    interface Saveable {
        void save(String path);

        // default メソッド: フォールバック実装を提供
        default void saveToTemp() {
            save("/tmp/default.txt");
        }
    }

    abstract static class Animal {
        private final String name;

        public Animal(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public abstract String sound();

        // 共通ロジック: サブクラスはsound()だけ実装すればよい
        public void introduce() {
            System.out.println(
                "私は " + name + " です。" + sound() + " と鳴きます。");
        }
    }

    static class Dog extends Animal implements Printable, Saveable {
        public Dog(String name) {
            super(name);
        }

        @Override
        public String sound() {
            return "ワン";
        }

        @Override
        public void print() {
            System.out.println("Dog: " + getName());
        }

        @Override
        public void save(String path) {
            System.out.println("保存先: " + path);
        }
    }

    record UserResult(int id, String name, String source) {}

    interface UserDao {
        UserResult findById(int id);
        void save(String user);
    }

    static class MySqlUserDao implements UserDao {
        @Override
        public UserResult findById(int id) {
            return new UserResult(id, "User-" + id, "MySQL");
        }

        @Override
        public void save(String user) {
            System.out.println("MySQL に保存: " + user);
        }
    }

    // テスト用スタブ: interface のおかげで差し替えが容易
    static class InMemoryUserDao implements UserDao {
        @Override
        public UserResult findById(int id) {
            return new UserResult(id, "User-" + id, "Memory");
        }

        @Override
        public void save(String user) {
            System.out.println("メモリに保存: " + user);
        }
    }

    public static void main(String[] args) {
        // abstract class: 共通ロジックの活用
        var dog = new Dog("ポチ");
        dog.introduce();       // abstract class の共通メソッド
        dog.print();           // Printable interface
        dog.saveToTemp();      // Saveable default メソッド

        // interface: DAO の差し替え
        var daos = List.of(new MySqlUserDao(), new InMemoryUserDao());
        for (var dao : daos) {
            var result = dao.findById(1);
            System.out.println(result);
        }
    }
}`,
},
{
  slug: "solid-principles",
  title: "Java で学ぶ SOLID 原則の実装パターンと設計の判断基準",
  categorySlug: "oop",
  summary: "SOLID 原則を注文処理・割引計算・DI の具体例で実装する。",
  version: "Java 17",
  tags: ["SOLID", "単一責任", "開放閉鎖", "依存性逆転", "設計原則"],
  apiNames: ["interface", "record", "sealed interface"],
  description: "SOLID 原則の S（単一責任）・O（開放閉鎖）・D（依存性逆転）を Java の注文処理・割引計算コードで実装し、設計判断の基準を Java 8/17/21 対応で整理する。",
  lead: "SOLID 原則は設計の教科書では必ず登場しますが、「原則は知っているけれど、実際のコードにどう落とし込むのか分からない」という声は少なくありません。とくに業務システムの保守現場では、単一責任原則に違反して肥大化したクラスや、新しい種別を追加するたびに if-else を書き足すコードに日常的に遭遇します。この記事では、注文処理という身近な題材を使い、S（単一責任）・O（開放閉鎖）・D（依存性逆転）の3原則を Java コードで実装します。悪い例と良い例を対比しながら、「なぜこの分割にするのか」「どこまで分ければ十分なのか」という現場での判断基準を整理します。Java 8 のクラスベースの実装から Java 17 の record、Java 21 の sealed interface + switch パターンマッチングまで、バージョンごとの書き方の進化も確認します。",
  useCases: [
    "注文クラスに永続化・メール通知・PDF生成が混在しているコードを、責任ごとにクラス分割してリファクタリングする",
    "割引種別（学生・会員・VIP）の追加が発生するたびに既存コードを変更せずに済むよう、Strategy パターンで拡張ポイントを設ける",
    "単体テストでデータベース接続なしに業務ロジックを検証するため、Repository を interface 化してモックに差し替える",
  ],
  cautions: [
    "単一責任原則を厳密に適用しすぎると、クラスが細分化されすぎてコードの追跡が困難になる。「変更理由が異なるか」を基準に、過度な分割を避ける",
    "開放閉鎖原則のために interface を導入しても、実装が1つしかない場合は過剰設計になりやすい。将来の拡張が見込まれるかどうかを判断材料にする",
    "依存性逆転原則でコンストラクタ注入を使う場合、依存の数が多いクラスは責任過多のサインである。引数が4つを超えたら単一責任原則に立ち返る",
    "SOLID はあくまで指針であり、すべてを満たすことが目的ではない。保守コストと開発速度のバランスを見て適用範囲を決めること",
  ],
  relatedArticleSlugs: ["interface-vs-abstract", "business-rule-validation", "strategy-pattern", "factory-method"],
  versionCoverage: {
    java8: "Order はフィールド + getter の通常クラスで定義する。割引戦略は個別のクラスで implements する形が基本。",
    java17: "record で Order を不変データクラスとして簡潔に定義できる。DiscountStrategy をラムダ式で実装すると、個別クラスを作らずに済む。",
    java21: "sealed interface + switch パターンマッチングで割引種別を型安全に表現でき、新種別の追加漏れをコンパイル時に検出できる。",
    java8Code: `// Java 8: 割引戦略を個別クラスで定義
class StudentDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) {
        return price * 0.8;
    }
}
class MemberDiscount implements DiscountStrategy {
    @Override
    public double apply(double price) {
        return price * 0.9;
    }
}
// 利用側
DiscountCalculator calc = new DiscountCalculator();
calc.calculate(new StudentDiscount(), 10000);`,
    java17Code: `// Java 17: ラムダ式で戦略を定義（クラス不要）
record Order(String product, int quantity) {}

DiscountStrategy studentDiscount = price -> price * 0.8;
DiscountStrategy memberDiscount  = price -> price * 0.9;
DiscountStrategy vipDiscount     = price -> price * 0.7;

var calc = new DiscountCalculator();
System.out.println(calc.calculate(vipDiscount, 10000));`,
    java21Code: `// Java 21: sealed interface + switch で型安全に
sealed interface DiscountType
    permits DiscountType.Student, DiscountType.Member,
            DiscountType.None {
    record Student() implements DiscountType {}
    record Member() implements DiscountType {}
    record None() implements DiscountType {}
}
double result = switch (type) {
    case DiscountType.Student s -> price * 0.8;
    case DiscountType.Member m  -> price * 0.9;
    case DiscountType.None n    -> price;
};`,
  },
  libraryComparison: [
    { name: "標準 API（interface + record）", whenToUse: "依存なしで SOLID に沿った設計を組み立てるとき。小〜中規模のプロジェクトや、フレームワーク非依存の共通ライブラリに適する。", tradeoff: "DI コンテナがないため、依存の組み立て（配線）は手動で行う必要がある。クラス数が増えると初期化コードが煩雑になる。" },
    { name: "Spring Framework（@Component / @Autowired）", whenToUse: "依存の自動解決やスコープ管理が必要な大規模プロジェクト。AOP でロギングやトランザクションを横断的に適用したいとき。", tradeoff: "フレームワーク自体の学習コストがある。テストでもSpring コンテキストの起動が必要になる場合がある。" },
    { name: "Google Guice", whenToUse: "Spring ほど大きなフレームワークは不要だが、DI コンテナの恩恵は受けたいとき。軽量で学習コストが低い。", tradeoff: "アノテーションベースの設定が主で、XML 設定はサポートしない。エコシステムは Spring ほど充実していない。" },
  ],
  faq: [
    { question: "SOLID の L（リスコフの置換原則）と I（インターフェース分離原則）は業務コードでどう意識すればよいですか。", answer: "L は「親クラスの契約をサブクラスが破らないこと」、I は「使わないメソッドへの依存を強制しないこと」です。まずは S・O・D を押さえれば、L と I は自然と守られるケースが多いです。" },
    { question: "開放閉鎖原則のために最初から interface を用意すべきですか。", answer: "YAGNI の観点から、拡張の必要性が見えた時点で interface を抽出するのが現実的です。最初から用意すると未使用の抽象化が残りやすくなります。" },
    { question: "依存性逆転原則はフレームワークなしでも実践できますか。", answer: "コンストラクタ引数で interface を受け取るだけで実現できます。DI コンテナは便利ですが、原則の理解と実践にフレームワークは必須ではありません。" },
  ],
  codeTitle: "SolidPrinciplesDemo.java",
  codeSample: `import java.util.List;

public class SolidPrinciplesDemo {

    // === S: 単一責任原則 ===
    // Order は「注文データを表す」責任だけを持つ
    record Order(String product, int quantity) {}

    // 永続化は Repository の責任
    static class OrderRepository {
        public void save(Order order) {
            System.out.println("DB に保存: " + order.product());
        }
    }

    // 通知は Notification の責任
    static class OrderNotification {
        public void sendEmail(Order order) {
            System.out.println("メール送信: " + order.product());
        }
    }

    // === O: 開放閉鎖原則 ===
    // 新しい割引タイプを追加しても DiscountCalculator は変更不要
    interface DiscountStrategy {
        double apply(double price);
    }

    static class DiscountCalculator {
        public double calculate(DiscountStrategy strategy, double price) {
            return strategy.apply(price);
        }
    }

    // === D: 依存性逆転原則 ===
    // 具体クラスではなく interface に依存する
    interface OrderRepositoryInterface {
        void save(Order order);
    }

    static class OrderService {
        private final OrderRepositoryInterface repo;

        // コンストラクタ注入: テスト時にモックへ差し替え可能
        public OrderService(OrderRepositoryInterface repo) {
            this.repo = repo;
        }

        public void processOrder(Order order) {
            repo.save(order);
        }
    }

    public static void main(String[] args) {
        // S: 責任ごとに分離されたクラスを使う
        var order = new Order("ノートPC", 1);
        new OrderRepository().save(order);
        new OrderNotification().sendEmail(order);

        // O: ラムダ式で戦略を定義（クラス追加不要）
        var calc = new DiscountCalculator();
        DiscountStrategy student = price -> price * 0.8;
        DiscountStrategy member  = price -> price * 0.9;
        DiscountStrategy vip     = price -> price * 0.7;

        System.out.println("学生割引: " + calc.calculate(student, 10000));
        System.out.println("会員割引: " + calc.calculate(member, 10000));
        System.out.println("VIP割引: " + calc.calculate(vip, 10000));

        // D: interface 経由でテスト用モックに差し替え
        OrderRepositoryInterface prodRepo =
            o -> System.out.println("本番DB: " + o.product());
        OrderRepositoryInterface testRepo =
            o -> System.out.println("[テスト] モック: " + o.product());

        new OrderService(prodRepo).processOrder(order);
        new OrderService(testRepo).processOrder(order);
    }
}`,
},
{
  slug: "business-rule-validation",
  title: "Java 業務ルールバリデーションの設計と実装パターンを解説",
  categorySlug: "oop",
  summary: "請求金額・納期・在庫数のバリデーションをルールオブジェクトとして分離する実装例。",
  version: "Java 17",
  tags: ["バリデーション", "業務ルール", "record", "BigDecimal", "設計"],
  apiNames: ["BigDecimal", "LocalDate", "record", "List", "Optional", "sealed interface"],
  description: "注文の請求金額・納期・在庫チェックを例に、業務ルールバリデーションを再利用しやすい設計で実装する方法を外部ライブラリ不要の Pure Java で Java 8/17/21 対応で解説する。",
  lead: "入力値のバリデーションは、ほぼすべての業務システムに存在する処理です。しかし「Controller に if 文を並べる」「Service 層にバリデーションと業務ロジックが混在する」といった実装は、保守フェーズで変更コストが膨らむ原因になります。この記事では、注文処理における請求金額（BigDecimal > 0）、納期（本日より後）、在庫数（注文数以上）という3つの業務ルールを題材に、バリデーションロジックをルールオブジェクトとして分離し、結果を ValidationResult にまとめて返す設計パターンを解説します。Java 8 での通常クラスベースの実装から、Java 17 の record による簡潔な表現、Java 21 の sealed interface + switch パターンマッチングによる型安全なルール評価まで、バージョンごとの書き方の変化も整理します。フレームワークに依存しない Pure Java の実装なので、既存プロジェクトへの部分導入にも向いています。",
  useCases: [
    "受注画面の入力チェックで、請求金額・納期・在庫数のルールを個別に定義し、エラーメッセージを一括で返す",
    "CSV 一括取込の行単位バリデーションで、ルールオブジェクトを再利用して検証ロジックの重複を排除する",
    "API のリクエストバリデーションで、複数のルール違反をまとめてレスポンスに含める（最初の1件で止めない設計）",
  ],
  cautions: [
    "BigDecimal の比較には compareTo を使う。equals は scale（小数点以下の桁数）まで一致しないと false を返すため、1.0 と 1.00 が等しくならない",
    "LocalDate.now() をバリデーション内で直接呼ぶとテスト時に日付を固定できない。Clock や Supplier<LocalDate> を引数にする設計を検討すること",
    "バリデーションエラーを最初の1件で打ち切ると、ユーザーが何度も再入力を強いられる。業務系では全エラーを一括返却するのが一般的",
    "null チェックとビジネスルールチェックは別レイヤーに分けるのが望ましい。null の場合に NPE を投げるか、エラーメッセージに含めるかは設計方針として事前に決めておく",
  ],
  relatedArticleSlugs: ["interface-vs-abstract", "solid-principles", "factory-method"],
  versionCoverage: {
    java8: "ValidationResult は通常クラスで定義し、addError / getErrors / isValid をメソッドとして実装する。バリデーション対象は個別引数で受け取る。",
    java17: "record で Order と ValidationResult を定義でき、不変性が保証される。var による型推論で記述量も減る。",
    java21: "sealed interface でバリデーションルール自体を型として表現でき、switch パターンマッチングで各ルールの評価を網羅的に記述できる。",
    java8Code: `// Java 8: ValidationResult は通常クラス
class ValidationResult {
    private final List<String> errors = new ArrayList<>();
    public void addError(String msg) { errors.add(msg); }
    public boolean isValid() { return errors.isEmpty(); }
    public List<String> getErrors() { return errors; }
}
// バリデーション: 個別引数で受け取る
ValidationResult result = OrderValidator.validateOrder(
    amount, deliveryDate, stockCount, orderCount);`,
    java17Code: `// Java 17: record で Order と結果を簡潔に表現
record Order(BigDecimal amount, LocalDate deliveryDate,
             int stockCount, int orderCount) {}
record ValidationResult(List<String> errors) {
    boolean isValid() { return errors.isEmpty(); }
}
// record を渡して一括検証
var result = OrderValidator.validateOrder(order);`,
    java21Code: `// Java 21: sealed interface でルール自体を型として定義
sealed interface ValidationRule {
    record AmountRule(BigDecimal amount)
        implements ValidationRule {}
    record DeliveryDateRule(LocalDate date)
        implements ValidationRule {}
    record StockRule(int stock, int order)
        implements ValidationRule {}
}
// switch パターンマッチングで各ルールを評価
Optional<String> validate(ValidationRule rule) {
    return switch (rule) {
        case AmountRule r -> /* 金額チェック */;
        case DeliveryDateRule r -> /* 納期チェック */;
        case StockRule r -> /* 在庫チェック */;
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（record + List）", whenToUse: "フレームワーク非依存で業務ルールを自前管理するとき。バリデーションロジックの単体テストが書きやすく、ルールの追加・変更が局所的に済む。", tradeoff: "ルール数が増えると管理対象のクラスが増える。アノテーションベースのバリデーションに比べて宣言的でない。" },
    { name: "Bean Validation（Jakarta Validation）", whenToUse: "フィールドにアノテーション（@NotNull, @Min, @Future）を付けて宣言的にバリデーションしたいとき。Spring / Jakarta EE と組み合わせて使う場面が多い。", tradeoff: "複数フィールドにまたがるルール（在庫数 >= 注文数）はカスタムバリデータが必要で、アノテーションだけでは表現しにくい。" },
    { name: "Vavr（旧 Javaslang）", whenToUse: "Validation モナドで複数のバリデーション結果を関数的に合成したいとき。エラーの蓄積が自然に書ける。", tradeoff: "関数型プログラミングの知識が前提になる。チーム全体が Vavr に習熟していないと可読性が下がる。" },
  ],
  faq: [
    { question: "バリデーションは Controller と Service のどちらに置くべきですか。", answer: "入力形式のチェック（null、型、桁数）は Controller 層、業務ルール（在庫 >= 注文数）は Service 層に置くのが一般的です。責任を分けることでテストが書きやすくなります。" },
    { question: "BigDecimal の null チェックと金額チェックは分けるべきですか。", answer: "分けるのが望ましいです。null は『値が未入力』、金額 <= 0 は『値が不正』という異なる意味を持つため、エラーメッセージも区別するとユーザーに親切です。" },
    { question: "バリデーションエラーは例外で通知すべきですか。", answer: "業務バリデーションのエラーは想定内の結果なので、例外ではなく戻り値（ValidationResult）で返すのが一般的です。例外はシステムエラーや回復不能な異常に使うのが原則です。" },
  ],
  codeTitle: "BusinessRuleValidationDemo.java",
  codeSample: `import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BusinessRuleValidationDemo {

    // 注文データ
    record Order(BigDecimal amount, LocalDate deliveryDate,
                 int stockCount, int orderCount) {}

    // バリデーション結果
    record ValidationResult(List<String> errors) {
        boolean isValid() {
            return errors.isEmpty();
        }
    }

    // 注文バリデーター: 各ルールを独立したメソッドで定義
    static class OrderValidator {

        /** 請求金額 > 0 */
        static void validateAmount(
                BigDecimal amount, List<String> errors) {
            if (amount == null
                    || amount.compareTo(BigDecimal.ZERO) <= 0) {
                errors.add("請求金額は0より大きい値を指定してください");
            }
        }

        /** 納期 > 本日 */
        static void validateDeliveryDate(
                LocalDate deliveryDate, List<String> errors) {
            if (deliveryDate == null
                    || !deliveryDate.isAfter(LocalDate.now())) {
                errors.add("納期は本日より後の日付を指定してください");
            }
        }

        /** 在庫数 >= 注文数 */
        static void validateStock(
                int stockCount, int orderCount,
                List<String> errors) {
            if (orderCount <= 0) {
                errors.add("注文数は1以上を指定してください");
            } else if (stockCount < orderCount) {
                errors.add("在庫数（" + stockCount
                    + "）が注文数（" + orderCount
                    + "）を下回っています");
            }
        }

        /** 複合バリデーション: 全ルールを一括チェック */
        static ValidationResult validateOrder(Order order) {
            var errors = new ArrayList<String>();
            validateAmount(order.amount(), errors);
            validateDeliveryDate(order.deliveryDate(), errors);
            validateStock(
                order.stockCount(), order.orderCount(), errors);
            return new ValidationResult(errors);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== 正常ケース ===");
        var order1 = new Order(
            new BigDecimal("10000"),
            LocalDate.now().plusDays(7),
            100, 5
        );
        var result1 = OrderValidator.validateOrder(order1);
        System.out.println("Valid: " + result1.isValid());

        System.out.println("\\n=== 複数エラーケース ===");
        var order2 = new Order(
            new BigDecimal("-100"),
            LocalDate.now().minusDays(1),
            3, 10
        );
        var result2 = OrderValidator.validateOrder(order2);
        System.out.println("Valid: " + result2.isValid());
        for (var error : result2.errors()) {
            System.out.println(" - " + error);
        }
    }
}`,
},
]
