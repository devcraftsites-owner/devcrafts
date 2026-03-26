import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class UdpSocketSample {
    private static final int PORT = 9001;
    private static final String HOST = "localhost";

    // 受信側: DatagramSocket.receive() でパケット受信
    public static void startReceiver(ExecutorService executor) throws Exception {
        DatagramSocket receiverSocket = new DatagramSocket(PORT);
        executor.submit(new Runnable() {
            @Override
            public void run() {
                try {
                    byte[] buffer = new byte[1024];
                    DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                    receiverSocket.receive(packet); // パケット受信（ブロッキング）
                    String message = new String(packet.getData(), 0, packet.getLength(), "UTF-8");
                    System.out.println("受信: " + message
                            + " (from " + packet.getAddress() + ":" + packet.getPort() + ")");
                    receiverSocket.close();
                } catch (IOException e) {
                    // 受信終了
                }
            }
        });
    }

    // 送信側: DatagramPacket でデータグラム送信
    public static void sendMessage(String message) throws IOException {
        try (DatagramSocket senderSocket = new DatagramSocket()) {
            byte[] data = message.getBytes("UTF-8");
            InetAddress address = InetAddress.getByName(HOST);
            DatagramPacket packet = new DatagramPacket(data, data.length, address, PORT);
            senderSocket.send(packet);
            System.out.println("送信: " + message);
        }
    }

    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        startReceiver(executor);
        Thread.sleep(100); // 受信側起動待ち

        sendMessage("ログメッセージ: サービス起動完了");

        executor.awaitTermination(2, TimeUnit.SECONDS);
        executor.shutdown();
    }
}
