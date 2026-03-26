import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class UdpSocketSample {
    private static final int PORT = 9001;
    private static final String HOST = "localhost";

    // Java 17: var によるローカル変数型推論、record で受信データを表現

    // 受信したデータグラムを record で表現（Java 16+）
    record DatagramMessage(String text, InetAddress from, int port) {}

    // 受信側: DatagramSocket.receive() でパケット受信
    public static void startReceiver(ExecutorService executor) throws Exception {
        var receiverSocket = new DatagramSocket(PORT);
        executor.submit(() -> {
            try {
                var buffer = new byte[1024];
                var packet = new DatagramPacket(buffer, buffer.length);
                receiverSocket.receive(packet); // パケット受信（ブロッキング）

                // 受信データを record に詰める
                var msg = new DatagramMessage(
                        new String(packet.getData(), 0, packet.getLength(), "UTF-8"),
                        packet.getAddress(),
                        packet.getPort()
                );

                System.out.printf("""
                        --- 受信 ---
                        内容: %s
                        送信元: %s:%d
                        ------------%n""", msg.text(), msg.from(), msg.port());

                receiverSocket.close();
            } catch (IOException e) {
                // 受信終了
            }
        });
    }

    // 送信側: DatagramPacket でデータグラム送信
    public static void sendMessage(String message) throws IOException {
        try (var senderSocket = new DatagramSocket()) {
            var data = message.getBytes("UTF-8");
            var address = InetAddress.getByName(HOST);
            var packet = new DatagramPacket(data, data.length, address, PORT);
            senderSocket.send(packet);
            System.out.println("送信: " + message);
        }
    }

    public static void main(String[] args) throws Exception {
        var executor = Executors.newSingleThreadExecutor();

        startReceiver(executor);
        Thread.sleep(100); // 受信側起動待ち

        sendMessage("ログメッセージ: サービス起動完了");

        executor.awaitTermination(2, TimeUnit.SECONDS);
        executor.shutdown();
    }
}
