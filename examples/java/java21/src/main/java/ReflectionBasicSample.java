import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ReflectionBasicSample {

    // サンプル対象クラス（record を使用 Java 16+）
    record Person(String name, int age) {
        private String secret() {
            return "秘密のメソッド: " + name;
        }
    }

    // リフレクション結果を型安全に表す sealed interface（Java 17+）
    sealed interface ReflectResult permits ReflectResult.Field, ReflectResult.Method {
        record Field(String name, String type, String modifier) implements ReflectResult {}
        record Method(String name, String returnType, String modifier) implements ReflectResult {}
    }

    // クラスのフィールドとメソッドを ReflectResult のリストにまとめる
    public static List<ReflectResult> inspect(Class<?> clazz) {
        var results = new ArrayList<ReflectResult>();

        for (var f : clazz.getDeclaredFields()) {
            results.add(new ReflectResult.Field(
                f.getName(),
                f.getType().getSimpleName(),
                Modifier.toString(f.getModifiers())
            ));
        }

        for (var m : clazz.getDeclaredMethods()) {
            results.add(new ReflectResult.Method(
                m.getName(),
                m.getReturnType().getSimpleName(),
                Modifier.toString(m.getModifiers())
            ));
        }

        return results;
    }

    // switch パターンマッチングで Field/Method を出力（Java 21+）
    public static void printResult(ReflectResult result) {
        switch (result) {
            case ReflectResult.Field f ->
                System.out.println("  [フィールド] " + f.modifier() + " " + f.type() + " " + f.name());
            case ReflectResult.Method m ->
                System.out.println("  [メソッド]   " + m.modifier() + " " + m.returnType() + " " + m.name() + "()");
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== クラス情報取得 ===");
        var clazz = Person.class;
        System.out.println("クラス名: " + clazz.getSimpleName());
        System.out.println("record クラス: " + clazz.isRecord());

        System.out.println("\n=== record コンポーネント一覧 ===");
        for (var component : clazz.getRecordComponents()) {
            System.out.println("  " + component.getType().getSimpleName() + " " + component.getName());
        }

        System.out.println("\n=== sealed interface + switch パターンマッチングで表示 ===");
        var results = inspect(clazz);
        for (var r : results) {
            printResult(r);
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
        var getNameMethod = clazz.getMethod("name");
        System.out.println("name(): " + getNameMethod.invoke(person));
    }
}
