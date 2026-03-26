import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Pure Java による簡易 YAML パーサー（フラット key: value 形式のみ対応）。
 * ネスト構造・リスト・アンカー等には対応していません。
 * 複雑な YAML を扱う場合は SnakeYAML を使用してください（Java 17+ タブ参照）。
 */
public class YamlSample {

    /**
     * フラット形式の YAML 文字列を解析して Map に変換する。
     * コメント行（# で始まる行）・空行はスキップする。
     * 値に含まれる引用符は除去する。
     */
    public static Map<String, String> parseFlat(String yaml) throws IOException {
        Map<String, String> result = new LinkedHashMap<>();
        BufferedReader reader = new BufferedReader(new StringReader(yaml));
        String line;
        while ((line = reader.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith("#")) {
                continue; // 空行・コメントをスキップ
            }
            int colonIdx = line.indexOf(": ");
            if (colonIdx > 0) {
                String key = line.substring(0, colonIdx).trim();
                String value = line.substring(colonIdx + 2).trim();
                // 引用符を除去（"value" や 'value' → value）
                if ((value.startsWith("\"") && value.endsWith("\""))
                        || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                result.put(key, value);
            }
        }
        return result;
    }

    /**
     * Map を YAML 文字列として出力する（フラット形式）。
     */
    public static String dumpFlat(Map<String, String> data) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : data.entrySet()) {
            sb.append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
        }
        return sb.toString();
    }

    public static void main(String[] args) throws IOException {

        // ① YAML 文字列を解析（フラット形式）
        String yaml =
            "# アプリケーション設定\n" +
            "app.name: java-recipes\n" +
            "app.version: 1.0.0\n" +
            "server.host: localhost\n" +
            "server.port: 8080\n" +
            "database.url: jdbc:postgresql://localhost/mydb\n";

        Map<String, String> config = parseFlat(yaml);
        System.out.println("=== 解析結果 ===");
        for (Map.Entry<String, String> entry : config.entrySet()) {
            System.out.println(entry.getKey() + " = " + entry.getValue());
        }

        // ② Map を YAML 文字列として出力
        Map<String, String> newConfig = new LinkedHashMap<>();
        newConfig.put("app.name", "my-app");
        newConfig.put("app.version", "2.0.0");
        newConfig.put("server.host", "example.com");
        newConfig.put("server.port", "443");
        System.out.println("\n=== YAML 出力 ===");
        System.out.println(dumpFlat(newConfig));

        System.out.println("注意: この Pure Java 実装はフラット形式のみ対応です。");
        System.out.println("ネスト構造やリストが必要な場合は SnakeYAML を使用してください。");
    }
}
