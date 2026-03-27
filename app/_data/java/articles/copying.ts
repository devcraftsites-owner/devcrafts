import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "copy-pattern",
  title: "Java の浅いコピーと深いコピーの違いと実務での使い分け解説",
  categorySlug: "copying",
  summary: "shallow copy と deep copy の違いを、参照共有による副作用とあわせて整理する。",
  version: "Java 17",
  tags: ["shallow copy", "deep copy", "参照共有", "ArrayList", "Arrays.copyOf"],
  apiNames: ["ArrayList", "Arrays.copyOf", "Stream", "Collectors.toCollection", "List.of"],
  description: "Java の浅いコピーと深いコピーの違いを、参照共有による副作用やバージョン別の書き方とあわせて外部ライブラリ不要で Java 8/17/21 対応で解説する。",
  lead: "Java でオブジェクトをコピーする場面は、DTO の変換、画面表示用データの加工、テスト用のデータ準備など業務コードの随所に現れます。ところが「コピーしたはずなのに元データが変わった」というバグは、経験者でも年に何度かは踏むものです。原因のほとんどは、浅いコピー（shallow copy）と深いコピー（deep copy）の違いを正しく使い分けていないことにあります。この記事では、参照コピー・浅いコピー・深いコピーの3段階を図解的にコードで示し、List や配列のコピーで何が共有され何が独立するのかを整理します。Java 17 の record と var を活用した記述の簡潔化、Java 21 の sealed interface によるコピー戦略の型安全な切り替えにも触れます。",
  useCases: [
    "取引明細の一覧を画面表示用に加工する際、元データに影響を与えないディープコピーを行う",
    "テストデータのテンプレートを1つ用意し、テストケースごとに独立したコピーを作って値を差し替える",
    "バッチ処理の途中結果をスナップショットとして保存し、後続処理で元データが変更されても影響を受けないようにする",
  ],
  cautions: [
    "new ArrayList<>(original) はリストの浅いコピーであり、要素オブジェクトの参照は共有される。要素が可変クラスの場合、コピー先での変更が元にも伝播する",
    "Arrays.copyOf はプリミティブ配列では値コピーになるが、オブジェクト配列では参照のコピーになる。int[] と Object[] で挙動が異なる点を見落としやすい",
    "Stream + map でディープコピーする際、コピー対象クラスにネストしたオブジェクトがあれば再帰的にコピーしないと浅いコピーに留まる",
    "record は immutable なのでコピーの問題が発生しにくい。ただし record のフィールドが List などの可変オブジェクトを持つ場合、その List 自体は変更可能な点に注意",
  ],
  relatedArticleSlugs: ["copy-constructor", "copy-pitfall"],
  versionCoverage: {
    java8: "for ループや deepCopy() メソッドを自作してディープコピーを行う。var が使えないため型宣言が冗長になりやすい。",
    java17: "var で型推論、Stream + map + collect で宣言的なディープコピーが書ける。record を活用すればそもそもコピー問題を回避できる。",
    java21: "sealed interface + switch パターンマッチングでコピー戦略を型安全に切り替えられる。基本のコピーロジック自体は Java 17 と同等。",
    java8Code: `// Java 8: for ループでディープコピー
List<Person> deepCopy = new ArrayList<>();
for (Person p : original) {
    deepCopy.add(p.deepCopy());
}`,
    java17Code: `// Java 17: Stream + map で宣言的にディープコピー
var deepCopy = original.stream()
    .map(p -> new MutablePerson(p.getName(), p.getAge()))
    .collect(Collectors.toCollection(ArrayList::new));`,
    java21Code: `// Java 21: sealed interface でコピー戦略を型安全に分岐
sealed interface CopyStrategy
    permits CopyStrategy.Shallow, CopyStrategy.Deep {
  record Shallow() implements CopyStrategy {}
  record Deep() implements CopyStrategy {}
}
var result = switch (strategy) {
    case CopyStrategy.Shallow s -> new ArrayList<>(src);
    case CopyStrategy.Deep d -> src.stream()
        .map(p -> new MutablePerson(p.getName(), p.getAge()))
        .collect(Collectors.toCollection(ArrayList::new));
};`,
  },
  libraryComparison: [
    { name: "標準 API（ArrayList + Stream）", whenToUse: "コピー対象の構造が単純で、自前のマッピングで十分なとき。依存ゼロで保守しやすい。", tradeoff: "ネストが深い場合はコピーコードが増える。フィールド追加時にコピー漏れが起きやすい。" },
    { name: "Apache Commons Lang (SerializationUtils)", whenToUse: "ネストが深く手動コピーが煩雑なとき。Serializable 実装済みなら1行でディープコピーできる。", tradeoff: "Serializable が前提。性能面でオーバーヘッドがあり、大量データには不向き。依存追加も必要。" },
    { name: "MapStruct", whenToUse: "DTO 変換が頻繁で、フィールドマッピングのコード生成に任せたいとき。", tradeoff: "コンパイル時コード生成のため導入コストがある。単純コピーだけの用途にはやや大きい。" },
  ],
  faq: [
    { question: "String は参照型なのに浅いコピーで問題にならないのはなぜですか。", answer: "String は不変（immutable）なので、参照が共有されても変更が伝播しません。同じ理由で Integer や LocalDate なども浅いコピーで安全です。" },
    { question: "clone() メソッドを使ったコピーは推奨されますか。", answer: "clone() は Cloneable の契約が曖昧で、浅いコピーしか行わないため推奨されません。コピーコンストラクタかファクトリメソッドのほうが意図が明確です。" },
    { question: "record を使えばコピーの問題は完全に解消しますか。", answer: "record 自体は不変ですが、フィールドに可変コレクション（ArrayList など）を持つ場合は要注意です。コンパクトコンストラクタで List.copyOf を使い防御コピーすると安全です。" },
  ],
  codeTitle: "CopyPatternDemo.java",
  codeSample: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class CopyPatternDemo {

    static class MutablePerson {
        private String name;
        private int age;

        public MutablePerson(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getAge() { return age; }

        @Override
        public String toString() {
            return "MutablePerson{name=" + name + ", age=" + age + "}";
        }
    }

    public static void main(String[] args) {

        var original = new ArrayList<>(List.of(
            new MutablePerson("田中太郎", 25),
            new MutablePerson("山田花子", 30)
        ));

        var shallowCopy = new ArrayList<>(original);
        shallowCopy.get(0).setName("変更された名前");
        System.out.println("元データも変わる: " + original.get(0));

        var original2 = new ArrayList<>(List.of(
            new MutablePerson("田中太郎", 25),
            new MutablePerson("山田花子", 30)
        ));

        var deepCopy = original2.stream()
            .map(p -> new MutablePerson(p.getName(), p.getAge()))
            .collect(Collectors.toCollection(ArrayList::new));

        deepCopy.get(0).setName("変更しても");
        System.out.println("元データは変わらない: " + original2.get(0));

        var arr = new int[]{1, 2, 3, 4, 5};
        var copiedArr = Arrays.copyOf(arr, arr.length);
        arr[0] = 99;
        System.out.println("copiedArr[0]: " + copiedArr[0]); // 1
    }
}`,
},
{
  slug: "copy-constructor",
  title: "Java コピーコンストラクタで安全にオブジェクトを複製する",
  categorySlug: "copying",
  summary: "コピーコンストラクタと record の with パターンを使った安全な複製手法を整理する。",
  version: "Java 17",
  tags: ["コピーコンストラクタ", "deep copy", "record", "with パターン", "Serializable"],
  apiNames: ["ObjectOutputStream", "ObjectInputStream", "ByteArrayOutputStream", "ByteArrayInputStream", "List.copyOf"],
  description: "Java のコピーコンストラクタの設計パターンと record を活用した不変オブジェクトの with パターンを外部ライブラリ不要で Java 8/17/21 対応で解説する。",
  lead: "業務システムでは、従業員情報や住所録のように複数のフィールドがネストした構造を「一部だけ変えたコピー」として扱う場面がよくあります。Cloneable を実装して clone() を呼ぶ手法は古くからありますが、浅いコピーしか行わず契約も曖昧なため、Effective Java でも推奨されていません。この記事では、clone() に頼らない3つのコピー手法を整理します。コピーコンストラクタでネストも含めて再帰的に複製する方法、record の with パターンで不変オブジェクトの一部を差し替える方法、そしてシリアライズによる汎用ディープコピーです。それぞれの適用場面とトレードオフを、動くコード付きで示します。",
  useCases: [
    "顧客マスタの住所変更時に、変更前のスナップショットを履歴テーブルへ保存するためにコピーコンストラクタで複製する",
    "受注明細の一部フィールド（数量・単価）だけを修正した改定版を with パターンで作成し、元の明細は変更しない",
    "テスト用のフィクスチャオブジェクトをシリアライズ経由でディープコピーし、テストケース間の状態汚染を防ぐ",
  ],
  cautions: [
    "コピーコンストラクタでネストしたオブジェクトのコピーを忘れると浅いコピーになる。Address を含む Employee をコピーするとき、new Address(other.address) を書き忘れやすい",
    "record の with パターンは Java に構文として存在しないため自前でメソッドを定義する必要がある。フィールド数が多いとメソッドも増えるため、Builder パターンとの併用を検討する",
    "シリアライズによるディープコピーは全フィールドを自動コピーできるが、Serializable 未実装のクラスには使えない。性能面でも100倍以上遅くなることがある",
    "record のフィールドに List を持つ場合、コンパクトコンストラクタで List.copyOf を呼んで防御コピーしないと外部から変更される可能性がある",
  ],
  relatedArticleSlugs: ["copy-pattern", "copy-pitfall"],
  versionCoverage: {
    java8: "コピーコンストラクタとシリアライズの2パターンが基本。record が使えないため、不変オブジェクト設計には手動で final フィールド + getter を定義する。",
    java17: "record で不変オブジェクトを簡潔に定義でき、with パターンで一部フィールドの差し替えも自然に書ける。var + try-with-resources でシリアライズコードも読みやすい。",
    java21: "sealed interface + switch パターンマッチングでコピー戦略（コンストラクタ / シリアライズ / record with）を型安全に分岐できる。",
    java8Code: `// Java 8: コピーコンストラクタ（手動で全フィールドを複製）
Employee(Employee other) {
    this.name = other.name;
    this.age = other.age;
    this.address = new Address(other.address);
    this.skills = new ArrayList<>(other.skills);
}`,
    java17Code: `// Java 17: record + with パターンで一部だけ差し替え
record ImmutableEmployee(String name, int age,
        ImmutableAddress address, List<String> skills) {
    ImmutableEmployee { skills = List.copyOf(skills); }
    ImmutableEmployee withName(String newName) {
        return new ImmutableEmployee(newName, age, address, skills);
    }
}`,
    java21Code: `// Java 21: sealed interface でコピー戦略を型安全に表現
sealed interface CopyStrategy permits
    CopyStrategy.Constructor, CopyStrategy.Serialization,
    CopyStrategy.RecordWith {
  record Constructor() implements CopyStrategy {}
  record Serialization() implements CopyStrategy {}
  record RecordWith() implements CopyStrategy {}
}
switch (strategy) {
    case Constructor c -> new Employee(original);
    case Serialization s -> deepCopyBySerialization(original);
    case RecordWith r -> origEmp.withName("新しい名前");
}`,
  },
  libraryComparison: [
    { name: "標準 API（コピーコンストラクタ）", whenToUse: "フィールド数が少なくネストも浅い場合。意図が明確で保守しやすい。", tradeoff: "フィールド追加時にコンストラクタの修正漏れが起きやすい。ネストが深いと再帰コピーのコードが増える。" },
    { name: "標準 API（シリアライズ）", whenToUse: "全フィールドを自動コピーしたいとき。コピーコンストラクタの記述コストを避けたい場合。", tradeoff: "Serializable が必要。性能は数十〜数百倍遅く、大量データや高頻度呼び出しには不向き。" },
    { name: "ModelMapper / MapStruct", whenToUse: "異なる型間のマッピングを含むコピーが大量にあるとき。", tradeoff: "同一型のディープコピーだけなら導入コストに見合わない。フレームワーク依存が増える。" },
  ],
  faq: [
    { question: "clone() ではなくコピーコンストラクタを使うべき理由は何ですか。", answer: "clone() は Cloneable の契約が不明確で、常に浅いコピーです。コピーコンストラクタはコピー範囲が明示的で、ネストしたフィールドの扱いもコード上で見えるため安全です。" },
    { question: "record の with パターンはフィールド数が多いと不便ではないですか。", answer: "フィールドが5つを超える場合は Builder パターンと組み合わせるのが現実的です。Lombok の @With を使う選択肢もありますが、依存の追加が許容できるか次第です。" },
    { question: "シリアライズによるディープコピーの性能はどのくらい遅いですか。", answer: "コピーコンストラクタの100〜1,000倍遅いことがあります。テストコードやバッチの初期化など、頻度の低い場面に限定するのが安全です。" },
  ],
  codeTitle: "CopyConstructorDemo.java",
  codeSample: `import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class CopyConstructorDemo {

    // ネストしたオブジェクト
    static class Address implements Serializable {
        private static final long serialVersionUID = 1L;
        String prefecture;
        String city;

        Address(String prefecture, String city) {
            this.prefecture = prefecture;
            this.city = city;
        }

        // コピーコンストラクタ
        Address(Address other) {
            this.prefecture = other.prefecture;
            this.city = other.city;
        }

        @Override
        public String toString() {
            return prefecture + " " + city;
        }
    }

    static class Employee implements Serializable {
        private static final long serialVersionUID = 1L;
        String name;
        int age;
        Address address;
        List<String> skills;

        Employee(String name, int age, Address address, List<String> skills) {
            this.name = name;
            this.age = age;
            this.address = address;
            this.skills = skills;
        }

        // コピーコンストラクタ: ネストも再帰的にコピー
        Employee(Employee other) {
            this.name = other.name;
            this.age = other.age;
            this.address = new Address(other.address);
            this.skills = new ArrayList<>(other.skills);
        }

        @Override
        public String toString() {
            return "Employee{name='" + name + "', age=" + age
                    + ", address=" + address + ", skills=" + skills + "}";
        }
    }

    // record + with パターン（Java 17+）
    record ImmutableAddress(String prefecture, String city) {}

    record ImmutableEmployee(String name, int age,
            ImmutableAddress address, List<String> skills) {
        ImmutableEmployee {
            skills = List.copyOf(skills); // 防御コピー
        }
        ImmutableEmployee withName(String newName) {
            return new ImmutableEmployee(newName, age, address, skills);
        }
        ImmutableEmployee withAddress(ImmutableAddress newAddr) {
            return new ImmutableEmployee(name, age, newAddr, skills);
        }
    }

    public static void main(String[] args) {
        // パターン 1: コピーコンストラクタ
        var original = new Employee("田中太郎", 30,
                new Address("東京都", "渋谷区"),
                new ArrayList<>(List.of("Java", "Python")));
        var copy = new Employee(original);
        copy.name = "鈴木次郎";
        copy.address.city = "新宿区";
        System.out.println("元（変化なし）: " + original);
        System.out.println("コピー:       " + copy);

        // パターン 2: record の with パターン
        var emp = new ImmutableEmployee("田中太郎", 30,
                new ImmutableAddress("東京都", "渋谷区"),
                List.of("Java", "Python"));
        var modified = emp.withName("鈴木次郎")
                .withAddress(new ImmutableAddress("大阪府", "梅田"));
        System.out.println("元: " + emp);
        System.out.println("変更後: " + modified);
    }
}`,
},
{
  slug: "copy-pitfall",
  title: "Java コピーの落とし穴と防御コピーの実装パターンまとめ解説",
  categorySlug: "copying",
  summary: "参照コピー・浅いコピー・不変リストの誤解など、コピーで起きるバグの原因と対策を整理する。",
  version: "Java 17",
  tags: ["参照コピー", "落とし穴", "防御コピー", "List.copyOf", "unmodifiableList"],
  apiNames: ["List.copyOf", "Collections.unmodifiableList", "ArrayList", "List.of", "Stream.toList"],
  description: "Java のコピーで起きやすい3つの落とし穴と、record + List.copyOf による防御コピーの対策を外部ライブラリ不要で Java 8/17/21 対応で解説する。",
  lead: "「コピーしたはずのリストの中身が変わっていた」「unmodifiableList を使ったのに内容が書き換わった」――Java のコピーに関するバグは、問題の発生箇所と原因箇所が離れているため、デバッグに時間がかかることで知られています。原因はほぼ3パターンに集約されます。参照のコピーと値のコピーの混同、浅いコピーの要素共有、不変コレクション API の挙動の誤解です。この記事では、それぞれの落とし穴を再現するコードを示したうえで、record と List.copyOf を組み合わせた防御コピーの実装パターンを紹介します。特に Java 8 の Collections.unmodifiableList と Java 17 の List.copyOf の決定的な違いは、保守案件で引き継いだコードを読むときにも役立ちます。",
  useCases: [
    "CSV 取込で構築したマスタデータ一覧を複数の処理に渡す際、意図しない変更を防ぐ防御コピーを入れる",
    "DTO のコレクションフィールドに外部から渡されたリストをそのまま代入せず、コンストラクタで防御コピーする",
    "テストで期待値と実測値を比較する前にコピーを取り、アサーション失敗時に元データが汚染されていないことを保証する",
  ],
  cautions: [
    "Collections.unmodifiableList は元リストの参照を持つだけなので、元リストが変更されると不変リスト側にも反映される。完全に独立したコピーには List.copyOf を使う",
    "List.of() が返すリストに null を渡すと NullPointerException になる。null を含む可能性があるデータには Collections.unmodifiableList を使う",
    "Stream.toList()（Java 16+）は不変リストを返すが、Collectors.toList() は可変リストを返す。名前が似ているため混同しやすい",
    "record のフィールドに可変コレクションを渡すと、record 外部からリストの中身を変更できてしまう。コンパクトコンストラクタで List.copyOf を使って防御コピーすること",
    "浅いコピーで要素が共有されるバグは、単体テストでは再現しにくい。複数スレッドやバッチの並列実行で初めて顕在化するケースがある",
  ],
  relatedArticleSlugs: ["copy-pattern", "copy-constructor"],
  versionCoverage: {
    java8: "Collections.unmodifiableList で不変化できるが、元リストへの変更が透過する罠がある。防御コピーは new ArrayList<>() で行う。",
    java17: "List.copyOf で元リストから独立した不変コピーを安全に作れる。record との組み合わせで防御コピーが簡潔に書ける。",
    java21: "Stream.toList() が不変リストを返す点は Java 16 と同じ。sealed interface でコピーの種類を型安全に分類する応用が可能。",
    java8Code: `// Java 8: unmodifiableList は元リストの変更が透過する
List<String> mutable = new ArrayList<>(
        Arrays.asList("A", "B"));
List<String> unmod =
        Collections.unmodifiableList(mutable);
mutable.add("C");
System.out.println(unmod); // [A, B, C] ← 変わっている`,
    java17Code: `// Java 17: List.copyOf は独立したスナップショットを作る
var mutable = new ArrayList<>(List.of("A", "B"));
var snapshot = List.copyOf(mutable);
mutable.add("C");
System.out.println(snapshot); // [A, B] ← 変わらない`,
    java21Code: `// Java 21: sealed interface でコピー操作の種類を型安全に分類
sealed interface CopyOp permits
    CopyOp.Reference, CopyOp.Shallow, CopyOp.Deep {
  record Reference() implements CopyOp {}
  record Shallow() implements CopyOp {}
  record Deep() implements CopyOp {}
}
switch (op) {
    case Reference r -> "同じオブジェクト。変更が両方に影響。";
    case Shallow s -> "コンテナは新規。要素は共有。";
    case Deep d -> "コンテナも要素も新規。互いに独立。";
}`,
  },
  libraryComparison: [
    { name: "標準 API（List.copyOf / record）", whenToUse: "Java 10 以上であれば最も簡潔で安全な防御コピー手段。外部依存なしで保守コストが低い。", tradeoff: "Java 8 では使えないため、保守案件では Collections.unmodifiableList + new ArrayList のパターンが残る。" },
    { name: "Guava ImmutableList", whenToUse: "Java 8 環境で不変リストを使いたいとき。null 拒否の挙動が明確。", tradeoff: "Guava の依存を入れることになる。Java 10 以上なら List.copyOf で十分代替できる。" },
    { name: "Vavr (io.vavr)", whenToUse: "永続データ構造を使い、構造共有による効率的な不変コレクションを求めるとき。", tradeoff: "学習コストが高く、チームへの導入障壁がある。業務コードの防御コピー用途には過剰。" },
  ],
  faq: [
    { question: "List.copyOf と Collections.unmodifiableList の違いは何ですか。", answer: "List.copyOf は元リストから独立した不変コピーを作ります。unmodifiableList は元リストへの参照を持つだけなので、元が変わると不変リスト側も変わります。" },
    { question: "Stream.toList() と Collectors.toList() はどちらを使うべきですか。", answer: "Java 16 以上なら Stream.toList() が簡潔で不変リストを返します。ただし返却後に変更が必要な場合は Collectors.toCollection(ArrayList::new) を使います。" },
    { question: "record のコンパクトコンストラクタで防御コピーは必須ですか。", answer: "record のフィールドが不変型（String, int, LocalDate 等）のみなら不要です。List や配列など可変型を含む場合は List.copyOf で防御コピーしないと外部から書き換えられます。" },
  ],
  codeTitle: "CopyPitfallDemo.java",
  codeSample: `import java.util.ArrayList;
import java.util.List;

public class CopyPitfallDemo {

    // record + 防御コピー
    record ImmutablePerson(String name, List<String> hobbies) {
        ImmutablePerson {
            hobbies = List.copyOf(hobbies); // 防御コピー
        }
    }

    // 落とし穴の説明用に可変クラスも用意
    static class MutablePerson {
        String name;
        List<String> hobbies;

        MutablePerson(String name, List<String> hobbies) {
            this.name = name;
            this.hobbies = hobbies;
        }

        @Override
        public String toString() {
            return "MutablePerson{name='" + name + "', hobbies=" + hobbies + "}";
        }
    }

    public static void main(String[] args) {
        // 落とし穴 1: 参照コピー（同じリストを指す）
        System.out.println("=== 落とし穴 1: 参照コピー ===");
        var original = new ArrayList<>(List.of("Java", "Python"));
        var ref = original; // 同じリストを参照
        ref.add("Kotlin");
        System.out.println("original: " + original); // Kotlin も入っている

        // 落とし穴 2: 浅いコピー（要素は共有）
        System.out.println("\\n=== 落とし穴 2: 浅いコピー ===");
        var people = new ArrayList<MutablePerson>();
        people.add(new MutablePerson("田中",
                new ArrayList<>(List.of("サッカー"))));
        var shallowCopy = new ArrayList<>(people);
        shallowCopy.get(0).hobbies.add("テニス"); // 元も変わる
        System.out.println("original[0]: " + people.get(0));

        // 落とし穴 3: List.copyOf はスナップショット
        System.out.println("\\n=== List.copyOf は独立したコピー ===");
        var mutable = new ArrayList<>(List.of("A", "B"));
        var snapshot = List.copyOf(mutable);
        mutable.add("C");
        System.out.println("mutable:  " + mutable);   // [A, B, C]
        System.out.println("snapshot: " + snapshot);   // [A, B]

        // 対策: record + List.copyOf で安全なコピー
        System.out.println("\\n=== 対策: record + List.copyOf ===");
        var person = new ImmutablePerson("田中",
                List.of("サッカー", "テニス"));
        System.out.println("person: " + person);
        // person.hobbies().add("野球");
        // → UnsupportedOperationException（防御コピー済み）
    }
}`,
},
]
