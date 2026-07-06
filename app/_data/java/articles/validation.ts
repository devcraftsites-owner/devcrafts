import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "tax-calculation",
    title: "Java BigDecimal で消費税計算の端数処理を揃える実装方法",
    categorySlug: "validation",
    summary: "税抜・税込の相互変換と、四捨五入 / 切り捨ての扱い。",
    version: "Java 17",
    tags: ["消費税", "BigDecimal", "端数処理"],
    apiNames: ["BigDecimal", "RoundingMode"],
    toolSlug: "tax-calculator",
    description: "Java の BigDecimal で消費税計算を実装し、四捨五入・切り捨てなど端数処理の違いを外部ライブラリ不要の Pure Java で Java 8/17/21 対応で解説する。",
    lead: "消費税計算のバグは、金額が大きくずれるのではなく「1円だけ合わない」形で現れます。明細ごとに税額を切り捨てて合算した金額と、合計に対して一度だけ税率を掛けた金額は一致しないことがあり、経理部門からの「請求書の合計が合わない」という問い合わせの多くはこれが原因です。さらに double で計算していると、そもそも 0.1 を2進数で正確に表現できないため、端数処理以前の段階で誤差が混入します。この記事では、BigDecimal を使った税抜・税込の相互変換を基本に、RoundingMode の選び方、軽減税率（8%）と標準税率（10%）の混在、明細単位か合計単位かという端数処理の設計判断までを整理します。",
    useCases: [
      "販売管理システムで、明細行ごとに税率（8%/10%）を判定して税額を計算し、税率別の小計欄を作る",
      "税込 1,980 円の商品について、経理仕訳用に税抜金額と消費税額を逆算する",
      "見積書の合計欄の端数処理を「明細ごと切り捨て」に統一し、再計算チェックを通す",
    ],
    cautions: [
      "BigDecimal の生成には new BigDecimal(\"0.1\") のように文字列を使うこと。double リテラルは誤差が入る。",
      "端数処理のタイミング（明細ごとか合計か）は取引先との合意に依存する。",
      "税率は法改正で変わる可能性があるため、定数管理を推奨する。",
      "現場では「請求書の合計が明細の税込小計の合算とずれる」という問題が頻発する。明細ごとに切り捨てか、合計に対して一括で端数処理するかを設計段階で決め、テストデータに端数が出るケースを含めておくこと。",
    ],
    relatedArticleSlugs: ["unit-conversion", "percentage-calculation"],
    versionCoverage: {
      java8: "BigDecimal と RoundingMode は Java 8 でもそのまま使える。税込み計算のメソッド化も同じ書き方でできる。",
      java17: "switch 式で商品種別による税率の切り替えが簡潔になる。record で金額と税額をまとめると可読性が上がる。",
      java21: "record で商品情報を型として表現し、明細ごとの税率判定と税込み計算を組み合わせて簡潔に記述できる。",
      java8Code: `// Java 8: 税込み計算（if-else で税率を切り替え）
BigDecimal price = new BigDecimal("1000");
BigDecimal tax = price.multiply(STANDARD_RATE)
    .setScale(0, RoundingMode.DOWN);
BigDecimal total = price.add(tax);
// 税率の切り替えは if-else
BigDecimal rate;
if ("food".equals(itemType)) {
    rate = REDUCED_RATE;
} else {
    rate = STANDARD_RATE;
}`,
      java17Code: `// Java 17: switch 式で税率を切り替え
String itemType = "food";
BigDecimal rate = switch (itemType) {
    case "food", "newspaper" -> REDUCED_RATE;
    default -> STANDARD_RATE;
};
BigDecimal total = calcTaxIncluded(price, rate);`,
      java21Code: `// Java 21: record で商品情報を表現し明細計算
record Item(String name, BigDecimal price,
            boolean isReducedTax) {}
var items = new Item[]{
    new Item("牛乳", new BigDecimal("200"), true),
    new Item("ビール", new BigDecimal("300"), false)
};
for (var item : items) {
    BigDecimal rate = item.isReducedTax()
        ? REDUCED_RATE : STANDARD_RATE;
    BigDecimal total = calcTaxIncluded(
        item.price(), rate);
}`,
    },
    libraryComparison: [
      { name: "標準 API（BigDecimal + RoundingMode）", whenToUse: "消費税計算の端数処理を自分で制御したいとき。依存ゼロで動作し、端数処理方式を明示的に指定できる。", tradeoff: "通貨コードや為替の概念は自前で管理する必要がある。" },
      { name: "JSR 354 (Money API)", whenToUse: "通貨型を厳密に扱いたい場合。多通貨対応が必要な場面。", tradeoff: "標準化されたが JDK に同梱されていないため外部依存が増える。国内の消費税計算だけなら過剰。" },
      { name: "Apache Commons Math", whenToUse: "高精度の数値演算や統計計算が併せて必要な場合。", tradeoff: "消費税計算だけなら BigDecimal で十分。依存に見合うかはプロジェクト規模による。" },
    ],
    faq: [
      { question: "明細ごとと合計とで税額が1円ずれるのはなぜですか？", answer: "切り捨てを行うタイミングが違うためです。どちらが正しいかではなく取引先との合意の問題なので、請求書の端数処理方式を仕様として明文化しておく必要があります。" },
      { question: "double で計算して最後に丸めれば十分ではないですか？", answer: "0.1 や 0.08 は2進数で正確に表現できず、丸める前の値がすでにずれていることがあります。金額は入口から BigDecimal で持つのが安全です。" },
      { question: "税率はコードにどう持たせるべきですか？", answer: "定数化したうえで適用開始日とセットで管理すると、税率改定時に過去日付の取引を正しく再計算できます。改定が見込まれるならマスタテーブル化も有効です。" },
    ],
    codeTitle: "消費税計算ユーティリティ",
    codeSample: `import java.math.BigDecimal;
import java.math.RoundingMode;

public class TaxCalculator {

    private static final BigDecimal STANDARD_RATE =
        new BigDecimal("0.10");
    private static final BigDecimal REDUCED_RATE =
        new BigDecimal("0.08");

    public static BigDecimal withTax(
            BigDecimal price, BigDecimal rate,
            RoundingMode mode) {
        var tax = price.multiply(rate)
            .setScale(0, mode);
        return price.add(tax);
    }

    public static BigDecimal withoutTax(
            BigDecimal priceWithTax, BigDecimal rate,
            RoundingMode mode) {
        return priceWithTax.divide(
            BigDecimal.ONE.add(rate), 0, mode);
    }

    public static void main(String[] args) {
        var price = new BigDecimal("1980");
        System.out.println("税込(10%): "
            + withTax(price, STANDARD_RATE, RoundingMode.FLOOR));
        // → 2178

        // 税込からの逆算: 2178 円 → 税抜 1980 円 に戻る
        System.out.println("税抜: "
            + withoutTax(new BigDecimal("2178"),
                STANDARD_RATE, RoundingMode.FLOOR));
        // → 1980

        // 端数処理のタイミングで合計が変わる例: 335 円 × 3 点（10%）
        var item = new BigDecimal("335");
        var perLine = withTax(item, STANDARD_RATE, RoundingMode.FLOOR)
            .multiply(new BigDecimal("3"));
        var onTotal = withTax(item.multiply(new BigDecimal("3")),
            STANDARD_RATE, RoundingMode.FLOOR);
        System.out.println("明細ごとに切り捨て: " + perLine);  // → 1104
        System.out.println("合計に対して切り捨て: " + onTotal); // → 1105
        // 1 円ずれる。どちらを採用するかは取引先との合意事項
    }
}`,
  },
{
    slug: "percentage-calculation",
    title: "Java BigDecimal で割合・増減率・逆算を安全に実装する",
    categorySlug: "validation",
    summary: "売上比較や KPI 集計でよく使う割合計算の基礎をまとめる。",
    version: "Java 17",
    tags: ["割合", "増減率", "BigDecimal"],
    apiNames: ["BigDecimal", "MathContext"],
    toolSlug: "percentage-calculator",
    description: "Java の BigDecimal で割合計算・増減率・逆算を実装し、業務システムでの精度管理を外部ライブラリ不要の Pure Java で Java 8/17/21 対応で解説する。",
    lead: "「達成率の合計が 100% にならない」「前年比の符号が逆になっている」――割合計算はロジック自体が単純なだけに、こうした指摘が帳票のリリース直前に飛んでくると原因の切り分けに手間取ります。原因の多くは、double の丸め誤差の蓄積か、分母の定義のあいまいさです。前年比なのか前月比なのか、分母がゼロの月をどう扱うのか。計算式より先にここを固めておかないと、実装は何度も手戻りします。この記事では、BigDecimal による割合・増減率・逆算の実装を軸に、MathContext での精度管理、ゼロ除算のガード、表示桁数の統一といった、レポート系機能で毎回問われるポイントを整理します。",
    useCases: [
      "月次売上レポートで前年同月比を算出し、前年実績がゼロの月は「-」表示に振り分ける",
      "KPI ダッシュボードで複数指標の達成率を小数第1位に統一して表示する",
      "「粗利率 35% を確保できる売価」を原価から逆算して見積画面に提示する",
    ],
    cautions: [
      "割り算の結果が割り切れない場合は必ず RoundingMode を指定すること。",
      "パーセント表示は「×100」するタイミングに注意。計算途中で百分率にしない。",
      "ゼロ除算は事前チェックで防ぐ。BigDecimal.ZERO との比較には compareTo を使う。",
      "実務では「前年比」「達成率」など用語ごとに分母が何かを明確にする必要がある。計算ロジックを実装する前に、ビジネス側と定義を合わせておくことで後からの仕様変更を防げる。",
    ],
    relatedArticleSlugs: ["tax-calculation", "unit-conversion"],
    versionCoverage: {
      java8: "BigDecimal と MathContext は Java 8 でもそのまま使える。計算結果は個別の変数で管理する形になる。",
      java17: "var と record で計算結果を構造化できる。コードの意図が型で伝わりやすくなる。",
      java21: "sealed interface + switch 式で計算モード（割合・増減率・逆算）を型安全に分岐でき、モード追加時にコンパイルエラーで漏れを検出できる。",
      java8Code: `// Java 8: 明示的な型宣言で割合計算
BigDecimal part = new BigDecimal("750");
BigDecimal total = new BigDecimal("2500");
BigDecimal ratio = part.divide(total, MC)
    .multiply(new BigDecimal("100"))
    .setScale(1, RoundingMode.HALF_UP);
System.out.println("割合: " + ratio + "%");`,
      java17Code: `// Java 17: var + record で計算結果を構造化
record CalcResult(BigDecimal value, String label) {}
var part = new BigDecimal("750");
var total = new BigDecimal("2500");
var result = new CalcResult(
    percentage(part, total), "売上構成比");
System.out.println(result.label()
    + ": " + result.value() + "%");`,
      java21Code: `// Java 21: sealed interface で計算モードを型安全に
sealed interface CalcMode {
    record Ratio(BigDecimal part, BigDecimal total)
        implements CalcMode {}
    record ChangeRate(BigDecimal prev, BigDecimal curr)
        implements CalcMode {}
    record Reverse(BigDecimal pct, BigDecimal base)
        implements CalcMode {}
}
BigDecimal result = switch (mode) {
    case CalcMode.Ratio r -> percentage(r.part(), r.total());
    case CalcMode.ChangeRate c -> changeRate(c.prev(), c.curr());
    case CalcMode.Reverse v -> v.base().multiply(v.pct())
        .divide(new BigDecimal("100"), MC);
};`,
    },
    libraryComparison: [
      { name: "Apache Commons Math", whenToUse: "統計計算や高度な数値演算が必要な場合。", tradeoff: "割合計算だけなら標準 API で十分。" },
      { name: "Guava（IntMath / DoubleMath）", whenToUse: "オーバーフローチェック付きの整数演算や、丸めモード指定付きの除算を簡潔に書きたいとき。", tradeoff: "BigDecimal ベースの割合計算には直接対応しない。整数演算のユーティリティが中心で、業務系の精度管理には BigDecimal を併用する形になる。" },
    ],
    faq: [
      { question: "前年実績が 0 のとき前年比はどう表示すべきですか？", answer: "数学的には計算不能なので、ゼロ除算ガードで弾いたうえで「-」や「新規」など業務的に意味の通る表示に振り分けます。この表示ルールは仕様として先に決めておきます。" },
      { question: "割合は小数と百分率のどちらで持ち回すべきですか？", answer: "内部では 0.35 のような実数で統一し、×100 は表示の直前だけにするのが安全です。計算途中で百分率に変えると二重掛けのバグが起こりやすくなります。" },
      { question: "MathContext と setScale はどう使い分けますか？", answer: "MathContext は計算途中の有効桁数の確保、setScale は最終表示の小数桁の統一に使います。除算時の ArithmeticException 防止には MathContext が必須です。" },
    ],
    codeTitle: "割合と増減率の計算",
    codeSample: `import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

public class PercentageCalc {

    private static final MathContext MC =
        new MathContext(10, RoundingMode.HALF_UP);

    public static BigDecimal percentage(
            BigDecimal part, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) == 0) {
            throw new ArithmeticException("ゼロ除算");
        }
        return part.divide(total, MC)
            .multiply(new BigDecimal("100"))
            .setScale(1, RoundingMode.HALF_UP);
    }

    public static BigDecimal changeRate(
            BigDecimal previous, BigDecimal current) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            throw new ArithmeticException("ゼロ除算");
        }
        return current.subtract(previous)
            .divide(previous, MC)
            .multiply(new BigDecimal("100"))
            .setScale(1, RoundingMode.HALF_UP);
    }

    public static void main(String[] args) {
        var total = new BigDecimal("2500");
        var part = new BigDecimal("750");
        System.out.println("構成比: " + percentage(part, total) + "%");
        // → 30.0%

        var prev = new BigDecimal("1000");
        var curr = new BigDecimal("1250");
        System.out.println("増減率: " + changeRate(prev, curr) + "%");
        // → 25.0%

        // 減少ケース: 符号はそのままマイナスになる
        System.out.println("増減率: " + changeRate(curr, prev) + "%");
        // → -20.0%（1250 → 1000）

        // 分母ゼロは例外で止め、表示側で業務ルールに振り分ける
        try {
            percentage(part, BigDecimal.ZERO);
        } catch (ArithmeticException e) {
            System.out.println("前年実績なし: -");
        }
    }
}`,
  },
{
    slug: "unit-conversion",
    title: "Java で単位変換を基準単位経由で安全に実装する設計パターン",
    categorySlug: "validation",
    summary: "長さ、重量、温度、速度を変換テーブルで扱う設計パターン。",
    version: "Java 17",
    tags: ["単位変換", "enum", "設計"],
    apiNames: ["enum", "Map<String, BigDecimal>"],
    toolSlug: "unit-converter",
    description: "Java の enum と BigDecimal で単位変換を基準単位経由で実装し、拡張しやすい設計パターンを外部ライブラリ不要で Java 8/17/21 対応で解説する。",
    lead: "単位変換のコードで怖いのは、変換式の誤りよりも「どの単位で値を持っているか」の認識ズレです。DB にはグラムで入っているのに画面はキログラム前提だった、海外仕様書の温度が華氏だったのに摂氏として計算していた――このたぐいの不具合はコンパイルも通り、テストも一見通ってしまうため、発見が遅れがちです。実装面では、N 種類の単位を相互変換しようとして N×N 通りの変換式を書き始めると保守が破綻します。この記事では、enum に基準単位への係数を持たせて「基準単位を経由して変換する」設計パターンを軸に、BigDecimal での係数管理、温度のようにオフセットが絡む単位系の扱い、単位を追加するときの拡張手順を整理します。",
    useCases: [
      "海外倉庫とのデータ連携で、lb 単位で届く重量を kg に揃えて在庫システムへ取り込む",
      "図面管理システムで inch 表記の寸法を mm に変換し、公差計算の基準を統一する",
      "設備モニタリングで華氏で送られてくるセンサー値を摂氏に変換して閾値判定にかける",
    ],
    cautions: [
      "温度変換は単純な係数乗算ではないため、別途ロジックが必要。",
      "BigDecimal で係数を管理しないと浮動小数点誤差が入る。",
      "単位の追加時は enum にフィールドを追加するだけで拡張できる設計にする。",
      "現場では単位の取り違えが原因の不具合が意外と多い。DB や外部 API とのデータ授受では単位を明示するコメントや定数名をつける習慣をつけること。グラムとキログラムの混在は特に見逃しやすい。",
    ],
    relatedArticleSlugs: ["tax-calculation", "percentage-calculation"],
    versionCoverage: {
      java8: "enum に変換係数を持たせる設計は Java 8 でもそのまま使える。変換メソッドは static メソッドで記述する。",
      java17: "record + switch 式で変換ロジックを簡潔に書ける。var による型推論で記述量も減る。",
      java21: "sealed interface で単位系（長さ・重量・温度）を型階層として表現でき、単位系の追加漏れをコンパイル時に検出できる。",
      java8Code: `// Java 8: enum + double で変換係数を管理
enum LengthUnit {
    METER(1.0), CENTIMETER(0.01), INCH(0.0254);
    private final double toMeter;
    LengthUnit(double toMeter) {
        this.toMeter = toMeter;
    }
}
double result = value * from.toMeter / to.toMeter;`,
      java17Code: `// Java 17: record + switch 式で変換ロジック
record Conversion(BigDecimal value, String unit) {}
var result = switch (to) {
    case METER      -> meters;
    case CENTIMETER -> meters.divide(
        CENTIMETER.toMeter, MC);
    case INCH       -> meters.divide(
        INCH.toMeter, MC);
};
var output = new Conversion(result, to.name());`,
      java21Code: `// Java 21: sealed interface で単位系を型安全に表現
sealed interface UnitCategory {
    record Length(LengthUnit unit) implements UnitCategory {}
    record Weight(WeightUnit unit) implements UnitCategory {}
    record Temp(TempUnit unit) implements UnitCategory {}
}
BigDecimal convert(BigDecimal v, UnitCategory cat) {
    return switch (cat) {
        case Length l -> convertLength(v, l.unit());
        case Weight w -> convertWeight(v, w.unit());
        case Temp t   -> convertTemp(v, t.unit());
    };
}`,
    },
    libraryComparison: [
      { name: "JSR 385 (Units of Measurement)", whenToUse: "物理量の型安全な演算が必要な場合。", tradeoff: "外部依存が増える。基本的な変換なら自前で十分。" },
      { name: "自前 enum パターン（標準 API）", whenToUse: "変換対象の単位系が限定的で、係数を enum に持たせるだけで済む場合。依存ゼロで実装でき、拡張も enum 定数の追加だけで完結する。", tradeoff: "温度のようにオフセット変換が必要な単位系では enum の係数方式だけでは対応できず、個別ロジックの追加が必要になる。" },
    ],
    faq: [
      { question: "基準単位方式にすると何が楽になりますか？", answer: "単位を増やすときの修正が「基準単位への係数を1つ追加する」だけで済みます。相互変換式を個別に書く方式では、単位数の2乗のペースで式が増えていきます。" },
      { question: "温度変換も同じ enum 方式で書けますか？", answer: "摂氏・華氏はオフセット（32度）の加減算が入るため、係数の乗除だけでは表現できません。温度だけは専用の変換メソッドに分離するのが素直な設計です。" },
      { question: "変換係数を double で持つと何が起きますか？", answer: "0.0254 のような係数は2進数で誤差を含むため、乗除を繰り返すと下位桁がずれます。検査成績書や請求に関わる値なら BigDecimal で管理してください。" },
    ],
    codeTitle: "基準単位経由の単位変換",
    codeSample: `import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

public class UnitConverter {

    enum LengthUnit {
        METER(BigDecimal.ONE),
        CENTIMETER(new BigDecimal("0.01")),
        MILLIMETER(new BigDecimal("0.001")),
        KILOMETER(new BigDecimal("1000")),
        INCH(new BigDecimal("0.0254")),
        FOOT(new BigDecimal("0.3048"));

        final BigDecimal toMeter;

        LengthUnit(BigDecimal toMeter) {
            this.toMeter = toMeter;
        }
    }

    private static final MathContext MC =
        new MathContext(10, RoundingMode.HALF_UP);

    public static BigDecimal convert(
            BigDecimal value,
            LengthUnit from,
            LengthUnit to) {
        var meters = value.multiply(from.toMeter);
        return meters.divide(to.toMeter, MC);
    }

    public static void main(String[] args) {
        var feet = new BigDecimal("6");
        var cm = convert(feet,
            LengthUnit.FOOT, LengthUnit.CENTIMETER);
        System.out.println(feet + " ft = "
            + cm.setScale(2, RoundingMode.HALF_UP) + " cm");
        // → 6 ft = 182.88 cm

        // 逆変換して元の値に戻ることを確認（往復テストの基本形）
        var back = convert(cm,
            LengthUnit.CENTIMETER, LengthUnit.FOOT);
        System.out.println("往復: "
            + back.setScale(2, RoundingMode.HALF_UP) + " ft");
        // → 6.00 ft

        // 桁の離れた変換も基準単位（メートル）経由なら崩れない
        var mm = new BigDecimal("1500000");
        System.out.println(mm + " mm = "
            + convert(mm, LengthUnit.MILLIMETER, LengthUnit.KILOMETER)
                .setScale(1, RoundingMode.HALF_UP) + " km");
        // → 1500000 mm = 1.5 km
    }
}`,
  },
{
  slug: "input-validation",
  title: "Java 標準 API だけで入力値バリデーションを実装する",
  categorySlug: "validation",
  summary: "数値・メール・日付・電話番号の検証を正規表現と例外制御で組み立て、エラーを集約する実装例。",
  version: "Java 17",
  tags: ["バリデーション", "正規表現", "Pattern", "入力チェック", "エラー集約"],
  apiNames: ["Pattern", "Matcher", "Integer.parseInt", "LocalDate.parse", "String.isBlank"],
  description: "メールアドレス・電話番号・年齢・日付など業務で頻出する入力値の検証を Java 標準 API だけで実装し、エラーを一括で返す方法を Java 8/17/21 対応で解説する。",
  lead: "フォーム入力や CSV 取込でデータを受け取るとき、最初に必要になるのがバリデーションです。「数値として解釈できるか」「メールアドレスの形式は正しいか」「日付として存在するか」――個々のチェックは単純でも、複数フィールドのエラーをまとめて返す、ルールを宣言的に管理する、バージョンごとの書き方の違いに対応する、といった実務上の要件を加えると途端に設計判断が増えます。この記事では、Java 標準 API の正規表現と例外制御を使い、メール・電話番号・年齢・日付のバリデーションを実装します。Java 17 では record でバリデーション結果を型付けし、Java 21 では sealed interface と switch 式でルールを宣言的に管理する書き方も紹介します。Bean Validation（Jakarta Validation）に頼らず、ロジックの中身を自分で把握できる形を目指します。",
  useCases: [
    "社内システムのユーザー登録画面で、名前・メール・年齢・生年月日を一括バリデーションし、全エラーをまとめて画面に返す",
    "CSV ファイル取込時に各行のフィールドを検証し、不正な行をエラーリストとして出力する",
    "API リクエストのパラメータを受け取った時点で形式チェックを行い、不正値は 400 Bad Request として即座に返却する",
  ],
  cautions: [
    "Integer.parseInt は NumberFormatException を投げるが、Long や BigDecimal への変換が必要なケースも業務では多い。数値バリデーションの対象型は仕様から確認すること",
    "メールアドレスの正規表現は RFC 5322 を完全にカバーするものではない。厳密な検証が必要な場合は InternetAddress.validate() を使うか、実際にメールを送って到達確認するのが確実",
    "isBlank() は Java 11 以降のメソッド。Java 8 では trim().isEmpty() で代替する必要がある",
    "LocalDate.parse は存在しない日付（2月30日など）を DateTimeParseException で弾くが、ロケール依存のフォーマット（和暦・スラッシュ区切り）は別途 DateTimeFormatter を用意する必要がある",
    "バリデーションエラーは最初の1件で止めずに、全件を集約して返すのが UX 上望ましい。短絡評価で実装しないよう注意する",
  ],
  relatedArticleSlugs: ["tax-calculation"],
  versionCoverage: {
    java8: "isBlank() が使えないため isEmpty() と trim() を組み合わせる。バリデーション結果は List<String> で返すのが現実的で、record は使えない。",
    java17: "record で ValidationResult を定義し、エラーリストと valid フラグを型で表現できる。isBlank() や var による型推論で記述量が減る。",
    java21: "sealed interface + record でバリデーションルールを型として宣言し、switch 式のパターンマッチングでルール適用を記述できる。ルール追加時のコンパイル安全性が高い。",
    java8Code: `// Java 8: trim().isEmpty() で空白チェック、List で返却
List<String> errors = new ArrayList<>();
if (name == null || name.trim().isEmpty()) {
    errors.add("名前は必須です");
}
// record が使えないためエラーリストをそのまま返す
return errors;`,
    java17Code: `// Java 17: record でバリデーション結果を型付け
record ValidationResult(boolean valid, List<String> errors) {
    static ValidationResult of(List<String> errors) {
        return new ValidationResult(errors.isEmpty(),
                List.copyOf(errors));
    }
}
// isBlank() でスペースのみも検出
if (name == null || name.isBlank()) { ... }`,
    java21Code: `// Java 21: sealed interface でルールを型安全に宣言
sealed interface Rule {
    record Required(String field) implements Rule {}
    record MaxLen(String field, int max) implements Rule {}
    record Regex(String field, Pattern p, String msg)
        implements Rule {}
}
Optional<String> err = switch (rule) {
    case Required r -> value.isBlank()
        ? Optional.of(r.field() + "は必須") : Optional.empty();
    case MaxLen m   -> ...;
    case Regex rx   -> ...;
};`,
  },
  libraryComparison: [
    { name: "標準 API（Pattern + 例外制御）", whenToUse: "バリデーション対象が限定的で、ルールの中身を自分で把握・制御したいとき。依存ゼロで動作する。", tradeoff: "フィールド数やルール数が増えると、手続き的な記述が冗長になりやすい。" },
    { name: "Jakarta Bean Validation（Hibernate Validator）", whenToUse: "アノテーションベースでエンティティのフィールドにルールを宣言的に付与したいとき。Spring との統合が前提の場合。", tradeoff: "依存が増え、カスタムバリデータの実装にはアノテーションプロセッサの知識が必要になる。ルールのデバッグもアノテーション経由になり見通しが下がる場合がある。" },
    { name: "Apache Commons Validator", whenToUse: "メール・URL・クレジットカード番号など汎用的なフォーマットチェックを手早く済ませたいとき。", tradeoff: "日本固有のフォーマット（電話番号・郵便番号）は自前実装が必要。依存に見合うかはプロジェクト規模による。" },
  ],
  faq: [
    { question: "バリデーションエラーは最初の1件で返すべきですか、全件まとめて返すべきですか。", answer: "画面入力やAPI応答では全件まとめて返すのが一般的です。ユーザーが1件ずつ修正して再送信する手間を減らせます。ただし、前提条件の崩壊（認証失敗など）は即座に返すべきです。" },
    { question: "メールアドレスの正規表現はどこまで厳密にすべきですか。", answer: "RFC 5322 を完全にカバーする正規表現は非常に複雑で保守しにくくなります。一般的な形式チェック（@の存在とドメイン部の構造）で十分なケースが多く、最終的にはメール送信による到達確認が確実です。" },
    { question: "Bean Validation と自前実装のどちらを選ぶべきですか。", answer: "Spring Boot や Jakarta EE を使う場合は Bean Validation が自然な選択です。フレームワークに依存しない共通ライブラリや、バリデーションロジックを業務層に閉じたい場合は自前実装のほうが見通しがよくなります。" },
  ],
  codeTitle: "InputValidator.java",
  codeSample: `import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class InputValidator {

    // バリデーション結果（Java 16+ record）
    record ValidationResult(boolean valid, List<String> errors) {
        static ValidationResult of(List<String> errors) {
            return new ValidationResult(errors.isEmpty(), List.copyOf(errors));
        }
    }

    // メールアドレス形式
    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[a-zA-Z0-9._%+\\\\-]+@[a-zA-Z0-9.\\\\-]+\\\\.[a-zA-Z]{2,}$");

    // 日本の電話番号形式
    private static final Pattern PHONE_PATTERN =
        Pattern.compile("^(0[0-9]{1,4}-[0-9]{1,4}-[0-9]{4}|0[0-9]{9,10})$");

    /** 文字列が整数として解釈できるかを判定 */
    public static boolean isInteger(String value) {
        if (value == null || value.isBlank()) return false;
        try {
            Integer.parseInt(value);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /** メールアドレスの形式チェック */
    public static boolean isValidEmail(String email) {
        if (email == null || email.isBlank()) return false;
        return EMAIL_PATTERN.matcher(email).matches();
    }

    /** 電話番号の形式チェック（日本） */
    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.isBlank()) return false;
        return PHONE_PATTERN.matcher(phone).matches();
    }

    /** 日付の形式チェック（ISO yyyy-MM-dd） */
    public static boolean isValidDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return false;
        try {
            LocalDate.parse(dateStr);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    /** 年齢のバリデーション（必須 + 数値 + 範囲） */
    public static List<String> validateAge(String value) {
        var errors = new ArrayList<String>();
        if (value == null || value.isBlank()) {
            errors.add("年齢は必須です");
            return errors;
        }
        try {
            int age = Integer.parseInt(value);
            if (age < 0)   errors.add("年齢は0以上を入力してください");
            if (age > 150)  errors.add("年齢は150以下を入力してください");
        } catch (NumberFormatException e) {
            errors.add("年齢は数値で入力してください");
        }
        return errors;
    }

    /** 複数フィールドをまとめてバリデーション */
    public static ValidationResult validateUserInput(
            String name, String email, String ageStr, String birthDate) {
        var errors = new ArrayList<String>();

        if (name == null || name.isBlank()) {
            errors.add("名前は必須です");
        } else if (name.length() > 50) {
            errors.add("名前は50文字以内で入力してください");
        }

        if (!isValidEmail(email)) {
            errors.add("メールアドレスの形式が正しくありません");
        }

        errors.addAll(validateAge(ageStr));

        if (!isValidDate(birthDate)) {
            errors.add("生年月日は yyyy-MM-dd 形式で入力してください");
        }

        return ValidationResult.of(errors);
    }

    public static void main(String[] args) {
        // エラーケース
        var result = validateUserInput("", "invalid", "abc", "2024-13-01");
        System.out.println("エラー " + result.errors().size() + " 件:");
        result.errors().forEach(e -> System.out.println("  - " + e));

        // 正常ケース
        var ok = validateUserInput("山田太郎", "yamada@example.com", "30", "1994-05-20");
        System.out.println("valid: " + ok.valid());
    }
}`,
},
{
  slug: "email-validation",
  title: "Java でメールアドレスバリデーションを実装する方法と実務の注意点",
  categorySlug: "validation",
  summary: "RFC 準拠の形式チェックからドメイン検証まで、段階的なメールアドレスバリデーションを Pure Java で実装する。",
  version: "Java 17",
  tags: ["メールアドレス", "バリデーション", "RFC 5321", "InternetAddress", "正規表現", "入力検証"],
  apiNames: ["InternetAddress", "Pattern", "Matcher", "InetAddress.getByName"],
  description: "Java でメールアドレスの形式チェック・ドメイン検証・MX レコード確認を段階的に実装する方法を、正規表現と DNS ルックアップで外部ライブラリ不要の Pure Java で Java 8/17/21 対応で解説する。",
  lead: "メールアドレスのバリデーションは、一見すると正規表現ひとつで片付きそうに見えます。しかし実務で扱うと、RFC 5321 の仕様が想像以上に広く、コメント付きアドレスや引用符で囲まれたローカル部など「形式としては正しいが実運用では使われない」パターンが大量に存在します。InternetAddress.validate() は Jakarta Mail 依存であり、しかもコメント付きアドレスを許容するため、そのまま使うとユーザー入力のバリデーションとしては緩すぎるケースがあります。逆に、正規表現を厳密にしすぎると「+」付きアドレスや新しい TLD を弾いてしまい、正当なユーザーの登録を妨げるという問題も起こります。この記事では、形式チェック、ドメイン部の構造検証、MX レコードの存在確認という3段階のアプローチで、実務に適したバリデーションを Pure Java で組み立てます。",
  useCases: [
    "ユーザー登録フォームでメールアドレスの形式と到達可能性を事前チェックする",
    "CSV インポート時にメールアドレス列のデータクレンジングと不正値の検出を行う",
    "メール配信システムで送信前にバウンスリスクの高いアドレスをフィルタリングする",
  ],
  cautions: [
    "InternetAddress.validate() はコメント付きアドレス（例: user(comment)@example.com）を許容するため、ユーザー入力のバリデーションには不向きな場合がある。strict モードでも RFC 822 準拠の範囲で通過する。",
    "正規表現で「+」記号を弾くと、Gmail のエイリアス機能（user+tag@gmail.com）を使っているユーザーが登録できなくなる。意図的に除外する場合は仕様として明記すること。",
    "MX レコードの DNS ルックアップはネットワーク I/O を伴うため、大量のアドレスを一括検証する場合はタイムアウトとスロットリングを設ける必要がある。",
    "国際化ドメイン名（IDN）は Punycode に変換してから検証する必要がある。java.net.IDN.toASCII() で変換できるが、変換失敗時の例外処理を忘れないこと。",
  ],
  relatedArticleSlugs: ["input-validation", "unit-conversion"],
  versionCoverage: {
    java8: "Pattern と Matcher は Java 8 から使用可能。DNS ルックアップも InetAddress で同様に書ける。ただし var が使えないため型宣言が冗長になる。",
    java17: "var による型推論で記述量が減る。record でバリデーション結果を構造化でき、正規表現パターンの可読性も向上する。",
    java21: "API 自体は Java 17 と同一だが、sealed interface でバリデーションレベル（形式のみ・ドメイン検証あり・MX 確認あり）を型として表現し、switch 式で分岐を網羅できる。",
    java8Code: `// Java 8: 明示的な型宣言でバリデーション
Pattern pattern = Pattern.compile(
    "^[a-zA-Z0-9._%+\\\\-]+@[a-zA-Z0-9.\\\\-]+\\\\.[a-zA-Z]{2,}$");
Matcher matcher = pattern.matcher(email);
boolean isValid = matcher.matches();
// 結果は List<String> で返す
List<String> errors = new ArrayList<>();
if (!isValid) {
    errors.add("メールアドレスの形式が不正です");
}`,
    java17Code: `// Java 17: var + record で結果を構造化
record EmailCheckResult(boolean valid, String reason) {}
var pattern = Pattern.compile(
    "^[a-zA-Z0-9._%+\\\\-]+@[a-zA-Z0-9.\\\\-]+\\\\.[a-zA-Z]{2,}$");
var result = pattern.matcher(email).matches()
    ? new EmailCheckResult(true, "")
    : new EmailCheckResult(false, "形式が不正です");`,
    java21Code: `// Java 21: sealed interface でバリデーションレベルを型安全に
sealed interface ValidationLevel {
    record FormatOnly(String email) implements ValidationLevel {}
    record WithDomain(String email) implements ValidationLevel {}
    record WithMx(String email) implements ValidationLevel {}
}
EmailCheckResult check(ValidationLevel level) {
    return switch (level) {
        case FormatOnly f  -> checkFormat(f.email());
        case WithDomain d  -> checkDomain(d.email());
        case WithMx m      -> checkMxRecord(m.email());
    };
}`,
  },
  libraryComparison: [
    { name: "正規表現のみ（Pure Java）", whenToUse: "外部依存ゼロでメールアドレスの基本的な形式チェックを行いたいとき。パターンの内容を自分で把握・調整できる。", tradeoff: "RFC 5321 を完全にカバーする正規表現は非常に複雑になり保守しにくい。実務では「よくある形式を通す」程度の正規表現で十分なケースが多い。" },
    { name: "InternetAddress（Jakarta Mail）", whenToUse: "Jakarta Mail をすでにプロジェクトで使っている場合。validate() でパースエラーを検出できる。", tradeoff: "外部依存（jakarta.mail）が必要。RFC 822 準拠のためコメント付きアドレスやクォート付きローカル部も通過する。ユーザー入力の検証としては緩すぎる場合がある。" },
    { name: "Apache Commons Validator（EmailValidator）", whenToUse: "汎用的なメール形式チェックを手早く済ませたいとき。ローカル部・ドメイン部の長さ制限もチェックしてくれる。", tradeoff: "commons-validator への依存が増える。TLD の許可リストが古い場合があり、新しい TLD（.dev, .app など）を弾く可能性がある。カスタマイズの柔軟性は正規表現のほうが高い。" },
  ],
  faq: [
    { question: "「+」付きアドレス（user+tag@gmail.com）はバリデーションで弾くべきですか？", answer: "Gmail のエイリアス機能で広く使われているため、通常は許可すべきです。正規表現のローカル部に「+」を含めておけば対応できます。" },
    { question: "日本語ドメイン（例: メール@例え.jp）は検証できますか？", answer: "java.net.IDN.toASCII() で Punycode に変換してから通常のドメイン検証を行います。変換に失敗した場合はドメインとして不正と判断できます。" },
    { question: "バリデーションはどこまで厳密にすべきですか？", answer: "形式チェックは「明らかに不正なものを弾く」程度にとどめ、到達確認は実際にメールを送って確認するのが確実です。厳密すぎると正当なアドレスを弾くリスクがあります。" },
  ],
  codeTitle: "段階的メールアドレスバリデーション",
  codeSample: `import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class EmailValidator {

    // バリデーション結果
    record ValidationResult(boolean valid, List<String> errors) {
        static ValidationResult ok() {
            return new ValidationResult(true, List.of());
        }
        static ValidationResult of(List<String> errors) {
            return new ValidationResult(
                errors.isEmpty(), List.copyOf(errors));
        }
    }

    // RFC 5321 の実用的な範囲をカバーする正規表現
    // 「+」付きエイリアス、ハイフン付きドメインを許容
    private static final Pattern EMAIL_PATTERN =
        Pattern.compile(
            "^[a-zA-Z0-9._%+\\\\-]+@[a-zA-Z0-9]"
            + "([a-zA-Z0-9\\\\-]*[a-zA-Z0-9])?"
            + "(\\\\.[a-zA-Z0-9]([a-zA-Z0-9\\\\-]*"
            + "[a-zA-Z0-9])?)*\\\\.[a-zA-Z]{2,}$");

    private static final int MAX_LOCAL_LENGTH = 64;
    private static final int MAX_DOMAIN_LENGTH = 253;
    private static final int MAX_TOTAL_LENGTH = 254;

    /** 第1段階: 形式チェック */
    public static List<String> checkFormat(String email) {
        var errors = new ArrayList<String>();
        if (email == null || email.isBlank()) {
            errors.add("メールアドレスは必須です");
            return errors;
        }
        if (email.length() > MAX_TOTAL_LENGTH) {
            errors.add("メールアドレスは"
                + MAX_TOTAL_LENGTH + "文字以内です");
        }
        var atIndex = email.indexOf('@');
        if (atIndex < 0) {
            errors.add("@ が含まれていません");
            return errors;
        }
        var local = email.substring(0, atIndex);
        var domain = email.substring(atIndex + 1);
        if (local.length() > MAX_LOCAL_LENGTH) {
            errors.add("ローカル部は"
                + MAX_LOCAL_LENGTH + "文字以内です");
        }
        if (domain.length() > MAX_DOMAIN_LENGTH) {
            errors.add("ドメイン部は"
                + MAX_DOMAIN_LENGTH + "文字以内です");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            errors.add("メールアドレスの形式が不正です");
        }
        return errors;
    }

    /** 第2段階: ドメインの DNS 解決チェック */
    public static List<String> checkDomain(String email) {
        var errors = checkFormat(email);
        if (!errors.isEmpty()) {
            return errors;
        }
        var domain = email.substring(
            email.indexOf('@') + 1);
        try {
            InetAddress.getByName(domain);
        } catch (UnknownHostException e) {
            errors.add("ドメイン " + domain
                + " が解決できません");
        }
        return errors;
    }

    /** 第3段階: MX レコードの存在確認 */
    public static List<String> checkMxRecord(
            String email) {
        var errors = checkDomain(email);
        if (!errors.isEmpty()) {
            return errors;
        }
        var domain = email.substring(
            email.indexOf('@') + 1);
        try {
            // JNDI で MX レコードを照会
            var env = new java.util.Hashtable<
                String, String>();
            env.put("java.naming.factory.initial",
                "com.sun.jndi.dns.DnsContextFactory");
            var ctx = new javax.naming.directory
                .InitialDirContext(env);
            var attrs = ctx.getAttributes(
                domain, new String[]{"MX"});
            var mx = attrs.get("MX");
            if (mx == null || mx.size() == 0) {
                errors.add("ドメイン " + domain
                    + " に MX レコードがありません");
            }
            ctx.close();
        } catch (javax.naming.NamingException e) {
            errors.add("MX レコードの照会に失敗: "
                + e.getMessage());
        }
        return errors;
    }

    /** 全段階を実行して結果を返す */
    public static ValidationResult validate(
            String email) {
        return ValidationResult.of(checkMxRecord(email));
    }

    public static void main(String[] args) {
        // 形式チェックのみ
        System.out.println("=== 形式チェック ===");
        var r1 = checkFormat("user+tag@example.com");
        System.out.println("user+tag@example.com -> "
            + (r1.isEmpty() ? "OK" : r1));

        var r2 = checkFormat("invalid@@example");
        System.out.println("invalid@@example -> " + r2);

        // 全段階
        System.out.println("\\n=== 全段階バリデーション ===");
        var result = validate("test@example.com");
        if (result.valid()) {
            System.out.println("バリデーション OK");
        } else {
            result.errors().forEach(e ->
                System.out.println("  - " + e));
        }
    }
}`,
},
]
