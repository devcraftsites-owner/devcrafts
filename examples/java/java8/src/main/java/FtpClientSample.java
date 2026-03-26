import java.io.*;
import java.net.Socket;

public class FtpClientSample {

    // FTP プロトコルの主要コマンドと応答コード
    static void showFtpProtocol() {
        System.out.println("=== FTP プロトコルの基本 ===");
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
        System.out.println("5. ファイルアップロード:");
        System.out.println("   C: STOR filename.txt");
        System.out.println("   S: 150 Opening data channel");
        System.out.println("   （データソケットでファイル送信）");
        System.out.println("   S: 226 Transfer complete");
        System.out.println("6. ファイルダウンロード:");
        System.out.println("   C: RETR filename.txt");
        System.out.println("   S: 150 Opening data channel");
        System.out.println("   （データソケットでファイル受信）");
        System.out.println("   S: 226 Transfer complete");
        System.out.println("7. 切断:");
        System.out.println("   C: QUIT");
        System.out.println("   S: 221 Goodbye");
    }

    // PASV モードのポート番号を計算
    static int parsePasvPort(String pasvResponse) {
        // 例: "227 Entering Passive Mode (192,168,1,1,196,10)"
        int start = pasvResponse.indexOf('(');
        int end = pasvResponse.indexOf(')');
        if (start < 0 || end < 0) {
            throw new IllegalArgumentException("PASV レスポンスの形式が不正: " + pasvResponse);
        }
        String[] parts = pasvResponse.substring(start + 1, end).split(",");
        int p1 = Integer.parseInt(parts[4].trim());
        int p2 = Integer.parseInt(parts[5].trim());
        return p1 * 256 + p2;
    }

    // FTP コマンド一覧（主要）
    static void showFtpCommands() {
        System.out.println("\n=== 主要 FTP コマンド ===");
        System.out.println("USER <name>  : ユーザー名送信");
        System.out.println("PASS <pwd>   : パスワード送信");
        System.out.println("PWD          : 現在のディレクトリ表示");
        System.out.println("CWD <dir>    : ディレクトリ変更");
        System.out.println("LIST         : ファイル一覧取得");
        System.out.println("MKD <dir>    : ディレクトリ作成");
        System.out.println("RMD <dir>    : ディレクトリ削除");
        System.out.println("STOR <file>  : ファイルアップロード");
        System.out.println("RETR <file>  : ファイルダウンロード");
        System.out.println("DELE <file>  : ファイル削除");
        System.out.println("PASV         : パッシブモード（データチャネルポート取得）");
        System.out.println("TYPE I       : バイナリ転送モード");
        System.out.println("TYPE A       : テキスト転送モード");
        System.out.println("QUIT         : 切断");
    }

    // 応答コードの意味
    static void showResponseCodes() {
        System.out.println("\n=== FTP 応答コード ===");
        System.out.println("1xx: 処理継続中");
        System.out.println("2xx: 成功");
        System.out.println("  220: サービス準備完了");
        System.out.println("  226: 転送完了");
        System.out.println("  230: ログイン成功");
        System.out.println("  250: 操作成功");
        System.out.println("3xx: 追加情報要求");
        System.out.println("  331: パスワード要求");
        System.out.println("4xx: 一時エラー");
        System.out.println("5xx: 永続エラー");
        System.out.println("  530: ログイン失敗");
        System.out.println("  550: ファイルが見つからない");
    }

    public static void main(String[] args) {
        showFtpProtocol();
        showFtpCommands();
        showResponseCodes();

        System.out.println("\n=== PASV ポート計算のデモ ===");
        String pasvResponse = "227 Entering Passive Mode (192,168,1,1,196,10)";
        int port = parsePasvPort(pasvResponse);
        System.out.println("PASV レスポンス: " + pasvResponse);
        System.out.println("データチャネルポート: 196*256+10 = " + port);

        System.out.println("\n実務では Apache Commons Net（FTPClient クラス）を使用してください");
        System.out.println("このサンプルは FTP プロトコルの仕組み理解が目的です");
    }
}
