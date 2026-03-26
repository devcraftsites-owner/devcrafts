import java.util.ArrayList;
import java.util.List;

public class VisitorPatternSample {

    // Visitor インターフェース: 各要素を訪問するメソッドを定義する
    interface FileSystemVisitor {
        void visitFile(FileNode file);
        void visitDirectory(DirectoryNode directory);
    }

    // sealed interface で要素の種類を型安全に限定する（Java 17+）
    sealed interface FileSystemNode permits FileNode, DirectoryNode {
        String getName();
        void accept(FileSystemVisitor visitor);
    }

    // 具体要素: ファイルを record で定義（Java 17+）
    record FileNode(String name, long sizeBytes) implements FileSystemNode {
        @Override
        public String getName() {
            return name;
        }

        @Override
        public void accept(FileSystemVisitor visitor) {
            // ファイルへの訪問を Visitor に委譲する
            visitor.visitFile(this);
        }
    }

    // 具体要素: ディレクトリを表すクラス（可変なので record は使わない）
    static final class DirectoryNode implements FileSystemNode {
        private final String name;
        private final List<FileSystemNode> children = new ArrayList<>();

        DirectoryNode(String name) {
            this.name = name;
        }

        @Override
        public String getName() {
            return name;
        }

        void add(FileSystemNode node) {
            children.add(node);
        }

        List<FileSystemNode> getChildren() {
            return children;
        }

        @Override
        public void accept(FileSystemVisitor visitor) {
            // ディレクトリ自身への訪問
            visitor.visitDirectory(this);
            // 子要素も再帰的に訪問する
            for (var child : children) {
                child.accept(visitor);
            }
        }
    }

    // 具体 Visitor 1: ファイル一覧を表示する
    static class ListVisitor implements FileSystemVisitor {
        private int depth = 0;

        @Override
        public void visitFile(FileNode file) {
            // Java 11+ の repeat() でインデントを生成する
            var indent = "  ".repeat(depth);
            System.out.println(indent + "[FILE] " + file.name()
                    + " (" + file.sizeBytes() + " bytes)");
        }

        @Override
        public void visitDirectory(DirectoryNode directory) {
            var indent = "  ".repeat(depth);
            System.out.println(indent + "[DIR]  " + directory.getName() + "/");
            // 子要素の表示のためにインデントを深くする
            depth++;
        }
    }

    // 具体 Visitor 2: ファイルの合計サイズを計算する
    static class SizeCalculatorVisitor implements FileSystemVisitor {
        private long totalSize = 0;

        @Override
        public void visitFile(FileNode file) {
            // record のアクセサメソッドでサイズを取得する
            totalSize += file.sizeBytes();
        }

        @Override
        public void visitDirectory(DirectoryNode directory) {
            // ディレクトリ自体はサイズを持たない
        }

        long getTotalSize() {
            return totalSize;
        }
    }

    // 具体 Visitor 3: 指定した拡張子のファイルを数える
    static class FileCountVisitor implements FileSystemVisitor {
        private final String extension;
        private int count = 0;

        FileCountVisitor(String extension) {
            this.extension = extension.toLowerCase();
        }

        @Override
        public void visitFile(FileNode file) {
            if (file.name().toLowerCase().endsWith(extension)) {
                count++;
            }
        }

        @Override
        public void visitDirectory(DirectoryNode directory) {
            // ディレクトリ自体はカウントしない
        }

        int getCount() {
            return count;
        }
    }

    public static void main(String[] args) {
        // ファイルシステム構造を構築する
        var root = new DirectoryNode("project");
        var src = new DirectoryNode("src");
        var docs = new DirectoryNode("docs");
        var test = new DirectoryNode("test");

        src.add(new FileNode("Main.java", 2048));
        src.add(new FileNode("Utils.java", 1024));
        test.add(new FileNode("MainTest.java", 512));
        docs.add(new FileNode("README.md", 256));
        docs.add(new FileNode("design.pdf", 10240));

        root.add(src);
        root.add(test);
        root.add(docs);
        root.add(new FileNode("pom.xml", 384));

        // Visitor 1: ファイル一覧を表示する
        System.out.println("=== ファイル一覧（Java 17）===");
        root.accept(new ListVisitor());

        // Visitor 2: 合計サイズを計算する
        System.out.println("\n=== 合計サイズ ===");
        var sizeCalc = new SizeCalculatorVisitor();
        root.accept(sizeCalc);
        System.out.println("合計: " + sizeCalc.getTotalSize() + " bytes");

        // Visitor 3: .java ファイルの数を数える
        System.out.println("\n=== .java ファイル数 ===");
        var javaCount = new FileCountVisitor(".java");
        root.accept(javaCount);
        System.out.println(".java ファイル数: " + javaCount.getCount());

        // sealed interface により、instanceof での型チェックが簡潔になる（Java 17+）
        System.out.println("\n=== instanceof パターンマッチング ===");
        FileSystemNode node = new FileNode("Sample.java", 1024);
        if (node instanceof FileNode f) {
            System.out.println("ファイル: " + f.name() + ", サイズ: " + f.sizeBytes() + " bytes");
        }
    }
}
