import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.List;

public class NioFileSample {

    public static void main(String[] args) throws IOException {

        // ① ファイルに書き込む（Java 11+ Files.writeString）
        var file = Path.of("sample_nio.txt");
        var content = "1行目：java.nio.file サンプル\n2行目：Java 21 の NIO.2 API\n3行目：シンプルで読みやすい";
        Files.writeString(file, content);
        System.out.println("書き込み完了: " + file.toAbsolutePath());

        // ② ファイルを読み込む
        var text = Files.readString(file);
        System.out.println("読み込み:\n" + text);

        // ③ ディレクトリを再帰的に作成
        var dir = Path.of("work_nio/sub");
        Files.createDirectories(dir);

        // ④ ファイルをコピー・移動
        var copy = dir.resolve("sample_copy.txt");
        Files.copy(file, copy, StandardCopyOption.REPLACE_EXISTING);
        var moved = dir.resolve("sample_moved.txt");
        Files.move(copy, moved, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("コピー・移動完了");

        // ⑤ ファイル内容を比較（Java 12+ Files.mismatch）
        //    2つのファイルが一致する場合は -1、違う場合は最初に異なるバイト位置を返す
        var file2 = Path.of("sample_nio2.txt");
        Files.writeString(file2, content);
        long mismatch = Files.mismatch(file, file2);  // Java 12+
        System.out.println("ファイル比較（-1 = 一致）: " + mismatch);

        // ⑥ ディレクトリを再帰的に検索（Java 8+ Files.find）
        //    指定した条件に合うファイルだけを取得できる
        System.out.println("--- .txt ファイル検索 ---");
        try (var stream = Files.find(Path.of("."), 2,
                (p, a) -> p.toString().endsWith(".txt") && !a.isDirectory())) {
            stream.forEach(p -> System.out.println("  " + p));
        }

        // ⑦ ディレクトリ内容を列挙
        System.out.println("--- ディレクトリ内容 ---");
        try (var stream = Files.list(dir)) {
            stream.forEach(p -> System.out.println("  " + p.getFileName()));
        }

        // ⑧ ファイル属性
        var attrs = Files.readAttributes(moved, BasicFileAttributes.class);
        System.out.println("最終更新時刻: " + attrs.lastModifiedTime());

        // ⑨ 後片付け
        Files.delete(moved);
        Files.delete(dir);
        Files.delete(Path.of("work_nio"));
        Files.delete(file);
        Files.delete(file2);
        System.out.println("削除完了");
    }
}
