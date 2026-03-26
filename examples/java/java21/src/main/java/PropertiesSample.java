import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

public class PropertiesSample {

    // ① クラスパスから読み込む（Java 21: var + try-with-resources）
    public static Properties loadFromClasspath(String resourceName) throws IOException {
        InputStream is = PropertiesSample.class.getClassLoader()
                .getResourceAsStream(resourceName);
        if (is == null) {
            throw new FileNotFoundException("リソースが見つかりません: " + resourceName);
        }
        var props = new Properties();
        try (var reader = new java.io.InputStreamReader(is, StandardCharsets.UTF_8)) {
            props.load(reader);
        }
        return props;
    }

    // ② ファイルパスから読み込む
    public static Properties loadFromFile(Path path) throws IOException {
        var props = new Properties();
        try (var reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            props.load(reader);
        }
        return props;
    }

    // ③ デフォルト値付き取得
    public static String get(Properties props, String key, String defaultValue) {
        return props.getProperty(key, defaultValue);
    }

    // ④ 数値として取得（Java 21: switch 式でパース失敗時のデフォルト処理）
    public static int getInt(Properties props, String key, int defaultValue) {
        var value = props.getProperty(key);
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
        var props = new Properties();
        props.setProperty("db.url", "jdbc:postgresql://localhost:5432/mydb");
        props.setProperty("db.user", "admin");
        props.setProperty("app.name", "サンプルアプリ");
        props.setProperty("timeout.seconds", "30");

        System.out.println(props.getProperty("db.url"));
        System.out.println(props.getProperty("app.name"));
        System.out.println(get(props, "timeout.seconds", "60")); // 30
        System.out.println(get(props, "max.retry", "3"));        // 3（デフォルト）
        System.out.println(getInt(props, "timeout.seconds", 60)); // 30

        System.out.println("\n--- 全プロパティ ---");
        props.stringPropertyNames().stream()
                .sorted()
                .forEach(key -> System.out.println(key + " = " + props.getProperty(key)));
    }
}
