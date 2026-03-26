import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ChainOfResponsibilitySample {

    // Java 21: sealed interface でログイベントの種類を型安全に表現する
    // LogEvent は Debug / Info / Warn / Error のどれかしか実装できない
    sealed interface LogEvent permits LogEvent.Debug, LogEvent.Info, LogEvent.Warn, LogEvent.Error {

        record Debug(String message) implements LogEvent {}

        record Info(String message) implements LogEvent {}

        record Warn(String message) implements LogEvent {}

        // Error は message に加えて Throwable（例外）も保持できる
        record Error(String message, Throwable cause) implements LogEvent {
            // cause なしの場合は null を渡す便利コンストラクタ
            public Error(String message) {
                this(message, null);
            }
        }
    }

    // ログイベントを処理するハンドラーインターフェース
    interface EventHandler {
        void process(LogEvent event);
    }

    // switch パターンマッチングでログイベントを処理するユーティリティメソッド
    // イベントの種類に応じて重大度を返す
    static int getSeverity(LogEvent event) {
        return switch (event) {
            case LogEvent.Debug d -> 1;
            case LogEvent.Info i -> 2;
            case LogEvent.Warn w -> 3;
            case LogEvent.Error e -> 4;
        };
    }

    // イベントの内容を処理する（switch パターンマッチング）
    static void processEvent(LogEvent event) {
        switch (event) {
            case LogEvent.Debug(var message) ->
                // DEBUG は詳細情報のみ（通常は開発時のみ有効）
                System.out.println("  [CONSOLE-WARN] 対象外（Debug は閾値未満）");
            case LogEvent.Info(var message) ->
                System.out.println("  [CONSOLE-WARN] 対象外（Info は閾値未満）");
            case LogEvent.Warn(var message) ->
                System.out.println("  [CONSOLE] WARN: " + message);
            case LogEvent.Error(var message, var cause) -> {
                // Error の場合は複数のハンドラーで処理する
                System.out.println("  [CONSOLE] ERROR: " + message);
                System.out.println("  [FILE] error.log に書き込み: ERROR: " + message);
                if (cause != null) {
                    System.out.println("  [EMAIL] 管理者にメール送信: ERROR: " + message + " 原因: " + cause.getMessage());
                } else {
                    System.out.println("  [EMAIL] 管理者にメール送信: ERROR: " + message);
                }
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Chain of Responsibility パターン: ログフィルタリング（Java 21）===");

        var events = List.of(
                new LogEvent.Debug("デバッグ情報: 接続確立"),
                new LogEvent.Info("情報: ユーザーがログインしました"),
                new LogEvent.Warn("警告: ディスク使用率が 80% を超えました"),
                new LogEvent.Error("エラー: データベース接続に失敗しました", new RuntimeException("Connection refused")),
                new LogEvent.Error("エラー: ファイルが見つかりません")
        );

        for (var event : events) {
            // switch で型を判定してイベント名を取得する
            String eventType = switch (event) {
                case LogEvent.Debug d -> "DEBUG";
                case LogEvent.Info i -> "INFO ";
                case LogEvent.Warn w -> "WARN ";
                case LogEvent.Error e -> "ERROR";
            };
            System.out.println("\n--- " + eventType + " イベント（重大度: " + getSeverity(event) + "）---");
            processEvent(event);
        }

        System.out.println("\n--- sealed interface の型安全性の確認 ---");
        // コンパイル時にすべてのケースを網羅しているか検査される
        // 新しい LogEvent のサブタイプを追加すると switch 文がコンパイルエラーになるため、
        // 漏れなく対応できる
        for (var event : events) {
            int severity = getSeverity(event);
            System.out.println(event.getClass().getSimpleName() + " -> 重大度 " + severity);
        }
    }
}
