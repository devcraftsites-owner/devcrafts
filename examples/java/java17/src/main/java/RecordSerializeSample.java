import java.io.*;

public class RecordSerializeSample {

    // Java 17: record で簡潔に定義
    // Serializable を implements しないとバイナリシリアライズ不可（注意！）
    record UserDto(String id, String name, int age) implements Serializable {
        // serialVersionUID を明示的に定義することを推奨
        private static final long serialVersionUID = 1L;
    }

    // 手動 JSON 変換（Pure Java / Java 17）
    static String toJson(UserDto user) {
        return "{\"id\":\"" + user.id() + "\","
                + "\"name\":\"" + user.name() + "\","
                + "\"age\":" + user.age() + "}";
    }

    // Jackson を使う場合（依存追加が必要）
    // record UserDto(String id, String name, int age) implements Serializable {}
    // ObjectMapper mapper = new ObjectMapper();
    // String json = mapper.writeValueAsString(user); // → {"id":"U001","name":"田中太郎","age":30}
    // UserDto restored = mapper.readValue(json, UserDto.class);

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        var user = new UserDto("U001", "田中太郎", 30);
        System.out.println("元オブジェクト: " + user);

        // 手動 JSON 変換
        var json = toJson(user);
        System.out.println("JSON: " + json);

        // バイナリシリアライズ（Serializable を implements している場合のみ可能）
        byte[] bytes;
        try (var baos = new ByteArrayOutputStream();
             var oos = new ObjectOutputStream(baos)) {
            oos.writeObject(user);
            bytes = baos.toByteArray();
        }

        try (var bais = new ByteArrayInputStream(bytes);
             var ois = new ObjectInputStream(bais)) {
            var loaded = (UserDto) ois.readObject();
            System.out.println("復元: " + loaded);
        }
    }
}
