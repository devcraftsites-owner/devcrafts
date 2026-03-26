import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

public class JsonSample {

    // Java 16+ record（イミュータブルなデータクラス）
    // Jackson 2.12+ は record をサポート。@JsonProperty でフィールド名を明示する
    record Person(
        @JsonProperty("name") String name,
        @JsonProperty("age") int age
    ) {}

    // ObjectMapper は static final で1つだけ作成
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static void main(String[] args) throws Exception {

        // ① シリアライズ（record → JSON）
        var person = new Person("山田太郎", 30);
        var json = MAPPER.writeValueAsString(person);
        System.out.println("シリアライズ: " + json);
        // → {"name":"山田太郎","age":30}

        // ② デシリアライズ（JSON → record）
        var input = "{\"name\":\"鈴木花子\",\"age\":25}";
        var parsed = MAPPER.readValue(input, Person.class);
        System.out.println("デシリアライズ: " + parsed);

        // ③ テキストブロック（Java 15+）で JSON 文字列をわかりやすく書く
        var nested = """
                {
                    "id": 1,
                    "address": {
                        "city": "Tokyo",
                        "zip": "100-0001"
                    }
                }
                """;
        JsonNode root = MAPPER.readTree(nested);
        System.out.println("id: " + root.get("id").asInt());
        System.out.println("city: " + root.path("address").path("city").asText());

        // ④ 整形出力
        var pretty = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(person);
        System.out.println("整形出力:\n" + pretty);

        // ⑤ 配列 JSON → リスト
        var arrayJson = """
                [{"name":"田中","age":20},{"name":"佐藤","age":35}]
                """;
        var people = List.of(MAPPER.readValue(arrayJson, Person[].class));
        people.forEach(p -> System.out.println("配列要素: " + p));

        // ⑥ リスト → JSON
        var list = List.of(new Person("高橋", 28), new Person("伊藤", 32));
        System.out.println("リスト JSON: " + MAPPER.writeValueAsString(list));
    }
}
