import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "record-basics",
  title: "Java Record の基本と DTO 設計への活用方法を実例で解説",
  categorySlug: "records",
  summary: "record の自動生成メソッド、コンパクトコンストラクタ、DTO への活用パターンを整理する。",
  version: "Java 17",
  tags: ["record", "DTO", "値オブジェクト", "コンパクトコンストラクタ", "イミュータブル"],
  apiNames: ["record", "equals", "hashCode", "toString"],
  description: "Java record の基本構文から DTO 設計への活用まで、Java 8/17/21 対応で外部ライブラリ不要の実装パターンを業務コード例付きで解説する。",
  lead: "業務システムの開発では、API レスポンスの格納先や画面表示用のデータ転送など、フィールドを持つだけの不変クラスを作る場面が頻繁にあります。従来の Java ではそのたびに equals・hashCode・toString・getter を手書きし、フィールドを追加するたびにこれらを修正する必要がありました。Java 16 で正式導入された record は、この定型コードをコンパイラが自動生成してくれる仕組みです。この記事では、record の基本構文とコンパクトコンストラクタによるバリデーション、メソッドの追加、DTO としての設計パターンを、動くコードで整理します。Java 8 環境で同等のクラスを書く場合との比較も示すので、移行の判断材料にもなるはずです。",
  useCases: [
    "REST API のレスポンスを UserDto record で受け取り、画面表示やログ出力に toString を活用する",
    "CSV 取込時の1行分のデータを record で表現し、コンパクトコンストラクタで必須項目のバリデーションを行う",
    "帳票出力用の集計結果を record に詰めて返却し、呼び出し元での意図しない書き換えを防ぐ",
  ],
  cautions: [
    "record は暗黙的に final であり、継承できない。既存の class 階層に組み込みたい場合は interface の implements を使う",
    "コンパクトコンストラクタではフィールドへの代入を書かない。代入はコンパイラが末尾に自動挿入するため、明示すると重複代入のコンパイルエラーになる",
    "record のフィールドはすべて final なので、値を変えたい場合は withXxx メソッドで新しいインスタンスを返すパターンを使う",
    "record の equals は全フィールドの値比較を行う。大量の record インスタンスを HashSet や HashMap のキーにする場合、hashCode の衝突率にも注意が必要",
    "record に static フィールドは追加できるが、インスタンスフィールドを追加することはできない。コンポーネントとして宣言したもの以外は持てない設計になっている",
  ],
  relatedArticleSlugs: ["record-serialize", "record-vs-class-enum", "sealed-record"],
  versionCoverage: {
    java8: "record は使えない。final class に final フィールド・getter・equals・hashCode・toString を手動で実装する。フィールド追加時の修正漏れが起きやすい。",
    java17: "record が正式に使える。コンパクトコンストラクタでバリデーションも簡潔に書ける。toString の出力形式は自動で className[field=value] になる。",
    java21: "record 自体の仕様は Java 17 と同じ。instanceof パターンマッチングや switch 式と組み合わせることで、record の分解がより自然に書ける。",
    java8Code: `// Java 8: 手動で不変クラスを実装
static final class Person {
    private final String name;
    private final int age;
    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    public String name() { return name; }
    public int age() { return age; }
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Person)) return false;
        Person p = (Person) o;
        return age == p.age && Objects.equals(name, p.name);
    }
    @Override
    public int hashCode() { return Objects.hash(name, age); }
    @Override
    public String toString() {
        return "Person[name=" + name + ", age=" + age + "]";
    }
}`,
    java17Code: `// Java 17: record で同じ機能を1行で定義
record Person(String name, int age) {}
// toString, equals, hashCode, アクセサが自動生成される

// コンパクトコンストラクタでバリデーション
record ValidatedAge(int value) {
    ValidatedAge {
        if (value < 0 || value > 150) {
            throw new IllegalArgumentException(
                "年齢は 0〜150: " + value);
        }
    }
}`,
    java21Code: `// Java 21: record + switch パターンマッチング
sealed interface Shape permits Circle, Rect {}
record Circle(double r) implements Shape {}
record Rect(double w, double h) implements Shape {}

double area = switch (shape) {
    case Circle c -> Math.PI * c.r() * c.r();
    case Rect r   -> r.w() * r.h();
};`,
  },
  libraryComparison: [
    { name: "標準 API（record）", whenToUse: "Java 16 以上で DTO や値オブジェクトを定義する場合。依存追加なしで equals・hashCode・toString が揃う。", tradeoff: "Java 8 環境では使えない。with パターン（フィールド変更コピー）は手動で定義する必要がある。" },
    { name: "Lombok（@Value / @Data）", whenToUse: "Java 8 環境で定型コードを減らしたいとき。@Builder によるビルダーパターンも使える。", tradeoff: "アノテーションプロセッサへの依存が増え、IDE やビルドツールとの相性問題が起きることがある。Java 16 以降では record で代替できる場面が多い。" },
    { name: "AutoValue（Google）", whenToUse: "Lombok を避けつつ、Java 8 環境で不変値クラスを自動生成したいとき。", tradeoff: "abstract class を継承する設計が独特で、record と比べると冗長。新規プロジェクトでは record を選ぶ方が自然。" },
  ],
  faq: [
    { question: "record に getter を追加する場合、get プレフィックスは付けるべきですか。", answer: "record のアクセサは name() のように get なしが標準です。JavaBeans 規約が求められるフレームワーク（一部の JSP・EL 式など）では別途 getName() を定義する必要がありますが、それ以外では record 標準のアクセサを使うのが自然です。" },
    { question: "record のフィールドを一部だけ変えた新しいインスタンスを作るにはどうすればよいですか。", answer: "withXxx メソッドを自前で定義し、新しい record を返す方法が一般的です。例えば withAge(int newAge) で new Person(name, newAge) を返します。Java 標準にはまだ with 構文はありません。" },
    { question: "既存の class を record に置き換えるときの注意点はありますか。", answer: "record は暗黙的に final なので、サブクラスがある場合は移行できません。また equals の比較ロジックが全フィールド比較に変わるため、既存コードで一部フィールドだけで比較していた場合は動作が変わります。" },
  ],
  codeTitle: "RecordBasicDemo.java",
  codeSample: `import java.util.List;

public class RecordBasicDemo {

    // record で DTO を定義（toString / equals / hashCode 自動生成）
    record Person(String name, int age) {}

    // コンパクトコンストラクタでバリデーション
    record ValidatedAge(int value) {
        ValidatedAge {
            if (value < 0 || value > 150) {
                throw new IllegalArgumentException(
                    "年齢は 0〜150 の範囲で指定してください: " + value);
            }
        }
    }

    // record にメソッドを追加できる
    record Rectangle(double width, double height) {
        public double area() { return width * height; }

        // with パターン: フィールドを変更した新しいインスタンスを返す
        public Rectangle withWidth(double newWidth) {
            return new Rectangle(newWidth, height);
        }
    }

    // 業務 DTO の例
    record UserDto(int id, String email, String displayName) {}

    public static void main(String[] args) {
        // 基本操作: 生成・toString・equals
        var p1 = new Person("田中太郎", 25);
        var p2 = new Person("田中太郎", 25);
        System.out.println(p1);                        // Person[name=田中太郎, age=25]
        System.out.println("equals: " + p1.equals(p2)); // true

        // コンパクトコンストラクタによるバリデーション
        try {
            new ValidatedAge(-1);
        } catch (IllegalArgumentException e) {
            System.out.println("検証エラー: " + e.getMessage());
        }

        // メソッド追加と with パターン
        var rect = new Rectangle(5.0, 3.0);
        System.out.println("面積: " + rect.area());
        var wider = rect.withWidth(10.0);
        System.out.println("幅変更後: " + wider);

        // DTO としての一覧操作
        var users = List.of(
            new UserDto(1, "taro@example.com", "田中太郎"),
            new UserDto(2, "hanako@example.com", "山田花子")
        );
        users.forEach(System.out::println);
    }
}`,
},
{
  slug: "record-serialize",
  title: "Java Record のシリアライズと JSON 変換の実装",
  categorySlug: "records",
  summary: "record の Serializable 対応、手動 JSON 変換、バイナリ直列化の注意点を整理する。",
  version: "Java 17",
  tags: ["record", "シリアライズ", "JSON", "Serializable", "DTO"],
  apiNames: ["Serializable", "ObjectOutputStream", "ObjectInputStream", "ByteArrayOutputStream"],
  description: "Java record のシリアライズ方法を Serializable と手動 JSON 変換の両面から、Java 8/17/21 対応で外部ライブラリ不要で解説する。",
  lead: "API 連携やファイル保存で、record で定義した DTO をシリアライズする場面は少なくありません。record は Serializable を implements すればバイナリ直列化に対応しますが、従来のクラスとは復元の仕組みが異なる点があります。また、現場では JSON 形式でのやり取りが主流であり、Jackson や Gson なしで最低限の JSON 変換を Pure Java で行いたいケースもあります。この記事では、record の標準シリアライズ（ObjectOutputStream / ObjectInputStream）の挙動と注意点、手動 JSON 変換の実装パターン、そして Java 21 で sealed interface と組み合わせた型安全な JSON 生成までを扱います。外部ライブラリを使わずに動く完結したコードを示しつつ、実務で Jackson に移行すべきラインについても触れます。",
  useCases: [
    "マイクロサービス間の HTTP レスポンスを record で受け取り、手動 JSON 変換でログ出力する",
    "バッチ処理の中間結果を record のバイナリシリアライズで一時ファイルに保存し、障害時にリトライする",
    "設定ファイルの読み込み結果を record に詰めて返却し、変更不可の設定値オブジェクトとして扱う",
  ],
  cautions: [
    "record は Serializable を自動で implements しない。バイナリ直列化が必要な場合は明示的に implements Serializable を付ける",
    "record のデシリアライズはコンストラクタ経由で行われるため、従来クラスの readObject / writeObject とは復元メカニズムが異なる。カスタムシリアライズは基本的に不要",
    "serialVersionUID は record でも定義を推奨する。フィールドの追加・削除時に互換性エラーを明示的に検知できる",
    "手動 JSON 変換で文字列フィールドにダブルクォートやバックスラッシュが含まれる場合、エスケープ処理が必要になる。本番コードでは Jackson の導入を検討すべきライン",
    "record を JSON に変換する際、null フィールドの扱い（省略するか null として出すか）を事前に決めておかないと、受け取り側でパースエラーになることがある",
  ],
  relatedArticleSlugs: ["record-basics", "serialization-basics", "sealed-record"],
  versionCoverage: {
    java8: "record が使えないため、final class に Serializable を実装して getter 経由で JSON 文字列を組み立てる。getter 名は getXxx 形式になる。",
    java17: "record に Serializable を implements すればバイナリ直列化が可能。アクセサが name() 形式なので JSON 変換のコードも簡潔に書ける。",
    java21: "sealed interface + record を組み合わせ、switch パターンマッチングで型ごとの JSON 変換を網羅的に記述できる。",
    java8Code: `// Java 8: 不変クラスの手動 JSON 変換
static class UserDto implements Serializable {
    private static final long serialVersionUID = 1L;
    private final String id;
    private final String name;
    private final int age;
    // コンストラクタ・getter 省略
    String getId() { return id; }
    String getName() { return name; }
}
static String toJson(UserDto u) {
    return "{\\"id\\":\\"" + u.getId() + "\\","
         + "\\"name\\":\\"" + u.getName() + "\\"}";
}`,
    java17Code: `// Java 17: record で簡潔に定義 + JSON 変換
record UserDto(String id, String name, int age)
        implements Serializable {
    private static final long serialVersionUID = 1L;
}
static String toJson(UserDto u) {
    return "{\\"id\\":\\"" + u.id() + "\\","
         + "\\"name\\":\\"" + u.name() + "\\","
         + "\\"age\\":" + u.age() + "}";
}`,
    java21Code: `// Java 21: sealed + record + switch で型安全 JSON
sealed interface Shape permits Circle, Rect {}
record Circle(double r) implements Shape {}
record Rect(double w, double h) implements Shape {}

static String toJson(Shape s) {
    return switch (s) {
        case Circle c ->
            "{\\"type\\":\\"circle\\",\\"r\\":" + c.r() + "}";
        case Rect r ->
            "{\\"type\\":\\"rect\\",\\"w\\":" + r.w() + "}";
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（手動 JSON / Serializable）", whenToUse: "フィールドが少なく構造が単純な DTO で、外部依存を入れたくない場合。ログ出力やデバッグ用途。", tradeoff: "エスケープ処理やネスト構造の対応は手動で行う必要があり、フィールド数が増えると保守が難しくなる。" },
    { name: "Jackson（ObjectMapper）", whenToUse: "本番の API 連携や複雑な JSON 構造を扱う場合。record とも自然に連携する。", tradeoff: "依存の追加が必要。バージョンアップ時に record 対応のモジュール構成が変わることがある。" },
    { name: "Gson（Google）", whenToUse: "Android 開発や軽量な JSON ライブラリが必要な場合。", tradeoff: "record のデフォルトコンストラクタが無いためデシリアライズに追加設定が要る場合がある。Jackson と比較してメンテナンス頻度がやや低い。" },
  ],
  faq: [
    { question: "record でバイナリシリアライズを使うべき場面はありますか。", answer: "一時ファイルへの中間保存やキャッシュなど、Java 同士でしかやり取りしない場面では有効です。ただし外部システムとの連携では JSON や Protocol Buffers のほうが互換性・可読性の面で有利です。" },
    { question: "record の JSON 変換で null フィールドはどう扱うのが安全ですか。", answer: "API 仕様で null の扱いを決めておくのが前提です。手動変換では null チェックを入れて省略または \"null\" を出力します。Jackson なら @JsonInclude で制御できます。" },
    { question: "record のシリアライズで serialVersionUID は必須ですか。", answer: "必須ではありませんが、定義しておくとフィールド構成の変更時に InvalidClassException で早期に検知できます。永続化やキャッシュに使う record では付けておくことを推奨します。" },
  ],
  codeTitle: "RecordSerializeDemo.java",
  codeSample: `import java.io.*;

public class RecordSerializeDemo {

    // Serializable を明示的に implements
    record UserDto(String id, String name, int age) implements Serializable {
        @SuppressWarnings("unused")
        private static final long serialVersionUID = 1L;
    }

    // Pure Java での手動 JSON 変換
    static String toJson(UserDto user) {
        return "{\\"id\\":\\"" + user.id() + "\\","
                + "\\"name\\":\\"" + user.name() + "\\","
                + "\\"age\\":" + user.age() + "}";
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        var user = new UserDto("U001", "田中太郎", 30);
        System.out.println("元オブジェクト: " + user);

        var json = toJson(user);
        System.out.println("JSON: " + json);

        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(user);
            bytes = baos.toByteArray();
        }
        System.out.println("シリアライズ済みバイト数: " + bytes.length);

        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            var restored = (UserDto) ois.readObject();
            System.out.println("復元: " + restored);
            System.out.println("元と一致: " + user.equals(restored));
        }
    }
}`,
},
{
  slug: "record-vs-class-enum",
  title: "Java の Record・Class・Enum の使い分け判断基準",
  categorySlug: "records",
  summary: "record・class・enum を業務設計の文脈で比較し、選定の判断基準を整理する。",
  version: "Java 17",
  tags: ["record", "class", "enum", "DTO", "値オブジェクト", "設計"],
  apiNames: ["record", "enum", "final class"],
  description: "Java の record・class・enum をいつ使い分けるか、業務コード設計の観点から外部ライブラリ不要で Java 8/17/21 対応の判断基準を解説する。",
  lead: "Java 17 以降では、データを保持する型として record・class・enum の3つの選択肢があります。enum は固定の定数セット、record は不変の値オブジェクト、class は可変状態やビジネスロジックを持つ汎用的な型、というのが大まかな棲み分けですが、実務では判断に迷う場面が少なくありません。注文ステータスは enum で十分か、注文明細は record にすべきか、ステータス遷移のロジックは class に置くのか。この記事では、受注処理を題材に3つの型を組み合わせた設計パターンを示しながら、それぞれの使いどころと限界を整理します。Java 8 環境で同じ設計をどう実現するかも併記するので、バージョン移行時の参考にもなるはずです。",
  useCases: [
    "注文ステータス（受付中・処理中・発送済みなど）を enum で定義し、注文データを record の DTO で表現する",
    "マスタ区分値は enum、トランザクションデータは record、業務ロジックは class という責務分離を設計レビューで適用する",
    "既存の POJO クラスを record に移行する際、可変状態を持つクラスとの境界線を見極める",
  ],
  cautions: [
    "enum にビジネスロジックを詰め込みすぎると肥大化する。状態遷移のような振る舞いは別クラスに切り出す方が保守しやすい",
    "record は継承できないため、共通フィールドを持つ複数の record を作る場合は interface でメソッドを共有する設計にする",
    "record の withXxx パターンは便利だが、フィールド数が多い record では引数の順序ミスが起きやすい。ビルダーパターンの検討も視野に入れる",
    "enum の values() は呼ぶたびに配列をコピーする。ループで大量に呼ぶ場合は List.of(values()) でキャッシュしておく",
  ],
  relatedArticleSlugs: ["record-basics", "sealed-record", "enum-basics"],
  versionCoverage: {
    java8: "record が使えないため、DTO は final class + final フィールドで実装する。enum と class の使い分けは同じ考え方だが、コード量が多くなる。",
    java17: "record が加わり、enum = 定数・record = 不変値・class = 可変状態/ロジック という三分類が明確になる。with パターンで不変更新も簡潔。",
    java21: "sealed interface と switch パターンマッチングにより、record のバリアント分岐を型安全に網羅できる。状態遷移の表現力が向上する。",
    java8Code: `// Java 8: DTO は final class で手動実装
