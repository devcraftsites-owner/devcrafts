import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class UdpSocketSample {
    private static final int PORT = 9001;
    private static final String HOST = "localhost";

    // Java 21: 仮想スレッド、sealed interface、pattern matching switch

    // UDP 通信のイベントを sealed interface で型安全に表現（Java 17+）
    sealed interface UdpEvent permits UdpEvent.Sent, UdpEvent.Received {
        record Sent(String msg)                         implements UdpEvent {}
        record Received(String msg, InetAddress from)   implements UdpEvent {}
    }

    // イベントを pattern matching switch で処理（Java 21+）
    private static void handleEvent(UdpEvent event) {
        String log = switch (event) {
            case UdpEvent.Sent     e -> "[送信] " + e.msg();
            case UdpEvent.Received e -> "[受信] " + e.msg() + " (from " + e.from() + ")";
        };
        System.out.println(log);
    }

    // 受信側: 仮想スレッドで DatagramSocket.receive() でパケット受信
    public static void startReceiver(ExecutorService executor) throws Exception {
        var receiverSocket = new DatagramSocket(PORT);
        // Java 21: 仮想スレッドでブロッキング I/O を効率的に処理
        executor.submit(() -> {
            try {
                var buffer = new byte[1024];
                var packet = new DatagramPacket(buffer, buffer.length);
                receiverSocket.receive(packet); // パケット受信（ブロッキング）

                var message = new String(packet.getData(), 0, packet.getLength(), "UTF-8");
                handleEvent(new UdpEvent.Received(message, packet.getAddress()));

                receiverSocket.close();
            } catch (IOException e) {
                // 受信終了
            }
            return null;
        });
    }

    // 送信側: DatagramPacket でデータグラム送信
    public static void sendMessage(String message) throws IOException {
        try (var senderSocket = new DatagramSocket()) {
            var data = message.getBytes("UTF-8");
            var address = InetAddress.getByName(HOST);
            var packet = new DatagramPacket(data, data.length, address, PORT);
            senderSocket.send(packet);
            handleEvent(new UdpEvent.Sent(message));
        }
    }

    public static void main(String[] args) throws Exception {
        // Java 21: 仮想スレッドのエグゼキューター
        var executor = Executors.newVirtualThreadPerTaskExecutor(); // Java 21+

        startReceiver(executor);
        Thread.sleep(100); // 受信側起動待ち

        sendMessage("ログメッセージ: サービス起動完了");

        executor.awaitTermination(2, TimeUnit.SECONDS);
        executor.shutdown();
    }
}
