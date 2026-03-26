import java.io.*;
import java.net.*;
import java.util.List;
import java.util.concurrent.*;

public class TcpSocketSample {
    // Java 21: 仮想スレッド（Virtual Threads）、sealed interface、pattern matching switch

    // クライアントが送るメッセージを record で表現
    record ClientMessage(String text) {}

    // TCP 通信のイベントを sealed interface で型安全に表現（Java 17+）
    sealed interface TcpEvent permits TcpEvent.Connected, TcpEvent.Received, TcpEvent.Disconnected {
        record Connected(String addr)   implements TcpEvent {}
        record Received(String msg)     implements TcpEvent {}
        record Disconnected()           implements TcpEvent {}
    }

    // イベントを pattern matching switch で処理（Java 21+）
    private static void handleEvent(TcpEvent event) {
        String log = switch (event) {
            case TcpEvent.Connected  e -> "[接続] " + e.addr();
            case TcpEvent.Received   e -> "[受信] " + e.msg();
            case TcpEvent.Disconnected e -> "[切断]";
        };
        System.out.println(log);
    }

    // サーバー側: 仮想スレッドで各クライアントを処理
    public static void startEchoServer(int port, ExecutorService executor) throws IOException {
        var serverSocket = new ServerSocket(port);
        executor.submit(() -> {
            try {
                var client = serverSocket.accept();
                handleEvent(new TcpEvent.Connected(client.getInetAddress().toString()));

                // Java 21: 仮想スレッドでクライアントハンドラーを起動
                // Executors.newVirtualThreadPerTaskExecutor() は Java 21+ で利用可能
                try (var vThreadExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
                    vThreadExecutor.submit(() -> {
                        try (var in = new BufferedReader(new InputStreamReader(client.getInputStream()));
                             var out = new PrintWriter(client.getOutputStream(), true)) {
                            String line;
                            while ((line = in.readLine()) != null) {
                                handleEvent(new TcpEvent.Received(line));
                                out.println("ECHO: " + line);
                                if ("EXIT".equals(line)) {
                                    break;
                                }
                            }
                        } catch (IOException e) {
                            // クライアント切断
                        }
                        handleEvent(new TcpEvent.Disconnected());
                        return null;
                    });
                } // try-with-resources で vThreadExecutor が自動クローズ（awaitTermination 相当）
                serverSocket.close();
            } catch (IOException e) {
                // サーバー終了
            }
        });
    }

    // クライアント側: Socket で接続してメッセージ送受信
    public static void runClient(int port) throws IOException {
        var messages = List.of(
                new ClientMessage("Hello, Server!"),
                new ClientMessage("Java 21 の仮想スレッドは効率的です"),
                new ClientMessage("EXIT")
        );

        try (var socket = new Socket("localhost", port);
             var out = new PrintWriter(socket.getOutputStream(), true);
             var in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            for (var msg : messages) {
                out.println(msg.text());
                System.out.println("クライアント受信: " + in.readLine());
            }
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 9000;
        // Java 21: 仮想スレッドのエグゼキューターでサーバー起動
        var executor = Executors.newVirtualThreadPerTaskExecutor(); // Java 21+

        startEchoServer(port, executor);
        Thread.sleep(100); // サーバー起動待ち

        runClient(port);

        executor.shutdown();
    }
}
