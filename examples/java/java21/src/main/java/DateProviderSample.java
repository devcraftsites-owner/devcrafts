import java.time.LocalDate;
import java.time.LocalDateTime;

public class DateProviderSample {

    // ① DateProvider インターフェース
    interface DateProvider {
        LocalDate getToday();
        LocalDateTime getNow();
    }

    // ② プロダクション実装
    static class SystemDateProvider implements DateProvider {
        @Override
        public LocalDate getToday() { return LocalDate.now(); }
        @Override
        public LocalDateTime getNow() { return LocalDateTime.now(); }
    }

    // ③ テスト用固定日付プロバイダー（record）
    record FixedDateProvider(LocalDate fixedDate) implements DateProvider {
        @Override
        public LocalDate getToday() { return fixedDate; }
        @Override
        public LocalDateTime getNow() { return fixedDate.atStartOfDay(); }
    }

    // ④ ConfigurableDateProvider（設定ファイルの日付があれば固定、なければ実時刻）
    static class ConfigurableDateProvider implements DateProvider {
        private final LocalDate overrideDate;

        ConfigurableDateProvider(String fixedDateStr) {
            this.overrideDate = (fixedDateStr != null && !fixedDateStr.isBlank())
                    ? LocalDate.parse(fixedDateStr)
                    : null;
        }

        @Override
        public LocalDate getToday() {
            return (overrideDate != null) ? overrideDate : LocalDate.now();
        }

        @Override
        public LocalDateTime getNow() {
            return (overrideDate != null) ? overrideDate.atStartOfDay() : LocalDateTime.now();
        }
    }

    // ⑤ ビジネスロジック
    static class TaxRateService {
        private final DateProvider dateProvider;

        TaxRateService(DateProvider dateProvider) {
            this.dateProvider = dateProvider;
        }

        public int getTaxRate() {
            var today = dateProvider.getToday();
            return !today.isBefore(LocalDate.of(2019, 10, 1)) ? 10 : 8;
        }

        // Java 21: pattern matching switch でプロバイダーの種類を識別
        public String providerType() {
            return switch (dateProvider) {
                case SystemDateProvider sp       -> "実時刻（本番）";
                case FixedDateProvider fp        -> "固定日付: " + fp.fixedDate();
                case ConfigurableDateProvider cp -> "設定可能（設定値 or 実時刻）";
                default                          -> "不明なプロバイダー";
            };
        }
    }

    public static void main(String[] args) {
        // プロダクション
        var prodService = new TaxRateService(new SystemDateProvider());
        System.out.println(prodService.providerType());
        System.out.println("現在の消費税率: " + prodService.getTaxRate() + "%");

        // テスト（record FixedDateProvider）
        var beforeService = new TaxRateService(new FixedDateProvider(LocalDate.of(2019, 9, 30)));
        System.out.println(beforeService.providerType());
        System.out.println("2019/9/30 の税率: " + beforeService.getTaxRate() + "%"); // 8%

        var afterService = new TaxRateService(new FixedDateProvider(LocalDate.of(2019, 10, 1)));
        System.out.println("2019/10/1 の税率: " + afterService.getTaxRate() + "%");  // 10%

        // ConfigurableDateProvider
        var configService = new TaxRateService(new ConfigurableDateProvider("2019-09-30"));
        System.out.println(configService.providerType());
        System.out.println("設定日の税率: " + configService.getTaxRate() + "%");      // 8%
    }
}
