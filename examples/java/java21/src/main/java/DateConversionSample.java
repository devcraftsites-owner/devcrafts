import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

public class DateConversionSample {

    public static void main(String[] args) {

        // ① java.util.Date → LocalDate
        Date utilDate = new Date();
        LocalDate fromUtilDate = utilDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        System.out.println("util.Date → LocalDate: " + fromUtilDate);

        // ② LocalDate → java.util.Date
        LocalDate localDate = LocalDate.of(2024, 4, 1);
        Date toUtilDate = Date.from(
                localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
        System.out.println("LocalDate → util.Date: " + toUtilDate);

        // ③ java.sql.Date ↔ LocalDate
        java.sql.Date sqlDate = java.sql.Date.valueOf("2024-04-01");
        LocalDate fromSqlDate = sqlDate.toLocalDate();          // sql.Date → LocalDate
        java.sql.Date toSqlDate = java.sql.Date.valueOf(localDate); // LocalDate → sql.Date

        System.out.println("sql.Date → LocalDate: " + fromSqlDate);
        System.out.println("LocalDate → sql.Date: " + toSqlDate);
    }
}
