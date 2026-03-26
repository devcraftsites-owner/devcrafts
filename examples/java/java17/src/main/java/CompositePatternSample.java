import java.util.ArrayList;
import java.util.List;

public class CompositePatternSample {

    // ファイルシステムのノードを表す抽象クラス（Component）
    static abstract class FileSystemNode {
        protected final String name;

        public FileSystemNode(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public abstract long getSize();

        public abstract void print(String indent);
    }

    // Java 17: record でファイルの情報を保持する（不変データ構造）
    record FileInfo(String name, long size) {}

    // ファイルを表すクラス（Leaf: 葉ノード）
    static class FileNode extends FileSystemNode {
        private final FileInfo fileInfo; // record でファイル情報を保持する（Java 17+）

        public FileNode(String name, long size) {
            super(name);
            this.fileInfo = new FileInfo(name, size);
        }

        @Override
        public long getSize() {
            return fileInfo.size();
        }

        @Override
        public void print(String indent) {
            System.out.println(indent + "- " + fileInfo.name() + " (" + fileInfo.size() + " bytes)");
        }
    }

    // ディレクトリを表すクラス（Composite: 複合ノード）
    static class DirectoryNode extends FileSystemNode {
        private final List<FileSystemNode> children = new ArrayList<>();

        public DirectoryNode(String name) {
            super(name);
        }

        public void add(FileSystemNode node) {
            children.add(node);
        }

        @Override
        public long getSize() {
            long total = 0;
            for (var child : children) {
                total += child.getSize();
            }
            return total;
        }

        @Override
        public void print(String indent) {
            System.out.println(indent + "+ " + name + "/ (" + getSize() + " bytes)");
            for (var child : children) {
                child.print(indent + "  ");
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Composite パターン: ファイルシステム（Java 17）===");

        // var でローカル変数の型推論を使う（Java 17+）
        var root = new DirectoryNode("root");

        root.add(new FileNode("README.txt", 512));
        root.add(new FileNode("config.properties", 256));

        var src = new DirectoryNode("src");
        src.add(new FileNode("Main.java", 2048));
        src.add(new FileNode("Utils.java", 1024));

        var test = new DirectoryNode("test");
        test.add(new FileNode("MainTest.java", 768));
        test.add(new FileNode("UtilsTest.java", 512));
        src.add(test);

        root.add(src);

        var lib = new DirectoryNode("lib");
        lib.add(new FileNode("commons.jar", 4096));
        root.add(lib);

        System.out.println("--- ツリー構造 ---");
        root.print("");

        System.out.println("\n--- サイズ確認 ---");
        System.out.println("root 全体: " + root.getSize() + " bytes");
        System.out.println("src ディレクトリ: " + src.getSize() + " bytes");
        System.out.println("test ディレクトリ: " + test.getSize() + " bytes");

        System.out.println("\n--- FileInfo record の確認 ---");
        // record は equals / hashCode / toString が自動生成される
        var info1 = new FileInfo("Main.java", 2048);
        var info2 = new FileInfo("Main.java", 2048);
        System.out.println("info1: " + info1);
        System.out.println("info1.equals(info2): " + info1.equals(info2)); // true
    }
}
