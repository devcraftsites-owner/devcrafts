import java.util.ArrayList;
import java.util.List;

public class MediatorPatternSample {

    // Java 17: record で不変なメッセージオブジェクトを定義
    record Message(String content, String senderName) {
        @Override
        public String toString() {
            return "[" + senderName + "]: " + content;
        }
    }

    // Mediator インターフェース
    interface ChatMediator {
        void sendMessage(Message message, ChatUser sender);
        void addUser(ChatUser user);
        // Java 17: List.copyOf() で防御的コピーを返すデフォルトメソッド
        List<ChatUser> getUsers();
    }

    // Colleague（コンポーネント）抽象クラス
    static abstract class ChatUser {
        protected final ChatMediator mediator;
        protected final String name;

        ChatUser(ChatMediator mediator, String name) {
            this.mediator = mediator;
            this.name = name;
        }

        abstract void send(String messageContent);
        abstract void receive(Message message);
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
        public void sendMessage(Message message, ChatUser sender) {
            // 送信者以外の全ユーザーにメッセージを配信
            for (var user : users) {
                if (user != sender) {
                    user.receive(message);
                }
            }
        }

        @Override
        public List<ChatUser> getUsers() {
            // Java 17: List.copyOf() で変更不可な防御的コピーを返す
            return List.copyOf(users);
        }
    }

    // 具体 Colleague: 一般ユーザー
    static class GeneralUser extends ChatUser {
        GeneralUser(ChatMediator mediator, String name) {
            super(mediator, name);
        }

        @Override
        public void send(String messageContent) {
            var message = new Message(messageContent, name);
            System.out.println("[送信] " + message);
            mediator.sendMessage(message, this);
        }

        @Override
        public void receive(Message message) {
            System.out.println("[受信] " + name + " <- " + message);
        }
    }

    // 具体 Colleague: 管理者ユーザー（全員に管理者通知として配信）
    static class AdminUser extends ChatUser {
        AdminUser(ChatMediator mediator, String name) {
            super(mediator, name);
        }

        @Override
        public void send(String messageContent) {
            var wrappedContent = "[管理者通知] " + messageContent;
            var message = new Message(wrappedContent, name);
            System.out.println("[管理者送信] " + message);
            mediator.sendMessage(message, this);
        }

        @Override
        public void receive(Message message) {
            System.out.println("[管理者受信] " + name + " <- " + message);
        }
    }

    public static void main(String[] args) {
        var chatRoom = new ChatRoom();

        var alice = new GeneralUser(chatRoom, "Alice");
        var bob = new GeneralUser(chatRoom, "Bob");
        var admin = new AdminUser(chatRoom, "Admin");

        chatRoom.addUser(alice);
        chatRoom.addUser(bob);
        chatRoom.addUser(admin);

        System.out.println();
        alice.send("こんにちは！");
        System.out.println();
        bob.send("はじめまして！");
        System.out.println();
        admin.send("システムメンテナンスのお知らせです");

        System.out.println("\n=== 参加ユーザー一覧（List.copyOf による防御的コピー）===");
        var userList = chatRoom.getUsers();
        for (var user : userList) {
            System.out.println("  " + user.name);
        }
    }
}
