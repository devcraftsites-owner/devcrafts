import java.util.ArrayDeque;
import java.util.Deque;

public class CommandPatternSample {

    // テキストエディタ本体: StringBuilder でテキストを保持する
    static class TextEditor {
        private StringBuilder text = new StringBuilder();

        // 指定位置にテキストを挿入する
        public void insertText(int pos, String str) {
            text.insert(pos, str);
        }

        // 指定位置から指定文字数を削除する
        public void deleteText(int pos, int len) {
            text.delete(pos, pos + len);
        }

        // 現在のテキストを返す
        public String getText() {
            return text.toString();
        }
    }

    // Command インターフェース: 操作の実行と取り消しを定義する
    interface Command {
        void execute();
        void undo();
    }

    // テキスト挿入コマンド
    static class InsertCommand implements Command {
        private final TextEditor editor;
        private final int pos;       // 挿入位置
        private final String str;    // 挿入するテキスト

        public InsertCommand(TextEditor editor, int pos, String str) {
            this.editor = editor;
            this.pos = pos;
            this.str = str;
        }

        @Override
        public void execute() {
            editor.insertText(pos, str);
        }

        // undo: 挿入したテキストを削除する
        @Override
        public void undo() {
            editor.deleteText(pos, str.length());
        }
    }

    // テキスト削除コマンド
    static class DeleteCommand implements Command {
        private final TextEditor editor;
        private final int pos;        // 削除開始位置
        private final int len;        // 削除文字数
        private String deletedText;   // undo 時に復元するために保持する

        public DeleteCommand(TextEditor editor, int pos, int len) {
            this.editor = editor;
            this.pos = pos;
            this.len = len;
        }

        @Override
        public void execute() {
            // execute 時に削除する文字列を保存しておく（undo で復元するため）
            deletedText = editor.getText().substring(pos, pos + len);
            editor.deleteText(pos, len);
        }

        // undo: 削除したテキストを元の位置に戻す
        @Override
        public void undo() {
            editor.insertText(pos, deletedText);
        }
    }

    // コマンド履歴を管理するクラス: Undo/Redo を実現する
    static class CommandHistory {
        private final Deque<Command> history = new ArrayDeque<Command>(); // 実行済みコマンドのスタック
        private final Deque<Command> redoStack = new ArrayDeque<Command>(); // redo 用スタック

        // コマンドを実行して履歴に積む
        public void execute(Command command) {
            command.execute();
            history.push(command);
            redoStack.clear(); // 新しい操作をしたら redo 履歴をクリアする
        }

        // 直前の操作を取り消す
        public void undo() {
            if (history.isEmpty()) {
                System.out.println("[Undo] 取り消す操作がありません");
                return;
            }
            Command command = history.pop();
            command.undo();
            redoStack.push(command);
        }

        // 取り消した操作をやり直す
        public void redo() {
            if (redoStack.isEmpty()) {
                System.out.println("[Redo] やり直す操作がありません");
                return;
            }
            Command command = redoStack.pop();
            command.execute();
            history.push(command);
        }

        // 現在の履歴件数を返す
        public int getHistorySize() {
            return history.size();
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Command パターン: テキストエディタ Undo/Redo ===");

        TextEditor editor = new TextEditor();
        CommandHistory commandHistory = new CommandHistory();

        // 操作1: "Hello" を挿入する
        commandHistory.execute(new InsertCommand(editor, 0, "Hello"));
        System.out.println("挿入後: \"" + editor.getText() + "\"");

        // 操作2: ", Java" を末尾に挿入する
        commandHistory.execute(new InsertCommand(editor, 5, ", Java"));
        System.out.println("挿入後: \"" + editor.getText() + "\"");

        // 操作3: 末尾の "Java" を削除する
        commandHistory.execute(new DeleteCommand(editor, 7, 4));
        System.out.println("削除後: \"" + editor.getText() + "\"");

        System.out.println("履歴件数: " + commandHistory.getHistorySize());

        System.out.println("\n--- Undo 操作 ---");
        // Undo: 削除をなかったことにする
        commandHistory.undo();
        System.out.println("Undo 後: \"" + editor.getText() + "\"");

        // Undo: 2番目の挿入をなかったことにする
        commandHistory.undo();
        System.out.println("Undo 後: \"" + editor.getText() + "\"");

        System.out.println("\n--- Redo 操作 ---");
        // Redo: 2番目の挿入をやり直す
        commandHistory.redo();
        System.out.println("Redo 後: \"" + editor.getText() + "\"");

        System.out.println("\n--- 空の履歴で Undo ---");
        // 履歴を全て取り消す
        commandHistory.undo();
        commandHistory.undo();
        // これ以上 Undo するものがない
        commandHistory.undo();
    }
}
