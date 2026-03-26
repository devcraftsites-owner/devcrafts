import java.util.ArrayDeque;
import java.util.Deque;

public class MementoPatternSample {

    // Java 21: sealed interface で編集状態のバリアントを型安全に表現
    sealed interface EditorState permits EditorState.Editing, EditorState.Saved, EditorState.ReadOnly {
        record Editing(String content, int cursorPos) implements EditorState {}
        record Saved(String content, int cursorPos, String savedAt) implements EditorState {}
        record ReadOnly(String content) implements EditorState {}
    }

    // Memento: 状態のスナップショット（record で不変かつ簡潔に）
    record EditorMemento(String content, int cursorPos) {}

    // Originator: 状態を持ち、Memento を作成・復元する
    static class TextEditor {
        private String content = "";
        private int cursorPos = 0;
        private EditorState currentState = new EditorState.Editing("", 0);

        void type(String text) {
            // 読み取り専用状態では入力不可
            if (currentState instanceof EditorState.ReadOnly) {
                System.out.println("  [エラー] 読み取り専用モードでは入力できません");
                return;
            }
            content = content.substring(0, cursorPos) + text + content.substring(cursorPos);
            cursorPos += text.length();
            currentState = new EditorState.Editing(content, cursorPos);
        }

        void delete(int count) {
            if (currentState instanceof EditorState.ReadOnly) {
                System.out.println("  [エラー] 読み取り専用モードでは削除できません");
                return;
            }
            int start = Math.max(0, cursorPos - count);
            content = content.substring(0, start) + content.substring(cursorPos);
            cursorPos = start;
            currentState = new EditorState.Editing(content, cursorPos);
        }

        void markAsSaved() {
            currentState = new EditorState.Saved(content, cursorPos, "2026-03-25T10:00:00");
        }

        void lockForReading() {
            currentState = new EditorState.ReadOnly(content);
        }

        // 現在の状態をスナップショットとして保存
        EditorMemento save() {
            return new EditorMemento(content, cursorPos);
        }

        // スナップショットから状態を復元
        void restore(EditorMemento memento) {
            this.content = memento.content();
            this.cursorPos = memento.cursorPos();
            this.currentState = new EditorState.Editing(content, cursorPos);
        }

        void display() {
            // Java 21: switch パターンマッチングで状態に応じた表示
            String stateLabel = switch (currentState) {
                case EditorState.Editing(var c, var pos) ->
                        "編集中 (カーソル位置: " + pos + ")";
                case EditorState.Saved(var c, var pos, var at) ->
                        "保存済み (保存日時: " + at + ")";
                case EditorState.ReadOnly(var c) ->
                        "読み取り専用";
            };
            System.out.println("  内容: \"" + content + "\" [" + stateLabel + "]");
        }
    }

    // Caretaker: Memento を管理するが、内容には触れない
    static class EditorHistory {
        private final Deque<EditorMemento> undoStack = new ArrayDeque<>();
        private final Deque<EditorMemento> redoStack = new ArrayDeque<>();

        void save(EditorMemento memento) {
            undoStack.push(memento);
            redoStack.clear();
        }

        EditorMemento undo() {
            if (undoStack.isEmpty()) {
                return null;
            }
            var memento = undoStack.pop();
            redoStack.push(memento);
            if (!undoStack.isEmpty()) {
                return undoStack.peek();
            }
            return new EditorMemento("", 0);
        }

        boolean canUndo() {
            return !undoStack.isEmpty();
        }
    }

    public static void main(String[] args) {
        var editor = new TextEditor();
        var history = new EditorHistory();

        System.out.println("=== 初期状態（Java 21）===");
        editor.display();

        System.out.println("\n=== 「Hello」と入力 ===");
        history.save(editor.save());
        editor.type("Hello");
        editor.display();

        System.out.println("\n=== 「 World」と入力 ===");
        history.save(editor.save());
        editor.type(" World");
        editor.display();

        System.out.println("\n=== 保存済み状態にマーク ===");
        editor.markAsSaved();
        editor.display();

        System.out.println("\n=== 「!!!」と入力 ===");
        history.save(editor.save());
        editor.type("!!!");
        editor.display();

        System.out.println("\n=== 読み取り専用モードに変更 ===");
        editor.lockForReading();
        editor.display();
        editor.type("追加できない"); // 読み取り専用なので拒否される

        System.out.println("\n=== Undo（1回目）===");
        if (history.canUndo()) {
            var prev = history.undo();
            if (prev != null) {
                editor.restore(prev);
            }
        }
        editor.display();

        System.out.println("\n=== Undo（2回目）===");
        if (history.canUndo()) {
            var prev = history.undo();
            if (prev != null) {
                editor.restore(prev);
            }
        }
        editor.display();
    }
}
