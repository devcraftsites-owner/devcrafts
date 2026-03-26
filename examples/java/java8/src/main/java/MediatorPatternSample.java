import java.util.ArrayList;
import java.util.List;

public class MediatorPatternSample {

    // Mediator インターフェース
    interface ChatMediator {
        void sendMessage(String message, ChatUser sender);
        void addUser(ChatUser user);
    }

    // Colleague（コンポーネント）抽象クラス
    static abstract class ChatUser {
        protected final ChatMediator mediator;
        protected final String name;

        ChatUser(ChatMediator mediator, String name) {
            this.mediator = mediator;
            this.name = name;
        }

        abstract void send(String message);
        abstract void receive(String message, String senderName);
    }

    // 具体 Mediator: チャットルーム
    static class ChatRoom implements ChatMediator {
        private final List<ChatUser> users = new ArrayList<>();

        @Override
        public void addUser(ChatUser user) {
            users.add(user);
            System.out.println("  " + user.name + " がチャットルームに参加しました");
        }

        @Override
        public void sendMessage(String message, ChatUser sender) {
            // 送信者以外の全ユーザーにメッセージを配信
            for (ChatUser user : users) {
                if (user != sender) {
                    user.receive(message, sender.name);
                }
            }
        }
    }

    // 具体 Colleague: 一般ユーザー
    static class GeneralUser extends ChatUser {
        GeneralUser(ChatMediator mediator, String name) {
            super(mediator, name);
        }

        @Override
        public void send(String message) {
            System.out.println("[送信] " + name + ": " + message);
            mediator.sendMessage(message, this);
        }

        @Override
        public void receive(String message, String senderName) {
            System.out.println("[受信] " + name + " <- " + senderName + ": " + message);
        }
    }

    // 具体 Colleague: 管理者ユーザー（全員に管理者通知として配信）
    static class AdminUser extends ChatUser {
        AdminUser(ChatMediator mediator, String name) {
            super(mediator, name);
        }

        @Override
        public void send(String message) {
            System.out.println("[管理者送信] " + name + ": " + message);
            mediator.sendMessage("[管理者通知] " + message, this);
        }

        @Override
        public void receive(String message, String senderName) {
            System.out.println("[管理者受信] " + name + " <- " + senderName + ": " + message);
        }
    }

    public static void main(String[] args) {
        ChatRoom chatRoom = new ChatRoom();

        ChatUser alice = new GeneralUser(chatRoom, "Alice");
        ChatUser bob = new GeneralUser(chatRoom, "Bob");
        ChatUser admin = new AdminUser(chatRoom, "Admin");

        chatRoom.addUser(alice);
        chatRoom.addUser(bob);
        chatRoom.addUser(admin);

        System.out.println();
        alice.send("こんにちは！");
        System.out.println();
        bob.send("はじめまして！");
        System.out.println();
        admin.send("システムメンテナンスのお知らせです");
    }
}
