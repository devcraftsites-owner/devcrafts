import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.*;

public class ZipGzipSample {

    // ZIP エントリを表す record
    record ZipEntryData(String name, String content) {}

    // 圧縮フォーマットを表す sealed interface（Java 17+）
    sealed interface CompressionFormat {
        record Zip(int level) implements CompressionFormat {}
        record Gzip(int level) implements CompressionFormat {}
    }

    // フォーマットに応じてバイト列を圧縮（パターンマッチング switch - Java 21+）
    public static byte[] compress(byte[] data, CompressionFormat format) throws IOException {
        var baos = new ByteArrayOutputStream();
        switch (format) {
            case CompressionFormat.Zip z -> {
                try (var zos = new ZipOutputStream(baos)) {
                    zos.setLevel(z.level());
                    zos.putNextEntry(new ZipEntry("data"));
                    zos.write(data);
                    zos.closeEntry();
                }
            }
            case CompressionFormat.Gzip g -> {
                try (var gos = new GZIPOutputStream(baos) {
                    { def.setLevel(g.level()); } // 初期化ブロックで圧縮レベルを設定
                }) {
                    gos.write(data);
                }
            }
        }
        return baos.toByteArray();
    }

    // 複数エントリを ZIP に圧縮
    public static byte[] createZip(List<ZipEntryData> entries) throws IOException {
        var baos = new ByteArrayOutputStream();
        try (var zos = new ZipOutputStream(baos)) {
            for (var entry : entries) {
                zos.putNextEntry(new ZipEntry(entry.name()));
                zos.write(entry.content().getBytes(StandardCharsets.UTF_8));
                zos.closeEntry();
            }
        }
        return baos.toByteArray();
    }

    // ZIP を展開して List<ZipEntryData> として返す
    public static List<ZipEntryData> readZip(byte[] zipData) throws IOException {
        var result = new ArrayList<ZipEntryData>();
        try (var zis = new ZipInputStream(new ByteArrayInputStream(zipData))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                var content = new ByteArrayOutputStream();
                var buffer = new byte[1024];
                int len;
                while ((len = zis.read(buffer)) != -1) {
                    content.write(buffer, 0, len);
                }
                result.add(new ZipEntryData(entry.getName(), content.toString("UTF-8")));
                zis.closeEntry();
            }
        }
        return result;
    }

    // GZIP 解凍
    public static String gzipDecompress(byte[] compressed) throws IOException {
        var bais = new ByteArrayInputStream(compressed);
        var baos = new ByteArrayOutputStream();
        try (var gis = new GZIPInputStream(bais)) {
            var buffer = new byte[1024];
            int len;
            while ((len = gis.read(buffer)) != -1) {
                baos.write(buffer, 0, len);
            }
        }
        return baos.toString("UTF-8");
    }

    public static void main(String[] args) throws Exception {
        // ZIP デモ
        System.out.println("=== ZIP 圧縮・解凍 ===");
        var entries = List.of(
                new ZipEntryData("hello.txt", "Hello, World!\n日本語テスト"),
                new ZipEntryData("data.csv", "id,name\n1,田中\n2,鈴木")
        );
        var zip = createZip(entries);
        System.out.println("ZIP サイズ: " + zip.length + " bytes");
        readZip(zip).forEach(e -> System.out.println("ファイル: " + e.name() + " / 内容: " + e.content()));

        // GZIP 圧縮レベル比較（Deflater.BEST_SPEED=1, BEST_COMPRESSION=9）
        System.out.println("\n=== GZIP 圧縮レベル比較 ===");
        var text = "GZIP 圧縮テスト。同じ文字列が繰り返されると圧縮率が高くなります。".repeat(10);
        var data = text.getBytes(StandardCharsets.UTF_8);

        for (var format : new CompressionFormat[]{new CompressionFormat.Gzip(1), new CompressionFormat.Gzip(9)}) {
            var compressed = compress(data, format);
            var label = switch (format) {
                case CompressionFormat.Zip z -> "ZIP  (level=" + z.level() + ")";
                case CompressionFormat.Gzip g -> "GZIP (level=" + g.level() + ")";
            };
            System.out.printf("%s: %d bytes → %d bytes (%.1f%%圧縮)%n",
                    label, data.length, compressed.length,
                    (1.0 - (double) compressed.length / data.length) * 100);
        }

        // 往復確認
        var gzipData = compress(data, new CompressionFormat.Gzip(6));
        System.out.println("GZIP 解凍後一致: " + text.equals(gzipDecompress(gzipData)));
    }
}
