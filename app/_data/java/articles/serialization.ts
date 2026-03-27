import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "serialization-basics",
  title: "Java シリアライズの基本と実務での使いどころを実例で解説",
  categorySlug: "serialization",
  summary: "Serializable の仕組みと serialVersionUID の役割を、動くコードで整理する。",
  version: "Java 17",
  tags: ["Serializable", "ObjectOutputStream", "ObjectInputStream", "serialVersionUID"],
  apiNames: ["Serializable", "ObjectOutputStream", "ObjectInputStream", "serialVersionUID"],
  description: "Java 標準のシリアライズの仕組みと serialVersionUID の意味を、業務で使う場面と注意点とともに外部ライブラリ不要で Java 8/17/21 対応で解説する。",
  lead: "Java のシリアライズは、オブジェクトをバイト列に変換してファイルやネットワーク経由で受け渡す仕組みです。HttpSession への格納、分散キャッシュへの保存、一時的なスナップショットの書き出しなど、業務システムでも意図せず使っている場面があります。しかし、Serializable を implements するだけで動くように見える手軽さの裏には、serialVersionUID を省略したときの互換性崩壊や、フィールド追加時の予期しない挙動など、テストで落としやすい罠がいくつもあります。この記事では、シリアライズとデシリアライズの基本的な流れを完結したコードで示したうえで、serialVersionUID を明示すべき理由、record をシリアライズするときの注意点、そして実務で避けるべきパターンを整理します。",
  useCases: [
    "Servlet コンテナのセッションレプリケーションで HttpSession に格納するオブジェクトを Serializable にする",
    "バッチ処理の途中経過をファイルに書き出しておき、異常終了時に途中から再開できるようにする",
    "分散キャッシュ（Hazelcast、Redis の Java シリアライズモード）にオブジェクトを格納する",
  ],
  cautions: [
    "serialVersionUID を省略するとコンパイラがクラス構造からハッシュ値を自動生成する。フィールドやメソッドを追加しただけで値が変わり、過去に保存したデータが InvalidClassException で読めなくなる",
    "Serializable を implements した親クラスのフィールドもシリアライズ対象になる。継承階層が深いと意図しないフィールドまで含まれるため、クラス設計時に影響範囲を把握しておくこと",
    "record は Serializable を自動実装しない。明示的に implements Serializable を書く必要がある。また record のシリアライズはコンストラクタ経由で復元されるため、通常クラスとは挙動が異なる",
    "ObjectOutputStream はストリームヘッダを含むため、同一ファイルに複数回 new ObjectOutputStream で追記するとデシリアライズ時にヘッダの重複で StreamCorruptedException が発生する",
  ],
  relatedArticleSlugs: ["transient-serial-version", "externalizable"],
  versionCoverage: {
    java8: "通常クラスに Serializable を実装し、serialVersionUID を明示するのが基本。var や record は使えないため、型を都度書く必要がある。",
    java17: "record に Serializable を実装できる。record のシリアライズはコンストラクタ経由で復元されるため、writeObject/readObject のカスタマイズが不要になる場面が多い。",
    java21: "record + sealed interface の組み合わせでシリアライズ対象の型を設計レベルで制限できる。基本の仕組みは Java 17 と同じ。",
    java8Code: `// Java 8: 通常クラスで Serializable を実装
static class Employee implements Serializable {
    private static final long serialVersionUID = 1L;
    private final String name;
    private final int salary;
    Employee(String name, int salary) {
        this.name = name;
        this.salary = salary;
    }
}`,
    java17Code: `// Java 17: record で Serializable を実装
record Employee(
    String name, int salary
) implements Serializable {
    @SuppressWarnings("serial")
    private static final long serialVersionUID = 1L;
}
// コンストラクタ経由で復元されるため安全性が高い`,
    java21Code: `// Java 21: record + sealed で型を制限
sealed interface Payload permits Payload.Text, Payload.Num {
    record Text(String v) implements Payload, Serializable {}
    record Num(int v) implements Payload, Serializable {}
}`,
  },
  libraryComparison: [
    { name: "標準 API（ObjectOutputStream / ObjectInputStream）", whenToUse: "Java 間だけでオブジェクトを受け渡す場面。HttpSession やインメモリキャッシュのシリアライズなど。", tradeoff: "Java 以外の言語とのデータ交換には使えない。クラス構造の変更に弱い。" },
    { name: "Jackson（JSON）", whenToUse: "REST API やファイル出力など、人間が読める形式でデータを交換したいとき。", tradeoff: "型情報が失われるため、ポリモーフィズムの復元には @JsonTypeInfo 等の設定が必要。バイナリより容量が大きい。" },
    { name: "Protocol Buffers", whenToUse: "異言語間のデータ交換やスキーマの厳密な管理が求められるとき。", tradeoff: ".proto ファイルの管理とコード生成のビルド設定が必要。小規模なプロジェクトでは導入コストが見合わない。" },
  ],
  faq: [
    { question: "serialVersionUID は必ず明示すべきですか。", answer: "はい。省略するとクラス構造の変更で値が変わり、過去のデータが読めなくなります。IDE の警告を無効にせず、1L から始めて変更時にインクリメントするのが一般的です。" },
    { question: "record のシリアライズは通常クラスと何が違いますか。", answer: "record はデシリアライズ時にコンストラクタ経由で復元されます。readObject によるフィールド直接書込みが行われないため、コンストラクタでのバリデーションが確実に動作します。" },
    { question: "シリアライズを避けたほうがよい場面はありますか。", answer: "外部システムとのデータ交換や長期保存には向きません。クラス構造の変更に弱く、セキュリティリスクもあるため、JSON や Protocol Buffers への切り替えを検討してください。" },
  ],
  codeTitle: "SerializationBasicDemo.java",
  codeSample: `import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class SerializationBasicDemo {

    // record + Serializable（Java 17+）
    record Employee(
        String employeeId,
        String name,
        String department,
        int salary
    ) implements Serializable {
        @SuppressWarnings("serial")
        private static final long serialVersionUID = 1L;
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        var employees = new ArrayList<Employee>();
        employees.add(new Employee("E001", "田中太郎", "開発部", 400000));
        employees.add(new Employee("E002", "鈴木花子", "営業部", 380000));

        var filePath = "employees.dat";

        // シリアライズ（オブジェクト → バイト列 → ファイル）
        try (var oos = new ObjectOutputStream(new FileOutputStream(filePath))) {
            oos.writeObject(employees);
            System.out.println("シリアライズ完了: " + filePath);
        }

        // デシリアライズ（ファイル → バイト列 → オブジェクト）
        try (var ois = new ObjectInputStream(new FileInputStream(filePath))) {
            @SuppressWarnings("unchecked")
            var loaded = (List<Employee>) ois.readObject();
            System.out.println("デシリアライズ完了:");
            for (var emp : loaded) {
                System.out.println("  id=" + emp.employeeId()
                        + ", name=" + emp.name()
                        + ", dept=" + emp.department()
                        + ", salary=" + emp.salary());
            }
        }

        // ファイル削除（クリーンアップ）
        new File(filePath).delete();
    }
}`,
},
{
  slug: "externalizable",
  title: "Java Externalizable でシリアライズを制御する方法",
  categorySlug: "serialization",
  summary: "Externalizable による手動シリアライズの書き方と、Serializable との使い分けを整理する。",
  version: "Java 17",
  tags: ["Externalizable", "writeExternal", "readExternal", "カスタムシリアライズ"],
  apiNames: ["Externalizable", "ObjectOutput", "ObjectInput", "writeExternal", "readExternal"],
  description: "Externalizable インターフェースを使ったカスタムシリアライズの実装方法と Serializable との違いを Java 8/17/21 対応で解説する。",
  lead: "Serializable はフィールドを自動的にシリアライズしてくれる反面、不要なフィールドまで含まれたり、保存形式を細かく制御できなかったりする場面があります。Externalizable は writeExternal と readExternal を自分で実装することで、どのフィールドをどの順序で書き出すかを完全に制御できるインターフェースです。内部メモやキャッシュ値など保存不要なデータを明示的に除外したい場合や、データサイズを抑えたい場合に使われます。ただし、public な引数なしコンストラクタが必須であること、read と write の順序を厳密に一致させる必要があることなど、手動ゆえの落とし穴もあります。この記事では、業務で使いそうなカタログデータのシリアライズを例に、Externalizable の実装手順と Serializable の transient との使い分けを整理します。",
  useCases: [
    "商品カタログの一時保存で、内部メモや計算済みキャッシュを除外し、必要最小限のフィールドだけをファイルに書き出す",
    "データサイズが重要なネットワーク転送で、Serializable の自動シリアライズより小さいバイト列を生成したいとき",
    "暗号化済みフィールドをそのままバイト列として書き出し、復元時に復号処理を挟む独自のシリアライズフローを組みたいとき",
  ],
  cautions: [
    "Externalizable には public な引数なしコンストラクタが必須。省略するとデシリアライズ時に InvalidClassException が発生する",
    "writeExternal と readExternal のフィールド順序が1つでもずれると、データ型の不一致で不正な値が復元される。テストで往復（round-trip）を必ず検証すること",
    "record は全フィールドが final のため Externalizable を実装できない。record でカスタムシリアライズが必要な場面は少ないが、必要なら通常クラスに切り替える",
    "Externalizable は Serializable のサブインターフェースだが、serialVersionUID の自動計算の挙動は同じ。互換性管理のために明示的に定義しておくのが安全",
  ],
  relatedArticleSlugs: ["serialization-basics", "transient-serial-version"],
  versionCoverage: {
    java8: "通常クラスで Externalizable を実装する。型推論がないため ObjectOutput / ObjectInput の型を明示する必要がある。",
    java17: "var でローカル変数の型推論が使える。switch 式（-> 記法）を組み合わせた分岐ロジックも簡潔に書ける。record は Externalizable 不可。",
    java21: "Externalizable の基本は変わらない。switch パターンマッチングで復元後の型判定を簡潔に書けるが、Externalizable 自体の仕様に変更はない。",
    java8Code: `// Java 8: 明示的な型宣言が必要
@Override
public void writeExternal(ObjectOutput out)
        throws IOException {
    out.writeUTF(productId);
    out.writeUTF(productName);
    out.writeInt(price);
}
// ByteArrayOutputStream baos = new ...
// ObjectOutputStream oos = new ...`,
    java17Code: `// Java 17: var + switch 式を活用
var original = new ProductCatalog(
        "P001", "Java入門書", 3800, "在庫少注意");
// switch 式で価格帯を簡潔に判定
String category = switch (original.price / 1000) {
    case 0    -> "低価格";
    case 1, 2 -> "普通";
    default   -> "高価格";
};`,
    java21Code: `// Java 21: Externalizable の仕様は同じ
// 復元後の型判定に switch パターンマッチングが使える
Object obj = ois.readObject();
String desc = switch (obj) {
    case ProductCatalog p -> "商品: " + p;
    default -> "不明な型";
};`,
  },
  libraryComparison: [
    { name: "Externalizable（標準 API）", whenToUse: "保存フィールドの選択とバイト列のサイズを厳密に制御したいとき。", tradeoff: "read/write の順序管理が手動になるため、フィールド追加時のミスが起きやすい。テストの負担が増える。" },
    { name: "Serializable + transient", whenToUse: "除外したいフィールドが少数で、残りは自動シリアライズに任せたいとき。", tradeoff: "transient 以外の全フィールドが自動的に含まれるため、意図しないフィールドの漏出に注意が必要。" },
    { name: "Jackson（@JsonIgnore）", whenToUse: "JSON 形式での保存・通信が前提で、特定フィールドを除外したいとき。", tradeoff: "バイナリ形式と比較してデータサイズが大きい。Java シリアライズとは互換性がない。" },
  ],
  faq: [
    { question: "Serializable の transient と Externalizable はどう使い分けますか。", answer: "除外したいフィールドが少数なら transient で十分です。保存対象を厳密に選びたい場合や、書き出し順序・形式を制御したい場合に Externalizable を検討してください。" },
    { question: "Externalizable で引数なしコンストラクタを作りたくない場合はどうしますか。", answer: "Externalizable の仕様上、引数なしコンストラクタは必須です。代替として Serializable + writeObject/readObject のカスタマイズか、JSON への切り替えを検討してください。" },
    { question: "Externalizable でバージョン管理はどうすればよいですか。", answer: "writeExternal の先頭にバージョン番号を書き出し、readExternal でバージョンごとに読み込みロジックを分岐させるのが定石です。新フィールドはデフォルト値で補完します。" },
  ],
  codeTitle: "ExternalizableDemo.java",
  codeSample: `import java.io.*;

public class ExternalizableDemo {

    static class ProductCatalog implements Externalizable {
        private String productId;
        private String productName;
        private int price;
        private String internalNote; // 保存したくない内部メモ

        // Externalizable には public 引数なしコンストラクタが必須
        public ProductCatalog() {}

        ProductCatalog(String productId, String productName,
                       int price, String internalNote) {
            this.productId = productId;
            this.productName = productName;
            this.price = price;
            this.internalNote = internalNote;
        }

        // 保存するフィールドを明示的に指定
        @Override
        public void writeExternal(ObjectOutput out) throws IOException {
            out.writeUTF(productId);
            out.writeUTF(productName);
            out.writeInt(price);
            // internalNote は保存しない（意図的に除外）
        }

        // 読み込み順序は writeExternal と完全に一致させる
        @Override
        public void readExternal(ObjectInput in) throws IOException {
            this.productId = in.readUTF();
            this.productName = in.readUTF();
            this.price = in.readInt();
            this.internalNote = null;
        }

        @Override
        public String toString() {
            return "Product{id='" + productId + "', name='" + productName
                    + "', price=" + price + ", note='" + internalNote + "'}";
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        var original = new ProductCatalog("P001", "Java入門書", 3800, "在庫少注意");
        System.out.println("元オブジェクト: " + original);

        // シリアライズ（バイト配列へ）
        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(original);
            bytes = baos.toByteArray();
        }
        System.out.println("データサイズ: " + bytes.length + " bytes");

        // デシリアライズ
        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            var loaded = (ProductCatalog) ois.readObject();
            System.out.println("復元オブジェクト: " + loaded);
            // internalNote は保存されていないので null
        }
    }
}`,
},
{
  slug: "transient-serial-version",
  title: "Java transient と serialVersionUID の使い方",
  categorySlug: "serialization",
  summary: "transient によるフィールド除外と serialVersionUID による互換性管理の実践パターン。",
  version: "Java 17",
  tags: ["transient", "serialVersionUID", "互換性", "パスワード除外"],
  apiNames: ["Serializable", "transient", "serialVersionUID", "ObjectOutputStream", "ObjectInputStream"],
  description: "transient 修飾子でフィールドを除外する方法と serialVersionUID によるバージョン互換性管理を Java 8/17/21 対応で解説する。",
  lead: "シリアライズ対象のクラスにパスワードやトークンなどの機密情報が含まれている場合、そのまま保存・転送してしまうとセキュリティ上の問題になります。transient 修飾子を付けたフィールドはシリアライズの対象外になるため、機密情報の除外に利用されます。一方、serialVersionUID はクラスのバージョン管理に使われる識別子で、省略すると予期しないタイミングで互換性が崩れます。この記事では、ユーザーアカウント情報のシリアライズを題材に、transient で除外すべきフィールドの判断基準、serialVersionUID を明示する理由、そして sealed interface と組み合わせた型安全なシリアライズ設計を Java 17 のコードで整理します。デシリアライズ後に transient フィールドがどうなるか、static フィールドはどう扱われるかなど、実際にテストで引っかかりやすいポイントも取り上げます。",
  useCases: [
    "ユーザーアカウント情報をセッションにシリアライズする際、パスワードや認証トークンを transient で除外する",
    "クラスにフィールドを追加したときに serialVersionUID を管理し、過去にシリアライズ済みのデータとの互換性を維持する",
    "管理者と一般ユーザーで異なるシリアライズ対象フィールドを sealed interface で設計し、型ごとに保護すべき情報を明確にする",
  ],
  cautions: [
    "transient フィールドはデシリアライズ後にデフォルト値（参照型は null、int は 0、boolean は false）になる。復元後に必要な値の再設定を忘れるとNullPointerException の原因になる",
    "static フィールドはインスタンスに属さないためシリアライズされない。transient を付けなくても除外されるが、意図を明示するために transient を付けるケースもある",
    "serialVersionUID を途中から追加する場合、既存のシリアライズ済みデータと整合しない値を設定すると InvalidClassException になる。既存データがある場合は serialver コマンドで現在の値を確認してから設定すること",
    "sealed interface の permits で列挙された型だけがシリアライズ対象になるため、型追加時に permits リストの更新漏れがあるとコンパイルエラーになる。これは安全側に倒れるので利点でもある",
  ],
  relatedArticleSlugs: ["serialization-basics", "deserialization-security"],
  versionCoverage: {
    java8: "transient と serialVersionUID の仕組みは同じ。型ごとの分岐は instanceof + キャストで行う。sealed interface は使えない。",
    java17: "sealed interface で型の集合を制限でき、instanceof パターンマッチング（Java 16+）で型判定とキャストを1行で書ける。",
    java21: "switch パターンマッチングが正式機能となり、sealed interface の全 permits を網羅的に分岐できる。漏れがあるとコンパイルエラーになる。",
    java8Code: `// Java 8: instanceof + キャストで型判定
if (acc instanceof UserAccount) {
    UserAccount u = (UserAccount) acc;
    System.out.println("ユーザー: " + u.userId());
} else if (acc instanceof AdminAccount) {
    AdminAccount a = (AdminAccount) acc;
    System.out.println("管理者: " + a.adminId());
}`,
    java17Code: `// Java 17: instanceof パターンマッチング
if (acc instanceof UserAccount u) {
    System.out.println("ユーザー: " + u.userId());
} else if (acc instanceof AdminAccount a) {
    System.out.println("管理者: " + a.adminId());
}`,
    java21Code: `// Java 21: switch パターンマッチング（網羅性チェック付き）
String result = switch (acc) {
    case UserAccount u  -> "ユーザー: " + u.userId();
    case AdminAccount a -> "管理者: " + a.adminId();
};
// sealed の全 permits を網羅しないとコンパイルエラー`,
  },
  libraryComparison: [
    { name: "標準 API（transient + serialVersionUID）", whenToUse: "Java 標準のシリアライズを使う前提で、機密フィールドの除外とバージョン管理を行いたいとき。", tradeoff: "フィールドが増えるたびに transient の付け忘れをレビューで確認する必要がある。" },
    { name: "Externalizable", whenToUse: "除外ではなく、保存対象のフィールドを明示的に列挙したいとき。", tradeoff: "writeExternal / readExternal の順序管理が必要。transient より記述量が多い。" },
    { name: "Jackson（@JsonIgnore / @JsonProperty）", whenToUse: "JSON 形式で保存・通信し、フィールド単位で公開・非公開をアノテーションで制御したいとき。", tradeoff: "Java 標準シリアライズとは仕組みが異なるため、既存のシリアライズ基盤との併用は設計の整理が必要。" },
  ],
  faq: [
    { question: "transient を付けたフィールドの値をデシリアライズ後に復元するにはどうしますか。", answer: "readObject メソッドをカスタマイズして再設定するか、デシリアライズ後の初期化メソッドを呼び出します。Externalizable なら readExternal でデフォルト値を明示的に設定できます。" },
    { question: "serialVersionUID はどのタイミングでインクリメントすべきですか。", answer: "互換性を壊すフィールド削除や型変更のときに変更します。フィールド追加だけなら同じ UID でもデシリアライズは成功しますが、追加フィールドはデフォルト値になります。" },
    { question: "sealed interface を使うとシリアライズにどんな利点がありますか。", answer: "permits で許可された型だけが存在することがコンパイル時に保証されるため、デシリアライズ後の型判定で漏れが起きにくくなります。switch の網羅性チェックと組み合わせると安全です。" },
  ],
  codeTitle: "TransientSerialVersionDemo.java",
  codeSample: `import java.io.*;

public class TransientSerialVersionDemo {

    // sealed interface でシリアライズ可能な型を限定
    sealed interface Account permits UserAccount, AdminAccount {}

    static final class UserAccount implements Account, Serializable {
        private static final long serialVersionUID = 1L;

        private final String userId;
        private final String email;
        // transient: パスワードはシリアライズしない
        private transient String password;

        UserAccount(String userId, String email, String password) {
            this.userId = userId;
            this.email = email;
            this.password = password;
        }

        public String userId()   { return userId; }
        public String email()    { return email; }
        public String password() { return password; }

        @Override
        public String toString() {
            return "UserAccount{userId='" + userId + "', email='" + email
                    + "', password='" + password + "'}";
        }
    }

    static final class AdminAccount implements Account, Serializable {
        private static final long serialVersionUID = 1L;

        private final String adminId;
        // transient: 管理者トークンもシリアライズ対象外
        private transient String secretToken;

        AdminAccount(String adminId, String secretToken) {
            this.adminId = adminId;
            this.secretToken = secretToken;
        }

        public String adminId()     { return adminId; }
        public String secretToken() { return secretToken; }

        @Override
        public String toString() {
            return "AdminAccount{adminId='" + adminId
                    + "', secretToken='" + secretToken + "'}";
        }
    }

    // instanceof パターンマッチングで型ごとの処理
    static String describeAccount(Account acc) {
        if (acc instanceof UserAccount u) {
            return "ユーザー: " + u.userId();
        } else if (acc instanceof AdminAccount a) {
            return "管理者: " + a.adminId();
        } else {
            return "不明なアカウント";
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        var account = new UserAccount("U001", "taro@example.com", "secret123");
        System.out.println("シリアライズ前: " + account);

        // シリアライズ
        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(account);
            bytes = baos.toByteArray();
        }
        System.out.println("シリアライズサイズ: " + bytes.length + " bytes");

        // デシリアライズ
        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            var loaded = (UserAccount) ois.readObject();
            // password は transient なので null
            System.out.println("デシリアライズ後: " + loaded);

            Account acc = loaded;
            System.out.println("判定結果: " + describeAccount(acc));
        }
    }
}`,
},
{
  slug: "deserialization-security",
  title: "Java デシリアライズ脆弱性の仕組みと対策を実装例で詳しく解説",
  categorySlug: "serialization",
  summary: "デシリアライズ攻撃の原理と ObjectInputFilter によるホワイトリスト設定を整理する。",
  version: "Java 17",
  tags: ["デシリアライズ攻撃", "ObjectInputFilter", "RCE", "ホワイトリスト", "セキュリティ"],
  apiNames: ["ObjectInputFilter", "ObjectInputFilter.Config.createFilter", "ObjectInputStream", "resolveClass"],
  description: "Java のデシリアライズ脆弱性（RCE）の仕組みと ObjectInputFilter によるホワイトリスト制限を外部ライブラリ不要で Java 8/17/21 対応で解説する。",
  lead: "Java のデシリアライズ脆弱性は、2015年の Apache Commons Collections を皮切りに、WebLogic・JBoss・Jenkins など数多くのプロダクトで深刻なリモートコード実行（RCE）を引き起こしました。攻撃者が細工したバイト列を ObjectInputStream.readObject() で読み込むと、ガジェットチェーンと呼ばれるクラスの連鎖を通じて任意のコマンドが実行されます。Java 9 以降は ObjectInputFilter によるホワイトリスト方式が標準 API として提供され、許可するクラスを限定することでリスクを軽減できるようになりました。この記事では、脆弱性が発生する仕組みを概要レベルで整理したうえで、Java 8 での resolveClass オーバーライドによる手動フィルタリング、Java 9+ の ObjectInputFilter、そして Java 21 の sealed interface を組み合わせた多層防御のアプローチを、動くコードとともに解説します。",
  useCases: [
    "外部システムからバイナリデータを受け取る API で、信頼できないソースのデシリアライズを安全に処理する",
    "レガシーシステムの Java シリアライズ通信を ObjectInputFilter で段階的に安全化する",
    "セキュリティ監査で指摘されたデシリアライズ脆弱性に対し、ホワイトリストフィルターを導入して対策する",
  ],
  cautions: [
    "ObjectInputFilter の !*（全拒否）は必ずパターンの末尾に置く。先頭に置くと全クラスが拒否されてしまう",
    "ホワイトリストには対象クラスだけでなく java.lang.* も含める必要がある。String 等の基本型が拒否されるとデシリアライズが失敗する",
    "ObjectInputFilter は Java 9 以降の機能。Java 8 では ObjectInputStream を継承して resolveClass をオーバーライドする手動フィルタリングが必要",
    "フィルターを設定しても、許可したクラス自体に脆弱性がある場合は防げない。根本的な対策は Java シリアライズから JSON 等への移行",
    "maxdepth や maxarray の制限値はアプリケーションのデータ構造に合わせて調整する。過度に厳しい値は正常なデシリアライズも失敗させる",
  ],
  relatedArticleSlugs: ["transient-serial-version", "serialization-basics"],
  versionCoverage: {
    java8: "ObjectInputFilter が存在しないため、ObjectInputStream を継承して resolveClass をオーバーライドし、クラス名のホワイトリストチェックを手動で実装する。",
    java17: "ObjectInputFilter.Config.createFilter でフィルターパターンを文字列で指定できる。setObjectInputFilter でストリーム単位のフィルター設定が可能。",
    java21: "sealed interface で許可する型をコンパイル時に限定し、ObjectInputFilter と組み合わせることで設計レベルと実行時レベルの二重制限が可能。",
    java8Code: `// Java 8: resolveClass オーバーライドで手動フィルタリング
class SecureOIS extends ObjectInputStream {
    private final List<String> allowed;
    SecureOIS(InputStream in, List<String> allowed)
            throws IOException {
        super(in);
        this.allowed = allowed;
    }
    @Override
    protected Class<?> resolveClass(ObjectStreamClass desc)
            throws IOException, ClassNotFoundException {
        if (!allowed.contains(desc.getName()))
            throw new InvalidClassException("拒否: " + desc.getName());
        return super.resolveClass(desc);
    }
}`,
    java17Code: `// Java 17: ObjectInputFilter でホワイトリスト設定
String pattern = "com.example.SafeData;java.lang.*;!*";
ObjectInputFilter filter =
    ObjectInputFilter.Config.createFilter(pattern);
ois.setObjectInputFilter(filter);`,
    java21Code: `// Java 21: sealed interface + ObjectInputFilter で二重制限
sealed interface SafePayload
    permits SafePayload.TextData, SafePayload.NumberData {
    record TextData(String v) implements SafePayload, Serializable {}
    record NumberData(int v) implements SafePayload, Serializable {}
}
// ObjectInputFilter で実行時も制限
// switch パターンマッチングで型安全に処理`,
  },
  libraryComparison: [
    { name: "標準 API（ObjectInputFilter）", whenToUse: "Java 9 以降で Java シリアライズを使い続ける必要がある場合の必須対策。追加依存なしで導入できる。", tradeoff: "ホワイトリストの管理が手動になるため、新しいクラスの追加忘れに注意が必要。根本的な脆弱性の排除にはならない。" },
    { name: "Jackson（JSON）", whenToUse: "Java シリアライズからの移行先として最も一般的。PolymorphicDeserialization にも ObjectMapper の設定で対応できる。", tradeoff: "Jackson 自体にも過去にデシリアライズ脆弱性（CVE-2017-7525 等）があるため、DefaultTyping の使用には注意が必要。" },
    { name: "Protocol Buffers / Avro", whenToUse: "スキーマ定義に基づくデシリアライズで、未知の型を原理的に排除したいとき。", tradeoff: "既存の Java シリアライズからの移行コストが大きい。.proto / .avsc ファイルの管理が必要になる。" },
  ],
  faq: [
    { question: "ObjectInputFilter のパターン構文で !* は何を意味しますか。", answer: "!* は「それ以外の全クラスを拒否する」を意味します。許可するクラスを列挙したあと、末尾に !* を置くことでホワイトリスト方式になります。" },
    { question: "Java 8 環境でデシリアライズのセキュリティ対策をするにはどうしますか。", answer: "ObjectInputStream を継承して resolveClass をオーバーライドし、クラス名のホワイトリストチェックを手動で実装します。あるいは Java シリアライズ自体を JSON に置き換えるのが根本的な対策です。" },
    { question: "ObjectInputFilter を設定すればデシリアライズは安全ですか。", answer: "リスクを大幅に軽減できますが、完全ではありません。許可したクラス自体に脆弱性がある場合は防げないため、信頼できないソースからの Java シリアライズの受信は避けるのが原則です。" },
  ],
  codeTitle: "DeserializationSecurityDemo.java",
  codeSample: `import java.io.*;

public class DeserializationSecurityDemo {

    // シリアライズ対象の安全なクラス
    static class SafeData implements Serializable {
        private static final long serialVersionUID = 1L;
        private final String value;

        SafeData(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return "SafeData{value='" + value + "'}";
        }
    }

    public static void main(String[] args) throws Exception {
        var original = new SafeData("テストデータ");

        // シリアライズ
        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(original);
            bytes = baos.toByteArray();
        }

        // Java 9+: ObjectInputFilter でホワイトリスト設定
        // 許可するクラスを明示し、それ以外は !* で全拒否
        String allowedClass =
                DeserializationSecurityDemo.class.getName() + "$SafeData";
        String filterPattern = allowedClass + ";java.lang.*;!*";
        ObjectInputFilter filter =
                ObjectInputFilter.Config.createFilter(filterPattern);

        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            ois.setObjectInputFilter(filter);
            Object obj = ois.readObject();
            System.out.println("安全なデシリアライズ成功: " + obj);
        }

        // maxdepth / maxarray で構造も制限可能
        String strictPattern = allowedClass
                + ";java.lang.*;maxdepth=5;maxarray=100;!*";
        ObjectInputFilter strictFilter =
                ObjectInputFilter.Config.createFilter(strictPattern);
        System.out.println("厳格フィルター: " + strictPattern);

        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            ois.setObjectInputFilter(strictFilter);
            Object obj = ois.readObject();
            System.out.println("厳格フィルターでも成功: " + obj);
        }
    }
}`,
},
]
