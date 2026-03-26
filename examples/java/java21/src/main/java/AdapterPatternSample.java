import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.Arrays;

/**
 * DP-06: Adapter パターン（Java 21）
 *
 * Java 21 では sealed interface と switch パターンマッチングを使って、
 * データソースの種類を型安全に表現し、各ソースに応じたアダプター処理を記述できます。
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

    // ===== Java 21: sealed interface でデータソースの種類を表現 =====

    /**
     * データソースの種類を表す sealed interface（Java 21+）。
     * Legacy: 旧システムのデータソース
     * Modern: 新システムのデータソース
     * File: ファイルからのデータソース
     */
    sealed interface DataSource permits DataSource.Legacy, DataSource.Modern, DataSource.File {
        /** 旧システムのデータソース */
        record Legacy(String rawFormat) implements DataSource {}
        /** 新システムのデータソース */
        record Modern(String jsonData) implements DataSource {}
        /** ファイルのデータソース */
        record File(String filePath, String encoding) implements DataSource {}
    }

    // ===== Adapter クラス =====

    static class DataReaderAdapter implements Target {
        private final LegacyDataReader legacyReader;

        public DataReaderAdapter(LegacyDataReader legacyReader) {
            this.legacyReader = legacyReader;
        }

        @Override
        public String readData() {
            var rawData = legacyReader.fetchRawData();
            return convertFormat(rawData);
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

    // ===== switch パターンマッチングでデータソースに応じた変換 =====

    /**
     * DataSource の種類に応じてデータを適合（adapt）します。
     * sealed interface のおかげで switch が全パターンを網羅しているかコンパイル時に確認されます。
     *
     * @param source データソース
     * @return 変換後のデータ文字列
     */
    static String adapt(DataSource source) {
        return switch (source) {
            // record deconstruction パターン: フィールドを直接取り出せる（Java 21+）
            case DataSource.Legacy(var rawFormat) -> {
                // 旧形式（KEY:VALUE）を新形式（[KEY=VALUE]）に変換
                var pairs = rawFormat.split(",");
                var sb = new StringBuilder("[");
                for (int i = 0; i < pairs.length; i++) {
                    sb.append(pairs[i].replace(":", "="));
                    if (i < pairs.length - 1) {
                        sb.append(", ");
                    }
                }
                sb.append("]");
                yield sb.toString();
            }
            case DataSource.Modern(var jsonData) -> {
                // 既に新形式なのでそのまま返す
                yield "（変換不要）" + jsonData;
            }
            case DataSource.File(var filePath, var encoding) -> {
                // ファイルパスとエンコーディングを表示
                yield "（ファイル読込）パス=" + filePath + ", エンコード=" + encoding;
            }
        };
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

    public static void main(String[] args) throws IOException {
        System.out.println("=== Adapter パターン（Java 21）===");
        System.out.println();

        var legacyReader = new LegacyDataReader();
        var adapter = new DataReaderAdapter(legacyReader);

        System.out.println("[従来の Adapter（委譲）]");
        System.out.println("fetchRawData(): " + legacyReader.fetchRawData());
        System.out.println("readData():     " + adapter.readData());

        System.out.println();
        System.out.println("=== sealed interface + switch パターンマッチング（Java 21+）===");

        var legacySource = new DataSource.Legacy("ID:001,NAME:田中太郎,AGE:30");
        System.out.println("[Legacy データソース]");
        System.out.println(adapt(legacySource));

        System.out.println();
        var modernSource = new DataSource.Modern("{\"id\":1,\"name\":\"田中太郎\"}");
        System.out.println("[Modern データソース]");
        System.out.println(adapt(modernSource));

        System.out.println();
        var fileSource = new DataSource.File("/data/users.csv", "UTF-8");
        System.out.println("[File データソース]");
        System.out.println(adapt(fileSource));

        System.out.println();
        System.out.println("=== Java 標準ライブラリの Adapter 例 ===");

        System.out.println();
        System.out.println("[InputStreamReader: InputStream → Reader]");
        showInputStreamReaderExample();

        System.out.println();
        System.out.println("[Arrays.asList: 配列 → List]");
        var array = new String[]{"Java 8", "Java 17", "Java 21"};
        var list = Arrays.asList(array);
        System.out.println("Arrays.asList（Adapter）の出力: " + list);
    }
}
