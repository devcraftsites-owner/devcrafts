import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
  slug: "enum-basics",
  title: "Java Enum の基本と定数管理への活用方法を実例で解説",
  categorySlug: "enum",
  summary: "Enum の定義、比較、values/valueOf の使い方と switch 文での活用を整理する。",
  version: "Java 17",
  tags: ["Enum", "定数管理", "switch", "values", "valueOf"],
  apiNames: ["Enum", "Enum.values", "Enum.valueOf", "Enum.name", "Enum.ordinal"],
  description: "Java Enum の基本的な定義方法から values・valueOf・name・ordinal の使い分け、switch での分岐パターンまでを Java 8/17/21 対応で解説する。",
  lead: "業務コードで「状態」や「区分」を扱うとき、文字列定数や int 定数を並べて管理しているプロジェクトは少なくありません。しかし定数が増えるほどタイポや比較ミスが入り込みやすくなり、保守コストが静かに膨らんでいきます。Java の Enum はこうした問題に対する標準的な回答で、型安全な定数グループを定義し、switch 文で網羅性チェックまで得られます。Enum の基本的な定義方法から values() による全要素取得、valueOf() による文字列変換、name() と ordinal() の違いと注意点、switch 文・switch 式での分岐パターンまで整理した。Java 8 の従来型 switch と Java 14 以降の switch 式の書き分けも示しながら、現場で迷いやすいポイントを押さえる。",
  useCases: [
    "注文ステータス（未処理・処理中・完了・キャンセル）を Enum で定義し、画面表示やバッチ処理の分岐に使う",
    "曜日や休日種別を Enum にまとめ、勤怠管理システムの休日判定ロジックを型安全に記述する",
    "CSV 取込時に文字列カラムを valueOf で Enum に変換し、不正値を早期に検出する",
  ],
  cautions: [
    "valueOf() に存在しない文字列を渡すと IllegalArgumentException が発生する。外部入力を変換する場合は try-catch か事前チェックが必要",
    "ordinal() の値は定義順に依存するため、DB 保存やシリアライズに使うと定義順の変更でデータが壊れる。永続化には name() か明示的なコード値を使うこと",
    "switch 文で Enum を扱う場合、case ラベルに Enum 名だけを書く（Color.RED ではなく RED）。修飾名を書くとコンパイルエラーになる",
    "Enum の == 比較は equals() と同じ結果を返し、null に対して NullPointerException を起こさない点で == のほうが安全。ただし null チェック自体は省略しないこと",
    "保守案件でよく見かけるのが、ordinal() を DB に保存していてメンバーの追加・削除で意味が変わってしまうケース。設計時に ordinal() を永続化に使わないことをコードレビューで確認すること。",
  ],
  relatedArticleSlugs: ["enum-advanced", "enum-switch-stream"],
  versionCoverage: {
    java8: "switch は文（statement）のみ。case ごとに break が必要で、書き忘れによるフォールスルーバグが起きやすい。var は使えず型を明示する。",
    java17: "switch 式（-> 記法）が使え、break 不要で値を返せる。var による型推論も可能。網羅性チェックがコンパイル時に効く。",
    java21: "switch 式のパターンマッチングで when ガード付き分岐が可能。Enum と組み合わせた条件分岐がより簡潔に書ける。",
    java8Code: `// Java 8: switch 文（break 必須）
OrderStatus status = OrderStatus.PROCESSING;
switch (status) {
    case PENDING:
        System.out.println("注文待ち");
        break;
    case PROCESSING:
        System.out.println("処理中");
        break;
    case COMPLETED:
        System.out.println("完了");
        break;
}`,
    java17Code: `// Java 17: switch 式（-> 記法、break 不要）
var status = OrderStatus.PROCESSING;
String label = switch (status) {
    case PENDING    -> "注文待ち";
    case PROCESSING -> "処理中";
    case COMPLETED  -> "完了";
    case CANCELLED  -> "キャンセル";
};`,
    java21Code: `// Java 21: パターンマッチング switch + EnumSet
var weekdays = EnumSet.range(DayOfWeekJp.MONDAY, DayOfWeekJp.FRIDAY);
var weekends = EnumSet.of(DayOfWeekJp.SATURDAY, DayOfWeekJp.SUNDAY);
for (var entry : statusLabels.entrySet()) {
    System.out.println(entry.getKey() + " → " + entry.getValue());
}`,
  },
  libraryComparison: [
    { name: "標準 Enum", whenToUse: "定数の数が固定的で、型安全な分岐や比較が目的のとき。", tradeoff: "フィールドやメソッドの追加は可能だが、実行時に要素を追加することはできない。" },
    { name: "static final 定数", whenToUse: "ごく少数の値だけで、Enum を定義するほどでもないとき。", tradeoff: "型安全性がなく、switch の網羅性チェックも効かない。定数が増えると管理が破綻しやすい。" },
    { name: "lombok @Getter + Enum", whenToUse: "getter のボイラープレートを減らしたいとき。", tradeoff: "lombok 依存が入る。IDE の補完やリファクタリングとの相性に注意が必要。" },
  ],
  faq: [
    { question: "Enum の比較は == と equals() のどちらを使うべきですか。", answer: "== を使うのが一般的です。Enum はシングルトンが保証されており、== で正しく比較できます。null に対して NullPointerException を起こさない点でも == が安全です。" },
    { question: "Enum に定義できるメソッドの数に制限はありますか。", answer: "言語仕様上の制限はありません。ただし、Enum に過度にロジックを詰め込むと責務が膨らむので、複雑な処理は別クラスに切り出す設計が実務では好まれます。" },
    { question: "valueOf で大文字小文字を無視して変換できますか。", answer: "標準の valueOf は大文字小文字を区別します。大文字小文字を無視したい場合は、入力値を toUpperCase() してから渡すか、独自の fromName メソッドを用意してください。" },
  ],
  codeTitle: "EnumBasicExample.java",
  codeSample: `public class EnumBasicExample {

    // 注文ステータスの Enum
    enum OrderStatus {
        PENDING,    // 未処理
        PROCESSING, // 処理中
        COMPLETED,  // 完了
        CANCELLED;  // キャンセル

        public boolean isTerminal() {
            return this == COMPLETED || this == CANCELLED;
        }
    }

    public static void main(String[] args) {
        // 基本操作: name(), ordinal(), values(), valueOf()
        var status = OrderStatus.PROCESSING;
        System.out.println("名前: " + status.name());       // PROCESSING
        System.out.println("順序: " + status.ordinal());     // 1

        // values() で全要素を取得
        for (var s : OrderStatus.values()) {
            System.out.println(s.name() + " (ordinal=" + s.ordinal() + ")");
        }

        // valueOf() で文字列から変換
        var fromStr = OrderStatus.valueOf("COMPLETED");
        System.out.println("文字列から変換: " + fromStr);

        // == で比較（equals() より安全）
        System.out.println(status == OrderStatus.PROCESSING); // true

        // switch 式で分岐（Java 14+）
        String label = switch (status) {
            case PENDING    -> "注文待ち";
            case PROCESSING -> "処理中";
            case COMPLETED  -> "完了";
            case CANCELLED  -> "キャンセル";
        };
        System.out.println("ステータス: " + label);
        System.out.println("終端状態: " + status.isTerminal()); // false
    }
}`,
},
{
  slug: "enum-advanced",
  title: "Java Enum にフィールドとメソッドを持たせる設計と実装",
  categorySlug: "enum",
  summary: "コード値・表示名・振る舞いを Enum に持たせ、業務区分を型安全に表現する。",
  version: "Java 17",
  tags: ["Enum", "コード値", "ファクトリメソッド", "fromCode", "区分値"],
  apiNames: ["Enum", "Arrays.stream", "Stream.filter", "Optional.orElseThrow"],
  description: "Java Enum にフィールド・コンストラクタ・ファクトリメソッドを持たせ、DB コード値や画面表示名を一元管理する設計を Java 8/17/21 対応で解説する。",
  lead: "業務システムでは支払方法、取引区分、税率といった「コード値とラベルの対応表」が頻繁に登場します。これをデータベースのマスタテーブルに持たせるか、定数クラスに並べるか、Enum に集約するかは設計上の判断ですが、値の追加漏れやラベルの不整合に強いのは Enum です。この記事では、Enum にフィールド（コード値・表示名・フラグ）とコンストラクタを持たせる基本形から、コード値による逆引きファクトリメソッド fromCode の実装、abstract メソッドと switch 式による振る舞いの切り替えまでを扱います。Java 8 では for ループと abstract メソッドで書いていた処理が、Java 17 では Stream と switch 式でどう簡潔になるかを対比しながら、実務で使える設計パターンを整理します。",
  useCases: [
    "支払方法（クレジット・振込・電子マネー・現金）の DB コード値と画面表示名を Enum で一元管理し、コード値からの逆引きを fromCode メソッドで行う",
    "税率区分（標準10%・軽減8%）を Enum に持たせ、金額に対する税込計算を apply メソッドとして実装する",
    "返金対応可否などの業務フラグを Enum フィールドに持たせ、Stream の filter で対象区分だけを抽出する",
  ],
  cautions: [
    "Enum のコンストラクタは暗黙的に private であり、public/protected を指定するとコンパイルエラーになる。外部からのインスタンス生成は不可",
    "fromCode のような逆引きメソッドで一致しない値が来た場合の挙動を明確にすること。Optional を返すか例外を投げるかは呼び出し元の性質で決める",
    "abstract メソッドを使う場合、全要素にオーバーライドが必須。要素を追加したときに実装漏れがあるとコンパイルエラーになるため安全だが、要素が多いとコード量が膨らむ",
    "Stream で values() を毎回走査する fromCode は要素数が少ない前提の実装。要素が数十を超える場合は static Map で事前にインデックスを作るほうが効率的",
  ],
  relatedArticleSlugs: ["enum-basics", "enum-financial"],
  versionCoverage: {
    java8: "逆引きは for ループで実装。振る舞いの切り替えは abstract メソッド + 各要素でのオーバーライドが定番。コード量は多くなるが明快。",
    java17: "fromCode を Arrays.stream + filter + findFirst で宣言的に書ける。振る舞いの切り替えも switch 式で簡潔に記述でき、abstract メソッドが不要になる。",
    java21: "パターンマッチング switch で Enum を Object 型の引数として受け取り、when ガード付きで条件分岐できる。API の柔軟性が向上する。",
    java8Code: `// Java 8: for ループによる逆引き
public static PaymentMethod fromCode(int code) {
    for (PaymentMethod pm : values()) {
        if (pm.code == code) {
            return pm;
        }
    }
    throw new IllegalArgumentException(
        "不明な支払方法コード: " + code);
}`,
    java17Code: `// Java 17: Stream による逆引き
public static PaymentMethod fromCode(int code) {
    return Arrays.stream(values())
        .filter(pm -> pm.code == code)
        .findFirst()
        .orElseThrow(() ->
            new IllegalArgumentException(
                "不明な支払方法コード: " + code));
}`,
    java21Code: `// Java 21: パターンマッチング switch（when ガード付き）
static String describePayment(Object obj) {
    return switch (obj) {
        case PaymentMethod p when p.supportsRefund()
            -> p.getDisplayName() + "（返金可）";
        case PaymentMethod p
            -> p.getDisplayName() + "（返金不可）";
        default -> "不明な支払方法";
    };
}`,
  },
  libraryComparison: [
    { name: "標準 Enum（フィールド + fromCode）", whenToUse: "コード値・ラベルの対応が固定的で、コンパイル時に全量が確定しているとき。", tradeoff: "要素の追加はコード変更＋再デプロイが必要。動的な区分管理には向かない。" },
    { name: "DB マスタテーブル", whenToUse: "区分値の追加・変更を再デプロイなしで行いたいとき。", tradeoff: "型安全性がなく、switch の網羅性チェックも効かない。キャッシュ戦略も検討が必要。" },
    { name: "MapStruct / ModelMapper", whenToUse: "Enum とDTO 間の変換が大量にあるとき。", tradeoff: "ライブラリ依存が増え、マッピング定義の管理コストが発生する。少量なら手書きで十分。" },
  ],
  faq: [
    { question: "fromCode は static Map でキャッシュすべきですか。", answer: "要素が十数個程度なら values() の線形探索で実用上問題ありません。数十以上あるなら static Map<Integer, PaymentMethod> を static ブロックで構築するほうが効率的です。" },
    { question: "Enum にフィールドを後から追加しても互換性は保たれますか。", answer: "Java ソースレベルでは問題ありません。ただし name() でシリアライズしている場合、要素名の変更は非互換になります。フィールド追加は安全ですが、要素のリネームは慎重に。" },
    { question: "abstract メソッドと switch 式はどちらを選ぶべきですか。", answer: "Java 14 以降なら switch 式が簡潔です。abstract メソッドは要素ごとに長いロジックがある場合に向きます。短い分岐なら switch 式、複雑な処理なら abstract が目安です。" },
  ],
  codeTitle: "EnumAdvancedExample.java",
  codeSample: `import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class EnumAdvancedExample {

    // フィールドとメソッドを持つ Enum（支払方法）
    enum PaymentMethod {
        CREDIT(1, "クレジットカード", true),
        BANK_TRANSFER(2, "銀行振込", false),
        E_MONEY(3, "電子マネー", true),
        CASH(4, "現金", false);

        private final int code;
        private final String displayName;
        private final boolean supportsRefund;

        PaymentMethod(int code, String displayName, boolean supportsRefund) {
            this.code = code;
            this.displayName = displayName;
            this.supportsRefund = supportsRefund;
        }

        public int getCode() { return code; }
        public String getDisplayName() { return displayName; }
        public boolean supportsRefund() { return supportsRefund; }

        // コード値から Enum に変換するファクトリメソッド
        public static PaymentMethod fromCode(int code) {
            return Arrays.stream(values())
                .filter(pm -> pm.code == code)
                .findFirst()
                .orElseThrow(() ->
                    new IllegalArgumentException("不明な支払方法コード: " + code));
        }
    }

    // switch 式で振る舞いを切り替える（Java 14+）
    enum TaxRate {
        STANDARD, REDUCED;

        public double apply(double price) {
            return switch (this) {
                case STANDARD -> price * 1.10;
                case REDUCED  -> price * 1.08;
            };
        }
    }

    public static void main(String[] args) {
        // コード値からの逆引き
        var pm = PaymentMethod.fromCode(2);
        System.out.println("code=2 → " + pm.getDisplayName());

        // 税込計算
        System.out.printf("標準: %.0f 円%n", TaxRate.STANDARD.apply(1000.0));
        System.out.printf("軽減: %.0f 円%n", TaxRate.REDUCED.apply(1000.0));

        // Stream で返金可能な支払方法だけを抽出
        List<PaymentMethod> refundable = Arrays.stream(PaymentMethod.values())
            .filter(PaymentMethod::supportsRefund)
            .collect(Collectors.toList());
        refundable.forEach(p ->
            System.out.println("返金可: " + p.getDisplayName()));
    }
}`,
},
{
  slug: "enum-financial",
  title: "Java Enum で業務区分と状態遷移を実装する方法と設計例",
  categorySlug: "enum",
  summary: "支払方法・注文ステータス・取引種別を Enum で表現し、状態遷移バリデーションを組み込む。",
  version: "Java 17",
  tags: ["Enum", "状態遷移", "業務区分", "バリデーション", "金融"],
  apiNames: ["Enum", "Arrays.stream", "Stream.filter"],
  description: "支払方法・注文ステータス・取引種別の業務区分を Enum で表現し、状態遷移の可否判定を switch 式で実装するパターンを Java 8/17/21 対応で解説する。",
  lead: "業務システムにおいて「注文は処理中からキャンセルに遷移できるが、完了からは戻せない」といった状態遷移ルールは、仕様書には書かれていてもコード上では if 文の羅列になりがちです。遷移の可否判定が散在すると、条件の追加や変更でバグが入り込みやすくなります。Enum の canTransitionTo メソッドとして遷移ルールを集約すれば、「どの状態からどの状態へ遷移できるか」が一箇所で把握でき、テストも書きやすくなります。この記事では、支払方法のコード値管理、注文ステータスの状態遷移バリデーション、取引種別の借方・貸方分類という3つの業務パターンを Enum で実装します。Java 8 の if-else チェーンと Java 17 の switch 式の違いを対比しながら、業務ロジックを Enum に閉じ込める設計の利点と注意点を整理します。",
  useCases: [
    "受注管理画面で注文ステータスの遷移ボタンを表示する際、canTransitionTo で遷移可能な次ステータスだけを選択肢として出す",
    "経理システムで取引種別（購入・返金・振替・調整）ごとに借方・貸方を自動判定し、仕訳データを生成する",
    "決済 API のレスポンスに含まれる支払方法コードを fromCode で Enum に変換し、後続の業務処理に型安全に渡す",
  ],
  cautions: [
    "状態遷移の canTransitionTo は Enum 側に書くが、実際の遷移実行（DB 更新）はサービス層で行う。Enum は判定だけに留め、副作用を持たせないこと",
    "switch 式で全ケースを列挙する場合、default を書かないほうが要素追加時にコンパイルエラーで検出できる。安易に default を入れると新要素の考慮漏れが隠れる",
    "終端状態（COMPLETED, CANCELLED）から遷移しようとした場合に false を返すか例外を投げるかは業務要件で決める。false を返す設計のほうが呼び出し側の制御が柔軟になる",
    "コード値に String を使う場合、equals での比較が必須。== で比較すると intern されていない文字列で不一致になる",
  ],
  relatedArticleSlugs: ["enum-advanced", "enum-serialize"],
  versionCoverage: {
    java8: "状態遷移の判定は if-else チェーンで記述。コード値の逆引きも for ループが基本。全体的に冗長だが、ロジックは追いやすい。",
    java17: "switch 式で遷移可否を1行ずつ宣言的に記述でき、複数ケースのグルーピング（case A, B -> ...）で終端状態の扱いも簡潔になる。",
    java21: "パターンマッチング switch で Enum のフィールド値に応じた条件分岐を when ガードで記述できる。複合条件の表現力が向上する。",
    java8Code: `// Java 8: if-else で遷移可否を判定
public boolean canTransitionTo(OrderStatus next) {
    if (this == PENDING) {
        return next == PROCESSING || next == CANCELLED;
    }
    if (this == PROCESSING) {
        return next == COMPLETED || next == CANCELLED;
    }
    return false; // 終端状態
}`,
    java17Code: `// Java 17: switch 式で宣言的に記述
public boolean canTransitionTo(OrderStatus next) {
    return switch (this) {
        case PENDING    -> next == PROCESSING || next == CANCELLED;
        case PROCESSING -> next == COMPLETED  || next == CANCELLED;
        case COMPLETED, CANCELLED -> false;
    };
}`,
    java21Code: `// Java 21: パターンマッチング switch で支払方法を説明
static String describePayment(PaymentMethod method) {
    return switch (method) {
        case CREDIT        -> "クレジットカード（手数料なし）";
        case BANK_TRANSFER -> "銀行振込（入金確認後に処理）";
        case E_MONEY       -> "電子マネー（即時決済）";
        case CASH          -> "現金（店頭のみ対応）";
    };
}`,
  },
  libraryComparison: [
    { name: "標準 Enum（状態遷移メソッド）", whenToUse: "状態の種類が固定的で、遷移ルールがコンパイル時に確定しているとき。", tradeoff: "遷移ルールの変更にはコード修正と再デプロイが必要。動的なワークフロー定義には不向き。" },
    { name: "Spring Statemachine", whenToUse: "状態遷移が複雑で、イベント駆動のワークフローが必要なとき。", tradeoff: "学習コストとライブラリ依存が大きい。単純な遷移判定だけなら過剰。" },
    { name: "DB テーブルによる遷移マトリクス", whenToUse: "遷移ルールを運用中に変更したい、または権限別に遷移可否を制御したいとき。", tradeoff: "コンパイル時チェックが効かず、不整合の検出がテストまで遅延する。" },
  ],
  faq: [
    { question: "状態遷移のテストはどう書くべきですか。", answer: "全状態 x 全状態のマトリクスをテストするのが確実です。ParameterizedTest で「現在の状態、次の状態、期待結果」の組み合わせを網羅すると漏れを防げます。" },
    { question: "Enum の要素を追加したとき、switch 式は修正が必要ですか。", answer: "default を書いていなければコンパイルエラーになるので、修正箇所を自動検出できます。これが Enum + switch 式の大きな利点です。" },
    { question: "状態遷移のログはどこで出すべきですか。", answer: "Enum の canTransitionTo 内ではなく、サービス層で遷移を実行する箇所でログを出すのが適切です。Enum は純粋な判定に徹させ、副作用を持たせない設計を推奨します。" },
  ],
  codeTitle: "EnumFinancialExample.java",
  codeSample: `import java.util.Arrays;

public class EnumFinancialExample {

    // 支払方法: コード値とラベルを持つ Enum
    enum PaymentMethod {
        CREDIT("01", "クレジットカード"),
        BANK_TRANSFER("02", "銀行振込"),
        E_MONEY("03", "電子マネー"),
        CASH("04", "現金");

        private final String code;
        private final String label;

        PaymentMethod(String code, String label) {
            this.code = code;
            this.label = label;
        }

        public String getCode() { return code; }
        public String getLabel() { return label; }

        public static PaymentMethod fromCode(String code) {
            return Arrays.stream(values())
                .filter(m -> m.code.equals(code))
                .findFirst()
                .orElseThrow(() ->
                    new IllegalArgumentException("不明な支払コード: " + code));
        }
    }

    // 注文ステータス: 状態遷移バリデーション付き
    enum OrderStatus {
        PENDING("受付中"),
        PROCESSING("処理中"),
        COMPLETED("完了"),
        CANCELLED("キャンセル");

        private final String label;

        OrderStatus(String label) { this.label = label; }
        public String getLabel() { return label; }

        // switch 式で遷移可否を判定
        public boolean canTransitionTo(OrderStatus next) {
            return switch (this) {
                case PENDING    -> next == PROCESSING || next == CANCELLED;
                case PROCESSING -> next == COMPLETED  || next == CANCELLED;
                case COMPLETED, CANCELLED -> false;
            };
        }
    }

    // 取引種別: 借方・貸方の分類
    enum TransactionType {
        PURCHASE("PUR", "購入", true),
        REFUND("REF", "返金", false),
        TRANSFER("TRF", "振替", true),
        ADJUSTMENT("ADJ", "調整", false);

        private final String code;
        private final String label;
        private final boolean debitSide;

        TransactionType(String code, String label, boolean debitSide) {
            this.code = code;
            this.label = label;
            this.debitSide = debitSide;
        }

        public String getCode() { return code; }
        public String getLabel() { return label; }
        public boolean isDebitSide() { return debitSide; }
    }

    public static void main(String[] args) {
        // コード値からの逆引き
        var method = PaymentMethod.fromCode("02");
        System.out.println("支払方法: " + method.getLabel());

        // 状態遷移バリデーション
        var status = OrderStatus.PENDING;
        if (status.canTransitionTo(OrderStatus.PROCESSING)) {
            status = OrderStatus.PROCESSING;
            System.out.println("→ " + status.getLabel());
        }
        // 完了後は遷移不可
        var completed = OrderStatus.COMPLETED;
        System.out.println("完了→処理中: "
            + completed.canTransitionTo(OrderStatus.PROCESSING)); // false

        // 取引種別の表示
        for (var type : TransactionType.values()) {
            System.out.printf("code=%s label=%s debit=%b%n",
                type.getCode(), type.getLabel(), type.isDebitSide());
        }
    }
}`,
},
{
  slug: "enum-serialize",
  title: "Java Enum の永続化で ordinal を使ってはいけない理由",
  categorySlug: "enum",
  summary: "ordinal の危険性と、明示的コード値による安全な永続化パターンを解説する。",
  version: "Java 17",
  tags: ["Enum", "シリアライズ", "永続化", "ordinal", "DB保存"],
  apiNames: ["Enum", "Enum.name", "Enum.ordinal", "Enum.valueOf", "Arrays.stream"],
  description: "Enum の ordinal を DB 保存に使う危険性を示し、明示的なコード値と fromDbCode メソッドによる安全な永続化パターンを Java 8/17/21 対応で解説する。",
  lead: "Enum を DB カラムや JSON フィールドに保存する場面は業務システムで頻繁に発生します。このとき ordinal() をそのまま整数カラムに入れるコードを見かけることがありますが、これは Enum の定義順を変更しただけで既存データが壊れるという重大なリスクを抱えています。name() による保存は ordinal よりは安全ですが、要素名のリファクタリングで非互換が生じます。もっとも堅牢なのは、Enum に明示的なコード値フィールドを持たせ、そのコード値で保存・復元する方法です。この記事では、ordinal がなぜ危険なのかを具体例で示したうえで、明示的コード値 + fromDbCode メソッドによる永続化パターンを実装します。Java 標準のシリアライズにおける Enum のシングルトン保証についても触れ、DB 保存・JSON 変換・Java シリアライズそれぞれの注意点を整理します。",
  useCases: [
    "注文ステータスを DB の VARCHAR カラムに保存する際、ordinal ではなく明示的なコード値（PEND, PROC 等）を使って安全に永続化する",
    "REST API のレスポンス JSON に Enum のコード値を含める際、name() ではなく業務で定義されたコード値を返すよう設計する",
    "既存テーブルの数値コードカラムと Enum を対応づける fromDbCode メソッドを実装し、DAO 層での変換を一元化する",
  ],
  cautions: [
    "ordinal() は定義順に連動するため、要素の挿入・並び替えで過去データとの対応が壊れる。本番データが入った後では修正コストが非常に大きい",
    "name() による保存は要素名の変更（リネーム）で非互換になる。ただし ordinal よりは安全なので、コード値設計の余裕がない場合は name() を選ぶ",
    "fromDbCode で一致しないコードが来た場合は IllegalArgumentException を投げるのが基本。null や空文字の入力も考慮すること",
    "Java 標準のシリアライズ（ObjectOutputStream）では Enum はシングルトンが保証されるが、Enum フィールドの追加・削除は serialVersionUID に影響しない点に注意",
  ],
  relatedArticleSlugs: ["enum-financial", "enum-advanced"],
  versionCoverage: {
    java8: "fromDbCode は for ループで実装。Order クラスは通常のクラスとして定義し、serialVersionUID を明示する。",
    java17: "fromDbCode を Arrays.stream で簡潔に書ける。record を使って Order を定義すれば、equals/hashCode/toString が自動生成される。",
    java21: "パターンマッチング switch で型ごとに JSON 値のシリアライズ形式を切り替えるなど、柔軟な永続化パターンが書ける。",
    java8Code: `// Java 8: for ループで逆引き
public static OrderStatus fromDbCode(String code) {
    for (OrderStatus s : values()) {
        if (s.dbCode.equals(code)) {
            return s;
        }
    }
    throw new IllegalArgumentException(
        "不明なコード: " + code);
}`,
    java17Code: `// Java 17: Stream + record で簡潔に
public static OrderStatus fromDbCode(String code) {
    return Arrays.stream(values())
        .filter(s -> s.dbCode.equals(code))
        .findFirst()
        .orElseThrow(() ->
            new IllegalArgumentException("不明なコード: " + code));
}
record Order(String orderId, OrderStatus status)
    implements Serializable { }`,
    java21Code: `// Java 21: パターンマッチング switch で型別シリアライズ
static String toJsonValue(Object obj) {
    return switch (obj) {
        case OrderStatus s -> "\\"" + s.getDbCode() + "\\"";
        case String str    -> "\\"" + str + "\\"";
        case Integer i     -> String.valueOf(i);
        default            -> "null";
    };
}`,
  },
  libraryComparison: [
    { name: "標準 Enum（明示的コード値）", whenToUse: "DB カラムや JSON に保存する値を完全に制御したいとき。外部ライブラリ不要で最も安全。", tradeoff: "逆引きメソッドを自前で書く必要がある。要素が多い場合は static Map でインデックスを作る工夫が要る。" },
    { name: "Jackson @JsonValue / @JsonCreator", whenToUse: "JSON 変換を Jackson に任せている場合に、Enum のシリアライズ形式をアノテーションで指定したいとき。", tradeoff: "Jackson 依存が前提。純粋な JDBC 保存には適用されないため、DB 永続化は別途対応が必要。" },
    { name: "JPA @Enumerated", whenToUse: "JPA エンティティで Enum カラムを扱うとき。EnumType.STRING なら name() で保存される。", tradeoff: "EnumType.ORDINAL はデフォルトで危険。STRING でも要素リネームに弱い。明示的コード値を使う場合は AttributeConverter が必要。" },
  ],
  faq: [
    { question: "name() と明示的コード値のどちらで保存すべきですか。", answer: "明示的コード値が最も安全です。name() はリファクタリングに弱く、ordinal は定義順変更に弱い。業務で使うコード体系がすでにある場合はそれを Enum に持たせてください。" },
    { question: "Enum をデシリアライズしたとき == で比較しても大丈夫ですか。", answer: "Java 標準シリアライズでは Enum のシングルトンが保証されるため、デシリアライズ後も == で正しく比較できます。ただし JSON からの変換は valueOf を経由するので同様に安全です。" },
    { question: "既存の ordinal 保存をコード値保存に移行するにはどうすればよいですか。", answer: "移行バッチで既存データの ordinal をコード値に変換し、カラム型を変更します。Enum の定義順を絶対に変えないまま移行を完了させてください。移行完了まで定義順の凍結が必要です。" },
  ],
  codeTitle: "EnumSerializeExample.java",
  codeSample: `import java.util.Arrays;

public class EnumSerializeExample {

    // 明示的なコード値で永続化する Enum
    enum OrderStatus {
        PENDING("PEND"),
        PROCESSING("PROC"),
        COMPLETED("COMP"),
        CANCELLED("CANC");

        private final String dbCode;

        OrderStatus(String dbCode) {
            this.dbCode = dbCode;
        }

        public String getDbCode() { return dbCode; }

        // コード値から Enum に復元
        public static OrderStatus fromDbCode(String code) {
            return Arrays.stream(values())
                .filter(s -> s.dbCode.equals(code))
                .findFirst()
                .orElseThrow(() ->
                    new IllegalArgumentException("不明なコード: " + code));
        }
    }

    // record でデータクラスを定義（Java 16+）
    record Order(String orderId, OrderStatus status) {
        @Override
        public String toString() {
            return "Order{id='" + orderId + "', status="
                + status + "('" + status.getDbCode() + "')}";
        }
    }

    public static void main(String[] args) {
        // DB 保存イメージ: Enum → コード値
        var status = OrderStatus.PROCESSING;
        var dbValue = status.getDbCode(); // "PROC"
        System.out.println("DB保存値: " + dbValue);

        // DB 読込イメージ: コード値 → Enum
        var restored = OrderStatus.fromDbCode(dbValue);
        System.out.println("DB復元: " + restored);

        // name() による保存（ordinal より安全だがリネームに弱い）
        var nameValue = status.name(); // "PROCESSING"
        var byName = OrderStatus.valueOf(nameValue);
        System.out.println("name() → valueOf(): " + byName);

        // ordinal の危険性: 定義順を変えると壊れる
        for (var s : OrderStatus.values()) {
            System.out.println(s.name()
                + " ordinal=" + s.ordinal()
                + " dbCode=" + s.getDbCode());
        }

        // record と組み合わせた使用例
        var order = new Order("ORD-001", OrderStatus.COMPLETED);
        System.out.println(order);
    }
}`,
},
{
  slug: "enum-switch-stream",
  title: "Java Enum と switch・Stream・EnumSet の組み合わせ",
  categorySlug: "enum",
  summary: "switch 式での分岐、Stream でのフィルタリング、EnumSet/EnumMap の活用パターンを整理する。",
  version: "Java 17",
  tags: ["Enum", "switch式", "Stream", "EnumSet", "EnumMap"],
  apiNames: ["EnumSet", "EnumMap", "Arrays.stream", "Stream.filter", "Stream.collect"],
  description: "Enum を switch 式・Stream API・EnumSet・EnumMap と組み合わせて使う実務パターンを Java 8/17/21 対応で解説する。",
  lead: "Enum は定義して switch で分岐するだけでなく、EnumSet や EnumMap といった専用コレクション、Stream API との組み合わせで真価を発揮します。たとえば「平日だけの曜日セット」を EnumSet.range で一発で作れますし、「優先度ごとのタスク一覧」を EnumMap で管理すれば定義順のソートが自動で手に入ります。しかし Java 8 の switch 文と Java 14 以降の switch 式では書き方が大きく変わり、Stream の書き方にも差があるため、プロジェクトの Java バージョンに合わせた書き分けが必要です。この記事では、switch 文から switch 式への移行パターン、Stream で Enum をフィルタリング・変換する方法、EnumSet と EnumMap の使いどころを整理します。Java 21 のパターンマッチング switch で when ガードを使った条件分岐も含め、バージョンごとの書き方を対比します。",
  useCases: [
    "勤怠システムで EnumSet.range(MONDAY, FRIDAY) を平日セットとして定義し、打刻日が平日かどうかを contains で判定する",
    "タスク管理ツールで EnumMap<Priority, List<Task>> を使い、優先度順に自動ソートされたタスク一覧を構築する",
    "Stream で Enum.values() をフィルタリングし、特定条件に合致する区分値だけを画面のプルダウン選択肢として返す",
  ],
  cautions: [
    "Java 8 の switch 文では break の書き忘れでフォールスルーが起きる。Java 14 以降の -> 記法なら break 不要でこの問題を回避できる",
    "EnumSet.range は定義順の連続した範囲を取る。途中に要素が挿入されると範囲が変わるため、要素の定義順には注意を払うこと",
    "EnumMap は Enum の定義順でエントリが並ぶ。表示順を定義順と一致させる設計にしておくと、別途ソートが不要になる",
    "Arrays.stream(Enum.values()) は呼び出すたびに配列コピーが発生する。ループ内で繰り返し呼ぶ場合は事前にローカル変数にキャッシュする",
    "Java 21 のパターンマッチング switch で when ガードを使う場合、ガード条件の評価順に注意。具体的なケースを先に書かないと到達不能コードになる",
  ],
  relatedArticleSlugs: ["enum-basics", "enum-advanced"],
  versionCoverage: {
    java8: "switch は文（statement）のみで break 必須。EnumSet・EnumMap は利用可能だが、Stream との組み合わせは for ループが主流。",
    java17: "switch 式（-> 記法）で値を返せる。Stream + filter + collect で宣言的なフィルタリングが可能。var で型推論も利用可。",
    java21: "パターンマッチング switch で when ガード付きの条件分岐が可能。Enum のメソッド呼び出し結果に基づく動的な分岐が簡潔に書ける。",
    java8Code: `// Java 8: switch 文（break 必須）+ for ループ
Day day = Day.WEDNESDAY;
String type;
switch (day) {
    case MONDAY: case TUESDAY: case WEDNESDAY:
    case THURSDAY: case FRIDAY:
        type = "平日";
        break;
    default:
        type = "休日";
}
// フィルタリングも for ループ
for (Day d : Day.values()) {
    if (d.isWeekend()) {
        System.out.println(d);
    }
}`,
    java17Code: `// Java 17: switch 式 + Stream
var day = Day.WEDNESDAY;
String type = switch (day) {
    case MONDAY, TUESDAY, WEDNESDAY,
         THURSDAY, FRIDAY -> "平日";
    case SATURDAY, SUNDAY -> "休日";
};
// Stream でフィルタリング
List<Day> weekendDays = Arrays.stream(Day.values())
    .filter(Day::isWeekend)
    .collect(Collectors.toList());`,
    java21Code: `// Java 21: パターンマッチング switch（when ガード付き）
static String describeDay(Day day) {
    return switch (day) {
        case Day d when d.isWeekend() -> d + "（週末）";
        case Day d -> d + "（平日）";
    };
}`,
  },
  libraryComparison: [
    { name: "標準 API（EnumSet + EnumMap + Stream）", whenToUse: "Enum の分類・フィルタリング・マッピングを標準 API だけで完結させたいとき。", tradeoff: "コレクション操作の組み合わせが多いと可読性が下がることがある。適度にメソッド分割を行う。" },
    { name: "Guava Sets / Maps", whenToUse: "EnumSet の差集合・交差集合など集合演算を多用するとき。", tradeoff: "Guava 依存が入る。EnumSet 自体が十分高速なので、集合演算だけのために導入するのは過剰な場合が多い。" },
    { name: "Eclipse Collections", whenToUse: "Enum に限らず、コレクション操作全般を高性能な API で統一したいとき。", tradeoff: "学習コストとライブラリサイズが大きい。Enum 専用の用途なら標準 EnumSet/EnumMap で十分。" },
  ],
  faq: [
    { question: "EnumSet と HashSet のどちらを使うべきですか。", answer: "Enum をキーにする場合は常に EnumSet を選んでください。内部がビットフラグで実装されており、HashSet より高速かつ省メモリです。" },
    { question: "EnumMap のエントリ順は保証されますか。", answer: "はい。EnumMap は Enum の定義順（ordinal 順）でエントリが並びます。表示順を Enum の定義順と合わせておけば、別途ソートは不要です。" },
    { question: "switch 式で default を書くべきですか。", answer: "Enum を網羅する switch 式では default を書かないほうが安全です。要素追加時にコンパイルエラーで検出できるため、考慮漏れを防げます。" },
  ],
  codeTitle: "EnumSwitchStreamExample.java",
  codeSample: `import java.util.Arrays;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Collectors;

public class EnumSwitchStreamExample {

    enum Day {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY,
        SATURDAY, SUNDAY;

        public boolean isWeekend() {
            return this == SATURDAY || this == SUNDAY;
        }
    }

    enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL;
    }

    public static void main(String[] args) {
        // switch 式で曜日を分類（Java 14+）
        var day = Day.WEDNESDAY;
        String type = switch (day) {
            case MONDAY, TUESDAY, WEDNESDAY,
                 THURSDAY, FRIDAY -> "平日";
            case SATURDAY, SUNDAY -> "休日";
        };
        System.out.println(day + " は " + type);

        // EnumSet: 平日と週末を定義
        var weekdays = EnumSet.range(Day.MONDAY, Day.FRIDAY);
        var weekend  = EnumSet.of(Day.SATURDAY, Day.SUNDAY);
        System.out.println("平日: " + weekdays);
        System.out.println("週末: " + weekend);

        // Stream で週末の曜日をフィルタリング
        List<Day> weekendDays = Arrays.stream(Day.values())
            .filter(Day::isWeekend)
            .collect(Collectors.toList());
        weekendDays.forEach(d ->
            System.out.println("週末: " + d));

        // EnumMap: 優先度ごとのタスク一覧
        var taskMap = new EnumMap<Priority, List<String>>(
            Priority.class);
        taskMap.put(Priority.HIGH,
            List.of("サーバー障害対応"));
        taskMap.put(Priority.MEDIUM,
            List.of("定例ミーティング"));
        taskMap.put(Priority.LOW,
            List.of("ドキュメント更新"));

        // EnumMap は定義順で自動ソートされる
        System.out.println("\\n=== タスク一覧（優先度順）===");
        for (var entry : taskMap.entrySet()) {
            entry.getValue().forEach(task ->
                System.out.println(
                    "[" + entry.getKey() + "] " + task));
        }
    }
}`,
},
]
