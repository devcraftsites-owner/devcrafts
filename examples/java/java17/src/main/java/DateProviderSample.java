import java.time.LocalDate;
import java.time.LocalDateTime;

public class DateProviderSample {

    // ① DateProvider インターフェース（Java 8 と同じ定義）
    interface DateProvider {
        LocalDate getToday();
        LocalDateTime getNow();
    }

    // ② プロダクション実装
    static class SystemDateProvider implements DateProvider {
        @Override
        public LocalDate getToday() {
            return LocalDate.now();
        }

        @Override
        public LocalDateTime getNow() {
            return LocalDateTime.now();
        }
    }

    // ③ テスト用固定日付プロバイダー（Java 17: record で簡潔に実装）
    // ※ record はフィールドが final・不変なのでテスト用に最適
    record FixedDateProvider(LocalDate fixedDate) implements DateProvider {
        @Override
        public LocalDate getToday() {
            return fixedDate;
        }

        @Override
        public LocalDateTime getNow() {
            return fixedDate.atStartOfDay();
        }
    }

    // ④ Java 17: ConfigurableDateProvider（設定ファイルの値があれば固定、なければ実時刻）
    static class ConfigurableDateProvider implements DateProvider {
        private final LocalDate overrideDate;

        // プロパティから "date.fixed=2024-04-01" のような値を読み込む想定
        ConfigurableDateProvider(String fixedDateStr) {
            if (fixedDateStr != null && !fixedDateStr.isBlank()) {
                this.overrideDate = LocalDate.parse(fixedDateStr);
            } else {
                this.overrideDate = null; // null = システム日時を使う
            }
        }

        @Override
        public LocalDate getToday() {
            if (overrideDate != null) {
                return overrideDate;
            }
            return LocalDate.now();
        }

        @Override
        public LocalDateTime getNow() {
            if (overrideDate != null) {
                return overrideDate.atStartOfDay();
            }
            return LocalDateTime.now();
        }
    }

    // ⑤ ビジネスロジック（DateProvider を DI で受け取る）
    static class TaxRateService {
        private final DateProvider dateProvider;

        TaxRateService(DateProvider dateProvider) {
            this.dateProvider = dateProvider;
        }

        public int getTaxRate() {
            var today = dateProvider.getToday();
            var taxRaiseDate = LocalDate.of(2019, 10, 1);
            return !today.isBefore(taxRaiseDate) ? 10 : 8;
        }
    }

    public static void main(String[] args) {
        // プロダクション
        var prodService = new TaxRateService(new SystemDateProvider());
        System.out.println("現在の消費税率: " + prodService.getTaxRate() + "%");

        // record を使ったテスト用固定日付プロバイダー
        var beforeService = new TaxRateService(new FixedDateProvider(LocalDate.of(2019, 9, 30)));
        System.out.println("2019/9/30 の税率: " + beforeService.getTaxRate() + "%"); // 8%

        var afterService = new TaxRateService(new FixedDateProvider(LocalDate.of(2019, 10, 1)));
        System.out.println("2019/10/1 の税率: " + afterService.getTaxRate() + "%");  // 10%

        // 設定ファイル読み込み想定（固定日付あり）
        var configProvider = new ConfigurableDateProvider("2019-09-30");
        System.out.println("設定固定日: " + configProvider.getToday()); // 2019-09-30

        // 設定ファイルに日付なし → システム日時
        var noConfigProvider = new ConfigurableDateProvider(null);
        System.out.println("設定なし: " + noConfigProvider.getToday()); // 今日の日付
    }
}
