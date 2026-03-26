import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

public class PropertiesSample {

    // ① クラスパスからプロパティファイルを読み込む（UTF-8 明示）
    //    ※ Java 8 の Properties.load(InputStream) は ISO-8859-1 で読み込むため
    //      InputStreamReader でラップして UTF-8 を指定する必要がある
    public static Properties loadFromClasspath(String resourceName) throws IOException {
        InputStream is = PropertiesSample.class.getClassLoader()
                .getResourceAsStream(resourceName);
        if (is == null) {
            throw new FileNotFoundException("クラスパスにリソースが見つかりません: " + resourceName);
        }
        Properties props = new Properties();
        try (InputStreamReader reader = new InputStreamReader(is, StandardCharsets.UTF_8)) {
            props.load(reader);
        }
        return props;
    }

    // ② ファイルパスから読み込む（UTF-8 明示）
    public static Properties loadFromFile(String filePath) throws IOException {
        Properties props = new Properties();
        try (InputStreamReader reader = new InputStreamReader(
                new FileInputStream(filePath), StandardCharsets.UTF_8)) {
            props.load(reader);
        }
        return props;
    }

    // ③ デフォルト値付きで安全に取得
    public static String get(Properties props, String key, String defaultValue) {
        return props.getProperty(key, defaultValue);
    }

    // ④ 数値として取得（変換失敗時はデフォルト値）
    public static int getInt(Properties props, String key, int defaultValue) {
        String value = props.getProperty(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public static void main(String[] args) {
        // サンプル用にインメモリで Properties を構築（実際はファイルから読み込む）
        Properties props = new Properties();
        props.setProperty("db.url", "jdbc:postgresql://localhost:5432/mydb");
        props.setProperty("db.user", "admin");
        props.setProperty("app.name", "サンプルアプリ");
        props.setProperty("timeout.seconds", "30");

        // 取得
        System.out.println(props.getProperty("db.url"));
        System.out.println(props.getProperty("app.name"));

        // デフォルト値付き
        System.out.println(get(props, "timeout.seconds", "60"));    // 30（設定あり）
        System.out.println(get(props, "max.retry", "3"));           // 3（デフォルト）

        // 数値として取得
        System.out.println(getInt(props, "timeout.seconds", 60));   // 30
        System.out.println(getInt(props, "max.retry", 3));          // 3（デフォルト）

        // 全キーを一覧表示
        System.out.println("\n--- 全プロパティ ---");
        props.stringPropertyNames().stream()
                .sorted()
                .forEach(key -> System.out.println(key + " = " + props.getProperty(key)));
    }
}
