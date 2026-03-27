import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * 全銀フォーマット（総合振込）サンプル — Java 17 版
 *
 * 全国銀行協会連合会が定めたレコードフォーマットに従い、
 * ヘッダ・データ・トレーラ・エンドの4種別レコードを生成する。
 * 各レコードは120バイト固定長。文字コードは JIS X 0201（Shift_JIS）。
 *
 * Java 17 では record でデータを簡潔に定義し、
 * var による型推論と String.formatted() で記述量を抑える。
 */
public class ZenginFormatSample {

    // ── 振込データを record で定義 ──────────────────────────
    // Java 17 の record により、不変データクラスが1行で定義できる
    record TransferData(
        String bankCode,       // 振込先銀行番号（4桁）
        String bankName,       // 振込先銀行名（15桁・半角カナ）
        String branchCode,     // 振込先支店番号（3桁）
        String branchName,     // 振込先支店名（15桁・半角カナ）
        String accountType,    // 預金種目（1桁: 1=普通, 2=当座）
        String accountNumber,  // 口座番号（7桁）
        String accountHolder,  // 受取人名（30桁・半角カナ）
        long amount            // 振込金額（10桁）
    ) {}

    // ── 右詰めゼロ埋め（数値フィールド用） ──────────────────
    // 全銀仕様: 数値フィールドは右詰め・前ゼロ埋め
    static String zeroPad(long value, int length) {
        return ("%" + "0" + length + "d").formatted(value);
    }

    // ── 左詰めスペース埋め（文字フィールド用） ──────────────
    // 全銀仕様: 文字フィールドは左詰め・後ろスペース埋め
    static String spacePad(String value, int length) {
        return ("%-" + length + "s").formatted(value);
    }

    // ── ヘッダレコード（レコード区分: 1）120バイト ─────────
    // 全銀仕様書「ヘッダ・レコード」に対応
    static String buildHeader(String clientCode, String clientName,
                               String transferDate, String bankCode,
                               String bankName, String branchCode,
                               String branchName) {
        var sb = new StringBuilder();
        sb.append("1");                          // [1]     レコード区分: 1=ヘッダ
        sb.append("21");                         // [2-3]   種別コード: 21=総合振込
        sb.append("0");                          // [4]     コード区分: 0=JIS
        sb.append(spacePad(clientCode, 10));      // [5-14]  委託者コード（10桁・スペース埋め）
        sb.append(spacePad(clientName, 40));       // [15-54] 委託者名（40桁・半角カナ・スペース埋め）
        sb.append(transferDate);                  // [55-58] 振込指定日（MMDD 4桁）
        sb.append(zeroPad(Long.parseLong(bankCode), 4));     // [59-62] 仕向銀行番号（4桁・ゼロ埋め）
        sb.append(spacePad(bankName, 15));         // [63-77] 仕向銀行名（15桁・スペース埋め）
        sb.append(zeroPad(Long.parseLong(branchCode), 3));   // [78-80] 仕向支店番号（3桁・ゼロ埋め）
        sb.append(spacePad(branchName, 15));       // [81-95] 仕向支店名（15桁・スペース埋め）
        sb.append(spacePad("", 25));               // [96-120] 予備（25桁・スペース埋め）
        return sb.toString();
    }

