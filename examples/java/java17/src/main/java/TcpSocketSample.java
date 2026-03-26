import java.io.*;
import java.net.*;
import java.util.List;
import java.util.concurrent.*;

public class TcpSocketSample {
    // Java 17: var によるローカル変数型推論、record でメッセージを表現

    // クライアントが送るメッセージを record で表現（Java 16+）
    record ClientMessage(String text) {}

    // サーバー側: ServerSocket でクライアント待受
    public static void startEchoServer(int port, ExecutorService executor) throws IOException {
        var serverSocket = new ServerSocket(port);
        executor.submit(() -> {
            try {
                var client = serverSocket.accept(); // クライアント接続待ち
                System.out.printf("""
                        --- サーバー起動 ---
                        ポート: %d
                        接続元: %s
                        -------------------%n""", port, client.getInetAddress());
                try (var in = new BufferedReader(new InputStreamReader(client.getInputStream()));
                     var out = new PrintWriter(client.getOutputStream(), true)) {
                    String line;
                    while ((line = in.readLine()) != null) {
                        out.println("ECHO: " + line); // 受信した文字列をそのまま返す
                        if ("EXIT".equals(line)) {
                            break;
                        }
                    }
                }
                serverSocket.close();
            } catch (IOException e) {
                // サーバー終了
            }
        });
    }

    // クライアント側: Socket で接続してメッセージ送受信
    public static void runClient(int port) throws IOException {
        // 送信するメッセージ一覧（List.of で不変リストを作成）
        var messages = List.of(
                new ClientMessage("Hello, Server!"),
                new ClientMessage("Java 17 の record は便利です"),
                new ClientMessage("EXIT")
        );

        try (var socket = new Socket("localhost", port);
             var out = new PrintWriter(socket.getOutputStream(), true);
             var in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            for (var msg : messages) {
                out.println(msg.text()); // メッセージ送信
                var response = in.readLine();
                System.out.println("受信: " + response);
            }
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 9000;
        var executor = Executors.newSingleThreadExecutor();

        startEchoServer(port, executor);
        Thread.sleep(100); // サーバー起動待ち

        runClient(port);

        executor.shutdown();
    }
}
