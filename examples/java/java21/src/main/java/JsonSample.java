import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

public class JsonSample {

    // Java 16+ record + @JsonIgnoreProperties（未知フィールドを無視してデシリアライズ）
    // 実務では API レスポンスに新しいフィールドが追加されても壊れないようにするため重要
    @JsonIgnoreProperties(ignoreUnknown = true)
    record Person(
        @JsonProperty("name") String name,
        @JsonProperty("age") int age
    ) {}

    // sealed interface（Java 17+）でレスポンス形式を型安全に表現する例
    sealed interface ApiResponse permits ApiResponse.Success, ApiResponse.Error {
        record Success(int statusCode, String body) implements ApiResponse {}
        record Error(int statusCode, String message) implements ApiResponse {}
    }

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static void main(String[] args) throws Exception {

        // ① シリアライズ
        var person = new Person("山田太郎", 30);
        var json = MAPPER.writeValueAsString(person);
        System.out.println("シリアライズ: " + json);

        // ② デシリアライズ（未知フィールドを含む JSON も @JsonIgnoreProperties で安全に処理）
        var inputWithExtra = """
                {"name":"鈴木花子","age":25,"email":"hanako@example.com"}
                """;
        var parsed = MAPPER.readValue(inputWithExtra, Person.class);
        System.out.println("デシリアライズ（未知フィールド無視）: " + parsed);

        // ③ テキストブロック + JsonNode
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

        // ⑤ sealed interface + pattern matching switch（Java 21+）で処理を分岐
        ApiResponse response = new ApiResponse.Success(200, json);
        String result = switch (response) {
            case ApiResponse.Success s -> "成功: " + s.body();
            case ApiResponse.Error e -> "エラー " + e.statusCode() + ": " + e.message();
        };
        System.out.println(result);

        // ⑥ リスト → JSON
        var list = List.of(new Person("高橋", 28), new Person("伊藤", 32));
        System.out.println("リスト JSON: " + MAPPER.writeValueAsString(list));
    }
}
