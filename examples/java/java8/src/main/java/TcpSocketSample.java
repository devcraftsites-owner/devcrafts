import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class TcpSocketSample {
    // エコーサーバーを別スレッドで起動し、クライアントから接続してメッセージをやり取りするデモ

    // サーバー側: ServerSocket でクライアント待受
    public static void startEchoServer(int port, ExecutorService executor) throws IOException {
        ServerSocket serverSocket = new ServerSocket(port);
        executor.submit(new Runnable() {
            @Override
            public void run() {
                try {
                    Socket client = serverSocket.accept(); // クライアント接続待ち
                    try (BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream()));
                         PrintWriter out = new PrintWriter(client.getOutputStream(), true)) {
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
            }
        });
    }

    // クライアント側: Socket で接続してメッセージ送受信
    public static void runClient(int port) throws IOException {
        try (Socket socket = new Socket("localhost", port);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            out.println("Hello, Server!"); // メッセージ送信
            System.out.println("受信: " + in.readLine());

            out.println("EXIT");
            System.out.println("受信: " + in.readLine());
        }
    }

    public static void main(String[] args) throws Exception {
        int port = 9000;
        ExecutorService executor = Executors.newSingleThreadExecutor();

        startEchoServer(port, executor);
        Thread.sleep(100); // サーバー起動待ち

        runClient(port);

        executor.shutdown();
    }
}
