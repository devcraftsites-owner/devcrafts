import java.util.ArrayDeque;
import java.util.Deque;

public class MementoPatternSample {

    // Java 17: record で Memento を不変オブジェクトとして定義
    // record は自動的に equals/hashCode/toString が生成され、フィールドはすべて final
    record EditorMemento(String content, int cursorPos) {}

    // Originator: 状態を持ち、Memento を作成・復元する
    static class TextEditor {
        private String content = "";
        private int cursorPos = 0;

        void type(String text) {
            content = content.substring(0, cursorPos) + text + content.substring(cursorPos);
            cursorPos += text.length();
        }

        void delete(int count) {
            int start = Math.max(0, cursorPos - count);
            content = content.substring(0, start) + content.substring(cursorPos);
            cursorPos = start;
        }

        // 現在の状態をスナップショットとして保存（record で簡潔に）
        EditorMemento save() {
            return new EditorMemento(content, cursorPos);
        }

        // スナップショットから状態を復元
        void restore(EditorMemento memento) {
            // Java 17: record のアクセサメソッドはフィールド名と同名
            this.content = memento.content();
            this.cursorPos = memento.cursorPos();
        }

        void display() {
            System.out.println("  内容: \"" + content + "\" (カーソル位置: " + cursorPos + ")");
        }
    }

    // Caretaker: Memento を管理するが、内容には触れない
    static class EditorHistory {
        private final Deque<EditorMemento> undoStack = new ArrayDeque<>();
        private final Deque<EditorMemento> redoStack = new ArrayDeque<>();

        void save(EditorMemento memento) {
            undoStack.push(memento);
            redoStack.clear(); // 新しい操作をしたら Redo 履歴をクリア
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

        System.out.println("=== 初期状態（Java 17）===");
        editor.display();

        System.out.println("\n=== 「Hello」と入力 ===");
        history.save(editor.save());
        editor.type("Hello");
        editor.display();

        System.out.println("\n=== 「 World」と入力 ===");
        history.save(editor.save());
        editor.type(" World");
        editor.display();

        System.out.println("\n=== 「!!!」と入力 ===");
        history.save(editor.save());
        editor.type("!!!");
        editor.display();

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

        // Java 17: record の equals() で Memento の内容比較が容易
        var snap1 = new EditorMemento("Hello", 5);
        var snap2 = new EditorMemento("Hello", 5);
        System.out.println("\n同じ内容の Memento は equals() で等しい: " + snap1.equals(snap2));
    }
}
