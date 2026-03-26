import java.util.ArrayList;
import java.util.List;

public class CompositePatternSample {

    // ファイルシステムのノードを表す抽象クラス（Component）
    // ファイルもディレクトリも同じ型として扱えるようにする
    static abstract class FileSystemNode {
        protected final String name;

        public FileSystemNode(String name) {
            this.name = name;
        }

        // ノード名を返す
        public String getName() {
            return name;
        }

        // サイズを返す（ファイルは実サイズ、ディレクトリは子の合計）
        public abstract long getSize();

        // ツリー構造を表示する（indent はインデントの文字列）
        public abstract void print(String indent);
    }

    // ファイルを表すクラス（Leaf: 葉ノード）
    // 子を持たない末端のノード
    static class FileNode extends FileSystemNode {
        private final long size; // バイト単位のファイルサイズ

        public FileNode(String name, long size) {
            super(name);
            this.size = size;
        }

        @Override
        public long getSize() {
            return size;
        }

        @Override
        public void print(String indent) {
            System.out.println(indent + "- " + name + " (" + size + " bytes)");
        }
    }

    // ディレクトリを表すクラス（Composite: 複合ノード）
    // 子ノードを持つことができる
    static class DirectoryNode extends FileSystemNode {
        private final List<FileSystemNode> children = new ArrayList<FileSystemNode>();

        public DirectoryNode(String name) {
            super(name);
        }

        // 子ノードを追加する
        public void add(FileSystemNode node) {
            children.add(node);
        }

        // サイズは子ノードのサイズ合計を返す（再帰的に計算）
        @Override
        public long getSize() {
            long total = 0;
            for (FileSystemNode child : children) {
                total += child.getSize();
            }
            return total;
        }

        @Override
        public void print(String indent) {
            System.out.println(indent + "+ " + name + "/ (" + getSize() + " bytes)");
            for (FileSystemNode child : children) {
                // インデントを深くして再帰的に表示する
                child.print(indent + "  ");
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Composite パターン: ファイルシステム ===");

        // ルートディレクトリを作成する
        DirectoryNode root = new DirectoryNode("root");

        // ルート直下のファイル
        root.add(new FileNode("README.txt", 512));
        root.add(new FileNode("config.properties", 256));

        // src ディレクトリ（サブディレクトリ）
        DirectoryNode src = new DirectoryNode("src");
        src.add(new FileNode("Main.java", 2048));
        src.add(new FileNode("Utils.java", 1024));

        // src/test サブディレクトリ
        DirectoryNode test = new DirectoryNode("test");
        test.add(new FileNode("MainTest.java", 768));
        test.add(new FileNode("UtilsTest.java", 512));
        src.add(test);

        root.add(src);

        // lib ディレクトリ
        DirectoryNode lib = new DirectoryNode("lib");
        lib.add(new FileNode("commons.jar", 4096));
        root.add(lib);

        System.out.println("--- ツリー構造 ---");
        root.print("");

        System.out.println("\n--- サイズ確認 ---");
        System.out.println("root 全体: " + root.getSize() + " bytes");
        System.out.println("src ディレクトリ: " + src.getSize() + " bytes");
        System.out.println("test ディレクトリ: " + test.getSize() + " bytes");
        System.out.println("lib ディレクトリ: " + lib.getSize() + " bytes");

        System.out.println("\n--- ポリモーフィズム（同じインターフェースで扱う例）---");
        // ファイルもディレクトリも FileSystemNode として同じように扱える
        List<FileSystemNode> nodes = new ArrayList<FileSystemNode>();
        nodes.add(new FileNode("single.txt", 128));
        nodes.add(src);
        for (FileSystemNode node : nodes) {
            System.out.println(node.getName() + " -> " + node.getSize() + " bytes");
        }
    }
}
