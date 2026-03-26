import java.io.*;

public class RecordSerializeSample {

    // Java 8: Record の代わりに不変クラスで実装
    static class UserDto implements Serializable {
        private static final long serialVersionUID = 1L;

        private final String id;
        private final String name;
        private final int age;

        UserDto(String id, String name, int age) {
            this.id = id;
            this.name = name;
            this.age = age;
        }

        String getId() { return id; }
        String getName() { return name; }
        int getAge() { return age; }

        @Override
        public String toString() {
            return "UserDto{id='" + id + "', name='" + name + "', age=" + age + "}";
        }
    }

    // 手動 JSON 変換（Pure Java / Java 8）
    static String toJson(UserDto user) {
        return "{\"id\":\"" + user.getId() + "\","
                + "\"name\":\"" + user.getName() + "\","
                + "\"age\":" + user.getAge() + "}";
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        UserDto user = new UserDto("U001", "田中太郎", 30);
        System.out.println("元オブジェクト: " + user);

        // 手動 JSON 変換
        String json = toJson(user);
        System.out.println("JSON: " + json);

        // バイナリシリアライズ
        byte[] bytes;
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(user);
            bytes = baos.toByteArray();
        }

        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             ObjectInputStream ois = new ObjectInputStream(bais)) {
            UserDto loaded = (UserDto) ois.readObject();
            System.out.println("復元: " + loaded);
        }
    }
}
