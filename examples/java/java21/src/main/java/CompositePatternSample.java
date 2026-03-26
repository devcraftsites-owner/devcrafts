import java.util.ArrayList;
import java.util.List;

public class CompositePatternSample {

    // Java 21: sealed interface でファイルシステムノードの種類を型安全に表現する
    // FsNode は File か Directory のどちらかしか実装できない
    sealed interface FsNode permits FsNode.File, FsNode.Directory {

        // ファイル（葉ノード）: name と size を持つ record
        record File(String name, long size) implements FsNode {}

        // ディレクトリ（複合ノード）: name と子ノードのリストを持つ record
        record Directory(String name, List<FsNode> children) implements FsNode {
            // 子ノードを追加した新しい Directory を返すファクトリメソッド
            public Directory withChild(FsNode child) {
                List<FsNode> newChildren = new ArrayList<>(children);
                newChildren.add(child);
                return new Directory(name, newChildren);
            }
        }
    }

    // サイズを再帰的に計算する（switch パターンマッチング）
    static long getSize(FsNode node) {
        return switch (node) {
            // File record の deconstruction: name と size フィールドを直接取り出す（Java 21+）
            case FsNode.File(var name, var size) -> size;
            // Directory record の deconstruction: children フィールドを取り出して再帰処理
            case FsNode.Directory(var name, var children) -> {
                long total = 0;
                for (var child : children) {
                    total += getSize(child);
                }
                yield total;
            }
        };
    }

    // ツリーを再帰的に表示する（switch パターンマッチング）
    static void printTree(FsNode node, String indent) {
        switch (node) {
            case FsNode.File(var name, var size) ->
                System.out.println(indent + "- " + name + " (" + size + " bytes)");
            case FsNode.Directory(var name, var children) -> {
                System.out.println(indent + "+ " + name + "/ (" + getSize(node) + " bytes)");
                for (var child : children) {
                    printTree(child, indent + "  ");
                }
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Composite パターン: ファイルシステム（Java 21）===");

        // ツリー構造を組み立てる
        // record は不変なので、withChild で新しいオブジェクトを生成する
        var testDir = new FsNode.Directory("test", new ArrayList<>())
                .withChild(new FsNode.File("MainTest.java", 768))
                .withChild(new FsNode.File("UtilsTest.java", 512));

        var srcDir = new FsNode.Directory("src", new ArrayList<>())
                .withChild(new FsNode.File("Main.java", 2048))
                .withChild(new FsNode.File("Utils.java", 1024))
                .withChild(testDir);

        var libDir = new FsNode.Directory("lib", new ArrayList<>())
                .withChild(new FsNode.File("commons.jar", 4096));

        var root = new FsNode.Directory("root", new ArrayList<>())
                .withChild(new FsNode.File("README.txt", 512))
                .withChild(new FsNode.File("config.properties", 256))
                .withChild(srcDir)
                .withChild(libDir);

        System.out.println("--- ツリー構造 ---");
        printTree(root, "");

        System.out.println("\n--- サイズ確認 ---");
        System.out.println("root 全体: " + getSize(root) + " bytes");
        System.out.println("src ディレクトリ: " + getSize(srcDir) + " bytes");
        System.out.println("test ディレクトリ: " + getSize(testDir) + " bytes");

        System.out.println("\n--- sealed interface + switch パターンマッチング ---");
        // ファイルもディレクトリも FsNode として同じように扱える
        List<FsNode> nodes = List.of(
                new FsNode.File("single.txt", 128),
                srcDir
        );
        for (var node : nodes) {
            // switch でノードの種類に応じた処理を型安全に書ける
            String type = switch (node) {
                case FsNode.File f -> "FILE";
                case FsNode.Directory d -> "DIR ";
            };
            System.out.println("[" + type + "] " + node.toString().substring(0, Math.min(50, node.toString().length())));
        }
    }
}
