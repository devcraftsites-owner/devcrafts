import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Arrays;
import java.util.List;

/**
 * DP-06: Adapter パターン（Java 8）
 *
 * Adapter パターンは「既存クラスを変更せず、新しいインターフェースに適合させる」パターンです。
 * 古いシステム（LegacyDataReader）に手を加えずに、新しいインターフェース（Target）として使えるようにします。
 */
public class AdapterPatternSample {

    // ===== 新しいインターフェース（Target） =====

    /**
     * 新しいシステムが期待するインターフェース。
     * データを文字列として読み取るメソッドを定義します。
     */
    interface Target {
        /**
         * データを読み取って返します。
         *
         * @return 読み取ったデータ文字列
         */
        String readData();
    }

    // ===== 既存クラス（Adaptee）: 変更不可 =====

    /**
     * 古いシステムのデータ読み取りクラス。
     * このクラスは変更できない（外部ライブラリ・レガシーコードなど）想定です。
     * メソッド名も戻り値の形式も Target とは異なります。
     */
    static class LegacyDataReader {
        /**
         * 生データを取得します（旧システムのメソッド名）。
         *
         * @return CSV 形式の生データ
         */
        public String fetchRawData() {
            return "ID:001,NAME:田中太郎,AGE:30";
        }
    }

    // ===== Adapter クラス =====

    /**
     * Target インターフェースを実装し、LegacyDataReader に処理を委譲する Adapter。
     * これにより、呼び出し側は LegacyDataReader の存在を知らなくてよくなります。
     * これは「オブジェクトアダプター（委譲型）」と呼ばれる実装方式です。
     */
    static class DataReaderAdapter implements Target {

        // 既存クラスのインスタンスを保持する（委譲）
        private final LegacyDataReader legacyReader;

        public DataReaderAdapter(LegacyDataReader legacyReader) {
            this.legacyReader = legacyReader;
        }

        @Override
        public String readData() {
            // 既存クラスのメソッドを呼び出し、必要に応じて変換する
            String rawData = legacyReader.fetchRawData();
            // CSV 形式 "KEY:VALUE,..." を読みやすい形式に変換
            return convertFormat(rawData);
        }

        /**
         * "KEY:VALUE,KEY:VALUE" 形式を "[KEY=VALUE, KEY=VALUE]" 形式に変換します。
         */
        private String convertFormat(String rawData) {
            String[] pairs = rawData.split(",");
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < pairs.length; i++) {
                sb.append(pairs[i].replace(":", "="));
                if (i < pairs.length - 1) {
                    sb.append(", ");
                }
            }
            sb.append("]");
            return sb.toString();
        }
    }

    // ===== Java 標準ライブラリの Adapter 例 =====

    /**
     * InputStreamReader は Adapter パターンの代表例です。
     * InputStream（バイト列）を Reader（文字列）インターフェースに適合させます。
     * InputStream を変更せずに Reader として扱えるようにしています。
     */
    static void showInputStreamReaderExample() throws IOException {
        String text = "こんにちは、Java！";
        byte[] bytes = text.getBytes("UTF-8");

        // InputStream を Reader に変換する Adapter
        ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes);
        Reader reader = new InputStreamReader(inputStream, "UTF-8"); // Adapter!

        // Reader として使用（InputStream の存在を意識しない）
        StringBuilder sb = new StringBuilder();
        int ch;
        while ((ch = reader.read()) != -1) {
            sb.append((char) ch);
        }
        System.out.println("InputStreamReader（Adapter）の出力: " + sb.toString());
    }

    /**
     * Arrays.asList() も Adapter の一種です。
     * 配列（Array）を List インターフェースに適合させます。
     */
    static void showArraysAsListExample() {
        String[] array = {"Java 8", "Java 17", "Java 21"};

        // 配列を List インターフェースに適合させる Adapter
        List<String> list = Arrays.asList(array);
        System.out.println("Arrays.asList（Adapter）の出力: " + list);
    }

    public static void main(String[] args) throws IOException {
        System.out.println("=== Adapter パターン ===");
        System.out.println();

        // 既存クラスのインスタンスを作成
        LegacyDataReader legacyReader = new LegacyDataReader();

        // 直接使う場合（旧インターフェース）
        System.out.println("[旧インターフェース（直接呼び出し）]");
        System.out.println("fetchRawData(): " + legacyReader.fetchRawData());

        System.out.println();

        // Adapter を通じて使う（新インターフェース）
        Target adapter = new DataReaderAdapter(legacyReader);
        System.out.println("[新インターフェース（Adapter 経由）]");
        System.out.println("readData(): " + adapter.readData());

        System.out.println();
        System.out.println("=== Java 標準ライブラリの Adapter 例 ===");

        System.out.println();
        System.out.println("[InputStreamReader: InputStream → Reader]");
        showInputStreamReaderExample();

        System.out.println();
        System.out.println("[Arrays.asList: 配列 → List]");
        showArraysAsListExample();
    }
}
