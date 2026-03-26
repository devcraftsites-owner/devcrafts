import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Arrays;
import java.util.List;

public class NioFileSample {

    public static void main(String[] args) throws IOException {

        // ① ファイルに書き込む（List<String> を UTF-8 で書き込み）
        Path file = Paths.get("sample_nio.txt");
        List<String> lines = Arrays.asList("1行目：java.nio.file サンプル", "2行目：NIO.2 API", "3行目：try-with-resources");
        Files.write(file, lines, StandardCharsets.UTF_8);
        System.out.println("書き込み完了: " + file.toAbsolutePath());

        // ② ファイルを読み込む（全行をリストで取得）
        List<String> readLines = Files.readAllLines(file, StandardCharsets.UTF_8);
        for (String line : readLines) {
            System.out.println("読み込み: " + line);
        }

        // ③ バイト配列で読み込む（バイナリファイルにも使える）
        byte[] bytes = Files.readAllBytes(file);
        System.out.println("バイト数: " + bytes.length);

        // ④ ディレクトリを再帰的に作成
        Path dir = Paths.get("work_nio/sub");
        Files.createDirectories(dir);
        System.out.println("ディレクトリ作成: " + dir.toAbsolutePath());

        // ⑤ ファイルをコピー（上書き許可）
        Path copy = dir.resolve("sample_copy.txt");
        Files.copy(file, copy, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("コピー完了: " + copy);

        // ⑥ ファイルを移動（リネームにも使える）
        Path moved = dir.resolve("sample_moved.txt");
        Files.move(copy, moved, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("移動完了: " + moved);

        // ⑦ ファイルの存在確認・属性取得
        System.out.println("存在確認: " + Files.exists(moved));
        System.out.println("ファイルサイズ: " + Files.size(moved) + " bytes");
        BasicFileAttributes attrs = Files.readAttributes(moved, BasicFileAttributes.class);
        System.out.println("最終更新時刻: " + attrs.lastModifiedTime());

        // ⑧ ディレクトリ内のエントリを列挙（DirectoryStream で try-with-resources）
        System.out.println("--- ディレクトリ内容 ---");
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(dir)) {
            for (Path entry : stream) {
                System.out.println("  " + entry.getFileName());
            }
        }

        // ⑨ 後片付け（削除）
        Files.delete(moved);
        Files.delete(dir);
        Files.delete(Paths.get("work_nio"));
        Files.delete(file);
        System.out.println("削除完了");
    }
}
