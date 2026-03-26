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

    // 具体要素: ファイルを record で定義
    record FileNode(String name, long sizeBytes) implements FileSystemNode {
        @Override
        public String getName() {
            return name;
        }

        @Override
        public void accept(FileSystemVisitor visitor) {
            visitor.visitFile(this);
        }
    }

    // 具体要素: ディレクトリを表すクラス
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
            visitor.visitDirectory(this);
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
            var indent = "  ".repeat(depth);
            System.out.println(indent + "[FILE] " + file.name()
                    + " (" + file.sizeBytes() + " bytes)");
        }

        @Override
        public void visitDirectory(DirectoryNode directory) {
            var indent = "  ".repeat(depth);
            System.out.println(indent + "[DIR]  " + directory.getName() + "/");
            depth++;
        }
    }

    // 具体 Visitor 2: ファイルの合計サイズを計算する
    static class SizeCalculatorVisitor implements FileSystemVisitor {
        private long totalSize = 0;

        @Override
        public void visitFile(FileNode file) {
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

    // switch パターンマッチングで Visitor を使わずに型ごとの処理を記述する（Java 21+）
    // ※ Visitor の代替として、小規模なケースでは switch が簡潔な場合もある
    static String describeNode(FileSystemNode node) {
        return switch (node) {
            case FileNode f -> "ファイル: " + f.name() + " (" + f.sizeBytes() + " bytes)";
            case DirectoryNode d -> "ディレクトリ: " + d.getName()
                    + " (" + d.getChildren().size() + " 件の子要素)";
        };
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
        System.out.println("=== ファイル一覧（Java 21）===");
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

        // Java 21: switch パターンマッチングで型ごとの処理を簡潔に書く
        System.out.println("\n=== switch パターンマッチング（Java 21+）===");
        List<FileSystemNode> nodes = List.of(
            new FileNode("Sample.java", 1024),
            new DirectoryNode("lib"),
            new FileNode("config.yml", 128)
        );
        for (var node : nodes) {
            System.out.println(describeNode(node));
        }
    }
}
