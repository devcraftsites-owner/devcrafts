import java.util.ArrayDeque;
import java.util.Deque;

public class MementoPatternSample {

    // Memento: 状態のスナップショット（外部からは内部を見せない）
    static class EditorMemento {
        private final String content;  // 保存するテキスト内容
        private final int cursorPos;   // カーソル位置

        // Originator だけが作成・内容アクセス可能
        EditorMemento(String content, int cursorPos) {
            this.content = content;
            this.cursorPos = cursorPos;
        }

        // Originator のみが呼び出す
        String getContent() {
            return content;
        }

        int getCursorPos() {
            return cursorPos;
        }
    }

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

        // 現在の状態をスナップショットとして保存
        EditorMemento save() {
            return new EditorMemento(content, cursorPos);
        }

        // スナップショットから状態を復元
        void restore(EditorMemento memento) {
            this.content = memento.getContent();
            this.cursorPos = memento.getCursorPos();
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
            EditorMemento memento = undoStack.pop();
            redoStack.push(memento);
            // スタックにまだ履歴があれば1つ前の状態を返す。なければ初期状態
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
        TextEditor editor = new TextEditor();
        EditorHistory history = new EditorHistory();

        System.out.println("=== 初期状態 ===");
        editor.display();

        System.out.println("\n=== 「Hello」と入力 ===");
        history.save(editor.save()); // 現在の状態を保存
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
            EditorMemento prev = history.undo();
            if (prev != null) {
                editor.restore(prev);
            }
        }
        editor.display();

        System.out.println("\n=== Undo（2回目）===");
        if (history.canUndo()) {
            EditorMemento prev = history.undo();
            if (prev != null) {
                editor.restore(prev);
            }
        }
        editor.display();
    }
}
