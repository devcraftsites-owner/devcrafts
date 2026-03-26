import java.lang.reflect.*;
import java.util.Arrays;

public class ReflectionBasicSample {

    // Java 17 では record でシンプルにデータクラスを定義できる（Java 16+）
    record Person(String name, int age) {
        private String secret() {
            return "秘密のメソッド: " + name;
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== クラス情報取得 ===");
        var clazz = Person.class;
        System.out.println("クラス名: " + clazz.getSimpleName());
        System.out.println("record クラス: " + clazz.isRecord());

        System.out.println("\n=== record コンポーネント一覧（Java 16+） ===");
        for (var component : clazz.getRecordComponents()) {
            System.out.println("  " + component.getType().getSimpleName() + " " + component.getName());
        }

        System.out.println("\n=== フィールド一覧 ===");
        for (var field : clazz.getDeclaredFields()) {
            System.out.println("  " + Modifier.toString(field.getModifiers())
                + " " + field.getType().getSimpleName() + " " + field.getName());
        }

        System.out.println("\n=== メソッド一覧 ===");
        for (var method : clazz.getDeclaredMethods()) {
            System.out.println("  " + Modifier.toString(method.getModifiers())
                + " " + method.getReturnType().getSimpleName() + " " + method.getName() + "()");
        }

        System.out.println("\n=== コンストラクタ経由でインスタンス生成 ===");
        var constructor = clazz.getDeclaredConstructor(String.class, int.class);
        var person = constructor.newInstance("田中太郎", 25);
        System.out.println(person);

        System.out.println("\n=== private メソッドの呼び出し ===");
        var secretMethod = clazz.getDeclaredMethod("secret");
        secretMethod.setAccessible(true);
        var result = (String) secretMethod.invoke(person);
        System.out.println(result);

        System.out.println("\n=== public メソッドの動的呼び出し ===");
        var getNameMethod = clazz.getMethod("name"); // record のアクセサは引数なし
        System.out.println("name(): " + getNameMethod.invoke(person));

        System.out.println("\n=== ラムダ + メソッド参照で全パブリックメソッドを表示 ===");
        Arrays.stream(clazz.getMethods())
            .filter(m -> m.getDeclaringClass() != Object.class)
            .forEach(m -> System.out.println("  " + m.getName() + "()"));
    }
}
