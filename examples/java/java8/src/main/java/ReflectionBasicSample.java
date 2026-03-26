import java.lang.reflect.*;
import java.util.Arrays;

public class ReflectionBasicSample {

    // サンプル対象クラス
    static class Person {
        private String name;
        private int age;
        public String email;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
        }

        public String getName() { return name; }
        public int getAge() { return age; }

        private String secret() {
            return "秘密のメソッド: " + name;
        }

        @Override
        public String toString() {
            return "Person{name=" + name + ", age=" + age + "}";
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== クラス情報取得 ===");
        Class<?> clazz = Class.forName("ReflectionBasicSample$Person");
        System.out.println("クラス名: " + clazz.getSimpleName());
        System.out.println("パッケージ: " + clazz.getPackage());

        System.out.println("\n=== フィールド一覧 ===");
        for (Field field : clazz.getDeclaredFields()) {
            System.out.println("  " + Modifier.toString(field.getModifiers())
                + " " + field.getType().getSimpleName() + " " + field.getName());
        }

        System.out.println("\n=== メソッド一覧 ===");
        for (Method method : clazz.getDeclaredMethods()) {
            System.out.println("  " + Modifier.toString(method.getModifiers())
                + " " + method.getReturnType().getSimpleName() + " " + method.getName() + "()");
        }

        System.out.println("\n=== インスタンス生成 ===");
        Constructor<?> constructor = clazz.getDeclaredConstructor(String.class, int.class);
        Object person = constructor.newInstance("田中太郎", 25);
        System.out.println(person);

        System.out.println("\n=== private フィールドへのアクセス ===");
        Field nameField = clazz.getDeclaredField("name");
        nameField.setAccessible(true); // private フィールドにアクセス可能にする
        String name = (String) nameField.get(person);
        System.out.println("name (private): " + name);

        System.out.println("\n=== private メソッドの呼び出し ===");
        Method secretMethod = clazz.getDeclaredMethod("secret");
        secretMethod.setAccessible(true);
        String result = (String) secretMethod.invoke(person);
        System.out.println(result);

        System.out.println("\n=== public メソッドの動的呼び出し ===");
        Method getNameMethod = clazz.getMethod("getName");
        System.out.println("getName(): " + getNameMethod.invoke(person));
    }
}
