import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class YamlSample {

    public static void main(String[] args) {

        // ① Map → YAML 文字列（シリアライズ）
        var data = new LinkedHashMap<String, Object>();
        data.put("name", "山田太郎");
        data.put("age", 30);
        data.put("hobbies", List.of("読書", "プログラミング", "旅行"));

        var yaml = new Yaml();
        var output = yaml.dump(data);
        System.out.println("=== シリアライズ ===");
        System.out.println(output);

        // ② YAML 文字列 → Map（デシリアライズ）
        var yamlStr = """
                name: 鈴木花子
                age: 25
                department: 開発部
                """;
        Map<String, Object> parsed = yaml.load(yamlStr);
        System.out.println("=== デシリアライズ ===");
        System.out.println("name: " + parsed.get("name"));
        System.out.println("age: " + parsed.get("age"));
        System.out.println("department: " + parsed.get("department"));

        // ③ ネストした YAML（Map の中に Map）
        var nested = """
                server:
                  host: localhost
                  port: 8080
                database:
                  url: jdbc:postgresql://localhost/mydb
                  pool-size: 10
                """;
        Map<String, Object> config = yaml.load(nested);
        Map<String, Object> server = (Map<String, Object>) config.get("server");
        System.out.println("\n=== ネスト構造 ===");
        System.out.println("server.host: " + server.get("host"));
        System.out.println("server.port: " + server.get("port"));

        // ④ リストを含む YAML
        var withList = """
                fruits:
                  - りんご
                  - バナナ
                  - みかん
                """;
        Map<String, Object> listData = yaml.load(withList);
        var fruits = (List<String>) listData.get("fruits");
        System.out.println("\n=== リスト ===");
        fruits.forEach(f -> System.out.println("- " + f));

        // ⑤ 整形出力（BLOCK スタイルで読みやすく）
        var options = new DumperOptions();
        options.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
        options.setIndent(2);
        var prettyYaml = new Yaml(options);
        System.out.println("\n=== 整形出力 ===");
        System.out.println(prettyYaml.dump(data));
    }
}