static final class OrderDto {
    private final String orderId;
    private final String product;
    private final int quantity;
    private final OrderStatus status;
    // コンストラクタ・getter・equals・hashCode・toString
    // すべて手動で実装が必要（約50行）
    public OrderDto withStatus(OrderStatus s) {
        return new OrderDto(orderId, product, quantity, s);
    }
}`,
    java17Code: `// Java 17: record で DTO を簡潔に定義
record OrderDto(String orderId, String product,
                int quantity, OrderStatus status) {
    public OrderDto withStatus(OrderStatus newStatus) {
        return new OrderDto(orderId, product,
                            quantity, newStatus);
    }
}
// enum OrderStatus { PENDING, PROCESSING, ... }
// class OrderService { OrderStatus advance(...) }`,
    java21Code: `// Java 21: sealed interface で遷移を型安全に
sealed interface StatusTransition
    permits StatusTransition.Advance, StatusTransition.Cancel {
    record Advance(OrderStatus from, OrderStatus to)
        implements StatusTransition {}
    record Cancel(OrderStatus from)
        implements StatusTransition {}
}
// switch パターンマッチングで全バリアントを網羅
OrderDto apply(OrderDto o, StatusTransition t) {
    return switch (t) {
        case Advance a -> o.withStatus(a.to());
        case Cancel  c -> o.withStatus(CANCELLED);
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（record + enum + class）", whenToUse: "Java 16 以上で DTO・定数・ロジックを明確に分離したい場面。依存追加なしで設計意図をコードに反映できる。", tradeoff: "record の with パターンは手動実装が必要。フィールド数が多い場合はビルダーの導入を別途検討する必要がある。" },
    { name: "Lombok（@Value + @Builder）", whenToUse: "Java 8 環境で record 相当の不変クラスとビルダーを同時に手に入れたいとき。", tradeoff: "アノテーションプロセッサ依存。record が使える環境では、Lombok の @Value は冗長になりつつある。" },
    { name: "Immutables（org.immutables）", whenToUse: "不変オブジェクトの生成・ビルダー・with メソッドを自動生成したいとき。", tradeoff: "コード生成ベースのため、生成クラスのデバッグがやや困難。record の普及に伴い、シンプルな DTO には過剰な選択肢になりつつある。" },
  ],
  faq: [
    { question: "enum にメソッドを持たせるのと、class にロジックを置くのと、どちらがよいですか。", answer: "enum にはラベル取得や変換のような自身の属性に閉じたメソッドを置き、状態遷移や業務判定のように外部依存があるロジックは別クラスに切り出すのが保守しやすい設計です。" },
    { question: "record と class のどちらを使うか迷ったときの基準はありますか。", answer: "フィールドが変更不要で、equals を全フィールドで比較して問題ないなら record を選びます。可変状態を持つ、equals をカスタムしたい、継承が必要、のいずれかに該当すれば class を使います。" },
    { question: "既存の enum を record に置き換えるべきケースはありますか。", answer: "enum は固定セットの表現に適しており、record の代わりにはなりません。逆にインスタンスごとに異なる値を持つデータは record が適しています。両者は補完関係であり、置き換えの関係ではありません。" },
  ],
  codeTitle: "RecordVsClassVsEnumDemo.java",
  codeSample: `import java.util.List;

