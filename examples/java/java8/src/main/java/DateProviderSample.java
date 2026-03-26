import java.time.LocalDate;
import java.time.LocalDateTime;

public class DateProviderSample {

    // ① DateProvider インターフェース（日付に依存するロジックを切り離す）
    interface DateProvider {
        LocalDate getToday();
        LocalDateTime getNow();
    }

    // ② プロダクション実装（システム日時をそのまま返す）
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

    // ③ テスト用固定日付プロバイダー（指定した日付を常に返す）
    static class FixedDateProvider implements DateProvider {
        private final LocalDate fixedDate;
        private final LocalDateTime fixedDateTime;

        FixedDateProvider(LocalDate fixedDate) {
            this.fixedDate = fixedDate;
            this.fixedDateTime = fixedDate.atStartOfDay();
        }

        @Override
        public LocalDate getToday() {
            return fixedDate;
        }

        @Override
        public LocalDateTime getNow() {
            return fixedDateTime;
        }
    }

    // ④ 日付に依存するビジネスロジック（DateProvider を DI で受け取る）
    static class TaxRateService {
        private final DateProvider dateProvider;

        TaxRateService(DateProvider dateProvider) {
            this.dateProvider = dateProvider;
        }

        // 消費税率を返す（2019/10/01 以降は10%、それより前は8%）
        public int getTaxRate() {
            LocalDate today = dateProvider.getToday();
            LocalDate taxRaiseDate = LocalDate.of(2019, 10, 1);
            if (!today.isBefore(taxRaiseDate)) {
                return 10;
            }
            return 8;
        }

        // 年度末（3月31日）かどうかを判定
        public boolean isEndOfFiscalYear() {
            LocalDate today = dateProvider.getToday();
            return today.getMonthValue() == 3 && today.getDayOfMonth() == 31;
        }
    }

    public static void main(String[] args) {
        // プロダクション利用（実際のシステム日時を使う）
        TaxRateService prodService = new TaxRateService(new SystemDateProvider());
        System.out.println("現在の消費税率: " + prodService.getTaxRate() + "%");

        // テスト：増税前日（2019/9/30）を固定して動作確認
        DateProvider beforeProvider = new FixedDateProvider(LocalDate.of(2019, 9, 30));
        TaxRateService beforeService = new TaxRateService(beforeProvider);
        System.out.println("2019/9/30 の税率: " + beforeService.getTaxRate() + "%"); // → 8%

        // テスト：増税日当日（2019/10/1）を固定して動作確認
        DateProvider afterProvider = new FixedDateProvider(LocalDate.of(2019, 10, 1));
        TaxRateService afterService = new TaxRateService(afterProvider);
        System.out.println("2019/10/1 の税率: " + afterService.getTaxRate() + "%");  // → 10%

        // テスト：年度末判定
        DateProvider fiscalEndProvider = new FixedDateProvider(LocalDate.of(2024, 3, 31));
        TaxRateService fiscalService = new TaxRateService(fiscalEndProvider);
        System.out.println("2024/3/31 は年度末: " + fiscalService.isEndOfFiscalYear()); // → true
    }
}
