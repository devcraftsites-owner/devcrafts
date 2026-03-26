import java.io.*;
import java.net.Socket;

public class FtpClientSample {

    // Java 21: record でFTPコマンドを型安全に表現
    record FtpCommand(String name, String arg) {
        FtpCommand(String name) {
            this(name, "");
        }

        String toCommandLine() {
            if (arg.isEmpty()) {
                return name + "\r\n";
            }
            return name + " " + arg + "\r\n";
        }
    }

    // Java 21: sealed interface で FTP 応答カテゴリを表現
    sealed interface FtpResponseCategory
            permits FtpResponseCategory.Preliminary, FtpResponseCategory.Completion,
                    FtpResponseCategory.Intermediate, FtpResponseCategory.TransientNegative,
                    FtpResponseCategory.PermanentNegative {
        record Preliminary(int code, String message)     implements FtpResponseCategory {}
        record Completion(int code, String message)      implements FtpResponseCategory {}
        record Intermediate(int code, String message)    implements FtpResponseCategory {}
        record TransientNegative(int code, String message) implements FtpResponseCategory {}
        record PermanentNegative(int code, String message) implements FtpResponseCategory {}
    }

    // Java 21: switch 式で応答コードをカテゴリ分類
    static FtpResponseCategory classifyResponse(int code, String message) {
        return switch (code / 100) {
            case 1 -> new FtpResponseCategory.Preliminary(code, message);
            case 2 -> new FtpResponseCategory.Completion(code, message);
            case 3 -> new FtpResponseCategory.Intermediate(code, message);
            case 4 -> new FtpResponseCategory.TransientNegative(code, message);
            case 5 -> new FtpResponseCategory.PermanentNegative(code, message);
            default -> new FtpResponseCategory.PermanentNegative(code, "不明な応答コード");
        };
    }

    // Java 21: パターンマッチング switch で応答を処理
    static String describeResponse(FtpResponseCategory category) {
        return switch (category) {
            case FtpResponseCategory.Preliminary     r -> "[1xx 継続] " + r.code() + " " + r.message();
            case FtpResponseCategory.Completion      r -> "[2xx 成功] " + r.code() + " " + r.message();
            case FtpResponseCategory.Intermediate    r -> "[3xx 追加情報要求] " + r.code() + " " + r.message();
            case FtpResponseCategory.TransientNegative r -> "[4xx 一時エラー] " + r.code() + " " + r.message();
            case FtpResponseCategory.PermanentNegative r -> "[5xx 永続エラー] " + r.code() + " " + r.message();
        };
    }

    // PASV モードのポート番号を計算
    static int parsePasvPort(String pasvResponse) {
        var start = pasvResponse.indexOf('(');
        var end = pasvResponse.indexOf(')');
        if (start < 0 || end < 0) {
            throw new IllegalArgumentException("PASV レスポンスの形式が不正: " + pasvResponse);
        }
        var parts = pasvResponse.substring(start + 1, end).split(",");
        int p1 = Integer.parseInt(parts[4].trim());
        int p2 = Integer.parseInt(parts[5].trim());
        return p1 * 256 + p2;
    }

    public static void main(String[] args) {
        System.out.println("=== FTP プロトコルの基本（Java 21 版） ===");

        // FTP コマンド一覧（record）
        System.out.println("\n=== FTP コマンド（record 版） ===");
        var commands = new FtpCommand[]{
            new FtpCommand("USER", "anonymous"),
            new FtpCommand("PASS", "guest@example.com"),
            new FtpCommand("PASV"),
            new FtpCommand("TYPE", "I"),
            new FtpCommand("STOR", "upload.txt"),
            new FtpCommand("RETR", "download.txt"),
            new FtpCommand("QUIT"),
        };
        for (var cmd : commands) {
            System.out.println("  " + cmd.toCommandLine().trim());
        }

        // PASV ポート計算デモ
        System.out.println("\n=== PASV ポート計算 ===");
        var pasvResponse = "227 Entering Passive Mode (192,168,1,1,196,10)";
        int port = parsePasvPort(pasvResponse);
        System.out.println("PASV レスポンス: " + pasvResponse);
        System.out.println("データチャネルポート: 196*256+10 = " + port);

        // 応答コード分類デモ（sealed interface + パターンマッチング）
        System.out.println("\n=== 応答コード分類（Java 21 パターンマッチング） ===");
        int[][] codesAndMessages = {
            {220}, {230}, {226}, {331}, {421}, {530}, {550}
        };
        String[] messages = {
            "FTP Service Ready",
            "Login successful",
            "Transfer complete",
            "Password required",
            "Service not available",
            "Login incorrect",
            "File unavailable"
        };
        for (int i = 0; i < messages.length; i++) {
            int code = codesAndMessages[i][0];
            var category = classifyResponse(code, messages[i]);
            System.out.println(describeResponse(category));
        }

        System.out.println("\n実務では Apache Commons Net（FTPClient クラス）を使用してください");
    }
}
