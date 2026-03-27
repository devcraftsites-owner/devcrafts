import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "junit5-basics",
  title: "JUnit 5 の基本アノテーションと実務テストの書き方を解説",
  categorySlug: "testing",
  summary: "JUnit 5 の基本アノテーション、アサーション、パラメータ化テストの使い方を業務テストの文脈で整理する。",
  version: "Java 17",
  tags: ["JUnit 5", "テスト", "@Test", "@ParameterizedTest", "@Nested", "assertThrows"],
  apiNames: ["org.junit.jupiter.api.Test", "org.junit.jupiter.api.BeforeEach", "org.junit.jupiter.api.Nested", "org.junit.jupiter.api.DisplayName", "org.junit.jupiter.params.ParameterizedTest", "org.junit.jupiter.params.provider.CsvSource", "Assertions.assertEquals", "Assertions.assertThrows", "Assertions.assertAll"],
  description: "JUnit 5 の @Test、@ParameterizedTest、@Nested、assertThrows などの基本アノテーションをサンプルコード付きで Java 8/17/21 対応で解説する。",
  lead: "テストコードは書けるけれど「何をどこまでテストすべきか」で毎回迷う、JUnit 4 から 5 への移行で何が変わったのか整理できていない――そんな声は現場で少なくありません。JUnit 5 は Jupiter エンジンの導入により、アノテーション体系が刷新され、@DisplayName による日本語テスト名、@Nested によるグループ化、@ParameterizedTest による表形式テストなど、実務で使いやすい機能が揃いました。この記事では、Calculator クラスを題材に、基本アノテーションの使い方、例外テスト（assertThrows）、複数アサーションの一括検証（assertAll）、パラメータ化テストまでを一通り整理します。テスト設計のコツとして Given-When-Then パターンにも触れ、読みやすく保守しやすいテストコードを書くための実践的な指針を示します。",
  useCases: [
    "新規開発のビジネスロジック（消費税計算、割合計算など）に対し、JUnit 5 のパラメータ化テストで境界値を網羅する",
    "既存の JUnit 4 テストを JUnit 5 に移行し、@Nested と @DisplayName でテストの構造と可読性を改善する",
    "例外が発生すべきケース（0除算、null 入力、範囲外の値）を assertThrows で明示的に検証し、回帰テストとして保護する",
    "複数条件をまとめて確認したいサービスクラスで assertAll を使い、失敗を一度に洗い出す",
    "レビューしやすいテスト命名に揃えるため、@DisplayName で業務用語ベースの表示名を整備する",
  ],
  cautions: [
    "@Test は org.junit.jupiter.api.Test をインポートすること。org.junit.Test（JUnit 4）をインポートすると実行されない",
    "@BeforeEach は各テストメソッドの前に毎回実行される。テスト間で状態を共有したい場合は @BeforeAll（static メソッド）を使うが、テストの独立性を損なうため慎重に使う",
    "@ParameterizedTest と @Test を同じメソッドに付けると二重実行される。パラメータ化テストには @ParameterizedTest だけを付ける",
    "assertAll に渡すラムダが1つでも失敗すると、残りも実行されたうえで全失敗が報告される。assertEquals を個別に書く場合は最初の失敗で中断されるため、挙動が異なる",
    "@Nested クラスは内部クラス（non-static inner class）でなければならない。static をつけるとテストが認識されない",
    "例外テストでは例外型だけでなくメッセージや原因も必要に応じて確認する。型だけだと別原因の失敗を見逃しやすい",
    "1メソッドで複数の振る舞いを検証しすぎると失敗理由が読み取りにくい。正常系と異常系は分けて書く方が保守しやすい",
  ],
  relatedArticleSlugs: [],
  versionCoverage: {
    java8: "JUnit 5 自体は Java 8 以上で動作する。テスト対象クラスは通常のクラスで記述し、@ParameterizedTest や @Nested も利用可能。ただし record が使えないためテストデータの表現が冗長になる。",
    java17: "record でテスト対象の Calculator を不変に定義できる。@Nested でテストをグループ化し、@DisplayName で日本語テスト名を付けると構造が明確になる。",
    java21: "Calculator 内部で switch 式を使い、演算を enum で切り替える設計が自然に書ける。@TestFactory で動的テストを生成し、enum の全値を網羅するテストも書きやすい。",
    java8Code: `// Java 8: 通常クラスの Calculator + 基本テスト
static class Calculator {
    int add(int a, int b) { return a + b; }
    int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("0除算");
        return a / b;
    }
}
// テスト側:
@Test void testAdd() {
    Calculator calc = new Calculator();
    assertEquals(8, calc.add(3, 5));
}`,
    java17Code: `// Java 17: record + @Nested でテストを構造化
record Calculator() {
    int add(int a, int b) { return a + b; }
    int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("0除算");
        return a / b;
    }
}
@Nested @DisplayName("加算テスト")
class AddTests {
    @ParameterizedTest
    @CsvSource({"1,2,3", "0,0,0", "-1,1,0"})
    void add(int a, int b, int expected) {
        assertEquals(expected, calc.add(a, b));
    }
}`,
    java21Code: `// Java 21: enum + switch 式 + @TestFactory で動的テスト生成
enum Operation { ADD, SUBTRACT, MULTIPLY, DIVIDE }
int calculate(int a, int b, Operation op) {
    return switch (op) {
        case ADD      -> a + b;
        case SUBTRACT -> a - b;
        case MULTIPLY -> a * b;
        case DIVIDE   -> { if (b == 0) throw ...; yield a / b; }
    };
}
@TestFactory
Stream<DynamicTest> dynamicOperationTests() {
    record TestCase(int a, int b, Operation op, int expected) {}
    return List.of(new TestCase(3,5,ADD,8), ...)
        .stream().map(tc -> dynamicTest(...));
}`,
  },
  libraryComparison: [
    { name: "JUnit 5（Jupiter）", whenToUse: "Java のテストフレームワークの標準。@Nested、@ParameterizedTest、@DisplayName など実務向け機能が充実。新規プロジェクトでは第一選択。", tradeoff: "assertThat スタイルのアサーションは標準では提供されない。流暢なアサーションが必要なら AssertJ を併用する。" },
    { name: "AssertJ", whenToUse: "assertThat(result).isEqualTo(expected) のような流暢なアサーションで可読性を上げたいとき。JUnit 5 と併用が前提。", tradeoff: "依存追加が必要。assertEquals で十分なプロジェクトには過剰。チーム内でスタイルが混在するリスクがある。" },
    { name: "TestNG", whenToUse: "データプロバイダーやテストグループなど、大規模テストスイートの管理機能が必要なとき。", tradeoff: "JUnit 5 の @ParameterizedTest や @Nested で多くのユースケースをカバーできるため、新規採用のメリットは薄れている。" },
  ],
  faq: [
    { question: "JUnit 4 から JUnit 5 への移行で最低限変えるべき点は何ですか。", answer: "import を org.junit.jupiter.api に変更し、@Before を @BeforeEach に、@Rule を @ExtendWith に置き換えます。junit-vintage-engine を入れれば JUnit 4 テストも並行実行できます。" },
    { question: "@ParameterizedTest のデータソースは @CsvSource 以外に何がありますか。", answer: "@ValueSource（単一値）、@EnumSource（enum 全値）、@MethodSource（メソッド参照）が実務でよく使われます。複雑なデータには @MethodSource が柔軟です。" },
    { question: "テストメソッド名は日本語にしてもよいですか。", answer: "技術的には問題ありませんが、@DisplayName に日本語を書き、メソッド名は英語にするのがチームでの運用上は無難です。CI のログでも文字化けしにくくなります。" },
    { question: "assertAll はどんな場面で使うと効果的ですか。", answer: "同じ入力に対する複数の戻り値や DTO の各フィールドをまとめて確認したい場面で有効です。失敗を一度に確認できる反面、 unrelated な検証を1つに詰め込みすぎないようにします。" },
    { question: "@Nested は必ず使うべきですか。", answer: "必須ではありません。テスト対象の状態や操作ごとにまとまりがあり、クラス分割すると読みやすくなるときに使うのが自然です。小さなテストクラスでは無理に導入しなくて構いません。" },
  ],
  codeTitle: "CalculatorTest.java",
  codeSample: `import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    // テスト対象: record で不変な Calculator を定義
    record Calculator() {
        int add(int a, int b) { return a + b; }
        int subtract(int a, int b) { return a - b; }
        int multiply(int a, int b) { return a * b; }
        int divide(int a, int b) {
            if (b == 0) {
                throw new ArithmeticException("0除算はできません");
            }
            return a / b;
        }
    }

    private Calculator calc;

    @BeforeEach
    void setUp() {
        calc = new Calculator();
    }

    @Nested
    @DisplayName("加算テスト")
    class AddTests {
        @Test
        @DisplayName("正の数の加算")
        void addPositive() {
            assertEquals(8, calc.add(3, 5));
        }

        @Test
        @DisplayName("負の数を含む加算")
        void addNegative() {
            assertEquals(-2, calc.add(-5, 3));
        }

        @ParameterizedTest
        @CsvSource({ "1,2,3", "0,0,0", "-1,1,0", "100,200,300" })
        @DisplayName("様々な値の加算テスト")
        void addParameterized(int a, int b, int expected) {
            assertEquals(expected, calc.add(a, b));
        }
    }

    @Nested
    @DisplayName("除算テスト")
    class DivideTests {
        @Test
        @DisplayName("正常な除算")
        void divideNormal() {
            assertEquals(5, calc.divide(10, 2));
        }

        @Test
        @DisplayName("ゼロ除算で ArithmeticException が発生する")
        void divideByZero() {
            assertThrows(ArithmeticException.class,
                () -> calc.divide(10, 0));
        }
    }

    @Test
    @DisplayName("複数のアサーションをまとめて検証")
    void multipleAssertions() {
        assertAll("四則演算の検証",
            () -> assertEquals(8,  calc.add(3, 5)),
            () -> assertEquals(-2, calc.subtract(3, 5)),
            () -> assertEquals(15, calc.multiply(3, 5)),
            () -> assertEquals(2,  calc.divide(10, 5))
        );
    }

    @AfterEach
    void tearDown() {
        calc = null;
    }
}`,
},
{
  slug: "mockito-mock-stub-spy",
  title: "Mockito の Mock・Stub・Spy を業務テストで使いこなす方法",
  categorySlug: "testing",
  summary: "Mockito の @Mock、@Spy、when/thenReturn、verify を使って依存関係をモック化し、ビジネスロジックを単体テストする方法を整理する。",
  version: "Java 17",
  tags: ["Mockito", "Mock", "Stub", "Spy", "テスト", "JUnit 5", "when/thenReturn", "verify"],
  apiNames: ["org.mockito.Mockito.mock", "org.mockito.Mockito.when", "org.mockito.Mockito.verify", "org.mockito.Mock", "org.mockito.Spy", "org.mockito.InjectMocks", "org.mockito.junit.jupiter.MockitoExtension"],
  description: "Mockito の @Mock・@Spy・when/thenReturn・verify を使い、UserRepository をモック化して UserService を単体テストする方法を Java 8/17/21 対応で解説する。",
  lead: "業務アプリケーションのテストで最初にぶつかる壁が「データベースや外部 API に依存するクラスをどうテストするか」です。依存先が動いていないとテストできない、テストのたびにデータを用意するのが面倒――こうした問題を解決するのが Mock（モック）の仕組みです。Mockito は Java のモックフレームワークとして最も広く使われており、JUnit 5 との統合も @ExtendWith(MockitoExtension.class) で簡潔に行えます。この記事では、UserRepository をモック化して UserService のビジネスロジックだけを検証する実務的なテストコードを題材に、when/thenReturn によるスタブ設定、verify による呼び出し検証、@Spy で一部だけ差し替えるパターンを整理します。Mock と Stub と Spy の違いが曖昧なまま使っている方にも、判断基準が見えてくる内容を目指しています。",
  useCases: [
    "UserService が UserRepository 経由でデータを取得するロジックを、データベース接続なしで単体テストする",
    "外部決済 API を呼び出す注文処理クラスで、API の応答をスタブ化してタイムアウトやエラー応答時の分岐をテストする",
    "既存のサービスクラスの一部メソッドだけを差し替え（@Spy）、残りは実装のまま動かして結合に近いテストを行う",
    "リポジトリや通知クライアントの呼び出し回数を verify で確認し、二重送信や二重更新の回帰を防ぐ",
    "例外系の戻り値や失敗通知をスタブ化し、普段は再現しにくい分岐を単体テストで固定する",
  ],
  cautions: [
    "@Mock と @InjectMocks を使うには @ExtendWith(MockitoExtension.class) をテストクラスに付けること。付け忘れるとフィールドが null のまま NullPointerException になる",
    "when/thenReturn で設定していないメソッドを呼ぶと、Mock はデフォルト値（null、0、false、空コレクション）を返す。意図せず null が返って後続で NullPointerException になるケースが多い",
    "verify() はメソッドが「呼ばれたこと」を検証するが、戻り値の正しさは検証しない。ビジネスロジックの結果は別途 assertEquals や assertThat で確認する",
    "@Spy は実オブジェクトの部分的な差し替えに使う。全メソッドを差し替えるなら @Mock で十分であり、@Spy の乱用はテストの意図を不明確にする",
    "final クラスや static メソッドは標準の Mockito ではモック化できない。mockito-inline（Mockito 5 ではデフォルト）を使うか、設計を見直してインターフェースを導入する",
    "モックの振る舞いを細かく設定しすぎると、実装変更のたびにテストも壊れやすくなる。外部との境界に絞って使うのが基本",
    "同じテストで verify の回数や引数検証が増えすぎたら、テスト対象の責務過多や設計の密結合を疑う",
  ],
  relatedArticleSlugs: ["junit5-basics", "assertj-fluent-assertions"],
  versionCoverage: {
    java8: "Mockito 3.x 以降は Java 8 で動作する。ラムダで Answer を書けるが、record が使えないためテストデータの生成が冗長になる。",
    java17: "record で User などの値オブジェクトを定義すると、テストデータの準備が簡潔になる。Mockito 5.x は Java 11 以上が必須で、Java 17 環境で広く利用されている。final クラスのモック化もデフォルトで有効。",
    java21: "record パターンで when の戻り値から値を分解できる。Mockito 5.x は Java 21 と互換性があり、ScopedValue を使ったコンテキスト注入のテストにも対応しやすい。",
    java8Code: `// Java 8: 通常クラスで User を定義してモック設定
class User {
    private final String id;
    private final String name;
    User(String id, String name) { this.id = id; this.name = name; }
    String getId() { return id; }
    String getName() { return name; }
}
// テスト側:
UserRepository mockRepo = Mockito.mock(UserRepository.class);
when(mockRepo.findById("U001")).thenReturn(Optional.of(new User("U001", "田中")));`,
    java17Code: `// Java 17: record + @ExtendWith で簡潔に
record User(String id, String name) {}

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository userRepository;
    @InjectMocks UserService userService;

    @Test void findUser() {
        when(userRepository.findById("U001"))
            .thenReturn(Optional.of(new User("U001", "田中")));
        User result = userService.findById("U001");
        assertEquals("田中", result.name());
    }
}`,
    java21Code: `// Java 21: record パターンで戻り値を分解して検証
record User(String id, String name) {}

@Test void findUserAndDestructure() {
    when(userRepository.findById("U001"))
        .thenReturn(Optional.of(new User("U001", "田中")));
    var result = userService.findById("U001");
    if (result instanceof User(var id, var name)) {
        assertEquals("U001", id);
        assertEquals("田中", name);
    }
}`,
  },
  libraryComparison: [
    { name: "Mockito", whenToUse: "Java のモックフレームワークの事実上の標準。JUnit 5 との統合が容易で、when/thenReturn・verify のシンプルな API で学習コストが低い。", tradeoff: "static メソッドのモック化には mockito-inline が必要。PowerMock ほどの機能はないが、設計を正す方向に誘導される利点がある。" },
    { name: "EasyMock", whenToUse: "expect-replay-verify の明示的なフェーズ管理を好むチームや、レガシープロジェクトで既に導入されている場合。", tradeoff: "replay() の呼び忘れでテストが通らない等、Mockito に比べて手順が多く初学者には敷居が高い。新規採用の理由は薄い。" },
    { name: "手動スタブ（インターフェース実装）", whenToUse: "モックフレームワークを導入せず、テスト用の実装クラスを手書きする方法。依存が増えず、テストの意図が明確になる。", tradeoff: "テスト対象のインターフェースにメソッドが増えるたびにスタブも修正が必要。メソッド数が多い場合はメンテナンスコストが高くなる。" },
  ],
  faq: [
    { question: "Mock と Stub と Spy の違いは何ですか。", answer: "Mock は呼び出しの検証（verify）が主目的、Stub は固定値を返す設定（when/thenReturn）が主目的です。Spy は実オブジェクトの一部メソッドだけを差し替えます。" },
    { question: "when/thenReturn と doReturn/when の違いは何ですか。", answer: "通常は when/thenReturn で十分です。@Spy では when を使うと実メソッドが一度呼ばれるため、副作用を避けたい場合は doReturn/when を使います。" },
    { question: "Mockito で final クラスをモック化できますか。", answer: "Mockito 5 以降はデフォルトで対応しています。Mockito 4 以前では mockito-inline を依存に追加するか、インターフェースを導入します。" },
    { question: "verify はどこまで書くべきですか。", answer: "外部とのやり取りが仕様として重要な箇所に絞るのが基本です。内部ヘルパーメソッドまで verify し始めると、実装変更に弱いテストになります。" },
    { question: "モックを使わず手書きスタブで済ませる判断基準はありますか。", answer: "戻り値を数パターン返すだけで十分なら手書きスタブの方が意図が明確なことがあります。呼び出し回数や引数検証が必要になった時点で Mockito を検討すると整理しやすいです。" },
  ],
  codeTitle: "UserServiceTest.java",
  codeSample: `import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    record User(String id, String name, String email) {}

    interface UserRepository {
        Optional<User> findById(String id);
        List<User> findAll();
        void save(User user);
    }

    static class UserService {
        private final UserRepository repository;
        UserService(UserRepository repository) { this.repository = repository; }

        User findById(String id) {
            return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ユーザーが見つかりません: " + id));
        }

        List<User> findActiveUsers() {
            return repository.findAll().stream()
                .filter(user -> user.email() != null && !user.email().isBlank())
                .toList();
        }

        void register(String id, String name, String email) {
            if (repository.findById(id).isPresent()) {
                throw new IllegalStateException("ユーザーID が重複しています: " + id);
            }
            repository.save(new User(id, name, email));
        }
    }

    @Mock UserRepository userRepository;
    @InjectMocks UserService userService;

    @Test
    @DisplayName("存在するユーザーを ID で取得できる")
    void findById_returnsUser() {
        var expected = new User("U001", "田中太郎", "tanaka@example.com");
        when(userRepository.findById("U001")).thenReturn(Optional.of(expected));

        User actual = userService.findById("U001");

        assertEquals("田中太郎", actual.name());
        verify(userRepository, times(1)).findById("U001");
    }

    @Test
    @DisplayName("存在しないユーザーを取得すると例外が発生する")
    void findById_throwsWhenNotFound() {
        when(userRepository.findById("U999")).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> userService.findById("U999"));
    }

    @Test
    @DisplayName("メールアドレスを持つユーザーだけを返す")
    void findActiveUsers_filtersBlankEmail() {
        when(userRepository.findAll()).thenReturn(List.of(
            new User("U001", "田中", "tanaka@example.com"),
            new User("U002", "鈴木", ""),
            new User("U003", "佐藤", "sato@example.com")
        ));
        assertEquals(2, userService.findActiveUsers().size());
    }

    @Test
    @DisplayName("既存ユーザーの登録を試みると例外が発生する")
    void register_throwsWhenDuplicate() {
        when(userRepository.findById("U001"))
            .thenReturn(Optional.of(new User("U001", "田中", "tanaka@example.com")));
        assertThrows(IllegalStateException.class,
            () -> userService.register("U001", "田中", "tanaka@example.com"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("新規ユーザーを正常に登録できる")
    void register_savesNewUser() {
        when(userRepository.findById("U100")).thenReturn(Optional.empty());
        userService.register("U100", "山田花子", "yamada@example.com");
        verify(userRepository).save(argThat(u -> "U100".equals(u.id()) && "山田花子".equals(u.name())));
    }
}`,
},
{
  slug: "assertj-fluent-assertions",
  title: "AssertJ で読みやすく保守しやすいテストアサーションを書く",
  categorySlug: "testing",
  summary: "AssertJ の assertThat を使い、コレクション検証、例外検証、文字列検証を JUnit 5 標準アサーションと比較しながら整理する。",
  version: "Java 17",
  tags: ["AssertJ", "assertThat", "テスト", "JUnit 5", "アサーション", "コレクション検証", "例外検証"],
  apiNames: ["org.assertj.core.api.Assertions.assertThat", "org.assertj.core.api.Assertions.assertThatThrownBy", "org.assertj.core.api.Assertions.tuple", "AbstractListAssert.extracting", "AbstractListAssert.containsExactly"],
  description: "AssertJ の assertThat によるコレクション・例外・文字列の検証方法を JUnit 5 の assertEquals と比較しながら Java 8/17/21 対応で解説する。",
  lead: "JUnit 5 の assertEquals や assertTrue でテストを書いていると、「期待値と実際値のどちらが先だったか」「コレクションの中身をどう検証すればいいか」で手が止まることがあります。AssertJ は assertThat(actual).isEqualTo(expected) の形で主語を先に書く流暢な API を提供し、IDE の補完と組み合わせることで「何を検証しているか」がテストコードを読むだけで分かるようになります。この記事では、注文処理の結果検証を題材に、リストの要素検証（extracting + containsExactly）、例外メッセージの検証（assertThatThrownBy）、文字列の部分一致検証を一通り扱います。JUnit 5 標準との書き方の違いも示すので、チームへの導入判断にも使えるはずです。特にコレクションの中身を細かく検証する場面では、AssertJ で劇的に読みやすくなります。",
  useCases: [
    "注文一覧 API のレスポンスに含まれる商品名と数量を extracting + containsExactly でまとめて検証する",
    "バリデーションエラー時の例外メッセージに必要な情報が含まれていることを assertThatThrownBy で検証する",
    "帳票出力の結果文字列がヘッダー・明細・フッターの順に構成されていることを contains / startsWith / endsWith で検証する",
    "ドメインオブジェクトの複数フィールドを satisfies や extracting で読みやすく確認する",
    "リストの順序が仕様に含まれる検索結果で、containsExactly と hasSize を組み合わせて回帰を防ぐ",
  ],
  cautions: [
    "assertThat は org.assertj.core.api.Assertions.assertThat をインポートすること。Hamcrest の assertThat と混同しやすい",
    "isEqualTo は equals() で比較する。record なら自動生成される equals で比較されるが、通常クラスでは equals を実装していないと参照比較になる",
    "extracting でフィールドを取り出す際、メソッド参照（Order::productName）を使うと型安全になる。文字列指定はリファクタリングに弱い",
    "assertThatThrownBy に渡すラムダの中で例外が発生しなかった場合、AssertJ が AssertionError を投げる",
    "AssertJ は JUnit 5 と併用するライブラリであり、テストランナーの代替ではない。@Test は JUnit 5 のものを引き続き使う",
    "containsExactlyInAnyOrder は順序を無視するため、ソート仕様を確認したいテストでは不適切になる",
    "便利なアサーションを使いすぎると、かえってチーム内で読みにくい場合がある。頻出パターンから段階的に導入する",
  ],
  relatedArticleSlugs: ["junit5-basics", "mockito-mock-stub-spy"],
  versionCoverage: {
    java8: "AssertJ 3.x は Java 8 で動作する。extracting やカスタムアサーションも書ける。ただし record が使えないためテストデータの準備に getter が必要。",
    java17: "record と組み合わせると extracting(Order::productName) のようにメソッド参照で型安全にフィールドを取り出せる。",
    java21: "SequencedCollection の新メソッド（getFirst / getLast）の戻り値を assertThat で直接検証できる。",
    java8Code: `// Java 8: getter でフィールドを取り出してアサーション
class Order {
    private final String productName;
    private final int quantity;
    Order(String productName, int quantity) {
        this.productName = productName; this.quantity = quantity;
    }
    String getProductName() { return productName; }
    int getQuantity() { return quantity; }
}
assertThat(orders)
    .extracting(Order::getProductName, Order::getQuantity)
    .containsExactly(tuple("ボールペン", 10), tuple("ノート", 5));`,
    java17Code: `// Java 17: record でテストデータ準備が簡潔
record Order(String productName, int quantity) {}
assertThat(orders)
    .extracting(Order::productName, Order::quantity)
    .containsExactly(tuple("ボールペン", 10), tuple("ノート", 5));`,
    java21Code: `// Java 21: SequencedCollection + AssertJ で先頭・末尾を検証
assertThat(orders.getFirst().productName()).isEqualTo("ボールペン");
assertThat(orders.getLast().quantity()).isEqualTo(5);
assertThat(orders).hasSize(2);`,
  },
  libraryComparison: [
    { name: "AssertJ", whenToUse: "流暢な API でテストの可読性を上げたいとき。コレクション検証が強力で、業務テストで最も効果を発揮する。", tradeoff: "依存追加が必要。assertEquals で事足りるシンプルなテストには過剰な場合がある。" },
    { name: "JUnit 5 Assertions（標準）", whenToUse: "追加依存なしで使える。assertEquals / assertThrows で基本的な検証はカバーできる。", tradeoff: "コレクションの要素検証が冗長になる。引数の順序を間違えやすい。" },
    { name: "Hamcrest", whenToUse: "assertThat + Matcher の組み合わせで柔軟な検証を行いたいとき。JUnit 4 時代からの資産がある場合。", tradeoff: "IDE 補完が AssertJ ほど効きにくい。新規プロジェクトでは AssertJ の方が推奨される傾向。" },
  ],
  faq: [
    { question: "AssertJ と JUnit 5 のアサーションを混在させてもよいですか。", answer: "技術的には問題ありませんが、チーム内でスタイルが混在すると可読性が下がります。導入するなら全テストで統一する方針が望ましいです。" },
    { question: "containsExactly と containsExactlyInAnyOrder の違いは何ですか。", answer: "containsExactly は順序も含めて一致を検証します。containsExactlyInAnyOrder は順序を問わず要素の一致だけを検証します。" },
    { question: "カスタムアサーションを作る場面はどんなときですか。", answer: "同じ検証パターンが複数テストに重複するときに AbstractAssert を継承して作ります。3回以上同じ検証を書いたら抽出を検討する目安です。" },
    { question: "AssertJ はどんな場面で特に効果がありますか。", answer: "コレクション、Optional、例外、文字列のように複数条件を読みやすく並べたい場面で効果が大きいです。単純な数値比較だけなら JUnit 標準でも十分です。" },
    { question: "soft assertions は使うべきですか。", answer: "DTO や画面レスポンスの複数フィールドをまとめて確認したい場面では有効です。ただし unrelated な検証まで1テストに詰め込むと意図がぼやけるため、対象を絞って使います。" },
  ],
  codeTitle: "OrderValidationTest.java",
  codeSample: `import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

class OrderValidationTest {

    record OrderItem(String productName, int quantity, int unitPrice) {
        int subtotal() { return quantity * unitPrice; }
    }

    record Order(String orderId, List<OrderItem> items) {
        int totalAmount() {
            return items.stream().mapToInt(OrderItem::subtotal).sum();
        }
        String summary() {
            return "注文番号: %s / 合計: %,d円 / 明細数: %d"
                .formatted(orderId, totalAmount(), items.size());
        }
    }

    static Order createSampleOrder() {
        return new Order("ORD-2024-001", List.of(
            new OrderItem("ボールペン（黒）", 10, 150),
            new OrderItem("コピー用紙 A4", 5, 480),
            new OrderItem("付箋（大）", 3, 320)));
    }

    @Nested @DisplayName("コレクション検証")
    class CollectionTests {
        @Test @DisplayName("商品名と数量を一括検証する")
        void extractFields() {
            assertThat(createSampleOrder().items())
                .hasSize(3)
                .extracting(OrderItem::productName, OrderItem::quantity)
                .containsExactly(
                    tuple("ボールペン（黒）", 10),
                    tuple("コピー用紙 A4", 5),
                    tuple("付箋（大）", 3));
        }
    }

    @Nested @DisplayName("文字列検証")
    class StringTests {
        @Test @DisplayName("サマリーに必要な情報が含まれている")
        void summaryContainsInfo() {
            assertThat(createSampleOrder().summary())
                .startsWith("注文番号: ORD-2024-001")
                .contains("4,860円")
                .contains("明細数: 3");
        }
    }

    @Nested @DisplayName("例外検証")
    class ExceptionTests {
        static Order createOrder(String orderId, List<OrderItem> items) {
            if (orderId == null || orderId.isBlank()) throw new IllegalArgumentException("注文番号は必須です");
            if (items == null || items.isEmpty()) throw new IllegalArgumentException("明細が空の注文は作成できません");
            return new Order(orderId, items);
        }

        @Test @DisplayName("注文番号が空だと例外が発生する")
        void throwsWhenBlank() {
            assertThatThrownBy(() -> createOrder("", List.of()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("注文番号は必須です");
        }
    }
}`,
},
{
  slug: "testcontainers-database-test",
  title: "Testcontainers で PostgreSQL を使ったデータベーステストを書く",
  categorySlug: "testing",
  summary: "Testcontainers で PostgreSQL コンテナを起動し、JDBC でリポジトリクラスの CRUD をテストする方法を整理する。",
  version: "Java 17",
  tags: ["Testcontainers", "PostgreSQL", "JDBC", "データベーステスト", "JUnit 5", "@Container", "@Testcontainers"],
  apiNames: ["org.testcontainers.containers.PostgreSQLContainer", "org.testcontainers.junit.jupiter.Container", "org.testcontainers.junit.jupiter.Testcontainers", "java.sql.Connection", "java.sql.PreparedStatement"],
  description: "Testcontainers で PostgreSQL コンテナを起動し、JDBC でリポジトリクラスの CRUD を結合テストする方法を Java 8/17/21 対応で解説する。",
  lead: "H2 などのインメモリデータベースでテストを書いていると、「本番は PostgreSQL なのにテストでは H2 で通ってしまう」「PostgreSQL 固有の関数を使うとテストできない」という場面に遭遇します。Testcontainers は Docker コンテナをテストのライフサイクルに合わせて自動的に起動・破棄するライブラリで、本番と同じデータベースエンジンでテストを実行できます。この記事では、PostgreSQLContainer を使って UserRepository の CRUD を検証する結合テストを題材に、@Testcontainers と @Container の使い方、テーブル初期化のパターン、テストごとのデータクリーンアップを整理します。Docker が動く環境であれば特別な設定なしに使えるため、CI/CD パイプラインにも組み込みやすいのが大きな利点です。",
  useCases: [
    "PostgreSQL の JSONB カラムを使ったリポジトリクラスのテストを、本番と同じエンジンで検証する",
    "Flyway で作成したスキーマの上で実データを挿入してクエリ結果をテストする",
    "CI/CD パイプラインで外部 DB サーバーを用意せずに結合テストを行う",
    "ユニーク制約やインデックス、トランザクション境界など本番 DB 固有の挙動を確認する",
    "マイグレーション適用後の初期データや参照整合性を自動テストで継続確認する",
  ],
  cautions: [
    "テスト実行環境に Docker が必要。Docker が動かない環境ではテストがスキップされる",
    "コンテナの起動に数秒〜十数秒かかる。static フィールドで共有するか、テストスイートの分割を検討する",
    "@Container を static にする場合、テスト間のデータ汚染を防ぐため @BeforeEach で TRUNCATE するか @AfterEach でロールバックする",
    "PostgreSQLContainer のデフォルトイメージバージョンが固定されていない場合がある。本番と同じバージョンを明示指定する",
    "testcontainers の依存は testImplementation に限定すること",
    "CI 環境の Docker ソケット権限やメモリ制限で不安定になることがある。ローカルで通っても CI 設定は別途確認が必要",
    "複数コンテナを組み合わせる統合テストは診断が難しくなる。まずは DB 単体で安定させてから広げる方が安全",
  ],
  relatedArticleSlugs: ["junit5-basics", "h2-in-memory-test", "jdbc-basics"],
  versionCoverage: {
    java8: "Testcontainers 1.17.x までは Java 8 をサポート。try-with-resources でコンテナを管理するが、record やテキストブロックが使えず冗長になる。",
    java17: "Testcontainers 1.19+ は Java 17 を推奨。text block で SQL を読みやすく書け、record でテストデータを簡潔に表現できる。",
    java21: "Testcontainers は Java 21 に対応済み。Virtual Thread 上でのデータベース接続テストも可能。",
    java8Code: `// Java 8: 文字列連結で SQL を定義
@ClassRule
public static PostgreSQLContainer<?> postgres =
    new PostgreSQLContainer<>("postgres:16-alpine");
String sql = "CREATE TABLE users ("
    + "id VARCHAR(50) PRIMARY KEY, "
    + "name VARCHAR(100) NOT NULL)";`,
    java17Code: `// Java 17: @Testcontainers + text block で簡潔に
@Testcontainers
class UserRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16-alpine");

    static final String CREATE_TABLE = """
        CREATE TABLE IF NOT EXISTS users (
            id    VARCHAR(50) PRIMARY KEY,
            name  VARCHAR(100) NOT NULL,
            email VARCHAR(200)
        )
        """;
}`,
    java21Code: `// Java 21: Virtual Thread でテスト並列実行を試す
@Test void concurrentInserts() throws Exception {
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        var futures = IntStream.range(0, 100)
            .mapToObj(i -> executor.submit(() -> insertUser("U" + i)))
            .toList();
        for (var f : futures) f.get();
    }
}`,
  },
  libraryComparison: [
    { name: "Testcontainers", whenToUse: "本番と同じ DB エンジンでテストしたいとき。Docker コンテナを自動管理する。CI/CD でも外部 DB 不要。", tradeoff: "Docker が必要。コンテナ起動に数秒かかり、単体テストほどの速度は出ない。" },
    { name: "H2（インメモリ）", whenToUse: "Docker が使えない環境や ANSI SQL の範囲で十分なテスト。起動が極めて速い。", tradeoff: "PostgreSQL 固有の機能がサポートされず、本番との挙動差異が残る。" },
    { name: "組み込み PostgreSQL（embedded-postgres）", whenToUse: "Docker なしで PostgreSQL バイナリを直接起動したいとき。", tradeoff: "OS ごとの互換性問題がある。コミュニティが小さい。" },
  ],
  faq: [
    { question: "Testcontainers のテストが遅い場合、高速化する方法はありますか。", answer: "コンテナを static フィールドで共有し、Reusable Containers 機能を有効にすると起動コストを大幅に削減できます。" },
    { question: "MySQL や Oracle でも使えますか。", answer: "はい。MySQLContainer、OracleContainer など主要 DB のモジュールが公式に提供されています。" },
    { question: "GitHub Actions で追加設定は必要ですか。", answer: "ランナーに Docker がプリインストールされているため追加設定なしで動作します。" },
    { question: "Flyway や Liquibase と併用できますか。", answer: "はい。コンテナ起動後にマイグレーションを適用してからテストを流す構成が一般的です。アプリ起動時に自動適用させる方法でも構いません。" },
    { question: "単純な CRUD テストでも Testcontainers を使うべきですか。", answer: "本番 DB との方言差や制約差が問題になりやすいなら有効です。一方で、単純なリポジトリの基本動作確認なら H2 のような軽量手段を先に使う方が回しやすいこともあります。" },
  ],
  codeTitle: "UserRepositoryIntegrationTest.java",
  codeSample: `import org.junit.jupiter.api.*;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.sql.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class UserRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb").withUsername("testuser").withPassword("testpass");

    record User(String id, String name, String email) {}

    static class UserRepository {
        private final String url, user, pass;
        UserRepository(String url, String user, String pass) {
            this.url = url; this.user = user; this.pass = pass;
        }
        Connection conn() throws SQLException { return DriverManager.getConnection(url, user, pass); }

        void save(User u) throws SQLException {
            try (var c = conn(); var ps = c.prepareStatement(
                "INSERT INTO users(id,name,email) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,email=EXCLUDED.email")) {
                ps.setString(1, u.id()); ps.setString(2, u.name()); ps.setString(3, u.email()); ps.executeUpdate();
            }
        }
        Optional<User> findById(String id) throws SQLException {
            try (var c = conn(); var ps = c.prepareStatement("SELECT id,name,email FROM users WHERE id=?")) {
                ps.setString(1, id);
                try (var rs = ps.executeQuery()) {
                    return rs.next() ? Optional.of(new User(rs.getString(1), rs.getString(2), rs.getString(3))) : Optional.empty();
                }
            }
        }
        List<User> findAll() throws SQLException {
            var list = new ArrayList<User>();
            try (var c = conn(); var st = c.createStatement(); var rs = st.executeQuery("SELECT id,name,email FROM users ORDER BY id")) {
                while (rs.next()) list.add(new User(rs.getString(1), rs.getString(2), rs.getString(3)));
            }
            return list;
        }
    }

    static UserRepository repo;

    @BeforeAll static void initSchema() throws SQLException {
        repo = new UserRepository(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        try (var c = DriverManager.getConnection(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
             var st = c.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS users(id VARCHAR(50) PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(200))");
        }
    }

    @BeforeEach void clean() throws SQLException {
        try (var c = DriverManager.getConnection(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
             var st = c.createStatement()) { st.execute("TRUNCATE TABLE users"); }
    }

    @Test @DisplayName("保存して取得できる")
    void saveAndFind() throws SQLException {
        repo.save(new User("U001", "田中太郎", "tanaka@example.com"));
        var found = repo.findById("U001");
        assertTrue(found.isPresent());
        assertEquals("田中太郎", found.get().name());
    }

    @Test @DisplayName("存在しない ID は空を返す")
    void notFound() throws SQLException {
        assertTrue(repo.findById("U999").isEmpty());
    }

    @Test @DisplayName("複数件を全件取得できる")
    void findAll() throws SQLException {
        repo.save(new User("U001", "田中", "a@b.com"));
        repo.save(new User("U002", "鈴木", "c@d.com"));
        assertEquals(2, repo.findAll().size());
    }
}`,
},
{
  slug: "h2-in-memory-test",
  title: "H2 インメモリDBでJDBCリポジトリテストを高速化する方法",
  categorySlug: "testing",
  summary: "H2 Database をインメモリモードで使い、JDBC リポジトリの CRUD テストを高速かつ再現性高く実行する手法を整理する。",
  version: "Java 17",
  tags: ["H2", "インメモリDB", "JDBC", "テスト", "Derby", "スキーマ初期化", "リポジトリテスト"],
  apiNames: ["java.sql.Connection", "java.sql.DriverManager", "java.sql.PreparedStatement", "java.sql.ResultSet", "java.sql.Statement"],
  description: "H2 Database のインメモリモードで JDBC リポジトリの CRUD テストを高速に実行する方法を、スキーマ初期化やリセット戦略、Derby との比較を含めて解説する。",
  lead: "データベースに依存するリポジトリクラスのテストは、環境構築の手間と実行速度がネックになりがちです。H2 Database のインメモリモードを使えば、JVM 上でデータベースが完結し、テストごとにクリーンな状態を再現できます。この記事では、H2 インメモリ DB を使って UserRepository の CRUD テストを実装する手順を示します。スキーマの初期化方法、テストごとのデータリセット戦略（DROP ALL OBJECTS と INIT スクリプト）、Apache Derby との使い分け、そして本番 DB との SQL 方言差に起因する落とし穴まで、実務で押さえるべきポイントを一通り整理します。Testcontainers との棲み分けについても触れ、どの段階でインメモリ DB からコンテナ DB へ移行すべきかの判断材料を示します。",
  useCases: [
    "新規開発の JDBC リポジトリに対し、CI 上で外部 DB なしに CRUD テストを高速実行する",
    "バッチ処理の INSERT/UPDATE ロジックをインメモリ DB で検証し、本番デプロイ前にデータ不整合を検出する",
    "リファクタリング時にテーブル構造変更の影響をインメモリ DB で素早く確認する",
    "サービス層のテストで最小限の SQL 実行結果だけ確認し、DB 起動コストを抑えたい",
    "開発初期にリポジトリの基本 CRUD を回し、後段で Testcontainers の本番寄り検証に切り替える",
  ],
  cautions: [
    "H2 の SQL 方言は MySQL や PostgreSQL と完全互換ではない。AUTO_INCREMENT は IDENTITY に書き換える必要がある",
    "インメモリモードはコネクションが全て閉じた時点でデータが消える。DB_CLOSE_DELAY=-1 でテスト間のデータ保持が可能",
    "H2 の MODE=MySQL や MODE=PostgreSQL は一部の方言差を吸収できるが、ウィンドウ関数やストアドプロシージャの互換性は限定的",
    "テストごとに DROP ALL OBJECTS を実行するリセット方式は安全だが遅い場合がある。TRUNCATE で済むならそちらを優先する",
    "Derby は H2 より SQL 標準寄りだがドキュメントやコミュニティが小さい。特別な理由がなければ H2 を選ぶのが無難",
    "本番で使うインデックスや制約が H2 では同じ形で再現できないことがある。DDL が通っただけで安心しない",
    "JDBC URL をテスト間で共有すると並列実行時に干渉しやすい。クラス単位またはメソッド単位で DB 名を分けると安定する",
  ],
  relatedArticleSlugs: ["junit5-basics", "testcontainers-database-test", "jdbc-basics"],
  versionCoverage: {
    java8: "JDBC API は Java 8 でも同様に使える。try-with-resources で Connection/Statement を管理する。",
    java17: "record で User エンティティを定義でき、テストデータの記述が簡潔になる。テキストブロックで SQL を見やすく書ける。",
    java21: "基本的な JDBC 操作は Java 17 と変わらないが、パターンマッチングを活用して ResultSet からのマッピング処理を整理できる。",
    java8Code: `// Java 8: 通常クラスでエンティティを定義
public class User {
    private final long id;
    private final String name;
    private final String email;
    public User(long id, String name, String email) {
        this.id = id; this.name = name; this.email = email;
    }
}
String sql = "INSERT INTO users (name, email) " + "VALUES (?, ?)";`,
    java17Code: `// Java 17: record + テキストブロックで簡潔に
record User(long id, String name, String email) {}
String sql = """
    INSERT INTO users (name, email)
    VALUES (?, ?)
    """;`,
    java21Code: `// Java 21: record + テキストブロック
record User(long id, String name, String email) {}
try (var rs = stmt.executeQuery()) {
    while (rs.next()) {
        var user = new User(
            rs.getLong("id"), rs.getString("name"), rs.getString("email"));
        users.add(user);
    }
}`,
  },
  libraryComparison: [
    { name: "H2 Database（インメモリ）", whenToUse: "JDBC リポジトリの単体テストに最適。JVM 内で完結し起動が数十ミリ秒。", tradeoff: "本番 DB との SQL 方言差が残る。DDL やストアドプロシージャのテストには向かない。" },
    { name: "Apache Derby（インメモリ）", whenToUse: "JDK に同梱されていた歴史があり、追加依存なしで使いたいとき。", tradeoff: "H2 と比べてドキュメントが少なく、MODE 切替もない。パフォーマンスも劣る。" },
    { name: "Testcontainers", whenToUse: "本番と同じ DB エンジンでテストしたいとき。SQL 方言差がゼロ。", tradeoff: "Docker が必要で起動に数秒かかる。単純な CRUD テストにはオーバースペック。" },
  ],
  faq: [
    { question: "H2 インメモリ DB のデータはテスト終了後に消えますか。", answer: "全コネクションが閉じた時点で破棄されます。DB_CLOSE_DELAY=-1 で JVM 終了まで保持できますが通常は不要です。" },
    { question: "H2 の MySQL モードで本番と同じ DDL を使えますか。", answer: "基本的なデータ型は通りますが、ストアドプロシージャやトリガーは非対応です。H2 用に調整するのが確実です。" },
    { question: "テスト並列実行時にデータが衝突しませんか。", answer: "jdbc:h2:mem: の後に一意な DB 名を付ければ独立したインスタンスが作られます。" },
    { question: "H2 と Testcontainers はどう使い分けますか。", answer: "ローカルで素早く回したい CRUD テストや基本分岐の確認は H2、方言差や制約、マイグレーションを含めて本番寄りに見たい場面は Testcontainers が向いています。" },
    { question: "スキーマ初期化は INIT と @BeforeEach のどちらがよいですか。", answer: "小さなテストでは INIT でも十分ですが、複数テーブルや細かい初期データがある場合は @BeforeEach や SQL スクリプトに分けた方が追いやすくなります。" },
  ],
  codeTitle: "UserRepositoryTest.java",
  codeSample: `import java.sql.*;
import java.util.*;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class UserRepositoryTest {

    record User(long id, String name, String email) {}

    static class UserRepository {
        private final Connection conn;
        UserRepository(Connection conn) { this.conn = conn; }

        void save(String name, String email) throws SQLException {
            try (var ps = conn.prepareStatement("INSERT INTO users(name,email) VALUES(?,?)")) {
                ps.setString(1, name); ps.setString(2, email); ps.executeUpdate();
            }
        }
        Optional<User> findById(long id) throws SQLException {
            try (var ps = conn.prepareStatement("SELECT id,name,email FROM users WHERE id=?")) {
                ps.setLong(1, id);
                try (var rs = ps.executeQuery()) {
                    return rs.next() ? Optional.of(new User(rs.getLong(1), rs.getString(2), rs.getString(3))) : Optional.empty();
                }
            }
        }
        List<User> findAll() throws SQLException {
            var list = new ArrayList<User>();
            try (var st = conn.createStatement(); var rs = st.executeQuery("SELECT id,name,email FROM users ORDER BY id")) {
                while (rs.next()) list.add(new User(rs.getLong(1), rs.getString(2), rs.getString(3)));
            }
            return list;
        }
    }

    private Connection conn;
    private UserRepository repository;

    @BeforeEach void setUp() throws SQLException {
        conn = DriverManager.getConnection("jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1");
        try (var st = conn.createStatement()) {
            st.execute("CREATE TABLE IF NOT EXISTS users(id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(200) NOT NULL)");
        }
        repository = new UserRepository(conn);
    }

    @AfterEach void tearDown() throws SQLException {
        try (var st = conn.createStatement()) { st.execute("DROP ALL OBJECTS"); }
        conn.close();
    }

    @Test @DisplayName("保存して取得できる")
    void saveAndFind() throws SQLException {
        repository.save("田中太郎", "tanaka@example.com");
        var found = repository.findById(1L);
        assertTrue(found.isPresent());
        assertEquals("田中太郎", found.get().name());
    }

    @Test @DisplayName("複数件を全件取得できる")
    void findAll() throws SQLException {
        repository.save("田中太郎", "tanaka@example.com");
        repository.save("佐藤花子", "sato@example.com");
        assertEquals(2, repository.findAll().size());
    }

    @Test @DisplayName("存在しない ID は空を返す")
    void notFound() throws SQLException {
        assertTrue(repository.findById(999L).isEmpty());
    }
}`,
},
{
  slug: "test-design-patterns",
  title: "テストコード設計パターンで可読性と保守性を上げる方法",
  categorySlug: "testing",
  summary: "Given-When-Then、テストビルダー、Object Mother など、テストコードの可読性と保守性を改善する設計パターンを実装例付きで整理する。",
  version: "Java 17",
  tags: ["テスト設計", "Given-When-Then", "Arrange-Act-Assert", "TestDataBuilder", "Object Mother", "テストフィクスチャ"],
  apiNames: ["org.junit.jupiter.api.Test", "org.junit.jupiter.api.BeforeEach", "org.junit.jupiter.api.Nested", "org.junit.jupiter.api.DisplayName"],
  description: "Given-When-Then や TestDataBuilder、Object Mother パターンなどテストコードの設計手法を Java 17 のサンプルコード付きで解説する。",
  lead: "テストコードは書けるのに、後から読み返すと「何をテストしているのか分からない」「データの準備が長くてテスト本体が埋もれている」と感じたことはないでしょうか。プロダクションコードに設計パターンがあるように、テストコードにも可読性と保守性を高めるための定石があります。この記事では、テスト構造を明確にする Given-When-Then パターン、テストデータの組み立てを宣言的にする TestDataBuilder パターン、定形データの生成を一箇所に集約する Object Mother パターンの 3 つを中心に整理します。注文処理を題材に、テストフィクスチャの設計方針や、フィールドが増えたときにテスト側の修正を最小限にするための工夫まで示します。",
  useCases: [
    "注文・請求など多フィールドのドメインオブジェクトのテストで、データ準備コードの重複を TestDataBuilder で解消する",
    "レビュー指摘が多いテストコードの可読性を Given-When-Then に揃えて改善する",
    "マスタデータが多い統合テストで Object Mother パターンを導入してフィクスチャ管理を一元化する",
    "入力条件だけを変えたい複数テストで、Builder のデフォルト値を使って差分だけ記述する",
    "テストフィクスチャが成長してきたプロジェクトで、共通化と局所性のバランスを見直す",
  ],
  cautions: [
    "Given-When-Then はコメントで区切るだけでも効果がある。形式にこだわりすぎて本質が見えにくくなっては本末転倒",
    "TestDataBuilder のメソッドチェーンが深すぎると追いにくい。重要なフィールドだけ明示し、残りはデフォルトに任せる",
    "Object Mother は変更頻度の高いフィールドが多い場合に withXxx が増殖しがち。Builder の方が合う場面もある",
    "テストヘルパーの共通化範囲は「同一テストクラス内」または「同一パッケージ内」に留めるのが安全",
    "Builder に業務ルールを入れすぎると、何がテスト対象で何が補助コードか分かりにくくなる。補助は最小限に保つ",
    "Object Mother が巨大化すると副作用のある共通データ置き場になりやすい。用途別に小さく分割する方が扱いやすい",
  ],
  relatedArticleSlugs: ["junit5-basics", "mockito-mock-stub-spy", "assertj-fluent-assertions"],
  versionCoverage: {
    java8: "Builder パターンはコンストラクタやメソッドチェーンで実装する。テストデータの記述が冗長になりがち。",
    java17: "record でテストデータを不変に定義し、Builder が record を返す設計が自然に書ける。",
    java21: "record TestResult(int code, String message) の検証で switch (result) { case TestResult(var c, var m) -> ... } のように分解代入でき、フィールド単位の検証コードが簡潔になる。",
    java8Code: `// Java 8: 通常クラスの Builder
public class OrderBuilder {
    private String customerName = "テスト顧客";
    private int amount = 1000;
    public OrderBuilder customerName(String v) { this.customerName = v; return this; }
    public OrderBuilder amount(int v) { this.amount = v; return this; }
    public Order build() { return new Order(customerName, amount); }
}`,
    java17Code: `// Java 17: record + Builder で簡潔に
record Order(String customerName, int amount, Order.Status status) {
    enum Status { PENDING, CONFIRMED, SHIPPED }
}
Order order = new OrderBuilder()
    .customerName("山田商事").amount(50_000).build();`,
    java21Code: `// Java 21: record パターンで検証時に分解
if (result instanceof Order(var name, var amt, var st)) {
    assertEquals("山田商事", name);
    assertEquals(50_000, amt);
}`,
  },
  libraryComparison: [
    { name: "手書きの TestDataBuilder", whenToUse: "外部依存なしで自由度が高く、プロジェクト固有のデフォルト値を埋め込める。", tradeoff: "Builder クラス自体の保守が必要。" },
    { name: "Instancio", whenToUse: "テストデータをランダム生成し、必要なフィールドだけ上書きする。大量フィールドに効果的。", tradeoff: "失敗時の再現にシード指定が必要。業務ルールに沿った値は手動で上書きする。" },
    { name: "EasyRandom", whenToUse: "POJO のフィールドを再帰的にランダム埋めしたいとき。", tradeoff: "メンテナンス状況が不安定。Instancio の方が推奨される傾向。" },
  ],
  faq: [
    { question: "Given-When-Then と Arrange-Act-Assert の違いは何ですか。", answer: "本質的に同じ構造で、BDD 寄りが Given-When-Then、xUnit 寄りが Arrange-Act-Assert です。" },
    { question: "TestDataBuilder と Object Mother はどう使い分けますか。", answer: "フィールドの組み合わせが多い場合は Builder、定形パターンが数種類で済む場合は Object Mother が向いています。" },
    { question: "テストデータのデフォルト値はどこに定義すべきですか。", answer: "Builder のフィールド初期値として定義するのが一般的です。テストで変更したい部分だけ上書きします。" },
    { question: "Builder をどこまで共通化すべきですか。", answer: "同じドメインオブジェクトを複数テストクラスで繰り返し組み立てるなら共通化する価値があります。1クラス内だけでしか使わないなら、そのテストに閉じていた方が読みやすいこともあります。" },
    { question: "テストコードにもリファクタリングは必要ですか。", answer: "必要です。重複や読みにくさを放置すると、仕様変更時にテスト修正コストが増えます。プロダクションコードと同様に、小さく継続的に整えるのが有効です。" },
  ],
  codeTitle: "OrderServiceTest.java",
  codeSample: `import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class OrderServiceTest {

    record OrderItem(String productName, int quantity, BigDecimal unitPrice) {}
    record Order(String customerName, LocalDate orderDate, List<OrderItem> items, Order.Status status) {
        enum Status { PENDING, CONFIRMED, SHIPPED, CANCELLED }
        BigDecimal totalAmount() {
            return items.stream().map(i -> i.unitPrice().multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
    }

    // --- TestDataBuilder パターン ---
    static class OrderBuilder {
        private String customerName = "テスト株式会社";
        private LocalDate orderDate = LocalDate.of(2025, 4, 1);
        private List<OrderItem> items = List.of(new OrderItem("コピー用紙", 10, new BigDecimal("500")));
        private Order.Status status = Order.Status.PENDING;
        OrderBuilder customerName(String v) { this.customerName = v; return this; }
        OrderBuilder items(List<OrderItem> v) { this.items = v; return this; }
        OrderBuilder status(Order.Status v) { this.status = v; return this; }
        Order build() { return new Order(customerName, orderDate, items, status); }
    }

    // --- Object Mother パターン ---
    static class OrderMother {
        static Order pendingOrder() { return new OrderBuilder().build(); }
        static Order confirmedOrder() { return new OrderBuilder().status(Order.Status.CONFIRMED).build(); }
        static Order highValueOrder() {
            return new OrderBuilder().customerName("大口商事")
                .items(List.of(new OrderItem("サーバー", 2, new BigDecimal("500000")))).build();
        }
    }

    static class OrderService {
        Order confirm(Order order) {
            if (order.status() != Order.Status.PENDING)
                throw new IllegalStateException("確定できるのは PENDING 状態の注文のみです");
            return new Order(order.customerName(), order.orderDate(), order.items(), Order.Status.CONFIRMED);
        }
        boolean requiresApproval(Order order) {
            return order.totalAmount().compareTo(new BigDecimal("100000")) > 0;
        }
    }

    private OrderService service;
    @BeforeEach void setUp() { service = new OrderService(); }

    @Nested @DisplayName("注文確定")
    class ConfirmTests {
        @Test @DisplayName("PENDING を確定すると CONFIRMED になる")
        void confirmPending() {
            Order confirmed = service.confirm(OrderMother.pendingOrder());
            assertEquals(Order.Status.CONFIRMED, confirmed.status());
        }
        @Test @DisplayName("CONFIRMED 済みの再確定は例外")
        void confirmAgainThrows() {
            assertThrows(IllegalStateException.class, () -> service.confirm(OrderMother.confirmedOrder()));
        }
    }

    @Nested @DisplayName("承認要否")
    class ApprovalTests {
        @Test @DisplayName("高額注文は承認が必要")
        void highValue() { assertTrue(service.requiresApproval(OrderMother.highValueOrder())); }
        @Test @DisplayName("少額注文は承認不要")
        void lowValue() { assertFalse(service.requiresApproval(OrderMother.pendingOrder())); }
    }
}`,
},
{
  slug: "test-coverage-metrics",
  title: "JaCoCoカバレッジ測定とテスト品質指標の実践ガイド",
  categorySlug: "testing",
  summary: "JaCoCo によるカバレッジ測定の導入手順と、行・分岐・命令カバレッジの違い、カバレッジ率の目標設定を整理する。",
  version: "Java 17",
  tags: ["JaCoCo", "カバレッジ", "行カバレッジ", "分岐カバレッジ", "Maven", "テスト品質", "CI"],
  apiNames: ["org.junit.jupiter.api.Test", "org.junit.jupiter.api.DisplayName", "org.junit.jupiter.params.ParameterizedTest", "org.junit.jupiter.params.provider.CsvSource"],
  description: "JaCoCo による Java コードカバレッジ測定の導入手順を Maven 設定付きで解説し、行・分岐・命令カバレッジの違いと現実的な目標設定を示す。",
  lead: "テストを書いていると「カバレッジ何パーセントを目指すべきか」という議論に必ず遭遇します。しかし、カバレッジは「テストが通過したコードの割合」を示すだけで、テストの検証内容が正しいかどうかは教えてくれません。行カバレッジが 100% でも、分岐の片側しか通っていなかったり、アサーションが甘かったりすれば、バグはすり抜けます。この記事では、Maven プロジェクトに JaCoCo を導入してカバレッジを測定する手順を示したうえで、行カバレッジ・分岐カバレッジ・命令カバレッジそれぞれが何を測っているかの違いを具体的なコード例で説明します。カバレッジ率の現実的な目標設定、カバレッジだけに依存しないテスト品質の考え方にも触れます。",
  useCases: [
    "CI パイプラインに JaCoCo を組み込み、カバレッジが一定値を下回ったらビルドを失敗させるゲートを設定する",
    "レガシーコードのテスト拡充で現状カバレッジを可視化し、優先的にテストすべき箇所を特定する",
    "コードレビューでカバレッジレポートを参照し、分岐カバレッジが低い条件分岐のテスト追加を依頼する",
    "プルリクエスト単位で新規追加コードのカバレッジを確認し、既存負債と切り分けて管理する",
    "重要ロジックだけ PITest などと組み合わせて、単純な通過ではなく検証強度も見直す",
  ],
  cautions: [
    "行カバレッジ 100% は分岐カバレッジ 100% を意味しない。if-else の片方だけでも行カバレッジは高く出る",
    "JaCoCo はバイトコード計装方式のため、新しい構文で正確に出ないバージョンがある。0.8.8 以降を推奨",
    "カバレッジ率をノルマにするとアサーションなしの意味のないテストが量産されるリスクがある",
    "Lombok 生成コードもカバレッジ対象になる。除外設定を入れないと数値が下がる",
    "マルチモジュールでは jacoco:report-aggregate で統合レポートを生成する",
    "例外系や境界値のテストが薄いまま数値だけ高く見えることがある。レポートは未通過箇所の発見に使い、品質判断は別軸で行う",
    "カバレッジ閾値を厳しくしすぎると、変更のたびに無理なテスト追加が発生する。チームの開発速度と負債状況に合わせて設定する",
  ],
  relatedArticleSlugs: ["junit5-basics", "test-design-patterns"],
  versionCoverage: {
    java8: "JaCoCo は Java 8 を完全サポート。ラムダ式のカバレッジも取得可能。try-with-resources で分岐カバレッジが想定より低く出ることがある。",
    java17: "sealed class や record のカバレッジには JaCoCo 0.8.8 以上が必要。",
    java21: "switch 式のパターンマッチングのカバレッジ計測は JaCoCo 0.8.11 以降で改善。",
    java8Code: `// Java 8: 条件分岐のカバレッジ計測
public String classifyAge(int age) {
    if (age < 0) throw new IllegalArgumentException("負の年齢");
    else if (age < 18) return "未成年";
    else if (age < 65) return "成人";
    else return "高齢者";
}
// 分岐カバレッジ 100% には 4 パターンが必要`,
    java17Code: `// Java 17: switch 式で分岐を整理
public String classifyAge(int age) {
    if (age < 0) throw new IllegalArgumentException("負の年齢");
    return switch ((int)(age / 18)) {
        case 0 -> "未成年";
        default -> age < 65 ? "成人" : "高齢者";
    };
}`,
    java21Code: `// Java 21: sealed + record + switch パターンマッチ
sealed interface AgeCategory permits Minor, Adult, Senior {}
record Minor(int age) implements AgeCategory {}
record Adult(int age) implements AgeCategory {}
record Senior(int age) implements AgeCategory {}

String label(AgeCategory cat) {
    return switch (cat) {
        case Minor m  -> "未成年（%d歳）".formatted(m.age());
        case Adult a  -> "成人（%d歳）".formatted(a.age());
        case Senior s -> "高齢者（%d歳）".formatted(s.age());
    };
}`,
  },
  libraryComparison: [
    { name: "JaCoCo", whenToUse: "Java カバレッジ計測のデファクト。Maven/Gradle プラグインがあり CI 連携が容易。", tradeoff: "バイトコード計装方式のため、新しい言語機能への対応にタイムラグがある。" },
    { name: "Cobertura", whenToUse: "かつてのデファクト。CI で Cobertura 形式のレポートが求められる場合。", tradeoff: "開発が停滞。Java 11 以降のサポートが不安定。新規では JaCoCo を選ぶべき。" },
    { name: "PITest（ミューテーションテスト）", whenToUse: "カバレッジだけでは測れないテストの強度を検証したいとき。", tradeoff: "実行時間が数倍〜数十倍。重要なロジックに絞って使うのが現実的。" },
  ],
  faq: [
    { question: "カバレッジの目標値は何パーセントが適切ですか。", answer: "新規コードは 80% 以上を目安にするチームが多いです。数値を絶対視せず、重要なロジックの分岐カバレッジを優先的に確認します。" },
    { question: "JaCoCo で特定クラスを除外できますか。", answer: "Maven プラグインの excludes 設定で除外パターンを指定できます。DTO や自動生成コードを除外するのが一般的です。" },
    { question: "カバレッジが高いのにバグが出るのはなぜですか。", answer: "アサーション不足、境界値の未テスト、異常系の未テストが主な原因です。カバレッジは通過の有無しか見ません。" },
    { question: "分岐カバレッジと行カバレッジのどちらを重視すべきですか。", answer: "条件分岐が多い業務ロジックでは分岐カバレッジの方が有用です。ただし、それだけで十分ではないため、重要な分岐に対する具体的なアサーションも合わせて確認します。" },
    { question: "カバレッジゲートは全体値と差分値のどちらで見るべきですか。", answer: "既存負債が大きいプロジェクトでは、まず差分カバレッジを管理する方が現実的です。全体値は長期的な改善指標として追うと運用しやすくなります。" },
  ],
  codeTitle: "DiscountServiceTest.java",
  codeSample: `import java.math.BigDecimal;
import java.math.RoundingMode;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class DiscountServiceTest {

    static class DiscountService {
        BigDecimal calculateDiscount(String rank, BigDecimal amount) {
            if (amount.compareTo(BigDecimal.ZERO) <= 0)
                throw new IllegalArgumentException("購入金額は正の値を指定してください");
            return switch (rank) {
                case "GOLD" -> amount.multiply(new BigDecimal("0.10"))
                    .setScale(0, RoundingMode.FLOOR).min(new BigDecimal("5000"));
                case "SILVER" -> amount.multiply(new BigDecimal("0.05"))
                    .setScale(0, RoundingMode.FLOOR).min(new BigDecimal("2000"));
                case "BRONZE" -> BigDecimal.ZERO;
                default -> throw new IllegalArgumentException("不明なランク: " + rank);
            };
        }
    }

    private DiscountService service;
    @BeforeEach void setUp() { service = new DiscountService(); }

    @Test @DisplayName("GOLD 10%割引")
    void gold10percent() {
        assertEquals(new BigDecimal("1000"), service.calculateDiscount("GOLD", new BigDecimal("10000")));
    }

    @Test @DisplayName("GOLD 上限5000円")
    void goldCap() {
        assertEquals(new BigDecimal("5000"), service.calculateDiscount("GOLD", new BigDecimal("100000")));
    }

    @ParameterizedTest
    @CsvSource({"10000,500", "40000,2000", "80000,2000"})
    @DisplayName("SILVER 5%割引（上限2000円）")
    void silver(String amount, String expected) {
        assertEquals(new BigDecimal(expected), service.calculateDiscount("SILVER", new BigDecimal(amount)));
    }

    @Test @DisplayName("BRONZE は割引なし")
    void bronze() { assertEquals(BigDecimal.ZERO, service.calculateDiscount("BRONZE", new BigDecimal("50000"))); }

    @Test @DisplayName("不明ランクで例外")
    void unknownRank() { assertThrows(IllegalArgumentException.class, () -> service.calculateDiscount("PLATINUM", new BigDecimal("10000"))); }

    @Test @DisplayName("金額0以下で例外")
    void zeroAmount() { assertThrows(IllegalArgumentException.class, () -> service.calculateDiscount("GOLD", BigDecimal.ZERO)); }
}`,
},
{
  slug: "e2e-integration-test",
  title: "Spring Boot 統合テストとE2Eテストの書き方を実例で解説",
  categorySlug: "testing",
  summary: "テストピラミッドの考え方を整理し、@SpringBootTest と TestRestTemplate で REST API の統合テストを書く方法を解説する。",
  version: "Java 17",
  tags: ["統合テスト", "E2Eテスト", "@SpringBootTest", "TestRestTemplate", "テストピラミッド", "REST API"],
  apiNames: ["org.springframework.boot.test.context.SpringBootTest", "org.springframework.boot.test.web.client.TestRestTemplate", "org.springframework.http.ResponseEntity", "org.springframework.http.HttpStatus"],
  description: "Spring Boot の @SpringBootTest と TestRestTemplate を使った統合テスト・E2E テストの書き方を REST API の CRUD 検証で解説する。",
  lead: "単体テストだけでは拾えない不具合がある。コンポーネント同士の結合部分、HTTP リクエストからレスポンスまでの一連の流れ、データベースとの整合性――こうした層をカバーするのが統合テストと E2E テストの役割です。一方で「テストが遅い」「環境依存で CI が落ちる」という声も現場では少なくありません。この記事では、テストピラミッドの考え方を土台に、Spring Boot の @SpringBootTest と TestRestTemplate を使い、REST API の CRUD エンドポイントを実際に起動して検証する統合テストの書き方を示します。テスト用のポート設定、テストデータの初期化、レスポンスの検証まで、実務で迷いやすいポイントをコード付きで押さえます。",
  useCases: [
    "REST API の CRUD に対してリクエスト送信からレスポンスまで一気通貫で検証する統合テストを整備する",
    "マイクロサービス間の API 呼び出しが正しいステータスコードを返すことを TestRestTemplate で確認する",
    "既存の手動テスト手順を自動化し、CI パイプラインに組み込む",
    "認証フィルタや例外ハンドラを含む HTTP の振る舞いを、アプリ起動込みで確認する",
    "コントローラ、サービス、DB の結線が意図どおり動くかをデプロイ前にまとめて確認する",
  ],
  cautions: [
    "@SpringBootTest はコンテキスト全体を起動するため実行時間が長い。統合テストは必要な範囲に絞る",
    "webEnvironment = RANDOM_PORT を指定しないとポート競合で CI が失敗する",
    "テスト間でDB状態を共有するとフレイキーテストの原因になる。@BeforeEach でデータを初期化する",
    "すべてのテストで @SpringBootTest を使うとテストスイートの実行時間が膨れ上がる",
    "TestRestTemplate はリダイレクトを自動で追わない設定がデフォルト",
    "時刻や外部 API 応答などの不安定要素をそのまま含めると E2E テストが壊れやすい。固定化やスタブ化できる境界を見極める",
    "単体テストで十分確認できる分岐まで統合テストへ持ち込むと、失敗時の原因切り分けが難しくなる",
  ],
  relatedArticleSlugs: ["junit5-basics", "testcontainers-database-test", "test-design-patterns"],
  versionCoverage: {
    java8: "Spring Boot 2.x であれば Java 8 でも @SpringBootTest と TestRestTemplate は利用可能。record が使えないため従来の POJO でレスポンスを受け取る。",
    java17: "record でレスポンス DTO を簡潔に定義できる。Spring Boot 3.x は Java 17 以上を要求する。",
    java21: "Virtual Thread を有効にした Spring Boot 3.2+ でも統合テストの書き方は同様。",
    java8Code: `// Java 8: POJO でレスポンスを受け取る
ResponseEntity<EmployeeResponse> response =
    restTemplate.getForEntity("/api/employees/1", EmployeeResponse.class);
assertEquals(HttpStatus.OK, response.getStatusCode());`,
    java17Code: `// Java 17: record でレスポンス DTO を定義
record EmployeeResponse(Long id, String name, String department) {}
ResponseEntity<EmployeeResponse> response =
    restTemplate.getForEntity("/api/employees/1", EmployeeResponse.class);
assertEquals("田中太郎", response.getBody().name());`,
    java21Code: `// Java 21: Virtual Thread 有効環境でも書き方は同じ
record EmployeeResponse(Long id, String name, String department) {}
var response = restTemplate.getForEntity("/api/employees/1", EmployeeResponse.class);
assertEquals(HttpStatus.OK, response.getStatusCode());`,
  },
  libraryComparison: [
    { name: "TestRestTemplate", whenToUse: "Spring Boot アプリの統合テストで実際に HTTP リクエストを送りたいとき。", tradeoff: "コンテキスト起動が必要で単体テストより遅い。" },
    { name: "MockMvc", whenToUse: "サーバーを起動せずにコントローラ層だけを高速にテストしたいとき。", tradeoff: "フィルタやエラーハンドリングの一部が実際の動作と異なる場合がある。" },
    { name: "REST Assured", whenToUse: "BDD スタイルで API テストを書きたいとき。レスポンスの検証 DSL が充実している。", tradeoff: "外部依存が増える。TestRestTemplate で十分なケースでは過剰。" },
  ],
  faq: [
    { question: "@SpringBootTest と @WebMvcTest はどう使い分けますか。", answer: "コントローラ単体は @WebMvcTest、サービス層やDBを含む一気通貫テストは @SpringBootTest を使います。" },
    { question: "TestRestTemplate と WebTestClient のどちらを使うべきですか。", answer: "Servlet ベースは TestRestTemplate、WebFlux ベースは WebTestClient が適しています。" },
    { question: "統合テストの DB は本番と同じものを使うべきですか。", answer: "CI では H2 や Testcontainers で再現性を確保し、本番同等の検証はステージングで行うのが現実的です。" },
    { question: "E2E テストはどこまで自動化すべきですか。", answer: "主要な業務フローや障害時の復旧動線など、手戻りコストが高い経路を優先するのが現実的です。すべてを UI 経由で自動化すると保守コストが急増します。" },
    { question: "統合テストが遅くなったときは何から見直すべきですか。", answer: "まず @SpringBootTest の件数とスコープを見直します。次に DB 初期化や外部依存の起動コストを確認し、MockMvc や slice test に切り分けられる箇所を減らしていきます。" },
  ],
  codeTitle: "EmployeeApiIntegrationTest.java",
  codeSample: `import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.annotation.DirtiesContext;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class EmployeeApiIntegrationTest {

    @Autowired TestRestTemplate restTemplate;

    record EmployeeResponse(Long id, String name, String department) {}
    record CreateEmployeeRequest(String name, String department) {}

    @Test @DisplayName("登録して取得できること")
    void createAndGet() {
        var req = new CreateEmployeeRequest("田中太郎", "開発部");
        var createRes = restTemplate.postForEntity("/api/employees", req, EmployeeResponse.class);
        assertEquals(HttpStatus.CREATED, createRes.getStatusCode());

        var getRes = restTemplate.getForEntity("/api/employees/" + createRes.getBody().id(), EmployeeResponse.class);
        assertEquals(HttpStatus.OK, getRes.getStatusCode());
        assertEquals("田中太郎", getRes.getBody().name());
    }

    @Test @DisplayName("削除できること")
    void delete() {
        var req = new CreateEmployeeRequest("鈴木一郎", "総務部");
        var created = restTemplate.postForEntity("/api/employees", req, EmployeeResponse.class);

        restTemplate.delete("/api/employees/" + created.getBody().id());
        var getRes = restTemplate.getForEntity("/api/employees/" + created.getBody().id(), String.class);
        assertEquals(HttpStatus.NOT_FOUND, getRes.getStatusCode());
    }

    @Test @DisplayName("存在しない ID は 404")
    void notFound() {
        var res = restTemplate.getForEntity("/api/employees/99999", String.class);
        assertEquals(HttpStatus.NOT_FOUND, res.getStatusCode());
    }
}`,
},
{
  slug: "test-doubles-classification",
  title: "テストダブル5種（Dummy・Stub・Spy・Mock・Fake）の使い分け",
  categorySlug: "testing",
  summary: "Dummy、Stub、Spy、Mock、Fake の定義と使い分けを、通知サービスを題材に Mockito と手動実装の両面から整理する。",
  version: "Java 17",
  tags: ["テストダブル", "Dummy", "Stub", "Spy", "Mock", "Fake", "Mockito", "テスト設計"],
  apiNames: ["org.mockito.Mockito.mock", "org.mockito.Mockito.spy", "org.mockito.Mockito.when", "org.mockito.Mockito.verify", "org.mockito.ArgumentCaptor"],
  description: "テストダブル5種（Dummy・Stub・Spy・Mock・Fake）を通知サービスの実例で定義し、Mockito と手動実装の使い分け基準をコード付きで解説する。",
  lead: "「mock と stub の違いがよく分からない」「Mockito の mock と spy をなんとなく使い分けている」――テストダブルの分類はテスト設計の基礎でありながら、現場では曖昧に扱われがちです。Gerard Meszaros が整理した 5 種のテストダブル（Dummy、Stub、Spy、Mock、Fake）には、それぞれ明確な目的と適用場面があります。この記事では、通知サービス（メール送信・ログ記録）を題材に、5 種のテストダブルをそれぞれ手動実装と Mockito の両方で書き分けます。「このテストではどのテストダブルを使うべきか」の判断基準を、コードで実感できるように整理します。",
  useCases: [
    "メール送信サービスのテストで、実際にメールを送信せずに Mock で呼び出し引数を検証する",
    "外部 API クライアントのテストで Stub を差し込み、ビジネスロジックを検証する",
    "HashMap ベースの Fake リポジトリで CRUD 処理を高速に検証する",
    "ロガーや監査出力の記録だけ確認したい場面で Spy を使い、実際の副作用を避ける",
    "依存先の有無だけを埋めたいケースで Dummy を使い、テストの意図を明確にする",
  ],
  cautions: [
    "Mockito の mock() で未定義のメソッドを呼ぶとデフォルト値（null 等）が返る。NullPointerException の原因になる",
    "spy() は実メソッドを呼ぶため、副作用のあるメソッドには doReturn を使う",
    "verify() の多用はテストを実装に密結合させる。戻り値で検証できるケースでは assertEquals を優先する",
    "Fake の振る舞いが本番と乖離すると信頼性が下がる。定期的に確認するか Testcontainers で補完する",
    "Dummy と Stub を明確に区別せず何でも mock で済ませると、テストの役割分担が見えにくくなる",
    "Fake が便利だからと本番実装の代わりに使い続けると、制約や例外処理の差を見逃しやすい",
  ],
  relatedArticleSlugs: ["mockito-mock-stub-spy", "test-design-patterns", "junit5-basics"],
  versionCoverage: {
    java8: "Mockito 2.x 以降であれば Java 8 でも mock / spy / verify は同様に使える。",
    java17: "record をテストデータや Stub の戻り値に使うことで可読性が上がる。",
    java21: "パターンマッチング for switch でテストダブルの種類に応じた処理分岐を安全に書ける。",
    java8Code: `// Java 8: 無名クラスで Stub を手動実装
NotificationSender stubSender = new NotificationSender() {
    @Override
    public boolean send(String to, String message) { return true; }
};`,
    java17Code: `// Java 17: ラムダで Stub を1行で定義
NotificationSender stubSender = (to, msg) -> true;`,
    java21Code: `// Java 21: パターンマッチングで通知結果を安全に分岐
sealed interface SendResult permits Success, Failure {}
record Success(String messageId) implements SendResult {}
record Failure(String reason) implements SendResult {}
switch (result) {
    case Success s -> assertEquals("MSG-001", s.messageId());
    case Failure f -> fail("送信失敗: " + f.reason());
}`,
  },
  libraryComparison: [
    { name: "Mockito", whenToUse: "テストダブルの定番。when/verify のシンプルな API で学習コストが低い。", tradeoff: "過度にモックを使うとテストが実装に密結合し、リファクタリング時に大量修正が発生する。" },
    { name: "手動実装（Pure Java）", whenToUse: "振る舞いを明示的に制御したいとき。Fake リポジトリなど状態を持つテストダブルに向く。", tradeoff: "テストダブルのクラスが増えて管理コストが上がる。" },
    { name: "EasyMock", whenToUse: "レガシープロジェクトで既に採用されている場合。", tradeoff: "Mockito に比べて記述が冗長。新規で選ぶ理由はほぼない。" },
  ],
  faq: [
    { question: "Stub と Mock の一番の違いは何ですか。", answer: "Stub は固定値を返すだけで呼び出し検証はしません。Mock は verify でメソッドの呼び出しを検証します。" },
    { question: "Fake はどのような場面で使いますか。", answer: "HashMap で CRUD を再現する Fake リポジトリが代表例です。外部依存を排除しつつ状態を持つテストに使います。" },
    { question: "mock と spy の使い分けは。", answer: "mock は白紙の代役で全メソッドがデフォルト値。spy は実オブジェクトを包み一部だけ差し替えたいときに使います。" },
    { question: "Dummy は実務で本当に使いますか。", answer: "はい。今回のテストでは使わない依存を埋めるだけの場面で自然に登場します。名前を付けて意識すると、必要以上に複雑なモックを書かずに済みます。" },
    { question: "手動 Fake と Mockito のどちらを選ぶべきですか。", answer: "状態を持つ簡易リポジトリやインメモリ実装なら手動 Fake が分かりやすいです。呼び出し回数や引数検証が中心なら Mockito の方が短く書けます。" },
  ],
  codeTitle: "NotificationServiceTest.java",
  codeSample: `import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NotificationServiceTest {

    interface NotificationSender { boolean send(String to, String message); }
    interface AuditLogger { void log(String event); }

    record NotificationService(NotificationSender sender, AuditLogger logger) {
        boolean notify(String to, String message) {
            boolean result = sender.send(to, message);
            if (result) logger.log("送信成功: " + to);
            return result;
        }
    }

    @Nested @DisplayName("Dummy: 使われない引数を埋める")
    class DummyTests {
        @Test void dummyLogger() {
            NotificationSender stub = (to, msg) -> true;
            AuditLogger dummy = event -> {};
            assertTrue(new NotificationService(stub, dummy).notify("user@example.com", "テスト"));
        }
    }

    @Nested @DisplayName("Stub: 固定値を返す")
    class StubTests {
        @Test void stubSender() {
            NotificationSender stub = (to, msg) -> true;
            assertTrue(new NotificationService(stub, e -> {}).notify("user@example.com", "お知らせ"));
        }
    }

    @Nested @DisplayName("Spy: 呼び出し記録")
    class SpyTests {
        @Test void manualSpy() {
            List<String> history = new ArrayList<>();
            AuditLogger spy = history::add;
            new NotificationService((to, msg) -> true, spy).notify("user@example.com", "重要連絡");
            assertEquals(1, history.size());
            assertEquals("送信成功: user@example.com", history.get(0));
        }
    }

    @Nested @DisplayName("Mock: 呼び出しを検証")
    class MockTests {
        @Test void mockVerification() {
            var mockSender = mock(NotificationSender.class);
            when(mockSender.send(anyString(), anyString())).thenReturn(true);
            var mockLogger = mock(AuditLogger.class);

            new NotificationService(mockSender, mockLogger).notify("admin@example.com", "障害通知");

            var captor = ArgumentCaptor.forClass(String.class);
            verify(mockSender).send(captor.capture(), eq("障害通知"));
            assertEquals("admin@example.com", captor.getValue());
            verify(mockLogger).log("送信成功: admin@example.com");
        }
    }

    @Nested @DisplayName("Fake: 簡易実装")
    class FakeTests {
        static class FakeSender implements NotificationSender {
            final List<String> sent = new ArrayList<>();
            @Override public boolean send(String to, String msg) { sent.add(to + ":" + msg); return true; }
        }
        @Test void fakeSender() {
            var fake = new FakeSender();
            var svc = new NotificationService(fake, e -> {});
            svc.notify("user@example.com", "レポート");
            svc.notify("mgr@example.com", "承認依頼");
            assertEquals(2, fake.sent.size());
        }
    }
}`,
},
{
  slug: "test-antipatterns",
  title: "テストのアンチパターン6選と改善方法を実例で解説",
  categorySlug: "testing",
  summary: "フレイキーテスト、過剰モック、sleep 待機など、テストコードで陥りやすいアンチパターンの原因と改善方法を Before/After で比較する。",
  version: "Java 17",
  tags: ["アンチパターン", "フレイキーテスト", "テスト設計", "過剰モック", "sleep", "テスト順序依存"],
  apiNames: ["org.junit.jupiter.api.Test", "org.junit.jupiter.api.DisplayName", "org.junit.jupiter.api.BeforeEach", "java.time.Clock", "java.time.Instant", "java.util.concurrent.CountDownLatch"],
  description: "テストのアンチパターン（フレイキーテスト、過剰モック、sleep 待機、魔法の数値など）の原因と改善方法を Before/After コードで解説する。",
  lead: "テストが書かれていても、CI で不定期に落ちる、修正するたびに大量のテストが壊れる、何を検証しているのか読み取れない――こうした症状はテストコードのアンチパターンに起因していることが多いです。フレイキーテストは開発チームのテストへの信頼を損ない、やがて「赤くても無視する」文化を生みます。過剰なモックは実装の内部構造にテストを密結合させます。この記事では、実務で遭遇しやすい 6 つのアンチパターン――フレイキーテスト、テスト間の状態共有、過剰モック、テスト順序依存、sleep による待機、魔法の数値――の原因と改善後のコードを Before/After で対比します。",
  useCases: [
    "CI で不定期に失敗するフレイキーテストを特定し、時刻依存や共有状態の排除で安定化させる",
    "レガシーテストの過剰モックやテスト順序依存を解消して保守性を改善する",
    "テストコードレビューのチェックリストとしてチーム全体の品質を底上げする",
    "sleep 依存の非同期テストを CountDownLatch や Awaitility に置き換えて再現性を上げる",
    "バグ修正のたびに壊れる brittle test を減らし、リファクタリング耐性を上げる",
  ],
  cautions: [
    "Thread.sleep() をテストで使うと環境によってタイミングが変わりフレイキーになる。CountDownLatch 等の同期メカニズムに置き換える",
    "static フィールドでテスト間の状態を共有すると実行順序依存になる。@BeforeEach で独立した状態を構築する",
    "new Date() や LocalDate.now() を直接呼ぶとテストで日付を制御できない。Clock を注入する",
    "アンチパターンの改善は一度にすべて行う必要はない。CI の失敗頻度が高いテストから優先的に修正する",
    "失敗を再現できないまま ignore や retry に逃げると、根本原因が残り続ける。まず揺らぎの要因を見つけることが先",
    "アンチパターンの指摘だけで終えるとチームに残らない。Before/After の具体例と置き換え先をセットで共有する方が定着しやすい",
  ],
  relatedArticleSlugs: ["junit5-basics", "mockito-mock-stub-spy", "test-design-patterns"],
  versionCoverage: {
    java8: "java.time.Clock は Java 8 から利用可能で、テスト時の時刻固定に使える。",
    java17: "record でテストデータを定義すると意図が明確になる。テキストブロックで魔法の文字列を減らせる。",
    java21: "Virtual Thread を使う非同期処理のテストでは従来とは異なるスケジューリング差異に注意。",
    java8Code: `// Java 8: Clock で日付を固定
Clock fixedClock = Clock.fixed(
    Instant.parse("2025-03-31T00:00:00Z"), ZoneId.of("Asia/Tokyo"));
Date fixedNow = Date.from(fixedClock.instant());`,
    java17Code: `// Java 17: Clock 注入 + テキストブロック
Clock fixedClock = Clock.fixed(
    Instant.parse("2025-03-31T00:00:00Z"), ZoneId.of("Asia/Tokyo"));
LocalDate today = LocalDate.now(fixedClock);
assertEquals(LocalDate.of(2025, 3, 31), today);`,
    java21Code: `// Java 21: CountDownLatch + Virtual Thread で同期
var latch = new CountDownLatch(1);
Thread.startVirtualThread(() -> {
    processAsync();
    latch.countDown();
});
assertTrue(latch.await(5, TimeUnit.SECONDS));`,
  },
  libraryComparison: [
    { name: "JUnit 5 + Clock 注入", whenToUse: "時刻依存のテストで外部ライブラリなしに日時を固定できる。", tradeoff: "Clock を受け取る設計にプロダクションコードを変更する必要がある。" },
    { name: "Awaitility", whenToUse: "非同期処理の完了をポーリングで待つテストを宣言的に記述できる。", tradeoff: "依存追加が必要。CountDownLatch で十分な場合はオーバースペック。" },
    { name: "ArchUnit", whenToUse: "循環依存やレイヤー違反などアーキテクチャレベルのアンチパターンを検出したいとき。", tradeoff: "小規模プロジェクトでは費用対効果が見合わない場合がある。" },
  ],
  faq: [
    { question: "フレイキーテストを特定する効率的な方法は。", answer: "CI の過去ログから失敗率の高いテストを集計するのが確実です。@RepeatedTest で再現性を確認する方法もあります。" },
    { question: "過剰モックかどうかの判断基準は。", answer: "テスト1件あたりの when/verify が5個を超えたら見直しの目安です。テスト対象の設計を改善する方が根本的です。" },
    { question: "テストの実行順序を固定すべきですか。", answer: "固定すべきではありません。各テストが独立して動くように設計するのが正しいアプローチです。" },
    { question: "Thread.sleep を完全に禁止すべきですか。", answer: "原則として避けるべきです。外部システムの仕様上どうしても待機が必要な場合でも、できるだけ同期条件やタイムアウト制御に置き換える方が安定します。" },
    { question: "アンチパターン改善はどこから手を付けるべきですか。", answer: "CI 失敗頻度が高いもの、修正時の巻き込みが大きいもの、チームが読みにくいと感じているものから着手するのが効果的です。全件を一度に直そうとしない方が継続できます。" },
  ],
  codeTitle: "TestAntipatternExamples.java",
  codeSample: `import org.junit.jupiter.api.*;
import java.time.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

class TestAntipatternExamples {

    // === 1. 時刻依存の改善 ===
    @Nested @DisplayName("時刻依存")
    class TimeDependency {
        record DeadlineChecker(Clock clock) {
            boolean isOverdue(LocalDate deadline) { return LocalDate.now(clock).isAfter(deadline); }
        }
        @Test @DisplayName("Clock を固定して日付を制御する")
        void goodExample() {
            Clock fixed = Clock.fixed(Instant.parse("2025-04-01T00:00:00Z"), ZoneId.of("Asia/Tokyo"));
            assertTrue(new DeadlineChecker(fixed).isOverdue(LocalDate.of(2025, 3, 31)));
        }
    }

    // === 2. 状態共有の排除 ===
    @Nested @DisplayName("状態共有")
    class SharedState {
        static class Counter { int count; void inc() { count++; } void reset() { count = 0; } }
        private Counter counter;
        @BeforeEach void setUp() { counter = new Counter(); }

        @Test void once() { counter.inc(); assertEquals(1, counter.count); }
        @Test void twice() { counter.inc(); counter.inc(); assertEquals(2, counter.count); }
    }

    // === 3. 魔法の数値の排除 ===
    @Nested @DisplayName("魔法の数値")
    class MagicNumbers {
        record TaxCalc(double rate) { long tax(long price) { return Math.round(price * rate); } }
        @Test @DisplayName("定数で意図を明示")
        void good() {
            final double TAX_RATE = 0.10;
            assertEquals(100L, new TaxCalc(TAX_RATE).tax(1000L));
        }
    }

    // === 4. sleep の排除 ===
    @Nested @DisplayName("sleep 待機")
    class SleepWaiting {
        static class AsyncProc { String result; void run(CountDownLatch l) { new Thread(() -> { result = "done"; l.countDown(); }).start(); } }
        @Test @DisplayName("CountDownLatch で同期")
        void good() throws InterruptedException {
            var proc = new AsyncProc();
            var latch = new CountDownLatch(1);
            proc.run(latch);
            assertTrue(latch.await(5, TimeUnit.SECONDS));
            assertEquals("done", proc.result);
        }
    }
}`,
},
]
