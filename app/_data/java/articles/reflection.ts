import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "reflection-basics",
  title: "Java リフレクションの基本操作と実務での使いどころを解説",
  categorySlug: "reflection",
  summary: "Class・Field・Method を使ったクラス情報取得、インスタンス生成、private アクセスの実装例。",
  version: "Java 17",
  tags: ["リフレクション", "Class", "Field", "Method", "Constructor", "setAccessible"],
  apiNames: ["Class.forName", "Class.getDeclaredFields", "Class.getDeclaredMethods", "Constructor.newInstance", "Method.invoke", "Field.setAccessible"],
  description: "Java リフレクションでクラス情報取得・動的インスタンス生成・private メンバーへのアクセスを行う方法を外部ライブラリ不要で Java 8/17/21 対応で解説する。",
  lead: "リフレクションは、コンパイル時には決まらないクラスやメソッドを実行時に操作するための仕組みです。普段の業務コードで直接使う場面はそれほど多くありませんが、共通ライブラリの設計、簡易テストランナーの構築、設定値の動的バインドなど「もう一段奥の仕組み」を作るときに避けて通れない技術でもあります。この記事では、Class オブジェクトの取得からフィールド・メソッドの列挙、コンストラクタ経由のインスタンス生成、private メンバーへのアクセスまで、リフレクションの基本操作を動作するコードとともに整理します。実務では「使える」と「使うべき」の線引きが重要になるため、パフォーマンスやセキュリティの観点での注意点も合わせて扱います。",
  useCases: [
    "プラグイン機構で設定ファイルに書かれたクラス名から Class.forName でインスタンスを動的に生成する",
    "テストコードから private メソッドを呼び出し、内部ロジックの境界値を直接検証する",
    "汎用的なオブジェクトダンプ処理で、任意のクラスのフィールド一覧と値をログに出力する",
  ],
  cautions: [
    "setAccessible(true) は Java 9 以降のモジュールシステムで制限される場合がある。--add-opens をつけて回避できるが、ライブラリ提供時は InaccessibleObjectException のハンドリングを入れておくこと",
    "リフレクション経由の呼び出しは通常のメソッド呼び出しより数倍遅い。ホットパスで毎回 getDeclaredMethod を呼ぶのは避け、Method オブジェクトをキャッシュするか MethodHandle への切り替えを検討する",
    "getDeclaredFields と getFields は取得範囲が異なる。前者は宣言クラスの全フィールド（private 含む）、後者は継承を含む public フィールドのみを返す。意図と異なるメソッドを使うと必要なフィールドが取れない",
    "Class.forName に存在しないクラス名を渡すと ClassNotFoundException になる。設定ファイルからクラス名を読む場合はタイポや classpath 不足への備えが必要",
  ],
  relatedArticleSlugs: ["custom-annotation"],
  versionCoverage: {
    java8: "Class.forName と getDeclaredFields/getDeclaredMethods で基本操作は一通り可能。型はすべて明示宣言が必要で、戻り値のキャストが多くなる。",
    java17: "var による型推論で記述が簡潔になる。record クラスでは isRecord() や getRecordComponents() でコンポーネント情報を直接取得できる。",
    java21: "sealed interface とパターンマッチング switch を組み合わせると、リフレクション結果の分類と表示をより型安全に記述できる。",
    java8Code: `// Java 8: 型を明示し、Class.forName でクラスを取得
Class<?> clazz = Class.forName("Person");
Field nameField = clazz.getDeclaredField("name");
nameField.setAccessible(true);
String name = (String) nameField.get(person);

Constructor<?> ctor = clazz.getDeclaredConstructor(String.class, int.class);
Object instance = ctor.newInstance("田中", 25);`,
    java17Code: `// Java 17: var + record 対応の API を活用
var clazz = Person.class;
System.out.println("record: " + clazz.isRecord());

for (var component : clazz.getRecordComponents()) {
    System.out.println(component.getType().getSimpleName()
        + " " + component.getName());
}

var person = clazz.getDeclaredConstructor(String.class, int.class)
    .newInstance("田中", 25);`,
    java21Code: `// Java 21: sealed interface + switch でリフレクション結果を型安全に分岐
sealed interface ReflectResult
    permits ReflectResult.FieldInfo, ReflectResult.MethodInfo {
  record FieldInfo(String name, String type) implements ReflectResult {}
  record MethodInfo(String name, String returnType) implements ReflectResult {}
}

switch (result) {
    case ReflectResult.FieldInfo f -> System.out.println("[Field] " + f.name());
    case ReflectResult.MethodInfo m -> System.out.println("[Method] " + m.name());
}`,
  },
  libraryComparison: [
    { name: "標準 API（java.lang.reflect）", whenToUse: "フィールド列挙や動的インスタンス生成など、基本的なリフレクション操作を行うとき。", tradeoff: "API が低レベルで冗長になりやすい。アクセス制御の回避にはモジュール設定が必要になる場合がある。" },
    { name: "Spring ReflectionUtils", whenToUse: "Spring プロジェクト内で private フィールドの読み書きや特定アノテーション付きメソッドの検索を簡潔に行いたいとき。", tradeoff: "Spring Framework への依存が前提。単体ライブラリとしては提供されておらず、非 Spring プロジェクトには持ち込みにくい。" },
    { name: "MethodHandle（java.lang.invoke）", whenToUse: "リフレクションと同等の動的呼び出しを、より高速に行いたいとき。", tradeoff: "API の学習コストが高く、可読性も下がる。頻繁に呼び出すホットパスでなければ reflect API で十分なことが多い。" },
  ],
  faq: [
    { question: "リフレクションで private メソッドを呼ぶのはテスト以外でも許容されますか。", answer: "フレームワーク内部や共通基盤では使われますが、業務ロジックで常用するのは避けるのが無難です。カプセル化を崩すとリファクタリング時に追従が難しくなります。" },
    { question: "getDeclaredMethods と getMethods の違いは何ですか。", answer: "getDeclaredMethods はそのクラスで宣言されたメソッド（private 含む）を返します。getMethods は継承チェーン上の public メソッドをすべて返しますが、private は含みません。" },
    { question: "Java 9 以降のモジュールシステムで setAccessible が失敗する場合の対処法は。", answer: "起動オプションに --add-opens でモジュールとパッケージを指定します。ライブラリ側では InaccessibleObjectException を catch し、フォールバック処理を用意しておくと安全です。" },
  ],
  codeTitle: "ReflectionBasicDemo.java",
  codeSample: `import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;

public class ReflectionBasicDemo {

    static class Person {
        private String name;
        private int age;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() { return name; }
        public int getAge() { return age; }

        private String secret() {
            return "内部情報: " + name + "(" + age + ")";
        }

        @Override
        public String toString() {
            return "Person{name=" + name + ", age=" + age + "}";
        }
    }

    public static void main(String[] args) throws Exception {

        var clazz = Person.class;
        System.out.println("クラス名: " + clazz.getSimpleName());

        System.out.println("\\n=== フィールド一覧 ===");
        for (var field : clazz.getDeclaredFields()) {
            System.out.println("  " + Modifier.toString(field.getModifiers())
                + " " + field.getType().getSimpleName() + " " + field.getName());
        }

        System.out.println("\\n=== メソッド一覧 ===");
        for (var method : clazz.getDeclaredMethods()) {
            System.out.println("  " + Modifier.toString(method.getModifiers())
                + " " + method.getReturnType().getSimpleName()
                + " " + method.getName() + "()");
        }

        var constructor = clazz.getDeclaredConstructor(String.class, int.class);
        var person = constructor.newInstance("田中太郎", 30);
        System.out.println("\\n生成: " + person);

        var nameField = clazz.getDeclaredField("name");
        nameField.setAccessible(true);
        System.out.println("private name: " + nameField.get(person));

        var secretMethod = clazz.getDeclaredMethod("secret");
        secretMethod.setAccessible(true);
        System.out.println("private secret(): " + secretMethod.invoke(person));

        var getNameMethod = clazz.getMethod("getName");
        System.out.println("getName(): " + getNameMethod.invoke(person));

        System.out.println("\\n=== public メソッド（Object 由来を除外）===");
        Arrays.stream(clazz.getMethods())
            .filter(m -> m.getDeclaringClass() != Object.class)
            .forEach(m -> System.out.println("  " + m.getName() + "()"));
    }
}`,
},
{
  slug: "custom-annotation",
  title: "Java カスタムアノテーション定義とリフレクション処理の実装",
  categorySlug: "reflection",
  summary: "独自アノテーションの定義方法と、リフレクションで実行時に読み取るバリデーション・テストランナーの実装例。",
  version: "Java 17",
  tags: ["アノテーション", "@Retention", "@Target", "リフレクション", "バリデーション"],
  apiNames: ["@Retention", "@Target", "Method.isAnnotationPresent", "Method.getAnnotation", "Field.getAnnotation", "RetentionPolicy.RUNTIME"],
  description: "Java でカスタムアノテーションを定義し、リフレクションで実行時に処理する方法を簡易テストランナーとバリデーションの実装例で Java 8/17/21 対応で解説する。",
  lead: "Java のアノテーションは、コードにメタデータを付与する仕組みです。@Override や @Deprecated といった標準アノテーションは日常的に目にしますが、独自のアノテーションを定義して実行時に処理する方法となると、一気にハードルが上がります。この記事では、カスタムアノテーションの定義から @Retention・@Target の設定、リフレクションで実行時に値を読み取る方法までを、2つの実装例で整理します。1つ目はメソッドに @TestCase を付けて自動実行する簡易テストランナー、2つ目はフィールドに @NotNull を付けて null チェックを行うバリデーション処理です。いずれも外部ライブラリなしで動作する完結したコードで、アノテーション処理の基本パターンを押さえられます。",
  useCases: [
    "共通基盤で独自の @Validate アノテーションを定義し、DTO のフィールドに付けるだけで入力チェックを自動化する",
    "バッチ処理のステップに @Step(order=1) のようなアノテーションを付け、実行順序をメタデータから動的に組み立てる",
    "社内フレームワークで @Endpoint(path=\"/api/users\") を定義し、ルーティングテーブルをアノテーションスキャンで自動生成する",
  ],
  cautions: [
    "@Retention(RetentionPolicy.RUNTIME) を付け忘れると、実行時にアノテーションを取得できない。デフォルトは CLASS（.class には残るが実行時取得不可）なので、リフレクションで使う場合は必ず RUNTIME を指定する",
    "@Target を省略するとあらゆる要素に付与可能になり、意図しない箇所への付与を防げない。METHOD、FIELD、TYPE など対象を明示するのが安全",
    "アノテーションの属性に指定できる型は限定されている（プリミティブ、String、Class、enum、アノテーション、およびそれらの配列のみ）。List や Map は使えない",
    "getDeclaredMethods の返却順序は JVM の実装に依存し、ソースコード上の記述順とは限らない。実行順序が重要な場合は priority 属性などで明示的に制御すること",
  ],
  relatedArticleSlugs: ["reflection-basics"],
  versionCoverage: {
    java8: "アノテーション定義と isAnnotationPresent / getAnnotation によるリフレクション処理は Java 8 で完全に利用可能。型はすべて明示宣言が必要。",
    java17: "var で記述を簡潔にできる。record と組み合わせてバリデーション結果を不変オブジェクトで返すパターンが書きやすい。",
    java21: "sealed interface でバリデーション結果（Ok / Error）を定義し、switch パターンマッチングで分岐すると、結果処理が型安全かつ網羅的になる。",
    java8Code: `// Java 8: 型を明示してアノテーションを取得・処理
Object instance = testClass.getDeclaredConstructor().newInstance();
for (Method method : testClass.getDeclaredMethods()) {
    if (method.isAnnotationPresent(TestCase.class)) {
        TestCase tc = method.getAnnotation(TestCase.class);
        System.out.println(tc.description());
        method.invoke(instance);
    }
}`,
    java17Code: `// Java 17: var で簡潔に、record でバリデーション結果を表現
var instance = testClass.getDeclaredConstructor().newInstance();
for (var method : testClass.getDeclaredMethods()) {
    if (method.isAnnotationPresent(TestCase.class)) {
        var tc = method.getAnnotation(TestCase.class);
        System.out.println(tc.description());
        method.invoke(instance);
    }
}`,
    java21Code: `// Java 21: sealed interface + switch で結果を型安全に分岐
sealed interface ValidationResult
    permits ValidationResult.Ok, ValidationResult.Error {
  record Ok(String field, Object value) implements ValidationResult {}
  record Error(String field, String message) implements ValidationResult {}
}

switch (result) {
    case ValidationResult.Ok ok ->
        System.out.println("OK [" + ok.field() + "]: " + ok.value());
    case ValidationResult.Error err ->
        System.out.println("NG [" + err.field() + "]: " + err.message());
}`,
  },
  libraryComparison: [
    { name: "標準 API（java.lang.annotation + reflect）", whenToUse: "アノテーション定義と実行時処理の基本を押さえたいとき。小規模なバリデーションやテストランナーなら標準 API で十分。", tradeoff: "リフレクションの記述が冗長になりやすく、大量のアノテーション処理ではパフォーマンスに注意が必要。" },
    { name: "Jakarta Bean Validation (Hibernate Validator)", whenToUse: "フィールドバリデーションを本格的に導入し、@NotNull・@Size・@Pattern などを標準仕様に沿って使いたいとき。", tradeoff: "Jakarta EE / Hibernate Validator への依存が発生する。小規模プロジェクトではオーバースペックになりやすい。" },
    { name: "Annotation Processor（javax.annotation.processing）", whenToUse: "コンパイル時にアノテーションを処理してコード生成やチェックを行いたいとき（Lombok、MapStruct 等が利用）。", tradeoff: "Processor の実装は複雑で学習コストが高い。実行時処理とは仕組みが根本的に異なる点に注意。" },
  ],
  faq: [
    { question: "@Retention の RUNTIME と CLASS と SOURCE はどう使い分けますか。", answer: "リフレクションで実行時に読むなら RUNTIME、バイトコード解析ツール向けなら CLASS、コンパイル時チェックやコード生成のみなら SOURCE です。業務で自作する場合はほぼ RUNTIME 一択です。" },
    { question: "アノテーションの属性にデフォルト値を設定しないとどうなりますか。", answer: "default を省略した属性は、アノテーション使用時に必ず値を指定する必要があります。省略するとコンパイルエラーになるため、任意指定にしたい場合は default を付けてください。" },
    { question: "1つのフィールドに同じアノテーションを複数付けられますか。", answer: "Java 8 以降、@Repeatable を付けたアノテーションは同一要素に複数付与できます。コンテナアノテーション（配列を持つアノテーション）の定義が必要です。" },
  ],
  codeTitle: "CustomAnnotationDemo.java",
  codeSample: `import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;

public class CustomAnnotationDemo {

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface TestCase {
        String description() default "テストケース";
        int priority() default 1;
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.FIELD)
    @interface NotNull {
        String message() default "null は許可されていません";
    }

    static class CalculatorTest {

        @TestCase(description = "正の数の加算", priority = 1)
        void testAddPositive() {
            System.out.println("  3 + 5 = " + (3 + 5));
        }

        @TestCase(description = "ゼロの加算", priority = 2)
        void testAddZero() {
            System.out.println("  0 + 5 = " + (0 + 5));
        }

        void notATest() {
            System.out.println("  テスト対象外");
        }
    }

    static void runTests(Class<?> testClass) throws Exception {
        System.out.println("=== テスト実行: " + testClass.getSimpleName() + " ===");
        var instance = testClass.getDeclaredConstructor().newInstance();

        for (var method : testClass.getDeclaredMethods()) {
            if (method.isAnnotationPresent(TestCase.class)) {
                var tc = method.getAnnotation(TestCase.class);
                System.out.println("[Priority " + tc.priority() + "] "
                    + method.getName() + " - " + tc.description());
                method.invoke(instance);
            }
        }
    }

    static class UserForm {
        @NotNull(message = "ユーザー名は必須です")
        String username;

        String email; // アノテーションなし

        UserForm(String username, String email) {
            this.username = username;
            this.email = email;
        }
    }

    static void validate(Object obj) throws IllegalAccessException {
        System.out.println("=== バリデーション: "
            + obj.getClass().getSimpleName() + " ===");

        for (var field : obj.getClass().getDeclaredFields()) {
            if (field.isAnnotationPresent(NotNull.class)) {
                field.setAccessible(true);
                var value = field.get(obj);
                var annotation = field.getAnnotation(NotNull.class);

                if (value == null) {
                    System.out.println("  NG [" + field.getName() + "]: "
                        + annotation.message());
                } else {
                    System.out.println("  OK [" + field.getName() + "]: "
                        + value);
                }
            }
        }
    }

    public static void main(String[] args) throws Exception {
        // テストランナー実行
        runTests(CalculatorTest.class);

        System.out.println();

        // バリデーション実行
        validate(new UserForm("田中太郎", "taro@example.com"));
        validate(new UserForm(null, "unknown@example.com"));
    }
}`,
},
]
