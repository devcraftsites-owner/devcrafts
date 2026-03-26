import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class SerializationBasicSample {

    // シリアライズ対象クラス（Serializable を実装）
    static class Employee implements Serializable {
        private static final long serialVersionUID = 1L;

        private final String employeeId;
        private final String name;
        private final String department;
        private int salary;

        Employee(String employeeId, String name, String department, int salary) {
            this.employeeId = employeeId;
            this.name = name;
            this.department = department;
            this.salary = salary;
        }

        @Override
        public String toString() {
            return "Employee{id='" + employeeId + "', name='" + name
                    + "', dept='" + department + "', salary=" + salary + "}";
        }
    }

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        // シリアライズするオブジェクトを作成
        List<Employee> employees = new ArrayList<>();
        employees.add(new Employee("E001", "田中太郎", "開発部", 400000));
        employees.add(new Employee("E002", "鈴木花子", "営業部", 380000));

        String filePath = "employees.dat";

        // シリアライズ（オブジェクト → バイト列 → ファイル）
        try (ObjectOutputStream oos = new ObjectOutputStream(
                new FileOutputStream(filePath))) {
            oos.writeObject(employees);
            System.out.println("シリアライズ完了: " + filePath);
        }

        // デシリアライズ（ファイル → バイト列 → オブジェクト）
        try (ObjectInputStream ois = new ObjectInputStream(
                new FileInputStream(filePath))) {
            @SuppressWarnings("unchecked")
            List<Employee> loaded = (List<Employee>) ois.readObject();
            System.out.println("デシリアライズ完了:");
            for (Employee emp : loaded) {
                System.out.println("  " + emp);
            }
        }

        // ファイル削除（クリーンアップ）
        new File(filePath).delete();
    }
}