public class RecordVsClassVsEnumDemo {

    // === Enum: 固定の定数セット ===
    enum OrderStatus {
        PENDING("受付中"),
        PROCESSING("処理中"),
        SHIPPED("発送済み"),
        DELIVERED("配達済み"),
        CANCELLED("キャンセル");

        private final String label;
        OrderStatus(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    // === Record: 不変の値オブジェクト（DTO） ===
    record OrderDto(String orderId, String product,
                    int quantity, OrderStatus status) {
        // with パターン: ステータスを変更した新しい DTO を返す
        public OrderDto withStatus(OrderStatus newStatus) {
            return new OrderDto(orderId, product, quantity, newStatus);
        }
    }

    // === Class: 可変状態を持つビジネスロジック ===
    static class OrderService {
        private int processedCount = 0;

        public OrderStatus advance(OrderStatus current) {
            processedCount++;
            if (current == OrderStatus.PENDING) return OrderStatus.PROCESSING;
            if (current == OrderStatus.PROCESSING) return OrderStatus.SHIPPED;
            return current;
        }

        public int getProcessedCount() { return processedCount; }
    }

    public static void main(String[] args) {
        // Enum: ステータス一覧
        System.out.println("=== Enum: 注文ステータス一覧 ===");
        List.of(OrderStatus.values()).forEach(s ->
            System.out.println(s.name() + " -> " + s.getLabel()));

        // Class: ビジネスロジック
        System.out.println("\\n=== Class: ステータス遷移 ===");
        var service = new OrderService();
        var status = OrderStatus.PENDING;
        status = service.advance(status); // PROCESSING
        status = service.advance(status); // SHIPPED
        System.out.println("現在: " + status.getLabel()
            + " (処理回数: " + service.getProcessedCount() + ")");

        // Record: 不変 DTO の操作
        System.out.println("\\n=== Record: 注文 DTO ===");
        var order = new OrderDto("ORD-001", "ノートPC", 2, OrderStatus.PENDING);
        System.out.println(order);
        var updated = order.withStatus(OrderStatus.PROCESSING);
        System.out.println("更新後: " + updated);
        System.out.println("元は不変: " + order.status().getLabel());

        // 一覧表示
        System.out.println("\\n=== 注文一覧 ===");
        var orders = List.of(
            new OrderDto("ORD-001", "ノートPC", 2, OrderStatus.PENDING),
            new OrderDto("ORD-002", "マウス", 5, OrderStatus.PROCESSING),
            new OrderDto("ORD-003", "キーボード", 1, OrderStatus.SHIPPED)
        );
        orders.forEach(o ->
            System.out.println(o.orderId() + ": " + o.product()
                + " -> " + o.status().getLabel()));
    }
}`,
},
{
  slug: "sealed-record",
  title: "Sealed Classes と Record で型安全な設計を実現する",
  categorySlug: "records",
  summary: "sealed interface + record の組み合わせで、分岐漏れをコンパイル時に検出する設計を整理する。",
  version: "Java 17",
  tags: ["sealed", "record", "パターンマッチング", "型安全", "switch式"],
  apiNames: ["sealed", "permits", "instanceof", "switch"],
  description: "Java の sealed interface と record を組み合わせた型安全な設計パターンを、Java 8/17/21 対応で外部ライブラリ不要で解説する。",
  lead: "業務コードでは「この型は3種類しかない」「このインターフェースを実装できるクラスを限定したい」という場面がしばしばあります。Java 17 で正式導入された sealed interface は、サブタイプを permits で明示的に制限し、想定外の実装クラスの追加をコンパイル時に防ぐ仕組みです。これを record と組み合わせると、各バリアントが不変の値オブジェクトとして定義され、switch 式のパターンマッチングで全ケースの網羅がコンパイラによって保証されます。この記事では、図形計算を題材に sealed + record の基本構文を押さえたうえで、Java 8 で同等の設計をどう表現していたか、Java 21 で switch パターンマッチングがどう改善されたかを比較します。分岐漏れをテストではなくコンパイルで検出できる設計手法として、実務での適用ポイントを整理します。",
  useCases: [
    "決済手段（クレジットカード・銀行振込・電子マネー）を sealed interface で定義し、手数料計算の分岐漏れをコンパイル時に検出する",
    "通知チャネル（メール・SMS・プッシュ通知）を sealed record で表現し、送信処理の switch 文で全チャネルの網羅を保証する",
    "帳票の出力形式（PDF・CSV・Excel）を sealed で制限し、フォーマット追加時に対応漏れの箇所をコンパイルエラーで洗い出す",
  ],
  cautions: [
    "sealed interface の permits に列挙するクラスは、同一パッケージ（または同一モジュール）内に存在する必要がある",
    "Java 17 の switch 式では sealed 型の網羅性チェックがまだプレビューのため、default 句が必要になる場合がある。Java 21 で正式対応",
    "sealed を使うと外部からの拡張が不可能になる。ライブラリとして公開する型に sealed を付けるかどうかは、拡張ポイントの設計方針を先に決めること",
    "record の入れ子定義（sealed interface の permits に内部 record を列挙）は、完全修飾名が長くなりやすい。トップレベルに置くかどうかは可読性とのバランスで判断する",
    "sealed の permits にクラスを追加し忘れると、そのクラスはコンパイルエラーになる。これは意図した挙動だが、初見では原因に気付きにくい",
  ],
  relatedArticleSlugs: ["record-basics", "record-vs-class-enum", "enum-basics"],
  versionCoverage: {
    java8: "sealed は使えない。abstract class + enum で型を列挙し、switch 文で分岐する。新しいサブクラスが追加されても default に落ちるだけで、コンパイル時に漏れを検出できない。",
    java17: "sealed interface + record が使える。instanceof パターンマッチングで if-else 分岐は簡潔に書けるが、switch 式での網羅性チェックはプレビュー段階。",
    java21: "switch 式のパターンマッチングが正式化。sealed 型の全バリアントを case に列挙すれば default が不要になり、バリアント追加時にコンパイルエラーで漏れを検出できる。",
    java8Code: `// Java 8: abstract class + enum で代替
enum ShapeType { CIRCLE, RECTANGLE, TRIANGLE }

static abstract class Shape {
    abstract double area();
    abstract ShapeType getType();
}
static class Circle extends Shape {
    private final double radius;
    Circle(double r) { this.radius = r; }
    double area() { return Math.PI * radius * radius; }
    ShapeType getType() { return ShapeType.CIRCLE; }
}
// Rectangle, Triangle も同様...
// switch (shape.getType()) で分岐するが
// 新しい型を追加しても default に落ちるだけ`,
    java17Code: `// Java 17: sealed interface + record
sealed interface Shape permits Circle, Rect, Tri {}
record Circle(double radius) implements Shape {}
record Rect(double w, double h) implements Shape {}
record Tri(double base, double h) implements Shape {}

// instanceof パターンマッチングで分岐
static String describe(Shape s) {
    if (s instanceof Circle c) return "円: r=" + c.radius();
    if (s instanceof Rect r) return "長方形: " + r.w() + "x" + r.h();
    if (s instanceof Tri t) return "三角: base=" + t.base();
    return "不明"; // コンパイラの網羅保証はまだない
}`,
    java21Code: `// Java 21: switch パターンマッチング正式化
// sealed 型の全バリアントを列挙 → default 不要
static String describe(Shape s) {
    return switch (s) {
        case Circle c -> "円 r=" + c.radius()
            + " 面積=" + String.format("%.2f", Math.PI * c.radius() * c.radius());
        case Rect r -> "長方形 " + r.w() + "x" + r.h();
        case Tri t -> "三角 base=" + t.base();
        // 新しい型を permits に追加すると、ここでコンパイルエラー
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（sealed + record + switch）", whenToUse: "Java 17 以上でバリアントが有限な型階層を設計するとき。コンパイラの網羅性チェックが最大の利点。", tradeoff: "Java 21 未満では switch の網羅性チェックがプレビューのため、default 句が必要になる場合がある。" },
    { name: "Visitor パターン（従来の Java）", whenToUse: "Java 8 環境で型ごとの処理分岐を安全に行いたいとき。新しい型の追加時に accept メソッドの実装漏れをコンパイルで検出できる。", tradeoff: "Visitor インターフェースと accept メソッドのボイラープレートが多い。sealed + switch で同じ安全性がより簡潔に得られる。" },
    { name: "Vavr（io.vavr）", whenToUse: "Java 8 環境で代数的データ型（ADT）を関数型スタイルで扱いたいとき。", tradeoff: "学習コストが高く、チーム全体での採用には合意が必要。Java 17 以降では sealed + record が標準で同等の表現力を持つ。" },
  ],
  faq: [
    { question: "sealed interface と abstract class のどちらを使うべきですか。", answer: "record は class を extends できないため、record をバリアントに使う場合は interface 一択です。class をバリアントにする場合でも、多重実装の柔軟性から interface を基本に据えるのが一般的です。" },
    { question: "sealed 型に新しいバリアントを追加するとどうなりますか。", answer: "permits にクラスを追加し、既存の switch 式にそのケースがなければコンパイルエラーになります。これが sealed の最大の利点で、分岐漏れを実行前に発見できます。" },
    { question: "sealed は enum の上位互換と考えてよいですか。", answer: "目的が異なります。enum は固定のシングルトン定数セットで、sealed は型階層の制限です。enum の各値はインスタンスが1つですが、sealed record のバリアントは任意の値で複数インスタンスを作れます。" },
  ],
  codeTitle: "SealedRecordDemo.java",
  codeSample: `public class SealedRecordDemo {

    // sealed interface で図形の種類を制限
    sealed interface Shape permits Circle, Rectangle, Triangle {}

    record Circle(double radius) implements Shape {
        double area() { return Math.PI * radius * radius; }
    }

    record Rectangle(double width, double height) implements Shape {
        double area() { return width * height; }
    }

    record Triangle(double base, double height) implements Shape {
        double area() { return 0.5 * base * height; }
    }

    // instanceof パターンマッチングで型安全に分岐（Java 16+）
    static String describe(Shape shape) {
        if (shape instanceof Circle c) {
            return "円形 半径=" + c.radius()
                + " 面積=" + String.format("%.2f", c.area());
        } else if (shape instanceof Rectangle r) {
            return "長方形 " + r.width() + "x" + r.height()
                + " 面積=" + String.format("%.2f", r.area());
        } else if (shape instanceof Triangle t) {
            return "三角形 底辺=" + t.base()
                + " 面積=" + String.format("%.2f", t.area());
        }
        return "不明な図形";
    }

    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle(5.0),
            new Rectangle(3.0, 4.0),
            new Triangle(6.0, 8.0)
        };

        System.out.println("=== sealed interface + record ===");
        for (var shape : shapes) {
            System.out.println(describe(shape));
        }

        // instanceof でフィールドを直接取り出す
        System.out.println("\\n=== パターンマッチングによる分解 ===");
        Shape s = new Circle(10.0);
        if (s instanceof Circle c) {
            System.out.println("半径: " + c.radius());
            System.out.println("面積: " + String.format("%.2f", c.area()));
        }

        // record の equals / toString は自動生成
        System.out.println("\\n=== record の自動生成メソッド ===");
        var r1 = new Rectangle(3.0, 4.0);
        var r2 = new Rectangle(3.0, 4.0);
        System.out.println("r1: " + r1);
        System.out.println("r1.equals(r2): " + r1.equals(r2));
    }
}`,
},
]
