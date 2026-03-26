import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Arrays;
import java.util.List;

public class JsonSample {

    // ① Jackson 用 POJO（getter/setter が必須）
    static class Person {
        private String name;
        private int age;

        // デフォルトコンストラクタ：Jackson がデシリアライズ時に内部で使用するため必須
        public Person() {}

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }

        @Override
        public String toString() {
            return "Person{name='" + name + "', age=" + age + "}";
        }
    }

    // ObjectMapper は生成コストが高いため static final で1つだけ作成する
    // メソッドごとに new ObjectMapper() するのはNG
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static void main(String[] args) throws Exception {

        // ② Java オブジェクト → JSON 文字列（シリアライズ）
        Person person = new Person("山田太郎", 30);
        String json = MAPPER.writeValueAsString(person);
        System.out.println("シリアライズ: " + json);
        // → {"name":"山田太郎","age":30}

        // ③ JSON 文字列 → Java オブジェクト（デシリアライズ）
        String input = "{\"name\":\"鈴木花子\",\"age\":25}";
        Person parsed = MAPPER.readValue(input, Person.class);
        System.out.println("デシリアライズ: " + parsed);

        // ④ 整形出力（pretty print）
        String pretty = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(person);
        System.out.println("整形出力:\n" + pretty);

        // ⑤ ネストした JSON を JsonNode（ツリー構造）で汎用的に扱う
        String nested = "{\"id\":1,\"address\":{\"city\":\"Tokyo\",\"zip\":\"100-0001\"}}";
        JsonNode root = MAPPER.readTree(nested);
        System.out.println("id: " + root.get("id").asInt());
        System.out.println("city: " + root.path("address").path("city").asText());
        // path() は存在しないキーでも NullPointerException が発生しない（get() は null を返す）

        // ⑥ 配列 JSON → オブジェクト配列
        String arrayJson = "[{\"name\":\"田中\",\"age\":20},{\"name\":\"佐藤\",\"age\":35}]";
        Person[] people = MAPPER.readValue(arrayJson, Person[].class);
        for (Person p : people) {
            System.out.println("配列要素: " + p);
        }

        // ⑦ オブジェクトリスト → JSON
        List<Person> list = Arrays.asList(new Person("高橋", 28), new Person("伊藤", 32));
        String listJson = MAPPER.writeValueAsString(list);
        System.out.println("リスト JSON: " + listJson);
    }
}
