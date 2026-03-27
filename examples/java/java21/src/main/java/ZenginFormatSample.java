import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * 全銀フォーマット（総合振込）サンプル — Java 21 版
 *
 * 全国銀行協会連合会が定めたレコードフォーマットに従い、
 * ヘッダ・データ・トレーラ・エンドの4種別レコードを生成する。
 * 各レコードは120バイト固定長。文字コードは JIS X 0201（Shift_JIS）。
 *
 * Java 21 では sealed interface + record でレコード種別を型安全に表現し、
 * switch パターンマッチングで種別ごとのフォーマット処理を分岐する。
 */
public class ZenginFormatSample {

    // ── sealed interface でレコード種別を型安全に定義 ──────
    // Java 21 のパターンマッチングと組み合わせることで、
    // レコード種別の追加漏れをコンパイル時に検出できる
    sealed interface ZenginRecord {
        // ヘッダレコード（区分: 1）— ファイル先頭に1件
        record Header(
            String clientCode,    // 委託者コード（10桁）
            String clientName,    // 委託者名（40桁・半角カナ）
            String transferDate,  // 振込指定日（MMDD 4桁）
            String bankCode,      // 仕向銀行番号（4桁）
            String bankName,      // 仕向銀行名（15桁）
            String branchCode,    // 仕向支店番号（3桁）
            String branchName     // 仕向支店名（15桁）
        ) implements ZenginRecord {}

        // データレコード（区分: 2）— 振込1件につき1レコード
        record Data(
            String bankCode,       // 振込先銀行番号（4桁）
            String bankName,       // 振込先銀行名（15桁・半角カナ）
            String branchCode,     // 振込先支店番号（3桁）
            String branchName,     // 振込先支店名（15桁・半角カナ）
            String accountType,    // 預金種目（1桁: 1=普通, 2=当座）
            String accountNumber,  // 口座番号（7桁）
            String accountHolder,  // 受取人名（30桁・半角カナ）
            long amount            // 振込金額（10桁）
        ) implements ZenginRecord {}

        // トレーラレコード（区分: 8）— 合計件数・合計金額
        record Trailer(
            int totalCount,        // 合計件数（6桁）
            long totalAmount       // 合計金額（12桁）
        ) implements ZenginRecord {}

        // エンドレコード（区分: 9）— ファイル終端
        record End() implements ZenginRecord {}
    }

    // ── 右詰めゼロ埋め（数値フィールド用） ──────────────────
    static String zeroPad(long value, int length) {
        return ("%" + "0" + length + "d").formatted(value);
    }

    // ── 左詰めスペース埋め（文字フィールド用） ──────────────
    static String spacePad(String value, int length) {
        return ("%-" + length + "s").formatted(value);
    }

