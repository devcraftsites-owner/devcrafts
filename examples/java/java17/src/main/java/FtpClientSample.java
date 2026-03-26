import java.io.*;
import java.net.Socket;

public class FtpClientSample {

    // Java 17: record でFTPコマンドを型安全に表現
    record FtpCommand(String name, String arg) {
        // 引数なしコマンド用
        FtpCommand(String name) {
            this(name, "");
        }

        // コマンド文字列を生成
        String toCommandLine() {
            if (arg.isEmpty()) {
                return name + "\r\n";
            }
            return name + " " + arg + "\r\n";
        }

        @Override
        public String toString() {
            if (arg.isEmpty()) {
                return name;
            }
            return name + " " + arg;
        }
    }

    // FTP プロトコルの主要コマンドと応答コード
    static void showFtpProtocol() {
        System.out.println("=== FTP プロトコルの基本（Java 17 版） ===");
        System.out.println();
        System.out.println("【接続フロー】");
        System.out.println("1. コマンドチャネル接続: Socket(ftpserver, 21)");
        System.out.println("   S: 220 FTP Service Ready");
        System.out.println("2. 認証:");
        System.out.println("   C: USER anonymous");
        System.out.println("   S: 331 Password required");
        System.out.println("   C: PASS guest@example.com");
        System.out.println("   S: 230 Login successful");
        System.out.println("3. パッシブモード（ファイアウォール対応）:");
        System.out.println("   C: PASV");
        System.out.println("   S: 227 Entering Passive Mode (127,0,0,1,196,10)");
        System.out.println("   → データチャネルのポートを計算: 196*256+10 = 50186");
        System.out.println("4. バイナリ転送モード:");
        System.out.println("   C: TYPE I");
        System.out.println("   S: 200 Type set to I");
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

    // FTP 応答コードのカテゴリ（Java 17: switch 式で分類）
    static String classifyResponseCode(int code) {
        return switch (code / 100) {
            case 1 -> "処理継続中（" + code + "）";
            case 2 -> "成功（" + code + "）";
            case 3 -> "追加情報要求（" + code + "）";
            case 4 -> "一時エラー（" + code + "）";
            case 5 -> "永続エラー（" + code + "）";
            default -> "不明（" + code + "）";
        };
    }

    public static void main(String[] args) {
        showFtpProtocol();

        // Java 17: record を使った型安全なコマンド一覧
        System.out.println("\n=== FTP コマンド（record 版） ===");
        var commands = new FtpCommand[]{
            new FtpCommand("USER", "anonymous"),
            new FtpCommand("PASS", "guest@example.com"),
            new FtpCommand("PASV"),
            new FtpCommand("TYPE", "I"),
            new FtpCommand("STOR", "test.txt"),
            new FtpCommand("RETR", "test.txt"),
            new FtpCommand("QUIT"),
        };
        for (FtpCommand cmd : commands) {
            System.out.println("  " + cmd + " → \"" + cmd.toCommandLine().trim() + "\"");
        }

        // PASV ポート計算デモ
        System.out.println("\n=== PASV ポート計算 ===");
        var pasvResponse = "227 Entering Passive Mode (192,168,1,1,196,10)";
        int port = parsePasvPort(pasvResponse);
        System.out.println("PASV レスポンス: " + pasvResponse);
        System.out.println("データチャネルポート: 196*256+10 = " + port);

        // 応答コード分類デモ（switch 式）
        System.out.println("\n=== 応答コード分類（switch 式） ===");
        for (int code : new int[]{220, 230, 226, 331, 421, 530, 550}) {
            System.out.println(code + " → " + classifyResponseCode(code));
        }

        System.out.println("\n実務では Apache Commons Net（FTPClient クラス）を使用してください");
    }
}
