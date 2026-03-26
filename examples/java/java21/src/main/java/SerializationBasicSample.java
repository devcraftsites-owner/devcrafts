import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class SerializationBasicSample {

    // Java 21: record + Serializable（明示的に implements が必要）
    // record は自動的に Serializable にならないため注意
    record Employee(
        String employeeId,
        String name,
        String department,
        int salary
    ) implements Serializable {
        @SuppressWarnings("serial")
        private static final long serialVersionUID = 1L;
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        var employees = new ArrayList<Employee>();
        employees.add(new Employee("E001", "田中太郎", "開発部", 400000));
        employees.add(new Employee("E002", "鈴木花子", "営業部", 380000));

        var filePath = "employees.dat";

        // シリアライズ
        try (var oos = new ObjectOutputStream(new FileOutputStream(filePath))) {
            oos.writeObject(employees);
            System.out.println("シリアライズ完了: " + filePath);
        }

        // デシリアライズ
        try (var ois = new ObjectInputStream(new FileInputStream(filePath))) {
            @SuppressWarnings("unchecked")
            var loaded = (List<Employee>) ois.readObject();
            System.out.println("デシリアライズ完了:");

            // Java 21: switch パターンマッチングで型ごとの処理（参考例）
            for (var emp : loaded) {
                // record のコンポーネントアクセサを使う
                var summary = "id=" + emp.employeeId()
                        + ", name=" + emp.name()
                        + ", dept=" + emp.department()
                        + ", salary=" + emp.salary();
                System.out.println("  " + summary);
            }
        }

        // ファイル削除（クリーンアップ）
        new File(filePath).delete();
    }
}
