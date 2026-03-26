import java.util.ArrayList;
import java.util.List;

public class MediatorPatternSample {

    // Java 21: sealed interface で ChatUser のバリアントを型安全に表現
    sealed interface UserRole permits UserRole.General, UserRole.Admin, UserRole.Guest {
        record General(String name) implements UserRole {}
        record Admin(String name) implements UserRole {}
        record Guest(String name) implements UserRole {}
    }

    // Java 21: record で不変なメッセージオブジェクトを定義
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
        List<ChatUser> getUsers();
    }

    // Colleague（コンポーネント）抽象クラス
    static abstract class ChatUser {
        protected final ChatMediator mediator;
        protected final UserRole role;

        ChatUser(ChatMediator mediator, UserRole role) {
            this.mediator = mediator;
            this.role = role;
        }

        // Java 21: switch パターンマッチングでロールに応じた名前を返す
        String getName() {
            return switch (role) {
                case UserRole.General(var name) -> name;
                case UserRole.Admin(var name) -> name;
                case UserRole.Guest(var name) -> name;
            };
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
            // ロールに応じて参加メッセージを変える
            String roleLabel = switch (user.role) {
                case UserRole.General g -> "一般ユーザー";
                case UserRole.Admin a -> "管理者";
                case UserRole.Guest g -> "ゲスト";
            };
            System.out.println("  " + user.getName() + "（" + roleLabel + "）がチャットルームに参加しました");
        }

        @Override
        public void sendMessage(Message message, ChatUser sender) {
            for (var user : users) {
                if (user != sender) {
                    user.receive(message);
                }
            }
        }

        @Override
        public List<ChatUser> getUsers() {
            return List.copyOf(users);
        }
    }

    // 具体 Colleague: 一般ユーザー
    static class GeneralUser extends ChatUser {
        GeneralUser(ChatMediator mediator, String name) {
            super(mediator, new UserRole.General(name));
        }

        @Override
        public void send(String messageContent) {
            var message = new Message(messageContent, getName());
            System.out.println("[送信] " + message);
            mediator.sendMessage(message, this);
        }

        @Override
        public void receive(Message message) {
            System.out.println("[受信] " + getName() + " <- " + message);
        }
    }

    // 具体 Colleague: 管理者ユーザー
    static class AdminUser extends ChatUser {
        AdminUser(ChatMediator mediator, String name) {
            super(mediator, new UserRole.Admin(name));
        }

        @Override
        public void send(String messageContent) {
            var wrappedContent = "[管理者通知] " + messageContent;
            var message = new Message(wrappedContent, getName());
            System.out.println("[管理者送信] " + message);
            mediator.sendMessage(message, this);
        }

        @Override
        public void receive(Message message) {
            System.out.println("[管理者受信] " + getName() + " <- " + message);
        }
    }

    // 具体 Colleague: ゲストユーザー（受信のみ）
    static class GuestUser extends ChatUser {
        GuestUser(ChatMediator mediator, String name) {
            super(mediator, new UserRole.Guest(name));
        }

        @Override
        public void send(String messageContent) {
            System.out.println("[制限] ゲスト " + getName() + " はメッセージを送信できません");
        }

        @Override
        public void receive(Message message) {
            System.out.println("[ゲスト受信] " + getName() + " <- " + message);
        }
    }

    public static void main(String[] args) {
        var chatRoom = new ChatRoom();

        var alice = new GeneralUser(chatRoom, "Alice");
        var bob = new GeneralUser(chatRoom, "Bob");
        var admin = new AdminUser(chatRoom, "Admin");
        var guest = new GuestUser(chatRoom, "Guest");

        chatRoom.addUser(alice);
        chatRoom.addUser(bob);
        chatRoom.addUser(admin);
        chatRoom.addUser(guest);

        System.out.println();
        alice.send("こんにちは！");
        System.out.println();
        admin.send("システムメンテナンスのお知らせです");
        System.out.println();
        guest.send("メッセージを送ろうとする"); // ゲストは送信不可

        // Java 21: switch パターンマッチングで全ユーザーのロールを一覧表示
        System.out.println("\n=== ユーザー権限一覧 ===");
        for (var user : chatRoom.getUsers()) {
            String permission = switch (user.role) {
                case UserRole.General g -> g.name() + ": 送信・受信可能";
                case UserRole.Admin a -> a.name() + ": 全機能・管理者通知可能";
                case UserRole.Guest g -> g.name() + ": 受信のみ";
            };
            System.out.println("  " + permission);
        }
    }
}
