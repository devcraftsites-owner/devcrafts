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
        private final int pos;
        private final String str;

        public InsertCommand(TextEditor editor, int pos, String str) {
            this.editor = editor;
            this.pos = pos;
            this.str = str;
        }

        @Override
        public void execute() {
            editor.insertText(pos, str);
        }

        @Override
        public void undo() {
            editor.deleteText(pos, str.length());
        }
    }

    // テキスト削除コマンド
    static class DeleteCommand implements Command {
        private final TextEditor editor;
        private final int pos;
        private final int len;
        private String deletedText;

        public DeleteCommand(TextEditor editor, int pos, int len) {
            this.editor = editor;
            this.pos = pos;
            this.len = len;
        }

        @Override
        public void execute() {
            deletedText = editor.getText().substring(pos, pos + len);
            editor.deleteText(pos, len);
        }

        @Override
        public void undo() {
            editor.insertText(pos, deletedText);
        }
    }

    // Java 17: record でコマンド実行結果をシンプルに表現する
    record CommandResult(boolean success, String currentText, int historySize) {}

    // コマンド履歴を管理するクラス
    static class CommandHistory {
        private final Deque<Command> history = new ArrayDeque<>();
        private final Deque<Command> redoStack = new ArrayDeque<>();

        // コマンドを実行して結果を record で返す
        public CommandResult execute(Command command, TextEditor editor) {
            command.execute();
            history.push(command);
            redoStack.clear();
            return new CommandResult(true, editor.getText(), history.size());
        }

        // 直前の操作を取り消して結果を record で返す
        public CommandResult undo(TextEditor editor) {
            if (history.isEmpty()) {
                System.out.println("[Undo] 取り消す操作がありません");
                return new CommandResult(false, editor.getText(), 0);
            }
            var command = history.pop(); // var でローカル変数の型推論（Java 17+）
            command.undo();
            redoStack.push(command);
            return new CommandResult(true, editor.getText(), history.size());
        }

        // 取り消した操作をやり直して結果を record で返す
        public CommandResult redo(TextEditor editor) {
            if (redoStack.isEmpty()) {
                System.out.println("[Redo] やり直す操作がありません");
                return new CommandResult(false, editor.getText(), history.size());
            }
            var command = redoStack.pop();
            command.execute();
            history.push(command);
            return new CommandResult(true, editor.getText(), history.size());
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Command パターン: テキストエディタ Undo/Redo（Java 17）===");

        var editor = new TextEditor(); // var でローカル変数の型推論（Java 17+）
        var commandHistory = new CommandHistory();

        // 操作1: "Hello" を挿入する
        var result1 = commandHistory.execute(new InsertCommand(editor, 0, "Hello"), editor);
        System.out.println("挿入後: \"" + result1.currentText() + "\" （履歴: " + result1.historySize() + "件）");

        // 操作2: ", Java" を末尾に挿入する
        var result2 = commandHistory.execute(new InsertCommand(editor, 5, ", Java"), editor);
        System.out.println("挿入後: \"" + result2.currentText() + "\" （履歴: " + result2.historySize() + "件）");

        // 操作3: "Java" を削除する
        var result3 = commandHistory.execute(new DeleteCommand(editor, 7, 4), editor);
        System.out.println("削除後: \"" + result3.currentText() + "\" （履歴: " + result3.historySize() + "件）");

        System.out.println("\n--- Undo 操作 ---");
        var undoResult1 = commandHistory.undo(editor);
        System.out.println("Undo 後: \"" + undoResult1.currentText() + "\" （success=" + undoResult1.success() + "）");

        var undoResult2 = commandHistory.undo(editor);
        System.out.println("Undo 後: \"" + undoResult2.currentText() + "\" （success=" + undoResult2.success() + "）");

        System.out.println("\n--- Redo 操作 ---");
        var redoResult = commandHistory.redo(editor);
        System.out.println("Redo 後: \"" + redoResult.currentText() + "\" （success=" + redoResult.success() + "）");

        System.out.println("\n--- 空の履歴で Undo ---");
        commandHistory.undo(editor);
        commandHistory.undo(editor);
        commandHistory.undo(editor);
    }
}
