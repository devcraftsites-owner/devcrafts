import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class SerializationBasicSample {

    // Java 17: record を使った不変なデータクラス
    // ただし record は Serializable を自動的には実装しない点に注意
    // シリアライズするには明示的に implements Serializable を追加する必要がある
    record Employee(
        String employeeId,
        String name,
        String department,
        int salary
    ) implements Serializable {
        // record に serialVersionUID を定義する場合は static フィールドとして宣言
        @SuppressWarnings("serial")
        private static final long serialVersionUID = 1L;
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        // var を使ったローカル変数型推論（Java 10+）
        var employees = new ArrayList<Employee>();
        employees.add(new Employee("E001", "田中太郎", "開発部", 400000));
        employees.add(new Employee("E002", "鈴木花子", "営業部", 380000));

        var filePath = "employees.dat";

        // シリアライズ（オブジェクト → バイト列 → ファイル）
        try (var oos = new ObjectOutputStream(new FileOutputStream(filePath))) {
            oos.writeObject(employees);
            System.out.println("シリアライズ完了: " + filePath);
        }

        // デシリアライズ（ファイル → バイト列 → オブジェクト）
        try (var ois = new ObjectInputStream(new FileInputStream(filePath))) {
            @SuppressWarnings("unchecked")
            var loaded = (List<Employee>) ois.readObject();
            System.out.println("デシリアライズ完了:");
            for (var emp : loaded) {
                // record のコンポーネントアクセサを使う（getter ではなく emp.name() 形式）
                System.out.println("  id=" + emp.employeeId()
                        + ", name=" + emp.name()
                        + ", dept=" + emp.department()
                        + ", salary=" + emp.salary());
            }
        }

        // ファイル削除（クリーンアップ）
        new File(filePath).delete();
    }
}
