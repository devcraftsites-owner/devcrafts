import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.List;

public class NioFileSample {

    public static void main(String[] args) throws IOException {

        // ① ファイルに書き込む（Java 11+ Files.writeString で簡潔に書ける）
        var file = Path.of("sample_nio.txt");  // Java 11+ Path.of()
        var content = "1行目：java.nio.file サンプル\n2行目：Java 11 以降の新 API\n3行目：var でスッキリ";
        Files.writeString(file, content);      // Java 11+: 文字コード省略可（デフォルト UTF-8）
        System.out.println("書き込み完了: " + file.toAbsolutePath());

        // ② ファイルを読み込む（Java 11+ Files.readString で一括取得）
        var text = Files.readString(file);     // Java 11+: String として受け取り
        System.out.println("読み込み:\n" + text);

        // ③ 行リストで読み込む（Java 8 と同じく使用可能）
        List<String> lines = Files.readAllLines(file);
        System.out.println("行数: " + lines.size());

        // ④ ディレクトリを再帰的に作成
        var dir = Path.of("work_nio/sub");
        Files.createDirectories(dir);
        System.out.println("ディレクトリ作成: " + dir.toAbsolutePath());

        // ⑤ ファイルをコピー（上書き許可）
        var copy = dir.resolve("sample_copy.txt");
        Files.copy(file, copy, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("コピー完了: " + copy);

        // ⑥ ファイルを移動（リネームにも使える）
        var moved = dir.resolve("sample_moved.txt");
        Files.move(copy, moved, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("移動完了: " + moved);

        // ⑦ ファイル属性の確認
        System.out.println("存在確認: " + Files.exists(moved));
        System.out.println("ファイルサイズ: " + Files.size(moved) + " bytes");
        var attrs = Files.readAttributes(moved, BasicFileAttributes.class);
        System.out.println("最終更新時刻: " + attrs.lastModifiedTime());

        // ⑧ ディレクトリ内のエントリを列挙（Java 8+ Files.list で Stream として扱う）
        System.out.println("--- ディレクトリ内容 ---");
        try (var stream = Files.list(dir)) {  // Java 8+: Stream<Path>、try-with-resources 必須
            stream.forEach(p -> System.out.println("  " + p.getFileName()));
        }

        // ⑨ 後片付け（削除）
        Files.delete(moved);
        Files.delete(dir);
        Files.delete(Path.of("work_nio"));
        Files.delete(file);
        System.out.println("削除完了");
    }
}
