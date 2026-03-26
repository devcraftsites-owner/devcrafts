import java.util.ArrayDeque;
import java.util.Deque;

public class CommandPatternSample {

    // テキストエディタ本体: StringBuilder でテキストを保持する
    static class TextEditor {
        private StringBuilder text = new StringBuilder();

        public void insertText(int pos, String str) {
            text.insert(pos, str);
        }

        public void deleteText(int pos, int len) {
            text.delete(pos, pos + len);
        }

        public String getText() {
            return text.toString();
        }
    }

    // Java 21: sealed interface で編集操作の種類を型安全に表現する
    sealed interface EditCommand permits EditCommand.Insert, EditCommand.Delete, EditCommand.Clear {
        // テキスト挿入コマンド
        record Insert(int pos, String str) implements EditCommand {}
        // テキスト削除コマンド
        record Delete(int pos, int len, String deletedText) implements EditCommand {}
        // 全文クリアコマンド
        record Clear(String previousText) implements EditCommand {}
    }

    // コマンドを実行して「取り消し用コマンド」を返す（switch パターンマッチング）
    static EditCommand applyCommand(TextEditor editor, EditCommand cmd) {
        return switch (cmd) {
            case EditCommand.Insert(int pos, String str) -> {
                // 挿入を実行し、undo 用として Delete コマンドを返す
                editor.insertText(pos, str);
                yield new EditCommand.Delete(pos, str.length(), str);
            }
            case EditCommand.Delete(int pos, int len, String deletedText) -> {
                // 削除を実行し、undo 用として Insert コマンドを返す
                String text = editor.getText().substring(pos, pos + len);
                editor.deleteText(pos, len);
                yield new EditCommand.Insert(pos, text);
            }
            case EditCommand.Clear(String previousText) -> {
                // 全文クリアし、undo 用として Insert コマンド（全文を復元）を返す
                String current = editor.getText();
                editor.deleteText(0, current.length());
                yield new EditCommand.Insert(0, current);
            }
        };
    }

    // record でコマンド実行結果を表現する（Java 17+）
    record CommandResult(boolean success, String currentText, int historySize) {}

    // コマンド履歴を管理するクラス
    static class CommandHistory {
        // undo スタック: 実行済みコマンドの「取り消し用コマンド」を積む
        private final Deque<EditCommand> undoStack = new ArrayDeque<>();
        // redo スタック: undo したコマンドを積む
        private final Deque<EditCommand> redoStack = new ArrayDeque<>();

        public CommandResult execute(TextEditor editor, EditCommand cmd) {
            var undoCmd = applyCommand(editor, cmd);
            undoStack.push(undoCmd);
            redoStack.clear();
            return new CommandResult(true, editor.getText(), undoStack.size());
        }

        public CommandResult undo(TextEditor editor) {
            if (undoStack.isEmpty()) {
                System.out.println("[Undo] 取り消す操作がありません");
                return new CommandResult(false, editor.getText(), 0);
            }
            var undoCmd = undoStack.pop();
            var redoCmd = applyCommand(editor, undoCmd);
            redoStack.push(redoCmd);
            return new CommandResult(true, editor.getText(), undoStack.size());
        }

        public CommandResult redo(TextEditor editor) {
            if (redoStack.isEmpty()) {
                System.out.println("[Redo] やり直す操作がありません");
                return new CommandResult(false, editor.getText(), undoStack.size());
            }
            var redoCmd = redoStack.pop();
            var undoCmd = applyCommand(editor, redoCmd);
            undoStack.push(undoCmd);
            return new CommandResult(true, editor.getText(), undoStack.size());
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Command パターン: テキストエディタ Undo/Redo（Java 21）===");

        var editor = new TextEditor();
        var commandHistory = new CommandHistory();

        // 操作1: "Hello" を挿入する
        var r1 = commandHistory.execute(editor, new EditCommand.Insert(0, "Hello"));
        System.out.println("挿入後: \"" + r1.currentText() + "\" （履歴: " + r1.historySize() + "件）");

        // 操作2: ", Java" を末尾に挿入する
        var r2 = commandHistory.execute(editor, new EditCommand.Insert(5, ", Java"));
        System.out.println("挿入後: \"" + r2.currentText() + "\" （履歴: " + r2.historySize() + "件）");

        // 操作3: "Java" を削除する
        var r3 = commandHistory.execute(editor, new EditCommand.Delete(7, 4, ""));
        System.out.println("削除後: \"" + r3.currentText() + "\" （履歴: " + r3.historySize() + "件）");

        System.out.println("\n--- Undo 操作 ---");
        var undo1 = commandHistory.undo(editor);
        System.out.println("Undo 後: \"" + undo1.currentText() + "\" （success=" + undo1.success() + "）");

        var undo2 = commandHistory.undo(editor);
        System.out.println("Undo 後: \"" + undo2.currentText() + "\" （success=" + undo2.success() + "）");

        System.out.println("\n--- Redo 操作 ---");
        var redo1 = commandHistory.redo(editor);
        System.out.println("Redo 後: \"" + redo1.currentText() + "\" （success=" + redo1.success() + "）");

        System.out.println("\n--- 空の履歴で Undo ---");
        commandHistory.undo(editor);
        commandHistory.undo(editor);
        commandHistory.undo(editor);

        System.out.println("\n--- sealed interface + switch パターンマッチング（Java 21+）デモ ---");
        // EditCommand の種類を switch で判別する
        EditCommand[] commands = {
            new EditCommand.Insert(0, "test"),
            new EditCommand.Delete(0, 2, "te"),
            new EditCommand.Clear("")
        };
        for (EditCommand cmd : commands) {
            String description = switch (cmd) {
                case EditCommand.Insert(int pos, String str) ->
                    "Insert: 位置 " + pos + " に \"" + str + "\" を挿入";
                case EditCommand.Delete(int pos, int len, String deletedText) ->
                    "Delete: 位置 " + pos + " から " + len + " 文字を削除";
                case EditCommand.Clear(String previousText) ->
                    "Clear: 全文をクリア";
            };
            System.out.println(description);
        }
    }
}