    // ── switch パターンマッチングでレコード種別ごとにフォーマット ──
    // sealed interface の全サブタイプを網羅しないとコンパイルエラーになるため、
    // レコード種別の追加時にフォーマット処理の実装漏れを防げる
    static String format(ZenginRecord record) {
        return switch (record) {
            case ZenginRecord.Header h -> {
                var sb = new StringBuilder();
                sb.append("1");                          // [1]     レコード区分: 1=ヘッダ
                sb.append("21");                         // [2-3]   種別コード: 21=総合振込
                sb.append("0");                          // [4]     コード区分: 0=JIS
                sb.append(spacePad(h.clientCode(), 10));  // [5-14]  委託者コード
                sb.append(spacePad(h.clientName(), 40));   // [15-54] 委託者名
                sb.append(h.transferDate());              // [55-58] 振込指定日（MMDD）
                sb.append(zeroPad(Long.parseLong(h.bankCode()), 4));   // [59-62] 仕向銀行番号
                sb.append(spacePad(h.bankName(), 15));     // [63-77] 仕向銀行名
                sb.append(zeroPad(Long.parseLong(h.branchCode()), 3)); // [78-80] 仕向支店番号
                sb.append(spacePad(h.branchName(), 15));   // [81-95] 仕向支店名
                sb.append(spacePad("", 25));               // [96-120] 予備
                yield sb.toString();
            }
            case ZenginRecord.Data d -> {
                var sb = new StringBuilder();
                sb.append("2");                                            // [1]     レコード区分: 2=データ
                sb.append(zeroPad(Long.parseLong(d.bankCode()), 4));       // [2-5]   振込先銀行番号
                sb.append(spacePad(d.bankName(), 15));                      // [6-20]  振込先銀行名
                sb.append(zeroPad(Long.parseLong(d.branchCode()), 3));     // [21-23] 振込先支店番号
                sb.append(spacePad(d.branchName(), 15));                    // [24-38] 振込先支店名
                sb.append("0000");                                         // [39-42] 手形交換所番号
                sb.append(d.accountType());                                 // [43]    預金種目
                sb.append(zeroPad(Long.parseLong(d.accountNumber()), 7));   // [44-50] 口座番号
                sb.append(spacePad(d.accountHolder(), 30));                 // [51-80] 受取人名
                sb.append(zeroPad(d.amount(), 10));                         // [81-90] 振込金額
                sb.append("0");                                            // [91]    新規コード
                sb.append(spacePad("", 29));                                // [92-120] 予備
                yield sb.toString();
            }
            case ZenginRecord.Trailer t -> {
                var sb = new StringBuilder();
                sb.append("8");                              // [1]     レコード区分: 8=トレーラ
                sb.append(zeroPad(t.totalCount(), 6));       // [2-7]   合計件数
                sb.append(zeroPad(t.totalAmount(), 12));      // [8-19]  合計金額
                sb.append(spacePad("", 101));                 // [20-120] 予備
                yield sb.toString();
            }
            case ZenginRecord.End e -> {
                var sb = new StringBuilder();
                sb.append("9");                              // [1]     レコード区分: 9=エンド
                sb.append(spacePad("", 119));                 // [2-120] 予備
                yield sb.toString();
            }
        };
    }

    public static void main(String[] args) throws IOException {
        // sealed interface の record で型安全に振込データを生成
        var dataRecords = List.of(
            new ZenginRecord.Data(
                "0001", "ﾐｽﾞﾎ", "001", "ﾎﾝﾃﾝ",
                "1", "1234567", "ｶ)ﾔﾏﾀﾞｼﾖｳﾃﾝ", 1500000L
            ),
            new ZenginRecord.Data(
                "0009", "ﾐﾂﾋﾞｼUFJ", "002", "ﾏﾙﾉｳﾁ",
                "1", "7654321", "ｻﾄｳﾀﾛｳ", 280000L
            )
        );

        // 合計件数・合計金額を集計（トレーラレコードで使用）
        var totalAmount = dataRecords.stream()
            .mapToLong(ZenginRecord.Data::amount)
            .sum();

        // 全レコードを sealed interface のリストとして組み立て
        var records = new ArrayList<ZenginRecord>();
        records.add(new ZenginRecord.Header(
            "1234567890", "ｶ)ｻﾝﾌﾟﾙｷｷﾞﾖｳ",
            "0401", "0001", "ﾐｽﾞﾎ", "001", "ﾎﾝﾃﾝ"
        ));
        records.addAll(dataRecords);
        records.add(new ZenginRecord.Trailer(dataRecords.size(), totalAmount));
        records.add(new ZenginRecord.End());

        // switch パターンマッチングで全種別を統一的にフォーマット
        for (var rec : records) {
            var line = format(rec);
            // レコード種別名を switch で取得（網羅性チェック付き）
            var label = switch (rec) {
                case ZenginRecord.Header  __ -> "ヘッダ  ";
                case ZenginRecord.Data    __ -> "データ  ";
                case ZenginRecord.Trailer __ -> "トレーラ";
                case ZenginRecord.End     __ -> "エンド  ";
            };
            System.out.println("%s (%d文字): %s".formatted(label, line.length(), line));
        }
    }
}