    // ── データレコード（レコード区分: 2）120バイト ─────────
    // 全銀仕様書「データ・レコード」に対応
    static String buildDataRecord(TransferData data) {
        var sb = new StringBuilder();
        sb.append("2");                                            // [1]     レコード区分: 2=データ
        sb.append(zeroPad(Long.parseLong(data.bankCode()), 4));    // [2-5]   振込先銀行番号（4桁・ゼロ埋め）
        sb.append(spacePad(data.bankName(), 15));                   // [6-20]  振込先銀行名（15桁・スペース埋め）
        sb.append(zeroPad(Long.parseLong(data.branchCode()), 3));  // [21-23] 振込先支店番号（3桁・ゼロ埋め）
        sb.append(spacePad(data.branchName(), 15));                 // [24-38] 振込先支店名（15桁・スペース埋め）
        sb.append("0000");                                         // [39-42] 手形交換所番号（4桁・振込は0000固定）
        sb.append(data.accountType());                              // [43]    預金種目（1=普通, 2=当座）
        sb.append(zeroPad(Long.parseLong(data.accountNumber()), 7)); // [44-50] 口座番号（7桁・ゼロ埋め）
        sb.append(spacePad(data.accountHolder(), 30));              // [51-80] 受取人名（30桁・半角カナ・スペース埋め）
        sb.append(zeroPad(data.amount(), 10));                      // [81-90] 振込金額（10桁・ゼロ埋め）
        sb.append("0");                                            // [91]    新規コード（0=その他）
        sb.append(spacePad("", 29));                                // [92-120] 予備（29桁・スペース埋め）
        return sb.toString();
    }

    // ── トレーラレコード（レコード区分: 8）120バイト ────────
    // 合計件数・合計金額でデータの整合性を検証するためのレコード
    static String buildTrailer(int totalCount, long totalAmount) {
        var sb = new StringBuilder();
        sb.append("8");                              // [1]     レコード区分: 8=トレーラ
        sb.append(zeroPad(totalCount, 6));            // [2-7]   合計件数（6桁・ゼロ埋め）
        sb.append(zeroPad(totalAmount, 12));           // [8-19]  合計金額（12桁・ゼロ埋め）
        sb.append(spacePad("", 101));                  // [20-120] 予備（101桁・スペース埋め）
        return sb.toString();
    }

    // ── エンドレコード（レコード区分: 9）120バイト ──────────
    // ファイルの終端を示す。内容は区分コード+スペース埋め
    static String buildEnd() {
        var sb = new StringBuilder();
        sb.append("9");                              // [1]     レコード区分: 9=エンド
        sb.append(spacePad("", 119));                 // [2-120] 予備（119桁・スペース埋め）
        return sb.toString();
    }

    public static void main(String[] args) throws IOException {
        // 振込データを record で簡潔に生成
        var transfers = List.of(
            new TransferData(
                "0001", "ﾐｽﾞﾎ", "001", "ﾎﾝﾃﾝ",
                "1", "1234567", "ｶ)ﾔﾏﾀﾞｼﾖｳﾃﾝ", 1500000L
            ),
            new TransferData(
                "0009", "ﾐﾂﾋﾞｼUFJ", "002", "ﾏﾙﾉｳﾁ",
                "1", "7654321", "ｻﾄｳﾀﾛｳ", 280000L
            )
        );

        // ファイル全体を組み立て
        var lines = new ArrayList<String>();

        // ヘッダレコード
        var header = buildHeader(
            "1234567890", "ｶ)ｻﾝﾌﾟﾙｷｷﾞﾖｳ",
            "0401", "0001", "ﾐｽﾞﾎ", "001", "ﾎﾝﾃﾝ"
        );
        lines.add(header);
        System.out.println("ヘッダ  (%d文字): %s".formatted(header.length(), header));

        // データレコード
        var totalAmount = 0L;
        for (var td : transfers) {
            var dataLine = buildDataRecord(td);
            lines.add(dataLine);
            totalAmount += td.amount();
            System.out.println("データ  (%d文字): %s".formatted(dataLine.length(), dataLine));
        }

        // トレーラレコード（件数と金額の合計でデータ整合性を担保）
        var trailer = buildTrailer(transfers.size(), totalAmount);
        lines.add(trailer);
        System.out.println("トレーラ(%d文字): %s".formatted(trailer.length(), trailer));

        // エンドレコード（ファイル終端）
        var end = buildEnd();
        lines.add(end);
        System.out.println("エンド  (%d文字): %s".formatted(end.length(), end));
    }
}
