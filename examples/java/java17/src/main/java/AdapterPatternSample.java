import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Arrays;
import java.util.List;

/**
 * DP-06: Adapter パターン（Java 17）
 *
 * Java 17 では var（型推論）と record が使用できます。
 * AdapterResult record を使ってアダプターの変換前後を記録できます。
 */
public class AdapterPatternSample {

    // ===== 新しいインターフェース（Target） =====

    interface Target {
        String readData();
    }

    // ===== 既存クラス（Adaptee）: 変更不可 =====

    static class LegacyDataReader {
        public String fetchRawData() {
            return "ID:001,NAME:田中太郎,AGE:30";
        }
    }

    // ===== Java 17: record でアダプターの変換結果を表現 =====

    /**
     * アダプターの変換結果を表す record（Java 17+）。
     * source: 変換前のデータ（レガシー形式）
     * adapted: 変換後のデータ（新形式）
     */
    record AdapterResult(String source, String adapted) {}

    // ===== Adapter クラス =====

    /**
     * Target インターフェースを実装し、LegacyDataReader に処理を委譲する Adapter。
     * AdapterResult を使って変換前後のデータを保持します（Java 17+）。
     */
    static class DataReaderAdapter implements Target {

        private final LegacyDataReader legacyReader;

        public DataReaderAdapter(LegacyDataReader legacyReader) {
            this.legacyReader = legacyReader;
        }

        @Override
        public String readData() {
            var rawData = legacyReader.fetchRawData(); // var で型推論
            return convertFormat(rawData);
        }

        /**
         * 変換前後のデータを AdapterResult として返します。
         * デバッグや監査ログに役立ちます。
         */
        public AdapterResult readDataWithResult() {
            var rawData = legacyReader.fetchRawData();
            var adapted = convertFormat(rawData);
            return new AdapterResult(rawData, adapted); // record を生成
        }

        private String convertFormat(String rawData) {
            var pairs = rawData.split(",");
            var sb = new StringBuilder("[");
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

    static void showInputStreamReaderExample() throws IOException {
        var text = "こんにちは、Java！";
        var bytes = text.getBytes("UTF-8");

        var inputStream = new ByteArrayInputStream(bytes);
        Reader reader = new InputStreamReader(inputStream, "UTF-8");

        var sb = new StringBuilder();
        int ch;
        while ((ch = reader.read()) != -1) {
            sb.append((char) ch);
        }
        System.out.println("InputStreamReader（Adapter）の出力: " + sb.toString());
    }

    static void showArraysAsListExample() {
        var array = new String[]{"Java 8", "Java 17", "Java 21"};
        var list = Arrays.asList(array);
        System.out.println("Arrays.asList（Adapter）の出力: " + list);
    }

    public static void main(String[] args) throws IOException {
        System.out.println("=== Adapter パターン（Java 17）===");
        System.out.println();

        var legacyReader = new LegacyDataReader();
        var adapter = new DataReaderAdapter(legacyReader);

        System.out.println("[旧インターフェース（直接呼び出し）]");
        System.out.println("fetchRawData(): " + legacyReader.fetchRawData());

        System.out.println();
        System.out.println("[新インターフェース（Adapter 経由）]");
        System.out.println("readData(): " + adapter.readData());

        System.out.println();
        System.out.println("[AdapterResult record で変換前後を記録（Java 17+）]");
        // record のフィールドを getter で取得
        var result = adapter.readDataWithResult();
        System.out.println("変換前: " + result.source());
        System.out.println("変換後: " + result.adapted());

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
