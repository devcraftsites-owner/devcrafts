import type { JavaArticleDetail } from "../types"

export const articles: JavaArticleDetail[] = [
{
    slug: "localdate-business-days",
    title: "Java LocalDate で営業日を数える実装と業務活用パターン",
    categorySlug: "dates",
    summary: "土日祝除外、締日スライド、業務ルールを LocalDate で扱う実装例。",
    version: "Java 17",
    tags: ["営業日", "LocalDate", "締日"],
    apiNames: ["LocalDate", "ChronoUnit.DAYS.between"],
    toolSlug: "business-days",
    description: "Java 標準 API の LocalDate で営業日計算を実装する方法を、土日祝の除外・締日スライドなど業務ルール込みで Java 8/17/21 対応で解説する。",
    lead: "営業日の計算は、請求書の支払期日、納品日の算出、月次バッチのスケジュール管理など、業務システムで頻繁に必要になる処理です。Java 8 以降の LocalDate API を使えば、土日と祝日を除外しながら営業日を加減算するロジックを外部ライブラリなしで組み立てられます。この記事では、祝日リストとの突き合わせ、締日のスライド処理、月末営業日の判定といった実務で求められるパターンを整理し、再利用しやすいメソッドとして実装します。",
    useCases: [
      "請求書の支払期日を「発行日から5営業日後」として自動算出する",
      "月次バッチの実行日を「毎月最終営業日」に設定する",
      "納品予定日を土日祝を除いた営業日ベースで算出する",
    ],
    cautions: [
      "祝日リストは年ごとに更新が必要。振替休日の判定ルールも考慮すること。",
      "会社独自の休業日がある場合は、祝日リストに追加する仕組みが必要。",
      "年末年始やお盆休みは祝日ではないため、別途ルールとして管理する。",
    ],
    relatedArticleSlugs: ["japan-holiday-list", "holiday-check", "date-provider"],
    versionCoverage: {
      java8: "LocalDate で基本的な営業日計算は可能。Set の初期化に Arrays.asList + HashSet が必要。",
      java17: "Stream.iterate + datesUntil で営業日の抽出をストリームベースに記述できる。var で型宣言が簡潔になる。",
      java21: "基本は Java 17 と同じ。sealed interface で営業日判定ルール（祝日・会社休日・曜日）を型安全に定義し、switch パターンマッチングで判定ロジックを整理できる。",
      java8Code: `// Java 8: while ループで1日ずつ加算して判定
LocalDate date = from;
int count = 0;
while (count < n) {
    date = date.plusDays(1);
    if (isBusinessDay(date, holidays)) {
        count++;
    }
}
return date;`,
      java17Code: `// Java 17: Stream.iterate で営業日をフィルタ抽出
return Stream.iterate(from.plusDays(1), d -> d.plusDays(1))
    .filter(d -> isBusinessDay(d, holidays))
    .limit(n)
    .reduce((first, last) -> last)
    .orElseThrow();`,
      java21Code: `// Java 21: switch 式で日付の種別を判定
String msg = switch (date.getDayOfWeek()) {
    case SATURDAY, SUNDAY -> "週末";
    default -> holidays.contains(date)
        ? "祝日" : "営業日";
};`,
    },
    libraryComparison: [
      { name: "Joda-Time", whenToUse: "Java 7 以前の保守案件で使用。", tradeoff: "Java 8 以降は標準 API で代替可能。" },
      { name: "ThreeTen-Extra", whenToUse: "営業日計算やカスタムカレンダーが必要な場合。", tradeoff: "依存が増える。Pure Java の DayOfWeek + 祝日リストで十分なケースが多い。" },
    ],
    faq: [
      { question: "祝日リストはどこから取得すればよいですか？", answer: "内閣府のCSVデータを年次で取り込むか、自前の定数テーブルで管理する方法が一般的です。祝日は法改正で変わるため、外部ソースからの定期取り込みが確実です。" },
      { question: "土曜を営業日に含めたい場合はどうしますか？", answer: "除外判定のDayOfWeekリストからSATURDAYを外すだけで対応できます。判定条件を外部設定にしておくと業種ごとの切り替えも容易です。" },
      { question: "営業日計算の精度を確認するテスト方法は？", answer: "祝日が連続する年末年始やGWの期間で境界値テストを行うのが効果的です。祝日と土日が重なるケースが最もずれやすいためです。" },
    ],
    codeTitle: "営業日を加算するメソッド",
    codeSample: `import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public class BusinessDayCalculator {

    private static final Set<DayOfWeek> WEEKENDS =
        Set.of(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);

    public static LocalDate addBusinessDays(
            LocalDate start, int days, List<LocalDate> holidays) {
        var current = start;
        var remaining = days;
        while (remaining > 0) {
            current = current.plusDays(1);
            if (!WEEKENDS.contains(current.getDayOfWeek())
                    && !holidays.contains(current)) {
                remaining--;
            }
        }
        return current;
    }

    public static void main(String[] args) {
        var holidays = List.of(
            LocalDate.of(2025, 1, 1),
            LocalDate.of(2025, 1, 13)
        );
        var start = LocalDate.of(2025, 1, 10);
        var result = addBusinessDays(start, 3, holidays);
        System.out.println(start + " から 3 営業日後: " + result);
    }
}`,
  },
{
    slug: "japan-holiday-list",
    title: "Java で日本の祝日一覧を扱いやすい日付リストに変換する方法",
    categorySlug: "dates",
    summary: "営業日ロジックへ流用しやすい yyyy-mm-dd 形式の出力を整える。",
    version: "Java 17",
    tags: ["祝日", "日付配列", "実務"],
    apiNames: ["LocalDate", "List<String>"],
    toolSlug: "japan-holidays",
    description: "Java 標準 API で日本の祝日一覧を管理し、営業日ロジックに流用しやすい日付リストとして扱う方法を外部ライブラリ不要で Java 8/17/21 対応で解説する。",
    lead: "営業日計算や帳票の日付処理で、日本の祝日を判定する必要は頻繁に生じます。しかし Java 標準 API には祝日カレンダーが含まれていないため、自前でリストを管理するか、外部データを取り込む仕組みが必要です。祝日法は改正されることがあり、春分の日・秋分の日は天文計算に基づくため、ハードコードだけでは運用が回らない場面も出てきます。この記事では、祝日データを定数リストとして管理しつつ、年ごとの更新を容易にする構成を紹介します。振替休日の自動算出ルールや、春分・秋分の近似計算、営業日ロジックへの接続方法も含め、実務でそのまま使える形に整えます。",
    useCases: [
      "年度ごとの祝日マスタを CSV から読み込み、営業日判定に使う",
      "帳票の出力日が祝日に当たる場合に前営業日にスライドさせる",
      "カレンダー表示で祝日に色を付ける処理のデータソースにする",
    ],
    cautions: [
      "春分の日・秋分の日は天文計算に基づくため、数年先の日付は暫定値になる。",
      "祝日法の改正で祝日が追加・変更される可能性がある。",
      "振替休日は「祝日が日曜に当たった場合、翌月曜が休日」というルール。",
    ],
    relatedArticleSlugs: ["localdate-business-days"],
    versionCoverage: {
      java8: "LocalDate で祝日リストの管理は可能。Set の初期化に Arrays.asList + HashSet を使う。振替休日の判定ロジックは同じ。",
      java17: "Set.of() でイミュータブルな祝日セットを簡潔に初期化できる。var と toList() で記述量が減る。",
      java21: "sealed interface で祝日の種別（固定祝日・天文計算・振替休日・国民の休日）を型安全に表現し、switch パターンマッチングで分岐できる。",
      java8Code: `// Java 8: Arrays.asList + HashSet で祝日セットを初期化
Set<LocalDate> holidays = new HashSet<>(Arrays.asList(
    LocalDate.of(2024, 1, 1),
    LocalDate.of(2024, 1, 8),
    LocalDate.of(2024, 2, 11)
));
// 振替休日の判定: if 文で分岐
for (LocalDate holiday : holidays) {
    if (holiday.getDayOfWeek() == DayOfWeek.SUNDAY) {
        // 翌月曜を振替休日として追加
    }
}`,
      java17Code: `// Java 17: Set.of() + var + Set.copyOf で簡潔に
var base = Set.of(
    LocalDate.of(2024, 1, 1),
    LocalDate.of(2024, 1, 8)
);
// 振替休日を追加してイミュータブルな Set を返す
var result = new TreeSet<>(base);
// ... 振替休日の追加処理 ...
return Set.copyOf(result);`,
      java21Code: `// Java 21: sealed interface で祝日種別を型安全に表現
sealed interface HolidayType {
    record Fixed(String name)   implements HolidayType {}
    record Equinox(String name) implements HolidayType {}
    record Substitute()         implements HolidayType {}
    record CitizensHoliday()    implements HolidayType {}
}
String desc = switch (type) {
    case Fixed(var name)   -> "固定祝日: " + name;
    case Equinox(var name) -> "天文計算: " + name;
    case Substitute()      -> "振替休日";
    case CitizensHoliday() -> "国民の休日";
};`,
    },
    libraryComparison: [
      { name: "標準 API（LocalDate + Set）", whenToUse: "祝日データを自前で管理し、振替休日・国民の休日のルールもコードで表現したいとき。依存ゼロで動作する。", tradeoff: "祝日データの年次更新や春分・秋分の計算は自前で行う必要がある。" },
      { name: "ICU4J JapaneseCalendar", whenToUse: "国際化対応で和暦・祝日を扱う場合。", tradeoff: "JAR サイズが大きく（約11MB）、祝日の独自定義は別途必要。" },
      { name: "Jollyday", whenToUse: "各国の祝日データをライブラリに委ねたいとき。", tradeoff: "日本の法改正への追従が遅れる場合がある。会社休業日は結局自前で追加が必要。" },
    ],
    faq: [
      { question: "祝日データは毎年手動で更新するのですか？", answer: "内閣府の公開CSVを年初に取り込むバッチを組むのが現実的です。閣議決定で祝日が追加・移動されるため、自動取得の仕組みがあると安心です。" },
      { question: "振替休日を自動判定できますか？", answer: "祝日が日曜なら翌月曜を振替休日とするルールをコードで表現できます。国民の祝日に関する法律第3条に基づく判定ロジックを実装します。" },
      { question: "祝日リストをDBで管理すべきですか？", answer: "更新頻度が年1回程度なら定数管理で十分です。複数サービスで共有する場合や頻繁な変更がある場合はDB管理を検討します。" },
    ],
    codeTitle: "祝日一覧を LocalDate リストで管理する",
    codeSample: `import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;

public class JapanHolidays {

    // 固定日の祝日
    public static List<LocalDate> getFixedHolidays(int year) {
        return List.of(
            LocalDate.of(year, Month.JANUARY, 1),   // 元日
            LocalDate.of(year, Month.FEBRUARY, 11),  // 建国記念の日
            LocalDate.of(year, Month.FEBRUARY, 23),  // 天皇誕生日
            LocalDate.of(year, Month.APRIL, 29),     // 昭和の日
            LocalDate.of(year, Month.MAY, 3),        // 憲法記念日
            LocalDate.of(year, Month.MAY, 4),        // みどりの日
            LocalDate.of(year, Month.MAY, 5),        // こどもの日
            LocalDate.of(year, Month.AUGUST, 11),    // 山の日
            LocalDate.of(year, Month.NOVEMBER, 3),   // 文化の日
            LocalDate.of(year, Month.NOVEMBER, 23)   // 勤労感謝の日
        );
    }

    // 第 n 月曜日を返す（Happy Monday 制度）
    public static LocalDate nthMonday(int year, Month month, int n) {
        var first = LocalDate.of(year, month, 1);
        var offset = (DayOfWeek.MONDAY.getValue()
            - first.getDayOfWeek().getValue() + 7) % 7;
        return first.plusDays(offset + 7L * (n - 1));
    }

    // 固定日 + Happy Monday 祝日を結合
    public static List<LocalDate> getHolidays(int year) {
        var holidays = new ArrayList<>(getFixedHolidays(year));
        holidays.add(nthMonday(year, Month.JANUARY, 2));   // 成人の日
        holidays.add(nthMonday(year, Month.JULY, 3));       // 海の日
        holidays.add(nthMonday(year, Month.SEPTEMBER, 3));  // 敬老の日
        holidays.add(nthMonday(year, Month.OCTOBER, 2));    // スポーツの日
        // 春分・秋分の近似計算、振替休日は省略
        // 完全な実装は japan-holidays ツールを参照
        holidays.sort(LocalDate::compareTo);
        return holidays;
    }

    public static void main(String[] args) {
        var holidays = getHolidays(2025);
        holidays.forEach(h ->
            System.out.println(h + " (" + h.getDayOfWeek() + ")")
        );
    }
}`,
  },
{
    slug: "wareki-conversion",
    title: "Java で和暦と西暦を相互変換し元号境界を安全に扱う実装方法",
    categorySlug: "dates",
    summary: "令和・平成の境界日、略号、帳票入力を見据えた変換ロジック。",
    version: "Java 21",
    tags: ["和暦", "元号", "帳票"],
    apiNames: ["JapaneseDate", "DateTimeFormatter"],
    toolSlug: "wareki",
    description: "Java 標準 API の JapaneseDate と DateTimeFormatter で和暦・西暦の相互変換を実装し、元号境界の安全な処理を Java 8/17/21 対応で解説する。",
    lead: "和暦変換は帳票出力や公文書対応で避けて通れない処理です。Java には JapaneseChronology が標準で用意されており、外部ライブラリなしで和暦と西暦の変換ができます。ただし、元号境界（平成から令和の 2019/5/1 など）のエッジケースや、フォーマット文字列の落とし穴があるため、ロジック設計には注意が必要です。この記事では、JapaneseDate と DateTimeFormatter を使った変換の基本から、境界日の安全な処理、帳票向けの書式設定までを整理します。",
    useCases: [
      "帳票の日付欄を「令和○年○月○日」形式で出力する",
      "ユーザーが入力した和暦日付を西暦の LocalDate に変換して DB に保存する",
      "元号をまたぐ期間計算（平成30年〜令和2年は何年間か）を行う",
    ],
    cautions: [
      "JapaneseDate は明治6年（1873年）以降しか扱えない。",
      "元号の境界日を正しく扱うため、JapaneseChronology.INSTANCE を使うこと。",
      "DateTimeFormatter の和暦パターンはロケール依存のため、Locale.JAPAN を明示する。",
    ],
    relatedArticleSlugs: ["localdate-business-days"],
    versionCoverage: {
      java8: "JapaneseDate は Java 8 から使用可能。ただし令和の元号は Java 8u221 以降、Java 11.0.3 以降、または Java 12.0.1 以降で対応。",
      java17: "令和に完全対応。switch 式で元号略称の分岐が簡潔に書ける。record との組み合わせで変換結果を型安全に返せる。",
      java21: "sealed interface で元号を型安全に表現し、パターンマッチング switch で元号ごとの処理を網羅的に記述できる。",
      java8Code: `// Java 8: if-else で元号略称を分岐
char era = Character.toUpperCase(abbrev.charAt(0));
int japYear = Integer.parseInt(abbrev.substring(1));
if (era == 'R') {
    return REIWA_BASE + japYear;
} else if (era == 'H') {
    return HEISEI_BASE + japYear;
} else if (era == 'S') {
    return SHOWA_BASE + japYear;
} else {
    throw new IllegalArgumentException("不明な元号");
}`,
      java17Code: `// Java 17: switch 式で元号略称を分岐
int base = switch (era) {
    case 'R' -> REIWA_BASE;
    case 'H' -> HEISEI_BASE;
    case 'S' -> SHOWA_BASE;
    case 'T' -> TAISHO_BASE;
    default  -> throw new IllegalArgumentException(
        "不明な元号略称: " + era);
};
return base + japYear;`,
      java21Code: `// Java 21: sealed interface + pattern matching で元号を型安全に
sealed interface Era permits Era.Reiwa, Era.Heisei,
        Era.Showa, Era.Taisho {
    record Reiwa(int year)  implements Era {}
    record Heisei(int year) implements Era {}
    record Showa(int year)  implements Era {}
    record Taisho(int year) implements Era {}
}
String text = switch (era) {
    case Era.Reiwa r  -> "令和" + r.year() + "年";
    case Era.Heisei h -> "平成" + h.year() + "年";
    case Era.Showa s  -> "昭和" + s.year() + "年";
    case Era.Taisho t -> "大正" + t.year() + "年";
};`,
    },
    libraryComparison: [
      { name: "標準 API（JapaneseDate + DateTimeFormatter）", whenToUse: "和暦変換だけが必要で依存を増やしたくないとき。JDK のアップデートで新元号にも自動対応する。", tradeoff: "明治6年以前は扱えない。フォーマットパターンの指定にはロケールの知識が必要。" },
      { name: "ICU4J", whenToUse: "より高度な国際化や暦体系が必要な場合。", tradeoff: "JAR サイズが大きく（約11MB）、和暦変換だけなら標準 API で十分。" },
    ],
    faq: [
      { question: "令和以外の新しい元号が追加された場合はどうなりますか？", answer: "JDK のアップデートで新元号が追加されるため、JDK のバージョンを上げれば自動対応します。元号データは CLDR に含まれており、パッチリリースで配信されます。" },
      { question: "和暦の表示で「元年」と表示するにはどうしますか？", answer: "DateTimeFormatter で FULL スタイルを使えば、1年目は自動的に「元年」と表示されます。" },
      { question: "明治以前の日付を和暦で扱えますか？", answer: "JapaneseDate は明治6年以降のみ対応です。それ以前は旧暦との対応が必要になるため、自前のロジックが必要です。" },
    ],
    codeTitle: "和暦と西暦を相互変換するユーティリティ",
    codeSample: `import java.time.LocalDate;
import java.time.chrono.JapaneseDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class WarekiConverter {

    private static final DateTimeFormatter WAREKI_FMT =
        DateTimeFormatter.ofPattern("GGGGy年M月d日", Locale.JAPAN);

    public static String toWareki(LocalDate date) {
        var jpDate = JapaneseDate.from(date);
        return WAREKI_FMT.format(jpDate);
    }

    public static LocalDate fromWareki(String wareki) {
        var jpDate = JapaneseDate.from(
            WAREKI_FMT.parse(wareki));
        return LocalDate.from(jpDate);
    }

    public static void main(String[] args) {
        var today = LocalDate.of(2025, 3, 15);
        System.out.println(today + " → " + toWareki(today));

        var parsed = fromWareki("令和7年3月15日");
        System.out.println("令和7年3月15日 → " + parsed);
    }
}`,
  },
{
    slug: "timezone-conversion",
    title: "Java ZonedDateTime でタイムゾーン差を比較する実装",
    categorySlug: "dates",
    summary: "JST / UTC / EST の時差確認と、保存時刻のズレ防止を扱う。",
    version: "Java 21",
    tags: ["タイムゾーン", "UTC", "ZonedDateTime"],
    apiNames: ["ZonedDateTime", "ZoneId"],
    toolSlug: "timezone",
    description: "Java 標準 API の ZonedDateTime でタイムゾーン間の時差比較と、保存時刻のズレ防止策を外部ライブラリ不要の Pure Java で Java 8/17/21 対応で解説する。",
    lead: "海外拠点との連携やクラウドサービスとの通信で、タイムゾーンの扱いは避けて通れません。Java 8 以降の ZonedDateTime と ZoneId を使えば、JST / UTC / EST などの時差変換を安全に行えます。ただし、サマータイムの切り替わりタイミングや、DB への保存形式の選び方を間違えると、1 時間のズレや日付の食い違いが本番で発生します。この記事では、タイムゾーン変換の基本操作から、サマータイムが絡むエッジケースの扱い、UTC で統一して保存する設計パターンまでを整理します。",
    useCases: [
      "海外拠点のシステムとデータ連携する際に UTC で統一して保存する",
      "ユーザーのタイムゾーンに合わせて表示時刻を変換する",
      "ログのタイムスタンプを複数のタイムゾーンで比較する",
    ],
    cautions: [
      "DB には UTC で保存し、表示時にユーザーのタイムゾーンに変換するのが安全。",
      "サマータイムの切り替え時に時刻が重複・欠落する場合がある。",
      "ZoneId.of() に不正な文字列を渡すと DateTimeException が発生する。",
    ],
    relatedArticleSlugs: ["localdate-business-days"],
    versionCoverage: {
      java8: "ZonedDateTime は Java 8 から使用可能。withZoneSameInstant でタイムゾーン変換ができる。",
      java17: "基本的な使い方は Java 8 と同じ。switch 式で出力フォーマットの切り替えが簡潔に書ける。",
      java21: "IANA タイムゾーンデータベースの更新が反映される。switch 式のパターンマッチングでタイムゾーン別のラベル表示などを簡潔に分岐できる。",
      java8Code: `// Java 8: ZonedDateTime でタイムゾーン変換
ZonedDateTime jstNow = ZonedDateTime.now(
    ZoneId.of("Asia/Tokyo"));
ZonedDateTime utcNow = jstNow.withZoneSameInstant(
    ZoneId.of("UTC"));
// OffsetDateTime で固定オフセット
OffsetDateTime jstOffset = OffsetDateTime.now(
    ZoneOffset.of("+09:00"));
// ISO 8601 フォーマット
DateTimeFormatter iso =
    DateTimeFormatter.ISO_OFFSET_DATE_TIME;
System.out.println(jstOffset.format(iso));`,
      java17Code: `// Java 17: switch 式で税率切り替えと同様の書き方
var now = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
// DB保存は UTC、表示は JST パターン
String dbValue = now.withZoneSameInstant(ZoneId.of("UTC"))
    .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
// 取得時に表示用へ変換
var fromDb = ZonedDateTime.parse(dbValue);
String display = fromDb
    .withZoneSameInstant(ZoneId.of("Asia/Tokyo"))
    .format(DateTimeFormatter
        .ofPattern("yyyy/MM/dd HH:mm"));`,
      java21Code: `// Java 21: switch 式でタイムゾーン別ラベルを分岐
String zone = "Asia/Tokyo";
String label = switch (zone) {
    case "Asia/Tokyo"      -> "日本標準時（JST）";
    case "UTC"             -> "協定世界時（UTC）";
    case "America/New_York" -> "東部時間（ET）";
    default -> zone;
};`,
    },
    libraryComparison: [
      { name: "Joda-Time", whenToUse: "Java 7 以前の保守案件。", tradeoff: "Java 8 以降は標準 API で十分。" },
      { name: "ThreeTen-Extra", whenToUse: "追加の時間量型や Interval が必要な場合。", tradeoff: "標準の ZonedDateTime で大半のケースは十分。" },
    ],
    faq: [
      { question: "タイムゾーンの一覧はどうやって取得しますか？", answer: "ZoneId.getAvailableZoneIds() で全タイムゾーンIDを取得できます。600以上のIDが返るため、実用上はリージョン形式（Asia/Tokyo等）に絞ると扱いやすくなります。" },
      { question: "サマータイムの影響を避けるにはどうしますか？", answer: "内部的には UTC で処理し、表示時のみローカルタイムに変換するのが安全です。UTC基準なら時刻の重複や欠落が発生しないためです。" },
      { question: "ZonedDateTime と OffsetDateTime の違いは？", answer: "ZonedDateTime はタイムゾーンルール（サマータイム等）を含み、OffsetDateTime は固定オフセットのみです。" },
    ],
    codeTitle: "複数タイムゾーンの時刻を比較する",
    codeSample: `import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class TimezoneCompare {

    public static void main(String[] args) {
        var now = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
        var zones = java.util.List.of(
            "Asia/Tokyo", "UTC", "America/New_York",
            "Europe/London", "Asia/Shanghai"
        );
        var fmt = DateTimeFormatter.ofPattern(
            "yyyy-MM-dd HH:mm:ss z");

        for (var zone : zones) {
            var converted = now.withZoneSameInstant(
                ZoneId.of(zone));
            System.out.printf("%-20s %s%n",
                zone, converted.format(fmt));
        }
    }
}`,
  },
{
  slug: "holiday-check",
  title: "Java で祝日判定と休日チェックを実装する方法と業務活用ガイド",
  categorySlug: "dates",
  summary: "祝日セットと曜日判定を組み合わせ、任意の日付が休日かどうかを判定する実装例。",
  version: "Java 17",
  tags: ["祝日判定", "休日", "LocalDate", "DayOfWeek", "Set"],
  apiNames: ["LocalDate", "DayOfWeek", "Set.of", "Set.contains"],
  description: "指定日が祝日・土日のいずれかに該当するかを Java 標準 API で判定する方法を、外部ライブラリ不要の Pure Java で Java 8/17/21 対応で解説する。",
  lead: "「この日は休みかどうか」という判定は、営業日計算や納期管理、バッチスケジュールの制御など、業務システムのあちこちで必要になります。曜日だけなら DayOfWeek で済みますが、祝日が絡むと途端にやっかいになります。祝日データをどこから持ってくるか、振替休日をどう扱うか、会社独自の休業日をどう組み込むか――判定ロジック自体は単純でも、データの持ち方と組み合わせ方で実装の見通しが大きく変わります。この記事では、祝日セットを Set<LocalDate> で受け取り、曜日判定と合わせて「休日かどうか」を返す判定メソッドを Java 標準 API だけで実装します。record による祝日情報の構造化や、Java 21 の switch 式による曜日分岐も紹介します。",
  useCases: [
    "請求書の発行日が休日に当たった場合、前営業日に自動で繰り上げる判定ロジックに使う",
    "バッチ処理の実行スケジュールで、休日をスキップするかどうかの分岐条件として利用する",
    "勤怠管理システムで、出勤日が祝日に該当するかを判定し、休日出勤手当の対象かを振り分ける",
  ],
  cautions: [
    "祝日セットに振替休日や国民の休日を含めるかどうかは、呼び出し側の責任になる。判定メソッドは渡された Set を信頼するだけなので、データが不完全だと結果も不正確になる",
    "Set.of() は Java 9 以降でのみ使える。Java 8 環境では Collections.unmodifiableSet(new HashSet<>(Arrays.asList(...))) で代替する",
    "土曜を営業日とする会社や、特定曜日が定休日の業種では、DayOfWeek の判定条件をカスタマイズする必要がある。ハードコードせず、除外曜日のセットを引数で受け取る設計が望ましい",
    "祝日データは年ごとに更新が必要。特に春分・秋分は年によって日付が変わるため、固定値だけでは対応できない",
  ],
  relatedArticleSlugs: ["japan-holiday-list", "localdate-business-days"],
  versionCoverage: {
    java8: "Set の初期化に Arrays.asList + HashSet が必要。var が使えず型宣言が冗長になるが、LocalDate と DayOfWeek の判定ロジック自体は同じ。",
    java17: "Set.of() で祝日データを不変セットとして簡潔に初期化できる。record で祝日名と日付のペアを表現すると可読性が上がる。",
    java21: "switch 式のパターンマッチングで曜日別の分岐を簡潔に記述できる。record パターンと組み合わせれば祝日種別ごとの処理も型安全に書ける。",
    java8Code: `// Java 8: HashSet + Arrays.asList で祝日セットを初期化
Set<LocalDate> holidays = new HashSet<>(Arrays.asList(
    LocalDate.of(2024, 1, 1),
    LocalDate.of(2024, 1, 8),
    LocalDate.of(2024, 2, 11)
));
// holidays.contains(date) で判定`,
    java17Code: `// Java 17: Set.of() + record で簡潔に表現
var holidays = Set.of(
    LocalDate.of(2024, 1, 1),
    LocalDate.of(2024, 1, 8),
    LocalDate.of(2024, 2, 11)
);
record Holiday(LocalDate date, String name) {}`,
    java21Code: `// Java 21: switch 式で曜日判定を簡潔に
String status = switch (date.getDayOfWeek()) {
    case SATURDAY, SUNDAY -> "週末";
    default -> holidays.contains(date)
        ? "祝日" : "営業日";
};`,
  },
  libraryComparison: [
    { name: "標準 API（LocalDate + Set + DayOfWeek）", whenToUse: "祝日データを自前で管理し、曜日条件も自社ルールに合わせてカスタマイズしたいとき。依存ゼロで動作する。", tradeoff: "祝日データの年次更新や法改正への追従は自前で行う必要がある。" },
    { name: "Jollyday", whenToUse: "各国の祝日データを外部ライブラリに委ねたいとき。初期導入は速い。", tradeoff: "日本の祝日は法改正への追従が遅れる場合がある。会社独自の休業日は結局自前で追加することになる。" },
    { name: "内閣府 CSV + 自前パーサー", whenToUse: "正式な祝日データを外部から取得し、自前ロジックで判定したいとき。", tradeoff: "ネットワーク依存が生じるため、オフライン環境ではフォールバックが必要になる。" },
  ],
  faq: [
    { question: "祝日と土曜が重なった場合、振替休日になりますか。", answer: "振替休日は「祝日が日曜に当たる場合」に翌営業日へ移動する制度です。土曜と祝日の重複では振替休日は発生しません。データ側で振替休日を含める運用が安全です。" },
    { question: "会社独自の休業日（創立記念日など）はどう追加すればよいですか。", answer: "祝日セットに会社休業日を追加して渡すのが最も簡単です。判定メソッド側は Set の中身を区別しないため、データ側で一本化すれば追加のコード変更は不要です。" },
    { question: "パフォーマンス上、祝日セットは毎回生成すべきですか。", answer: "年単位で不変なので、起動時やバッチ開始時に1回生成してキャッシュするのが一般的です。HashSet の contains は O(1) のため、セット自体のルックアップは高速です。" },
  ],
  codeTitle: "HolidayChecker.java",
  codeSample: `import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;

public class HolidayChecker {

    /** 指定日が祝日かどうかを判定する */
    public static boolean isHoliday(LocalDate date, Set<LocalDate> holidays) {
        return holidays.contains(date);
    }

    /** 指定日が休日（土曜・日曜・祝日）かどうかを判定する */
    public static boolean isNonWorkingDay(LocalDate date, Set<LocalDate> holidays) {
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return true;
        }
        return isHoliday(date, holidays);
    }

    /** 指定日が営業日かどうかを判定する */
    public static boolean isBusinessDay(LocalDate date, Set<LocalDate> holidays) {
        return !isNonWorkingDay(date, holidays);
    }

    public static void main(String[] args) {
        // 2024年の祝日（一部抜粋）
        var holidays = Set.of(
            LocalDate.of(2024, 1, 1),   // 元日
            LocalDate.of(2024, 1, 8),   // 成人の日
            LocalDate.of(2024, 2, 11),  // 建国記念の日
            LocalDate.of(2024, 2, 12),  // 振替休日
            LocalDate.of(2024, 5, 3),   // 憲法記念日
            LocalDate.of(2024, 5, 4),   // みどりの日
            LocalDate.of(2024, 5, 5),   // こどもの日
            LocalDate.of(2024, 5, 6)    // 振替休日
        );

        // 判定サンプル
        LocalDate newYear  = LocalDate.of(2024, 1, 1);  // 元日（祝日）
        LocalDate friday   = LocalDate.of(2024, 1, 5);  // 金曜日（平日）
        LocalDate saturday = LocalDate.of(2024, 1, 6);  // 土曜日

        System.out.println(newYear  + " 休日: " + isNonWorkingDay(newYear, holidays));  // true
        System.out.println(friday   + " 休日: " + isNonWorkingDay(friday, holidays));   // false
        System.out.println(saturday + " 休日: " + isNonWorkingDay(saturday, holidays)); // true

        // record で祝日名付きの情報を保持する例（Java 16+）
        record Holiday(LocalDate date, String name) {}
        var holiday = new Holiday(LocalDate.of(2024, 1, 1), "元日");
        System.out.println("祝日: " + holiday.date() + " " + holiday.name());
    }
}`,
},
{
  slug: "date-conversion",
  title: "Java の日付型を相互変換する方法と実務での注意点まとめ解説",
  categorySlug: "dates",
  summary: "java.util.Date / java.sql.Date / LocalDate の変換パターンを整理する。",
  version: "Java 17",
  tags: ["日付変換", "java.util.Date", "java.sql.Date", "LocalDate"],
  apiNames: ["LocalDate", "java.util.Date", "java.sql.Date", "ZoneId", "Instant"],
  description: "java.util.Date・java.sql.Date・LocalDate の相互変換を Java 標準 API で実装し、タイムゾーンの落とし穴と対策を解説する。",
  lead: "保守案件やフレームワーク連携では、java.util.Date や java.sql.Date が残っている場面に遭遇します。新規コードでは LocalDate を使いたくても、既存の API やライブラリが旧来の Date 型を返してくる限り、変換処理は避けられません。変換自体は数行で書けますが、タイムゾーンの指定を忘れると深夜0時付近で日付がずれる事故が起きます。この記事では java.util.Date、java.sql.Date、LocalDate の相互変換パターンを整理し、タイムゾーン指定の落とし穴、JDBC ドライバー経由でのやりとり、テストで確認すべきポイントを押さえます。",
  useCases: [
    "レガシーシステムから取得した java.util.Date を LocalDate に変換して業務ロジックに渡す",
    "JDBC の ResultSet から取得した java.sql.Date を LocalDate として扱い、日付計算に使う",
    "外部 API が返す Date 型のレスポンスを LocalDate に変換して帳票出力に利用する",
  ],
  cautions: [
    "java.util.Date → LocalDate の変換には ZoneId の指定が必須。省略すると JVM のデフォルトタイムゾーンに依存し、環境によって結果が変わる",
    "java.sql.Date.valueOf(LocalDate) で生成した sql.Date は時刻部分が 00:00:00 になる。Timestamp が必要な場面と混同しないこと",
    "java.util.Date は内部的にミリ秒精度、LocalDate は日付のみ。変換時に時刻情報が切り捨てられる点を意識する",
    "深夜0時をまたぐ処理では、タイムゾーン次第で日付が前日になることがある。テストでは UTC と JST の両方で確認する",
  ],
  relatedArticleSlugs: ["date-formatting", "date-parsing", "timezone-conversion"],
  versionCoverage: {
    java8: "Date.from() / Date.toInstant() による変換は Java 8 から可能。sql.Date.toLocalDate() も Java 8 で追加されたメソッド。",
    java17: "変換ロジック自体は Java 8 と同じ。var 宣言で型推論を使えるため記述が若干簡潔になる。",
    java21: "変換パターンに変化はない。record ConversionResult(LocalDate date, String formatted) のように変換結果を型で表現すると、メソッド戻り値に複数値をまとめやすい。",
    java8Code: `// Java 8: 型を明示して変換
Date utilDate = new Date();
LocalDate fromUtil = utilDate.toInstant()
        .atZone(ZoneId.systemDefault())
        .toLocalDate();
java.sql.Date sqlDate = java.sql.Date.valueOf(fromUtil);`,
    java17Code: `// Java 17: var で型推論
var utilDate = new Date();
var fromUtil = utilDate.toInstant()
        .atZone(ZoneId.systemDefault())
        .toLocalDate();
var sqlDate = java.sql.Date.valueOf(fromUtil);`,
    java21Code: `// Java 21: record で変換結果を構造化
record DateSet(LocalDate local, java.sql.Date sql) {}
var utilDate = new Date();
var local = utilDate.toInstant()
        .atZone(ZoneId.systemDefault()).toLocalDate();
var set = new DateSet(local, java.sql.Date.valueOf(local));`,
  },
  libraryComparison: [
    { name: "Pure Java (java.time)", whenToUse: "日付変換のみなら標準 API で十分。", tradeoff: "ZoneId の指定を忘れやすいが、コード量は最小限。" },
    { name: "Joda-Time", whenToUse: "Java 7 以前の保守案件で Date 変換が頻発する場合。", tradeoff: "Java 8 以降は標準 API で代替可能。移行コストが残る。" },
  ],
  faq: [
    { question: "java.util.Date から LocalDate への変換で日付がずれるのはなぜですか？", answer: "ZoneId を指定せずにデフォルトタイムゾーンが UTC になっている場合、JST との9時間差で日付が前日になることがあります。" },
    { question: "java.sql.Date と java.sql.Timestamp の使い分けは？", answer: "日付のみなら sql.Date、日時が必要なら sql.Timestamp を使います。JDBC の setDate / setTimestamp と対応します。" },
    { question: "変換のたびに ZoneId.systemDefault() を書くのは冗長では？", answer: "定数で ZoneId.of(\"Asia/Tokyo\") を定義しておくと、環境依存を排除でき可読性も上がります。" },
  ],
  codeTitle: "java.util.Date / java.sql.Date / LocalDate の相互変換",
  codeSample: `import java.time.LocalDate;

public class DateConversion {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");

    public static LocalDate toLocalDate(Date utilDate) {
        return utilDate.toInstant()
                .atZone(JST)
                .toLocalDate();
    }

    public static Date toUtilDate(LocalDate localDate) {
        return Date.from(
            localDate.atStartOfDay(JST).toInstant());
    }

    public static LocalDate fromSqlDate(java.sql.Date sqlDate) {
        return sqlDate.toLocalDate();
    }

    public static java.sql.Date toSqlDate(LocalDate localDate) {
        return java.sql.Date.valueOf(localDate);
    }

    public static void main(String[] args) {

        var utilDate = new Date();
        var local = toLocalDate(utilDate);
        var sqlDate = toSqlDate(local);
        System.out.println("util.Date  : " + utilDate);
        System.out.println("LocalDate  : " + local);
        System.out.println("sql.Date   : " + sqlDate);

        var back = toUtilDate(local);
        System.out.println("復元 Date  : " + back);
    }
}`,
},
{
  slug: "date-formatting",
  title: "Java で日付を文字列に変換するフォーマット実装と業務活用",
  categorySlug: "dates",
  summary: "DateTimeFormatter を使い、帳票・ログ向けに日付をフォーマットする。",
  version: "Java 17",
  tags: ["日付フォーマット", "DateTimeFormatter", "SimpleDateFormat", "帳票"],
  apiNames: ["DateTimeFormatter", "LocalDate", "LocalDateTime", "Locale"],
  description: "Java の DateTimeFormatter で日付を文字列に変換する方法を、帳票・ログ出力などの業務用途に即して Java 8/17/21 対応で解説する。",
  lead: "帳票の日付欄、ログのタイムスタンプ、CSV の日付カラムなど、日付を特定の文字列形式に変換する処理は業務コードの至るところにあります。Java 8 以降は DateTimeFormatter がスレッドセーフなフォーマッタとして使えるため、従来の SimpleDateFormat で起きていたマルチスレッドの事故を回避できます。この記事では、DateTimeFormatter によるフォーマットの基本から、日本語ロケールでの曜日表示、ISO 8601 形式の出力、そして SimpleDateFormat からの移行指針までを整理します。",
  useCases: [
    "帳票の日付欄を「2025年03月27日（木）」のような日本語形式で出力する",
    "ログファイルのタイムスタンプを「yyyy-MM-dd HH:mm:ss」で統一する",
    "CSV 出力時の日付カラムを「yyyy/MM/dd」形式に揃える",
  ],
  cautions: [
    "SimpleDateFormat はスレッドアンセーフ。マルチスレッド環境で共有するとフォーマット結果が壊れる。DateTimeFormatter へ移行するのが安全",
    "DateTimeFormatter.ofPattern の月は MM（2桁ゼロ埋め）と M（ゼロ埋めなし）で異なる。帳票仕様に合わせて使い分けること",
    "曜日を日本語で表示するには Locale.JAPANESE を明示する。指定しないと JVM のデフォルトロケールに依存する",
    "DateTimeFormatter は不変オブジェクトのため、static final フィールドで定義して使い回すのが定石",
  ],
  relatedArticleSlugs: ["date-parsing", "date-conversion", "wareki-conversion"],
  versionCoverage: {
    java8: "DateTimeFormatter は Java 8 で導入。SimpleDateFormat との併用期。ThreadLocal で SimpleDateFormat を安全に使う回避策もある。",
    java17: "テキストブロック（Java 15+）でフォーマットパターン文字列を読みやすく定義できる。DateTimeFormatter 自体の API に変化はない。",
    java21: "パターンマッチング for switch で、日付型に応じたフォーマッタの自動選択が簡潔に書ける。",
    java8Code: `// Java 8: SimpleDateFormat（スレッドアンセーフ）
private static final ThreadLocal<SimpleDateFormat> SDF =
    ThreadLocal.withInitial(
        () -> new SimpleDateFormat("yyyy/MM/dd"));
String formatted = SDF.get().format(new Date());`,
    java17Code: `// Java 17: DateTimeFormatter（スレッドセーフ）
private static final DateTimeFormatter DTF =
    DateTimeFormatter.ofPattern("yyyy/MM/dd");
String formatted = LocalDate.now().format(DTF);`,
    java21Code: `// Java 21: 型に応じたフォーマット自動選択
Object dateObj = LocalDate.now();
String result = switch (dateObj) {
    case LocalDate d  -> d.format(DTF_YMD);
    case LocalDateTime dt -> dt.format(DTF_FULL);
    default -> dateObj.toString();
};`,
  },
  libraryComparison: [
    { name: "Pure Java (DateTimeFormatter)", whenToUse: "日付フォーマットだけなら標準 API で十分。スレッドセーフで性能も良い。", tradeoff: "パターン文字の仕様を覚える必要がある。" },
    { name: "Apache Commons Lang (DateFormatUtils)", whenToUse: "旧来コードとの互換で SimpleDateFormat ベースのユーティリティが欲しい場合。", tradeoff: "Java 8 以降は DateTimeFormatter で代替可能。" },
    { name: "ICU4J", whenToUse: "多言語の日付フォーマットや暦体系を細かく制御したい場合。", tradeoff: "依存が大きく、日本語フォーマットだけなら標準 API で十分。" },
  ],
  faq: [
    { question: "SimpleDateFormat から DateTimeFormatter への移行は一括でやるべきですか？", answer: "新規コードは DateTimeFormatter に統一し、既存コードは影響範囲を見て段階的に置き換えるのが現実的です。" },
    { question: "フォーマットパターンの大文字と小文字の違いは？", answer: "M は月、m は分、H は24時間制の時、h は12時間制の時です。混同するとパース時に例外になります。" },
    { question: "DateTimeFormatter を static final で定義して問題ないですか？", answer: "DateTimeFormatter は不変でスレッドセーフなので、static final で共有するのが推奨パターンです。" },
  ],
  codeTitle: "DateTimeFormatter で日付を文字列に変換する",
  codeSample: `import java.time.LocalDate;

public class DateFormatting {

    private static final DateTimeFormatter YMD =
        DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private static final DateTimeFormatter FULL_JP =
        DateTimeFormatter.ofPattern(
            "yyyy年MM月dd日(EEE) HH:mm", Locale.JAPANESE);

    public static void main(String[] args) {

        var today = LocalDate.of(2025, 3, 27);
        System.out.println("スラッシュ: " + today.format(YMD));

        var now = LocalDateTime.now();
        System.out.println("日本語: " + now.format(FULL_JP));

        System.out.println("ISO: " +
            today.format(DateTimeFormatter.ISO_LOCAL_DATE));

        var parsed = LocalDate.parse("2025/03/27", YMD);
        System.out.println("パース結果: " + parsed);
    }
}`,
},
{
  slug: "date-parsing",
  title: "Java で複数フォーマットの日付文字列をパースする実装方法",
  categorySlug: "dates",
  summary: "ISO / スラッシュ / 和暦など複数形式に対応するパーサーの実装例。",
  version: "Java 17",
  tags: ["日付パース", "DateTimeFormatter", "フォールバック", "和暦"],
  apiNames: ["DateTimeFormatter", "LocalDate", "JapaneseChronology", "Optional"],
  description: "ISO・スラッシュ区切り・8桁数字・英語表記・和暦など複数フォーマットの日付文字列を Java 標準 API で Java 8/17/21 対応でパースする方法を解説する。",
  lead: "CSV 取り込みや外部システムとの連携では、日付文字列の形式が統一されていないことが珍しくありません。「2025-03-27」「2025/03/27」「20250327」「令和7年3月27日」のように混在するデータを、ひとつのメソッドで受け付けられるようにしておくと、取り込みロジックが格段にシンプルになります。この記事では、複数の DateTimeFormatter をフォールバックチェーンとして順番に試す方式で、多形式対応のパーサーを実装します。和暦のパースに必要な JapaneseChronology の設定、パース失敗時のエラーハンドリングも含めて整理します。",
  useCases: [
    "CSV ファイルの日付カラムが「yyyy-MM-dd」と「yyyy/MM/dd」で混在している場合に統一的にパースする",
    "外部システムから受け取った和暦表記の日付を LocalDate に変換して DB に保存する",
    "ユーザー入力の日付欄で、8桁数字やスラッシュ区切りなど複数の入力形式を許容する",
  ],
  cautions: [
    "フォールバックチェーンの順序が重要。「yyyyMMdd」は「yyyy-MM-dd」のハイフンなし版と誤解されないよう、より厳密な形式を先に試す",
    "和暦パースには JapaneseChronology.INSTANCE と Locale.JAPANESE の両方が必要。片方が欠けると例外になる",
    "DateTimeFormatter.parse() の結果は TemporalAccessor なので、LocalDate.from() で変換する。直接キャストはできない",
    "月や日が1桁の場合（4月1日 vs 04月01日）はパターンの M と MM、d と dd の違いに注意する",
  ],
  relatedArticleSlugs: ["date-formatting", "date-conversion", "japanese-era-detailed"],
  versionCoverage: {
    java8: "DateTimeFormatter のフォールバックチェーンは for ループと try-catch で実装する。var が使えず型宣言が冗長になる。",
    java17: "Stream + Optional でフォールバックを関数的に記述できる。var と組み合わせて簡潔に書ける。",
    java21: "sealed interface でフォーマット種別を型安全に列挙し、pattern matching switch で網羅的に処理できる。",
    java8Code: `// Java 8: for ループでフォールバック
for (DateTimeFormatter fmt : FORMATTERS) {
    try {
        return LocalDate.from(fmt.parse(input));
    } catch (Exception e) { /* 次を試す */ }
}
throw new IllegalArgumentException("解析不可: " + input);`,
    java17Code: `// Java 17: Stream + Optional でフォールバック
return Stream.of(ISO, SLASH, COMPACT, ENGLISH, JAPANESE)
    .map(fmt -> tryParse(input, fmt))
    .filter(Optional::isPresent)
    .findFirst()
    .flatMap(opt -> opt)
    .orElseThrow(() -> new IllegalArgumentException(
        "解析不可: " + input));`,
    java21Code: `// Java 21: sealed interface + pattern matching
sealed interface DateFormat permits Iso, Slash, Compact {}
private static DateTimeFormatter toFormatter(DateFormat f) {
    return switch (f) {
        case Iso     i -> DateTimeFormatter.ISO_LOCAL_DATE;
        case Slash   s -> DateTimeFormatter.ofPattern("yyyy/MM/dd");
        case Compact c -> DateTimeFormatter.ofPattern("yyyyMMdd");
    }; // sealed なので default 不要
}`,
  },
  libraryComparison: [
    { name: "Pure Java (DateTimeFormatter)", whenToUse: "対応形式が数パターン程度なら標準 API で十分。フォールバックチェーンで柔軟に対応できる。", tradeoff: "対応形式が増えるとフォーマッタのリスト管理が必要になる。" },
    { name: "Apache Commons Lang (DateUtils.parseDate)", whenToUse: "SimpleDateFormat ベースの既存コードとの互換性が必要な場合。", tradeoff: "スレッドセーフではないため、DateTimeFormatter への移行が望ましい。" },
  ],
  faq: [
    { question: "パース失敗時に例外を投げるかデフォルト値を返すか、どちらが良いですか？", answer: "業務データは不正値を黙って通すとバグの温床になるため、例外で明示的に失敗させるのが安全です。" },
    { question: "和暦パースで「元年」をどう扱えばよいですか？", answer: "JapaneseChronology を使えば「令和元年」のパースは自動的に対応されます。フォーマットパターンに GGGG を使います。" },
    { question: "フォールバックチェーンの性能は問題になりませんか？", answer: "例外の生成にコストはありますが、バッチで数万件程度なら実用上の問題にはなりません。大量処理では事前に形式を判定する方法もあります。" },
  ],
  codeTitle: "複数フォーマット対応の日付パーサー",
  codeSample: `import java.time.LocalDate;

public class MultiFormatDateParser {

    private static final DateTimeFormatter ISO =
        DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter SLASH =
        DateTimeFormatter.ofPattern("yyyy/MM/dd");
    private static final DateTimeFormatter COMPACT =
        DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter JAPANESE =
        DateTimeFormatter.ofPattern("GGGGy年M月d日")
            .withChronology(JapaneseChronology.INSTANCE)
            .withLocale(Locale.JAPANESE);

    public static LocalDate parse(String input) {
        return Stream.of(ISO, SLASH, COMPACT, JAPANESE)
            .map(fmt -> tryParse(input, fmt))
            .filter(Optional::isPresent)
            .findFirst()
            .flatMap(opt -> opt)
            .orElseThrow(() -> new IllegalArgumentException(
                "解析できない日付: " + input));
    }

    private static Optional<LocalDate> tryParse(
            String input, DateTimeFormatter fmt) {
        try {
            return Optional.of(
                LocalDate.from(fmt.parse(input)));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public static void main(String[] args) {
        var inputs = new String[]{
            "2025-03-27", "2025/03/27",
            "20250327", "令和7年3月27日"
        };
        for (var input : inputs) {
            System.out.printf("%-20s -> %s%n",
                input, parse(input));
        }
    }
}`,
},
{
  slug: "date-provider",
  title: "Java のテストで日付を差し替える DateProvider パターン",
  categorySlug: "dates",
  summary: "LocalDate.now() を DI で差し替え、日付依存ロジックをテスト可能にする。",
  version: "Java 17",
  tags: ["テスト", "DI", "DateProvider", "LocalDate.now", "record"],
  apiNames: ["LocalDate", "LocalDateTime", "Clock"],
  description: "LocalDate.now() への直接依存をインターフェースで切り離し、日付に依存するビジネスロジックをテスト可能にする DateProvider パターンを解説する。",
  lead: "消費税率の切り替え日、年度末判定、キャンペーン期間のチェックなど、業務ロジックは「今日の日付」に依存する処理が多くあります。しかし LocalDate.now() をロジック内で直接呼ぶと、テスト時に日付を固定できず、境界値の検証が難しくなります。DateProvider インターフェースを導入して日付の取得元を DI で差し替えられるようにすれば、テストでは固定日付を注入し、本番ではシステム日時を使うという切り分けが自然にできます。この記事では、インターフェース設計、プロダクション実装、テスト用の固定日付プロバイダーを Java 標準 API だけで実装します。",
  useCases: [
    "消費税率の変更日（2019/10/1）の前後でロジックの動作を単体テストで検証する",
    "年度末判定（3月31日）のテストを任意の日付で実行できるようにする",
    "環境設定で日付を固定し、過去日付での動作確認やデモ用途に対応する",
  ],
  cautions: [
    "DateProvider の注入を忘れて LocalDate.now() を直接呼ぶメソッドが混在すると、テストの再現性が崩れる。規約で統一すること",
    "テスト用の FixedDateProvider で時刻を固定する場合、atStartOfDay() で 00:00:00 になる点を意識する。時刻精度が必要なテストでは別途対応が必要",
    "ConfigurableDateProvider のような設定ファイル連動型は、設定値の読み込みタイミングに注意。起動時に一度だけ読むか、毎回読むかで挙動が変わる",
    "java.time.Clock を使う方法もあるが、インターフェースの方が呼び出し側の意図が明確になる場面が多い",
  ],
  relatedArticleSlugs: ["localdate-business-days", "holiday-check", "date-conversion"],
  versionCoverage: {
    java8: "インターフェース + 実装クラスで DateProvider パターンは問題なく組める。テスト用クラスのフィールドが冗長になる。",
    java17: "record を使えばテスト用 FixedDateProvider を1行で定義できる。var と組み合わせてテストコードも簡潔になる。",
    java21: "pattern matching switch で DateProvider の実装型を判別し、デバッグ情報を出し分けるといった使い方ができる。",
    java8Code: `// Java 8: テスト用プロバイダー（クラス定義が冗長）
static class FixedDateProvider implements DateProvider {
    private final LocalDate fixedDate;
    FixedDateProvider(LocalDate fixedDate) {
        this.fixedDate = fixedDate;
    }
    @Override
    public LocalDate getToday() { return fixedDate; }
}`,
    java17Code: `// Java 17: record で簡潔に定義
record FixedDateProvider(LocalDate fixedDate)
        implements DateProvider {
    @Override
    public LocalDate getToday() { return fixedDate; }
    @Override
    public LocalDateTime getNow() {
        return fixedDate.atStartOfDay();
    }
}`,
    java21Code: `// Java 21: pattern matching で型判別
public String providerType() {
    return switch (dateProvider) {
        case SystemDateProvider s  -> "実時刻";
        case FixedDateProvider f   -> "固定: " + f.fixedDate();
        case ConfigurableDateProvider c -> "設定可能";
        default -> "不明";
    };
}`,
  },
  libraryComparison: [
    { name: "Pure Java (インターフェース DI)", whenToUse: "日付の差し替えだけなら自前インターフェースが最もシンプル。外部依存なし。", tradeoff: "DI コンテナなしでも使えるが、注入の管理は手動になる。" },
    { name: "java.time.Clock", whenToUse: "java.time API との親和性を重視する場合。LocalDate.now(clock) で注入できる。", tradeoff: "呼び出し側が Clock を意識する必要があり、インターフェースほど意図が明確にならない場面もある。" },
    { name: "Mockito (モック)", whenToUse: "既存コードを変更せずにテストしたい場合。static mock で LocalDate.now() を差し替えられる。", tradeoff: "テストの可読性が下がりやすい。設計を改善する方が長期的には有利。" },
  ],
  faq: [
    { question: "java.time.Clock と DateProvider インターフェースのどちらを使うべきですか？", answer: "Clock は標準 API で手軽ですが、DateProvider の方がビジネスロジックとの分離が明確で、意図が伝わりやすいです。" },
    { question: "Spring の @Autowired で DateProvider を注入できますか？", answer: "可能です。SystemDateProvider を @Component で登録し、テスト時に @MockBean で FixedDateProvider に差し替えます。" },
    { question: "DateProvider を導入する単位はクラスごとですか？", answer: "日付に依存するサービスクラスのコンストラクタで受け取るのが一般的です。全メソッドに渡す必要はありません。" },
  ],
  codeTitle: "DateProvider パターンで日付依存ロジックをテスト可能にする",
  codeSample: `import java.time.LocalDate;

public class DateProviderDemo {

    interface DateProvider {
        LocalDate getToday();
        LocalDateTime getNow();
    }

    static class SystemDateProvider implements DateProvider {
        @Override
        public LocalDate getToday() {
            return LocalDate.now();
        }
        @Override
        public LocalDateTime getNow() {
            return LocalDateTime.now();
        }
    }

    record FixedDateProvider(LocalDate fixedDate)
            implements DateProvider {
        @Override
        public LocalDate getToday() { return fixedDate; }
        @Override
        public LocalDateTime getNow() {
            return fixedDate.atStartOfDay();
        }
    }

    static class TaxRateService {
        private final DateProvider dateProvider;

        TaxRateService(DateProvider dateProvider) {
            this.dateProvider = dateProvider;
        }

        public int getTaxRate() {
            var today = dateProvider.getToday();
            var boundary = LocalDate.of(2019, 10, 1);
            return !today.isBefore(boundary) ? 10 : 8;
        }
    }

    public static void main(String[] args) {

        var prod = new TaxRateService(new SystemDateProvider());
        System.out.println("現在の税率: " + prod.getTaxRate() + "%");

        var before = new TaxRateService(
            new FixedDateProvider(LocalDate.of(2019, 9, 30)));
        System.out.println("2019/9/30: " + before.getTaxRate() + "%");

        var after = new TaxRateService(
            new FixedDateProvider(LocalDate.of(2019, 10, 1)));
        System.out.println("2019/10/1: " + after.getTaxRate() + "%");
    }
}`,
},
{
  slug: "japanese-era-detailed",
  title: "Java の和暦変換を深掘り：略号・境界・型安全な設計パターン",
  categorySlug: "dates",
  summary: "SHR略称から西暦への変換、元号境界の正確な処理、sealed interface による型安全な設計。",
  version: "Java 21",
  tags: ["和暦", "元号", "JapaneseDate", "sealed interface", "switch式"],
  apiNames: ["JapaneseDate", "DateTimeFormatter", "ChronoField", "JapaneseChronology"],
  description: "Java 標準 API の JapaneseDate で和暦変換の詳細を掘り下げ、SHR略称の変換・元号境界・型安全な設計パターンを Java 8/17/21 対応で解説する。",
  lead: "和暦の基本的な変換は JapaneseDate と DateTimeFormatter で対応できますが、実務ではもう少し踏み込んだ要件に直面します。「R6」「H30」のような英字略称から西暦への変換、元号境界をまたぐ日付の正確な判定、帳票向けの「元年」表記、そして元号を型安全に扱うための設計パターンなどです。この記事では、wareki-conversion で扱った基本変換の先にある実務的な要件を掘り下げ、Java 17 の switch 式や Java 21 の sealed interface / pattern matching を活用した堅牢な実装を紹介します。",
  useCases: [
    "金融系帳票で「R6」「H30」のような SHR 英字略称を西暦年に変換する",
    "元号の境界日（2019/5/1 など）をまたぐ期間を正確に計算する",
    "和暦を sealed interface で型安全にモデル化し、元号ごとの処理分岐を網羅的に書く",
  ],
  cautions: [
    "SHR略称の変換は年レベルの簡易方式。月日をまたぐ正確な境界判定が必要な場合は JapaneseDate 方式を使うこと",
    "JapaneseDate は明治6年（1873年）以降のみ対応。それ以前の日付を渡すと DateTimeException が発生する",
    "DateTimeFormatter の和暦パターンで G の数は表示名の長さを制御する。GGGG で「令和」、G で「令」のように変わる",
    "sealed interface で元号を型安全に表現する場合、新しい元号の追加時にはコンパイルエラーで漏れを検出できるが、permits 宣言の更新が必要になる",
  ],
  relatedArticleSlugs: ["wareki-conversion", "date-parsing", "date-formatting"],
  versionCoverage: {
    java8: "JapaneseDate は Java 8 から利用可能だが、令和は Java 12 以降で対応。SHR略称の変換は if-else チェーンで実装する。",
    java17: "switch 式で SHR略称や元号名の分岐が簡潔に書ける。fall-through がなく、値を直接返せる。",
    java21: "sealed interface + pattern matching switch で元号を型安全に列挙でき、default 不要の網羅的な分岐が可能。",
    java8Code: `// Java 8: if-else チェーンで元号略称を変換
if (era == 'R') {
    return REIWA_BASE + japYear;
} else if (era == 'H') {
    return HEISEI_BASE + japYear;
} else if (era == 'S') {
    return SHOWA_BASE + japYear;
} else {
    throw new IllegalArgumentException("不明: " + era);
}`,
    java17Code: `// Java 17: switch 式で簡潔に記述
int base = switch (era) {
    case 'R' -> REIWA_BASE;
    case 'H' -> HEISEI_BASE;
    case 'S' -> SHOWA_BASE;
    case 'T' -> TAISHO_BASE;
    default  -> throw new IllegalArgumentException(
        "不明な元号: " + era);
};
return base + japYear;`,
    java21Code: `// Java 21: sealed interface + pattern matching
sealed interface Era permits Reiwa, Heisei, Showa, Taisho {}
record Reiwa(int year)  implements Era {}
record Heisei(int year) implements Era {}

String display = switch (era) {
    case Reiwa  r -> "令和" + r.year() + "年";
    case Heisei h -> "平成" + h.year() + "年";
    case Showa  s -> "昭和" + s.year() + "年";
    case Taisho t -> "大正" + t.year() + "年";
}; // sealed なので default 不要`,
  },
  libraryComparison: [
    { name: "Pure Java (JapaneseDate + switch式)", whenToUse: "和暦変換が主目的なら標準 API で十分。JDK 更新で新元号にも自動対応できる。", tradeoff: "SHR略称の変換は自前実装が必要。" },
    { name: "ICU4J", whenToUse: "旧字体の元号表記や、より高度な国際化暦体系が必要な場合。", tradeoff: "依存が大きく、和暦変換だけなら過剰。" },
  ],
  faq: [
    { question: "SHR略称の「R」「H」「S」はどこで定義されている規格ですか？", answer: "公式規格ではなく慣例です。金融や行政の帳票で広く使われていますが、システムごとに確認が必要です。" },
    { question: "sealed interface で元号を表現するメリットは何ですか？", answer: "新しい元号が追加されたとき、permits 宣言を更新すれば switch 文の網羅漏れをコンパイルエラーで検出できます。" },
    { question: "元年表記を「1年」にしたい場合はどうしますか？", answer: "toWareki メソッドの year == 1 判定を外すだけで対応できます。帳票仕様に合わせて切り替えてください。" },
  ],
  codeTitle: "SHR略称変換と sealed interface による型安全な和暦モデル",
  codeSample: `import java.time.LocalDate;

public class JapaneseEraDetailed {

    private static final int REIWA_BASE  = 2018;
    private static final int HEISEI_BASE = 1988;
    private static final int SHOWA_BASE  = 1925;
    private static final int TAISHO_BASE = 1911;

    public static String toWareki(LocalDate date) {
        var jDate = JapaneseDate.from(date);
        var eraFmt = DateTimeFormatter.ofPattern(
            "GGGG", Locale.JAPANESE);
        var eraName = eraFmt.format(jDate);
        int year = jDate.get(ChronoField.YEAR_OF_ERA);
        return (year == 1)
            ? eraName + "元年"
            : eraName + year + "年";
    }

    public static int abbreviationToSeireki(String abbrev) {
        if (abbrev == null || abbrev.length() < 2) {
            throw new IllegalArgumentException(
                "不正な略称: " + abbrev);
        }
        char era = Character.toUpperCase(abbrev.charAt(0));
        int japYear = Integer.parseInt(abbrev.substring(1));
        int base = switch (era) {
            case 'R' -> REIWA_BASE;
            case 'H' -> HEISEI_BASE;
            case 'S' -> SHOWA_BASE;
            case 'T' -> TAISHO_BASE;
            default  -> throw new IllegalArgumentException(
                "不明な元号: " + era);
        };
        return base + japYear;
    }

    public static void main(String[] args) {

        System.out.println(toWareki(LocalDate.of(2025, 3, 27)));
        System.out.println(toWareki(LocalDate.of(2019, 5, 1)));
        System.out.println(toWareki(LocalDate.of(2019, 4, 30)));

        System.out.println("R7  -> " + abbreviationToSeireki("R7"));
        System.out.println("H30 -> " + abbreviationToSeireki("H30"));
        System.out.println("S64 -> " + abbreviationToSeireki("S64"));
    }
}`,
},
{
  slug: "timezone-advanced",
  title: "Java のタイムゾーン処理を深掘り：DST・DB保存・実務パターン",
  categorySlug: "dates",
  summary: "サマータイムの影響、DB 保存時の UTC 統一、OffsetDateTime との使い分けを整理する。",
  version: "Java 17",
  tags: ["タイムゾーン", "DST", "ZonedDateTime", "OffsetDateTime", "UTC"],
  apiNames: ["ZonedDateTime", "OffsetDateTime", "ZoneId", "ZoneOffset", "DateTimeFormatter"],
  description: "Java のタイムゾーン処理を深掘りし、サマータイムの影響・DB保存のUTC統一パターン・OffsetDateTime との使い分けを実務視点で Java 8/17/21 対応で解説する。",
  lead: "タイムゾーン処理の基本は timezone-conversion で整理しましたが、実務では更に踏み込んだ判断が求められます。サマータイム（DST）のある地域と連携するとき、冬と夏でオフセットが変わる影響をどう吸収するか。DB に保存する時刻を UTC に統一する具体的なパターン。ZonedDateTime と OffsetDateTime をどう使い分けるか。この記事では、これらの実務的なテーマを掘り下げ、DB保存→表示のラウンドトリップや、DST 切り替え時のエッジケースを含めたコード例を紹介します。",
  useCases: [
    "海外拠点のシステムとデータ連携する際に、DST の影響でログの時刻がずれる問題を解消する",
    "DB にはすべて UTC で保存し、画面表示時にユーザーのタイムゾーンで変換して表示する",
    "外部 API のレスポンスに含まれる ISO 8601 タイムスタンプを JST に変換して帳票に出力する",
  ],
  cautions: [
    "ZonedDateTime は DST ルールを持つため、将来の予定を扱うのに適している。OffsetDateTime は固定オフセットなので DB 保存や API 連携向き",
    "サマータイム切り替え時に「存在しない時刻」（2:00〜3:00 がスキップ）や「重複する時刻」が生じる。ZonedDateTime はこれを自動調整するが、意図通りか確認が必要",
    "DB には UTC で保存するのが鉄則。ローカルタイムで保存すると、DST やタイムゾーン変更時にデータが破綻する",
    "ZoneId.of() に不正な文字列を渡すと DateTimeException が発生する。外部入力の場合はバリデーションが必要",
  ],
  relatedArticleSlugs: ["timezone-conversion", "date-formatting", "date-conversion"],
  versionCoverage: {
    java8: "ZonedDateTime / OffsetDateTime は Java 8 で導入。DST 処理やタイムゾーン変換の基本 API はすべて揃っている。",
    java17: "API に大きな変化はない。var 宣言とテキストブロックで記述が若干簡潔になる程度。",
    java21: "switch 式でタイムゾーン別の処理分岐が簡潔に書ける。基本 API は Java 8 から変わらない。",
    java8Code: `// Java 8: 型を明示して UTC 変換
ZonedDateTime jst = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
ZonedDateTime utc = jst.withZoneSameInstant(ZoneId.of("UTC"));
String dbValue = utc.format(
    DateTimeFormatter.ISO_OFFSET_DATE_TIME);`,
    java17Code: `// Java 17: var で簡潔に記述
var jst = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));
var utc = jst.withZoneSameInstant(ZoneId.of("UTC"));
var dbValue = utc.format(
    DateTimeFormatter.ISO_OFFSET_DATE_TIME);`,
    java21Code: `// Java 21: switch 式でゾーン別ラベルを付与
String label = switch (zone) {
    case "Asia/Tokyo"       -> "日本標準時 (JST)";
    case "UTC"              -> "協定世界時 (UTC)";
    case "America/New_York" -> "東部時間 (ET)";
    default -> zone;
};`,
  },
  libraryComparison: [
    { name: "Pure Java (java.time)", whenToUse: "タイムゾーン変換・DST 処理は標準 API で十分にカバーできる。", tradeoff: "タイムゾーンデータ（tzdata）の更新は JDK のアップデートに依存する。" },
    { name: "Joda-Time", whenToUse: "Java 7 以前の保守案件で DST 対応が必要な場合。", tradeoff: "Java 8 以降は java.time に移行すべき。Joda-Time のメンテナンスは縮小傾向。" },
    { name: "ThreeTen-Extra", whenToUse: "java.time にない追加クラス（Interval など）が必要な場合。", tradeoff: "タイムゾーン処理だけなら標準 API で十分。" },
  ],
  faq: [
    { question: "ZonedDateTime と OffsetDateTime のどちらを DB に保存すべきですか？", answer: "DB には OffsetDateTime（UTC 固定）で保存するのが安全です。ZonedDateTime のタイムゾーンルールは DB に保存しにくいためです。" },
    { question: "サマータイム切り替え時に時刻が重複する場合はどうなりますか？", answer: "ZonedDateTime.of() は自動的に「先に来る方」のオフセットを選びます。明示的に制御するには withEarlierOffsetAtOverlap / withLaterOffsetAtOverlap を使います。" },
    { question: "タイムゾーンデータ（tzdata）はどのタイミングで更新されますか？", answer: "JDK のマイナーアップデートに含まれます。TZUpdater ツールで個別に更新することも可能です。" },
  ],
  codeTitle: "DB保存のUTC統一とDST対応のラウンドトリップ",
  codeSample: `import java.time.LocalDateTime;

public class TimezoneAdvanced {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");
    private static final ZoneId UTC = ZoneId.of("UTC");

    public static String toDbValue(ZonedDateTime jstTime) {
        return jstTime.withZoneSameInstant(UTC)
            .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }

    public static String toDisplay(String dbValue) {
        return ZonedDateTime.parse(dbValue)
            .withZoneSameInstant(JST)
            .format(DateTimeFormatter.ofPattern(
                "yyyy/MM/dd HH:mm"));
    }

    public static void main(String[] args) {

        var now = ZonedDateTime.now(JST);
        var saved = toDbValue(now);
        var displayed = toDisplay(saved);
        System.out.println("保存値(UTC): " + saved);
        System.out.println("表示(JST):   " + displayed);

        var nyWinter = ZonedDateTime.of(
            LocalDateTime.of(2025, 1, 15, 12, 0),
            ZoneId.of("America/New_York"));
        var nySummer = ZonedDateTime.of(
            LocalDateTime.of(2025, 7, 15, 12, 0),
            ZoneId.of("America/New_York"));
        System.out.println("NY冬: " + nyWinter.getOffset());
        System.out.println("NY夏: " + nySummer.getOffset());

        var offset = OffsetDateTime.now(ZoneOffset.of("+09:00"));
        System.out.println("OffsetDateTime: " + offset);
    }
}`,
},
]
